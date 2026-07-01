# Adivasi Producer Company (APC) — Admin Panel Architecture & Implementation Plan

This document serves as the architectural blueprint for expanding and completing the administrative management features within the APC platform. It defines the layout wrapper overrides, page routing systems, component hierarchies, backend API additions, and a phase-by-phase implementation roadmap.

---

## 1. Data Overview (Database Models to Manage)

The administration panel needs to orchestrate and manage five primary schema entities inside `backend/prisma/schema.prisma`:

1. **Shareholder Applications (`ShareholderApplication`)**
   - **Review Workflow**: Manage transition states (`SUBMITTED` ➔ `UNDER_REVIEW` ➔ `DOCUMENTS_PENDING` / `PAYMENT_PENDING` ➔ `APPROVED` / `REJECTED`).
   - **PII Access**: Display decrypted PII data (Aadhaar, PAN, Bank Accounts) to authorized reviewers.
   - **Block Restrictions**: Block coordinators can only view and manage registrations in their assigned geographic block (e.g. Rayagada, Muniguda).
2. **Supporting Documents (`Document`)**
   - **Verification**: View list of uploaded documents, inspect verification statuses, and stream binary file buffers via secure backend channels.
   - **Malware Status**: Check antivirus scan logs (`scanStatus` / `virusScanStatus`).
3. **Users & Block Coordinators (`User`)**
   - **Access Audits**: Admin-only views to create coordinator profiles, assign geographic blocks, lock/unlock accounts, and reset credentials.
4. **Activity Logs (`AuditLog`)**
   - **Timeline Tracking**: Query security actions, login timings, rate limits, status transitions, and data modifications scoped by block.
5. **Information Board Updates (`Notice` - NEW MODEL)**
   - **Dynamic Content**: Transition notices and news updates from static files into database records, enabling admins to publish, update, and hide announcements dynamically.

---

## 2. Frontend Architecture & Page Shell

### Distraction-Free Layout Integration
To prevent the public header/navbar and footer from rendering on administrative routes, we will implement path-based layout guards:
- **`src/components/layout/Navbar.tsx` & `Footer.tsx`**: Return `null` if `pathname.startsWith('/admin')`.
- **`src/app/layout.tsx`**: Apply conditional page wrapper spacing (`pt-0` for `/admin`, `pt-[72px]` for public pages).

### Proposed Route Structure
The admin panel will be structured around a sidebar-centric layouts:

```
src/app/admin/
├── layout.tsx                # Admin-specific navigation shell & Sidebar wrapper
├── login/                    # Public Login page (unauthenticated gate)
├── forgot-password/          # Password reset requests
├── reset-password/           # Password update confirmation
├── dashboard/                # Main stats overview, filters, and timeline audit logs
├── applications/             # Shareholder application list
│   └── [id]/                 # Registration details, decryptor preview, & review actions
├── notices/                  # Dynamic Information Board management dashboard (Create/Edit/Delete)
└── coordinators/             # Admin-only dashboard for managing coordinators and blocks
```

### Key UI Components to Implement
- **Sidebar Navigation Layout (`src/app/admin/layout.tsx`)**: Unified administrative wrapper providing navigation options (Dashboard, Applications, Notices, Coordinators, Settings) and profile information.
- **Application Detail Review Panel (`ApplicationDetails.tsx`)**: Render decrypted bank detail keys, Aadhaar details, and applicant fields side-by-side.
- **Dynamic Status Controller (`StatusControls.tsx`)**: Render action buttons supporting valid transition pathways with inline feedback forms (e.g. rejection reasons).
- **Notice Management Modal (`NoticeModal.tsx`)**: File uploads for notice PDF attachments, form validation for category tags (`scheme`, `announcement`, `story`), and title editors.

---

## 3. Backend Architecture (API Endpoints)

### Existing Administrative Endpoints
* `GET /api/v1/applications` — Queries shareholder applications (block-scoped).
* `GET /api/v1/applications/stats` — Fetches status counts (block-scoped).
* `GET /api/v1/applications/:id` — Decrypts PII and gets details (block-scoped).
* `PATCH /api/v1/applications/:id/status` — Updates status and commits audit trail.
* `GET /api/v1/applications/:id/documents/:documentId/download` — Stream secure documents.
* `GET /api/v1/audit-logs` — Activity timelines (block-scoped).

### New API Endpoints Required

#### A. Notices & Announcements API (`/api/v1/notices`)
- `GET /api/v1/notices` *(Public)*: Returns active list of notices.
- `POST /api/v1/notices` *(Admin-Only)*: Creates a new notice.
- `PATCH /api/v1/notices/:id` *(Admin-Only)*: Edits an announcement/notice.
- `DELETE /api/v1/notices/:id` *(Admin-Only)*: Soft-deletes/deactivates a notice.

#### B. User & Block Coordinator Management (`/api/v1/users`)
- `GET /api/v1/users` *(Admin-Only)*: Lists all platform users.
- `POST /api/v1/users` *(Admin-Only)*: Registers a new block coordinator and associates a block name.
- `PATCH /api/v1/users/:id` *(Admin-Only)*: Updates user profile parameters, locks status, or alters block access limits.
- `DELETE /api/v1/users/:id` *(Admin-Only)*: Soft-deletes user session profiles.

---

## 4. Proposed Implementation Phases

### Phase 1: Layout & Sidebar Shell
- Update `Navbar.tsx` and `Footer.tsx` path checks to hide on `/admin` pages.
- Create unified `src/app/admin/layout.tsx` wrapper displaying a secure navigation sidebar.
- Implement session routing guards and loading icons.

### Phase 2: Schema Expansion & Notices Database Migration
- Add `Notice` model definitions inside `schema.prisma`.
- Run database migrations to provision tables.
- Refactor the seed script to mock notice records and dummy shareholder applications for testing.

### Phase 3: Backend API Implementations
- Set up Express routes and schema schemas for the Notices API.
- Set up Express routes and schemas for the Coordinator manager API.
- Integrate audit log recording for both notice and coordinator lifecycle updates.

### Phase 4: Dynamic Admin Notices Dashboard
- Build notice listing grid with action controls (Add Notice, Edit Notice, Deactivate).
- Create notice composer forms supporting file attachments and category selectors.
- Connect frontend components to notices endpoints.

### Phase 5: Coordinator Management View (Admin-only)
- Construct administrative view for managing users.
- Implement forms for coordinator creation, block allocation dropdowns, and password reset requests.
- Verify block scoping rules to prevent access violations.

### Phase 6: Application Review Details & Document Previewing
- Update application detail layout cards.
- Implement in-browser document previews for verified files.
- Enable coordinator review logs tracking within application details.

### Phase 7: Verification & Production Rollout
- Execute TypeScript build checks and lint verification processes.
- Run complete test suite and record validation.
