import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HIDDEN_SETTINGS,
  MAX_PREAMBLE_LENGTH,
  emptyPreamble,
  isEmptyPreamble,
  readStoredPreamble,
  savePreamble,
  toPreamble,
} from '../apps/editor/src/features/editor/lib/code/customCode';

const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
let store: Map<string, string>;

function installStorage(overrides: Partial<Storage> = {}) {
  store = new Map();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      ...overrides,
    },
  });
}

beforeEach(() => installStorage());
afterEach(() => {
  if (original) Object.defineProperty(globalThis, 'localStorage', original);
  else delete (globalThis as { localStorage?: unknown }).localStorage;
});

test('settings that must never become tag attributes are listed', () => {
  assert.deepEqual(HIDDEN_SETTINGS, [
    'interactions', 'migratedWorkflowLinks', 'customSubmit', 'codeProps', 'component',
  ]);
});

test('emptyPreamble and isEmptyPreamble agree, ignoring whitespace', () => {
  assert.deepEqual(emptyPreamble(), { imports: '', top: '', body: '' });
  assert.equal(isEmptyPreamble(emptyPreamble()), true);
  assert.equal(isEmptyPreamble({ imports: ' \n', top: '\t', body: '  ' }), true);
  assert.equal(isEmptyPreamble({ imports: '', top: 'const a = 1', body: '' }), false);
  assert.notEqual(emptyPreamble(), emptyPreamble(), 'each call returns a fresh object');
});

test('toPreamble accepts partial objects and rejects untrusted shapes', () => {
  assert.deepEqual(toPreamble({ imports: 'import a from "a"' }), {
    imports: 'import a from "a"', top: '', body: '',
  });
  assert.deepEqual(toPreamble({}), emptyPreamble());
  for (const bad of [null, undefined, 'str', 5, true]) assert.equal(toPreamble(bad), null, String(bad));
  assert.equal(toPreamble({ imports: 5 }), null);
  assert.equal(toPreamble({ body: { x: 1 } }), null);
  assert.equal(toPreamble({ top: 'x'.repeat(MAX_PREAMBLE_LENGTH + 1) }), null);
  assert.notEqual(toPreamble({ top: 'x'.repeat(MAX_PREAMBLE_LENGTH) }), null);
});

test('savePreamble then readStoredPreamble round-trips per page', () => {
  const preamble = { imports: 'import x from "x"', top: 'const s = 1', body: 'const f = useForm()' };
  savePreamble('page-1', preamble);
  assert.deepEqual(readStoredPreamble('page-1'), preamble);
  assert.deepEqual(readStoredPreamble('page-2'), emptyPreamble());
  assert.ok(store.has('wb:code-preamble:page-1'));
});

test('saving an empty preamble clears the stored entry', () => {
  savePreamble('p', { imports: 'a', top: '', body: '' });
  assert.equal(store.size, 1);
  savePreamble('p', emptyPreamble());
  assert.equal(store.size, 0);
});

test('a missing page id neither reads nor writes', () => {
  savePreamble(undefined, { imports: 'a', top: '', body: '' });
  assert.equal(store.size, 0);
  assert.deepEqual(readStoredPreamble(undefined), emptyPreamble());
});

test('corrupt or oversized stored data loads as an empty preamble', () => {
  store.set('wb:code-preamble:p', '{not json');
  assert.deepEqual(readStoredPreamble('p'), emptyPreamble());
  store.set('wb:code-preamble:p', JSON.stringify({ imports: 7 }));
  assert.deepEqual(readStoredPreamble('p'), emptyPreamble());
  store.set('wb:code-preamble:p', 'null');
  assert.deepEqual(readStoredPreamble('p'), emptyPreamble());
});

test('unavailable or throwing storage degrades silently', () => {
  installStorage({
    getItem: () => { throw new Error('blocked'); },
    setItem: () => { throw new Error('full'); },
    removeItem: () => { throw new Error('blocked'); },
  });
  assert.deepEqual(readStoredPreamble('p'), emptyPreamble());
  assert.doesNotThrow(() => savePreamble('p', { imports: 'a', top: '', body: '' }));
  assert.doesNotThrow(() => savePreamble('p', emptyPreamble()));

  delete (globalThis as { localStorage?: unknown }).localStorage;
  assert.deepEqual(readStoredPreamble('p'), emptyPreamble());
  assert.doesNotThrow(() => savePreamble('p', { imports: 'a', top: '', body: '' }));
});
