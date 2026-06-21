# Workflow: Planning

This workflow outlines the step-by-step procedure for producing a high-quality implementation plan before writing any production code.

---

## Step 1: Repository & Code Inspection
Analyze the current state of the repository:
- Locate the relevant components, routes, data models, or service helpers.
- Run search queries using `grep_search` to find existing usages of functions or patterns you plan to touch.
- Check `AI/STATUS.md` and `AI/DECISIONS.md` to avoid repeating research or violating architectural boundaries.

---

## Step 2: Requirement Mapping
Map the user request requirements to the codebase:
- Create a list of the required features, logic flows, or UI changes.
- Identify which existing files must be modified (`[MODIFY]`) and which new files must be created (`[NEW]`).
- Ensure all business requirements align with the brand guidelines (e.g. maintaining Green & Gold colors, WhatsApp submission flow, etc.).

---

## Step 3: Identify the Decision Surface
Identify all design decisions, trade-offs, and choices:
- Does the change require a new library/dependency?
- Are there security, privacy, or performance concerns?
- Does the feature require changing existing types or constants?
- Document these choices clearly in the plan so the user can review them.

---

## Step 4: Risk Identification
Detail potential risks and complications:
- **Breaking Changes**: Will existing page routes or component props change?
- **Performance Risks**: Will this cause slow page loads, hydration errors, or excessive re-renders?
- **Accessibility Gaps**: Does the layout require custom interaction states that could break screen readers?

---

## Step 5: Plan Formatting
Structure your implementation plan in the `implementation_plan.md` artifact (or as a separate file if needed) using this format:

```markdown
# Phase [Phase Name] — [Title]
## Goal Description
[Brief summary of the target features and how it fits into the roadmap]

## User Review Required
[Document any key design decisions, risks, or stack changes that the user must review]

## Open Questions
[List specific questions for the user to resolve design or logic ambiguities]

## Proposed Changes
[Horizontal rules separating components/directories, followed by a list of modified/new files]

### Component/Layer name
#### [MODIFY] [File Basename](file:///path/to/file)
- Detailed bullet points explaining the exact edits

#### [NEW] [File Basename](file:///path/to/file)
- Detailed bullet points explaining the contents of the new file

## Verification Plan
[Automated and manual checks to run after implementation]
```

---

## Step 6: Proposal Submission & Approval
- Write the plan to the artifact file.
- When creating or saving the artifact, ensure `RequestFeedback` is set to `true` in the metadata.
- **Stop and wait for the user's explicit approval** before writing any production code.
