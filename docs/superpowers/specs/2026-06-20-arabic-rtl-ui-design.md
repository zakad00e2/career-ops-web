# Arabic (RTL) UI for Career-Ops Web — Design

**Date:** 2026-06-20
**Status:** Approved

## Goal

Convert the entire Career-Ops web dashboard UI from English to Arabic with a
right-to-left (RTL) layout, using the provided Thmanyah Sans fonts. All CV/PDF
generation output must remain in English.

## Decisions (confirmed with user)

- **Approach:** Replace English with Arabic permanently. No language toggle, no
  i18n library. Strings are translated in place.
- **Numerals:** Western digits (0–9) everywhere. No Arabic-Indic conversion.
- **CV/PDF generation stays English:** template, prompt, and generated output
  untouched.

## 1. Fonts

- Copy the three provided `.woff2` files into `app/fonts/`:
  - `thmanyahsans-Light.woff2` → weight 300
  - `thmanyahsans-Regular.woff2` → weight 400
  - `thmanyahsans-Medium.woff2` → weight 500
- Register with `next/font/local` in `app/layout.tsx` as the new `--font-sans`.
- Keep `Geist_Mono` as `--font-geist-mono` for code/monospace (Latin glyphs,
  e.g. report code blocks).
- The Arabic font becomes the default UI font.

## 2. Direction & document

- `app/layout.tsx`: set `<html lang="ar" dir="rtl">`.
- Native browser RTL flips the overall layout. Tailwind v4 logical utilities
  (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start/end`) respect `dir` automatically.
- Update `metadata.title` / `metadata.description` to Arabic.

## 3. RTL layout fixes

Audit physical-direction classes across `app/` and `components/` and convert to
logical equivalents where they affect layout:

- `ml-*`/`mr-*` → `ms-*`/`me-*`
- `pl-*`/`pr-*` → `ps-*`/`pe-*`
- `left-*`/`right-*` → `start-*`/`end-*` (where used for layout)
- `text-left`/`text-right` → `text-start`/`text-end`
- `rounded-l-*`/`rounded-r-*` and `border-l/r-*` reviewed case by case

Notes:
- The shadcn sidebar is already RTL-aware via `data-side`; it flips to the right
  automatically.
- Direction-implying icons (e.g. `ArrowLeft` "back" in the report viewer) are
  reviewed so the affordance points the correct way in RTL.

## 4. String translation (the bulk of the work)

Replace every hardcoded English UI string with Arabic, in place. Surfaces:

- **Sidebar** (`components/Sidebar.tsx`): nav labels (Dashboard → لوحة التحكم,
  Applications → الطلبات, Pipeline → قائمة الانتظار, Reports → التقارير,
  Settings → الإعدادات), "Quick evaluate" → تقييم سريع, group labels
  (Workspace, Tools), "AI pipeline".
- **Dashboard layout** (`app/(dashboard)/layout.tsx`): header text, "AI job
  search pipeline".
- **Pages & clients**: Dashboard, Applications (`ApplicationsClient`), Pipeline
  (`PipelineClient`), Reports + Report viewer (`ReportViewer`), Evaluate
  (`EvaluateClient`), Settings (`SettingsClient`) — headings, buttons, table
  headers, empty/loading states, `sonner` toasts, status labels.
- **Components**: `DemoBanner`, `StatusBadge`, `section-cards`, charts labels,
  and any other user-facing component text.
- **Metadata** in `app/layout.tsx`.
- Canonical status labels shown in the UI get Arabic display labels (display
  only — underlying status values/data unchanged).

## 5. What stays English

- CV/PDF generation: `app/api/pdf` route, the HTML CV template, the Claude
  prompt, and generated CV output — untouched.
- Report body content: generated markdown reports render as stored (may be
  English); only the surrounding chrome translates.
- Numerals: Western digits, no conversion.
- API route logic, data values, status enum values, IDs.

## 6. Verification

- Run the dev server and visually confirm on each page: RTL layout, Arabic font
  rendering, no broken/clipped layout from direction flips.
- Confirm a CV generation still outputs English.

## Out of scope

- Language toggle / multi-locale support.
- Translating generated report or CV content.
- Arabic-Indic numerals.
- Any backend/API behavior changes.
