import assert from 'node:assert/strict';
import test from 'node:test';
import {
  fingerprintCv,
  initialFingerprintForCvChange,
  shouldClearPendingJobs,
} from './scan-cv-state';

test('normalizes surrounding whitespace before hashing a CV', () => {
  assert.equal(fingerprintCv('  same cv\n'), fingerprintCv('same cv'));
});

test('clears pending jobs when a stored fingerprint differs', () => {
  assert.equal(shouldClearPendingJobs('old', 'new'), true);
});

test('does not clear pending jobs when the fingerprint is unchanged', () => {
  assert.equal(shouldClearPendingJobs('same', 'same'), false);
});

test('establishes a baseline without clearing when no fingerprint exists', () => {
  assert.equal(shouldClearPendingJobs(undefined, 'current'), false);
});

test('captures the old CV as the initial baseline when a CV changes before any scan', () => {
  assert.equal(
    initialFingerprintForCvChange('old cv', 'new cv', undefined),
    fingerprintCv('old cv'),
  );
});

test('does not replace an existing last-scanned fingerprint', () => {
  assert.equal(
    initialFingerprintForCvChange('old cv', 'new cv', 'last-scan'),
    undefined,
  );
});

test('does not create a baseline when the normalized CV is unchanged', () => {
  assert.equal(
    initialFingerprintForCvChange(' same cv ', 'same cv', undefined),
    undefined,
  );
});
