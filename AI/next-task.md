## Current Task: Phase 8 — Milestone 5: Application Details & Document Viewer

**Objective**: Build the individual application detail view page at `/admin/applications/:id` to display full shareholder application data, uploaded documents, and status transition controls.

**Status**: Planned

### Requirements
1. Fetch and display decrypted application details from `GET /api/v1/applications/:id`.
2. Render all applicant fields in a structured, read-only detail layout.
3. Display uploaded documents with download links or inline previews.
4. Implement application status update controls using `PATCH /api/v1/applications/:id/status`.
5. Display status transition history from audit logs filtered by target application ID.
6. Maintain block-scoped access control (coordinators see only their block's applications).

### Pre-conditions
- Milestone 4 (Coordinator / Admin Dashboard) completed and fully verified. [MET]

### Files Expected to Change / Create
- `src/app/admin/applications/[id]/page.tsx` [NEW]
- `src/components/sections/admin/ApplicationDetails.tsx` [NEW]
- `src/components/sections/admin/DocumentViewer.tsx` [NEW]
- `src/components/sections/admin/StatusControls.tsx` [NEW]
- `AI/STATUS.md` [MODIFY]
