# Reports Page Redesign — Design

**Date:** 2026-06-18
**Scope:** `app/(dashboard)/reports/page.tsx` (list view only — report detail `[id]` unchanged)

## Goal

Replace the current 3-column card grid with a **scannable single-column list** (direction "B") that makes scores and legitimacy easier to compare at a glance, consistent with the light-mode theme.

## Current State

A responsive grid of `Card`s. Each card shows company/role, a score pill, date + legitimacy badge, and a 100-char content preview. Works but is visually heavy and hard to scan/compare across many reports.

## New Design

A single list container (`Card`) with a header row and one row per report.

**Row anatomy (left → right):**
1. **Score ring** — circular badge, `border-2 border-current` + `scoreColor(score)` so the ring and number share the tier color (emerald ≥4.5, blue ≥4.0, amber ≥3.5, red below; muted when null). Shows `score.toFixed(1)` or `—`.
2. **Main block** — company (semibold), role (muted), and a one-line content snippet (truncated). Snippet is derived from `content` by stripping markdown heading lines and `**` markers, collapsing whitespace, and slicing ~110 chars.
3. **Meta block** (right-aligned) — legitimacy `Badge` (existing `legitimacyVariant`) + date with a calendar icon.

**Interaction:** entire row is a `Link` to `/reports/${id}`; hover gives a subtle `hover:bg-muted/50` tint; rows separated by `divide-y divide-border/60`.

**Header:** keep existing page title "Reports" + count. Add a small column-label header row inside the list (Score / Company · Role / Legitimacy · Date) on `sm+`.

**Empty state:** unchanged (centered "No reports yet" card).

## Out of Scope (YAGNI)

- No stats summary bar, no search/filter, no sorting (existing page had none — not requested).
- Report detail page untouched.
- No new shared util beyond an inline snippet helper local to this file.

## Testing

Visual verification in the running app (light mode), plus `tsc --noEmit` clean. No data/logic changes, so no unit tests added.
