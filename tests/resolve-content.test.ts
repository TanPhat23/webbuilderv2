import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { resolveContent } from '../src/features/editor/utils/element/resolveContent';

test('content resolution keeps preview substitution and raw editing content', () => {
  assert.equal(resolveContent({ content: 'Hello {{name}}' }, { name: 'Ada' }, false), 'Hello Ada');
  assert.equal(resolveContent({ content: 'Hello {{name}}' }, { name: 'Ada' }, true), 'Hello {{name}}');
  assert.equal(resolveContent({ content: '' }, 'supplied text', false), 'supplied text');
  assert.equal(resolveContent({}, { content: 'supplied content' }, false), 'supplied content');
  assert.equal(resolveContent({}, undefined, false), '');
});
