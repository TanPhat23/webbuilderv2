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
  onclose: ((e: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  constructor(readonly url: string) { FakeWebSocket.instances.push(this); }
  send(data: string) { this.sent.push(data); }
  open() { this.readyState = FakeWebSocket.OPEN; this.onopen?.(); }
  receive(data: unknown) { this.onmessage?.({ data: JSON.stringify(data) }); }
  serverClose(code: number) { this.readyState = 3; this.onclose?.({ code }); }
}

async function setup() {
  const original = globalThis.WebSocket;
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  FakeWebSocket.instances = [];
  const { CustomYjsProviderV2 } = await import('../src/features/collaboration/lib/yjs/Provider');
  const errors: { message?: string; code?: string }[] = [];
  const state: any = { elements: [], loadElements() {}, remoteAdd() {}, remoteUpdate() {}, remoteMove() {}, remoteDelete() {} };
  const provider = new CustomYjsProviderV2({
    url: 'ws://localhost:1234', projectId: 'p', pageId: 'pg', userId: 'u',
    getToken: async () => 't', getElementState: () => state,
    onError: (e: any) => errors.push(e),
  });
  await new Promise((r) => setTimeout(r, 0));
  const socket = FakeWebSocket.instances.at(-1)!;
  socket.open();
  return { provider, socket, errors, restore: () => { provider.destroy(); globalThis.WebSocket = original; } };
}

test('a permission close stops reconnecting and tells the user why', async () => {
  const { provider, socket, errors, restore } = await setup();
  try {
    const before = FakeWebSocket.instances.length;
    socket.serverClose(1008);
    await new Promise((r) => setTimeout(r, 1500));
    assert.equal(FakeWebSocket.instances.length, before, 'no reconnect attempt');
    assert.equal(provider.connected, false);
    assert.match(errors.at(-1)!.message!, /access/);
  } finally { restore(); }
});

test('an abnormal close is transient and reconnects', async () => {
  const { socket, errors, restore } = await setup();
  try {
    const before = FakeWebSocket.instances.length;
    socket.serverClose(1006);
    await new Promise((r) => setTimeout(r, 1500));
    assert.ok(FakeWebSocket.instances.length > before, 'reconnected');
    assert.equal(errors.length, 0);
  } finally { restore(); }
});

test('JOIN_REQUIRED rejoins quietly, but only once in a burst', async () => {
  const { socket, errors, restore } = await setup();
  try {
    const joins = () => socket.sent.filter((m) => JSON.parse(m).type === 'join').length;
    assert.equal(joins(), 1);
    socket.receive({ type: 'error', payload: { code: 'JOIN_REQUIRED', message: 'join first' } });
    assert.equal(joins(), 2);
    assert.equal(errors.length, 0);
    socket.receive({ type: 'error', payload: { code: 'JOIN_REQUIRED', message: 'join first' } });
    assert.equal(joins(), 2, 'no rejoin loop');
    assert.equal(errors.length, 1);
  } finally { restore(); }
});

test('server error codes become readable messages', async () => {
  const { socket, errors, restore } = await setup();
  try {
    socket.receive({ type: 'error', payload: { code: 'NOT_FOUND', message: '' } });
    assert.match(errors.at(-1)!.message!, /no longer exists/);
    socket.receive({ type: 'error', payload: { code: 'VALIDATION_ERROR', message: 'order is invalid' } });
    assert.equal(errors.at(-1)!.message, 'order is invalid');
  } finally { restore(); }
});
