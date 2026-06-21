# Scan Company Dialog Height Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the pipeline company picker fully inside the viewport while allowing only the company list to scroll.

**Architecture:** Apply viewport-bounded flex layout utilities directly to the pipeline dialog instance, leaving the shared dialog primitive unchanged. Add a narrow source-level regression test because the repository has no configured component or browser test runner.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Node.js test runner.

---

### Task 1: Add a failing dialog-layout regression test

**Files:**
- Create: `app/(dashboard)/pipeline/PipelineClient.layout.test.mjs`
- Test: `app/(dashboard)/pipeline/PipelineClient.layout.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./PipelineClient.tsx', import.meta.url),
  'utf8',
);

test('bounds the company picker to the viewport', () => {
  assert.match(
    source,
    /<DialogContent className="flex max-h-\[calc\(100dvh-2rem\)\] flex-col overflow-hidden">/,
  );
});

test('uses the remaining dialog height for the scrollable company list', () => {
  assert.match(
    source,
    /className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"/,
  );
  assert.doesNotMatch(source, /className="flex max-h-72 flex-col gap-1 overflow-y-auto"/);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
node --test "app/(dashboard)/pipeline/PipelineClient.layout.test.mjs"
```

Expected: both tests fail because the dialog has no viewport height bound and the list still uses `max-h-72`.

### Task 2: Apply the viewport-bounded flex layout

**Files:**
- Modify: `app/(dashboard)/pipeline/PipelineClient.tsx:151`
- Modify: `app/(dashboard)/pipeline/PipelineClient.tsx:202`
- Test: `app/(dashboard)/pipeline/PipelineClient.layout.test.mjs`

- [ ] **Step 1: Bound the dialog and switch it to flex layout**

Replace:

```tsx
<DialogContent>
```

with:

```tsx
<DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden">
```

- [ ] **Step 2: Make the company list consume and scroll within remaining space**

Replace:

```tsx
<div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
```

with:

```tsx
<div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
```

- [ ] **Step 3: Run the regression test**

Run:

```powershell
node --test "app/(dashboard)/pipeline/PipelineClient.layout.test.mjs"
```

Expected: 2 tests pass.

- [ ] **Step 4: Run focused lint**

Run:

```powershell
npm.cmd run lint -- "app/(dashboard)/pipeline/PipelineClient.tsx"
```

Expected: exit code 0 with no lint errors.

- [ ] **Step 5: Run the production build**

Run:

```powershell
npm.cmd run build
```

Expected: exit code 0.

- [ ] **Step 6: Verify the rendered interaction**

Start the development server and verify:

1. Open `/pipeline`.
2. Press `مسح البوابات`.
3. Confirm the dialog stays inside desktop and mobile viewports.
4. Confirm the company list scrolls.
5. Confirm the header, search field, selection control, close control, and footer action remain visible and usable.

- [ ] **Step 7: Review the final diff**

Run:

```powershell
git diff --check
git diff -- "app/(dashboard)/pipeline/PipelineClient.tsx" "app/(dashboard)/pipeline/PipelineClient.layout.test.mjs"
```

Expected: no whitespace errors and only the intended layout/test changes.
