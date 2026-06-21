# Workflow: Session Handoff

This workflow outlines the step-by-step procedure to follow at the end of a coding session or when preparing to hand off the codebase to a new assistant or developer.

---

## Step 1: Run Final Verification Build
Ensure the repository is in a green, working state before finishing:
1. Run `npm run lint` and verify there are **zero errors and zero warnings**.
2. Run `npm run build` to confirm compilation completes cleanly.
3. If any warnings or errors are found, fix them using [`AI/workflows/bug-fix.md`](./bug-fix.md) before handing off.

---

## Step 2: Synchronize live State
Update the project tracking documents to reflect the exact state of the system:
1. Open [`AI/STATUS.md`](../STATUS.md):
   - Update the "Last Updated" and "Last Verified Build" dates.
   - Add/modify the features table to mark items as complete.
   - List any newly identified technical debt or pending placements.
2. Open [`AI/changelog.md`](../changelog.md):
   - Append a new dated entry describing what was built during the current session, why, and any local decisions.
3. Open [`AI/next-task.md`](../next-task.md):
   - Update the task status to `Complete`.
   - Prepare the specification for the next task or phase, setting its status to `Planning` or `In Progress`.

---

## Step 3: Align Roadmap (If Applicable)
If a major roadmap phase was completed during the session:
1. Open [`AI/roadmap.md`](../roadmap.md).
2. Mark the status of the finished phase as `✅ Complete`.
3. Verify that the upcoming phase status is set to `🔄 In Progress` or `📅 Planned`.

---

## Step 4: Write the Handoff Summary
Write a clear, concise final message to the user containing:
- A brief bulleted summary of what was accomplished in this session.
- A list of files created or modified.
- Any architectural or styling decisions made (referencing the ADRs).
- Clarification on outstanding items or open questions.
- A prompt for the user to review the changes and approve the next task before execution starts.

---

## Step 5: Explicit Stop
Stop execution. Do not begin work on the next phase or task until the user has reviewed the session summary, inspected the artifacts, and given explicit approval to proceed.
