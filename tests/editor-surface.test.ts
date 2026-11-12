import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { fromSurface, toSurface } from '../src/features/editor/lib/editor-surface';

test('toSurface maps the provider fields onto one switch', () => {
  assert.equal(toSurface('editor', 'visual'), 'design');
  assert.equal(toSurface('wireframe', 'visual'), 'wireframe');
  assert.equal(toSurface('editor', 'code'), 'code');
  assert.equal(toSurface('wireframe', 'code'), 'code');
});

test('fromSurface round-trips through toSurface', () => {
  for (const s of ['design', 'wireframe', 'code'] as const) {
    const { mode, editingMode } = fromSurface(s);
    assert.equal(toSurface(mode, editingMode), s);
  }
});
