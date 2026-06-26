# Project Status

> **Last Updated**: 2026-06-26
> **Last Verified Build**: 2026-06-26 — Frontend: `npm run lint` ✅ | `npm run build` ✅ (24/24 pages) | Backend: `npm run lint` ✅ | `npm run build` ✅ | `npx prisma validate` ✅ | `run-all-tests.ts` ✅ (4/4 integration suites passed)

---

## What is Currently Live and Working

### Pages & Routes

| Route | Status | Description |
|-------|--------|-------------|
| `/` | ✅ Working | Homepage — Hero, Mission, Stats, Core Pillars, Services Preview, Notices Slider, Shareholder Section, Leadership Preview, Roadmap Preview, CTA |
| `/about` | ✅ Working | About APC — history, mission, vision, governance, timeline |
| `/services` | ✅ Working | Physical services listing page |
| `/digital` | ✅ Working | Digital services catalog — search autocomplete, filter panel, sort selector, service cards |
| `/digital/services/[slug]` | ✅ Working | Individual service detail pages (SSG via `generateStaticParams`) |
| `/book` | ✅ Working | Digital service booking wizard — multi-step, WhatsApp submission |
| `/contact` | ✅ Working | Contact page with WhatsApp and phone CTAs |
| `/join` | ✅ Working | Shareholder membership portal — 9-step wizard, document upload, PDF generation, success dashboard |
| `/leadership` | ✅ Working | Board of directors |
| `/notices` | ✅ Working | Notices and updates listing |
| `/roadmap` | ✅ Working | Company roadmap (7 phases) |
| `/api/digital/search` | ✅ Working | Dynamic search API route — Levenshtein scoring |
| `[backend] /health` | ✅ Working | API health endpoint (verifies database & storage connection) |
| `[backend] /version` | ✅ Working | API version metrics (version, build, environment) |
| `[backend] /api-docs` | ✅ Working | Swagger OpenAPI 3.0 API documentation UI |
| `[backend] /api/v1/auth/login` | ✅ Working | User login with sequential IP & Email brute-force rate limiters, Bcrypt to Argon2id progressive upgrade |
| `[backend] /api/v1/auth/refresh` | ✅ Working | Token refresh rotation (RTR) and reuse revocation theft protection |
| `[backend] /api/v1/auth/logout` | ✅ Working | Revoke active refresh token and clear HTTP-only cookie |
| `[backend] /api/v1/auth/me` | ✅ Working | Fetch authenticated user details gated by JWT authMiddleware |
| `[backend] /api/v1/applications` | ✅ Working | Submit shareholder application (public POST) |
| `[backend] /api/v1/applications` | ✅ Working | List applications (GET, gated, block-scoped for coordinators) |
| `[backend] /api/v1/applications/:id` | ✅ Working | Retrieve single application details (GET, gated, decrypted) |
| `[backend] /api/v1/applications/:id/documents` | ✅ Working | Secure document upload endpoint (multipart POST, S3 storage, JWT & secure uploadToken verification) |
| `[backend] /api/v1/applications/stats` | ✅ Working | Retrieve dashboard status statistics scoped by block for coordinators |
| `[backend] /api/v1/applications/:id/status` | ✅ Working | Update application review status and feedback notes with strict transition checks and block scoping |
| `[backend] /api/v1/audit-logs` | ✅ Working | Paginated retrieve system audit logs, block-scoped for coordinators |

### Features

| Feature | Status | Notes |
|---------|--------|-------|
| Shareholder Application Wizard | ✅ Complete | 9 steps: Identity → Address → Eligibility → Shares → Nominee → Bank → Upload → Review → Declaration |
| Document Upload (Step 7) | ✅ Complete | 5 documents in 4 groups; format/size validation; thumbnails; replace/remove |
| Application Review (Step 8) | ✅ Complete | Structured review grid; inline Edit buttons preserve all state |
| Application Summary PDF | ✅ Complete | jsPDF 2-page A4 receipt generated on submission; stored in memory; download on demand |
| WhatsApp Submission | ✅ Complete | Full structured application including document filenames sent as WhatsApp deep link |
| Success Dashboard | ✅ Complete | Application ID, timestamp, 5-step onboarding timeline, 4 action buttons |
| Digital Service Search | ✅ Complete | Levenshtein typo-tolerance, intent-based scoring, autocomplete |
| Service Discovery Filters | ✅ Complete | Category, status, price range, processing time, tags |
| Digital Booking Wizard | ✅ Complete | Multi-step drawer, WhatsApp submission |
| WhatsApp Button | ✅ Complete | Floating global button; hidden when mobile menu is open |
| Navbar | ✅ Complete | Desktop + mobile menu; "Become a Shareholder" CTA |
| Quick Summary Cards | ✅ Complete | 5 info cards on `/join` |
| Collapsible Info Hub | ✅ Complete | Benefits, Eligibility, Process, Documents, FAQ — collapsed by default |
| Request Tracing | ✅ Complete | Unique Request ID generated per query and stored in context and headers |
| Structured Logging | ✅ Complete | Winston logger setup to pipe console logs and trace Request IDs |
| API Docs Integration | ✅ Complete | Swagger UI compiled statically via OpenAPI config |
| Staff & Admin Authentication | ✅ Complete | JWT + Refresh Token Rotation (RTR) with HTTP-only, secure, SameSite=Strict cookies |
| Brute-Force Rate Limiting | ✅ Complete | Double protection applying sequential IP-based and Email-based rate limiters |
| Progressive Hashing Upgrade | ✅ Complete | Automatic rehashing of legacy Bcrypt user password hashes to Argon2id upon login |
| Auth Audit Logging | ✅ Complete | Records login successes, failures, logouts, refreshes, and reuse detections in database |
| Applications Persistence API | ✅ Complete | Inserts application and related activities with AES-256-GCM column encryption and Aadhaar checks |
| Block-Scoped Access Control | ✅ Complete | Restricts coordinators to assigned block applications; staff blocked, admin unlimited |
| Secure S3 Document Upload | ✅ Complete | Multipart file parsing (multer), S3 object storage (MinIO), SHA-256 checksums, and async mock virus scanning |
| Admin Status Transitions & Scoping | ✅ Complete | Validates transition map, updates reviewedAt, and writes status update AuditLog snapshots in a transaction |
| Scoped Dashboard Stats | ✅ Complete | Dynamic statistics grouped by status, block-scoped to coordinator's block |
| Scoped Audit Logs Query | ✅ Complete | Paginated system audit log retrieval, block-scoped to coordinator's block |

---

## Current Architecture Constraints

These are **intentional interim designs**, not bugs. See [`DECISIONS.md`](./DECISIONS.md) for the reasoning behind each.

| Constraint | Interim Approach | Future Approach |
|-----------|-----------------|----------------|
| No backend | WhatsApp deep links for form submissions | Node.js + Prisma + PostgreSQL (Phase 7) |
| No file storage | Files validated/previewed client-side; filenames sent via WhatsApp | Server-side file upload with cloud storage (Phase 7) |
| No authentication | Resolved in Phase 7B | Admin authentication via JWT and Refresh Cookies implemented |
| No server-generated IDs | `APC-YYYY-XXXXXX` generated client-side in `src/lib/application-id.ts` | Server-generated UUID (Phase 7) |
| No analytics | `console.log` placeholders in `src/components/digital/Search.tsx` | Real telemetry pipeline (TBD) |

---

## Pending Placements (Action Required)

| Item | Status | Action |
|------|--------|--------|
| Official APC paper application form | ⏳ Not placed | Place PDF at `public/documents/apc-shareholder-application.pdf` |

---

## Known Technical Debt

| Item | Location | Severity |
|------|----------|---------|
| Console analytics logger | `src/components/digital/Search.tsx` | Low — replace with real telemetry |
| Temporary Application ID generator | `src/lib/application-id.ts` | Low — replace with server ID in Phase 7 |
| Search typo threshold is static | `src/lib/search.ts` | Low — make configurable for large datasets |
| No search result pagination | `src/hooks/useServiceDiscovery.ts` | Low — needed when > ~100 services |

---

## Last Completed Phase

**Phase 8 — Frontend Integration (Milestone 3: Authentication & Session Management)** (completed 2026-06-26)

- Developed administrative login page (`/admin/login`) center-aligning the card layout and styling validation checks.
- Integrated the login form submission with backend `POST /api/v1/auth/login` to securely store JWT tokens and profile states in `AuthContext`.
- Implemented dashboard session guards (`/admin/dashboard`) displaying coordinator credentials (name, email, role, block) and securing logout flows.
- Validated automatic session recovery and refresh rotation controls (RTR) on initial reload.
- Guarded routes by redirecting authenticated users away from the login page and unauthenticated users away from the dashboard edge.

**Phase 8 — Frontend Integration (Milestone 2: Public Applicant Flow)** (completed 2026-06-25)

- Connected shareholder registration `/join` form submission to live `POST /api/v1/applications` endpoint.
- Developed sequential document upload queue to S3 via `/applications/:id/documents` utilizing unique `uploadToken` authorization headers and the database application UUID.
- Integrated upload queue status lists with progress loaders and error trackers.
- Engineered partial-failure retry support ("Retry Failed Uploads") so network dropouts do not force full form resubmissions.
- Prevented double application triggers by blocking submission buttons and intercepting page navigation alerts during active uploads.
- Gated summary receipt PDF compilation and success timeline renders to fire only after every document finishes uploading.

**Phase 8 — Frontend Integration (Milestone 1: Core Infrastructure)** (completed 2026-06-25)

- Implemented React-independent `api-client.ts` fetch wrapper with dynamic JWT Bearer authorization, AbortController timeouts (30s), and credentials tracking for Secure cookie transport.
- Created `AuthContext` and hooks context provider syncing frontend sessions with background refresh tokens rotation.
- Created Next.js edge request routing `middleware.ts` to gate access to all `/admin` dashboard routes.
- Hooked the layout wrapper to the authentication provider.

**Phase 7F — Backend Hardening, Production Readiness, and Final Verification** (completed 2026-06-25)

- Configured dynamic CORS origin validation using comma-separated list of values in `CORS_ORIGIN`.
- Implemented configurable global rate limiting (`GLOBAL_RATE_LIMIT`, default 500) and strict public submissions rate limiters (`submitRateLimiter`, max 10 per hour per IP).
- Hardened the `GET /health` route to perform active bucket checks using S3 `HeadBucketCommand`.
- Created a secure PostgreSQL backup script `src/scripts/backup-db.ps1` with Windows ACL permissions controls and a 7-day retention sweep.
- Developed multi-stage production `Dockerfile` and a production-grade container setup in `docker-compose.prod.yml`.
- Implemented a unified master integration test runner (`run-all-tests.ts`) executing all 4 backend integration scripts in sequence with automated bypass mechanisms.

**Phase 7E — Admin APIs** (completed 2026-06-25)

- Validate and persist shareholder application status transitions (`PATCH /api/v1/applications/:id/status`) enforcing strict transition rules and setting `reviewedAt`.
- Implement coordinator block scoping restrictions (coordinators restricted to their assigned geographical block, admins unrestricted).
- Generate detailed audit log change snapshots (`before` and `after` status/notes) persisted inside a Prisma database transaction.
- Aggregate status count metrics (`GET /api/v1/applications/stats`) with coordinator block-level scoping.
- Query paginated and filtered system audit logs (`GET /api/v1/audit-logs`) block-scoped for coordinators.
- Program a comprehensive integration test suite (`test-admin-apis.ts`) verifying transition paths, status filters, and scoping limits.

**Phase 7D — Documents API** (completed 2026-06-24)

- Configure AWS S3 Client with local MinIO settings and forcePathStyle enabled
- Automatically check and create S3 bucket (`apc-supporting-documents`) on server startup
- Implement secure document upload endpoint (`POST /api/v1/applications/:id/documents`)
- Add secure token authorization model for applicants (signed JWT `uploadToken`) to protect ownership
- Enforce block-scoped uploads for coordinators and unrestricted access for admins
- Integrate Winston logger for tracking virus scan status transitions from `PENDING` to `CLEAN`

**Phase 7C — Applications API** (completed 2026-06-22)

- Standalone public applications submission endpoint (`POST /api/v1/applications`)
- Payload verification using Zod matching the 9-step wizard schema
- Secure AES-256-GCM column-level encryption for Aadhaar, PAN, and Bank Accounts
- Unique application sequence ID generation (`APC-YYYY-XXXXXX`) with collision retries
- Unique constraint checks on SHA-256 hashed Aadhaar numbers to block duplicates
- Audit logging of application submissions (`APPLICATION_SUBMITTED`)
- Gated administrative endpoints list and details scoped strictly by coordinator Block

**Phase 7B — Authentication** (completed 2026-06-22)

- Password security utility utilizing Argon2id with legacy Bcrypt fallback
- Progressive password upgrades (Bcrypt to Argon2id rehashing upon successful login)
- JWT Access (15-min) and Refresh (7-day) Token signing/verification
- Refresh Token Rotation (RTR) and database hash storage
- Session hijacking mitigation (token reuse revokes all active user sessions)
- Dual login rate limiting by IP and Email address
- Gated API routes middleware (`authMiddleware`, `requireRole`)
- Audit logging of crucial authentication lifecycle events
- Complete backend integration test script (`test-auth.ts`)

**Phase 7A — Backend Foundation** (completed 2026-06-22)

- Standalone Express + TypeScript API setup in `backend/`
- Validated environments loader using Zod
- Winston logger & request tracing middleware with UUID Request IDs
- Base Prisma schema and seeding models for PostgreSQL
- Public heartbeat `/health` and metadata `/version` routes
- Swagger UI OpenAPI integration at `/api-docs`

**Phase 6D Extension — Shareholder Application Wizard** (completed 2026-06-21)

- 9-step application wizard with full validation
- Grouped document upload zones (4 groups, 5 documents)
- Pre-submission application review with inline Edit navigation
- jsPDF 2-page A4 application summary receipt
- Premium success dashboard with 5-step onboarding timeline
- WhatsApp submission with document metadata
- Offline application download card

---

## Last Build Verification

```
Frontend:
npm run lint   → ✅ Zero errors, zero warnings (2026-06-21)
npm run build  → ✅ 22/22 pages generated, zero errors (2026-06-21)

Backend:
npm run lint   → ✅ Zero errors, zero warnings (2026-06-25)
npm run build  → ✅ Compiled successfully with zero errors (2026-06-25)
```

---

## Production URL

Configured in `src/app/layout.tsx` → `metadata.metadataBase`. Updated here after deployment is confirmed.
