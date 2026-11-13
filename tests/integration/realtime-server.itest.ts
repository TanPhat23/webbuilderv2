/**
 * Two real client providers against the real Go realtime server.
 *
 * Run with `bun run test:integration` (see scripts/it-realtime.sh): it starts
 * a throwaway Postgres and Redis and the server in dev mode, so no Clerk
 * login is needed. Each client is its own user, with its own element store.
 */
import { register } from 'node:module';
import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import { test, after } from 'node:test';

const loader = `export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('src/utils/urlbuilder.ts')) result.source = result.source.toString().replaceAll('import.meta.env', '(import.meta.env || {})');
  return result;
}`;
register('data:text/javascript,' + encodeURIComponent(loader));

const SERVER = process.env.IT_WS_URL ?? 'ws://127.0.0.1:18080';
const PROJECT = 'proj1';

interface Client {
  user: string;
  store: any;
  provider: any;
  errors: { code?: string; message?: string }[];
  failures: Error[];
  readonly tree: any[];
}
const clients: Client[] = [];
let pageCounter = 0;
/** Pages are seeded by the script; each test uses its own so they don't interfere. */
const nextPage = () => `p${++pageCounter}`;

/** The server requires UUID element ids; tests use readable names mapped to them. */
const uuids = new Map<string, string>();
const names = new Map<string, string>();
const uid = (name: string) => {
  let id = uuids.get(name);
  if (!id) { id = randomUUID(); uuids.set(name, id); names.set(id, name); }
  return id;
};
/** Readable shape of a tree: ['keep', ['gone', ['child']]]. */
const ids = (tree: any[]): any[] =>
  tree.map((e) => (e.elements?.length ? [names.get(e.id) ?? e.id, ids(e.elements)] : (names.get(e.id) ?? e.id)));
const el = (name: string, extra: Record<string, any> = {}) =>
  ({
    id: uid(name), type: 'Frame', content: '', styles: {}, tailwindStyles: '', elements: [], ...extra,
    ...(extra.parentId ? { parentId: uid(extra.parentId) } : {}),
  }) as any;
const byName = (tree: any[], name: string): any => {
  for (const e of tree) {
    if (e.id === uid(name)) return e;
    const hit = byName(e.elements ?? [], name);
    if (hit) return hit;
  }
};

const until = async (cond: () => boolean, what: string, ms = 4000) => {
  const start = Date.now();
  while (!cond()) {
    if (Date.now() - start > ms) throw new Error(`timed out waiting for: ${what}`);
    await new Promise((r) => setTimeout(r, 20));
  }
};

async function connect(user: string, pageId: string): Promise<Client> {
  const { CustomYjsProviderV2 } = await import('../../src/features/collaboration/lib/yjs/Provider');
  const { sendElementOp } = await import('../../src/features/collaboration/lib/yjs/sendElementOp');
  const { createElementStore } = await import('../../src/features/editor/store/element-store');

  // Dev mode reads the identity from `devUser`; a browser-style WebSocket can't set headers.
  const Base = globalThis.WebSocket;
  class UserSocket extends Base {
    constructor(url: string | URL, protocols?: string | string[]) {
      super(`${url}&devUser=${user}`, protocols);
    }
  }
  (globalThis as any).WebSocket = UserSocket;

  const store = createElementStore();
  const errors: { code?: string; message?: string }[] = [];
  const provider = new CustomYjsProviderV2({
    url: SERVER, projectId: PROJECT, pageId, userId: user,
    getToken: async () => user,
    getElementState: () => store.getState() as any,
    onError: (e: any) => errors.push(e),
  });
  await new Promise((r) => setTimeout(r, 0));
  (globalThis as any).WebSocket = Base;

  // The same wiring the editor's collaboration provider uses.
  const pendingMoves = new Set<string>();
  const failures: Error[] = [];
  store.getState().setCollaborativeCallback((async (type: any, id: any, data: any) => {
    if (!provider.isSynced || !provider.isConnected()) return;
    try {
      await sendElementOp(provider, () => store.getState().elements, pendingMoves, type, id, data);
    } catch (e) { failures.push(e as Error); errors.push({ message: (e as Error).message }); }
  }) as any);

  await until(() => provider.isSynced, `${user} to sync`);
  const client = { user, store, provider, errors, failures, get tree() { return store.getState().elements as any[]; } };
  clients.push(client);
  return client;
}

/** What a brand-new client sees: the server's saved state for the page. */
async function saved(pageId: string) {
  const c = await connect(`reader${Math.random().toString(36).slice(2, 6)}`, pageId);
  return c.tree;
}

after(() => { for (const c of clients) c.provider.destroy(); });

test('a section deleted on the board and undone comes back for everyone', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);

  a.store.getState().addElement(el('keep', { pageId: page }), el('gone', { pageId: page }));
  a.store.getState().addElement(el('child', { pageId: page, parentId: 'gone' }));
  await until(() => ids(b.tree).length === 2, 'bob sees the sections');
  assert.deepEqual(ids(b.tree), ['keep', ['gone', ['child']]]);

  a.store.getState().deleteElement(uid('gone'));
  await until(() => ids(b.tree).length === 1, 'bob sees the delete');
  assert.deepEqual(ids(await saved(page)), ['keep']);

  a.store.getState().undo();
  await until(() => ids(b.tree).length === 2, 'bob sees the undo');
  assert.deepEqual(ids(b.tree), ids(a.tree));
  assert.deepEqual(ids(await saved(page)), ids(a.tree), 'server keeps the restored section');

  // And the restored section is editable again (it used to be rejected).
  a.store.getState().updateElement(uid('gone'), { content: 'back' });
  await until(() => byName(b.tree, 'gone')?.content === 'back', 'bob sees the edit');
  assert.equal(a.failures.length, 0);
});

test('editing an element a teammate just deleted is a soft failure', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('box', { pageId: page }));
  a.store.getState().addElement(el('inner', { pageId: page, parentId: 'box' }));
  await until(() => b.tree[0]?.elements?.length === 1, 'bob sees the section');

  a.store.getState().deleteElement(uid('box'));
  await until(() => b.tree.length === 0, 'bob sees the delete');

  // Bob's edit was already in flight: send it straight to the server.
  await assert.rejects(b.provider.updateElement(uid('inner'), { content: 'late' }));
  await until(() => b.errors.length > 0, 'bob gets an error');
  const { handleServerError } = await import('../../src/features/collaboration/lib/yjs/connectionErrors');
  const last = b.errors.at(-1)!;
  assert.equal(last.code, 'NOT_FOUND');
  const handling = handleServerError(last.code!, last.message);
  assert.equal(handling.blocking, false);
  assert.match(handling.message, /teammate removed/);
});

test('a style removed by an edit is removed on the server and for others', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('img', { pageId: page, styles: { default: { color: 'red' } } }));
  await until(() => b.tree.length === 1, 'bob sees the element');

  a.store.getState().updateElement(uid('img'), { styles: { default: { color: 'red', width: '12%' } } } as any);
  await until(() => b.tree[0].styles?.default?.width === '12%', 'bob sees the width');

  // Hug removes the width.
  a.store.getState().updateElement(uid('img'), { styles: { default: { color: 'red' } } } as any);
  await until(() => b.tree[0].styles?.default?.width === undefined, 'width gone for bob');
  assert.equal((await saved(page))[0].styles.default.width, undefined, 'width gone on the server');
  assert.equal((await saved(page))[0].styles.default.color, 'red');
});

test('reordering sections and undoing it stays in step for everyone', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('s1', { pageId: page }), el('s2', { pageId: page }), el('s3', { pageId: page }));
  await until(() => b.tree.length === 3, 'bob sees three sections');

  a.store.getState().moveElement(uid('s3'), uid('s1'), 'before');
  await until(() => ids(b.tree)[0] === 's3', 'bob sees the reorder');
  assert.deepEqual(ids(b.tree), ['s3', 's1', 's2']);
  assert.deepEqual(ids(await saved(page)), ['s3', 's1', 's2']);

  a.store.getState().undo();
  await until(() => ids(b.tree)[0] === 's1', 'bob sees the undo');
  assert.deepEqual(ids(b.tree), ['s1', 's2', 's3']);
  assert.deepEqual(ids(await saved(page)), ['s1', 's2', 's3']);
});

test('duplicating then undoing removes the copy everywhere', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('orig', { pageId: page }));
  await until(() => b.tree.length === 1, 'bob sees the original');

  a.store.getState().insertElementRelative(el('copy', { pageId: page }), uid('orig'), 'after');
  await until(() => b.tree.length === 2, 'bob sees the copy');
  assert.deepEqual(ids(b.tree), ['orig', 'copy']);

  a.store.getState().undo();
  await until(() => b.tree.length === 1, 'bob sees the copy removed');
  assert.deepEqual(ids(await saved(page)), ['orig']);
});
