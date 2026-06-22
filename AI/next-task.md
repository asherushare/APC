## Current Task: Phase 7C — Applications API

**Objective**: Implement public shareholder application persistence endpoints (`POST /api/v1/applications`) with column-level AES-256-GCM encryption for sensitive data (Aadhaar, PAN, Bank Account Number) and uniqueness checks.

**Status**: Planning

### Requirements
1. Implement a symmetric encryption utility (`backend/src/utils/crypto.ts`) using AES-256-GCM and the 256-bit `ENCRYPTION_KEY` from environment variables.
2. Build Zod validation schemas for shareholder application input payload matching the 9-step wizard schema.
3. Generate a SHA-256 hash of the Aadhaar number (`aadhaarHash`) to enforce global uniqueness database constraints.
4. Encrypt sensitive fields (`aadhaarEncrypted`, `panEncrypted`, `bankAccountNumberEnc`) before database storage.
5. Create masked representations (`aadhaarMasked`, `panMasked`, `bankAccountNumberMask`) for safe display in lists.
6. Generate official, unique client-side formatted application IDs on the server (e.g. `APC-YYYY-XXXXXX`).
7. Create authenticated routes for staff and coordinators to fetch list (`GET /api/v1/applications`) and details (`GET /api/v1/applications/:id`).

### Pre-conditions
- Phase 7B: Authentication completed, verified, and compiled successfully with zero build and lint errors. [MET]
- Local PostgreSQL instance initialized and running.

### Files Expected to Change
- `backend/src/utils/crypto.ts` [NEW]
- `backend/src/routes/applications.ts` [NEW]
- `backend/src/controllers/applications.ts` [NEW]
- `backend/src/app.ts` [MODIFY]

### Definition of Done
- [ ] Zod schema successfully validates all incoming application payloads.
- [ ] Column-level AES-256-GCM encryption functions correctly (verifiable in DB records).
- [ ] Duplicate Aadhaar submissions return a clean 409 Conflict.
- [ ] Gated applications query routes compile and verify roles.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
