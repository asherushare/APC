## Current Task: Phase 7D — Documents API

**Objective**: Implement document upload persistence, S3 storage integration, and virus scanning status checks.

**Status**: Planning

### Requirements
1. Configure AWS S3 Client using local S3 environment variables.
2. Build files/multipart form parser middleware (e.g. using `multer` or custom stream receiver).
3. Implement document upload endpoint (`POST /api/v1/applications/:id/documents`) persisting S3 metadata (checksum, size, mimeType, key) in the `Document` schema.
4. Establish security rules: only the corresponding applicant or authorized admin/coordinator can upload.
5. Create mock virus scanning processor triggers updating the scan status to `CLEAN`.

### Pre-conditions
- Phase 7C: Applications API completed, verified, and compiled successfully with zero build and lint errors. [MET]
- Local PostgreSQL instance initialized and running.

### Files Expected to Change
- `backend/src/utils/s3.ts` [NEW]
- `backend/src/routes/documents.ts` [NEW]
- `backend/src/controllers/documents.ts` [NEW]
- `backend/src/app.ts` [MODIFY]

### Definition of Done
- [ ] Document file uploads are successfully piped and saved in S3.
- [ ] Database `Document` records are created and linked to `ShareholderApplication`.
- [ ] Scan status transitions are logged.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

