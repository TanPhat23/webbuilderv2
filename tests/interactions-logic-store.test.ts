import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { setFlow, setVariable } from '../src/features/interactions/logic';
import { countUsages, editLogic, emptySnapshot, findUsageLocations, mergedLogic, parseSnapshot, useLogicStore } from '../src/features/interactions/logic-store';

test('edits one scope and refuses a name already used in another scope', () => {
  const first = editLogic(emptySnapshot(), 'project', (d) => setVariable(d, 'count', { type: 'number', default: 0 }));
  assert.ok(first.ok);
  const clash = editLogic(first.snapshot, { page: 'home' }, (d) => setVariable(d, 'count', { type: 'number', default: 1 }));
  assert.ok(!clash.ok);
  assert.ok(clash.issues.some((i) => i.path === 'pages.home.variables.count'));
  const fine = editLogic(first.snapshot, { page: 'home' }, (d) => setFlow(d, 'greet', [{ toast: 'Hi' }]));
  assert.ok(fine.ok);
});

test('merges project logic with one page, or with every page for the preview', () => {
  let s = emptySnapshot();
  for (const [scope, name] of [['project', 'a'], [{ page: 'p1' }, 'b'], [{ page: 'p2' }, 'c']] as const) {
    const r = editLogic(s, scope, (d) => setVariable(d, name, { type: 'string', default: '' }));
    assert.ok(r.ok);
    s = r.snapshot;
  }
  assert.deepEqual(Object.keys(mergedLogic(s, 'p1').variables).sort(), ['a', 'b']);
  assert.deepEqual(Object.keys(mergedLogic(s).variables).sort(), ['a', 'b', 'c']);
  assert.deepEqual(Object.keys(mergedLogic(s, 'missing').variables), ['a']);
});

test('discards stored logic that no longer validates', () => {
  assert.deepEqual(parseSnapshot(null), emptySnapshot());
  const bad = { project: { v: 1, variables: { n: { type: 'number', default: 'x' } }, flows: {} }, pages: {} };
  assert.deepEqual(parseSnapshot(bad), emptySnapshot());
  const good = { project: { v: 1, variables: { n: { type: 'number', default: 1 } }, flows: {} }, pages: {} };
  assert.deepEqual(parseSnapshot(good), good);
});

test('undo and redo walk back through edits', () => {
  const store = useLogicStore;
  store.setState({ ...emptySnapshot(), projectId: null, past: [], future: [] });
  assert.ok(store.getState().edit('project', (d) => setVariable(d, 'a', { type: 'number', default: 0 })).ok);
  assert.ok(store.getState().edit('project', (d) => setVariable(d, 'b', { type: 'number', default: 0 })).ok);
  store.getState().undo();
  assert.deepEqual(Object.keys(store.getState().project.variables), ['a']);
  store.getState().redo();
  assert.deepEqual(Object.keys(store.getState().project.variables), ['a', 'b']);
  store.getState().undo();
  assert.ok(store.getState().edit('project', (d) => setVariable(d, 'c', { type: 'number', default: 0 })).ok);
  assert.equal(store.getState().future.length, 0);
});

test('counts uses of a variable or flow in element interactions and flows', () => {
  const sources = [
    { ix_aaaaaaaa: { on: 'click', do: [{ set: 'count', to: '{{ vars.count + 1 }}' }, { if: '{{ vars.count > 2 }}', then: [{ run: 'celebrate' }] }] } },
    { do: [{ toast: '{{ vars.counter }}' }] },
  ];
  assert.equal(countUsages('variable', 'count', sources), 3);
  assert.equal(countUsages('variable', 'counter', sources), 1);
  assert.equal(countUsages('flow', 'celebrate', sources), 1);
  assert.equal(countUsages('flow', 'missing', sources), 0);
});

test('identifies the named locations that use a variable or flow', () => {
  const sources = [
    { label: 'Button: Signup', value: { do: [{ run: 'submit' }, { run: 'submit' }] } },
    { label: 'Project flow: welcome', value: { do: [{ set: 'count', to: '{{ vars.count + 1 }}' }] } },
    { label: 'Button: Other', value: { do: [{ toast: 'Hello' }] } },
  ];
  assert.deepEqual(findUsageLocations('flow', 'submit', sources), [{ label: 'Button: Signup', count: 2 }]);
  assert.deepEqual(findUsageLocations('variable', 'count', sources), [{ label: 'Project flow: welcome', count: 2 }]);
});

test('parses variable defaults typed into the panel', async () => {
  const { parseDefault, defaultFor, formatDefault } = await import('../src/features/interactions/editing/logic-edit');
  assert.deepEqual(parseDefault('number', '3.5'), { ok: true, value: 3.5 });
  assert.equal(parseDefault('number', '').ok, false);
  assert.equal(parseDefault('number', 'abc').ok, false);
  assert.deepEqual(parseDefault('boolean', 'true'), { ok: true, value: true });
  assert.equal(parseDefault('boolean', 'yes').ok, false);
  assert.deepEqual(parseDefault('list', '[1,2]'), { ok: true, value: [1, 2] });
  assert.equal(parseDefault('list', '{}').ok, false);
  assert.deepEqual(parseDefault('object', 'null'), { ok: true, value: null });
  assert.equal(parseDefault('object', '[1]').ok, false);
  assert.deepEqual(parseDefault('string', ' hi '), { ok: true, value: ' hi ' });
  assert.equal(formatDefault('list', defaultFor('list')), '[]');
});

test('builds the preview snapshot from the public project and pages', async () => {
  const { snapshotFromServer } = await import('../src/features/interactions/logic-store');
  const project = { v: 1, variables: { count: { type: 'number', default: 0 } }, flows: {} };
  const home = { v: 1, variables: {}, flows: { greet: { do: [{ toast: 'Hi' }] } } };
  const snapshot = snapshotFromServer(project, [
    { id: 'home', logic: home },
    { id: 'about' }, // no logic yet
    { id: 'blank', logic: {} }, // a fresh page stores {}
    { id: 'broken', logic: { v: 1, variables: { n: { type: 'number', default: 'x' } }, flows: {} } },
  ]);
  assert.deepEqual(Object.keys(snapshot.pages).sort(), ['about', 'blank', 'home']);
  assert.deepEqual(Object.keys(mergedLogic(snapshot).variables), ['count']);
  assert.deepEqual(Object.keys(mergedLogic(snapshot).flows), ['greet']);

  assert.deepEqual(snapshotFromServer(undefined, []), emptySnapshot());
  assert.deepEqual(snapshotFromServer({}, [{ id: 'p', logic: {} }]).project, emptySnapshot().project);
});

test('drops published logic whose names collide across scopes', async () => {
  const { snapshotFromServer } = await import('../src/features/interactions/logic-store');
  const doc = { v: 1, variables: { shared: { type: 'string', default: '' } }, flows: {} };
  assert.deepEqual(snapshotFromServer(doc, [{ id: 'home', logic: doc }]), emptySnapshot());
});
