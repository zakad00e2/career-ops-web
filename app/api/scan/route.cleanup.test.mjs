import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./route.ts', import.meta.url), 'utf8');

test('cleans only pending pipeline rows after the CV changes', () => {
  assert.match(source, /eq\(pipelineTable\.status,\s*'pending'\)/);
  assert.doesNotMatch(source, /delete\(applications\)|delete\(reports\)/);
});

test('removes scan history only for URLs from the pending queue', () => {
  assert.match(source, /inArray\(scanHistory\.url,\s*pendingUrls\)/);
});

test('persists the CV fingerprint and returns the cleanup count', () => {
  assert.match(source, /LAST_SCANNED_CV_FINGERPRINT_KEY/);
  assert.match(source, /clearedPending/);
});
