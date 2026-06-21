# Clear Pending Jobs After CV Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete pending pipeline jobs on the first successful scan after the CV changes, while preserving completed jobs, applications, and reports.

**Architecture:** Add a small Node-only helper that hashes normalized CV text and decides whether cleanup is required. The scan route stores the last successful CV fingerprint in the existing profile key/value table, deletes only pending pipeline rows and their matching scan-history rows when the fingerprint changes, then returns the cleanup count for the existing pipeline UI.

**Tech Stack:** Next.js 16 Route Handlers, TypeScript, Drizzle ORM, PostgreSQL, Node `crypto`, Node test runner with `tsx`

---

### Task 1: CV Scan Fingerprint Helper

**Files:**
- Create: `lib/scan-cv-state.ts`
- Create: `lib/scan-cv-state.test.ts`

- [ ] **Step 1: Write the failing helper tests**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fingerprintCv,
  shouldClearPendingJobs,
} from './scan-cv-state';

test('normalizes surrounding whitespace before hashing a CV', () => {
  assert.equal(fingerprintCv('  same cv\n'), fingerprintCv('same cv'));
});

test('clears pending jobs when a stored fingerprint differs', () => {
  assert.equal(shouldClearPendingJobs('old', 'new'), true);
});

test('does not clear pending jobs when the fingerprint is unchanged', () => {
  assert.equal(shouldClearPendingJobs('same', 'same'), false);
});

test('establishes a baseline without clearing when no fingerprint exists', () => {
  assert.equal(shouldClearPendingJobs(undefined, 'current'), false);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```powershell
node --import tsx --test lib/scan-cv-state.test.ts
```

Expected: FAIL because `lib/scan-cv-state.ts` does not exist.

- [ ] **Step 3: Implement the minimal helper**

```ts
import { createHash } from 'node:crypto';

export const LAST_SCANNED_CV_FINGERPRINT_KEY = '__lastScannedCvFingerprint';

export function fingerprintCv(cv?: string): string {
  return createHash('sha256').update((cv ?? '').trim()).digest('hex');
}

export function shouldClearPendingJobs(
  previousFingerprint: string | undefined,
  currentFingerprint: string,
): boolean {
  return Boolean(previousFingerprint && previousFingerprint !== currentFingerprint);
}
```

- [ ] **Step 4: Run the tests and verify GREEN**

Run:

```powershell
node --import tsx --test lib/scan-cv-state.test.ts
```

Expected: 4 tests pass.

### Task 2: Scan Route Cleanup and Fingerprint Persistence

**Files:**
- Create: `app/api/scan/route.cleanup.test.mjs`
- Create: `app/api/profile/route.cv-change.test.mjs`
- Modify: `app/api/scan/route.ts`
- Modify: `app/api/profile/route.ts`

- [ ] **Step 1: Write the failing route contract tests**

Read `app/api/scan/route.ts` and assert that it:

```js
assert.match(source, /eq\(pipelineTable\.status,\s*'pending'\)/);
assert.match(source, /inArray\(scanHistory\.url,\s*pendingUrls\)/);
assert.match(source, /LAST_SCANNED_CV_FINGERPRINT_KEY/);
assert.match(source, /clearedPending/);
assert.doesNotMatch(source, /delete\(applications\)|delete\(reports\)/);
```

- [ ] **Step 2: Run the route tests and verify RED**

Run:

```powershell
node --test app/api/scan/route.cleanup.test.mjs
```

Expected: FAIL because the route has no pending cleanup or fingerprint persistence.

- [ ] **Step 3: Implement cleanup before duplicate detection**

In `app/api/scan/route.ts`:

- Import `eq` and `inArray` from `drizzle-orm`.
- Import `profile` from `@/lib/db`.
- Import the fingerprint helper and internal profile key.
- Compute the current fingerprint from `derived.cv`.
- Read the stored fingerprint.
- If the stored fingerprint differs:
  - select URLs from rows where `pipeline.status = 'pending'`;
  - delete only those pending pipeline rows;
  - delete only matching `scan_history` rows;
  - set `clearedPending` to the number of selected pending rows.
- Build `knownUrls` after cleanup.
- After scanning and insertion complete, upsert the current fingerprint.
- Return `clearedPending` in the JSON response.

In `app/api/profile/route.ts`, hide profile keys beginning with `__`. When a
changed CV is saved and no last-scan fingerprint exists, store the old CV
fingerprint as the initial baseline. This ensures the next scan can detect the
change without deleting anything during settings save.

The profile upsert must be:

```ts
await db
  .insert(profile)
  .values({ key: LAST_SCANNED_CV_FINGERPRINT_KEY, value: currentFingerprint })
  .onConflictDoUpdate({
    target: profile.key,
    set: { value: currentFingerprint, updatedAt: new Date() },
  });
```

- [ ] **Step 4: Run helper and route tests**

Run:

```powershell
node --import tsx --test lib/scan-cv-state.test.ts
node --test app/api/scan/route.cleanup.test.mjs
```

Expected: all tests pass.

### Task 3: Show Cleanup Count and Verify

**Files:**
- Create: `app/(dashboard)/pipeline/PipelineClient.cleanup.test.mjs`
- Modify: `app/(dashboard)/pipeline/PipelineClient.tsx`

- [ ] **Step 1: Write a failing UI contract test**

Assert that the scan result type includes `clearedPending`, the response maps
`data.clearedPending`, and the success alert conditionally renders the removed
pending count.

- [ ] **Step 2: Run the UI test and verify RED**

Run:

```powershell
node --test "app/(dashboard)/pipeline/PipelineClient.cleanup.test.mjs"
```

Expected: FAIL because the UI ignores the cleanup count.

- [ ] **Step 3: Implement the minimal UI update**

Extend the scan result type:

```ts
{
  found: number;
  added: number;
  clearedPending?: number;
  titleFilter?: string[];
}
```

Map `clearedPending: data.clearedPending` in `handleScan`. In the existing
success alert, conditionally show an Arabic sentence when the value is greater
than zero:

```tsx
{Boolean(scanResult.clearedPending) && (
  <span className="text-xs text-muted-foreground">
    تم حذف {scanResult.clearedPending} من الوظائف القديمة قيد الانتظار بعد تغيير السيرة الذاتية.
  </span>
)}
```

- [ ] **Step 4: Run focused and existing tests**

Run:

```powershell
node --import tsx --test lib/scan-cv-state.test.ts
node --test app/api/scan/route.cleanup.test.mjs
node --test "app/(dashboard)/pipeline/PipelineClient.cleanup.test.mjs"
node --test "app/(dashboard)/pipeline/PipelineClient.layout.test.mjs"
```

Expected: all tests pass.

- [ ] **Step 5: Run repository verification**

Run:

```powershell
npm.cmd run lint
npm.cmd run build
git diff --check
```

Expected: lint and build exit 0, and `git diff --check` produces no errors.
