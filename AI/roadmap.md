# Engineering and Business Roadmap

This document outlines the strategic path of the APC project, linking the organizational growth (Business Roadmap) with the supporting technical builds (Engineering Roadmap).

---

## Part 1 — Business Roadmap

Sourced from `src/data/roadmap.ts`, these are the 7 key phases of the Adivasi Producer Company's organizational development:

1. **Company Formation** — ✅ **Established**
   - Incorporating the producer company, aligning founding members, establishing leadership, and setting up initial offices.
2. **Digital Service Center (DSC)** — ✅ **Operational**
   - Establishing physical DSC outlets, training coordinators, and offering basic digital assistance to tribal members.
3. **Community Membership Growth** — ✅ **Active Scaling**
   - Mobilizing tribal producers to become shareholders, expanding outreach, and processing equity subscription applications.
4. **Entrepreneurship Training** — 🔄 **In Progress**
   - Providing skill-building programs for local coordinators and farmers to run self-sustaining enterprises.
5. **Market Linkage & Expansion** — 📅 **Upcoming**
   - Creating trade links between tribal producers and regional/national buyers for agricultural and forest produce.
6. **Employment Generation** — 📅 **Planned 2025**
   - Generating direct and indirect jobs for tribal youth and women within the cooperative value chains.
7. **Sustainable Development Programs** — 📅 **Planned 2026+**
   - Implementing long-term ecological, water, and agricultural programs ensuring permanent tribal empowerment.

---

## Part 2 — Engineering Roadmap

This technical roadmap tracks the phases of software development that support APC's business operations.

| Phase | Title | Status | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **1–3** | Foundation | ✅ Complete | Homepage, About, Notices, Leadership, Roadmap, Contact routes and base layout |
| **4** | Digital Catalog | ✅ Complete | Search with autocomplete, filter panels, categorization, service detail pages |
| **5** | Services & Booking | ✅ Complete | Physical services list, dynamic booking wizard drawer, WhatsApp integration |
| **6A–6C** | Digital Enterprise | ✅ Complete | Service model definitions, Levenshtein search API, discovery hooks, booking flow, trust section |
| **6D** | UX Refinement | ✅ Complete | Navigation renaming, page flows, quick summary cards, collapsible information hub |
| **6D Ext**| Shareholder Wizard | ✅ Complete | 9-step shareholder wizard, grouped document upload, pre-submission review, client-side jsPDF receipt, success dashboard |
| **6.5A** | AI Workspace | ✅ Complete | Creating the permanent `AI/` directory as the engineering memory of the project |
| **7A** | Backend Foundation | ✅ Complete | Express server setup, request tracing, Zod environment checks, health/version heartbeats, Swagger UI |
| **7B** | Authentication | ✅ Complete | JWT + Refresh Token Rotation cookies, Argon2id password security |
| **7C** | Applications API | ✅ Complete | Public shareholder form persistence with column-level GCM encryption |
| **7D** | Document Upload | ✅ Complete | Secure document upload, S3 storage integration, secure uploadToken model, async virus scan lifecycle |
| **7E** | Admin APIs | ✅ Complete | Scoped geographical coordinators dashboard stats & status updates, paginated logs, AuditLog hooks |
| **7F** | Hardening & Testing | ✅ Complete | Security hardening, Postgres backup scripts, production Docker compose, unified tests runner |
| **8** | Admin Dashboard | ✅ Complete | Application review UI, status tracking, block-level coordinator gates, document downloader and details viewer |
| **9** | Deployment & DevOps | ⏳ Not Started | CI/CD pipeline, production hosting, managed database, environment configuration (local docker ready) |
| **10** | Mobile / Field App | ⏳ Not Started | React Native app for block coordinators; offline-capable; field verification workflow |

---

## Backend Stack & Architecture (Phase 7+)

### Technology Stack
- **Database**: PostgreSQL (relational database suitable for structured application data)
- **ORM**: Prisma ORM (provides type safety and clean migration workflows)
- **Runtime**: Node.js (via Next.js API routes or a standalone Express/Fastify service)

> [!IMPORTANT]
> This technology stack is confirmed. Alternatives like Firebase, MongoDB, or other BaaS should not be suggested unless requested by the project owner.

### Monorepo Migration Plan
When the backend service is introduced in Phase 7, the repository will transition to a monorepo structure. This allows shared types and utilities to be maintained efficiently in one place.

```
apc-project/
├── apps/
│   ├── web/          ← Current Next.js frontend (everything currently in apc-website/)
│   └── api/          ← New Node.js + Prisma backend service
├── packages/
│   ├── ui/           ← Shared UI component library (future)
│   └── types/        ← Shared TypeScript interfaces (future)
└── AI/               ← Engineering workspace (remains at repository root)
```

---

## Synchronization and Updates

**Update Trigger**: This document must be updated when:
- A new development phase is planned or its scope shifts.
- A phase is completed and moves from "In Progress" or "Planned" to "Complete".
- A major technical stack decision is modified.
