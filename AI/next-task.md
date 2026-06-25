## Current Task: Phase 8 — Milestone 2: Public applicant flow

**Objective**: Connect the shareholder application wizard `/join` to the backend APIs, processing form details submissions and file uploads to S3.

**Status**: Planned

### Requirements
1. Refactor the `handleSubmit` in `JoinFormSection.tsx` to POST the registration details metadata to `/api/v1/applications`.
2. Grab the returned database UUID and JWT `uploadToken`.
3. Sequentially upload files (Aadhaar Card, PAN Card, Passport Photo, Producer Proof, Bank Passbook) to `/api/v1/applications/:id/documents` using the `X-Upload-Token` header.
4. Implement retry buttons, error panels, and progress loaders for document uploads.
5. Compile the jsPDF receipt with official database values.

### Pre-conditions
- Milestone 1: Core Infrastructure completed, verified, and routing middleware active. [MET]

### Files Expected to Change / Create
- `src/components/sections/join/JoinFormSection.tsx` [MODIFY]
- `src/lib/membership.ts` [MODIFY]
- `AI/STATUS.md` [MODIFY]
