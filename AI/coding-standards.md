# Coding Standards

These rules apply to every line of code written for this project. They are non-negotiable. ESLint enforces many of them automatically — treat every ESLint warning as an error.

---

## TypeScript

### Strict Mode

The project uses TypeScript strict mode (`tsconfig.json` → `"strict": true`). This enables:
- `noImplicitAny`
- `strictNullChecks`
- `strictFunctionTypes`
- All other strict checks

### No `any`

```typescript
// ❌ Forbidden
function process(data: any) { ... }

// ✅ Use unknown if type is genuinely unknown
function process(data: unknown) {
  if (typeof data === 'string') { ... }
}

// ✅ Use a proper interface
function process(data: ShareholderApplication) { ... }
```

### Interface-First

Define a TypeScript interface in `src/types/` **before** writing the component or function that uses it. Never define interfaces inline inside components.

```typescript
// ❌ Wrong — inline interface in component file
const MyComponent = ({ data }: { name: string; value: number }) => ...

// ✅ Correct — defined in src/types/
// src/types/index.ts
export interface MyData { name: string; value: number; }
// src/components/sections/home/MyComponent.tsx
import type { MyData } from '@/types';
const MyComponent = ({ data }: { data: MyData }) => ...
```

### Explicit Return Types on Public Functions

```typescript
// ✅ Service layer functions always have explicit return types
export function generateApplicationId(): string { ... }
export async function submitShareholderApplication(data: ShareholderApplication): Promise<SubmitResult> { ... }
```

### Type Imports

Use `import type` for type-only imports to ensure they are erased at runtime.

```typescript
import type { ShareholderApplication } from '@/types/membership';
```

---

## Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React component | `PascalCase` | `JoinFormSection` |
| TypeScript interface | `PascalCase` | `ShareholderApplication` |
| TypeScript type alias | `PascalCase` | `ServiceCategory` |
| Function | `camelCase` | `generateApplicationId` |
| Variable | `camelCase` | `isSubmitting` |
| Module-level constant | `SCREAMING_SNAKE_CASE` | `PRODUCER_CATEGORIES` |
| File (component) | `PascalCase.tsx` | `JoinFormSection.tsx` |
| File (library/hook) | `camelCase.ts` | `membership.ts`, `useServiceDiscovery.ts` |
| CSS class | `kebab-case` | `.shadow-tribal`, `.animate-fade-in` |

### One Component Per File

Each file exports exactly one React component. The filename matches the component name exactly.

```
JoinFormSection.tsx → export function JoinFormSection() { ... }
Container.tsx       → export function Container() { ... }
```

---

## Component Rules

### Never Declare Components Inside Components

```typescript
// ❌ FORBIDDEN — causes React Hook Rule violations
// Every re-render creates a new function identity, resetting state
export function JoinFormSection() {
  function FileUploadZone({ field }: Props) { // ← WRONG
    return <div>...</div>;
  }
  return <FileUploadZone field="aadhaarCard" />;
}

// ✅ Correct — declare outside the parent component
function FileUploadZone({ field }: Props) { // ← Stable identity
  return <div>...</div>;
}
export function JoinFormSection() {
  return <FileUploadZone field="aadhaarCard" />;
}
```

This mistake causes intermittent state reset bugs that are very difficult to diagnose. It is the most common AI-generated error in this codebase. See `workflows/bug-fix.md` for how to identify it.

### `'use client'` Placement

Add `'use client'` only at the **lowest component** in the tree that needs browser APIs or React state:

```
app/join/page.tsx               ← Server Component (no 'use client')
  └── JoinPortalClient.tsx      ← 'use client' here (has useState)
        └── JoinFormSection.tsx ← Also 'use client' (has useState, file APIs)
```

Never add `'use client'` to:
- `app/layout.tsx`
- `app/page.tsx` (unless the page itself is interactive, which is rare)
- Data files or library files

---

## Data Rules

### No Inline Static Data

```typescript
// ❌ Wrong — data defined inside a component
export function HeroSection() {
  const stats = [
    { value: '15+', label: 'Founding Leaders' },
    { value: '3', label: 'Districts' },
  ];
  return <StatBar stats={stats} />;
}

// ✅ Correct — data in src/data/
// src/data/stats.ts
export const statsData = [
  { value: '15+', label: 'Founding Leaders' },
  ...
];
// src/components/sections/home/HeroSection.tsx
import { statsData } from '@/data/stats';
```

### No Hardcoded Brand Strings

```typescript
// ❌ Wrong — hardcoded phone number
<a href="tel:+919348747578">Call us</a>

// ✅ Correct — sourced from data layer
import { companyInfo } from '@/data/company';
<a href={`tel:${companyInfo.phone}`}>Call us</a>
```

This applies to: phone numbers, WhatsApp numbers, email addresses, company name, address, working hours, and social media links.

---

## Import Order

ESLint enforces this. Keep imports in this order:

```typescript
// 1. Next.js
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// 2. React
import { useState, useEffect } from 'react';

// 3. Third-party libraries
import { jsPDF } from 'jspdf';

// 4. Local — components (@/components)
import { Container } from '@/components/common/Container';

// 5. Local — lib, hooks, data (@/lib, @/hooks, @/data, @/constants)
import { submitShareholderApplication } from '@/lib/membership';
import { companyInfo } from '@/data/company';

// 6. Local — types (use `import type`)
import type { ShareholderApplication } from '@/types/membership';
```

---

## Accessibility Minimums

Every interactive component must meet these requirements:

### Form Fields

```tsx
<input
  id="fullName"
  name="fullName"
  aria-invalid={!!errors.fullName}
  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
/>
{errors.fullName && (
  <p id="fullName-error" role="alert" className="text-red-500">
    {errors.fullName}
  </p>
)}
```

### Custom Interactive Elements

If an element is not a native `<button>`, `<input>`, `<select>`, or `<a>`, it must have:
- `role="..."` (correct ARIA role)
- `aria-label="..."` or `aria-labelledby="..."`
- Keyboard activation (Enter/Space)
- Focus ring: `focus:ring-2 focus:ring-primary/20 focus:outline-none`

### Checkboxes (Custom Styled)

```tsx
<button
  type="button"
  role="checkbox"
  aria-checked={isChecked}
  onClick={handleToggle}
  className="... focus:ring-2 focus:ring-primary/20 focus:outline-none"
>
```

---

## Style Rules

```typescript
// ❌ No inline styles (except dynamic values that cannot be expressed as a class)
<div style={{ color: '#0B6B3A' }}>  // ← Wrong, use text-primary

// ✅ Exception — dynamic value from state
<div style={{ width: `${(step / 9) * 100}%` }}>  // ← OK, cannot be a static class
```

---

## Build Gates

A task is **not complete** until both pass with zero output:

```bash
npm run lint    # Zero errors, zero warnings
npm run build   # Zero compilation errors, all pages generated
```

If lint produces warnings, fix them before declaring the task done. There are no acceptable warnings.

---

## Common Anti-Patterns (APC-Specific)

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| `setState` synchronously in `useEffect` | React warning: "Cannot update during an existing state transition" | Wrap in `setTimeout(() => setState(...), 0)` |
| Component declared inside render function | State randomly resets; "Rendered more hooks than previous render" | Move component declaration outside parent |
| Missing `'use client'` | Hydration error; `useState` not a function | Add `'use client'` at the top of the file |
| Relative imports | `../../../lib/utils` | Use `@/lib/utils` |
| Generic Tailwind colours | `text-green-700` instead of `text-primary` | Use design system tokens |
| Hardcoded phone number | `+91 9348747578` in JSX | Import from `@/data/company` |
