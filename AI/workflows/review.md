# Workflow: Code and UX Review

This workflow documents the review process that developers or AI assistants must execute to audit the code quality, visual design, responsive layouts, accessibility, and performance of any change.

---

## 1. Code Quality Audit Checklist
Verify that the implementation meets our engineering guidelines:
- [ ] **TypeScript Strictness**: Genuinely zero occurrences of `any`. Interfaces are defined in `src/types/` rather than inline.
- [ ] **Naming Rules**: PascalCase for components/interfaces, camelCase for variables/functions, SCREAMING_SNAKE_CASE for constants.
- [ ] **File Mapping**: Exactly one default export component per file. Filename matches component name.
- [ ] **Data Rule**: No static data arrays inline in JSX. Data is cleanly sourced from `src/data/` or `src/constants/`.
- [ ] **Boundary Check**: `'use client'` is placed at the lowest interactive component, not in routing containers or page frames.
- [ ] **Import Sorting**: Imports follow the standardized sorting rules (Next.js -> React -> Third-party -> Local aliases -> Types).

---

## 2. Design System Audit Checklist
Verify that visual styling matches the APC brand rules:
- [ ] **Brand Colors**: Uses CSS variables (`bg-primary`, `text-primary`, `bg-tribal-gold`, etc.) rather than hardcoded hex classes.
- [ ] **Typography Scale**: Only uses predefined utility classes (`.text-display-lg`, `.text-headline-md`, etc.). Custom arbitrary sizes are forbidden.
- [ ] **Visual Patterns**: Correct use of `.saura-pattern` for backgrounds and `.glass-card` / `.shadow-tribal` for elevations.
- [ ] **Animations**: Transitions are smooth and premium. Accordions expand smoothly; modals slide/fade correctly. Avoid flashy or rapid animations.

---

## 3. Accessibility (a11y) Checklist
Ensure the interface is usable for all members:
- [ ] **Form Inputs**: Every `<input>`, `<select>`, and `<textarea>` has a corresponding `<label>`, correct `id`, and dynamic `aria-invalid` bindings.
- [ ] **Error Alerts**: Errors are rendered with `role="alert"` and linked using `aria-describedby`.
- [ ] **Focus Rings**: Keyboard navigation yields high-contrast gold outlines (`.focus-ring` / `focus:ring-2 focus:ring-tribal-gold`).
- [ ] **Keyboard Usability**: Custom interactive elements (e.g. checkbox buttons) support Enter/Space activation and have appropriate ARIA roles.

---

## 4. Responsive Layout Checklist
Ensure visual appeal across device widths:
- [ ] **Small Mobile (320px - 375px)**: Forms wrap correctly; text does not overflow screen edges; padding is compact (`px-4` or `px-5`).
- [ ] **Tablet (768px)**: Multi-column grids wrap appropriately; navigation converts to drawer menu.
- [ ] **Desktop (1024px - 1440px)**: Content aligns inside `<Container>` (max-width 1280px); horizontal padding is expanded (`px-16`).
- [ ] **Scrolling**: No horizontal scrollbars are visible under any window size.

---

## 5. Performance Checklist
Verify resource optimization:
- [ ] **Re-renders**: No synchronous state updates in `useEffect` (use timeouts or event handlers instead).
- [ ] **Large Datasets**: Search and filter computations are debounced or offloaded to server/API routes.
- [ ] **Image Assets**: Standard images use `next/image` with proper sizing hints (`sizes` attribute) to optimize loading.

---

## 6. Documentation Compliance
- [ ] **STATUS.md**: Verified that [`AI/STATUS.md`](../STATUS.md) lists new routes, features, and actual build verification dates.
- [ ] **Changelog**: Verified that [`AI/changelog.md`](../changelog.md) records the changes accurately.
