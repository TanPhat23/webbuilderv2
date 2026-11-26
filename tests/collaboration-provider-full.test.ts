import { register } from 'node:module';
import { strict as assert } from 'node:assert';
import { test } from 'node:test';

const loader = `export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  return result;
}`;
register('data:text/javascript,' + encodeURIComponent(loader));

const { PresenceController } = await import('../apps/editor/src/features/collaboration/lib/realtime/AwarenessController');

class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  constructor(readonly url: string) { FakeWebSocket.instances.push(this); }
  send(data: string) { this.sent.push(data); }
  close() { this.readyState = 3; }
  open() { this.readyState = FakeWebSocket.OPEN; this.onopen?.(); }
  receive(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) }); }
  sentOf(type: string) { return this.sent.map((m) => JSON.parse(m)).filter((m) => m.type === type); }
}

const tick = (ms = 0) => new Promise((r) => setTimeout(r, ms));

async function setup(extra: Record<string, unknown> = {}) {
  const original = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  FakeWebSocket.instances = [];
  const { RealtimeProvider } = await import('../apps/editor/src/features/collaboration/lib/realtime/RealtimeProvider');
  const state: any = { elements: [], setElements() {}, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const events: Record<string, unknown[]> = { sync: [], changed: [], users: [], errors: [] };
  const provider = new RealtimeProvider({
    url: 'ws://localhost:1234', projectId: 'p', pageId: 'pg', userId: 'u', userName: 'Una',
    getTicket: async () => 'ticket-1', getElementState: () => state,
    onError: (e: unknown) => events.errors.push(e),
    onLogicSync: (p: unknown) => events.sync.push(p),
    onLogicChanged: (p: unknown, own: boolean) => events.changed.push({ p, own }),
    onSyncUsers: (u: unknown) => events.users.push(u),
    ...extra,
  } as never);
  await tick();
  const socket = FakeWebSocket.instances.at(-1)!;
  socket.open();
  return { provider, socket, events, restore: () => { provider.destroy(); globalThis.WebSocket = original; } };
}

// ---------------------------------------------------------------- PresenceController

test('awareness tracks the local selection', () => {
  const a = new PresenceController('me');
  assert.equal(a.getLocalSelectedElement(), null);
  a.updateLocalSelection('el-1');
  assert.equal(a.getLocalSelectedElement(), 'el-1');
});

test('remote presence is stored, normalised and ignores our own user', () => {
  const a = new PresenceController('me');
  const changes: any[] = [];
  a.on('change', (d) => changes.push(d));
  a.applyRemotePresence({ userId: 'me', userName: 'Me', cursorX: 1, cursorY: 1 });
  assert.equal(changes.length, 0);
  a.applyRemotePresence({ userId: 'bo', userName: 'Bo', cursorX: 3, cursorY: 4, elementId: 'e9' });
  a.applyRemotePresence({ userId: 'cy', userName: 'Cy', cursorX: 0, cursorY: 0, elementId: null });
  const last = changes.at(-1);
  assert.deepEqual(last.remoteUsers.bo, { x: 3, y: 4 });
  assert.deepEqual(last.selectedByUser, { bo: 'e9' });
  assert.equal(last.users.cy.userName, 'Cy');
  assert.equal(a.remotePresences.size, 2);
  a.remotePresences.clear();
  assert.equal(a.remotePresences.size, 2, 'the getter returns a copy');
});

test('replaceRemotePresences replaces the roster and skips us', () => {
  const a = new PresenceController('me');
  a.applyRemotePresence({ userId: 'old', userName: 'Old', cursorX: 0, cursorY: 0 });
  a.replaceRemotePresences([
    { userId: 'me', userName: 'Me', presence: { cursorX: 0, cursorY: 0 } },
    { userId: 'new', userName: 'New', presence: { cursorX: 5, cursorY: 6, elementId: 'x' } },
  ]);
  assert.deepEqual([...a.remotePresences.keys()], ['new']);
});

test('pruneStale drops only presences older than the limit', () => {
  const a = new PresenceController('me');
  const realNow = Date.now;
  let now = 1_000_000;
  Date.now = () => now;
  try {
    const changes: unknown[] = [];
    a.applyRemotePresence({ userId: 'stale', userName: 'S', cursorX: 0, cursorY: 0 });
    now += 50_000;
    a.applyRemotePresence({ userId: 'fresh', userName: 'F', cursorX: 0, cursorY: 0 });
    a.on('change', (d) => changes.push(d));
    now += 20_000; // stale = 70s, fresh = 20s
    a.pruneStale();
    assert.deepEqual([...a.remotePresences.keys()], ['fresh']);
    assert.equal(changes.length, 1);
    a.pruneStale();
    assert.equal(changes.length, 1, 'nothing changed, nothing emitted');
    a.pruneStale(1_000);
    assert.equal(a.remotePresences.size, 0);
  } finally {
    Date.now = realNow;
  }
  a.destroy();
});

// ---------------------------------------------------------------- Provider

test('constructing without getElementState is rejected', async () => {
  const { RealtimeProvider } = await import('../apps/editor/src/features/collaboration/lib/realtime/RealtimeProvider');
  assert.throws(() => new RealtimeProvider({ url: 'ws://x', projectId: 'p', pageId: 'pg', userId: 'u' } as never), /getElementState is required/);
});

test('status listeners get the current status immediately and on change', async () => {
  const { provider, restore } = await setup();
  try {
    const seen: string[] = [];
    const listener = ({ status }: { status: string }) => seen.push(status);
    provider.on('status', listener);
    assert.equal(seen[0], 'connected');
    assert.equal(provider.isConnected(), true);
    provider.disconnect();
    assert.equal(seen.at(-1), 'disconnected');
    provider.off('status', listener);
    provider.disconnect();
    const count = seen.length;
    provider.disconnect();
    assert.equal(seen.length, count);
    const synced: boolean[] = [];
    const s = (v: boolean) => synced.push(v);
    provider.on('synced', s);
    provider.off('synced', s);
  } finally { restore(); }
});

test('sendPresence includes the remembered selection', async () => {
  const { provider, socket, restore } = await setup();
  try {
    provider.sendPresence(10, 20, 'el-7');
    provider.sendPresence(11, 21);
    const [first, second] = socket.sentOf('presence');
    assert.equal(first.payload.elementId, 'el-7');
    assert.equal(first.payload.userName, 'Una');
    assert.equal(second.payload.elementId, 'el-7', 'the last selection is reused');
    provider.sendPresence(1, 1, null);
    assert.equal(socket.sentOf('presence')[2].payload.elementId, null);
  } finally { restore(); }
});

test('requestLogicSync asks the server only while connected', async () => {
  const { provider, socket, restore } = await setup();
  try {
    provider.requestLogicSync();
    assert.equal(socket.sentOf('logic:sync').length, 1);
    provider.disconnect();
    provider.requestLogicSync();
    assert.equal(socket.sentOf('logic:sync').length, 1);
  } finally { restore(); }
});

test('updateLogic resolves when the server acknowledges it and reports own changes', async () => {
  const { provider, socket, events, restore } = await setup();
  try {
    const pending = provider.updateLogic('project', { vars: { a: 1 } }, [['vars', 'b']]);
    await tick();
    const sent = socket.sentOf('logic:update')[0];
    assert.deepEqual(sent.payload, { scope: 'project', patch: { vars: { a: 1 } }, nullPaths: [['vars', 'b']] });
    const reply = { type: 'logic:update', requestId: sent.requestId, projectId: 'p', pageId: 'pg', payload: { scope: 'project', logic: { vars: { a: 1 } } } };
    socket.receive(reply);
    assert.deepEqual((await pending).scope, 'project');
    assert.equal((events.changed[0] as { own: boolean }).own, true);

    const noNull = provider.updateLogic('page', {});
    await tick();
    assert.equal('nullPaths' in socket.sentOf('logic:update')[1].payload, false);
    socket.receive({ type: 'error', requestId: socket.sentOf('logic:update')[1].requestId, payload: { code: 'VALIDATION_ERROR', message: 'bad' } });
    await assert.rejects(noNull);
  } finally { restore(); }
});

test('updateLogic rejects an unexpected acknowledgement payload', async () => {
  const { provider, socket, restore } = await setup();
  try {
    const pending = provider.updateLogic('project', {});
    await tick();
    const id = socket.sentOf('logic:update')[0].requestId;
    socket.receive({ type: 'logic:update', requestId: id, projectId: 'p', pageId: 'pg', payload: { scope: 'bogus', logic: {} } });
    await assert.rejects(pending);
  } finally { restore(); }
});

test('moveLogic resolves with the synced project, and rejects malformed replies', async () => {
  const { provider, socket, events, restore } = await setup();
  try {
    const ok = provider.moveLogic('flow', 'welcome', 'page');
    await tick();
    const sent = socket.sentOf('logic:move')[0];
    assert.deepEqual(sent.payload, { kind: 'flow', name: 'welcome', to: 'page' });
    socket.receive({ type: 'logic:move', requestId: sent.requestId, projectId: 'p', pageId: 'pg', payload: { project: { flows: {} }, pageId: 'pg' } });
    assert.ok((await ok).project);
    assert.equal(events.sync.length, 1, 'the move also refreshes the store');

    const bad = provider.moveLogic('variable', 'v', 'project');
    await tick();
    const id = socket.sentOf('logic:move')[1].requestId;
    socket.receive({ type: 'logic:move', requestId: id, projectId: 'p', pageId: 'pg', payload: { project: 'nope' } });
    await assert.rejects(bad);
  } finally { restore(); }
});

test('moveElement sends its position and resolves with the server result', async () => {
  const { provider, socket, restore } = await setup();
  try {
    const moved = provider.moveElement('e1', 'parent', 3);
    provider.moveElement('e2').catch(() => {});
    await tick();
    const [first, second] = socket.sentOf('element:move');
    assert.deepEqual(first.payload, { id: 'e1', parentId: 'parent', order: 3 });
    assert.deepEqual(second.payload, { id: 'e2', parentId: null, order: 0 });
    socket.receive({
      type: 'element:move', requestId: first.requestId, projectId: 'p', pageId: 'pg',
      payload: { id: 'e1', parentId: 'parent', order: 3 },
    });
    assert.equal((await moved).operationType, 'move');
  } finally { restore(); }
});

test('server presence reaches onPresenceChange and onSyncUsers; a throwing callback is contained', async () => {
  const { provider, socket, events, restore } = await setup();
  const realError = console.error;
  const logged: unknown[][] = [];
  console.error = (...a: unknown[]) => { logged.push(a); };
  try {
    const seen: number[] = [];
    const off = provider.onPresenceChange((m) => seen.push(m.size));
    assert.deepEqual(seen, [0]);
    socket.receive({ type: 'presence', projectId: 'p', pageId: 'pg', userId: 'bo', payload: { userId: 'bo', userName: 'Bo', cursorX: 1, cursorY: 2 } });
    assert.equal(seen.at(-1), 1);
    assert.ok(events.users.length >= 1);
    off();
    socket.receive({ type: 'presence', projectId: 'p', pageId: 'pg', userId: 'cy', payload: { userId: 'cy', userName: 'Cy', cursorX: 1, cursorY: 2 } });
    assert.equal(seen.at(-1), 1, 'unsubscribed');

    provider.onPresenceChange(() => { throw new Error('listener bug'); });
    assert.ok(logged.some((l) => String(l[0]).includes('onPresenceChange callback error')));
  } finally { console.error = realError; restore(); }
});

test('agent requests are answered over the socket', async () => {
  const requests: unknown[] = [];
  const { socket, restore } = await setup({
    onAgentRequest: async (req: { tool: string }) => {
      requests.push(req);
      return req.tool === 'boom' ? Promise.reject(new Error('x')) : { ok: true, result: { done: req.tool } };
    },
  });
  try {
    socket.receive({ type: 'agent:request', requestId: 'a1', projectId: 'p', pageId: 'pg', payload: { tool: 'add', args: { n: 1 } } });
    socket.receive({ type: 'agent:request', requestId: 'a2', projectId: 'p', pageId: 'pg', payload: { tool: 'boom' } });
    socket.receive({ type: 'agent:request', projectId: 'p', pageId: 'pg', payload: { tool: 'ignored' } });
    await tick(5);
    assert.equal(requests.length, 2);
    const replies = socket.sentOf('agent:response');
    assert.deepEqual(replies.find((r) => r.requestId === 'a1').payload, { ok: true, result: { done: 'add' } });
    assert.equal(replies.find((r) => r.requestId === 'a2').payload.ok, false);
  } finally { restore(); }
});

test('reconnect opens a fresh socket', async () => {
  const { provider, restore } = await setup();
  try {
    const before = FakeWebSocket.instances.length;
    await provider.reconnect();
    assert.equal(FakeWebSocket.instances.length, before + 1);
    assert.equal(provider.pendingUpdates, 0);
  } finally { restore(); }
});

test('the dispatcher overflow callback reports once', async () => {
  const { provider, events, restore } = await setup();
  try {
    provider.disconnect();
    for (let i = 0; i < 1100; i++) provider.sendPresence(i, i);
    const overflows = (events.errors as { message: string }[]).filter((e) => /Too many offline changes/.test(e.message));
    assert.equal(overflows.length, 1, 'reported once even though many were dropped');
  } finally { restore(); }
});
