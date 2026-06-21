import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./PipelineClient.tsx', import.meta.url),
  'utf8',
);

test('bounds the company picker to the viewport', () => {
  assert.match(
    source,
    /<DialogContent className="flex max-h-\[calc\(100dvh-2rem\)\] flex-col overflow-hidden">/,
  );
});

test('uses the remaining dialog height for the scrollable company list', () => {
  assert.match(
    source,
    /className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto"/,
  );
  assert.doesNotMatch(source, /className="flex max-h-72 flex-col gap-1 overflow-y-auto"/);
});
