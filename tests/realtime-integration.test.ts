import { register } from 'node:module';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

const loader = `export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  return result;
}`;
register('data:text/javascript,' + encodeURIComponent(loader));

class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  constructor(readonly url: string) { FakeWebSocket.instances.push(this); }
  send(data: string) { this.sent.push(data); }
  open() { this.readyState = FakeWebSocket.OPEN; this.onopen?.(); }
  receive(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) }); }
  close() { this.readyState = 3; this.onclose?.(); }
}

test('provider joins, handles remote messages, and resolves an acknowledged operation', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const applied: unknown[][] = [];
  const state = {
    elements: [], loadElements: (...args: unknown[]) => { applied.push(['sync', ...args]); },
    remoteAdd: (...args: unknown[]) => { applied.push(['add', ...args]); },
    remoteUpdate: () => {}, remoteMove: () => {},
    remoteDelete: (...args: unknown[]) => { applied.push(['delete', ...args]); },
  };
  const provider = new CustomYjsProviderV2({
    url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user',
    getToken: async () => 'test-token', doc, getElementState: () => state,
  });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    assert.equal(JSON.parse(socket.sent[0]).type, 'join');
    assert.equal(provider.connected, true);
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [] } });
    assert.equal(provider.isSynced, true);
    const element = { id: 'element', type: 'Text', pageId: 'page', content: '' };
    socket.receive({ type: 'element:create', payload: { element } });
    const deletion = provider.deleteElement('element');
    const sent = JSON.parse(socket.sent.at(-1)!);
    assert.equal(sent.type, 'element:delete');
    assert.equal(sent.payload.id, 'element');
    socket.receive({ type: 'element:delete', requestId: sent.requestId, payload: { id: 'element' } });
    assert.equal((await deletion).deletedElementId, 'element');
    assert.deepEqual(applied, [['sync', [], true], ['add', element], ['delete', 'element']]);
  } finally {
    provider.destroy();
    doc.destroy();
    globalThis.WebSocket = originalSocket;
  }
});

test('ordered server echoes confirm optimistic changes without duplicating them', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const state: any = {
    elements: [],
    loadElements(elements: unknown[]) { state.elements = elements; },
    remoteAdd(element: unknown) { state.elements = [...state.elements, element]; },
    remoteUpdate() {}, remoteMove() {}, remoteDelete() {},
  };
  const provider = new CustomYjsProviderV2({
    url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user',
    getToken: async () => 'test-token', doc, getElementState: () => state,
  });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [], seq: 0 } });
    const element = { id: 'item', type: 'Text', pageId: 'page', content: '' } as const;
    state.elements = [element];
    const pending = provider.createElement(element, null, 0);
    const sent = JSON.parse(socket.sent.at(-1)!);
    assert.ok(sent.clientOpId);
    assert.equal(sent.payload.position, 0);
    assert.equal(state.elements[0].pageId, 'page');
    socket.receive({ type: 'element:create', seq: 1, clientOpId: sent.clientOpId, requestId: sent.requestId, payload: { element } });
    await pending;
    assert.deepEqual(state.elements.map((item: any) => item.id), ['item']);
  } finally {
    provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket;
  }
});

test('rejected local edits roll back without removing later pending edits', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const first = { id: 'first', type: 'Text', pageId: 'page', content: 'original' };
  const second = { id: 'second', type: 'Text', pageId: 'page', content: 'original' };
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [first, second], users: [], seq: 0 } });
    state.elements = [{ ...first, content: 'rejected' }, second];
    const failed = provider.updateElement('first', { content: 'rejected' });
    const observedFailure = assert.rejects(failed, /not allowed/);
    const firstMessage = JSON.parse(socket.sent.at(-1)!);
    state.elements = [state.elements[0], { ...second, content: 'later' }];
    const later = provider.updateElement('second', { content: 'later' });
    const secondMessage = JSON.parse(socket.sent.at(-1)!);
    socket.receive({ type: 'error', clientOpId: firstMessage.clientOpId, payload: { code: 'VALIDATION_ERROR', message: 'not allowed' } });
    await observedFailure;
    assert.deepEqual(state.elements.map((item: any) => item.content), ['original', 'later']);
    socket.receive({ type: 'element:update', seq: 1, clientOpId: secondMessage.clientOpId, payload: { id: 'second', content: 'later' } });
    await later;
    assert.deepEqual(state.elements.map((item: any) => item.content), ['original', 'later']);
  } finally {
    provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket;
  }
});

test('broadcasts received during initial join wait for the page snapshot', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd(element: unknown) { state.elements = [...state.elements, element]; }, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    const element = { id: 'after-snapshot', type: 'Text', pageId: 'page', content: '' };
    socket.receive({ type: 'element:create', seq: 2, payload: { element } });
    assert.deepEqual(state.elements, []);
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [], seq: 1 } });
    assert.deepEqual(state.elements, [element]);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('once sequencing is active an unsequenced mutation requests a snapshot', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd(element: unknown) { state.elements = [...state.elements, element]; }, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [], seq: 0 } });
    socket.receive({ type: 'element:create', payload: { element: { id: 'unsequenced', type: 'Text', pageId: 'page', content: '' } } });
    assert.deepEqual(state.elements, []);
    assert.equal(JSON.parse(socket.sent.at(-1)!).type, 'sync:page');
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('a locally rate-limited operation is rolled back without being sent', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const item = { id: 'item', type: 'Text', pageId: 'page', content: 'original' };
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 0 } });
    (provider as any).dispatcher.rateLimiter.tokens = 0;
    (provider as any).dispatcher.rateLimiter.refillRate = 0;
    state.elements = [{ ...item, content: 'rejected' }];
    await assert.rejects(provider.updateElement('item', { content: 'rejected' }), /Rate limit/);
    assert.equal(state.elements[0].content, 'original');
    assert.equal(socket.sent.length, 1);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('reconnect rebases an uncertain local edit without automatically resending it', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const item = { id: 'item', type: 'Text', pageId: 'page', content: 'original' };
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const firstSocket = FakeWebSocket.instances.at(-1)!;
    firstSocket.open();
    firstSocket.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 1 } });
    state.elements = [{ ...item, content: 'uncertain' }];
    const pending = provider.updateElement('item', { content: 'uncertain' });
    const rejected = assert.rejects(pending, /Connection closed/);
    firstSocket.close();
    await rejected;
    assert.equal(provider.pendingUpdates, 1);
    await provider.reconnect();
    const secondSocket = FakeWebSocket.instances.at(-1)!;
    secondSocket.open();
    secondSocket.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 1 } });
    assert.equal(state.elements[0].content, 'uncertain');
    assert.deepEqual(secondSocket.sent.map((message) => JSON.parse(message).type), ['join']);
    assert.equal(provider.pendingUpdates, 1);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('an edit queued before join is sent after join and rebased on the first snapshot', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const element = { id: 'item', type: 'Text', pageId: 'page', content: 'local' } as const;
  const state: any = { elements: [element], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!;
    const operation = provider.createElement(element);
    socket.open();
    const sent = socket.sent.map((entry) => JSON.parse(entry));
    assert.deepEqual(sent.map((entry) => entry.type), ['join', 'element:create']);
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [], seq: 0 } });
    assert.deepEqual(state.elements.map((entry: any) => entry.id), ['item']);
    socket.receive({ type: 'element:create', seq: 1, clientOpId: sent[1].clientOpId, requestId: sent[1].requestId, payload: { element } });
    await operation;
    assert.deepEqual(state.elements.map((entry: any) => entry.id), ['item']);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('an unsent queued edit rejected on disconnect is not sent after reconnect', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const item = { id: 'item', type: 'Text', pageId: 'page', content: 'original' };
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const first = FakeWebSocket.instances.at(-1)!;
    first.open();
    first.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 0 } });
    state.elements = [{ ...item, content: 'unsent' }];
    first.send = () => { throw new Error('not sent'); };
    const pending = provider.updateElement('item', { content: 'unsent' });
    const rejected = assert.rejects(pending, /Connection closed/);
    first.close();
    await rejected;
    assert.equal(state.elements[0].content, 'original');
    assert.equal(provider.pendingUpdates, 0);
    await provider.reconnect();
    const second = FakeWebSocket.instances.at(-1)!;
    second.open();
    assert.deepEqual(second.sent.map((message) => JSON.parse(message).type), ['join']);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('provider reports pending operation counts as edits are acknowledged', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const counts: number[] = [];
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state, onPendingChange: (count: number) => counts.push(count) } as any);
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!; socket.open();
    const item = { id: 'item', type: 'Text', pageId: 'page', content: 'initial' };
    socket.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 0 } });
    state.elements = [{ ...item, content: 'changed' }];
    const pending = provider.updateElement('item', { content: 'changed' });
    const sent = JSON.parse(socket.sent.at(-1)!);
    assert.equal(counts.at(-1), 1);
    socket.receive({ type: 'element:update', seq: 1, clientOpId: sent.clientOpId, requestId: sent.requestId, payload: { id: 'item', content: 'changed' } });
    await pending;
    assert.equal(counts.at(-1), 0);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('tracking a batch of optimistic creates keeps every local element intact', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const first = { id: 'first', type: 'Text', pageId: 'page', content: '' } as const;
  const second = { id: 'second', type: 'Text', pageId: 'page', content: '' } as const;
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!; socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [], users: [], seq: 0 } });
    state.elements = [first, second];
    const one = provider.createElement(first);
    const firstMessage = JSON.parse(socket.sent.at(-1)!);
    const two = provider.createElement(second);
    const secondMessage = JSON.parse(socket.sent.at(-1)!);
    assert.deepEqual(state.elements.map((entry: any) => [entry.id, entry.pageId]), [['first', 'page'], ['second', 'page']]);
    socket.receive({ type: 'element:create', seq: 1, clientOpId: firstMessage.clientOpId, requestId: firstMessage.requestId, payload: { element: first } });
    socket.receive({ type: 'element:create', seq: 2, clientOpId: secondMessage.clientOpId, requestId: secondMessage.requestId, payload: { element: second } });
    await Promise.all([one, two]);
    assert.deepEqual(state.elements.map((entry: any) => [entry.id, entry.pageId]), [['first', 'page'], ['second', 'page']]);
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});

test('a missing sequence requests a snapshot and then applies buffered changes', async () => {
  const originalSocket = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  const Y = await import('yjs');
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const doc = new Y.Doc();
  const item = { id: 'item', type: 'Text', pageId: 'page', content: 'initial' };
  const state: any = { elements: [], loadElements(elements: unknown[]) { state.elements = elements; }, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({ url: 'ws://localhost:1234', projectId: 'project', pageId: 'page', userId: 'user', getToken: async () => 'token', doc, getElementState: () => state });
  try {
    await new Promise(resolve => setTimeout(resolve, 0));
    const socket = FakeWebSocket.instances.at(-1)!; socket.open();
    socket.receive({ type: 'sync:page', payload: { elements: [item], users: [], seq: 1 } });
    socket.receive({ type: 'element:update', seq: 3, payload: { id: 'item', content: 'third' } });
    assert.equal(state.elements[0].content, 'initial');
    await new Promise(resolve => setTimeout(resolve, 1600));
    assert.equal(JSON.parse(socket.sent.at(-1)!).type, 'sync:page');
    socket.receive({ type: 'sync:page', payload: { elements: [{ ...item, content: 'second' }], users: [], seq: 2 } });
    assert.equal(state.elements[0].content, 'third');
  } finally { provider.destroy(); doc.destroy(); globalThis.WebSocket = originalSocket; }
});
