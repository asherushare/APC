# Architecture Decision Records (ADRs)

This file records every major engineering decision made for the APC project and the reasoning behind it. It exists to prevent future sessions from unknowingly reversing a deliberate choice.

**Rules**:
- Entries are never edited retroactively. If a decision changes, a new ADR supersedes the old one.
- Every significant technology choice, architectural pattern, or intentional constraint must have an entry here.
- Link to this file from `instructions.md` — all AI tools must read it before changing architecture.

---

## ADR-001: WhatsApp as Interim Backend for Form Submissions

**Date**: 2026-06-01 (estimated)
**Status**: Accepted — will be superseded by ADR-008 implementation in Phase 7

**Context**:
The APC website requires two types of form submissions: digital service bookings and shareholder membership applications. A full backend (database, authentication, file storage, admin dashboard) is planned but requires significant time and infrastructure to build correctly.

**Decision**:
Use WhatsApp deep links (`https://wa.me/...?text=...`) as the submission channel. User input is compiled into a structured, human-readable text message via `src/lib/whatsapp.ts` and `src/lib/membership.ts`. The user opens their WhatsApp app and sends the pre-filled message to the APC support number. APC staff process it manually.

**Consequences**:
- Zero backend infrastructure required for launch
- Staff can respond immediately via WhatsApp (which they already use)
- No server costs, no database maintenance, no authentication complexity
- Submissions are not persisted in a database — they live in WhatsApp chats
- File uploads cannot be sent via WhatsApp deep links — only filenames are included in the message
- This is a temporary solution. Phase 7 will replace it with a real backend.

**Do not attempt to replace this with Firebase, Supabase, or any other BaaS without explicit approval.** See ADR-008 for the confirmed replacement plan.

---

## ADR-002: Next.js App Router over Pages Router

**Date**: 2026-06-01 (estimated)
**Status**: Accepted

**Context**:
Next.js offers two routing systems: the legacy Pages Router and the modern App Router (introduced in Next.js 13, stable in 14+).

**Decision**:
Use the App Router exclusively. All pages live in `src/app/`. No Pages Router files.

**Consequences**:
- Server Components by default — better performance for static pages
- Layouts are composable and nested
- Metadata API is cleaner (export `metadata` or `generateMetadata`)
- `loading.tsx`, `error.tsx`, and `not-found.tsx` conventions
- Some third-party libraries may not yet support Server Components — must verify before adding
- AI tools trained on Pages Router patterns may generate incorrect code. Always check `AGENTS.md` and read Next.js 16 docs.

---

## ADR-003: Tailwind CSS v4 over CSS Modules or Styled Components

**Date**: 2026-06-01 (estimated)
**Status**: Accepted

**Context**:
The project needed a styling approach that allows rapid development, maintains consistency, and supports a design token system.

**Decision**:
Use Tailwind CSS v4 with `@import "tailwindcss"` in `globals.css`. All design tokens are defined via `@theme inline {}` in the same file. Custom utility classes (`.saura-pattern`, `.glass-card`, etc.) are also defined in `globals.css`.

**Consequences**:
- All styles are co-located with components — no separate CSS files needed
- The design token system (`--color-primary`, `--color-tribal-gold`, etc.) ensures visual consistency
- Tailwind v4 uses a new CSS-first configuration system — different from v3. Arbitrary `tailwind.config.js` patterns from training data may not apply. Always verify against the installed version.
- Custom classes that cannot be expressed as Tailwind utilities must be added to `globals.css`

---

## ADR-004: Static Data Separated from Components into `src/data/`

**Date**: 2026-06-01 (estimated)
**Status**: Accepted

**Context**:
Initial prototypes hardcoded data arrays directly inside components. This made components hard to maintain, prevented data reuse, and mixed concerns.

**Decision**:
All static data (service lists, director profiles, roadmap phases, notices, FAQ items, etc.) lives as typed TypeScript exports in `src/data/`. Components import data as props or module imports. Data is never defined inline in JSX.

**Consequences**:
- Data can be updated in one place without touching UI components
- TypeScript interfaces in `src/types/` enforce data shape across all consumers
- When a real backend is integrated, only the `src/data/` files need to change — components remain untouched
- The `src/data/digital/services/` directory holds individual service definitions, aggregated via `src/data/digital/index.ts`

---

## ADR-005: Service Layer Architecture (`src/lib/`)

**Date**: 2026-06-01 (estimated)
**Status**: Accepted

**Context**:
Business logic (WhatsApp message compilation, search scoring, PDF generation, application ID generation) was initially mixed into component code. This made it impossible to test, reuse, or replace.

**Decision**:
All business logic lives in pure functions in `src/lib/`. These functions have no React dependencies — they take plain TypeScript data and return plain TypeScript data (or Blobs). Components call these functions but never contain the logic themselves.

**Consequences**:
- `submitShareholderApplication()` in `membership.ts` can be replaced with a real API call without changing `JoinFormSection.tsx`
- `searchServices()` in `search.ts` powers both the frontend search UI and the `/api/digital/search` API route
- `generateSummaryPdf()` in `membership.ts` can be moved to a backend PDF service without UI changes
- This decoupling is the primary mechanism for the Phase 7 backend migration

---

## ADR-006: Client-Side Document Uploads (No Storage Backend)

**Date**: 2026-06-21
**Status**: Accepted — interim, will be superseded in Phase 7

**Context**:
The shareholder application wizard (Phase 6D Extension) requires applicants to upload supporting documents (Aadhaar, PAN, photograph, producer proof, bank passbook).

**Decision**:
Files are validated and previewed entirely client-side using browser File APIs (`URL.createObjectURL`, `File.size`, `File.type`). Filenames and metadata (size, MIME type, upload timestamp) are serialised into `UploadedDocumentMetadata` objects and included in the WhatsApp submission message. The actual file bytes are never transmitted.

**Consequences**:
- No file storage infrastructure required
- Coordinators must still collect physical copies or separately request digital files
- The `UploadedDocumentMetadata` interface is designed with a `backendUrl?: string` field so Phase 7 can populate it with a server storage URL without frontend changes
- The UI (file preview, replace, remove) is fully functional and production-quality

---

## ADR-007: Client-Side PDF Generation via jsPDF

**Date**: 2026-06-21
**Status**: Accepted — interim, will be reviewed in Phase 7

**Context**:
After a successful shareholder application submission, the applicant needs a receipt PDF summarising their application details.

**Decision**:
Use `jspdf ^4.2.1` to generate a 2-page A4 PDF entirely in the browser. The PDF is generated immediately on submission (in `submitShareholderApplication()`), stored as a `Blob` in React state, and the "Download Summary" button triggers a programmatic download from the stored Blob. This mirrors the future backend pattern where the server generates the document once and the client downloads it.

**Consequences**:
- No server-side PDF rendering infrastructure required
- PDF is generated once, stored in memory, downloaded on demand (no re-generation on button click)
- `jspdf` uses built-in `helvetica` font — the `₹` (rupee) symbol may render as a fallback character in some PDF viewers. This is a known limitation.
- In Phase 7, `generateSummaryPdf()` in `src/lib/membership.ts` is the only function that needs replacing — no UI changes required

---

## ADR-008: PostgreSQL + Prisma as the Backend Data Layer (Phase 7)

**Date**: 2026-06-21
**Status**: Accepted — planned for Phase 7

**Context**:
Phase 7 will introduce a real backend to replace the WhatsApp submission flow. A database and ORM must be chosen.

**Decision**:
Use **PostgreSQL** as the database and **Prisma ORM** for data access. The backend runtime will be **Node.js** (running as a standalone service or as Next.js API routes). This is the confirmed stack.

**Consequences**:
- Strong typing via Prisma Client (generated from schema, compatible with TypeScript strict mode)
- PostgreSQL supports relational data, JSON columns, and full-text search — all needed for Phase 7+
- Prisma migrations provide a clean schema evolution path
- All existing `src/lib/` functions (`submitShareholderApplication`, `generateSummaryPdf`, etc.) are designed to be replaced with API calls in Phase 7 without changing the UI
- Do not suggest Firebase, MongoDB, Supabase, PlanetScale, or any other database without explicit approval from the project owner

---

## ADR-009: Monorepo Architecture Planned for Phase 7+

**Date**: 2026-06-21
**Status**: Planned — not yet implemented

**Context**:
When the Phase 7 backend is introduced, the repository will contain both a Next.js frontend and a Node.js backend service. Managing them as separate repositories creates synchronisation overhead.

**Decision**:
Migrate to a monorepo structure when Phase 7 begins. Proposed structure:

```
apps/
  web/     Current Next.js frontend
  api/     New Node.js + Prisma backend
packages/
  ui/      Shared component library (future)
  types/   Shared TypeScript interfaces (future)
AI/        Engineering workspace — stays at repository root
```

Tooling TBD at Phase 7 planning (likely `npm workspaces` or `turborepo`).

**Consequences**:
- The `AI/` directory stays at the repository root and covers all apps
- Shared TypeScript types (e.g., `ShareholderApplication`) will move to `packages/types/` and be imported by both `apps/web/` and `apps/api/`
- Current `src/types/` will be progressively migrated
- This ADR should be updated when the monorepo tooling is decided

---

## ADR-010: TypeScript Strict Mode with Zero `any` Tolerance

**Date**: 2026-06-01 (estimated)
**Status**: Accepted

**Context**:
TypeScript's value comes from catching type errors at compile time. Using `any` defeats this entirely.

**Decision**:
`strict: true` in `tsconfig.json`. No `any` type is permitted anywhere in the codebase. If a type is genuinely unknown, use `unknown` and narrow it explicitly. ESLint rules enforce this.

**Consequences**:
- All data flowing through the system is type-safe
- AI-generated code that uses `any` must be rejected and rewritten
- Third-party libraries that return `any` must be wrapped in typed adapter functions
- This is non-negotiable. There are no exceptions.

---

## ADR-011: JWT Access & RTR Cookies Authentication Strategy (Phase 7B)

**Date**: 2026-06-22
**Status**: Accepted

**Context**:
Block coordinators and administrators require secure sessions to access the dashboard. Credentials must be guarded against theft and brute force.

**Decision**:
Use double token authentication:
- **Access Token**: Short-lived (15 minutes), kept only in-memory in the frontend React application.
- **Refresh Token**: Long-lived (7 days), stored in an HTTP-only, secure, SameSite=Strict cookie with token rotation (RTR) enabled.
- **Replay Protection**: The database tracks refresh token hashes; if a refresh token is used twice, it triggers a token-reuse alarm, revoking all active sessions for that user.
- **Lockouts**: Double login protection applying sequential IP-based and Email-based rate limiters, plus progressive password hashing upgrade from Bcrypt to Argon2id upon login.

**Consequences**:
- Reduced XSS session hijacking risks (no tokens in LocalStorage).
- Instant session revocation on replay detection.
- Strong protection against brute-force login attempts.

---

## ADR-012: Database Column-Level Encryption for PII (Phase 7C)

**Date**: 2026-06-22
**Status**: Accepted

**Context**:
Shareholder registration collects highly sensitive Personally Identifiable Information (PII) including Aadhaar numbers, PAN numbers, and Bank Accounts. These must be protected at rest.

**Decision**:
Implement column-level encryption in the Express backend controller before inserting records into the database:
- **Encryption**: Encrypt Aadhaar, PAN, and Bank Account numbers using AES-256-GCM using a 256-bit environment key (`ENCRYPTION_KEY`).
- **Uniqueness Check**: Store a separate SHA-256 hash of the Aadhaar number in a unique column (`aadhaarHash`) to reject duplicate applications without decrypting.
- **Masking**: Store a masked version of the identifiers (e.g., `XXXX-XXXX-1234`) for lists and default views.
- **Decryption**: Decrypt fields only inside specific detail routes gated by strict role checks.

**Consequences**:
- Relational databases remain protected even in the event of an SQL injection or dump.
- Aadhaar/PAN can still be searched via hashes, but are never exposed in raw text.

---

## ADR-013: Supabase Storage Integration (Phase 7D)

**Date**: 2026-06-24
**Status**: Accepted (supersedes ADR-006 client-only uploads and ADR-008 MinIO local upload plans)

**Context**:
Supporting documents (Aadhaar fronts, PAN cards, etc.) must be stored securely. Local storage is fragile, and MinIO complicates cloud deployments.

**Decision**:
Use **Supabase Storage** (via `@supabase/supabase-js`) for cloud file storage. 
- **Upload Token Model**: Anonymous public uploads are authorized using a signed JWT `uploadToken` generated during form submission, tying the upload session to a specific application ID without registration.
- **Virus Scanning**: Spawn a mock background scanning process on upload, transitioning files from PENDING to CLEAN after 5 seconds.

**Consequences**:
- Files are saved directly in cloud buckets on upload.
- Security constraints prevent arbitrary file injections by validating the upload token.

---

## ADR-014: Backend-Mediated Secure Document Download Streaming (Phase 7D / Phase 8)

**Date**: 2026-06-27
**Status**: Accepted

**Context**:
Administrative staff and block coordinators need to preview or download supporting documents. Directly returning storage links (presigned URLs) exposes resource locations and bypasses access control scoping.

**Decision**:
Mediate downloads via the backend Express server. The endpoint `GET /api/v1/applications/:id/documents/:documentId/download` verifies authentication and block boundaries, fetches the file buffer from Supabase Storage internally, and streams it directly to the Express response (attaching the file name in `Content-Disposition` header). No public URLs are ever shared.

**Consequences**:
- Stronger security: files cannot be downloaded without an active, block-scoped session.
- Document location details are fully hidden from the frontend client.

---

## ADR-015: Block-Level Scoping Access Control (Phase 7C / Phase 7E)

**Date**: 2026-06-25
**Status**: Accepted

**Context**:
Coordinators manage applications on a block-by-block basis. A coordinator from Rayagada block should not view or manage applications from Muniguda block.

**Decision**:
Enforce geographical block boundaries in all query query scopes (GET /applications, GET /applications/:id, GET /applications/:id/documents, PATCH /applications/:id/status, GET /audit-logs, and GET /applications/stats).
- **ADMIN**: Unrestricted access, global dropdown filter.
- **COORDINATOR**: Locked to the block string assigned to their user record.
- **STAFF**: Blocked from accessing administrative dashboards.

**Consequences**:
- Clear administrative data separation.
- Coordinators are restricted strictly to their domain.

---

## ADR-016: Server-Side File Signature (Magic Bytes) Validation

**Date**: 2026-07-01
**Status**: Accepted

**Context**:
Relying strictly on the client-supplied `file.mimetype` allows malicious users to bypass upload filters by spoofing headers (e.g. uploading an HTML payload as `image/png` to perform Stored XSS).

**Decision**:
Implement server-side magic byte inspection inside the upload pipeline using the `file-type` library (version `12.4.2` to remain native CommonJS-compatible). Verify that the actual binary magic byte headers of the uploaded buffer match the declared MIME type before saving to storage or database.

**Consequences**:
- Block spoofed file attachments.
- Prevent malicious client HTML/script executions inside the administration application portal context.

---

## ADR-017: Frontend Promise De-duplication in React Context

**Date**: 2026-07-01
**Status**: Accepted

**Context**:
React components restore session profiles from JWTs on initial load or silent token rotation. If token state listener callbacks and initial effects both run concurrently while the user object is unpopulated, they trigger duplicate simultaneous `/auth/me` fetches.

**Decision**:
Implement a request de-duplication mechanism using a React `useRef` to store in-flight `/auth/me` fetch promises. Any concurrent session restoration queries reuse the same active promise, de-duplicating multiple threads into a single HTTP query.

**Consequences**:
- Reduces server database load.
- Prevents concurrent refresh rotation race conditions that trigger RTR reuse flags.


