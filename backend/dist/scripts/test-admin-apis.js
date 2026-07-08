"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-undef */
const db_1 = require("../config/db");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
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
function hashAadhaar(aadhaar) {
    return crypto_1.default.createHash('sha256').update(aadhaar).digest('hex');
}
async function runTests() {
    console.log('🏁 Starting Phase 7E (Admin APIs) Integration Tests...');
    // 1. Seed/ensure users
    console.log('🌱 Seeding test users...');
    const passwordHash = await bcrypt_1.default.hash('Password123!', 12);
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
    // 2. Clean old data for our test applications & audit logs
    console.log('🧹 Cleaning old test data...');
    const aadhaarRayagada = '999911112222';
    const aadhaarMuniguda = '999933334444';
    const hashRayagada = hashAadhaar(aadhaarRayagada);
    const hashMuniguda = hashAadhaar(aadhaarMuniguda);
    const existingApps = await db_1.prisma.shareholderApplication.findMany({
        where: { OR: [{ aadhaarHash: hashRayagada }, { aadhaarHash: hashMuniguda }] },
    });
    const appIds = existingApps.map(a => a.id);
    if (appIds.length > 0) {
        await db_1.prisma.auditLog.deleteMany({ where: { targetId: { in: appIds } } });
        await db_1.prisma.document.deleteMany({ where: { applicationId: { in: appIds } } });
        await db_1.prisma.producerActivity.deleteMany({ where: { applicationId: { in: appIds } } });
        await db_1.prisma.shareholderApplication.deleteMany({ where: { id: { in: appIds } } });
    }
    // 3. Create test applications
    console.log('📝 Seeding test applications...');
    const appRayagada = await db_1.prisma.shareholderApplication.create({
        data: {
            applicationId: 'APC-2026-TSTRYG',
            fullName: 'Rayagada Farmer',
            fatherHusbandName: 'Father Rayagada',
            dateOfBirth: new Date('1990-01-01'),
            gender: 'male',
            aadhaarHash: hashRayagada,
            aadhaarEncrypted: 'encrypted_aadhaar_1',
            aadhaarMasked: 'XXXX-XXXX-2222',
            mobileNumber: '9876543210',
            whatsappNumber: '9876543210',
            occupation: 'Farmer',
            village: 'Rayagada Village',
            gramPanchayat: 'Rayagada GP',
            block: 'Rayagada',
            district: 'Rayagada',
            state: 'Odisha',
            pinCode: '765001',
            numberOfShares: 1,
            calculatedContribution: 10000.0,
            nomineeName: 'Nominee R',
            nomineeRelationship: 'Spouse',
            nomineeAddress: 'Rayagada Village',
            nomineeMobileNumber: '9876543211',
            bankAccountHolderName: 'Rayagada Farmer',
            bankName: 'SBI',
            bankBranch: 'Rayagada Main',
            bankAccountNumberEnc: 'encrypted_bank_1',
            bankAccountNumberMask: 'XXXXXX2222',
            bankIfscCode: 'SBIN0001234',
            status: 'SUBMITTED',
        },
    });
    const appMuniguda = await db_1.prisma.shareholderApplication.create({
        data: {
            applicationId: 'APC-2026-TSTMUN',
            fullName: 'Muniguda Farmer',
            fatherHusbandName: 'Father Muniguda',
            dateOfBirth: new Date('1992-05-05'),
            gender: 'female',
            aadhaarHash: hashMuniguda,
            aadhaarEncrypted: 'encrypted_aadhaar_2',
            aadhaarMasked: 'XXXX-XXXX-4444',
            mobileNumber: '9876543220',
            whatsappNumber: '9876543220',
            occupation: 'Farmer',
            village: 'Muniguda Village',
            gramPanchayat: 'Muniguda GP',
            block: 'Muniguda',
            district: 'Rayagada',
            state: 'Odisha',
            pinCode: '765020',
            numberOfShares: 2,
            calculatedContribution: 20000.0,
            nomineeName: 'Nominee M',
            nomineeRelationship: 'Son',
            nomineeAddress: 'Muniguda Village',
            nomineeMobileNumber: '9876543221',
            bankAccountHolderName: 'Muniguda Farmer',
            bankName: 'HDFC',
            bankBranch: 'Muniguda Main',
            bankAccountNumberEnc: 'encrypted_bank_2',
            bankAccountNumberMask: 'XXXXXX4444',
            bankIfscCode: 'HDFC0004321',
            status: 'SUBMITTED',
        },
    });
    // Get auth tokens
    const adminToken = await getAccessToken(testAdmin.email, testAdmin.password);
    const rayagadaToken = await getAccessToken(testRayagadaCoordinator.email, testRayagadaCoordinator.password);
    const munigudaToken = await getAccessToken(testMunigudaCoordinator.email, testMunigudaCoordinator.password);
    console.log('🔑 Tokens retrieved successfully.');
    // ==========================================
    // SECTION 1: Status Transitions & Block Scopes
    // ==========================================
    console.log('\n--- Section 1: Testing Status Updates & Block Boundaries ---');
    // Test 1.1: Rayagada Coordinator updates Rayagada Application (Should Pass)
    console.log('👉 Test 1.1: Rayagada Coordinator updates Rayagada Application (Pass)');
    const res1 = await fetch(`${BASE_URL}/applications/${appRayagada.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${rayagadaToken}`,
        },
        body: JSON.stringify({
            status: 'UNDER_REVIEW',
            reviewNotes: 'Valid review notes for Rayagada application.',
        }),
    });
    if (res1.status !== 200) {
        const text = await res1.text();
        throw new Error(`Test 1.1 failed: Expected status 200, got ${res1.status}. Response: ${text}`);
    }
    const body1 = (await res1.json());
    if (!body1.application.reviewedAt) {
        throw new Error('Test 1.1 failed: reviewedAt was not recorded in the response');
    }
    console.log(`✅ Passed. reviewedAt: ${body1.application.reviewedAt}`);
    // Test 1.2: Rayagada Coordinator attempts to update Muniguda Application (Should Fail 403)
    console.log('👉 Test 1.2: Rayagada Coordinator updates Muniguda Application (Fail 403)');
    const res2 = await fetch(`${BASE_URL}/applications/${appMuniguda.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${rayagadaToken}`,
        },
        body: JSON.stringify({ status: 'UNDER_REVIEW' }),
    });
    if (res2.status !== 403) {
        throw new Error(`Test 1.2 failed: Expected status 403, got ${res2.status}`);
    }
    console.log('✅ Passed. Correctly blocked with 403.');
    // Test 1.3: Muniguda Coordinator attempts to update Rayagada Application (Should Fail 403)
    console.log('👉 Test 1.3: Muniguda Coordinator updates Rayagada Application (Fail 403)');
    const res3 = await fetch(`${BASE_URL}/applications/${appRayagada.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${munigudaToken}`,
        },
        body: JSON.stringify({ status: 'DOCUMENTS_PENDING' }),
    });
    if (res3.status !== 403) {
        throw new Error(`Test 1.3 failed: Expected status 403, got ${res3.status}`);
    }
    console.log('✅ Passed. Correctly blocked with 403.');
    // Test 1.4: Admin updates Muniguda Application (Should Pass since admin has global access)
    console.log('👉 Test 1.4: Admin updates Muniguda Application (Pass)');
    const res4 = await fetch(`${BASE_URL}/applications/${appMuniguda.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'UNDER_REVIEW' }),
    });
    if (res4.status !== 200) {
        const text = await res4.text();
        throw new Error(`Test 1.4 failed: Expected status 200, got ${res4.status}. Response: ${text}`);
    }
    console.log('✅ Passed. Admin updated status successfully.');
    // Test 1.5: Admin attempts invalid transition (UNDER_REVIEW -> DRAFT) (Should Fail 400/422)
    console.log('👉 Test 1.5: Admin attempts invalid transition UNDER_REVIEW -> DRAFT (Fail 400)');
    const res5 = await fetch(`${BASE_URL}/applications/${appMuniguda.id}/status`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'DRAFT' }),
    });
    if (res5.status !== 400 && res5.status !== 422) {
        throw new Error(`Test 1.5 failed: Expected validation error status 400/422, got ${res5.status}`);
    }
    console.log('✅ Passed. Invalid transition rejected correctly.');
    // Test 1.6: Transition flow verification (UNDER_REVIEW -> PAYMENT_PENDING -> PAYMENT_CONFIRMED -> APPROVED)
    console.log('👉 Test 1.6: Admin transitions Muniguda App through valid path (Pass)');
    const steps = ['PAYMENT_PENDING', 'PAYMENT_CONFIRMED', 'APPROVED'];
    for (const stepStatus of steps) {
        const resStep = await fetch(`${BASE_URL}/applications/${appMuniguda.id}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({ status: stepStatus }),
        });
        if (resStep.status !== 200) {
            const text = await resStep.text();
            throw new Error(`Test 1.6 failed at step ${stepStatus}: Expected status 200, got ${resStep.status}. Response: ${text}`);
        }
    }
    console.log('✅ Passed. Full transition path succeeded.');
    // ==========================================
    // SECTION 2: Statistics Aggregation & Scoping
    // ==========================================
    console.log('\n--- Section 2: Testing Statistics Dashboard & Scoping ---');
    // Test 2.1: Admin retrieves overall stats (Should see stats across all blocks)
    console.log('👉 Test 2.1: Admin retrieves overall statistics (Pass)');
    const statsResAdmin = await fetch(`${BASE_URL}/applications/stats`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (statsResAdmin.status !== 200) {
        throw new Error(`Test 2.1 failed: Expected status 200, got ${statsResAdmin.status}`);
    }
    const statsBodyAdmin = (await statsResAdmin.json());
    console.log('Admin Stats:', statsBodyAdmin.stats);
    if (statsBodyAdmin.stats.APPROVED < 1 || statsBodyAdmin.stats.UNDER_REVIEW < 1) {
        throw new Error('Test 2.1 failed: Seeded apps not reflected in admin overall stats counts');
    }
    console.log('✅ Passed.');
    // Test 2.2: Rayagada Coordinator retrieves stats (Should be scoped to Rayagada block)
    console.log('👉 Test 2.2: Rayagada Coordinator retrieves block-scoped statistics (Pass)');
    const statsResRayagada = await fetch(`${BASE_URL}/applications/stats`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${rayagadaToken}` },
    });
    if (statsResRayagada.status !== 200) {
        throw new Error(`Test 2.2 failed: Expected status 200, got ${statsResRayagada.status}`);
    }
    const statsBodyRayagada = (await statsResRayagada.json());
    console.log('Rayagada Stats:', statsBodyRayagada.stats);
    // In Rayagada block, we have appRayagada (UNDER_REVIEW). We should not see appMuniguda (APPROVED)
    if (statsBodyRayagada.stats.APPROVED !== 0 || statsBodyRayagada.stats.UNDER_REVIEW < 1) {
        throw new Error('Test 2.2 failed: Rayagada stats are not correctly scoped (saw APPROVED app from Muniguda)');
    }
    console.log('✅ Passed.');
    // ==========================================
    // SECTION 3: Audit Log Scoping & Filtering
    // ==========================================
    console.log('\n--- Section 3: Testing Audit Logs Scoping & Filtering ---');
    // Test 3.1: Admin retrieves audit logs (Should see all logs)
    console.log('👉 Test 3.1: Admin retrieves all audit logs (Pass)');
    const auditResAdmin = await fetch(`${BASE_URL}/audit-logs?limit=50`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (auditResAdmin.status !== 200) {
        throw new Error(`Test 3.1 failed: Expected status 200, got ${auditResAdmin.status}`);
    }
    const auditBodyAdmin = (await auditResAdmin.json());
    // Verify we see logs for both applications
    const hasRayagadaLog = auditBodyAdmin.logs.some(log => log.targetId === appRayagada.id);
    const hasMunigudaLog = auditBodyAdmin.logs.some(log => log.targetId === appMuniguda.id);
    if (!hasRayagadaLog || !hasMunigudaLog) {
        throw new Error('Test 3.1 failed: Admin cannot see all expected status update audit logs');
    }
    console.log('✅ Passed. Admin retrieved all audit logs successfully.');
    // Test 3.2: Rayagada Coordinator retrieves audit logs (Should be restricted)
    console.log('👉 Test 3.2: Rayagada Coordinator retrieves block-scoped audit logs (Pass)');
    const auditResRayagada = await fetch(`${BASE_URL}/audit-logs?limit=50`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${rayagadaToken}` },
    });
    if (auditResRayagada.status !== 200) {
        throw new Error(`Test 3.2 failed: Expected status 200, got ${auditResRayagada.status}`);
    }
    const auditBodyRayagada = (await auditResRayagada.json());
    // Rayagada coordinator should see:
    // - Logs they generated (the update to appRayagada)
    // - Logs targeting Rayagada application
    // Rayagada coordinator must NOT see logs targeting Muniguda application generated by admin
    const hasMunigudaLogForRayagada = auditBodyRayagada.logs.some(log => log.targetId === appMuniguda.id);
    if (hasMunigudaLogForRayagada) {
        throw new Error('Test 3.2 failed: Rayagada coordinator is seeing audit logs for Muniguda applications');
    }
    console.log('✅ Passed. Rayagada coordinator audit logs strictly scoped.');
    // Test 3.3: Pagination & Action Filter verification
    console.log('👉 Test 3.3: Query logs with Action Filter and Pagination (Pass)');
    const filterRes = await fetch(`${BASE_URL}/audit-logs?action=STATUS_UPDATED&limit=1&page=1`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (filterRes.status !== 200) {
        throw new Error(`Test 3.3 failed: Expected status 200, got ${filterRes.status}`);
    }
    const filterBody = (await filterRes.json());
    if (filterBody.logs.length !== 1 || filterBody.pagination.limit !== 1) {
        throw new Error('Test 3.3 failed: Pagination limits not applied');
    }
    console.log(`✅ Passed. Pagination returned: Page ${filterBody.pagination.page} of ${filterBody.pagination.totalPages}`);
    console.log('\n✨ All Phase 7E Admin APIs Integration Tests passed successfully! 🎉');
}
runTests()
    .then(() => {
    process.exit(0);
})
    .catch((err) => {
    console.error('❌ Integration tests failed:', err);
    process.exit(1);
});
