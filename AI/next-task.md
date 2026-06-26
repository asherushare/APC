## Current Task: Phase 8 — Milestone 4: Coordinator / Admin Dashboard

**Objective**: Build the core components of the administrative panel to list shareholder applications, view aggregate statistics cards, and query system logs.

**Status**: Planned

### Requirements
1. Build the applications list page with search, status filters, block filters, and pagination support.
2. Render aggregate metrics cards showing counts of applications in different statuses (SUBMITTED, UNDER_REVIEW, etc.), scoped by block for coordinators.
3. Build the paginated audit logs viewer.
4. Integrate API queries pointing to `/applications`, `/applications/stats`, and `/audit-logs`.

### Pre-conditions
- Milestone 3 (Authentication & Session Management) completed and fully verified. [MET]

### Files Expected to Change / Create
- `src/app/admin/dashboard/page.tsx` [MODIFY]
- `src/components/sections/admin/ApplicationsList.tsx` [NEW]
- `AI/STATUS.md` [MODIFY]
