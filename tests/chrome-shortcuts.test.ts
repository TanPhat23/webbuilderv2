import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  isChromeShortcut,
  isTypingTarget,
} from '../src/features/editor/components/layout/isTypingTarget';

const key = (k: string, mod = false) => ({ key: k, metaKey: mod, ctrlKey: false });

test('chrome shortcuts are recognised, ordinary keys are not', () => {
  for (const k of ['\\', '.', 'k']) assert.equal(isChromeShortcut(key(k, true)), true, k);
  assert.equal(isChromeShortcut({ key: '.', metaKey: false, ctrlKey: true }), true);
  assert.equal(isChromeShortcut(key('?')), true);
  assert.equal(isChromeShortcut(key('.')), false);
  assert.equal(isChromeShortcut(key('k')), false);
  assert.equal(isChromeShortcut(key('c', true)), false);
  assert.equal(isChromeShortcut(key('Delete')), false);
});

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
