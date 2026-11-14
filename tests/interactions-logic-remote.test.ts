import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';
import { setFlow, setVariable } from '../src/features/interactions/logic';
import { applyPatch, diffPatch, emptySnapshot, useLogicStore, type LogicRemote } from '../src/features/interactions/logic-store';

const num = (n = 0) => ({ type: 'number' as const, default: n });
const doc = (variables: Record<string, unknown> = {}, flows: Record<string, unknown> = {}) => ({ v: 1, variables, flows });

interface Sent { scope: string; patch: Record<string, unknown>; ok: (v?: unknown) => void; fail: (m: string) => void }

function connect(over: Partial<LogicRemote> = {}) {
  const sent: Sent[] = [];
  const rejected: string[] = [];
  let syncs = 0;
  const remote: LogicRemote = {
    pageId: 'home',
    isOnline: () => true,
    send: (scope, patch) => new Promise((resolve, reject) => sent.push({ scope, patch, ok: resolve, fail: (m) => reject(new Error(m)) })),
    requestSync: () => { syncs++; },
    onRejected: (m) => rejected.push(m),
    ...over,
  };
  useLogicStore.getState().bindRemote(remote);
  return { sent, rejected, syncs: () => syncs };
}
const settle = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  useLogicStore.getState().unbindRemote();
  useLogicStore.setState({ ...emptySnapshot(), confirmed: emptySnapshot(), projectId: null, past: [], future: [], pending: 0, remote: null });
});

test('diffPatch deletes missing keys, merges objects and replaces arrays', () => {
  const before = { v: 1, variables: { a: num(1), b: num(2) }, flows: { f: { do: [{ toast: 'x' }] } } };
  const after = { v: 1, variables: { a: num(5) }, flows: { f: { do: [{ toast: 'y' }] } } };
  const patch = diffPatch(before, after);
  assert.deepEqual(patch, { variables: { a: { default: 5 }, b: null }, flows: { f: { do: [{ toast: 'y' }] } } });
  assert.deepEqual(applyPatch(before, patch), after);
  assert.deepEqual(diffPatch(after, after), {});
});

test('diffPatch refuses a null a merge patch could not store', () => {
  assert.throws(() => diffPatch({ variables: {} }, { variables: { o: { type: 'object', default: null } } }), /null/);
  assert.throws(() => diffPatch({ d: { a: 1 } }, { d: { a: null } }), /null/);
  assert.deepEqual(diffPatch({ l: [1] }, { l: [null] }), { l: [null] });
});

test('an edit shows at once and sends only what changed', async () => {
  const { sent } = connect();
  const store = useLogicStore.getState();
  assert.ok(store.edit('project', (d) => setVariable(d, 'count', num())).ok);
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['count']);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].scope, 'project');
  assert.deepEqual(sent[0].patch, { variables: { count: { type: 'number', default: 0 } } });
  sent[0].ok();
  await settle();
  assert.equal(useLogicStore.getState().pending, 0);
});

test('page edits go out as the page scope', () => {
  const { sent } = connect();
  assert.ok(useLogicStore.getState().edit({ page: 'home' }, (d) => setFlow(d, 'greet', [{ toast: 'Hi' }])).ok);
  assert.equal(sent[0].scope, 'page');
});

test('a refused edit is rolled back to the server state and reported', async () => {
  const { sent, rejected } = connect();
  const store = useLogicStore.getState();
  store.receiveSync({ project: doc({ keep: num() }), page: doc(), pageId: 'home' });
  assert.ok(store.edit('project', (d) => setVariable(d, 'bad', num())).ok);
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables).sort(), ['bad', 'keep']);
  sent[0].fail('variable "bad" is already used on another page');
  await settle();
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['keep']);
  assert.deepEqual(rejected, ['variable "bad" is already used on another page']);
  assert.equal(useLogicStore.getState().past.length, 0);
});

test('a collaborator’s change arrives and does not clobber an edit still in flight', async () => {
  const { sent } = connect();
  const store = useLogicStore.getState();
  assert.ok(store.edit('project', (d) => setVariable(d, 'mine', num())).ok);
  store.receiveChange('project', undefined, doc({ theirs: num() }));
  // still shows my pending edit rather than jumping to their document
  assert.ok('mine' in useLogicStore.getState().project.variables);
  // the server's answer to my edit contains both
  store.receiveChange('project', undefined, doc({ theirs: num(), mine: num() }));
  sent[0].ok();
  await settle();
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables).sort(), ['mine', 'theirs']);
});

test('a collaborator’s change shows straight away when nothing is in flight', () => {
  connect();
  useLogicStore.getState().receiveChange('page', 'home', doc({ p: num() }));
  assert.deepEqual(Object.keys(useLogicStore.getState().pages.home.variables), ['p']);
});

test('sync replaces the documents and ignores ones that do not validate', () => {
  connect();
  const store = useLogicStore.getState();
  store.receiveSync({ project: {}, page: {}, pageId: 'home' });
  assert.deepEqual(useLogicStore.getState().project, doc());
  store.receiveSync({ project: doc({ x: num() }), page: doc(), pageId: 'home' });
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['x']);
  store.receiveSync({ project: { nonsense: true }, pageId: 'home' });
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['x']);
});

test('offline, edits and undo are refused and nothing changes', () => {
  let online = true;
  const { sent } = connect({ isOnline: () => online });
  const store = useLogicStore.getState();
  assert.ok(store.edit('project', (d) => setVariable(d, 'a', num())).ok);
  online = false;
  const refused = store.edit('project', (d) => setVariable(d, 'b', num()));
  assert.ok(!refused.ok && /offline/i.test(refused.issues[0].message));
  const undo = store.undo();
  assert.ok(undo && !undo.ok);
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['a']);
  assert.equal(sent.length, 1);
});

test('a page other than the joined one cannot be edited remotely', () => {
  const { sent } = connect();
  const r = useLogicStore.getState().edit({ page: 'other' }, (d) => setFlow(d, 'f', [{ toast: 'x' }]));
  assert.ok(!r.ok);
  assert.equal(sent.length, 0);
});

test('undo replays on top of a collaborator’s edit instead of erasing it', async () => {
  const { sent } = connect();
  const store = useLogicStore.getState();
  assert.ok(store.edit('project', (d) => setVariable(d, 'mine', num())).ok);
  sent[0].ok();
  await settle();
  store.receiveChange('project', undefined, doc({ mine: num(), theirs: num() }));
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables).sort(), ['mine', 'theirs']);
  useLogicStore.getState().undo();
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['theirs']);
  assert.deepEqual(sent[1].patch, { variables: { mine: null } });
  sent[1].ok();
  await settle();
  useLogicStore.getState().redo();
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables).sort(), ['mine', 'theirs']);
});

test('binding asks for the current documents', () => {
  const { syncs } = connect();
  assert.equal(syncs(), 1);
});

test('a sync with no page document clears stale page logic', () => {
  connect();
  useLogicStore.setState({ pages: { home: doc({ stale: num() }) as never }, confirmed: { project: doc() as never, pages: { home: doc({ stale: num() }) as never } } });
  useLogicStore.getState().receiveSync({ project: doc(), pageId: 'home' });
  assert.deepEqual(useLogicStore.getState().pages.home.variables, {});
});
