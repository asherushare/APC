# Implementation Plan — Phase 8, Milestone 5: Application Details & Document Viewer

> **Status:** Planning (pending approval) · **Pre-condition:** Phase 8 Milestone 4 ✅ met · **Scope:** Admin/Coordinator only · **No code written yet.**

## 1. Goal

Deliver a read-only application detail screen and a secure document viewer that let an
authenticated ADMIN or COORDINATOR (block-scoped) inspect a shareholder application,
preview/download its uploaded documents, advance its status with review notes, and review
its status-transition history — all behind the existing auth + block-scope guards.

New route: **`/admin/applications/[id]`**

## 2. API Audit (verified against current backend)

### 2.1 Reusable as-is — no changes required

| Endpoint | Controller | Purpose in this milestone |
| --- | --- | --- |
| `GET /applications/:id` | `getApplicationDetails` | Fetch full decrypted application record (personal, contact, share, address, producer activities). |
| `PATCH /applications/:id/status` | `updateApplicationStatus` | Status transition + `reviewNotes`, allowed-transition validation, and automatic audit logging. |
| `GET /audit-logs?page=&limit=` | `getAuditLogs` | Paginated system activity. `AuditLogsTable` already renders status-change diffs (`before.status` → `after.status` + `reviewNotes`). |

### 2.2 Backend gaps requiring minimal change

These are necessary because the milestone mandates document **download/preview**, and documents
are stored in private S3/MinIO and contain sensitive PII (Aadhaar, PAN, photo). There is no
secure public-read alternative, so a server-mediated, short-lived URL is the only acceptable
pattern. No new endpoints beyond the one retrieval route; **no Prisma schema changes**.

**Gap 1 — `getApplicationDetails` omits the `documents` relation.**
- *Change:* add `documents: { orderBy: { uploadedAt: 'asc' } }` to the existing Prisma `include`.
- *Why:* the detail screen must list uploaded documents (type, original filename, size, uploadedAt) without a second round-trip.
- *Risk:* none — relation already exists; read-only include.

**Gap 2 — No way to retrieve a document.**
- *Change A:* add a `getPresignedDownloadUrl(s3Key, opts)` helper to `backend/src/utils/s3.ts` (mirrors the existing `uploadToS3` shape, short TTL).
- *Change B:* add one route `GET /applications/:id/documents/:documentId/download` to `documents` router/controller returning `{ success: true, url, expiresIn }`.
- *Guarding:* reuse `authMiddleware` + `requireRole([ADMIN, COORDINATOR])` + the existing application-ownership / block-scope check already used by `getApplicationDetails`/`updateApplicationStatus`. Validate the document belongs to `:id`.
- *Why minimal:* one endpoint, one helper, no schema change, no new auth model. Frontend opens the returned URL in a new tab for both inline preview and download (browser handles content-type).

**Gap 3 (verification only) — audit-logs filtering for transition history.**
- The detail screen's status-history panel will reuse `GET /audit-logs` filtered to this application. If the controller already accepts a `targetId`/`targetEntity` query param, reuse it directly. If not, add the query param to the existing handler (parameter addition, **not** a new endpoint). To be confirmed at the start of Task 1.

## 3. Frontend Architecture

Route: `src/app/admin/applications/[id]/page.tsx` (Next.js App Router dynamic segment).

**Data flow**
1. Page gate: `useAuth()` → redirect to `/admin/login` if unauthenticated (mirrors `/admin/dashboard`).
2. On mount: `GET /applications/:id`.
   - On `ForbiddenError`/`NotFound` → render an access-denied / not-found state (no data exposed).
3. Render `ApplicationDetails` (left/primary) + `StatusControls` + `DocumentViewer` + status-history panel.
4. Status-history: `GET /audit-logs?…&targetId=<id>` (or application-scoped slice) → feed `AuditLogsTable` (reused) or a compact read-only variant.
5. Document action: `GET /applications/:id/documents/:documentId/download` → `window.open(url, '_blank', 'noopener')`.

**State (single page-level orchestrator, no global store)**
- `application` (detail record), `isLoading`, `error`, `notFound/forbidden`.
- `statusUpdate` form state (`newStatus`, `reviewNotes`), `isSubmitting`, `statusError`.
- `history` (audit slice), `isHistoryLoading`.
- After a successful `PATCH /status`: optimistic refresh of `application.status` + re-fetch history slice (the PATCH already writes the audit row server-side).

## 4. Component Breakdown (modular, reusable)

All under `src/components/sections/admin/`, matching existing card styling
(`rounded-3xl border border-outline-variant/30 shadow-md bg-white`), `Container`, and the
`text-label-sm uppercase tracking-widest` header idiom used by `ApplicationsTable`/`AuditLogsTable`.

| Component | Responsibility | Reuse / notes |
| --- | --- | --- |
| `ApplicationDetails.tsx` | Renders applicant identity, contact, share/equity, address, producer activities. Field-grouped cards. | Pure presentational. Field labels per `GLOSSARY.md`. |
| `DocumentViewer.tsx` | Lists documents (type badge, name, size, uploadedAt); each row opens the presigned URL. Handles per-file loading + error. | Calls the download endpoint via `apiRequest`. Extracts shared `statusBadge`/`formatStatus`/`formatDate` helpers into a `formatUtils.ts` (also adopted retroactively by `ApplicationsTable`). |
| `StatusControls.tsx` | Status dropdown (allowed next states only) + `reviewNotes` textarea + submit. Disabled while submitting; success/error feedback. | Wraps `PATCH /applications/:id/status`. Allowed transitions sourced from the backend validation contract. |
| `ApplicationStatusHistory.tsx` | Read-only vertical timeline of status transitions from the audit slice. | Thin wrapper over the `AuditLogsTable` change-rendering logic, scoped to this application. |
| `formatUtils.ts` (new shared module) | `formatStatus`, `statusBadgeClass`, `formatDate`, `formatDateTime`, `formatFileSize`. | Eliminates duplication across `ApplicationsTable`, `AuditLogsTable`, and the new components. |

**Dashboard wiring (1-line change):** `src/app/admin/dashboard/page.tsx` replaces the `console.log`
placeholder in `onViewDetails` with `router.push(`/admin/applications/${id}`)`. No other dashboard changes.

## 5. Data Contracts (frontend types — new `src/types/admin.ts`)

Co-located with the existing `src/types/*` modules. Types are derived strictly from the
verified backend response shapes (`ApplicationRecord`, decrypted fields, `Document` model,
`AuditLogRecord`).

```ts
// ApplicationDetail — superset of ApplicationRecord incl. decrypted + relations
interface ApplicationDetail extends ApplicationRecord {
  aadhaarNumber: string;       // decrypted server-side
  panNumber: string;           // decrypted server-side
  bankAccount?: { ... };       // decrypted server-side
  producerActivities: ProducerActivity[];
  documents: ApplicationDocument[];
}

interface ApplicationDocument {
  id: string;
  documentType: string;        // e.g. AADHAAR, PAN, PHOTO
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
}

interface StatusUpdatePayload {
  status: ApplicationStatus;
  reviewNotes?: string;
}

type ApplicationStatus =
  | 'SUBMITTED' | 'DOCUMENTS_PENDING' | 'UNDER_REVIEW'
  | 'PAYMENT_PENDING' | 'PAYMENT_CONFIRMED' | 'APPROVED' | 'REJECTED';
```

Exact field names (e.g. snake vs camel) finalized in Task 1 against the Prisma model and the
`getApplicationDetails`/`Document` response.

## 6. Security & Access Control

- Auth: `useAuth()` gate + redirect; all calls carry the JWT via `apiRequest`.
- Authorization: enforced server-side by `requireRole([ADMIN, COORDINATOR])` on every reused + new endpoint.
- Block-scoping: COORDINATOR may only see applications whose `block === user.block`; ADMIN is unrestricted. Relies on the existing block-scope guard inside `getApplicationDetails`/`updateApplicationStatus`; the new download route reuses the same guard.
- PII: Aadhaar/PAN/bank are decrypted **only** on the server in `getApplicationDetails` and rendered in the detail view for authorized roles only — never logged.
- Documents: served only via short-TTL presigned GET URLs; keys never exposed to the client; `window.open` uses `noopener`.
- Audit: every status change already produces an audit row server-side (no client trust).

## 7. Out of Scope (deferred — record in roadmap)

- Editing application fields (read-only detail in this milestone).
- Bulk status actions, CSV export.
- In-app PDF/image rendering beyond browser native preview.
- Coordinator mobile app (Phase 10).

## 8. Automated Verification Plan

Backend (`backend/`):
- `npm run lint` — ESLint clean.
- `npm run build` — `tsc` compile clean (incl. new `s3.ts` helper + new controller method/route).
- `npx prisma validate` — schema unchanged (regression only).
- Existing integration suites remain green (no route regressions).
- New unit/integration coverage for the download route: auth required → 401; forbidden role → 403; cross-block coordinator → 403; document not belonging to application → 404; happy path returns `{ success, url, expiresIn }` with a presigned URL.

Frontend (`apc-website/`):
- `npm run lint` — ESLint clean.
- `npm run build` — Next.js build green; new dynamic route `/admin/applications/[id]` compiles; total page count increments by 1.
- Type-check passes with new `src/types/admin.ts`.

## 9. Manual Verification Plan

Prerequisite: a seeded application with ≥1 uploaded document, plus one ADMIN and one COORDINATOR (different block) account.

| # | Scenario | Expected result |
| --- | --- | --- |
| 1 | Unauthenticated → open `/admin/applications/<id>` | Redirected to `/admin/login`. |
| 2 | ADMIN opens a submitted application | Detail renders all sections; documents listed; status controls enabled. |
| 3 | Click a document's "View" | New tab opens the file (image/PDF inline, others download). |
| 4 | Advance status (e.g. SUBMITTED → DOCUMENTS_PENDING) with a note | Status updates; success banner; new entry appears in history panel. |
| 5 | Invalid transition attempt | Backend rejects; inline error shown; status unchanged. |
| 6 | COORDINATOR opens an application in their block | Full read + status controls (per role policy). |
| 7 | COORDINATOR opens an application in a different block | 403 → access-denied state; no PII exposed. |
| 8 | Open a non-existent `:id` | Not-found state. |
| 9 | "View Details →" from dashboard table | Navigates to the correct detail page. |
| 10 | Network failure during status update | Inline error; optimistic state rolled back; no partial update. |

## 10. Sequencing & Dependencies

Backend gaps (§2.2) are unblocked first (Task 1), since the frontend's document list/preview and
the detail include depend on them. Shared `formatUtils.ts` (Task 3a) precedes the presentational
components. The dashboard wiring (Task 5) is last and is a single-line change.

See `task.md` for the ordered task list.
