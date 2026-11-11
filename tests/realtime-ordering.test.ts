import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { OrderedElementSession, mergeServerPatch } from '../src/features/collaboration/lib/yjs/OrderedElementSession';
import type { EditorElement } from '../src/types/global.type';

const text = (id: string, content = '') => ({ id, type: 'Text', pageId: 'page', content } as EditorElement);
const update = (seq: number, id: string, content: string, clientOpId?: string) => ({ type: 'element:update', seq, clientOpId, payload: { id, content } } as const);

test('server patches recursively merge objects and delete null-valued fields', () => {
  assert.deepEqual(mergeServerPatch({ a: { x: 1, y: 2 }, keep: true }, { a: { x: null, z: 3 }, fresh: { removed: null, ok: 1 } }), { a: { y: 2, z: 3 }, keep: true, fresh: { ok: 1 } });
});

test('ordered creates use the server position and retain the assigned key', async () => {
  const { applyElementOperation } = await import('../src/features/collaboration/lib/yjs/OrderedElementSession');
  const elements = [text('a'), text('c')];
  const inserted = { ...text('b'), order: 1, orderKey: 'a1' };
  const result = applyElementOperation(elements, { type: 'element:create', payload: { element: inserted } });
  assert.deepEqual(result.map((element) => element.id), ['a', 'b', 'c']);
  assert.equal((result[1] as typeof inserted).orderKey, 'a1');
});

test('ordered moves retain the assigned server key', async () => {
  const { applyElementOperation } = await import('../src/features/collaboration/lib/yjs/OrderedElementSession');
  const result = applyElementOperation([text('a'), text('b')], { type: 'element:move', payload: { id: 'b', parentId: null, order: 0, orderKey: 'Zz' } });
  assert.deepEqual(result.map((element) => element.id), ['b', 'a']);
  assert.equal((result[0] as EditorElement & { orderKey?: string }).orderKey, 'Zz');
});

test('own echo confirms an optimistic operation without duplicating it', () => {
  let view: EditorElement[] = [];
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {} });
  session.snapshot([], 0);
  const op = { type: 'element:create', clientOpId: 'mine', payload: { element: text('a') } } as const;
  session.recordLocal(op);
  session.receive({ ...op, seq: 1 });
  assert.deepEqual(view.map((item) => item.id), ['a']);
  assert.equal(session.pendingCount, 0);
  session.dispose();
});

test('out-of-order broadcasts are buffered and replayed in sequence', () => {
  let view: EditorElement[] = [];
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {}, gapTimeoutMs: 10000 });
  session.snapshot([text('a')], 4);
  session.receive(update(6, 'a', 'six'));
  assert.equal(view[0].content, '');
  session.receive(update(5, 'a', 'five'));
  assert.equal(view[0].content, 'six');
  session.receive(update(5, 'a', 'duplicate'));
  assert.equal(view[0].content, 'six');
  session.dispose();
});

test('a sequence gap requests a snapshot', async () => {
  let resyncs = 0;
  const session = new OrderedElementSession({ render: () => {}, requestSnapshot: () => { resyncs++; }, gapTimeoutMs: 1 });
  session.snapshot([text('a')], 1);
  session.receive(update(3, 'a', 'three'));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(resyncs, 1);
  session.dispose();
});

test('a missing snapshot is requested again until one arrives or the session is suspended', async () => {
  let requests = 0;
  const session = new OrderedElementSession({ render: () => {}, requestSnapshot: () => { requests++; }, snapshotTimeoutMs: 10 });
  session.snapshot([text('a')], 1);
  session.resync();
  await new Promise((resolve) => setTimeout(resolve, 35));
  assert.ok(requests >= 2);
  session.snapshot([text('a')], 1);
  const afterSnapshot = requests;
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(requests, afterSnapshot);
  session.resync();
  session.suspend();
  const afterSuspend = requests;
  await new Promise((resolve) => setTimeout(resolve, 25));
  assert.equal(requests, afterSuspend);
  session.dispose();
});

test('rejecting an operation rolls it back and rebases later pending edits', () => {
  let view: EditorElement[] = [];
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {} });
  session.snapshot([text('a', 'original'), text('b', 'original')], 0);
  session.recordLocal({ type: 'element:update', clientOpId: 'first', payload: { id: 'a', content: 'rejected' } });
  session.recordLocal({ type: 'element:update', clientOpId: 'second', payload: { id: 'b', content: 'kept' } });
  session.reject('first');
  assert.deepEqual(view.map((el) => el.content), ['original', 'kept']);
  session.dispose();
});

test('a snapshot confirms a buffered echo that it already includes', () => {
  let view: EditorElement[] = [];
  let committed = 0;
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {}, onCommitted: () => { committed++; } });
  session.snapshot([text('a')], 1);
  session.recordLocal({ type: 'element:update', clientOpId: 'mine', requestId: 'request', payload: { id: 'a', content: 'mine' } });
  session.receive({ ...update(3, 'a', 'mine', 'mine'), requestId: 'request' });
  session.snapshot([text('a', 'mine')], 3);
  assert.equal(view[0].content, 'mine');
  assert.equal(session.pendingCount, 0);
  assert.equal(committed, 1);
  session.dispose();
});

test('a reconnect waits for a snapshot before applying broadcasts', () => {
  let view: EditorElement[] = [];
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {} });
  session.snapshot([text('a', 'before')], 3);
  session.suspend();
  session.receive(update(5, 'a', 'after'));
  assert.equal(view[0].content, 'before');
  session.snapshot([text('a', 'snapshot')], 4);
  assert.equal(view[0].content, 'after');
  session.dispose();
});

test('another client cannot confirm a pending operation by reusing its request id', () => {
  let view: EditorElement[] = [];
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {} });
  session.snapshot([text('a')], 0);
  session.recordLocal({ type: 'element:update', clientOpId: 'mine', requestId: 'shared', payload: { id: 'a', content: 'local' } });
  session.receive({ type: 'element:update', seq: 1, clientOpId: 'other', requestId: 'shared', payload: { id: 'a', content: 'remote' } });
  assert.equal(session.pendingCount, 1);
  assert.equal(view[0].content, 'local');
  session.dispose();
});

test('a lower snapshot sequence resets stale buffered operations', () => {
  let view: EditorElement[] = [];
  let snapshotsRequested = 0;
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => { snapshotsRequested++; } });
  session.snapshot([text('a', 'old')], 8);
  session.receive(update(10, 'a', 'stale'));
  session.snapshot([text('a', 'new epoch')], 1);
  assert.equal(snapshotsRequested, 1);
  session.snapshot([text('a', 'new epoch')], 1);
  for (let seq = 2; seq <= 9; seq++) session.receive(update(seq, 'a', 'fresh'));
  assert.equal(view[0].content, 'fresh');
  session.dispose();
});

test('moving into an element that cannot contain children keeps the original tree', async () => {
  const { applyElementOperation } = await import('../src/features/collaboration/lib/yjs/OrderedElementSession');
  const elements = [text('moving'), text('target')];
  const result = applyElementOperation(elements, { type: 'element:move', payload: { id: 'moving', parentId: 'target', order: 0 } });
  assert.deepEqual(result.map((element) => element.id), ['moving', 'target']);
});

test('a remote style patch is retained while a different local style patch is pending', () => {
  let view: EditorElement[] = [];
  const element = { ...text('a'), styles: { default: { color: 'black', padding: 2 } } } as EditorElement;
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => {} });
  session.snapshot([element], 0);
  const local = { type: 'element:update', clientOpId: 'mine', payload: { id: 'a', styles: { default: { color: 'blue' } } } } as const;
  session.recordLocal(local);
  session.receive({ type: 'element:update', seq: 1, clientOpId: 'other', payload: { id: 'a', styles: { default: { padding: 4 } } } });
  assert.deepEqual(view[0].styles, { default: { color: 'blue', padding: 4 } });
  session.receive({ ...local, seq: 2 });
  assert.deepEqual(view[0].styles, { default: { color: 'blue', padding: 4 } });
  session.dispose();
});

test('a requested snapshot cannot arrive after newer changes have already been applied', async () => {
  let view: EditorElement[] = [];
  let resyncs = 0;
  const session = new OrderedElementSession({ render: (elements) => { view = elements; }, requestSnapshot: () => { resyncs++; }, gapTimeoutMs: 1 });
  session.snapshot([text('a', 'one')], 1);
  session.receive(update(3, 'a', 'three'));
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(resyncs, 1);
  session.receive(update(2, 'a', 'two'));
  assert.equal(view[0].content, 'one');
  session.snapshot([text('a', 'one')], 1);
  assert.equal(view[0].content, 'three');
  session.dispose();
});
