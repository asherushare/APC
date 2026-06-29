import { prisma } from '../config/db';
import { hashRefreshToken, verifyPassword, hashPassword } from '../utils/auth';

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

function extractRefreshToken(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/refreshToken=([^;]+)/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

async function runTests(): Promise<void> {
  console.log('🏁 Starting Authentication Integration Tests...');

  // Ensure default admin user is seeded
  console.log('🌱 Seeding database...');
  const adminEmail = 'admin@adivasiproducer.com';
  const userCount = await prisma.user.count({ where: { email: adminEmail } });
  if (userCount === 0) {
    console.error('❌ Database not seeded. Please run npm run prisma:seed first.');
    process.exit(1);
  }

  // Clear existing refresh tokens to start fresh
  await prisma.refreshToken.deleteMany({});
  await prisma.auditLog.deleteMany({});

  let accessToken = '';
  let refreshToken = '';

  // 1. Success Login
  console.log('\n--- 1. Testing Login (Legacy Bcrypt Admin Seed) ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'AdminPassword123!' }),
  });

  if (loginRes.status !== 200) {
    console.error(`❌ Login failed. Expected 200, got ${loginRes.status}`);
    const errText = await loginRes.text();
    console.error(errText);
    process.exit(1);
  }

  const loginData = (await loginRes.json()) as { success: boolean; accessToken: string };
  accessToken = loginData.accessToken;
  console.log('✅ Login succeeded, Access Token received.');

  const setCookie = loginRes.headers.getSetCookie();
  const token = extractRefreshToken(setCookie);
  if (!token) {
    console.error('❌ Refresh Token cookie not set in response headers.');
    process.exit(1);
  }
  refreshToken = token;
  console.log('✅ Refresh Token cookie successfully retrieved.');

  // Verify that the password was progressively upgraded to Argon2id
  const updatedUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (updatedUser && updatedUser.passwordHash.startsWith('$argon2id$')) {
    console.log('✅ Progressive Migration: Password hash upgraded to Argon2id.');
  } else {
    console.error('❌ Progressive Migration: Password hash is still Bcrypt.');
    process.exit(1);
  }

  // 2. Access Gated Route (/me) with Access Token
  console.log('\n--- 2. Testing Gated Route (/me) with Valid Token ---');
  const meRes = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (meRes.status !== 200) {
    console.error(`❌ Gated route access failed. Expected 200, got ${meRes.status}`);
    process.exit(1);
  }
  const meData = (await meRes.json()) as { success: boolean; user: { email: string } };
  console.log(`✅ Gated route accessed. User email: ${meData.user.email}`);

  // 3. Access Gated Route without/with invalid token
  console.log('\n--- 3. Testing Gated Route without/invalid Token ---');
  const noTokenRes = await fetch(`${BASE_URL}/auth/me`);
  console.log(`Unauthenticated status: ${noTokenRes.status} (Expected: 401)`);
  if (noTokenRes.status !== 401) process.exit(1);

  const invalidTokenRes = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer invalid_token' },
  });
  console.log(`Invalid token status: ${invalidTokenRes.status} (Expected: 401)`);
  if (invalidTokenRes.status !== 401) process.exit(1);
  console.log('✅ Gated route blocks invalid access.');

  // 4. Token Refresh Rotation
  console.log('\n--- 4. Testing Refresh Token Rotation (RTR) ---');
  // Wait a moment to ensure timestamps differ if needed
  await new Promise((resolve) => setTimeout(resolve, 100));

  const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken}` },
  });

  if (refreshRes.status !== 200) {
    console.error(`❌ Token refresh failed. Expected 200, got ${refreshRes.status}`);
    process.exit(1);
  }

  const refreshData = (await refreshRes.json()) as { success: boolean; accessToken: string };
  const newAccessToken = refreshData.accessToken;
  const newSetCookie = refreshRes.headers.getSetCookie();
  const newRefreshToken = extractRefreshToken(newSetCookie);

  if (!newRefreshToken || newRefreshToken === refreshToken) {
    console.error('❌ Refresh Token was not rotated.');
    process.exit(1);
  }
  console.log('✅ Access token rotated.');
  console.log('✅ Refresh token rotated.');

  // Verify that the new access token can access the gated route
  const newMeRes = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${newAccessToken}` },
  });

  if (newMeRes.status !== 200) {
    console.error(`❌ Gated route access with rotated access token failed. Expected 200, got ${newMeRes.status}`);
    process.exit(1);
  }
  console.log('✅ Gated route accessed with rotated access token.');

  // Check audit log for token refresh
  const refreshAudit = await prisma.auditLog.findFirst({
    where: { action: 'TOKEN_REFRESH' },
  });
  if (refreshAudit) {
    console.log('✅ Audit log recorded: TOKEN_REFRESH');
  } else {
    console.error('❌ Audit log for TOKEN_REFRESH is missing.');
    process.exit(1);
  }

  // 5. Token Reuse Detection (Reusing the old refresh token)
  console.log('\n--- 5. Testing Refresh Token Reuse Detection ---');
  const reuseRes = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${refreshToken}` }, // Old refresh token
  });

  console.log(`Reused token status: ${reuseRes.status} (Expected: 401)`);
  if (reuseRes.status !== 401) {
    console.error('❌ Token reuse was not blocked.');
    process.exit(1);
  }

  const reuseData = (await reuseRes.json()) as { error: { code: string } };
  console.log(`Error code: ${reuseData.error.code} (Expected: TOKEN_REUSE_DETECTED)`);
  if (reuseData.error.code !== 'TOKEN_REUSE_DETECTED') {
    console.error('❌ Error code mismatch.');
    process.exit(1);
  }

  // Verify that all active refresh tokens for the user have been revoked
  const activeTokens = await prisma.refreshToken.findMany({
    where: { userId: updatedUser?.id, revoked: false },
  });
  console.log(`Active refresh tokens remaining: ${activeTokens.length} (Expected: 0)`);
  if (activeTokens.length !== 0) {
    console.error('❌ Sessions were not terminated on token reuse detection.');
    process.exit(1);
  }
  console.log('✅ RTR Theft Mitigation succeeded: All user sessions revoked.');

  // Check audit log for token reuse detection
  const reuseAudit = await prisma.auditLog.findFirst({
    where: { action: 'TOKEN_REUSE_DETECTED' },
  });
  if (reuseAudit) {
    console.log('✅ Audit log recorded: TOKEN_REUSE_DETECTED');
  } else {
    console.error('❌ Audit log for TOKEN_REUSE_DETECTED is missing.');
    process.exit(1);
  }

  // 6. Test Logout
  console.log('\n--- 6. Testing Logout ---');
  // First login again to get a valid session
  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail, password: 'AdminPassword123!' }),
  });
  const newLoginSetCookie = newLoginRes.headers.getSetCookie();
  const activeRefreshToken = extractRefreshToken(newLoginSetCookie);

  if (!activeRefreshToken) {
    console.error('❌ Could not obtain new refresh token.');
    process.exit(1);
  }

  const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { Cookie: `refreshToken=${activeRefreshToken}` },
  });

  if (logoutRes.status !== 200) {
    console.error(`❌ Logout failed. Expected 200, got ${logoutRes.status}`);
    process.exit(1);
  }

  const logoutSetCookie = logoutRes.headers.getSetCookie();
  const clearedToken = extractRefreshToken(logoutSetCookie);
  if (clearedToken !== null && clearedToken !== '') {
    console.error('❌ Refresh Token cookie was not cleared.');
    process.exit(1);
  }
  console.log('✅ Logout succeeded, Cookie cleared.');

  // Check database if revoked
  const revokedToken = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashRefreshToken(activeRefreshToken) },
  });
  if (revokedToken && revokedToken.revoked) {
    console.log('✅ Refresh token marked as revoked in database.');
  } else {
    console.error('❌ Refresh token not revoked in database.');
    process.exit(1);
  }

  // Check audit log for logout
  const logoutAudit = await prisma.auditLog.findFirst({
    where: { action: 'LOGOUT' },
  });
  if (logoutAudit) {
    console.log('✅ Audit log recorded: LOGOUT');
  } else {
    console.error('❌ Audit log for LOGOUT is missing.');
    process.exit(1);
  }

  // 7. Test Rate Limiting on Login Route
  console.log('\n--- 7. Testing Rate Limiting on Login ---');
  console.log('Sending multiple failed logins to trigger rate limit...');
  
  // We need to trigger rate limits by email and IP.
  // The limit is 5 attempts per 15 mins. Let's make 6 attempts with a specific email.
  const emailToTest = 'bruteforce@adivasiproducer.com';
  let wasRateLimited = false;

  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailToTest, password: 'WrongPassword' }),
    });
    
    console.log(`Attempt ${i}: Status = ${res.status}`);
    if (res.status === 429) {
      wasRateLimited = true;
      const rateLimitData = await res.json() as { error: { code: string; message: string } };
      console.log(`Rate limit triggered: ${rateLimitData.error.code} - ${rateLimitData.error.message}`);
      break;
    }
  }

  if (wasRateLimited) {
    console.log('✅ Rate limiting successfully blocks brute-force attempts.');
  } else {
    console.error('❌ Rate limiting did not trigger within 6 attempts.');
    process.exit(1);
  }

  // 8. Test Account Lockout (Brute Force Defense)
  console.log('\n--- 8. Testing Account Lockout ---');
  // Clear any existing attempts
  await prisma.user.update({
    where: { email: adminEmail },
    data: { loginAttempts: 0, lockoutUntil: null },
  });

  // Send 4 failed attempts
  for (let i = 1; i <= 4; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-bypass-rate-limit': 'true',
      },
      body: JSON.stringify({ email: adminEmail, password: 'WrongPassword' }),
    });
    if (res.status !== 401) {
      console.error(`Expected 401 on failed attempt, got ${res.status}`);
      process.exit(1);
    }
  }

  // The 5th attempt should lock the account
  const res5 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'true',
    },
    body: JSON.stringify({ email: adminEmail, password: 'WrongPassword' }),
  });
  if (res5.status !== 401) {
    console.error(`Expected 401 on 5th attempt, got ${res5.status}`);
    process.exit(1);
  }

  // Verify locked out status in database
  const lockedUser = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (lockedUser && lockedUser.loginAttempts === 5 && lockedUser.lockoutUntil) {
    console.log('✅ User marked as locked out in database.');
  } else {
    console.error('❌ User was not locked out in database.');
    process.exit(1);
  }

  // The 6th attempt with CORRECT password should fail with 403 Forbidden due to lockout
  const res6 = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-bypass-rate-limit': 'true',
    },
    body: JSON.stringify({ email: adminEmail, password: 'AdminPassword123!' }),
  });
  if (res6.status !== 403) {
    console.error(`Expected 403 on locked attempt, got ${res6.status}`);
    process.exit(1);
  }
  const lockoutData = await res6.json() as { error: { code: string } };
  if (lockoutData.error.code !== 'ACCOUNT_LOCKED') {
    console.error(`Expected error code ACCOUNT_LOCKED, got ${lockoutData.error.code}`);
    process.exit(1);
  }
  console.log('✅ Lockout successfully blocks login attempts.');

  // Check audit log for lockout
  const lockoutAudit = await prisma.auditLog.findFirst({
    where: { action: 'ACCOUNT_LOCKED', userId: lockedUser.id },
  });
  if (lockoutAudit) {
    console.log('✅ Audit log recorded: ACCOUNT_LOCKED');
  } else {
    console.error('❌ Audit log for ACCOUNT_LOCKED is missing.');
    process.exit(1);
  }

  // Reset lockout state
  await prisma.user.update({
    where: { id: lockedUser.id },
    data: { loginAttempts: 0, lockoutUntil: null },
  });

  // 9. Test Forgot Password (Token generation & rate limits)
  console.log('\n--- 9. Testing Forgot Password Flow ---');
  await prisma.passwordResetToken.deleteMany({});

  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail }),
  });

  if (forgotRes.status !== 200) {
    console.error(`Expected 200 on forgot-password, got ${forgotRes.status}`);
    process.exit(1);
  }
  console.log('✅ Forgot password link requested successfully.');

  // Check token record
  const resetTokenRecord = await prisma.passwordResetToken.findFirst({
    where: { userId: lockedUser.id },
  });
  if (resetTokenRecord) {
    console.log('✅ Password reset token successfully saved in database.');
  } else {
    console.error('❌ Reset token not found in database.');
    process.exit(1);
  }

  // Check audit log
  const forgotAudit = await prisma.auditLog.findFirst({
    where: { action: 'PASSWORD_RESET_REQUESTED' },
  });
  if (forgotAudit) {
    console.log('✅ Audit log recorded: PASSWORD_RESET_REQUESTED');
  } else {
    console.error('❌ Audit log for PASSWORD_RESET_REQUESTED is missing.');
    process.exit(1);
  }

  // Check 60s cooldown rate limit
  const cooldownRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: adminEmail }),
  });
  if (cooldownRes.status !== 429) {
    console.error(`Expected 429 on cooldown retry, got ${cooldownRes.status}`);
    process.exit(1);
  }
  const cooldownData = await cooldownRes.json() as { error: { code: string } };
  if (cooldownData.error.code !== 'RESET_COOLDOWN') {
    console.error(`Expected RESET_COOLDOWN, got ${cooldownData.error.code}`);
    process.exit(1);
  }
  console.log('✅ 60s reset email cooldown verified.');

  // 10. Test Reset Password
  console.log('\n--- 10. Testing Reset Password Flow ---');
  const crypto = require('crypto');
  const testCleartextToken = 'test_reset_token_123_cleartext';
  const testTokenHash = crypto.createHash('sha256').update(testCleartextToken).digest('hex');
  
  await prisma.passwordResetToken.create({
    data: {
      tokenHash: testTokenHash,
      userId: lockedUser.id,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    },
  });

  // Attempt reset with weak password
  const weakResetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      token: testCleartextToken,
      password: 'weak',
    }),
  });
  if (weakResetRes.status !== 400) {
    console.error(`Expected 400 for weak password, got ${weakResetRes.status}`);
    process.exit(1);
  }
  const weakData = await weakResetRes.json() as { error: { code: string } };
  if (weakData.error.code !== 'WEAK_PASSWORD') {
    console.error(`Expected WEAK_PASSWORD code, got ${weakData.error.code}`);
    process.exit(1);
  }
  console.log('✅ Weak password strength check verified.');

  // Attempt reset with valid password
  const newPassword = 'NewSecurePassword123!';
  const resetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: adminEmail,
      token: testCleartextToken,
      password: newPassword,
    }),
  });

  if (resetRes.status !== 200) {
    console.error(`Expected 200 for reset, got ${resetRes.status}`);
    const bodyText = await resetRes.text();
    console.error(bodyText);
    process.exit(1);
  }
  console.log('✅ Password reset succeeded with valid password.');

  // Verify database updates
  const updatedUser2 = await prisma.user.findUnique({ where: { email: adminEmail } });
  const isMatch = await verifyPassword(newPassword, updatedUser2!.passwordHash);
  if (isMatch) {
    console.log('✅ Password hash updated in database.');
  } else {
    console.error('❌ Password hash not updated in database.');
    process.exit(1);
  }

  const usedToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash: testTokenHash } });
  if (usedToken && usedToken.used) {
    console.log('✅ Reset token successfully marked as used.');
  } else {
    console.error('❌ Reset token not marked as used.');
    process.exit(1);
  }

  // Verify sessions flushed
  const activeSessions = await prisma.refreshToken.findMany({
    where: { userId: lockedUser.id, revoked: false },
  });
  if (activeSessions.length === 0) {
    console.log('✅ Active sessions successfully flushed.');
  } else {
    console.error(`❌ Session flush failed: ${activeSessions.length} active sessions remain.`);
    process.exit(1);
  }

  // Check audit log
  const resetSuccessAudit = await prisma.auditLog.findFirst({
    where: { action: 'PASSWORD_RESET_SUCCESS', userId: lockedUser.id },
  });
  if (resetSuccessAudit) {
    console.log('✅ Audit log recorded: PASSWORD_RESET_SUCCESS');
  } else {
    console.error('❌ Audit log for PASSWORD_RESET_SUCCESS is missing.');
    process.exit(1);
  }

  // Restore the original admin password for subsequent tests
  const originalHash = await hashPassword('AdminPassword123!');
  await prisma.user.update({
    where: { id: lockedUser.id },
    data: { passwordHash: originalHash },
  });

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Unexpected test runner error:', err);
  process.exit(1);
});
