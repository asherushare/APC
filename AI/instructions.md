# AI Behavior Instructions

This document defines explicit behavioral rules and operational protocols for any AI assistant (including Antigravity, Cursor, Claude Code, GitHub Copilot, etc.) working on the APC project. Following these guidelines is critical to maintaining codebase health and visual consistency.

---

## 1. Session Start Protocol
When starting a new session, you must read the following files in this order **before** proposing or writing any code:
1. [`AI/README.md`](./README.md) — For project orientation.
2. [`AI/STATUS.md`](./STATUS.md) — To understand what is working, what is pending, and the latest build statuses.
3. [`AI/next-task.md`](./next-task.md) — To find your active objective and checklist.
4. [`AI/DECISIONS.md`](./DECISIONS.md) — To review past architectural decisions (ADRs) and constraints.

---

## 2. Before You Begin Working

- **Before writing or editing any UI component**: Read [`AI/design-system.md`](./design-system.md) and [`AI/coding-standards.md`](./coding-standards.md).
- **Before adding a route, service, or API endpoint**: Read [`AI/architecture.md`](./architecture.md).
- **Before asking about or coding business-specific terms (e.g. fields in forms)**: Read [`AI/GLOSSARY.md`](./GLOSSARY.md).

---

## 3. Core Operational Rules

### The Proposal Rule
Any change that affects **more than 3 files**, introduces a **new route**, adds a **new library**, or alters the **system architecture** must be formally proposed as an implementation plan and approved by the user before any production code changes are made.

### The Verification Rule
Every completed code change must be verified using the following CLI checks. Both must exit successfully with zero warnings/errors before you report completion:
```bash
npm run lint    # Must yield zero errors and zero warnings
npm run build   # Must compile cleanly and generate static pages
```

### The Documentation Rule
After completing a task or fixing a bug, you must immediately update:
- [`AI/STATUS.md`](./STATUS.md) — Update the build verification date, working/pending features, and tech debt.
- [`AI/changelog.md`](./changelog.md) — Append a new entry detailing what changed, why, and any local decisions.
- Update [`AI/next-task.md`](./next-task.md) to reflect the new state.

### The Phase Transition Rule
When an entire engineering phase (from [`AI/roadmap.md`](./roadmap.md)) is finalized:
1. Move the finished task's description from `next-task.md` to `changelog.md`.
2. Update `STATUS.md` with the new completed systems.
3. Update `roadmap.md` to mark the phase status as `✅ Complete`.
4. Write the next upcoming phase task specification into `next-task.md`.

---

## 4. Absolute Coding Boundaries (Hard Rules)

These rules are enforced via static analysis and strict manual review. Never violate them:

1. **No `any` Types**: Never use TypeScript's `any` type. If a type is unknown, type it as `unknown` and perform runtime narrowing, or define a structured type/interface in `src/types/`.
2. **No Component Nesting**: Never declare a React component function inside another component's render scope. This triggers Hook violations and forces state resets on every render.
3. **No Inline Static Data**: Never hardcode arrays (e.g. lists of features, FAQ items, nav links) inside components. Always export them as typed structures from `src/data/`.
4. **No Inline Styling**: Always style components using CSS variables or Tailwind utility classes. Do not use the React `style={{}}` prop unless calculating a truly dynamic value (e.g., progress bar width).
5. **No Hardcoded Brand/Contact Info**: Never inline phone numbers, email addresses, WhatsApp numbers, or brand text in markup. Reference them from `src/data/company.ts` or `src/constants/`.
6. **No Speculative Coding**: Do not implement extra features, API endpoints, or state trackers because they "might be useful later." Implement only what is explicitly defined in the approved plan.
