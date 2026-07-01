# Task List — Phase 8, Milestone 5: Application Details & Document Viewer

> **Plan of record:** `AI/implementation_plan.md`
> **Do not start implementation until the plan is approved.**
> Tasks are ordered by dependency. Each task has explicit acceptance gates; do not mark complete until its gate passes.

---

## Task 1 — Backend: minimal document-retrieval support  `[backend]`

**Files (expected):**
- `backend/src/utils/s3.ts` — add `getPresignedDownloadUrl(s3Key, opts)`.
- `backend/src/controllers/documents.ts` — add `getApplicationDocumentDownload` controller method.
- `backend/src/routes/documents.ts` — mount `GET /applications/:id/documents/:documentId/download` (under existing `authMiddleware` + `requireRole([ADMIN, COORDINATOR])` group).
- `backend/src/controllers/applications.ts` — in `getApplicationDetails`, add `documents` to the Prisma `include` (`orderBy: { uploadedAt: 'asc' }`).
- *(Parameter only, if needed)* `backend/src/controllers/audit.ts` — accept `targetId`/`targetEntity` query params on `getAuditLogs` for app-scoped history (verify first; add only if absent).

**Constraints:**
- Reuse the existing block-scope/ownership guard pattern already present in `getApplicationDetails` and `updateApplicationStatus` for the new download route.
- Validate `documentId` belongs to application `:id`; else 404.
- Presigned URL TTL: short (e.g. 5–15 min), configurable via existing env pattern.
- **No Prisma schema changes. No new auth model. No public bucket policy.**

**Acceptance gate:**
- [x] `npm run lint` clean.
- [x] `npm run build` clean.
- [x] `npx prisma validate` clean (schema unchanged).
- [x] New/updated integration tests pass: 401 unauth, 403 wrong role, 403 cross-block coordinator, 404 mismatched document, 200 happy path returning `{ success, url, expiresIn }`.
- [x] Existing integration suites remain green.

---

## Task 2 — Frontend types & API client surface  `[frontend]`

**Files (expected):**
- `src/types/admin.ts` — `ApplicationDetail`, `ApplicationDocument`, `StatusUpdatePayload`, `ApplicationStatus` (per plan §5; finalize field names against Task 1 verified shapes).
- `src/types/index.ts` — re-export `admin.ts` (match existing barrel pattern).
- *(If `api-client.ts` needs a typed wrapper for the new download route)* add a thin helper; otherwise reuse `apiRequest` directly in components.

**Constraints:** Types derived strictly from backend response shapes; no speculative fields. Aadhaar/PAN/bank typed as decrypted strings (server decrypts).

**Acceptance gate:**
- [x] `npm run lint` clean.
- [x] `tsc`/`npm run build` type-check passes with the new types.
- [x] No runtime behavior changed (types only).

---

## Task 3 — Shared formatting utilities  `[frontend]`

**Files (expected):**
- `src/lib/formatUtils.ts` — `formatStatus`, `statusBadgeClass`, `formatDate`, `formatDateTime`, `formatFileSize`.
- `src/components/sections/admin/ApplicationsTable.tsx` — replace local `statusBadge`/`formatStatus`/`formatDate` with imports (behavior identical).
- `src/components/sections/admin/AuditLogsTable.tsx` — replace local `formatDate` with import (behavior identical).

**Constraints:** Pure functions, zero side effects. No visual/behavioral change to existing tables — this is a dedup refactor enabling reuse.

**Acceptance gate:**
- [x] `npm run lint` clean.
- [x] `npm run build` clean.
- [x] Visual parity on `/admin/dashboard` (Applications + Audit Logs tabs) confirmed in manual check.

---

## Task 4 — `ApplicationDetails` component  `[frontend]`

**File (expected):** `src/components/sections/admin/ApplicationDetails.tsx`

**Responsibility:** Presentational render of a single `ApplicationDetail` — identity, contact, share/equity summary, address, producer activities. Sensitive fields (Aadhaar/PAN/bank) shown only for authorized display; grouped into the existing card idiom.

**Constraints:** Pure presentational (no fetching); receives `application` + optional `isLoading`/`error` props. Field labels per `GLOSSARY.md`. Uses shared `formatUtils`.

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean.
- [x] Renders all sections for a fully-populated record; renders gracefully for sparse records (no crashes on optional fields).

---

## Task 5 — `DocumentViewer` component  `[frontend]`

**File (expected):** `src/components/sections/admin/DocumentViewer.tsx`

**Responsibility:** List `application.documents`; per-row type badge, original name, size (`formatFileSize`), uploaded date. "View" action → `GET /applications/:id/documents/:documentId/download` via `apiRequest` → `window.open(url, '_blank', 'noopener')`. Per-file loading + error states; empty state when no documents.

**Constraints:** No document bytes handled client-side; only the short-lived URL is opened. Keys/PII never logged. Errors surfaced inline (reuse dashboard error-banner idiom).

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean.
- [x] Empty state, loading state, error state, and happy-path open-in-new-tab all verified manually.

---

## Task 6 — `StatusControls` component  `[frontend]`

**File (expected):** `src/components/sections/admin/StatusControls.tsx`

**Responsibility:** Dropdown of allowed next statuses + `reviewNotes` textarea + submit button. Submits `PATCH /applications/:id/status` via `apiRequest`. Disabled while submitting; inline success/error feedback. On success: calls `onStatusChanged(newStatus)` so the page can refresh the record + history slice.

**Constraints:** Allowed transitions sourced from the backend validation contract (no client-enforced business rules beyond disabling obviously-invalid options for UX). `reviewNotes` optional unless the backend requires it for a given transition.

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean.
- [x] Happy-path status change reflects immediately; invalid transition shows backend error inline; concurrent-submit prevented (button disabled).

---

## Task 7 — `ApplicationStatusHistory` panel  `[frontend]`

**File (expected):** `src/components/sections/admin/ApplicationStatusHistory.tsx`

**Responsibility:** Read-only vertical timeline of status transitions for this application, sourced from `GET /audit-logs?…&targetId=<id>` (or app-scoped slice per Task 1). Reuses the change-rendering logic from `AuditLogsTable` (before→after status + reviewNotes).

**Constraints:** Read-only. If the existing `AuditLogsTable` can be reused verbatim with a scoped fetch, prefer that over a new component (decide at implementation time; the plan lists it separately for clarity).

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean.
- [x] Shows chronological transitions with actor, timestamp, before→after, and notes; empty state when no history.

---

## Task 8 — Detail page orchestrator  `[frontend]`

**File (expected):** `src/app/admin/applications/[id]/page.tsx`

**Responsibility:** Next.js dynamic route. Auth gate via `useAuth()` (redirect to `/admin/login` when unauthenticated — mirror `/admin/dashboard`). On mount fetch `GET /applications/:id`; handle 403 (access-denied state) and 404 (not-found state). Compose `ApplicationDetails` + `DocumentViewer` + `StatusControls` + `ApplicationStatusHistory`. On status change: re-fetch detail + history slice.

**Constraints:** Single page-level state (per plan §3). Full-screen spinner while `isAuthLoading`. No global store. Back-link to `/admin/dashboard`.

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean; new route compiles; total page count +1.
- [x] All 10 manual-verification scenarios in `implementation_plan.md` §9 pass.

---

## Task 9 — Dashboard wiring  `[frontend]`

**File (expected):** `src/app/admin/dashboard/page.tsx`

**Responsibility:** Replace the `onViewDetails` `console.log` placeholder with `router.push(`/admin/applications/${id}`)`.

**Constraints:** Single-line behavioral change; remove the placeholder comment. No other dashboard changes.

**Acceptance gate:**
- [x] `npm run lint` + `npm run build` clean.
- [x] "View Details →" navigates to the correct detail page (manual scenario #9).

---

## Task 10 — Final verification & documentation update  `[process]`

**Responsibility:** Run the full automated + manual verification suites (plan §8, §9). Then, only after all gates pass, update project tracking docs in the established format:
- `AI/changelog.md` — add Phase 8 Milestone 5 entry.
- `AI/STATUS.md` — mark milestone complete; bump verified-build record.
- `AI/roadmap.md` — advance the Phase 8 / next-milestone pointer (and reconcile the Phase 8 "Planned" inconsistency noted in the prior audit, if still present).
- `AI/next-task.md` — set to the next milestone (Phase 8 Milestone 6 or Phase 9 entry point, per roadmap).

**Constraints:** Documentation updates happen **only after** all code gates pass — never before. No edits to source after this point except fixes surfaced by verification.

**Acceptance gate:**
- [x] Backend: lint + build + prisma validate + integration tests green.
- [x] Frontend: lint + build green; new route present.
- [x] All 10 manual scenarios pass.
- [x] Tracking docs updated consistently (changelog ↔ STATUS ↔ roadmap ↔ next-task).
