# Dynamic Greeting Name Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show the first name saved in Settings in the dashboard greeting, with `صديقي` as the empty-name fallback.

**Architecture:** Add a pure profile-name formatting helper and test it independently. Extend the dashboard's existing server-side data query to load the profile name in parallel, format it, and pass it through the existing `DashboardCharts` prop.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Node test runner with `tsx`

---

### Task 1: Add tested greeting-name formatting

**Files:**
- Create: `lib/profile-name.ts`
- Create: `lib/profile-name.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import assert from 'node:assert/strict';
import test from 'node:test';
import { greetingName } from './profile-name';

test('returns the first word from a full Arabic name', () => {
  assert.equal(greetingName('محمد أحمد علي'), 'محمد');
});

test('trims repeated whitespace before selecting the first name', () => {
  assert.equal(greetingName('  محمد   أحمد  '), 'محمد');
});

test('preserves a single-word name', () => {
  assert.equal(greetingName('حمود'), 'حمود');
});

test('returns the Arabic fallback for missing or blank names', () => {
  assert.equal(greetingName(undefined), 'صديقي');
  assert.equal(greetingName('   '), 'صديقي');
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --import tsx --test lib/profile-name.test.ts`

Expected: FAIL because `lib/profile-name.ts` does not exist.

- [ ] **Step 3: Write the minimal implementation**

```ts
const GREETING_NAME_FALLBACK = 'صديقي';

export function greetingName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] || GREETING_NAME_FALLBACK;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `node --import tsx --test lib/profile-name.test.ts`

Expected: four passing tests.

### Task 2: Load the saved name in the dashboard

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Import the profile table and helper**

Update the imports:

```ts
import { db, applications, reports, pipeline, profile } from '@/lib/db';
import { greetingName } from '@/lib/profile-name';
```

- [ ] **Step 2: Include a greeting name in demo-mode stats**

Add this property to the demo return value:

```ts
greetingName: greetingName('Demo User'),
```

- [ ] **Step 3: Query the profile name in parallel**

Extend the existing `Promise.all`:

```ts
const [allApps, allReports, pendingPipelineRows, profileNameRows] = await Promise.all([
  db.select().from(applications).orderBy(desc(applications.createdAt)),
  db.select().from(reports).orderBy(desc(reports.createdAt)).limit(5),
  db.select({ addedAt: pipeline.addedAt }).from(pipeline).where(eq(pipeline.status, 'pending')),
  db.select({ value: profile.value }).from(profile).where(eq(profile.key, 'name')).limit(1),
]);
```

- [ ] **Step 4: Add the formatted name to production stats**

Add this property to the production return value:

```ts
greetingName: greetingName(profileNameRows[0]?.value),
```

- [ ] **Step 5: Replace the hard-coded prop**

```tsx
<DashboardCharts
  scoreDist={stats.scoreDist}
  recentApps={stats.recentApps}
  greetingName={stats.greetingName}
  activePct={stats.total > 0 ? (stats.applied / stats.total) * 100 : 0}
/>
```

### Task 3: Verify the complete change

**Files:**
- Verify: `lib/profile-name.ts`
- Verify: `lib/profile-name.test.ts`
- Verify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Run the focused unit tests**

Run: `node --import tsx --test lib/profile-name.test.ts`

Expected: four passing tests.

- [ ] **Step 2: Run lint**

Run: `npm.cmd run lint`

Expected: exit code 0 with no new lint errors.

- [ ] **Step 3: Run the production build**

Run: `npm.cmd run build`

Expected: exit code 0 and successful Next.js compilation.

- [ ] **Step 4: Review the diff**

Run: `git diff --check` and `git diff -- app/(dashboard)/page.tsx lib/profile-name.ts lib/profile-name.test.ts`

Expected: no whitespace errors; only the intended data-loading, helper, and test changes.
