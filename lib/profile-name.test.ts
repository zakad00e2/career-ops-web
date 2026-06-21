import assert from 'node:assert/strict';
import test from 'node:test';
import { greetingName } from './profile-name';

test('returns the first word from a full Arabic name', () => {
  assert.equal(greetingName('محمد أحمد علي'), 'محمد');
});

test('trims repeated whitespace before selecting the first name', () => {
  assert.equal(greetingName('  محمد   أحمد  '), 'محمد');
});

test('preserves a single-word name', () => {
  assert.equal(greetingName('حمود'), 'حمود');
});

test('returns the Arabic fallback for missing or blank names', () => {
  assert.equal(greetingName(undefined), 'صديقي');
  assert.equal(greetingName('   '), 'صديقي');
});
