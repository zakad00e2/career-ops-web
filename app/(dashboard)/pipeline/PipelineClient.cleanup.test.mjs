import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
  new URL('./PipelineClient.tsx', import.meta.url),
  'utf8',
);

test('maps the cleared pending count from the scan response', () => {
  assert.match(source, /clearedPending\?: number/);
  assert.match(source, /clearedPending:\s*data\.clearedPending/);
});

test('shows the cleanup count after a CV-triggered cleanup', () => {
  assert.match(source, /Boolean\(scanResult\.clearedPending\)/);
  assert.match(source, /scanResult\.clearedPending[^]*الوظائف القديمة قيد الانتظار/);
});
