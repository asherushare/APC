import { prisma } from '../config/db';
import { hashRefreshToken } from '../utils/auth';

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

  console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Unexpected test runner error:', err);
  process.exit(1);
});
