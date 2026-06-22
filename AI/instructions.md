# AI Behavior Instructions

This document defines explicit behavioral rules, operational workflows, and the Definition of Done for any AI assistant (including Antigravity, Gemini, Claude, Cursor, GitHub Copilot, etc.) working on the Adivasi Producer Company (APC) project. Following these guidelines is critical to maintaining codebase health, type safety, and system integrity.

---

## 1. Session Start Protocol
When starting a new session, you must read the following files in this order **before** proposing or writing any code:
1. [`AI/README.md`](./README.md) — Project orientation and workspace index.
2. [`AI/STATUS.md`](./STATUS.md) — Live project state, active pathways, and compiler history.
3. [`AI/next-task.md`](./next-task.md) — Active target requirements and task checkpoints.
4. [`AI/DECISIONS.md`](./DECISIONS.md) — ADRs (Architecture Decision Records) defining system constraints.

---

## 2. Pre-Development Scopes

- **Before writing/editing any UI component**: Read [`AI/design-system.md`](./design-system.md) and [`AI/coding-standards.md`](./coding-standards.md).
- **Before adding a route, database table, or API endpoint**: Read [`AI/architecture.md`](./architecture.md).
- **Before coding business logic fields or forms**: Read [`AI/GLOSSARY.md`](./GLOSSARY.md).

---

## 3. Core Operational Workflow (Standard Rule)

Every task, phase, or bug fix must follow the sequential lifecycle below. Never skip a step:

```
    Plan  ──>  User Approval  ──>  Implementation  ──>  Verification  ──>  AI Workspace Update  ──>  Final Report
```

### Rule A: The Planning Gate
- **No Early Modifications**: Production code must **NEVER** be modified before an implementation plan has been written, reviewed, and explicitly approved by the user.
- **Proposal Threshold**: Any change that modifies/creates **more than 3 files**, introduces a **new route/API**, adds a **new library**, or alters the **system architecture** must be formally proposed as an `implementation_plan.md` artifact.
- **Credential Integrity**: If the implementation requires API keys, secrets, database credentials, cloud storage accounts, or third-party registrations:
  - **STOP** and ask the user to create the account or supply the credentials.
  - **NEVER** generate placeholder, mocked, or fake production values in your files.

### Rule B: Verification & Build Gate
Every code change must compile cleanly:
```bash
# Verify both return zero errors and warnings
npm run lint
npm run build
```

### Rule C: Synchronized Documentation Gate
Documentation must always remain fully synchronized with the actual implementation:
- Update [`AI/STATUS.md`](./STATUS.md) after modifying features, API routes, or adding technical debt.
- Append log details to [`AI/changelog.md`](./changelog.md) for all modifications.

---

## 4. Definition of Done (DoD)

A task, bug fix, or phase is **NOT** complete until all applicable checks below are finalized and checked off:

- [ ] **Implementation**: Source code matches all requirements in the approved plan.
- [ ] **TypeScript Compilation**: No typescript compilation errors exist across the workspace.
- [ ] **Build Pipeline**: `npm run build` compiles frontend and backend targets successfully.
- [ ] **Static Code Quality**: `npm run lint` yields zero warnings and zero errors.
- [ ] **Database Integrity**: Prisma schema validates cleanly (`npx prisma validate`) and SQL migrations execute without issues.
- [ ] **Automated Testing**: All integration and unit tests run and pass (when test suites are available).
- [ ] **Workspace Sync**: [`AI/STATUS.md`](./STATUS.md) is updated (last updated dates, active routes, features, verified builds).
- [ ] **Changelog Sync**: [`AI/changelog.md`](./changelog.md) has been updated with a new entry detailing changes, rationale, and local decisions.
- [ ] **Roadmap Sync**: [`AI/roadmap.md`](./roadmap.md) is updated if a major engineering milestone has been completed.
- [ ] **Next Task Setup**: [`AI/next-task.md`](./next-task.md) is updated to describe the next logical feature or phase in line.
- [ ] **Architecture Sync**: [`AI/architecture.md`](./architecture.md) or [`AI/DECISIONS.md`](./DECISIONS.md) are updated if code organization or ADR decisions are changed.
- [ ] **Walkthrough Created**: A detailed `walkthrough.md` is generated in the brain directory summarizing changes.
- [ ] **Implementation Report**: A `final_implementation_report.md` is generated listing every file created/modified.
- [ ] **Verification Summary**: A summary of all validations executed (and logs/terminal outputs) is presented to the user.

---

## 5. Absolute Coding Boundaries (Hard Rules)

These rules are enforced strictly. Never violate them:

1. **No `any` Types**: Never use TypeScript's `any` type. If a type is unknown, use `unknown` and perform explicit narrowing, or define a structured interface in `src/types/` (frontend) or shared config (backend).
2. **No Nested Component Declarations**: Never declare a React component function inside another component's render scope. It breaks Hook execution rules and resets state.
3. **No Inline Static Data**: Never hardcode arrays (e.g. lists of options, FAQs) inside components. Always export them from `src/data/` or config helpers.
4. **No Inline Styling**: Always style components using CSS variables or Tailwind utility classes. Do not use the `style={{}}` prop unless calculating a truly dynamic style (e.g. progress bar width).
5. **No Hardcoded Credentials or Brand Info**: Never inline phone numbers, email addresses, database passwords, or auth keys in markup or functions. Reference them from config loaders or `.env` objects.
6. **No Speculative Coding**: Do not implement extra features or API endpoints because they "might be useful later." Implement only what is explicitly defined in the approved plan.
