# APC — AI Engineering Workspace

This is the long-term engineering memory of the **Adivasi Producer Company (APC)** website project. Every AI coding assistant — Antigravity, Cursor, VS Code Copilot, Zed, Claude Code, ChatGPT, or any future tool — should start here.

---

## What is APC?

**Adivasi Producer Company (APC)** is a registered Producer Company empowering tribal communities in Rayagada, Odisha, India. It provides digital services, facilitates government schemes, and enables tribal producers to become equity shareholders in a community-owned cooperative.

The website serves two primary audiences:
1. **Community members** — seeking digital services (Aadhaar, PAN, government schemes) and shareholder membership
2. **Coordinators and staff** — managing member applications and service bookings

---

## The Project

| Property | Value |
|----------|-------|
| Framework | Next.js 16.2.7 (App Router, Turbopack) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Font | Plus Jakarta Sans (Google Fonts) |
| Dev Server | `npm run dev` (from `d:/apc-project/apc-website/`) |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Path Alias | `@/` → `src/` |
| Production URL | Configured in `src/app/layout.tsx` metadata — see `STATUS.md` after deployment |

---

## Start Here — Navigation Map

| File | Purpose | Read When |
|------|---------|-----------|
| **`README.md`** | You are here. Project orientation. | Every session |
| **`STATUS.md`** | Live project state — what works, what's pending | Every session |
| **`next-task.md`** | The single next action to take | Every session |
| **`DECISIONS.md`** | Why things are built the way they are | Before changing architecture |
| **`GLOSSARY.md`** | APC-specific vocabulary definitions | Before working on forms or domain logic |
| **`architecture.md`** | Source tree, routing, data flow, patterns | Before adding routes or components |
| **`design-system.md`** | Colors, typography, CSS classes, animations | Before writing any UI |
| **`coding-standards.md`** | TypeScript rules, naming, anti-patterns | Before writing any code |
| **`roadmap.md`** | All development phases past and planned | Before planning new phases |
| **`changelog.md`** | Dated log of every significant change | To understand recent history |
| **`instructions.md`** | Behavioral rules for AI tools | Read once per tool setup |
| **`workflows/`** | Step-by-step procedures for common tasks | When doing that task |

---

## Recommended Reading Paths

### Starting a new feature or phase
1. `README.md` (this file)
2. `STATUS.md`
3. `next-task.md`
4. `DECISIONS.md`
5. `architecture.md`
6. `coding-standards.md` + `design-system.md`

### Fixing a bug
1. `README.md`
2. `STATUS.md`
3. `DECISIONS.md`
4. `workflows/bug-fix.md`

### Writing a new UI component or section
1. `design-system.md`
2. `coding-standards.md`
3. `architecture.md` (component colocation rules)

### Planning a new phase
1. `STATUS.md`
2. `roadmap.md`
3. `workflows/planning.md`

### Handing off a session
1. `workflows/handoff.md`

---

## Repository Structure (Top Level)

```
apc-website/
├── AI/                   ← You are here — engineering workspace
├── src/                  ← All application source code
│   ├── app/              ← Next.js App Router pages, layouts, API routes
│   ├── components/       ← UI components
│   ├── constants/        ← Brand constants (never inline in components)
│   ├── data/             ← Static typed data (never inline in components)
│   ├── hooks/            ← Custom React hooks
│   ├── lib/              ← Service layer (business logic, pure functions)
│   └── types/            ← TypeScript interfaces
├── public/               ← Static assets, PDFs, images
├── package.json
├── next.config.ts
├── tsconfig.json
└── eslint.config.mjs
```

For the full annotated source tree, see [`architecture.md`](./architecture.md).

---

## The One Rule

> Before writing a single line of production code, read `STATUS.md` and `next-task.md`.
> Before making any change to architecture or design, read `DECISIONS.md`.
> After finishing, update `STATUS.md` and `changelog.md`.

See [`instructions.md`](./instructions.md) for the complete behavioral protocol.
