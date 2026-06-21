# RTL Dialog Close Position Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Position dialog close buttons at the top-left in RTL pages while preserving top-right positioning in LTR pages.

**Architecture:** Replace the physical horizontal positioning utility in the shared dialog component with Tailwind's logical inline-end utility. Protect the behavior with a focused source-level regression test.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, Node.js test runner.

---

### Task 1: Add the regression test

**Files:**
- Create: `components/ui/dialog.layout.test.mjs`
- Test: `components/ui/dialog.layout.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./dialog.tsx', import.meta.url), 'utf8');

test('positions the dialog close button at the logical inline end', () => {
  assert.match(source, /className="absolute top-2 end-2"/);
  assert.doesNotMatch(source, /className="absolute top-2 right-2"/);
});
```

- [ ] **Step 2: Verify the test fails**

Run:

```powershell
node --test "components/ui/dialog.layout.test.mjs"
```

Expected: failure because the component still uses `right-2`.

### Task 2: Use logical positioning

**Files:**
- Modify: `components/ui/dialog.tsx`
- Test: `components/ui/dialog.layout.test.mjs`

- [ ] **Step 1: Replace the physical utility**

Replace:

```tsx
className="absolute top-2 right-2"
```

with:

```tsx
className="absolute top-2 end-2"
```

- [ ] **Step 2: Run the regression test**

Run:

```powershell
node --test "components/ui/dialog.layout.test.mjs"
```

Expected: one passing test.

- [ ] **Step 3: Run focused lint**

Run:

```powershell
npm.cmd run lint -- "components/ui/dialog.tsx"
```

Expected: exit code 0.

- [ ] **Step 4: Run the production build**

Run:

```powershell
npm.cmd run build
```

Expected: exit code 0.

- [ ] **Step 5: Review the diff**

Run:

```powershell
git diff --check
git diff -- "components/ui/dialog.tsx" "components/ui/dialog.layout.test.mjs"
```

Expected: no whitespace errors and only the intended positioning change plus its test.
