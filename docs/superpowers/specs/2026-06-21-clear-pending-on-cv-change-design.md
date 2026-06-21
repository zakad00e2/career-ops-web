# Clear Pending Jobs After CV Change

## Goal

When the user changes their CV, the first subsequent portal scan should remove
the old pending jobs before adding results based on the new CV. Completed jobs,
applications, reports, and other historical records must remain intact.

## Approved Behavior

- Saving a changed CV does not immediately delete jobs.
- The first scan after the CV changes deletes every `pipeline` row whose status
  is `pending`, including manually added pending URLs.
- Rows whose status is `done` are preserved.
- Applications and reports are preserved.
- Later scans with the same CV keep the existing pending queue and retain the
  current duplicate-prevention behavior.
- Changing only another profile field does not trigger cleanup. This behavior
  is based on the CV content only.

## CV Change Detection

The server computes a SHA-256 fingerprint from the trimmed current CV text.
The fingerprint used by the last successful scan is stored as an internal
profile entry.

At the start of a scan:

1. Load the current CV and derive the title filter.
2. Compute the current CV fingerprint.
3. Read the fingerprint from the last successful scan.
4. If a previous fingerprint exists and differs, run the pending-job cleanup.
5. Run the portal scan.
6. After the scan succeeds, store the current fingerprint.

When no previous fingerprint exists, the scan establishes the initial
fingerprint without deleting pending jobs. This avoids treating deployment of
the feature as if the user had changed their CV.

## Cleanup and Scan History

Before deleting pending pipeline rows, collect their URLs. Delete those pending
rows, then remove matching URLs from `scan_history`.

Removing matching scan-history rows is necessary so an old pending URL can be
rediscovered if it still matches the changed CV. Scan-history rows for
completed jobs remain, so completed jobs are not added back to the queue.

The cleanup is idempotent. If a scan fails after cleanup, the old fingerprint
remains stored; the next scan retries the comparison and cleanup before
scanning again.

## API Response

The scan response should include the number of pending jobs removed. The
pipeline UI may use this count in its existing scan-complete message so the
user can see that stale pending jobs were cleared.

## Error Handling

- A failure while reading the profile or cleaning the database fails the scan
  with the existing error response path.
- The stored fingerprint is updated only after a successful portal scan and
  database insertion pass.
- Completed jobs are never selected by the cleanup query.

## Testing

Add focused automated tests that verify:

1. A different CV fingerprint requests pending-job cleanup.
2. The same CV fingerprint does not request cleanup.
3. A missing previous fingerprint establishes a baseline without cleanup.
4. Cleanup targets only `pending` rows.
5. Matching scan-history URLs are removed while completed-job history remains.
6. A successful scan stores the current fingerprint.

Run the focused tests first, then lint and the production build.

## Out of Scope

- Deleting completed jobs.
- Deleting applications or reports.
- Clearing jobs immediately when settings are saved.
- Triggering cleanup for target-role or other profile-field changes.
- Adding a new database column or migration; the fingerprint uses the existing
  key/value profile table.
