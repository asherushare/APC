# Workflow: Implement Feature

This workflow outlines the step-by-step procedure that any AI assistant or developer must follow when implementing a new feature or phase in the APC project.

---

## Step 1: Pre-Flight Context Loading
Before touching any code, read the following core workspace files to align with the current state of the application:
1. [`AI/README.md`](../README.md) — Orientation
2. [`AI/STATUS.md`](../STATUS.md) — Tech stack, live paths, and constraints
3. [`AI/next-task.md`](../next-task.md) — Active target requirements
4. [`AI/DECISIONS.md`](../DECISIONS.md) — Architecture decisions (ADRs) and limits

---

## Step 2: Scope & Impact Analysis
Investigate the codebase to identify all affected layers:
- What static data changes? (Check `src/data/`)
- What interfaces/types need defining? (Check `src/types/`)
- What business logic helpers are needed? (Check `src/lib/`)
- What pages or collocated sections are impacted? (Check `src/app/` and `src/components/sections/`)

---

## Step 3: Proposal & Planning Gate (Strict Rule)
Before writing any code:
- **No Early Modifications**: Production code must **NEVER** be modified before an implementation plan has been written, reviewed, and approved by the user.
- **Plan Format**: Create an `implementation_plan.md` artifact detailing:
  - Background and scope of changes.
  - Proposed Changes (grouped by component, file-by-file).
  - Open Questions / User Review Required alerts.
  - Verification Plan (automated and manual checks).
- **Credentials & API Keys**: If the implementation requires credentials, secrets, database passwords, or third-party accounts:
  - **STOP** and ask the user to configure the credentials or create the accounts.
  - **NEVER** write placeholder or fake credentials into the plan or source files.
- Present the plan to the user, set `RequestFeedback: true` in the metadata, and wait for explicit approval.

---

## Step 4: Implementation Phase
Once approved, write the code following our engineering standards:
- Adhere strictly to [`AI/coding-standards.md`](../coding-standards.md) (type safety, component declaration rules, no nested components, strict type imports).
- Consume colors, text styles, spacing, custom classes, and animations from [`AI/design-system.md`](../design-system.md).
- Keep components focused, modular, and collocated under their respective route-named subfolder in `src/components/sections/`.

---

## Step 5: Verification & Build Gate
Verify the changes on your environment:
1. Run `npm run lint` and verify there are **zero errors and zero warnings**.
2. Run `npm run build` to confirm compilation is successful and all pages generate static files.
3. Verify Prisma schemas (`npx prisma validate`) and run database migrations when database changes are made.
4. Conduct visual and manual checks to ensure responsive layouts remain intact down to `320px` width.

---

## Step 6: Post-Implementation Documentation
Synchronize the workspace logs to remain consistent with your implementation:
1. Document the completion and build metrics in [`AI/STATUS.md`](../STATUS.md).
2. Append a new entry detailing the change in [`AI/changelog.md`](../changelog.md).
3. If database structures or ADRs were touched, update [`AI/architecture.md`](../architecture.md) and [`AI/DECISIONS.md`](../DECISIONS.md).
4. Update [`AI/next-task.md`](../next-task.md) to set up the next logical task.

---

## Step 7: Final Reports & Handoff
Before closing the session:
1. Generate `walkthrough.md` in the brain directory summarizing changes.
2. Generate `final_implementation_report.md` listing every file created or modified.
3. Present a clear verification summary outlining all check commands executed.
4. Execute the [`AI/workflows/handoff.md`](./handoff.md) checklist to hand off the workspace.
