# Dynamic Greeting Name Design

## Goal

Replace the hard-coded dashboard greeting name with the first name saved in Settings.

## Behavior

- Read the `name` profile value from the same database-backed profile store used by Settings.
- Trim leading and trailing whitespace and split on one or more whitespace characters.
- Pass only the first non-empty name segment to `GreetingCard`.
- Use `صديقي` when the saved name is missing or blank.
- Keep the existing time-based greeting, avatar, percentage ring, and animations unchanged.

## Architecture

The dashboard page is already a dynamic Server Component and already reads application data directly from the database. It will also read the `name` profile row during its existing parallel data-loading step. A small pure helper will convert the stored full name into the greeting name, keeping parsing and fallback behavior independently testable.

In demo mode, the dashboard will use the demo profile name (`Demo User`) and display `Demo`.

## Error Handling

Missing database rows, empty strings, and whitespace-only values all resolve to `صديقي`. No additional client-side request or loading state is introduced.

## Testing

Unit tests will cover:

- extracting the first word from a multi-part Arabic name;
- trimming repeated whitespace;
- preserving a single-word name;
- returning `صديقي` for missing or blank values.

The project lint and production build will verify the integration.
