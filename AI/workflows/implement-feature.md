# Workflow: Implement Feature

This workflow outlines the step-by-step procedure that any AI assistant or developer must follow when implementing a new feature or phase in the APC project.

---

## Step 1: Pre-Flight Context Loading
Before touch any code, read the following core workspace files to align with the current state of the application:
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

## Step 3: Proposal Gate (The 3-File Rule)
- If the proposed feature modifies/creates **more than 3 files**, introduces a **new route**, adds a **new library**, or alters **architecture**:
  - Stop and create an `implementation_plan.md` artifact.
  - Detail the Background, Proposed Changes (grouped by component, file-by-file), and Verification Plan.
  - Present the plan to the user and wait for explicit approval.
- If the change is a simple typo fix, style tweak, or minor single-file enhancement, you may proceed directly to Step 4.

---

## Step 4: Implementation Phase
Write the code following our engineering standards:
- Adhere strictly to [`AI/coding-standards.md`](../coding-standards.md) (type safety, component declaration rules, no nested components).
- Consume colors, text styles, spacing, custom classes, and anims from [`AI/design-system.md`](../design-system.md).
- Keep components focused, modular, and collocated under their respective route-named subfolder in `src/components/sections/` if they are page-scoped.

---

## Step 5: Verification & Build Gate
Verify the changes on your environment:
1. Run `npm run lint` and verify there are **zero errors and zero warnings**.
2. Run `npm run build` to confirm compilation is successful and all pages generate static files.
3. Conduct visual and manual checks to ensure responsive layouts remain intact down to `320px` width.

---

## Step 6: Post-Implementation Documentation
Update the workspace logs:
1. Document the completion and build metrics in [`AI/STATUS.md`](../STATUS.md).
2. Append a new entry detailing the change in [`AI/changelog.md`](../changelog.md).
3. Update [`AI/next-task.md`](../next-task.md) to mark this feature complete or setup the next task.

---

## Step 7: Transition / Handoff
Prepare the workspace for the next developer or session by executing the [`AI/workflows/handoff.md`](./handoff.md) checklist.
