You are working inside an existing dashboard project.
My goal is to redesign the current dashboard UI using shadcn/ui without rebuilding the app from scratch.

Important:

* Do not remove or rewrite the business logic.
* Do not break routing, authentication, API calls, state management, forms, tables, filters, modals, or dashboard functionality.
* Keep the existing project structure as much as possible.
* Refactor the UI gradually and safely.
* Use shadcn/ui as the design system.
* Use Tailwind CSS utility classes and shadcn semantic theme tokens.
* Avoid hardcoded colors like `bg-white`, `text-gray-900`, `border-gray-200`, `bg-blue-600` unless absolutely necessary.
* Replace them with semantic classes like:

  * `bg-background`
  * `text-foreground`
  * `bg-card`
  * `text-card-foreground`
  * `text-muted-foreground`
  * `border-border`
  * `bg-primary`
  * `text-primary-foreground`
  * `bg-muted`
  * `bg-sidebar`
  * `text-sidebar-foreground`

Your tasks:

1. First inspect the project

* Detect the framework: Next.js, Vite, React Router, TanStack Start, or another React setup.
* Detect the package manager: npm, pnpm, yarn, or bun.
* Detect whether Tailwind CSS is already installed.
* Detect whether shadcn/ui is already installed.
* Detect whether the project uses TypeScript.
* Detect the main layout files, dashboard pages, sidebar components, header/navbar components, card components, table components, form components, and global CSS file.

2. Install or configure shadcn/ui if needed

* If shadcn/ui is not installed, initialize it using the correct command for this project and package manager.
* Use CSS variables mode.
* Make sure `components.json` exists and is configured correctly.
* Make sure path aliases work, especially `@/components` and `@/lib/utils`.
* Make sure `cn` utility exists in `src/lib/utils.ts` or the equivalent project path.
* Do not overwrite existing important files without checking them first.

3. Add the needed shadcn/ui components
   Install only the components needed for this dashboard redesign. Start with these if they are relevant:

* button
* card
* input
* label
* textarea
* select
* dropdown-menu
* dialog
* sheet
* table
* badge
* avatar
* separator
* tabs
* tooltip
* skeleton
* alert
* checkbox
* switch
* sidebar

Use the correct shadcn CLI command for the detected package manager.

4. Create a clean dashboard theme
   Update the global CSS file, usually `globals.css`, `index.css`, or `src/styles.css`, to include a modern shadcn dashboard theme.

Use CSS variables for both light and dark mode.

Create a professional dashboard style with:

* clean background
* soft cards
* clear borders
* modern primary color
* readable typography
* consistent radius
* sidebar-specific colors
* good hover and active states
* accessible contrast

Use this general visual direction:

* Modern SaaS dashboard
* Clean, premium, minimal
* Slightly rounded cards
* Soft borders
* Elegant sidebar
* Good spacing
* Professional admin panel feel

Include variables for:

* `--background`
* `--foreground`
* `--card`
* `--card-foreground`
* `--popover`
* `--popover-foreground`
* `--primary`
* `--primary-foreground`
* `--secondary`
* `--secondary-foreground`
* `--muted`
* `--muted-foreground`
* `--accent`
* `--accent-foreground`
* `--destructive`
* `--destructive-foreground`
* `--border`
* `--input`
* `--ring`
* `--radius`
* `--chart-1`
* `--chart-2`
* `--chart-3`
* `--chart-4`
* `--chart-5`
* `--sidebar`
* `--sidebar-foreground`
* `--sidebar-primary`
* `--sidebar-primary-foreground`
* `--sidebar-accent`
* `--sidebar-accent-foreground`
* `--sidebar-border`
* `--sidebar-ring`

5. Refactor the dashboard layout
   Find the current dashboard layout and improve it using shadcn/ui.

The final dashboard layout should include:

* Sidebar
* Header/topbar
* Main content area
* Responsive mobile sidebar if possible
* Consistent spacing
* Clean page container
* Better active navigation state
* Better hover states
* Better user/profile section
* Better page title and breadcrumbs if the project already has them

Do not change the app routes unless required.

6. Refactor existing UI sections
   Replace old custom UI with shadcn components where suitable:

Cards:

* Replace statistics boxes and widgets with `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`.
* Use consistent padding, radius, borders, and shadows.

Buttons:

* Replace raw button styling with shadcn `Button`.
* Use variants like `default`, `secondary`, `outline`, `ghost`, `destructive`.

Forms:

* Replace inputs/selects/textareas with shadcn components.
* Keep form logic and validation unchanged.
* Improve labels, spacing, disabled states, errors, and focus rings.

Tables:

* Replace old table styling with shadcn `Table`.
* Keep sorting, filtering, pagination, and row actions working.
* Improve table header, row hover, empty states, and action buttons.

Dialogs/Modals:

* Replace custom modals with shadcn `Dialog` or `Sheet` where appropriate.
* Keep open/close behavior and actions unchanged.

Dropdowns:

* Replace custom menus with `DropdownMenu`.
* Use clean row actions and user menu.

Loading states:

* Use `Skeleton` components where loading UI exists.

Status labels:

* Use `Badge` components for statuses.

7. Improve responsiveness

* Make sure the dashboard works on desktop, tablet, and mobile.
* Sidebar should collapse or become a sheet/drawer on mobile if possible.
* Tables should not break the layout.
* Cards should stack properly on smaller screens.
* Avoid horizontal overflow.

8. Preserve functionality
   Before editing each page/component:

* Understand what it currently does.
* Preserve all props.
* Preserve all event handlers.
* Preserve all hooks.
* Preserve all API integrations.
* Preserve all form submissions.
* Preserve all loading/error states.
* Preserve all data rendering.

Do not replace working logic with dummy data.

9. Clean code requirements

* Use TypeScript-friendly code.
* Use reusable components where helpful.
* Use `cn()` for conditional class names.
* Remove duplicated styling when possible.
* Keep components readable.
* Avoid unnecessary abstraction.
* Do not introduce a new UI library besides shadcn/ui, Tailwind CSS, Radix components used by shadcn, and lucide-react if icons are needed.
* Use lucide-react icons if the project already uses it or if icons are needed.

10. Final validation
    After implementation:

* Run type checking if available.
* Run lint if available.
* Run build if available.
* Fix all errors caused by your changes.
* Check that the dashboard pages still load.
* Check light and dark mode if available.
* Check that sidebar, navigation, forms, tables, dropdowns, and dialogs still work.

11. Report back with:

* What files you changed.
* What shadcn components you added.
* What theme tokens you configured.
* Any functionality you preserved.
* Any issues you found and fixed.
* Any remaining recommendations.

Start by inspecting the existing project files, then implement the redesign safely.
