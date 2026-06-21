## Current Task: Phase 7 — Backend API

**Objective**: Implement a Node.js backend using Prisma ORM and PostgreSQL to persist shareholder applications, handle server-side file uploads, and generate unique Application IDs.
**Status**: Planning

### Requirements
1. Migrate the repository to a monorepo structure (ADR-009).
2. Setup PostgreSQL database and Prisma ORM configuration.
3. Create backend REST API endpoints for:
   - Submitting a shareholder application (saving data to PostgreSQL).
   - Uploading supporting documents (to cloud storage, e.g., AWS S3 or Supabase Storage).
   - Fetching application status.
   - Generating official receipt PDFs on the server.
4. Replace frontend `submitShareholderApplication()` (in `src/lib/membership.ts`) and file handling to point to the new backend API routes.
5. Replace client-side Application ID generator with server-generated database IDs.

### Pre-conditions
- Completion and verification of Phase 6.5A (AI Workspace Foundation).
- PostgreSQL instance configured and accessible.

### Files Expected to Change
- `src/lib/membership.ts`
- `src/lib/application-id.ts`
- `src/components/sections/join/JoinFormSection.tsx`
- `package.json`
- Monorepo structural files (`tsconfig.json`, workspaces configuration, etc.)

### Definition of Done
- [ ] Monorepo successfully initialized and building.
- [ ] Prisma schema defined and database migrations run.
- [ ] API endpoints fully functional and tested.
- [ ] Frontend successfully integrated with backend routes (no longer relying on raw WhatsApp deep links for data persistence).
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `AI/STATUS.md` updated.
- [ ] `AI/changelog.md` updated.
