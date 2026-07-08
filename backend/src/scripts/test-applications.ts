import { prisma } from '../config/db';
import { hashAadhaar } from '../utils/crypto';
import bcrypt from 'bcrypt';

interface ApplicationListResponse {
  success: boolean;
  applications: {
    id: string;
    applicationId: string;
    fullName: string;
    status: string;
    block: string;
  }[];
}

interface ApplicationDetailResponse {
  success: boolean;
  application: {
    id: string;
    applicationId: string;
    fullName: string;
    status: string;
    block: string;
    aadhaarNumber: string;
    panNumber: string | null;
    bankAccountNumber: string;
  };
}

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

const testAdmin = {
  email: 'admin@adivasiproducer.com',
  password: 'AdminPassword123!',
};

const testRayagadaCoordinator = {
  email: 'coord_rayagada@adivasiproducer.com',
  password: 'Password123!',
  fullName: 'Rayagada Coordinator',
  role: 'COORDINATOR',
  block: 'Rayagada',
};

const testMunigudaCoordinator = {
  email: 'coord_muniguda@adivasiproducer.com',
  password: 'Password123!',
  fullName: 'Muniguda Coordinator',
  role: 'COORDINATOR',
  block: 'Muniguda',
};

const testStaff = {
  email: 'staff@adivasiproducer.com',
  password: 'Password123!',
  fullName: 'Staff Member',
  role: 'STAFF',
  block: 'Rayagada',
};

async function getAccessToken(email: string, password: string): Promise<string> {
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Bypass-Rate-Limit': 'true',
    },
    body: JSON.stringify({ email, password }),
  });

  if (loginRes.status !== 200) {
    const text = await loginRes.text();
    throw new Error(`Failed to log in as ${email}: Status ${loginRes.status}. Output: ${text}`);
  }

  const data = (await loginRes.json()) as { accessToken: string };
  return data.accessToken;
}

async function runTests(): Promise<void> {
  console.log('🏁 Starting Shareholder Applications API Integration Tests...');

  // 1. Seed needed test users
  console.log('🌱 Seeding test users...');
  
  // Make sure admin exists (seeded with default bcrypt hash)
  const existingAdmin = await prisma.user.findUnique({ where: { email: testAdmin.email } });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash(testAdmin.password, 12);
    await prisma.user.create({
      data: {
        email: testAdmin.email,
        fullName: 'APC Admin User',
        passwordHash: adminHash,
        role: 'ADMIN',
      },
    });
  }

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // Upsert Rayagada coordinator
  await prisma.user.upsert({
    where: { email: testRayagadaCoordinator.email },
    update: { passwordHash, block: testRayagadaCoordinator.block, role: 'COORDINATOR', deletedAt: null },
    create: {
      email: testRayagadaCoordinator.email,
      fullName: testRayagadaCoordinator.fullName,
      passwordHash,
      role: 'COORDINATOR',
      block: testRayagadaCoordinator.block,
    },
  });

  // Upsert Muniguda coordinator
  await prisma.user.upsert({
    where: { email: testMunigudaCoordinator.email },
    update: { passwordHash, block: testMunigudaCoordinator.block, role: 'COORDINATOR', deletedAt: null },
    create: {
      email: testMunigudaCoordinator.email,
      fullName: testMunigudaCoordinator.fullName,
      passwordHash,
      role: 'COORDINATOR',
      block: testMunigudaCoordinator.block,
    },
  });

  // Upsert Staff
  await prisma.user.upsert({
    where: { email: testStaff.email },
    update: { passwordHash, block: testStaff.block, role: 'STAFF', deletedAt: null },
    create: {
      email: testStaff.email,
      fullName: testStaff.fullName,
      passwordHash,
      role: 'STAFF',
      block: testStaff.block,
    },
  });

  // Clean existing applications
  await prisma.shareholderApplication.deleteMany({});
  await prisma.auditLog.deleteMany({
    where: { action: { in: ['APPLICATION_SUBMITTED'] } },
  });

  // Log in all roles to obtain access tokens
  console.log('🔑 Logging in test users...');
  const adminToken = await getAccessToken(testAdmin.email, testAdmin.password);
  const rayagadaToken = await getAccessToken(testRayagadaCoordinator.email, testRayagadaCoordinator.password);
  const munigudaToken = await getAccessToken(testMunigudaCoordinator.email, testMunigudaCoordinator.password);
  const staffToken = await getAccessToken(testStaff.email, testStaff.password);

  console.log('✅ Tokens obtained successfully.');

  // Test data payload
  const validPayload = {
    fullName: 'Laxmi Majhi',
    fatherHusbandName: 'Gopal Majhi',
    dateOfBirth: '1985-05-15',
    gender: 'female',
    aadhaarNumber: '123456789012',
    panNumber: 'ABCDE1234F',
    mobileNumber: '9876543210',
    whatsappNumber: '9876543210',
    email: 'laxmi.majhi@example.com',
    occupation: 'Farmer',
    village: 'Kailashpur',
    gramPanchayat: 'Kailashpur',
    block: 'Rayagada',
    district: 'Rayagada',
    state: 'Odisha',
    pinCode: '765001',
    producerActivities: ['Cotton cultivation', 'Minor forest produce collection'],
    numberOfShares: 2,
    calculatedContribution: 20000,
    nomineeName: 'Rita Majhi',
    nomineeRelationship: 'Daughter',
    nomineeAddress: 'Kailashpur, Rayagada',
    nomineeMobileNumber: '9876543211',
    bankAccountHolderName: 'Laxmi Majhi',
    bankName: 'State Bank of India',
    bankBranch: 'Rayagada Branch',
    bankAccountNumber: '98765432100',
    bankIfscCode: 'SBIN0000123',
    confirmCorrectInfo: true,
    agreeToRules: true,
    understandApprovalRequired: true,
  };

  // Test 1: Public Submission Success
  console.log('\n--- 1. Testing Public Application Submission (Success) ---');
  const submitRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(validPayload),
  });

  if (submitRes.status !== 201) {
    const errorText = await submitRes.text();
    console.error(`❌ Expected 201, got ${submitRes.status}. Details: ${errorText}`);
    process.exit(1);
  }

  const submitData = (await submitRes.json()) as { success: boolean; applicationId: string };
  const appId = submitData.applicationId;
  console.log(`✅ Submission successful. Generated Application ID: ${appId}`);

  // Query DB directly to verify column-level encryption & hashing
  const dbRecord = await prisma.shareholderApplication.findUnique({
    where: { applicationId: appId },
  });

  if (!dbRecord) {
    console.error('❌ Application record not found in database.');
    process.exit(1);
  }

  console.log('✅ Database record successfully persisted.');

  // Validate unique hash
  const expectedHash = hashAadhaar(validPayload.aadhaarNumber);
  if (dbRecord.aadhaarHash !== expectedHash) {
    console.error(`❌ Hash mismatch: expected ${expectedHash}, got ${dbRecord.aadhaarHash}`);
    process.exit(1);
  }
  console.log('✅ Aadhaar SHA-256 hash is correct.');

  // Validate sensitive encryption
  if (
    dbRecord.aadhaarEncrypted.includes(validPayload.aadhaarNumber) ||
    (dbRecord.panEncrypted && dbRecord.panEncrypted.includes(validPayload.panNumber)) ||
    dbRecord.bankAccountNumberEnc.includes(validPayload.bankAccountNumber)
  ) {
    console.error('❌ Sensitive data stored in plaintext!');
    process.exit(1);
  }
  console.log('✅ Sensitive data stored encrypted (Aadhaar, PAN, Bank Account Number).');

  // Verify masking
  if (
    dbRecord.aadhaarMasked !== 'XXXX-XXXX-9012' ||
    dbRecord.panMasked !== 'XXXXXX234F' ||
    dbRecord.bankAccountNumberMask !== 'XXXXXXX2100'
  ) {
    console.error(`❌ Masking mismatch. Masked values: Aadhaar=${dbRecord.aadhaarMasked}, PAN=${dbRecord.panMasked}, Bank=${dbRecord.bankAccountNumberMask}`);
    process.exit(1);
  }
  console.log('✅ Masking applied correctly.');

  // Verify no document records were created
  const docsCount = await prisma.document.count({ where: { applicationId: dbRecord.id } });
  if (docsCount !== 0) {
    console.error(`❌ Deferred check failed: expected 0 documents, got ${docsCount}`);
    process.exit(1);
  }
  console.log('✅ Documents deferred (0 document records created).');

  // Verify audit log
  const audit = await prisma.auditLog.findFirst({
    where: { action: 'APPLICATION_SUBMITTED', targetId: dbRecord.id },
  });
  if (!audit) {
    console.error('❌ Audit log for APPLICATION_SUBMITTED not generated.');
    process.exit(1);
  }
  console.log('✅ Audit log correctly recorded.');

  // Test 2: Validation Failure (Contribution Mismatch)
  console.log('\n--- 2. Testing Submission with Mismatched Contribution ---');
  const badContributionPayload = { ...validPayload, calculatedContribution: 99999 };
  const valRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(badContributionPayload),
  });

  console.log(`Mismatch contribution response status: ${valRes.status} (Expected: 422)`);
  if (valRes.status !== 422) {
    console.error('❌ Failed to reject contribution mismatch.');
    process.exit(1);
  }
  const valError = await valRes.json() as { error: { code: string } };
  console.log(`Error code: ${valError.error.code} (Expected: VALIDATION_FAILED)`);
  if (valError.error.code !== 'VALIDATION_FAILED') {
    console.error('❌ Mismatched error code.');
    process.exit(1);
  }
  console.log('✅ Calculated contribution check functions correctly.');

  // Test 3: Duplicate Aadhaar check
  console.log('\n--- 3. Testing Duplicate Aadhaar Blocking ---');
  // Attempt to submit duplicate application
  const dupRes = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...validPayload, mobileNumber: '9999999999' }), // diff mobile to isolate duplicate Aadhaar check
  });

  console.log(`Duplicate Aadhaar response status: ${dupRes.status} (Expected: 409)`);
  if (dupRes.status !== 409) {
    console.error('❌ Duplicate Aadhaar not blocked.');
    process.exit(1);
  }
  const dupError = await dupRes.json() as { error: { code: string } };
  console.log(`Error code: ${dupError.error.code} (Expected: DUPLICATE_AADHAAR)`);
  if (dupError.error.code !== 'DUPLICATE_AADHAAR') {
    console.error('❌ Mismatched error code.');
    process.exit(1);
  }
  console.log('✅ Uniqueness validation works.');

  // Test 4: List Endpoint Permissions & Scoping
  console.log('\n--- 4. Testing List Endpoint Access & Scoping ---');
  
  // Unauthenticated
  const listUnauth = await fetch(`${BASE_URL}/applications`);
  console.log(`Unauthenticated status: ${listUnauth.status} (Expected: 401)`);
  if (listUnauth.status !== 401) process.exit(1);

  // STAFF Role (Should be Forbidden)
  const listStaff = await fetch(`${BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  console.log(`Staff role status: ${listStaff.status} (Expected: 403)`);
  if (listStaff.status !== 403) process.exit(1);

  // ADMIN Role (Success, sees the application)
  const listAdminRes = await fetch(`${BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (listAdminRes.status !== 200) {
    console.error(`❌ Admin failed to list applications. Status: ${listAdminRes.status}`);
    process.exit(1);
  }
  const listAdminData = (await listAdminRes.json()) as ApplicationListResponse;
  console.log(`Admin sees applications count: ${listAdminData.applications.length} (Expected: 1)`);
  if (listAdminData.applications.length !== 1) process.exit(1);

  // COORDINATOR Role matching Rayagada block (Success, sees the application)
  const listRayagadaRes = await fetch(`${BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${rayagadaToken}` },
  });
  if (listRayagadaRes.status !== 200) {
    console.error(`❌ Rayagada coordinator failed to list applications. Status: ${listRayagadaRes.status}`);
    process.exit(1);
  }
  const listRayagadaData = (await listRayagadaRes.json()) as ApplicationListResponse;
  console.log(`Rayagada coordinator sees applications count: ${listRayagadaData.applications.length} (Expected: 1)`);
  if (listRayagadaData.applications.length !== 1) process.exit(1);

  // COORDINATOR Role matching Muniguda block (Success, empty list)
  const listMunigudaRes = await fetch(`${BASE_URL}/applications`, {
    headers: { Authorization: `Bearer ${munigudaToken}` },
  });
  if (listMunigudaRes.status !== 200) {
    console.error(`❌ Muniguda coordinator failed to list applications. Status: ${listMunigudaRes.status}`);
    process.exit(1);
  }
  const listMunigudaData = (await listMunigudaRes.json()) as ApplicationListResponse;
  console.log(`Muniguda coordinator sees applications count: ${listMunigudaData.applications.length} (Expected: 0)`);
  if (listMunigudaData.applications.length !== 0) process.exit(1);

  console.log('✅ List endpoint scoping validated.');

  // Test 5: Detail Endpoint Scoping & Decryption
  console.log('\n--- 5. Testing Details Endpoint Scoping & Decryption ---');

  // Rayagada coordinator accesses own block application (Success + Decrypted fields)
  const detailRayagadaRes = await fetch(`${BASE_URL}/applications/${appId}`, {
    headers: { Authorization: `Bearer ${rayagadaToken}` },
  });
  if (detailRayagadaRes.status !== 200) {
    console.error(`❌ Rayagada coordinator failed to access detail. Status: ${detailRayagadaRes.status}`);
    process.exit(1);
  }
  const detailRayagadaData = (await detailRayagadaRes.json()) as ApplicationDetailResponse;
  const appDetails = detailRayagadaData.application;
  
  console.log('Checking decrypted details...');
  if (
    appDetails.aadhaarNumber !== validPayload.aadhaarNumber ||
    appDetails.panNumber !== validPayload.panNumber ||
    appDetails.bankAccountNumber !== validPayload.bankAccountNumber
  ) {
    console.error(`❌ Decryption failed! Got Aadhaar=${appDetails.aadhaarNumber}, PAN=${appDetails.panNumber}, Bank=${appDetails.bankAccountNumber}`);
    process.exit(1);
  }
  console.log('✅ Decrypted details match plaintext.');

  // Muniguda coordinator accesses Rayagada application (Forbidden 403)
  const detailMunigudaRes = await fetch(`${BASE_URL}/applications/${appId}`, {
    headers: { Authorization: `Bearer ${munigudaToken}` },
  });
  console.log(`Muniguda coordinator details status: ${detailMunigudaRes.status} (Expected: 403)`);
  if (detailMunigudaRes.status !== 403) {
    console.error('❌ Muniguda coordinator was not blocked.');
    process.exit(1);
  }

  // Admin accesses Rayagada application (Success)
  const detailAdminRes = await fetch(`${BASE_URL}/applications/${appId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (detailAdminRes.status !== 200) {
    console.error(`❌ Admin failed to fetch details. Status: ${detailAdminRes.status}`);
    process.exit(1);
  }
  console.log('✅ Details endpoint scoping and decryption successfully validated.');

  console.log('\n🎉 ALL PHASE 7C INTEGRATION TESTS PASSED SUCCESSFULLY! 🎉');
}

runTests().catch((err) => {
  console.error('❌ Unexpected test runner error:', err);
  process.exit(1);
});
