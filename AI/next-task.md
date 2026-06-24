## Current Task: Phase 7E — Admin APIs

**Objective**: Implement administrative endpoints to update application reviews, manage status transitions, and retrieve system audit logs.

**Status**: Planned

### Requirements
1. Implement application status review endpoint (`PATCH /api/v1/applications/:id/status`) allowing admins/coordinators to approve, reject, or request documents.
2. Enforce coordinator block restrictions on reviews (coordinators can only modify applications within their block).
3. Record detailed audit logs containing status transition changes (`changes` JSON payload snapshot).
4. Implement audit logs retrieval endpoint (`GET /api/v1/audit-logs`) gated for admins and scoped for coordinators.
5. Create comprehensive integration tests validating status transition checks and block limits.

### Pre-conditions
- Phase 7D: Documents API completed, verified, and S3 upload flow validated successfully. [MET]

### Files Expected to Change
- `backend/src/routes/applications.ts` [MODIFY]
- `backend/src/controllers/applications.ts` [MODIFY]
- `backend/src/routes/audit.ts` [NEW]
- `backend/src/controllers/audit.ts` [NEW]
- `backend/src/app.ts` [MODIFY]

### Definition of Done
- [ ] Application status updates are successfully persisted and checked against coordinator blocks.
- [ ] Audit logs show before/after state snapshots.
- [ ] Gated audit logs API works cleanly.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
