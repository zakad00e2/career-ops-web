# Scan Company Dialog Height Design

## Problem

The company picker opened from the pipeline scan button can exceed the viewport height. The dialog itself has no viewport-relative height limit, while only the company list has a fixed maximum height. Additional profile and keyword content can therefore push the dialog header or footer outside the visible screen.

## Chosen Design

- Limit the dialog height relative to the current viewport.
- Use a flex-column layout so the dialog can distribute its available height predictably.
- Keep the title, profile summary, search field, selection controls, and action footer visible.
- Make the company list the flexible scroll region by giving it the remaining height and vertical scrolling.
- Preserve the current dialog content, selection behavior, filtering, and scan workflow.

## Alternatives Considered

1. Scroll the entire dialog. This is simple, but the scan button and search controls can move out of view.
2. Reduce the fixed company-list height. This helps only on some screens and does not guarantee that the dialog fits when profile keywords wrap onto more lines.
3. Use a viewport-bounded flex dialog with a dedicated list scroller. This is the selected approach because it keeps the controls accessible on desktop and smaller screens.

## Implementation Scope

Only `app/(dashboard)/pipeline/PipelineClient.tsx` should require a layout-class change. The shared dialog component should not be changed because other dialogs may rely on its current sizing behavior.

## Verification

- Open the pipeline company picker on a desktop viewport.
- Confirm the dialog remains fully inside the viewport.
- Confirm the company list scrolls when its content is taller than the available space.
- Confirm the title, search input, select-all control, close control, and scan action remain reachable.
- Repeat at a mobile-sized viewport.
- Run lint or the narrowest available project verification for the changed file.
