import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { isTypingTarget } from '../src/features/editor/components/layout/isTypingTarget';

const el = (tagName: string, extra: Record<string, unknown> = {}) =>
  ({ tagName, isContentEditable: false, ...extra }) as unknown as EventTarget;

test('form fields and contenteditable are typing targets', () => {
  assert.equal(isTypingTarget(el('INPUT')), true);
  assert.equal(isTypingTarget(el('TEXTAREA')), true);
  assert.equal(isTypingTarget(el('SELECT')), true);
  assert.equal(isTypingTarget(el('DIV', { isContentEditable: true })), true);
});

test('other targets are not typing targets', () => {
  assert.equal(isTypingTarget(el('DIV')), false);
  assert.equal(isTypingTarget(el('BUTTON')), false);
  assert.equal(isTypingTarget(null), false);
});
