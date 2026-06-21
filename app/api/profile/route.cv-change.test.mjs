import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./route.ts', import.meta.url), 'utf8');

test('does not expose internal profile keys to the settings client', () => {
  assert.match(source, /row\.key\.startsWith\('__'\)/);
});

test('records the old CV fingerprint when the CV changes before a scan baseline exists', () => {
  assert.match(source, /initialFingerprintForCvChange/);
  assert.match(source, /LAST_SCANNED_CV_FINGERPRINT_KEY/);
});
