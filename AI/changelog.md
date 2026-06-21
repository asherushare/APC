# Changelog

All notable changes to the Adivasi Producer Company (APC) project are documented in this file in reverse-chronological order.

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
