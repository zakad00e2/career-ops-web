import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(new URL('./dialog.tsx', import.meta.url), 'utf8');

test('positions the dialog close button at the logical inline end', () => {
  assert.match(source, /className="absolute top-2 end-2"/);
  assert.doesNotMatch(source, /className="absolute top-2 right-2"/);
});
