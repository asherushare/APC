# Architecture

This document describes every structural pattern in the APC codebase. After reading it, you should be able to predict where any new file belongs without browsing the source tree.

---

## The Four-Layer Architecture

All source code follows a strict dependency direction. Lower layers never import from higher layers.

```
constants/  →  data/  →  lib/  →  components/
```

| Layer | Directory | Role |
|-------|-----------|------|
| **Constants** | `src/constants/` | Immutable brand configuration — phone numbers, routes, social links |
| **Data** | `src/data/` | Typed static data arrays — services, directors, notices, roadmap |
| **Service** | `src/lib/` | Pure business logic — search scoring, WhatsApp compilation, PDF generation |
| **UI** | `src/components/` | React components — only consume data and lib, never define it |

---

## Annotated Source Tree

```
src/
│
├── app/                              Next.js App Router
│   ├── layout.tsx                    Root layout (Navbar, Footer, WhatsAppButton, font)
│   ├── page.tsx                      Homepage (/ route)
│   ├── globals.css                   Design system — ALL tokens, utility classes, animations
│   ├── icon.png                      Favicon
│   │
│   ├── about/page.tsx                /about
│   ├── services/page.tsx             /services
│   ├── contact/page.tsx              /contact
│   ├── leadership/page.tsx           /leadership
│   ├── notices/page.tsx              /notices
│   ├── roadmap/page.tsx              /roadmap
│   ├── book/page.tsx                 /book (digital service booking wizard)
│   │
│   ├── join/page.tsx                 /join (shareholder membership portal)
│   │
│   ├── digital/
│   │   ├── layout.tsx                /digital sub-layout (digital-specific metadata)
│   │   ├── page.tsx                  /digital (service catalog, search, filter)
│   │   └── services/[slug]/page.tsx  /digital/services/:slug (SSG detail pages)
│   │
│   └── api/
│       └── digital/
│           └── search/route.ts       GET /api/digital/search?q=... (server-side search)
│
├── components/
│   │
│   ├── common/                       Shared primitives — safe to import from any page
│   │   ├── Container.tsx             Max-width wrapper (1280px, px-5 md:px-16)
│   │   ├── Button.tsx                Styled button with variants
│   │   ├── Badge.tsx                 Status/category label chip
│   │   ├── SectionHeading.tsx        Standardised section title + subtitle
│   │   └── WhatsAppButton.tsx        Floating global WhatsApp CTA button
│   │
│   ├── layout/                       Global layout — imported once in root layout.tsx
│   │   ├── Navbar.tsx                Top navigation bar (desktop + mobile menu)
│   │   └── Footer.tsx                Site footer
│   │
│   ├── sections/                     PAGE-SCOPED section components
│   │   │                             Each subdirectory matches its route name
│   │   │                             These are NOT shared across pages
│   │   ├── home/                     Homepage sections
│   │   ├── about/                    About page sections
│   │   ├── contact/                  Contact page sections
│   │   ├── services/                 Services page sections
│   │   ├── join/                     Shareholder portal sections (12 components)
│   │   ├── book/                     Booking page sections
│   │   ├── leadership/               Leadership page sections
│   │   ├── notices/                  Notices page sections
│   │   └── roadmap/                  Roadmap page sections
│   │
│   ├── digital/                      DIGITAL MODULE components
│   │   │                             Used across /digital and /digital/services/[slug]
│   │   ├── Search.tsx                Autocomplete search with typo tolerance + recent history
│   │   ├── Booking.tsx               Sliding drawer booking wizard
│   │   ├── FilterPanel.tsx           Category/price/time filter UI
│   │   ├── SortSelector.tsx          Sort dropdown
│   │   ├── TrustSection.tsx          Trust markers (security, assisted mode, helpdesk)
│   │   └── WhyChooseUs.tsx           APC value proposition block
│   │
│   └── ui/                           Reserved — future shared design system primitives
│
├── constants/                        BRAND CONSTANTS (never inline in components)
│   ├── company.ts                    COMPANY_INFO, ADDRESS, WORKING_HOURS (basic)
│   ├── contact.ts                    Contact-specific constants
│   ├── routes.ts                     ROUTES object (all app route strings)
│   ├── social.ts                     Social media links
│   └── index.ts                      Re-exports
│
├── data/                             STATIC DATA AS TYPED EXPORTS
│   ├── company.ts                    companyInfo — full CompanyInfo object (authoritative)
│   ├── directors.ts                  Board member data
│   ├── notices.ts                    Notices/announcements
│   ├── roadmap.ts                    7-phase company roadmap
│   ├── services.ts                   Physical services data
│   ├── benefits.ts                   Membership benefits
│   ├── faq.ts                        General FAQ items
│   ├── values.ts                     APC core values
│   ├── stats.ts                      Homepage statistics
│   ├── navigation.ts                 Navigation link items
│   └── digital/                      Digital services data (modular by domain)
│       ├── index.ts                  Aggregation — getAllServices()
│       ├── categories.ts             Category definitions
│       ├── featuredServices.ts       Featured service IDs
│       ├── demoServices.ts           Demo/fallback services
│       └── services/                 Individual service files (one per service domain)
│
├── hooks/                            CUSTOM REACT HOOKS
│   ├── useServiceDiscovery.ts        Filter + sort state for the digital catalog
│   ├── useServiceSearch.ts           Search query state + debouncing
│   └── useDebounce.ts                Generic debounce hook
│
├── lib/                              SERVICE LAYER — pure functions and business logic
│   ├── membership.ts                 submitShareholderApplication(), generateSummaryPdf()
│   ├── whatsapp.ts                   getWhatsAppLink(), generateBookingMessage(), etc.
│   ├── search.ts                     searchServices() — Levenshtein scoring engine
│   ├── recommendations.ts            getRecommendedServices() — related services
│   ├── application-id.ts             generateApplicationId() — temporary client-side ID
│   ├── slug.ts                       URL slug utilities
│   ├── utils.ts                      cn() — Tailwind class merger
│   └── icons.tsx                     SVG icon components used across the digital module
│
└── types/                            TYPESCRIPT INTERFACES — defined before implementation
    ├── index.ts                      Core types: NavLink, Service, Director, RoadmapPhase, Notice…
    ├── service.ts                    DigitalService, Pricing, DocumentRequirement (full model)
    ├── membership.ts                 ShareholderApplication, UploadedDocumentMetadata
    ├── digital.ts                    Re-exports for the digital module
    ├── booking.ts                    Booking-related types
    ├── analytics.ts                  Analytics event types (currently unused)
    ├── category.ts                   Service category types
    ├── faq.ts                        FAQ item type
    └── media.ts                      Media asset types
```

---

## Route → Component Map

| Route | Page File | Key Section Components |
|-------|-----------|----------------------|
| `/` | `app/page.tsx` | `HeroSection`, `StatsBar`, `CorePillars`, `MissionVision`, `ServicesPreview`, `NoticesSlider`, `ShareholderSection`, `BenefitsSection`, `LeadershipPreview`, `RoadmapPreview`, `CTASection` |
| `/join` | `app/join/page.tsx` | `JoinPortalClient` → `JoinHero`, `QuickSummary`, `JoinFormSection`, `MembershipBenefits`, `EligibilityCriteria`, `MembershipProcess`, `RequiredDocuments`, `MembershipFAQ`, `FloatingApplyButton` |
| `/digital` | `app/digital/page.tsx` | `Search`, `FilterPanel`, `SortSelector`, service cards, `TrustSection` |
| `/digital/services/[slug]` | `app/digital/services/[slug]/page.tsx` | Service detail layout, `Booking` drawer, related services |
| `/book` | `app/book/page.tsx` | `BookingHero`, `BookingForm` |
| `/admin/login` | `app/admin/login/page.tsx` | `LoginForm` |
| `/admin/dashboard` | `app/admin/dashboard/page.tsx` | `DashboardStats`, `DashboardFilters`, `ApplicationsTable`, `AuditLogsTable` |
| `/admin/applications/[id]` | `app/admin/applications/[id]/page.tsx` | `ApplicationDetails`, `DocumentViewer`, `StatusControls`, `ApplicationStatusHistory` |

---

## Data Flow

```
User visits a page
       ↓
app/[route]/page.tsx        Server Component — imports static data, passes as props
       ↓
sections/[route]/Section.tsx  May be Server or Client Component
       ↓
src/data/*.ts               Typed static arrays (services, directors, notices…)
       ↓
src/lib/*.ts                Business logic (search scoring, WhatsApp compilation, PDF gen)
       ↓
src/types/*.ts              TypeScript interfaces that define the shape of everything
```

For forms (join, book): user input → `src/lib/` → WhatsApp deep link → user opens WhatsApp.

---

## The `'use client'` Boundary Policy

- **Default**: All components are **Server Components** unless they need browser APIs or React state.
- **Add `'use client'`**: Only at the **lowest component** in the tree that requires `useState`, `useEffect`, event listeners, or browser APIs (e.g., `localStorage`, `URL.createObjectURL`).
- **Never add** `'use client'` to layout files, page files, or data components.
- **Common pattern**: The page (`page.tsx`) is a Server Component that imports a `*Client.tsx` component marked `'use client'` for the interactive sections.

---

## Component Colocation Rule

Section components live in `src/components/sections/[route]/` and are **not shared across pages**.

✅ Correct:
- `src/components/sections/join/JoinFormSection.tsx` — used only on `/join`
- `src/components/sections/home/HeroSection.tsx` — used only on `/`

✅ Shared across pages:
- `src/components/common/Container.tsx` — used everywhere
- `src/components/layout/Navbar.tsx` — used in root layout

❌ Wrong:
- Importing a section component from one route into a different route's page

---

## The WhatsApp Submission Pattern (Current Backend)

All form submissions compile user input into a pre-formatted WhatsApp message and open a deep link:

```
User fills form
      ↓
src/lib/membership.ts  or  src/lib/whatsapp.ts
      ↓
getWhatsAppLink(message) → "https://wa.me/919348747578?text=..."
      ↓
User taps "Open WhatsApp" → their WhatsApp app opens pre-filled
      ↓
APC staff receive the message and process it manually
```

This is intentional. See `DECISIONS.md` (ADR-001). It will be replaced by a real backend in Phase 7.

---

## API Route Convention

```
src/app/api/[domain]/[action]/route.ts
```

Current API routes:
- `src/app/api/digital/search/route.ts` — `GET /api/digital/search?q=query`

When the backend is added (Phase 7), new API routes will follow the same pattern or be moved to a separate `apps/api/` service.

---

## Repository Structure (Phase 7+)

Rather than a formal monorepo, the project uses a nested Express backend directory inside the Next.js `apc-website` folder:

```
apc-project/
├── AI/                 ← Repository root AI Workshop documentation
├── apc-website/        ← Next.js frontend project root
│   ├── src/            ← Next.js frontend source code (components, hooks, pages)
│   ├── backend/        ← Express backend project root
│   │   ├── src/        ← Express backend source code (controllers, routes, schemas)
│   │   └── prisma/     ← Database schema definition and seed scripts
│   ├── public/         ← Static files and documents
│   └── package.json
```

The frontend client communicates with the backend via the `src/lib/api-client.ts` fetch wrapper, which points to `http://localhost:4000/api/v1` in development and the production Render API URL.

---

## Path Alias

```typescript
// Always use the @/ alias — never relative paths deeper than one level
import { cn } from '@/lib/utils';       // ✅
import { cn } from '../../../lib/utils'; // ❌
```

The alias is configured in `tsconfig.json`: `"@/*": ["./src/*"]`.
