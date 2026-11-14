// The server reads a logic:sync outside its write actor, so a sync can arrive
// after a newer logic:update broadcast. Each document carries a revision and
// the store ignores anything older than what it already has.
import { strict as assert } from 'node:assert';
import { beforeEach, test } from 'node:test';
import { emptySnapshot, useLogicStore, type LogicRemote } from '../src/features/interactions/logic-store';

const num = (n = 0) => ({ type: 'number' as const, default: n });
const doc = (variables: Record<string, unknown> = {}) => ({ v: 1, variables, flows: {} });

function connect() {
  const remote: LogicRemote = { pageId: 'home', isOnline: () => true, send: () => new Promise(() => {}), requestSync: () => {}, onRejected: () => {} };
  useLogicStore.getState().bindRemote(remote);
}

beforeEach(() => {
  useLogicStore.getState().unbindRemote();
  useLogicStore.setState({ ...emptySnapshot(), confirmed: emptySnapshot(), projectId: null, past: [], future: [], pending: 0, remote: null });
  connect();
});

test('an older sync arriving after a newer broadcast is dropped', () => {
  const store = useLogicStore.getState();
  store.receiveChange('project', undefined, doc({ a: num(), b: num() }), 2);
  store.receiveChange('page', 'home', doc({ p: num() }), 4);
  // Read by the server before those commits, delivered after them.
  store.receiveSync({ project: doc({ a: num() }), projectRevision: 1, page: doc(), pageRevision: 3, pageId: 'home' });
  const state = useLogicStore.getState();
  assert.deepEqual(Object.keys(state.project.variables).sort(), ['a', 'b']);
  assert.deepEqual(Object.keys(state.pages.home.variables), ['p']);
});

test('each document is judged on its own revision', () => {
  const store = useLogicStore.getState();
  store.receiveChange('project', undefined, doc({ a: num() }), 5);
  store.receiveSync({ project: doc(), projectRevision: 4, page: doc({ fresh: num() }), pageRevision: 1, pageId: 'home' });
  const state = useLogicStore.getState();
  assert.deepEqual(Object.keys(state.project.variables), ['a'], 'stale project kept out');
  assert.deepEqual(Object.keys(state.pages.home.variables), ['fresh'], 'newer page applied');
});

test('an older broadcast is dropped and the same revision is applied again', () => {
  const store = useLogicStore.getState();
  store.receiveChange('project', undefined, doc({ new: num() }), 3);
  store.receiveChange('project', undefined, doc({ old: num() }), 2);
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['new']);
  store.receiveSync({ project: doc({ new: num(1) }), projectRevision: 3, pageId: 'home' });
  assert.equal(useLogicStore.getState().project.variables.new.default, 1);
});

test('a missing revision counts as 0, so servers without revisions still sync', () => {
  const store = useLogicStore.getState();
  store.receiveSync({ project: doc({ a: num() }), pageId: 'home' });
  store.receiveChange('project', undefined, doc({ b: num() }));
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['b']);
  // Once a revision is known, an unversioned (older-format) document can't override it.
  store.receiveChange('project', undefined, doc({ c: num() }), 1);
  store.receiveSync({ project: doc({ stale: num() }), pageId: 'home' });
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['c']);
});

test('a new connection starts from the revisions it is sent', () => {
  useLogicStore.getState().receiveChange('project', undefined, doc({ a: num() }), 9);
  connect();
  useLogicStore.getState().receiveSync({ project: doc({ restored: num() }), projectRevision: 2, pageId: 'home' });
  assert.deepEqual(Object.keys(useLogicStore.getState().project.variables), ['restored']);
});
