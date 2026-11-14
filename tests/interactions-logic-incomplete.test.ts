// Incomplete (draft) logic is storable: the server keeps it, so every place
// the client reads server data must keep it too (see tests/fixtures/logic-parity.json).
import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';
import { setVariable } from '../src/features/interactions/logic';
import { emptySnapshot, mergedLogic, parseSnapshot, snapshotFromServer, useLogicStore, type LogicRemote } from '../src/features/interactions/logic-store';

const draftFlow = { do: [{ show: '' }] };
const brokenTemplate = { do: [{ toast: '{{ vars.count + }}' }] };
const doc = (flows: Record<string, unknown> = {}, variables: Record<string, unknown> = {}) => ({ v: 1 as const, variables, flows });
const settle = () => new Promise((r) => setTimeout(r, 0));

interface Sent { scope: string; patch: Record<string, unknown>; ok: (v?: unknown) => void }
function connect() {
  const sent: Sent[] = [];
  const rejected: string[] = [];
  const remote: LogicRemote = {
    pageId: 'home',
    isOnline: () => true,
    send: (scope, patch) => new Promise((resolve) => sent.push({ scope, patch, ok: resolve })),
    requestSync: () => {},
    onRejected: (m) => rejected.push(m),
  };
  useLogicStore.getState().bindRemote(remote);
  return { sent, rejected };
}

beforeEach(() => {
  useLogicStore.getState().unbindRemote();
  useLogicStore.setState({ ...emptySnapshot(), confirmed: emptySnapshot(), projectId: null, past: [], future: [], pending: 0, remote: null });
});

test('an incomplete flow round-trips through update, ack, broadcast and sync without being reverted', async () => {
  const { sent, rejected } = connect();
  const store = useLogicStore.getState();
  // The Logic panel adds a step with defaultStep(), e.g. { show: "" }.
  const r = store.edit({ page: 'home' }, (d) => ({ ok: true, logic: { ...d, flows: { ...d.flows, draft: draftFlow } } }), { allowIncomplete: true });
  assert.ok(r.ok);
  assert.equal(sent.length, 1);
  // The server stores it and broadcasts the committed document before acking.
  const committed = doc({ draft: draftFlow });
  useLogicStore.getState().receiveChange('page', 'home', committed);
  sent[0].ok();
  await settle();
  assert.deepEqual(useLogicStore.getState().pages.home, committed);
  // A later sync (e.g. reconnect) carries the same draft.
  useLogicStore.getState().receiveSync({ project: doc({ later: brokenTemplate }), page: committed, pageId: 'home' });
  await settle();
  const state = useLogicStore.getState();
  assert.deepEqual(state.pages.home, committed);
  assert.deepEqual(state.project.flows.later, brokenTemplate);
  assert.deepEqual(rejected, []);
});

test('other edits still work while a stored flow is incomplete', () => {
  connect();
  useLogicStore.getState().receiveSync({ project: doc({ draft: draftFlow }), page: doc(), pageId: 'home' });
  const r = useLogicStore.getState().edit('project', (d) => setVariable(d, 'count', { type: 'number', default: 0 }));
  assert.ok(r.ok, JSON.stringify(!r.ok && r.issues));
  // A change that adds a new incomplete step without allowIncomplete is still refused.
  const refused = useLogicStore.getState().edit('project', (d) => ({ ok: true, logic: { ...d, flows: { ...d.flows, more: { do: [{ hide: '' }] } } } }));
  assert.equal(refused.ok, false);
});

test('a sync with a malformed document is still ignored', () => {
  connect();
  useLogicStore.getState().receiveSync({ project: doc({ draft: draftFlow }), page: doc(), pageId: 'home' });
  useLogicStore.getState().receiveSync({ project: doc({ bad: { do: [{ show: 5 }] } }), pageId: 'home' });
  assert.deepEqual(Object.keys(useLogicStore.getState().project.flows), ['draft']);
});

test('the preview keeps documents that are only incomplete', () => {
  const project = doc({ later: brokenTemplate }, { count: { type: 'number', default: 0 } });
  const snapshot = snapshotFromServer(project, [
    { id: 'home', logic: doc({ draft: draftFlow }) },
    { id: 'broken', logic: doc({ bad: { do: [{ show: 5 }] } }) },
  ]);
  assert.deepEqual(Object.keys(snapshot.pages), ['home']);
  assert.deepEqual(Object.keys(mergedLogic(snapshot).flows).sort(), ['draft', 'later']);
  assert.deepEqual(Object.keys(mergedLogic(snapshot).variables), ['count']);
});

test('a stored offline snapshot keeps incomplete documents', () => {
  const snapshot = { project: doc({ later: brokenTemplate }), pages: { home: doc({ draft: draftFlow }) } };
  assert.deepEqual(parseSnapshot(snapshot), snapshot);
});
