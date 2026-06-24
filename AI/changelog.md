# Changelog

All notable changes to the Adivasi Producer Company (APC) project are documented in this file in reverse-chronological order.

## 2026-06-24 — Phase 7D: Documents API

### What Changed
- Installed `@aws-sdk/client-s3`, `multer`, and `@types/multer` dependencies in the backend.
- Created S3 utility module (`backend/src/utils/s3.ts`) implementing AWS S3 client wrappers, path-style routing for local MinIO compatibility, object buffer uploads, and automatic target bucket verification/creation on startup.
- Developed upload token utility helpers (`backend/src/utils/auth.ts`) generating and verifying cryptographically signed JWT `uploadToken` objects.
- Updated `submitApplication` controller in `backend/src/controllers/applications.ts` to generate and return `uploadToken` upon successful shareholder application submission.
- Built document upload controller (`backend/src/controllers/documents.ts`) enforcing secure gating: authenticated coordinators are restricted by geographical Block, admins are unrestricted, and public applicants must present a valid signed `uploadToken` matching the application UUID.
- Built document upload router (`backend/src/routes/documents.ts`) configuring `multer.memoryStorage` with a 5MB upload limit and PDF, PNG, JPEG, and WebP file format restrictions.
- Integrated background virus scanner mock logic updating `virusScanStatus` to `CLEAN` after 5 seconds and logging the transition.
- Registered documents upload routes in `backend/src/app.ts` under `/api/v1/applications`.
- Implemented bucket check and creation in `backend/src/server.ts` before HTTP listener starts up.
- Programmed a comprehensive integration test suite (`backend/src/scripts/test-documents.ts`) validating public/admin/coordinator access gates, S3 upload checks, and virus scanner transitions.

### Why
- To enable applicants and coordinators to safely upload supporting onboarding documents to secure storage while strictly gating uploads to authorized entities.

### Decisions Made
- Chose to use JWT-based `uploadToken` generated during form submission to uniquely authorize subsequent public uploads without requiring database schema changes or user log-in sessions for applicants.
- Decided to ignore `backend/**` in root `eslint.config.mjs` since the backend has its own eslint process and compiling typescript to dist javascript shouldn't pollute root eslint checks.

---

## 2026-06-22 — Phase 7C: Applications API

### What Changed
- Created cryptographic utility (`backend/src/utils/crypto.ts`) supporting AES-256-GCM encryption/decryption, SHA-256 Aadhaar hashing, and text masking.
- Created Zod validation schema (`backend/src/schemas/application.ts`) matching the 9-step shareholder wizard details.
- Built applications controller (`backend/src/controllers/applications.ts`) and router (`backend/src/routes/applications.ts`) for submitting, listing, and showing application details.
- Registered applications routes in `backend/src/app.ts` under `/api/v1/applications`.
- Implemented strict block-level access controls scoping coordinators to view applications matching their assigned geographical block only, while admins have global access.
- Implemented transactional sequence generator with retry loop for generating `applicationId` to protect against collision concurrency conflicts.
- Deferred all document uploads, storage keys, S3 operations, and document database persistence to Phase 7D.
- Programmed a comprehensive integration test suite (`backend/src/scripts/test-applications.ts`) validating submission checks, duplicates, and coordinator scoping.

### Why
- To establish secure, encrypted database persistence for tribal shareholder membership applications and enforce administrative scoping protocols.

### Decisions Made
- Scoped coordinators to block levels, blocked staff from viewing data in Phase 7C, and gave admins unrestricted global access.
- Decided to defer document records entirely to Phase 7D (Documents API) to isolate database submission concerns.

---

## 2026-06-22 — Phase 7B: Authentication

### What Changed
- Created password utility (`backend/src/utils/auth.ts`) utilizing `argon2` for Argon2id hashing/verification with transparent `bcrypt` fallback.
- Added automatic password upgrade strategy: progressive migration of legacy Bcrypt user password hashes to Argon2id upon successful login.
- Developed JWT signing and verification helpers for 15-minute Access Tokens and 7-day Refresh Tokens, with SHA-256 hashing for database token storage.
- Integrated `cookie-parser` in `backend/src/app.ts` to manage secure HTTP-only cookies.
- Built authentication endpoints (`backend/src/controllers/auth.ts` and `backend/src/routes/auth.ts`) for `/login`, `/refresh`, `/logout`, and `/me`.
- Implemented Refresh Token Rotation (RTR) with token reuse theft mitigation (instantly revoking all active sessions for a user if an old refresh token is reused).
- Applied double rate-limiting on the login endpoint (IP-based rate limiter and Email-based rate limiter sequentially) to block brute-force attacks.
- Configured audit logging for critical authentication events: `LOGIN_SUCCESS`, `LOGIN_FAILED`, `LOGOUT`, `TOKEN_REFRESH`, and `TOKEN_REUSE_DETECTED`.
- Created authentication state verification middleware (`backend/src/middleware/auth.ts`) containing `authMiddleware` and `requireRole`.
- Programmed a comprehensive integration test suite (`backend/src/scripts/test-auth.ts`) using native `fetch` to validate login, token rotation, reuse mitigation, logout, and rate limiting.
- Resolved integration test compiler and linter errors: imported missing `hashRefreshToken` from `../utils/auth`, utilized `newAccessToken` to test access token rotation against the gated `/me` route, added `fetch` global definition and disabled `no-console` for test script overrides in `.eslintrc.json` and `eslint.config.js`.

### Why
- To establish secure, industry-standard admin/staff session management and route protection for the coordinator dashboards.

### Decisions Made
- Chose to use `cookie-parser` for secure HTTP-only cookie extraction rather than rolling a custom header parser.
- Structured IP and Email rate limiters as separate sequential middleware instances to achieve comprehensive brute-force protection.

---

## 2026-06-22 — Phase 7A: Backend Foundation

### What Changed
- Created a standalone `backend/` project directory at the root containing package configurations.
- Integrated `zod` environment variable validation (`backend/src/config/env.ts`) and configured local `.env` values.
- Built a Winston structured logging utility (`backend/src/utils/logger.ts`) and integrated Morgan logging.
- Set up a unique Request ID (UUIDv4) tracing middleware (`backend/src/middleware/requestTrace.ts`) and custom centralized global error handlers (`backend/src/middleware/errorHandler.ts`).
- Created the Prisma ORM schema (`backend/prisma/schema.prisma`) defining `User`, `RefreshToken`, `ShareholderApplication`, `Document`, `ProducerActivity`, and `AuditLog` tables.
- Programmed a database seed script (`backend/prisma/seed.ts`) to hash and seed default Admin accounts.
- Implemented `/health` and `/version` heartbeat/metadata routes.
- Configured a static OpenAPI 3.0 configuration (`backend/src/config/swagger.json`) and exposed Swagger UI at `/api-docs`.

### Why
- To establish the solid security, tracing, documentation, and database framework for the Express API server before building domain routes.

### Decisions Made
- Deferred monorepo workspaces and structured the backend in an isolated root folder to reduce compilation complexity.
- Implemented local ESLint flat configuration (`backend/eslint.config.js`) to prevent conflict with root Next.js configuration rules.

---

## 2026-06-21 — Phase 6.5A: AI Engineering Workspace Foundation

### What Changed
- Created `AI/` directory to act as the long-term engineering memory of the project.
- Implemented core documents: `README.md`, `STATUS.md`, `architecture.md`, `design-system.md`, `coding-standards.md`, `DECISIONS.md`, `GLOSSARY.md`, `roadmap.md`, `changelog.md`, `next-task.md`, and `instructions.md`.
- Implemented procedural templates under `AI/workflows/`: `implement-feature.md`, `bug-fix.md`, `review.md`, `planning.md`, `handoff.md`, and `release.md`.

### Why
- To make the codebase portable and immediately understandable for any human developer or AI coding assistant.
- To prevent redundant research and eliminate context re-explanation at the start of new sessions.

### Decisions Made
- Organized the directory at the root so it is monorepo-compatible and survives future transitions.
- Converted context files into standard, tool-agnostic Markdown.

---

## 2026-06-21 — Phase 6D Extension: Shareholder Application Wizard

### What Changed
- Designed and built the 9-step Shareholder Application Wizard on `/join`.
- Built grouped file upload zones (Step 7) supporting Aadhaar Card, PAN Card, Photograph, Proof of Producer Activity, and Bank Passbook with client-side format/size validation and thumbnail previews.
- Implemented an interactive Pre-submission Review screen (Step 8) featuring a structured summary grid and inline edit anchors that preserve form state.
- Integrated `jspdf` to generate a 2-page A4 application receipt PDF immediately on submission, caching it in memory.
- Created the success confirmation dashboard displaying a unique Application ID, submitted timestamp, onboarding timeline, and download link for the cached PDF.
- Wired submissions to trigger WhatsApp deep links containing serialized application data and document metadata.

### Why
- To convert the informational page into a functional shareholder application flow.
- To ensure coordinators can easily submit member applications and receive digital receipts in the field.

### Decisions Made
- Stored files in client memory using browser Object URLs instead of transferring large raw files over deep links (ADR-006).
- Generated receipt PDF immediately upon submission to mimic server-side document delivery (ADR-007).

---

## 2026-06-20 — Phase 6D: UX Refinement

### What Changed
- Renamed navigational items to align with the shareholder-focused strategy (e.g., changing "Join Us" to "Become a Shareholder").
- Added quick information summary cards at the top of `/join`.
- Created a Collapsible Info Hub organizing membership benefits, eligibility criteria, process steps, required documents, and a detailed FAQ.
- Simplified the booking page and layout flows.

### Why
- To optimize the onboarding funnel and answer common applicant questions before they start the form.

### Decisions Made
- Collapsed detailed sections by default to reduce cognitive load while keeping details accessible.

---

## 2026-06-19 — Phase 6A–6C: Digital Enterprise Platform

### What Changed
- Standardized the core `Service` models and properties.
- Implemented a server-side search API route `/api/digital/search` using a custom Levenshtein distance scoring algorithm.
- Added custom search and filter hooks (`useServiceSearch`, `useServiceDiscovery`).
- Designed a booking drawer wizard component.
- Added Trust sections to digital pages highlighting safety and coordinator support.
- Fixed key linting, routing, and dynamic path hydration errors identified in a technical audit.

### Why
- To deliver a robust digital catalog capable of handling dozens of services with fast, typo-tolerant search and rich filtering.

### Decisions Made
- Used server-side search processing to offload scoring logic from the client.
- Adopted the four-layer architecture (`constants/` -> `data/` -> `lib/` -> `components/`).

---

## Earlier — Phase 1–5: Foundation

### What Changed
- Established core pages: Homepage (`/`), About (`/about`), Notices (`/notices`), Leadership (`/leadership`), Roadmap (`/roadmap`), and Contact (`/contact`).
- Created the global responsive layout with brand styling, font configurations (Plus Jakarta Sans), and colors (Green & Gold).
- Designed the physical services listing and WhatsApp booking redirection.
- Added floating global WhatsApp CTA button.
