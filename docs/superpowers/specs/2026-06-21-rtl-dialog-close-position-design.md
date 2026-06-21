# RTL Dialog Close Position Design

## Goal

Show the dialog close button at the top-left in the Arabic right-to-left interface.

## Chosen Design

Replace the physical `right-2` positioning utility on the shared dialog close button with the logical `end-2` utility. In an RTL document, the inline end is the left side, so the button appears at the top-left. In a future LTR surface, it remains at the top-right.

## Alternatives Considered

1. Add a pipeline-only selector override. This avoids changing the shared component but duplicates direction-aware positioning.
2. Replace `right-2` with `left-2`. This meets the current Arabic requirement but is incorrect for LTR dialogs.
3. Use `end-2`. This is selected because it follows the document direction automatically.

## Scope

- Modify `components/ui/dialog.tsx`.
- Add a source-level regression test for logical positioning.
- Do not change dialog behavior, sizing, or close handling.

## Verification

- Confirm the regression test fails with `right-2` and passes with `end-2`.
- Run focused ESLint for the shared dialog component.
- Run the production build.
