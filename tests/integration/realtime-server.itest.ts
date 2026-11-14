/**
 * Two real client providers against the real Go realtime server.
 *
 * Run with `bun run test:integration` (see scripts/it-realtime.sh): it starts
 * a throwaway Postgres and Redis and a test-only server using the API's
 * realtime implementation. Each client has its own synthetic identity.
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
  logicSyncs: any[];
  logicChanges: any[];
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

  const store = createElementStore();
  const errors: { code?: string; message?: string }[] = [];
  const logicSyncs: any[] = [];
  const logicChanges: any[] = [];
  const provider = new CustomYjsProviderV2({
    url: SERVER, projectId: PROJECT, pageId, userId: user,
    getToken: async () => user,
    getElementState: () => store.getState() as any,
    onError: (e: any) => errors.push(e),
    onLogicSync: (payload: any) => logicSyncs.push(payload),
    onLogicChanged: (payload: any) => logicChanges.push(payload),
  });
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
  const client = { user, store, provider, errors, failures, logicSyncs, logicChanges, get tree() { return store.getState().elements as any[]; } };
  clients.push(client);
  return client;
}

/** What a brand-new client sees: the server's saved state for the page. */
async function saved(pageId: string) {
  const c = await connect(`reader${Math.random().toString(36).slice(2, 6)}`, pageId);
  return c.tree;
}

after(() => { for (const c of clients) c.provider.destroy(); });

test('real providers synchronize concurrent logic edits, literal nulls and scope moves', async () => {
  const page = nextPage();
  const a = await connect('u1', page);
  const b = await connect('u2', page);
  await Promise.all([
    a.provider.updateLogic('project', { variables: { sync_count: { type: 'number', default: 2 } } }),
    b.provider.updateLogic('page', { variables: { sync_profile: { type: 'object' } } }, [['variables', 'sync_profile', 'default']]),
  ]);
  await until(() => b.logicChanges.some((p: any) => p.scope === 'project' && p.logic.variables.sync_count), 'project logic broadcast');
  await until(() => a.logicChanges.some((p: any) => p.scope === 'page' && p.logic.variables.sync_profile), 'page logic broadcast');
  const move = await a.provider.moveLogic('variable', 'sync_count', 'page');
  assert.equal(move.project.variables.sync_count, undefined);
  assert.deepEqual(move.page.variables.sync_count, { type: 'number', default: 2 });
  assert.equal(move.page.variables.sync_profile.default, null);
  await until(() => b.logicSyncs.some((p: any) => p.page?.variables?.sync_count), 'move broadcast');
  const reconnect = await connect('u1', page);
  await until(() => reconnect.logicSyncs.some((p: any) => p.page?.variables?.sync_count), 'persisted logic after reconnect');
  assert.equal(reconnect.logicSyncs.at(-1).page.variables.sync_profile.default, null);
});

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

test('concurrent interaction additions, removal, and undo sync across clients', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('btn', { pageId: page }));
  await until(() => b.tree.length === 1, 'bob sees the element');

  const { addInteraction, removeInteraction } = await import('../../src/features/interactions/ops');
  const { commit } = await import('../../src/features/interactions/ops-store');
  const interactions = (tree: any[]) => tree[0]?.settings?.interactions ?? {};

  // Both clients submit their edits synchronously, before either can receive the other's update.
  const ra = commit(uid('btn'), (e) => addInteraction(e, 'click', [{ toast: 'from alice' }]), a.store);
  const rb = commit(uid('btn'), (e) => addInteraction(e, 'mouseenter', [{ toast: 'from bob' }]), b.store);
  assert.ok(ra.ok && ra.id);
  assert.ok(rb.ok && rb.id);
  assert.notEqual(ra.id, rb.id);
  const expected = {
    [ra.id]: { on: 'click', do: [{ toast: 'from alice' }] },
    [rb.id]: { on: 'mouseenter', do: [{ toast: 'from bob' }] },
  };
  await until(() => Object.keys(interactions(a.tree)).length === 2 && Object.keys(interactions(b.tree)).length === 2, 'both see both interactions');
  assert.deepEqual(interactions(a.tree), expected);
  assert.deepEqual(interactions(b.tree), expected);
  assert.deepEqual(interactions(await saved(page)), expected, 'server keeps both interactions');

  const removed = commit(uid('btn'), (e) => removeInteraction(e, ra.id!), a.store);
  assert.ok(removed.ok);
  await until(() => !Object.hasOwn(interactions(b.tree), ra.id!), 'bob sees the removal');
  assert.deepEqual(interactions(b.tree), { [rb.id]: expected[rb.id] });
  assert.deepEqual(interactions(await saved(page)), { [rb.id]: expected[rb.id] }, 'server keeps the other interaction');

  a.store.getState().undo();
  await until(() => Object.hasOwn(interactions(b.tree), ra.id!), 'bob sees the undo');
  assert.deepEqual(interactions(b.tree), expected);
  assert.deepEqual(interactions(await saved(page)), expected, 'server restores the removed interaction');
  assert.equal(a.failures.length + b.failures.length, 0);
});
