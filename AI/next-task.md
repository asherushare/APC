## Current Task: Phase 9 — Deployment & DevOps

**Objective**: Deploy the APC Digital Platform (Frontend Next.js app and Backend Express server) to production infrastructure with a managed database, automated CI/CD pipeline, and domain configurations.

**Status**: ⏳ Not Started (Local production hardening completed in Phase 7F)

### Requirements
1. Configure a production managed database (e.g. AWS RDS or Supabase PostgreSQL) and run migration scripts.
2. Establish production S3 / Supabase Storage buckets with strict policy restrictions.
3. Set up production hosting:
   - Frontend (Vercel, Netlify, or AWS Amplify) with CORS headers configured.
   - Backend (Render, Fly.io, or AWS ECS/App Runner).
4. Configure production environment variables in host providers (DB URL, JWT secrets, encryption keys).
5. Build and verify a deployment CI/CD pipeline (GitHub Actions) running lints, tests, and auto-deploys.
6. Verify production health heartbeat `/health` endpoints and SSL/TLS certificates.

### Pre-conditions
- Phase 8 (Admin Dashboard & Application Review UI) completed and fully verified. [MET]

### Files Expected to Change / Create
- `.github/workflows/deploy.yml` [NEW]
- `AI/STATUS.md` [MODIFY]
