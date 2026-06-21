# Workflow: Bug Fix

This workflow outlines the step-by-step procedure for diagnosing, reproducing, and fixing bugs on the APC website project.

---

## Step 1: Information Gathering
Collect details about the bug report:
- **Type of Error**: Is it a lint error, a TypeScript compilation issue, a runtime crash (hydration mismatch, Next.js error screen), or a visual/UX bug (responsive layout break, animation flicker)?
- **Location**: Which route (`/join`, `/digital`, etc.) or component is affected?
- **Steps to Reproduce**: What specific user action (e.g. typing a nominee name, uploading a large PDF, clicking search) triggers the bug?

---

## Step 2: Check for Known APC Bug Patterns
Analyze the code against these common anti-patterns identified in the codebase:

### Pattern A: Synchronous `setState` in `useEffect`
- **Symptom**: React warning: *"Cannot update a component while rendering a different component."* Or infinite re-render loops.
- **Fix**: Wrap the state update in a `setTimeout` or microtask to defer execution:
  ```typescript
  useEffect(() => {
    // Avoid updating state synchronously here
    setTimeout(() => {
      setActiveStep(targetStep);
    }, 0);
  }, [someDependency]);
  ```

### Pattern B: Missing `'use client'` Boundary
- **Symptom**: Hydration mismatch warnings or crash messages like: *"useState is not a function"* or *"window is not defined"*.
- **Fix**: Add the `'use client'` directive at the very top of the interactive component file. Ensure layout or page wrappers do not have `'use client'` unless strictly required.

### Pattern C: Nested Component Declarations
- **Symptom**: State randomly resets when typing in fields or moving between steps; React warning: *"Rendered more/fewer hooks than previous render."*
- **Fix**: Move the nested component function out of the parent component's scope so it retains a stable function identity:
  ```typescript
  // ❌ Wrong
  function Parent() {
    function Child() { ... }
    return <Child />;
  }

  // ✅ Correct
  function Child() { ... }
  function Parent() {
    return <Child />;
  }
  ```

### Pattern D: Hardcoded Static Data or Constants
- **Symptom**: UI strings differ across pages, or updating contact details requires editing multiple components.
- **Fix**: Extract inline arrays/strings and move them to `src/data/` or `src/constants/company.ts`.

---

## Step 3: Implement the Fix
- Make targeted changes to resolve the bug.
- Avoid introducing unrelated changes or speculative features.
- Ensure all comments and docstrings remain intact.

---

## Step 4: Verification Cycle
Execute the build pipeline:
1. Run `npm run lint` and verify there are **zero errors and zero warnings**.
2. Run `npm run build` to confirm compilation is successful and all pages generate static files.
3. Validate that the reported bug no longer occurs using the steps to reproduce.

---

## Step 5: Document the Fix
- Add a summary of the fix to [`AI/changelog.md`](../changelog.md).
- If the bug was caused by a system-wide issue or requires an architectural shift, record the decision in [`AI/DECISIONS.md`](../DECISIONS.md) as a new ADR entry.
- Update [`AI/STATUS.md`](../STATUS.md) with the new verified build status and date.
