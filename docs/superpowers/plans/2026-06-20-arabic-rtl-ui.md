# Arabic (RTL) UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the Career-Ops web dashboard UI from English to Arabic with a right-to-left layout, using the provided Thmanyah Sans fonts, while keeping all CV/PDF generation output in English.

**Architecture:** No i18n library. Strings are translated in place. The document is set to `lang="ar" dir="rtl"` so the browser drives RTL; Tailwind v4 logical utilities (`ms/me/ps/pe/start/end`) replace physical-direction classes where they affect layout. Status / legitimacy / pipeline-status *display* labels are mapped to Arabic via small helpers in `lib/utils.ts` while the underlying English values stay unchanged in data and API calls. The sidebar is explicitly placed on the right (`side="right"`) because it uses physical `left-0`/`right-0` positioning that `dir` alone does not flip.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, shadcn/ui, `next/font/local`.

**Verification note:** This is an i18n/CSS task, not algorithmic logic, so there are no meaningful unit tests. Each task is verified by (a) `npx tsc --noEmit` typecheck + `npm run lint`, and (b) visual confirmation in the dev server. The final task runs the app and checks every page plus confirms CV output is still English.

**Out of scope (do NOT translate):**
- `app/dashboard/page.tsx` and its demo-only components (`components/app-sidebar.tsx`, `components/site-header.tsx`, `components/data-table.tsx`, `components/section-cards.tsx`, `components/nav-*.tsx`, `components/chart-area-interactive.tsx`) — this is a standalone leftover shadcn demo route, not part of the real Career-Ops navigation.
- `app/api/pdf/route.ts`, the CV HTML template, the Claude prompt, generated CV output.
- Generated report body content (rendered as stored).
- CV section names inside Settings (Summary/Experience/Projects/Education/Skills) and CV/profile textarea placeholders — these describe English CV content.

---

## Canonical Arabic string map (single source of truth for this plan)

Use these exact translations wherever the English appears. Brand name **"Career-Ops"** stays as-is everywhere.

| English | Arabic |
|---|---|
| AI pipeline (sidebar subtitle) | مسار الذكاء الاصطناعي |
| AI job search pipeline (header) | مسار البحث عن وظيفة بالذكاء الاصطناعي |
| Quick evaluate | تقييم سريع |
| Workspace | مساحة العمل |
| Tools | الأدوات |
| Dashboard | لوحة التحكم |
| Applications | الطلبات |
| Pipeline | قائمة الانتظار |
| Reports | التقارير |
| Settings | الإعدادات |
| Company | الشركة |
| Role | الدور |
| Date | التاريخ |
| Score | التقييم |
| Status | الحالة |
| Actions | إجراءات |
| Refresh | تحديث |

Status display labels (canonical value → Arabic):
Evaluated→تم التقييم · Applied→تم التقديم · Responded→تم الرد · Interview→مقابلة · Offer→عرض · Rejected→مرفوض · Discarded→مُستبعد · SKIP→تخطّي

Legitimacy display labels: `High Confidence`→موثوقية عالية · `Suspicious`→مشبوه · (anything else → show raw value)

Pipeline status labels: `pending`→قيد الانتظار · `done`→مكتمل

---

## Task 1: Fonts + document direction

**Files:**
- Create: `app/fonts/thmanyahsans-Light.woff2`, `app/fonts/thmanyahsans-Regular.woff2`, `app/fonts/thmanyahsans-Medium.woff2` (copied)
- Modify: `app/layout.tsx`

- [ ] **Step 1: Copy the font files into the project**

Run (Git Bash):
```bash
mkdir -p app/fonts
cp /c/Users/zeka1/Downloads/thmanyahsans-Light.woff2 app/fonts/
cp /c/Users/zeka1/Downloads/thmanyahsans-Regular.woff2 app/fonts/
cp /c/Users/zeka1/Downloads/thmanyahsans-Medium.woff2 app/fonts/
ls app/fonts/
```
Expected: the three `.woff2` files listed.

- [ ] **Step 2: Rewrite `app/layout.tsx`** to register the local Arabic font as `--font-sans`, set `lang="ar" dir="rtl"`, and translate metadata. Replace the whole file with:

```tsx
import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import { TooltipProvider } from '@/components/ui/tooltip';
import './globals.css';
import { cn } from "@/lib/utils";

const thmanyah = localFont({
  variable: '--font-sans',
  src: [
    { path: './fonts/thmanyahsans-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/thmanyahsans-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/thmanyahsans-Medium.woff2', weight: '500', style: 'normal' },
  ],
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'Career-Ops',
  description: 'مسار البحث عن وظيفة بالذكاء الاصطناعي',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", thmanyah.variable)} data-scroll-behavior="smooth">
      <body className={`${thmanyah.variable} ${geistMono.variable} font-sans`}>
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors. (If `next/font/local` complains about the `src` path, confirm the files exist from Step 1.)

- [ ] **Step 4: Commit**

```bash
git add app/fonts app/layout.tsx
git commit -m "feat(i18n): add Arabic Thmanyah font and set RTL document direction"
```

---

## Task 2: Arabic display-label helpers + StatusBadge

**Files:**
- Modify: `lib/utils.ts`
- Modify: `components/StatusBadge.tsx`

- [ ] **Step 1: Append label maps + helpers to `lib/utils.ts`** (after the existing `CANONICAL_STATUSES` export):

```ts
export const STATUS_LABELS_AR: Record<string, string> = {
  Evaluated: "تم التقييم",
  Applied: "تم التقديم",
  Responded: "تم الرد",
  Interview: "مقابلة",
  Offer: "عرض",
  Rejected: "مرفوض",
  Discarded: "مُستبعد",
  SKIP: "تخطّي",
}

export function statusLabel(status: string): string {
  return STATUS_LABELS_AR[status] ?? status
}

export const LEGITIMACY_LABELS_AR: Record<string, string> = {
  "High Confidence": "موثوقية عالية",
  Suspicious: "مشبوه",
}

export function legitimacyLabel(legitimacy: string | null): string {
  if (!legitimacy) return ""
  return LEGITIMACY_LABELS_AR[legitimacy] ?? legitimacy
}

export const PIPELINE_STATUS_LABELS_AR: Record<string, string> = {
  pending: "قيد الانتظار",
  done: "مكتمل",
}

export function pipelineStatusLabel(status: string): string {
  return PIPELINE_STATUS_LABELS_AR[status] ?? status
}
```

- [ ] **Step 2: Update `components/StatusBadge.tsx`** to render the Arabic label. Change the import line and the rendered text:

Change:
```tsx
import { cn } from '@/lib/utils';
```
to:
```tsx
import { cn, statusLabel } from '@/lib/utils';
```

Change (the line that renders the status, currently `{status}` on the last content line before the closing `</span>`):
```tsx
      {status}
```
to:
```tsx
      {statusLabel(status)}
```

(Leave `STATUS_DOT` keyed by the canonical English `status` — only the displayed text changes.)

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add lib/utils.ts components/StatusBadge.tsx
git commit -m "feat(i18n): add Arabic display-label helpers and localize StatusBadge"
```

---

## Task 3: Sidebar + dashboard layout chrome + DemoBanner

**Files:**
- Modify: `components/Sidebar.tsx`
- Modify: `app/(dashboard)/layout.tsx`
- Modify: `components/DemoBanner.tsx`

- [ ] **Step 1: `components/Sidebar.tsx` — place sidebar on the right and translate labels.**

Change the primitive opening tag:
```tsx
    <SidebarPrimitive collapsible="offcanvas" variant="inset">
```
to:
```tsx
    <SidebarPrimitive collapsible="offcanvas" variant="inset" side="right">
```

Change the nav arrays:
```tsx
const primaryNav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', icon: Briefcase, badge: '10' },
  { href: '/pipeline', label: 'Pipeline', icon: GitBranch, badge: '3' },
  { href: '/reports', label: 'Reports', icon: FileText },
];

const toolNav = [
  { href: '/settings', label: 'Settings', icon: Settings },
];
```
to:
```tsx
const primaryNav = [
  { href: '/', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/applications', label: 'الطلبات', icon: Briefcase, badge: '10' },
  { href: '/pipeline', label: 'قائمة الانتظار', icon: GitBranch, badge: '3' },
  { href: '/reports', label: 'التقارير', icon: FileText },
];

const toolNav = [
  { href: '/settings', label: 'الإعدادات', icon: Settings },
];
```

Change the header subtitle:
```tsx
                <span className="truncate text-xs text-sidebar-foreground/70">AI pipeline</span>
```
to:
```tsx
                <span className="truncate text-xs text-sidebar-foreground/70">مسار الذكاء الاصطناعي</span>
```

Change the "Quick evaluate" button tooltip + label:
```tsx
                  tooltip="Quick evaluate"
```
to:
```tsx
                  tooltip="تقييم سريع"
```
and:
```tsx
                  <span>Quick evaluate</span>
```
to:
```tsx
                  <span>تقييم سريع</span>
```

Change the group labels:
```tsx
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
```
to:
```tsx
          <SidebarGroupLabel>مساحة العمل</SidebarGroupLabel>
```
and:
```tsx
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
```
to:
```tsx
          <SidebarGroupLabel>الأدوات</SidebarGroupLabel>
```

(The `<SidebarHeader>` title text "Career-Ops" and tooltip stay English — brand name.)

- [ ] **Step 2: `app/(dashboard)/layout.tsx` — translate header subtitle.**

Change:
```tsx
            <p className="truncate text-xs text-muted-foreground md:hidden">AI job search pipeline</p>
```
to:
```tsx
            <p className="truncate text-xs text-muted-foreground md:hidden">مسار البحث عن وظيفة بالذكاء الاصطناعي</p>
```

(The "Career-Ops" line stays English — brand name.)

- [ ] **Step 3: `components/DemoBanner.tsx` — translate banner text.**

Replace the `<AlertDescription>...</AlertDescription>` block with:
```tsx
      <AlertDescription>
        <strong>وضع العرض التجريبي</strong> - يعرض بيانات تجريبية. أضِف{' '}
        <code className="rounded bg-background/70 px-1">DATABASE_URL</code> و{' '}
        <code className="rounded bg-background/70 px-1">ANTHROPIC_API_KEY</code> في{' '}
        <code className="rounded bg-background/70 px-1">.env.local</code> لاستخدام بيانات حقيقية.
      </AlertDescription>
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add components/Sidebar.tsx "app/(dashboard)/layout.tsx" components/DemoBanner.tsx
git commit -m "feat(i18n): localize sidebar, dashboard header and demo banner to Arabic"
```

---

## Task 4: Dashboard page

**Files:**
- Modify: `app/(dashboard)/page.tsx`

- [ ] **Step 1: Translate the `monthDelta` suffix.** There are three occurrences of `suffix: 'vs last month'`. Replace all three:
```tsx
suffix: 'vs last month',
```
with:
```tsx
suffix: 'مقارنة بالشهر الماضي',
```

- [ ] **Step 2: Translate the stat-card labels.** Change:
```tsx
  const statCards = [
    { label: 'Total Evaluated', value: stats.total, delta: stats.deltas.total },
    { label: 'Applied', value: stats.applied, delta: stats.deltas.applied },
    { label: 'Interviews', value: stats.interviews, delta: stats.deltas.interviews },
    { label: 'Pipeline Pending', value: stats.pendingPipeline, delta: stats.deltas.pipeline },
  ];
```
to:
```tsx
  const statCards = [
    { label: 'إجمالي المُقيَّمة', value: stats.total, delta: stats.deltas.total },
    { label: 'تم التقديم', value: stats.applied, delta: stats.deltas.applied },
    { label: 'المقابلات', value: stats.interviews, delta: stats.deltas.interviews },
    { label: 'قيد الانتظار', value: stats.pendingPipeline, delta: stats.deltas.pipeline },
  ];
```

- [ ] **Step 3: Translate the heading + remaining strings, and fix the RTL margin.**

Change:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your job search pipeline at a glance</p>
```
to:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">لوحة التحكم</h1>
        <p className="mt-1 text-sm text-muted-foreground">نظرة سريعة على مسار بحثك عن عمل</p>
```

Change the delta-suffix margin from physical to logical:
```tsx
                  {delta.suffix ? <span className="ml-1 text-[10px]">{delta.suffix}</span> : null}
```
to:
```tsx
                  {delta.suffix ? <span className="ms-1 text-[10px]">{delta.suffix}</span> : null}
```

Change:
```tsx
                <p className="text-[10px] text-muted-foreground">No change yet</p>
```
to:
```tsx
                <p className="text-[10px] text-muted-foreground">لا تغيير بعد</p>
```

Change:
```tsx
            <p className="text-sm font-medium text-muted-foreground">Recent Applications</p>
```
to:
```tsx
            <p className="text-sm font-medium text-muted-foreground">أحدث الطلبات</p>
```

Change:
```tsx
                <span className="text-xs text-muted-foreground">in your pipeline</span>
```
to:
```tsx
                <span className="text-xs text-muted-foreground">في مسارك</span>
```

Change:
```tsx
              <Clock className="size-3.5" />
              Latest
```
to:
```tsx
              <Clock className="size-3.5" />
              الأحدث
```

Change:
```tsx
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">No applications yet</p>
```
to:
```tsx
              <p className="px-6 py-6 text-center text-sm text-muted-foreground">لا توجد طلبات بعد</p>
```

Change the table head cells (and flip the last header from physical right to logical end):
```tsx
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-y border-border/60 bg-muted/40">
                      <th className="px-6 py-2.5 text-xs font-medium text-muted-foreground">Company</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Score</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">Date</th>
                      <th className="px-6 py-2.5 text-right text-xs font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
```
to:
```tsx
                <table className="w-full border-collapse text-start">
                  <thead>
                    <tr className="border-y border-border/60 bg-muted/40">
                      <th className="px-6 py-2.5 text-xs font-medium text-muted-foreground">الشركة</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">التقييم</th>
                      <th className="px-3 py-2.5 text-xs font-medium text-muted-foreground">التاريخ</th>
                      <th className="px-6 py-2.5 text-end text-xs font-medium text-muted-foreground">الحالة</th>
                    </tr>
                  </thead>
```

Change the status cell alignment:
```tsx
                          <td className="px-6 py-3.5 text-right">
                            <StatusBadge status={app.status} />
                          </td>
```
to:
```tsx
                          <td className="px-6 py-3.5 text-end">
                            <StatusBadge status={app.status} />
                          </td>
```

Change the two action buttons:
```tsx
        <Link href="/evaluate">
          <Button>Evaluate a Job</Button>
        </Link>
        <Link href="/pipeline">
          <Button variant="secondary">View Pipeline ({stats.pendingPipeline})</Button>
        </Link>
```
to:
```tsx
        <Link href="/evaluate">
          <Button>قيّم وظيفة</Button>
        </Link>
        <Link href="/pipeline">
          <Button variant="secondary">عرض القائمة ({stats.pendingPipeline})</Button>
        </Link>
```

- [ ] **Step 4: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(dashboard)/page.tsx"
git commit -m "feat(i18n): localize dashboard page to Arabic with RTL alignment"
```

---

## Task 5: Dashboard charts

**Files:**
- Modify: `components/DashboardCharts.tsx`

- [ ] **Step 1: Translate chart config + group labels.**

Change:
```tsx
const scoreChartConfig = {
  desktop: {
    label: 'Applications',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

const statusGroups = [
  { key: 'active', label: 'Active', color: '#3b82f6', statuses: ['Applied', 'Responded', 'Interview', 'Offer'] },
  { key: 'evaluated', label: 'Evaluated', color: '#8b5cf6', statuses: ['Evaluated'] },
  { key: 'closed', label: 'Closed', color: '#c4b5fd', statuses: ['Rejected', 'Discarded', 'SKIP'] },
] as const;

const statusChartConfig = {
  active: { label: 'Active', color: '#3b82f6' },
  evaluated: { label: 'Evaluated', color: '#8b5cf6' },
  closed: { label: 'Closed', color: '#c4b5fd' },
} satisfies ChartConfig;
```
to:
```tsx
const scoreChartConfig = {
  desktop: {
    label: 'الطلبات',
    color: '#3b82f6',
  },
} satisfies ChartConfig;

const statusGroups = [
  { key: 'active', label: 'نشِطة', color: '#3b82f6', statuses: ['Applied', 'Responded', 'Interview', 'Offer'] },
  { key: 'evaluated', label: 'مُقيَّمة', color: '#8b5cf6', statuses: ['Evaluated'] },
  { key: 'closed', label: 'مغلقة', color: '#c4b5fd', statuses: ['Rejected', 'Discarded', 'SKIP'] },
] as const;

const statusChartConfig = {
  active: { label: 'نشِطة', color: '#3b82f6' },
  evaluated: { label: 'مُقيَّمة', color: '#8b5cf6' },
  closed: { label: 'مغلقة', color: '#c4b5fd' },
} satisfies ChartConfig;
```

- [ ] **Step 2: Translate the visible card titles + footnotes.** (Leave the numeric `bucket` axis values `4.5+`, `4.0-4.4`, `3.5-3.9`, `<3.5` as-is — Western digits. Leave the `label` fields in `scoreChartData` as-is; they are not rendered because the tooltip uses `hideLabel`.)

Change:
```tsx
          <CardTitle className="text-sm font-medium text-muted-foreground">Score Distribution</CardTitle>
```
to:
```tsx
          <CardTitle className="text-sm font-medium text-muted-foreground">توزيع التقييمات</CardTitle>
```

Change:
```tsx
            <span className="text-xs text-muted-foreground">Avg fit score</span>
```
to:
```tsx
            <span className="text-xs text-muted-foreground">متوسط التقييم</span>
```

Change:
```tsx
          <CardTitle className="text-sm font-medium text-muted-foreground">Applications by Status</CardTitle>
```
to:
```tsx
          <CardTitle className="text-sm font-medium text-muted-foreground">الطلبات حسب الحالة</CardTitle>
```

Change:
```tsx
            <span className="text-xs text-muted-foreground">Avg per status</span>
```
to:
```tsx
            <span className="text-xs text-muted-foreground">المتوسط لكل حالة</span>
```

Change:
```tsx
            <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">No applications yet</p>
```
to:
```tsx
            <p className="flex flex-1 items-center justify-center py-10 text-center text-sm text-muted-foreground">لا توجد طلبات بعد</p>
```

Change:
```tsx
                      <span className="text-xs text-muted-foreground">Total</span>
```
to:
```tsx
                      <span className="text-xs text-muted-foreground">الإجمالي</span>
```

- [ ] **Step 3: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add components/DashboardCharts.tsx
git commit -m "feat(i18n): localize dashboard charts to Arabic"
```

---

## Task 6: Applications page

**Files:**
- Modify: `app/(dashboard)/applications/ApplicationsClient.tsx`

- [ ] **Step 1: Update imports** to add `statusLabel`:
```tsx
import { CANONICAL_STATUSES, cn, scoreBg, scoreColor } from '@/lib/utils';
```
to:
```tsx
import { CANONICAL_STATUSES, cn, scoreBg, scoreColor, statusLabel } from '@/lib/utils';
```

- [ ] **Step 2: Translate the `confirm` dialog** in `deleteApp`:
```tsx
    if (!confirm('Delete this application?')) return;
```
to:
```tsx
    if (!confirm('هل تريد حذف هذا الطلب؟')) return;
```

- [ ] **Step 3: Translate header + refresh.**

Change:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">{apps.length} total · {filtered.length} shown</p>
```
to:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">الطلبات</h1>
          <p className="mt-1 text-sm text-muted-foreground">{apps.length} إجمالاً · {filtered.length} ظاهرة</p>
```

Change:
```tsx
          <RefreshCw className={cn(loading && 'animate-spin')} />
          Refresh
```
to:
```tsx
          <RefreshCw className={cn(loading && 'animate-spin')} />
          تحديث
```

- [ ] **Step 4: Fix the search icon position (RTL) + translate search/filter.**

Change:
```tsx
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search company, role, notes..."
            className="pl-9"
```
to:
```tsx
          <Search className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="ابحث في الشركة أو الدور أو الملاحظات..."
            className="ps-9"
```

Change the status filter select:
```tsx
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {CANONICAL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
```
to:
```tsx
          <SelectTrigger className="w-44">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {CANONICAL_STATUSES.map(s => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
```

- [ ] **Step 5: Translate table headers.** The `sortableHead` calls pass a label string; translate those and the static heads.

Change:
```tsx
              <TableHead className="w-12">#</TableHead>
              <TableHead>{sortableHead('company', 'Company')}</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>{sortableHead('date', 'Date')}</TableHead>
              <TableHead>{sortableHead('score', 'Score')}</TableHead>
              <TableHead>{sortableHead('status', 'Status')}</TableHead>
              <TableHead>Actions</TableHead>
```
to:
```tsx
              <TableHead className="w-12">#</TableHead>
              <TableHead>{sortableHead('company', 'الشركة')}</TableHead>
              <TableHead>الدور</TableHead>
              <TableHead>{sortableHead('date', 'التاريخ')}</TableHead>
              <TableHead>{sortableHead('score', 'التقييم')}</TableHead>
              <TableHead>{sortableHead('status', 'الحالة')}</TableHead>
              <TableHead>إجراءات</TableHead>
```

- [ ] **Step 6: Translate empty state + action titles.**

Change:
```tsx
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No applications found
                </TableCell>
```
to:
```tsx
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  لا توجد طلبات
                </TableCell>
```

Change:
```tsx
                        <Link href={app.reportPath ?? '#'} title="View Report">
```
to:
```tsx
                        <Link href={app.reportPath ?? '#'} title="عرض التقرير">
```

Change:
```tsx
                        <a href={app.url} target="_blank" rel="noopener noreferrer" title="Open URL">
```
to:
```tsx
                        <a href={app.url} target="_blank" rel="noopener noreferrer" title="فتح الرابط">
```

(The inline status `<Select>` in each row already renders `<StatusBadge>` for its items, so those show Arabic automatically from Task 2.)

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "app/(dashboard)/applications/ApplicationsClient.tsx"
git commit -m "feat(i18n): localize applications page to Arabic with RTL fixes"
```

---

## Task 7: Pipeline page

**Files:**
- Modify: `app/(dashboard)/pipeline/PipelineClient.tsx`

- [ ] **Step 1: Update imports** to add `pipelineStatusLabel`:
```tsx
import { cn } from '@/lib/utils';
```
to:
```tsx
import { cn, pipelineStatusLabel } from '@/lib/utils';
```

- [ ] **Step 2: Translate the company-picker dialog.**

Change:
```tsx
            <DialogTitle>Choose companies to scan</DialogTitle>
            <DialogDescription>Select which portals to include in this scan.</DialogDescription>
```
to:
```tsx
            <DialogTitle>اختر الشركات للمسح</DialogTitle>
            <DialogDescription>حدّد البوابات المراد تضمينها في هذا المسح.</DialogDescription>
```

Change the picker search icon (RTL) + placeholder:
```tsx
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-8"
```
to:
```tsx
            <Search className="pointer-events-none absolute top-1/2 start-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="ابحث عن شركات..."
              className="ps-8"
```

Change:
```tsx
            <span className="text-xs text-muted-foreground">{selected.size} of {companies.length} selected</span>
            <Button variant="ghost" size="xs" onClick={toggleSelectAll} disabled={filteredCompanies.length === 0}>
              {allFilteredSelected ? 'Clear all' : 'Select all'}
            </Button>
```
to:
```tsx
            <span className="text-xs text-muted-foreground">{selected.size} من {companies.length} محدد</span>
            <Button variant="ghost" size="xs" onClick={toggleSelectAll} disabled={filteredCompanies.length === 0}>
              {allFilteredSelected ? 'إلغاء الكل' : 'تحديد الكل'}
            </Button>
```

Change:
```tsx
              <p className="py-4 text-center text-sm text-muted-foreground">No companies match &ldquo;{companyQuery}&rdquo;</p>
```
to:
```tsx
              <p className="py-4 text-center text-sm text-muted-foreground">لا توجد شركات مطابقة لـ &ldquo;{companyQuery}&rdquo;</p>
```

Change the scan button (drop the EN singular/plural ternary — Arabic uses one form here):
```tsx
            <Button onClick={handleScan} disabled={selected.size === 0}>
              <Radar />
              Scan {selected.size} {selected.size === 1 ? 'company' : 'companies'}
            </Button>
```
to:
```tsx
            <Button onClick={handleScan} disabled={selected.size === 0}>
              <Radar />
              امسح {selected.size} شركة
            </Button>
```

- [ ] **Step 3: Translate the page header + scan controls.**

Change:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Pipeline</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} pending · {done.length} processed</p>
```
to:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">قائمة الانتظار</h1>
          <p className="mt-1 text-sm text-muted-foreground">{pending.length} قيد الانتظار · {done.length} مُعالَجة</p>
```

Change:
```tsx
            <RefreshCw className={cn(loading && 'animate-spin')} />
            Refresh
```
to:
```tsx
            <RefreshCw className={cn(loading && 'animate-spin')} />
            تحديث
```

Change:
```tsx
            {scanning ? <Loader2 className="animate-spin" /> : <Radar />}
            Scan Portals
```
to:
```tsx
            {scanning ? <Loader2 className="animate-spin" /> : <Radar />}
            مسح البوابات
```

- [ ] **Step 4: Translate the scan-result alert.**

Change:
```tsx
          <AlertDescription>
            Scan complete - {scanResult.found} found, {scanResult.added} new added to pipeline
          </AlertDescription>
```
to:
```tsx
          <AlertDescription>
            اكتمل المسح - تم العثور على {scanResult.found}، وأُضيف {scanResult.added} جديدة إلى القائمة
          </AlertDescription>
```

- [ ] **Step 5: Translate the "Add Job URLs" card.**

Change:
```tsx
            <Plus />
            Add Job URLs
```
to:
```tsx
            <Plus />
            إضافة روابط وظائف
```

Change:
```tsx
            placeholder="Paste one or more job URLs (one per line)..."
```
to:
```tsx
            placeholder="الصق رابطًا أو أكثر للوظائف (رابط في كل سطر)..."
```

Change:
```tsx
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            Add to Pipeline
```
to:
```tsx
            {adding ? <Loader2 className="animate-spin" /> : <Plus />}
            إضافة إلى القائمة
```

- [ ] **Step 6: Translate the Pending card, item status badge, empty state, and action titles.**

Change:
```tsx
            <Clock />
            Pending ({pending.length})
```
to:
```tsx
            <Clock />
            قيد الانتظار ({pending.length})
```

Change:
```tsx
            <p className="py-4 text-center text-sm text-muted-foreground">No pending items - run a scan or add URLs above</p>
```
to:
```tsx
            <p className="py-4 text-center text-sm text-muted-foreground">لا توجد عناصر قيد الانتظار - شغّل مسحًا أو أضف روابط بالأعلى</p>
```

Change the item status badge to use the helper:
```tsx
                    <Badge variant="secondary">{item.status}</Badge>
```
to:
```tsx
                    <Badge variant="secondary">{pipelineStatusLabel(item.status)}</Badge>
```

Change:
```tsx
                    <Button size="xs">
                      Evaluate
                    </Button>
```
to:
```tsx
                    <Button size="xs">
                      تقييم
                    </Button>
```

Change:
```tsx
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title="Open URL">
```
to:
```tsx
                  <a href={item.url} target="_blank" rel="noopener noreferrer" title="فتح الرابط">
```

Change:
```tsx
                  <Button size="icon-xs" variant="ghost" onClick={() => markDone(item.id)} title="Mark done">
```
to:
```tsx
                  <Button size="icon-xs" variant="ghost" onClick={() => markDone(item.id)} title="وضع علامة مكتمل">
```

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "app/(dashboard)/pipeline/PipelineClient.tsx"
git commit -m "feat(i18n): localize pipeline page to Arabic with RTL fixes"
```

---

## Task 8: Evaluate page

**Files:**
- Modify: `app/(dashboard)/evaluate/EvaluateClient.tsx`

- [ ] **Step 1: Translate the user-facing error strings.**

Change:
```tsx
        setError('No CV found. Please add your CV in Settings first.');
```
to:
```tsx
        setError('لا توجد سيرة ذاتية. الرجاء إضافة سيرتك من الإعدادات أولاً.');
```

Change:
```tsx
        throw new Error(err.error || 'Evaluation failed');
```
to:
```tsx
        throw new Error(err.error || 'فشل التقييم');
```

Change:
```tsx
      setError(err instanceof Error ? err.message : 'Unknown error');
```
to:
```tsx
      setError(err instanceof Error ? err.message : 'خطأ غير معروف');
```

Change (in `handleDownloadPdf`):
```tsx
        throw new Error(detail.error || 'Failed to generate CV');
```
to:
```tsx
        throw new Error(detail.error || 'فشل توليد السيرة الذاتية');
```

(Leave `candidateName: profile.name || 'Candidate'` and `a.download = 'cv-tailored.html'` as English — they feed the English CV output.)

- [ ] **Step 2: Translate the header.**

Change:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Evaluate a Job</h1>
        <p className="mt-1 text-sm text-muted-foreground">Paste a job URL or description to get a full A-G evaluation</p>
```
to:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">قيّم وظيفة</h1>
        <p className="mt-1 text-sm text-muted-foreground">الصق رابط وظيفة أو وصفها للحصول على تقييم كامل من A إلى G</p>
```

- [ ] **Step 3: Translate the input card.**

Change:
```tsx
            <CardTitle className="text-base">Job Posting</CardTitle>
```
to:
```tsx
            <CardTitle className="text-base">إعلان الوظيفة</CardTitle>
```

Change:
```tsx
              placeholder="Paste the job URL or full job description here..."
```
to:
```tsx
              placeholder="الصق رابط الوظيفة أو وصفها الكامل هنا..."
```

Change:
```tsx
                  <Loader2 className="animate-spin" />
                  {status === 'fetching' ? 'Fetching job...' : 'Stop Evaluation'}
```
to:
```tsx
                  <Loader2 className="animate-spin" />
                  {status === 'fetching' ? 'جارٍ جلب الوظيفة...' : 'إيقاف التقييم'}
```

Change:
```tsx
                  <Zap />
                  Evaluate
```
to:
```tsx
                  <Zap />
                  تقييم
```

- [ ] **Step 4: Translate the report card (title, badges, placeholder states).**

Change:
```tsx
              <CardTitle className="text-base">Evaluation Report</CardTitle>
```
to:
```tsx
              <CardTitle className="text-base">تقرير التقييم</CardTitle>
```

Change:
```tsx
                  <Badge variant="secondary" className="animate-pulse">
                    Streaming...
                  </Badge>
```
to:
```tsx
                  <Badge variant="secondary" className="animate-pulse">
                    جارٍ البث...
                  </Badge>
```

Change:
```tsx
                  <Badge variant="outline">Done</Badge>
```
to:
```tsx
                  <Badge variant="outline">تم</Badge>
```

Change:
```tsx
                  {status === 'idle'
                    ? 'Evaluation output will appear here...'
                    : status === 'fetching'
                      ? 'Fetching job posting...'
                      : 'Starting evaluation...'}
```
to:
```tsx
                  {status === 'idle'
                    ? 'سيظهر ناتج التقييم هنا...'
                    : status === 'fetching'
                      ? 'جارٍ جلب إعلان الوظيفة...'
                      : 'جارٍ بدء التقييم...'}
```

- [ ] **Step 5: Translate the action buttons + low-score alert.**

Change:
```tsx
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'Copied' : 'Copy'}
```
to:
```tsx
                    {copied ? <Check /> : <Copy />}
                    {copied ? 'تم النسخ' : 'نسخ'}
```

Change:
```tsx
                    <Save />
                    {saved ? 'Saved' : 'Save to Tracker'}
```
to:
```tsx
                    <Save />
                    {saved ? 'تم الحفظ' : 'حفظ في المتتبّع'}
```

Change:
```tsx
                    {downloadingPdf ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {downloadingPdf ? 'Preparing CV...' : 'Print / Save CV PDF'}
```
to:
```tsx
                    {downloadingPdf ? <Loader2 className="animate-spin" /> : <FileDown />}
                    {downloadingPdf ? 'جارٍ تجهيز السيرة...' : 'طباعة / حفظ السيرة PDF'}
```

Change:
```tsx
                    <AlertDescription>
                      Score below 4.0 - career-ops recommends against applying to this role.
                    </AlertDescription>
```
to:
```tsx
                    <AlertDescription>
                      التقييم أقل من 4.0 - يوصي career-ops بعدم التقديم على هذا الدور.
                    </AlertDescription>
```

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/evaluate/EvaluateClient.tsx"
git commit -m "feat(i18n): localize evaluate page to Arabic"
```

---

## Task 9: Settings page

**Files:**
- Modify: `app/(dashboard)/settings/SettingsClient.tsx`

- [ ] **Step 1: Translate header + save button.**

Change:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your profile, CV, and personalization</p>
```
to:
```tsx
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">الإعدادات</h1>
          <p className="mt-1 text-sm text-muted-foreground">ملفك الشخصي وسيرتك الذاتية والتخصيص</p>
```

Change:
```tsx
          {saved ? 'Saved' : 'Save Changes'}
```
to:
```tsx
          {saved ? 'تم الحفظ' : 'حفظ التغييرات'}
```

- [ ] **Step 2: Translate the tab triggers.**

Change:
```tsx
          <TabsTrigger value="profile">
            <User />
            Profile
          </TabsTrigger>
          <TabsTrigger value="cv">
            <FileText />
            CV
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings />
            Advanced
          </TabsTrigger>
```
to:
```tsx
          <TabsTrigger value="profile">
            <User />
            الملف الشخصي
          </TabsTrigger>
          <TabsTrigger value="cv">
            <FileText />
            السيرة الذاتية
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Settings />
            متقدم
          </TabsTrigger>
```

- [ ] **Step 3: Translate the Profile tab (card titles, field labels, non-CV placeholders).**

Change:
```tsx
              <CardTitle className="text-base">Personal Info</CardTitle>
```
to:
```tsx
              <CardTitle className="text-base">المعلومات الشخصية</CardTitle>
```

Change the four personal fields:
```tsx
                <Field label="Full Name">
                  <Input
                    value={profile.name || ''}
                    onChange={e => update('name', e.target.value)}
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    value={profile.email || ''}
                    onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={profile.location || ''}
                    onChange={e => update('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </Field>
                <Field label="Remote Policy">
                  <Input
                    value={profile.remotePolicy || ''}
                    onChange={e => update('remotePolicy', e.target.value)}
                    placeholder="Full remote / Hybrid / On-site"
                  />
                </Field>
```
to:
```tsx
                <Field label="الاسم الكامل">
                  <Input
                    value={profile.name || ''}
                    onChange={e => update('name', e.target.value)}
                    placeholder="اسمك"
                  />
                </Field>
                <Field label="البريد الإلكتروني">
                  <Input
                    value={profile.email || ''}
                    onChange={e => update('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </Field>
                <Field label="الموقع">
                  <Input
                    value={profile.location || ''}
                    onChange={e => update('location', e.target.value)}
                    placeholder="المدينة، الدولة"
                  />
                </Field>
                <Field label="سياسة العمل عن بُعد">
                  <Input
                    value={profile.remotePolicy || ''}
                    onChange={e => update('remotePolicy', e.target.value)}
                    placeholder="عن بُعد كليًا / هجين / من المكتب"
                  />
                </Field>
```

Change the Target Role & Compensation card:
```tsx
              <CardTitle className="text-base">Target Role & Compensation</CardTitle>
```
to:
```tsx
              <CardTitle className="text-base">الدور المستهدف والراتب</CardTitle>
```

Change:
```tsx
              <Field label="Target Role(s)">
                <Input
                  value={profile.targetRole || ''}
                  onChange={e => update('targetRole', e.target.value)}
                  placeholder="e.g. Senior AI Engineer, ML Platform Lead"
                />
              </Field>
```
to:
```tsx
              <Field label="الدور (الأدوار) المستهدفة">
                <Input
                  value={profile.targetRole || ''}
                  onChange={e => update('targetRole', e.target.value)}
                  placeholder="مثال: مهندس ذكاء اصطناعي أول، قائد منصة تعلم آلي"
                />
              </Field>
```

Change the three salary fields' labels (keep numeric/currency placeholders):
```tsx
                <Field label="Salary Min">
```
to:
```tsx
                <Field label="أدنى راتب">
```
```tsx
                <Field label="Salary Max">
```
to:
```tsx
                <Field label="أعلى راتب">
```
```tsx
                <Field label="Currency / Note">
```
to:
```tsx
                <Field label="العملة / ملاحظة">
```

- [ ] **Step 4: Translate the CV tab chrome (keep the CV textarea placeholder English).**

Change:
```tsx
              <CardTitle className="text-base">Your CV (Markdown)</CardTitle>
              <p className="text-xs text-muted-foreground">
                This is the source of truth for evaluations and PDF generation.
                Keep it in clean markdown with Summary, Experience, Projects, Education, and Skills.
              </p>
```
to:
```tsx
              <CardTitle className="text-base">سيرتك الذاتية (Markdown)</CardTitle>
              <p className="text-xs text-muted-foreground">
                هذا هو المصدر المرجعي للتقييمات وتوليد PDF.
                احتفظ به بصيغة markdown نظيفة مع الأقسام: Summary وExperience وProjects وEducation وSkills.
              </p>
```

(Do NOT change the CV `<Textarea>` `placeholder` — it is an English CV template and the CV stays English.)

- [ ] **Step 5: Translate the Advanced tab chrome (keep YAML/_profile placeholders + code paths).**

Change:
```tsx
              <CardTitle className="text-base">_profile.md Customization</CardTitle>
              <p className="text-xs text-muted-foreground">
                Override archetypes, negotiation scripts, and framing. This maps to{' '}
                <code className="rounded bg-muted px-1 text-primary">modes/_profile.md</code>.
              </p>
```
to:
```tsx
              <CardTitle className="text-base">تخصيص _profile.md</CardTitle>
              <p className="text-xs text-muted-foreground">
                تجاوز النماذج الأصلية ونصوص التفاوض والصياغة. يقابل هذا الملف{' '}
                <code className="rounded bg-muted px-1 text-primary">modes/_profile.md</code>.
              </p>
```

Change:
```tsx
              <CardTitle className="text-base">profile.yml Config</CardTitle>
              <p className="text-xs text-muted-foreground">
                Raw YAML config passed to evaluations. Maps to{' '}
                <code className="rounded bg-muted px-1 text-primary">config/profile.yml</code>.
              </p>
```
to:
```tsx
              <CardTitle className="text-base">إعدادات profile.yml</CardTitle>
              <p className="text-xs text-muted-foreground">
                إعدادات YAML الخام المُمرَّرة للتقييمات. تقابل{' '}
                <code className="rounded bg-muted px-1 text-primary">config/profile.yml</code>.
              </p>
```

Change the env-vars alert:
```tsx
            <AlertDescription>
              <strong>Environment variables required:</strong> Make sure{' '}
              <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> and{' '}
              <code className="rounded bg-muted px-1">DATABASE_URL</code> are set in{' '}
              <code className="rounded bg-muted px-1">.env.local</code> before using evaluations and PDF generation.
            </AlertDescription>
```
to:
```tsx
            <AlertDescription>
              <strong>متغيرات البيئة المطلوبة:</strong> تأكد من ضبط{' '}
              <code className="rounded bg-muted px-1">ANTHROPIC_API_KEY</code> و{' '}
              <code className="rounded bg-muted px-1">DATABASE_URL</code> في{' '}
              <code className="rounded bg-muted px-1">.env.local</code> قبل استخدام التقييمات وتوليد PDF.
            </AlertDescription>
```

(Leave the `_profile.md` and `profile.yml` `<Textarea>` placeholders unchanged — structural English examples.)

- [ ] **Step 6: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add "app/(dashboard)/settings/SettingsClient.tsx"
git commit -m "feat(i18n): localize settings page to Arabic"
```

---

## Task 10: Reports list + Report viewer

**Files:**
- Modify: `app/(dashboard)/reports/page.tsx`
- Modify: `app/(dashboard)/reports/[id]/ReportViewer.tsx`

- [ ] **Step 1: `app/(dashboard)/reports/page.tsx` — import the legitimacy helper.**

Change:
```tsx
import { cn, scoreColor } from '@/lib/utils';
```
to:
```tsx
import { cn, scoreColor, legitimacyLabel } from '@/lib/utils';
```

- [ ] **Step 2: Translate the header + empty state.**

Change:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">{allReports.length} evaluation reports</p>
```
to:
```tsx
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">التقارير</h1>
        <p className="mt-1 text-sm text-muted-foreground">{allReports.length} تقرير تقييم</p>
```

Change:
```tsx
          <CardContent className="py-12 text-center text-muted-foreground">
            No reports yet - evaluate a job to generate one
          </CardContent>
```
to:
```tsx
          <CardContent className="py-12 text-center text-muted-foreground">
            لا توجد تقارير بعد - قيّم وظيفة لإنشاء واحد
          </CardContent>
```

- [ ] **Step 3: Translate the column header row + the legitimacy badge.**

Change:
```tsx
            <span className="w-12 shrink-0 text-center">Score</span>
            <span className="flex-1">Company / Role</span>
            <span className="shrink-0">Legitimacy · Date</span>
```
to:
```tsx
            <span className="w-12 shrink-0 text-center">التقييم</span>
            <span className="flex-1">الشركة / الدور</span>
            <span className="shrink-0">المصداقية · التاريخ</span>
```

Change:
```tsx
                    <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                      {report.legitimacy}
                    </Badge>
```
to:
```tsx
                    <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                      {legitimacyLabel(report.legitimacy)}
                    </Badge>
```

- [ ] **Step 4: `ReportViewer.tsx` — import legitimacy helper + swap the back-arrow icon for RTL.**

Change:
```tsx
import { ArrowLeft, Calendar, Check, Copy, ExternalLink, FileDown } from 'lucide-react';
```
to:
```tsx
import { ArrowRight, Calendar, Check, Copy, ExternalLink, FileDown } from 'lucide-react';
```

Change:
```tsx
import { cn, scoreBg, scoreColor } from '@/lib/utils';
```
to:
```tsx
import { cn, scoreBg, scoreColor, legitimacyLabel } from '@/lib/utils';
```

- [ ] **Step 5: Translate the back link (now using `ArrowRight`) and the action buttons.**

Change:
```tsx
          <Button variant="ghost" size="sm">
            <ArrowLeft />
            Reports
          </Button>
```
to:
```tsx
          <Button variant="ghost" size="sm">
            <ArrowRight />
            التقارير
          </Button>
```

Change:
```tsx
                    <ExternalLink />
                    View posting
```
to:
```tsx
                    <ExternalLink />
                    عرض الإعلان
```

Change:
```tsx
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
                {copied ? 'Copied' : 'Copy Report'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
                <FileDown />
                {downloading ? 'Generating...' : 'Download CV PDF'}
              </Button>
```
to:
```tsx
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check /> : <Copy />}
                {copied ? 'تم النسخ' : 'نسخ التقرير'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
                <FileDown />
                {downloading ? 'جارٍ التوليد...' : 'تنزيل السيرة PDF'}
              </Button>
```

- [ ] **Step 6: Translate the legitimacy badge in the viewer.**

Change:
```tsx
                <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                  {report.legitimacy}
                </Badge>
```
to:
```tsx
                <Badge variant={legitimacyVariant(report.legitimacy)} className="text-xs">
                  {legitimacyLabel(report.legitimacy)}
                </Badge>
```

(The report body — `renderMarkdown(report.content)` — is left as-is; it is generated content. The `ml-4` list indent inside `renderMarkdown` is acceptable under RTL as a left indent; do not change it.)

- [ ] **Step 7: Typecheck + lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: no errors.

- [ ] **Step 8: Commit**

```bash
git add "app/(dashboard)/reports/page.tsx" "app/(dashboard)/reports/[id]/ReportViewer.tsx"
git commit -m "feat(i18n): localize reports list and viewer to Arabic with RTL back arrow"
```

---

## Task 11: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Clean typecheck, lint, and production build.**

Run:
```bash
npx tsc --noEmit && npm run lint && npm run build
```
Expected: all pass, no type/lint/build errors.

- [ ] **Step 2: Start the dev server.**

Run: `npm run dev` (runs in background; note the local URL, typically http://localhost:3000)

- [ ] **Step 3: Visually verify each page in the browser** (use the preview/browser tools or open the URL). Confirm for each:
  - Layout is right-to-left: sidebar on the **right**, text right-aligned, nav reads RTL.
  - Arabic text renders in the Thmanyah font (not a fallback serif).
  - No clipped/overlapping elements from the direction flip.

  Pages to check:
  - `/` (Dashboard) — stat cards, charts, recent-applications table headers (الشركة/التقييم/التاريخ/الحالة), action buttons.
  - `/applications` — search box (icon on the right), filter dropdown shows Arabic statuses, table headers, status badges Arabic.
  - `/pipeline` — header, "مسح البوابات", add-URL card, company picker dialog (search icon on right), pending list badges.
  - `/evaluate` — both cards, placeholders, buttons.
  - `/reports` and a single report at `/reports/[id]` — back link arrow points right, labels Arabic; report body renders.
  - `/settings` — tabs, field labels, alerts.

- [ ] **Step 4: Confirm CV output is still English.** On `/evaluate`, run an evaluation (or open an existing report) and click "طباعة / حفظ السيرة PDF" / "تنزيل السيرة PDF". Confirm the generated CV document content is in English and the layout is left-to-right (the CV template is untouched).

- [ ] **Step 5: Stop the dev server.**

- [ ] **Step 6: Final commit (if any verification fixes were needed).**

```bash
git add -A
git commit -m "fix(i18n): RTL/visual adjustments from verification"
```
(Skip if nothing changed.)

---

## Self-Review (completed)

- **Spec coverage:** Fonts (Task 1) ✓ · `dir="rtl" lang="ar"` + metadata (Task 1) ✓ · RTL layout fixes — sidebar side, search-icon positions, table alignment, back-arrow (Tasks 3,4,6,7,10) ✓ · String translation across all surfaces (Tasks 3–10) ✓ · Status/legitimacy/pipeline display labels (Task 2) ✓ · CV/PDF + report body stay English (explicitly preserved in Tasks 8,9,10 + out-of-scope list) ✓ · Western digits (no numeral conversion anywhere) ✓ · Verification incl. CV-English check (Task 11) ✓
- **Placeholder scan:** none — every step has concrete before/after code.
- **Type consistency:** helper names used consistently — `statusLabel`, `legitimacyLabel`, `pipelineStatusLabel` defined in Task 2 and imported in Tasks 2/6/7/10 exactly as named.
