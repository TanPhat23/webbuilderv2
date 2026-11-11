import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { createEditorDraftStore } from '../src/features/editor/store/editor-draft';

test('offline drafts are stored per user, project and page', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const a = createEditorDraftStore(storage, 'user', 'project', 'page-a');
  const b = createEditorDraftStore(storage, 'user', 'project', 'page-b');
  const otherUser = createEditorDraftStore(storage, 'other', 'project', 'page-a');
  const elements = [{ id: 'item', type: 'Text', pageId: 'page-a', content: 'offline' }] as const;
  a.save([...elements]);
  assert.deepEqual(a.read()?.elements, elements);
  assert.equal(b.read(), null);
  assert.equal(otherUser.read(), null);
  a.remove();
  assert.equal(a.read(), null);
});

test('invalid stored drafts do not replace editor state', () => {
  const storage = { getItem: () => '{invalid', setItem: () => {}, removeItem: () => {} };
  assert.equal(createEditorDraftStore(storage, 'u', 'p', 'page').read(), null);
});

test('a later offline session does not overwrite an earlier recovery draft', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
  const first = createEditorDraftStore(storage, 'u', 'p', 'page');
  const second = createEditorDraftStore(storage, 'u', 'p', 'page');
  first.save([{ id: 'one', type: 'Text', pageId: 'page', content: 'first' }]);
  second.save([{ id: 'two', type: 'Text', pageId: 'page', content: 'second' }]);
  assert.equal(second.read()?.elements[0].id, 'two');
  second.remove();
  assert.equal(first.read()?.elements[0].id, 'one');
});
