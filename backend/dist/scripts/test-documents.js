"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
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
async function getAccessToken(email, password) {
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
    const data = (await loginRes.json());
    return data.accessToken;
}
async function runTests() {
    console.log('🏁 Starting Phase 7D (Documents API) Integration Tests...');
    // 1. Seed users
    console.log('🌱 Seeding test users...');
    const passwordHash = await bcrypt_1.default.hash('Password123!', 12);
    // Admin
    const adminHash = await bcrypt_1.default.hash(testAdmin.password, 12);
    await db_1.prisma.user.upsert({
        where: { email: testAdmin.email },
        update: { passwordHash: adminHash, role: 'ADMIN', deletedAt: null },
        create: {
            email: testAdmin.email,
            fullName: 'APC Admin User',
            passwordHash: adminHash,
            role: 'ADMIN',
        },
    });
    // Coordinators
    await db_1.prisma.user.upsert({
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
    await db_1.prisma.user.upsert({
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
    // 2. Clean old data for the test Aadhaar
    console.log('🧹 Cleaning existing test applications...');
    const testAadhaar = '111122223333';
    const testAadhaarHash = crypto_1.default.createHash('sha256').update(testAadhaar).digest('hex');
    const existingApp = await db_1.prisma.shareholderApplication.findUnique({
        where: { aadhaarHash: testAadhaarHash },
    });
    if (existingApp) {
        await db_1.prisma.document.deleteMany({ where: { applicationId: existingApp.id } });
        await db_1.prisma.shareholderApplication.delete({ where: { id: existingApp.id } });
    }
    // 3. Log in users to get tokens
    console.log('🔑 Authenticating coordinators...');
    const rayagadaToken = await getAccessToken(testRayagadaCoordinator.email, testRayagadaCoordinator.password);
    const munigudaToken = await getAccessToken(testMunigudaCoordinator.email, testMunigudaCoordinator.password);
    const adminToken = await getAccessToken(testAdmin.email, testAdmin.password);
    // 4. Create an application under 'Rayagada' block using public POST
    console.log('📝 Submitting a new shareholder application (Rayagada block)...');
    const appPayload = {
        fullName: 'Test Applicant Rayagada',
        fatherHusbandName: 'Father Rayagada',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        aadhaarNumber: testAadhaar,
        panNumber: 'ABCDE1234F',
        mobileNumber: '9999988888',
        email: 'applicant.rayagada@gmail.com',
        occupation: 'Farmer',
        village: 'Rayagada Town',
        gramPanchayat: 'Rayagada-GP',
        block: 'Rayagada',
        district: 'Rayagada',
        state: 'Odisha',
        pinCode: '765001',
        producerActivities: ['Agriculture', 'Forest Produce'],
        numberOfShares: 5,
        calculatedContribution: 50000,
        nomineeName: 'Nominee Rayagada',
        nomineeRelationship: 'Spouse',
        nomineeDateOfBirth: '1992-10-20',
        nomineeAddress: 'Rayagada Address',
        nomineeMobileNumber: '9999977777',
        bankAccountHolderName: 'Test Applicant Rayagada',
        bankName: 'State Bank of India',
        bankAccountNumber: '12345678901',
        bankIfscCode: 'SBIN0001234',
        confirmCorrectInfo: true,
        agreeToRules: true,
        understandApprovalRequired: true,
    };
    const appRes = await fetch(`${BASE_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appPayload),
    });
    if (appRes.status !== 201) {
        const text = await appRes.text();
        throw new Error(`Failed to submit application: Status ${appRes.status}. Body: ${text}`);
    }
    const appData = (await appRes.json());
    console.log(`✅ Application submitted! ID: ${appData.applicationId}`);
    console.log('🔑 uploadToken generated successfully.');
    // Find DB UUID
    const dbApp = await db_1.prisma.shareholderApplication.findUnique({
        where: { applicationId: appData.applicationId },
    });
    if (!dbApp) {
        throw new Error('Application was not saved in DB!');
    }
    const appUuid = dbApp.id;
    // Helper to verify upload response
    async function testUpload(tokenHeader, expectedStatus, description, useValidFile = true) {
        console.log(`👉 Test: ${description}`);
        const formData = new FormData();
        const fileContent = 'Dummy document payload contents for S3 verification';
        const blob = new Blob([fileContent], { type: useValidFile ? 'image/png' : 'text/html' });
        formData.append('file', blob, useValidFile ? 'aadhaar_front.png' : 'malicious.html');
        formData.append('documentType', 'AADHAAR');
        const headers = {};
        if (tokenHeader) {
            headers[tokenHeader.name] = tokenHeader.value;
        }
        const uploadRes = await fetch(`${BASE_URL}/applications/${appUuid}/documents`, {
            method: 'POST',
            headers,
            body: formData,
        });
        if (uploadRes.status !== expectedStatus) {
            const text = await uploadRes.text();
            console.log(`❌ Failed: Expected status ${expectedStatus}, but got ${uploadRes.status}. Response: ${text.substring(0, 200)}`);
            throw new Error(`Assertion failed for: ${description}`);
        }
        console.log(`✅ Success: Got status ${uploadRes.status}`);
        return uploadRes.status === 201 ? await uploadRes.json() : null;
    }
    // TEST 1: Applicant uploads with correct uploadToken (Pass)
    const uploadData = (await testUpload({ name: 'X-Upload-Token', value: appData.uploadToken }, 201, 'Applicant uploads document with valid secure X-Upload-Token'));
    const docId = uploadData.document.id;
    // TEST 2: Applicant tries to upload with NO token (Fail 401)
    await testUpload(null, 401, 'Applicant tries to upload without token (should fail with 401)');
    // TEST 3: Applicant tries to upload with invalid token (Fail 403)
    await testUpload({ name: 'X-Upload-Token', value: 'invalid_token_value_here' }, 403, 'Applicant tries to upload with invalid token (should fail with 403)');
    // TEST 4: Rayagada Coordinator uploads document (Pass since block matches)
    await testUpload({ name: 'Authorization', value: `Bearer ${rayagadaToken}` }, 201, 'Rayagada Coordinator uploads document (block matches application, should pass)');
    // TEST 5: Muniguda Coordinator tries to upload document (Fail 403 since block is different)
    await testUpload({ name: 'Authorization', value: `Bearer ${munigudaToken}` }, 403, 'Muniguda Coordinator tries to upload document (block mismatch, should fail with 403)');
    // TEST 6: Admin uploads document (Pass since Admin is global)
    await testUpload({ name: 'Authorization', value: `Bearer ${adminToken}` }, 201, 'Admin uploads document (unrestricted role, should pass)');
    // TEST 7: Invalid file type upload filter validation (Fail 422)
    await testUpload({ name: 'X-Upload-Token', value: appData.uploadToken }, 422, 'Upload invalid file format (.html) (should fail with 422)', false);
    // TEST 8: Virus Scanning Background Update Verification
    console.log('⏳ Waiting 6 seconds for background virus scan to complete...');
    await new Promise((resolve) => setTimeout(resolve, 6000));
    console.log('🔍 Checking virusScanStatus database transition...');
    const verifiedDoc = await db_1.prisma.document.findUnique({
        where: { id: docId },
    });
    if (!verifiedDoc) {
        throw new Error(`Document record ${docId} not found in DB!`);
    }
    console.log(`Document virusScanStatus is: [${verifiedDoc.virusScanStatus}]`);
    if (verifiedDoc.virusScanStatus !== 'CLEAN') {
        throw new Error(`Assertion failed: Expected virusScanStatus to be CLEAN, but got ${verifiedDoc.virusScanStatus}`);
    }
    console.log('✨ All Phase 7D Documents API Integration Tests passed successfully! 🎉');
}
const crypto_1 = __importDefault(require("crypto"));
runTests()
    .then(() => {
    process.exit(0);
})
    .catch((err) => {
    console.error('❌ Integration tests failed:', err);
    process.exit(1);
});
