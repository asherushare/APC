## Current Task: Phase 7F — Hardening & Testing

**Objective**: Configure system hardening measures, including database backup scripts, production Docker configurations, and security verification.

**Status**: Planned

### Requirements
1. Implement and verify a secure PostgreSQL backup script for database maintenance.
2. Build multi-stage production Dockerfile and compose configurations for backend deployment.
3. Review and verify CORS, rate limiting, and security headers configurations in production mode.
4. Perform final integration test sweeps across all Phase 7 components (Auth, Applications, Documents, Admin APIs).

### Pre-conditions
- Phase 7E: Admin APIs completed, tested, and database schema updated successfully. [MET]

### Files Expected to Change / Create
- `backend/Dockerfile` [NEW]
- `backend/docker-compose.prod.yml` [NEW]
- `backend/src/scripts/backup-db.ps1` [NEW]
- `backend/src/app.ts` [MODIFY]
- `AI/STATUS.md` [MODIFY]
