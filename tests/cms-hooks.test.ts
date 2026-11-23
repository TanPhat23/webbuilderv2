import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';
import type { ContentFieldValue, ContentItem } from '../src/features/cms/interfaces/cms.interface';

redirectModules({
  '@tanstack/react-start': './test-start-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
});

const dom = await import('./support/cms-dom-harness');
const React = await import('react');
const { QueryClientProvider } = await import('@tanstack/react-query');
const { makeClient, disposeClients } = await import('./support/test-hook-harness');
const { createCmsBackend } = await import('./support/cms-fake-backend');
const { cmsKeys } = await import('../src/features/cms/query-keys');
const hooks = await import('../src/features/cms/hooks');
const { useCMSManager } = await import('../src/features/cms/hooks/useCMSManager');
const { CMSProvider, useCMSContext } = await import('../src/features/cms/provider/CMSProvider');

const h = React.createElement;
const realError = console.error;
let backend: ReturnType<typeof createCmsBackend>;
let client: ReturnType<typeof makeClient>;

const type = (id: string, extra: object = {}) => ({ id, name: 'Type ' + id, fields: [], items: [], ...extra });
const field = (id: string, typeId: string, name = 'Body') => ({ id, contentTypeId: typeId, name, type: 'text', required: false });
const item = (id: string, typeId: string, extra: object = {}) => ({
  id, contentTypeId: typeId, title: 'Item ' + id, slug: 'item-' + id, published: false, fieldValues: [], ...extra,
});

beforeEach(() => {
  console.error = () => {};
  backend = createCmsBackend({
    types: [type('t1'), type('t2')],
    fields: { t1: [field('f1', 't1')] },
    items: { t1: [item('i1', 't1')] },
  });
  backend.install();
  client = makeClient();
});
afterEach(async () => {
  await dom.unmountAll();
  backend.restore();
  console.error = realError;
});
after(() => disposeClients());

function Wrap({ children }: { children?: React.ReactNode }) {
  return h(QueryClientProvider, { client }, children);
}

async function mountManager() {
  const ref: { current: ReturnType<typeof useCMSManager> } = { current: undefined as never };
  function Probe() {
    ref.current = useCMSManager();
    return null;
  }
  await dom.mount(h(Wrap, null, h(Probe)));
  await dom.settle();
  return ref;
}

const act = dom.act;

// -------------------------------------------------------------- useCMSManager

test('manager loads content types but not fields or items until a type is selected', async () => {
  const m = await mountManager();
  assert.deepEqual(m.current.contentTypes.map((t) => t.id), ['t1', 't2']);
  assert.equal(m.current.selectedTypeId, '');
  assert.equal(m.current.selectedType, undefined);
  assert.deepEqual(m.current.contentFields, []);
  assert.deepEqual(m.current.contentItems, []);
  assert.equal(m.current.typesLoading, false);
  assert.deepEqual(backend.requests.map((r) => r.path), ['/api/v1/content-types']);
  assert.equal(backend.requests[0].auth, 'Bearer tok-1');
});

test('selecting a type loads its fields and items', async () => {
  const m = await mountManager();
  await act(async () => m.current.selectType('t1'));
  await dom.settle();
  assert.equal(m.current.selectedTypeId, 't1');
  assert.equal(m.current.selectedType?.name, 'Type t1');
  assert.deepEqual(m.current.contentFields.map((f) => f.id), ['f1']);
  assert.deepEqual(m.current.contentItems.map((i) => i.id), ['i1']);
  assert.equal(m.current.fieldsLoading, false);
  assert.equal(m.current.itemsLoading, false);
  assert.equal(m.current.contentTypesError, null);
});

test('a failed types query is surfaced as an error and an empty list', async () => {
  backend.failures.set('GET /api/v1/content-types', 500);
  const m = await mountManager();
  assert.deepEqual(m.current.contentTypes, []);
  assert.ok(m.current.contentTypesError instanceof Error);
});

test('createType appends the new type to the cached list', async () => {
  const m = await mountManager();
  await act(async () => m.current.handleCreateType({ name: 'News', description: 'd' }));
  await dom.settle();
  assert.deepEqual(backend.writes().map((r) => [r.method, r.path, r.body]), [
    ['POST', '/api/v1/content-types', { name: 'News', description: 'd' }],
  ]);
  assert.deepEqual(m.current.contentTypes.map((t) => t.name), ['Type t1', 'Type t2', 'News']);
});

test('updateType replaces the matching cached type', async () => {
  const m = await mountManager();
  await act(async () => m.current.updateTypeMutation.mutate({ id: 't2', data: { name: 'Renamed' } }));
  await dom.settle();
  assert.deepEqual(m.current.contentTypes.map((t) => t.name), ['Type t1', 'Renamed']);
});

test('deleteType drops the type and its caches, and clears the selection if it was selected', async () => {
  const m = await mountManager();
  await act(async () => m.current.selectType('t1'));
  await dom.settle();
  client.setQueryData(cmsKeys.publicContentList('t1'), []);

  await act(async () => m.current.deleteTypeMutation.mutate({ id: 't1' }));
  await dom.settle();
  assert.deepEqual(m.current.contentTypes.map((t) => t.id), ['t2']);
  assert.equal(m.current.selectedTypeId, '');
  assert.equal(client.getQueryData(cmsKeys.contentFields('t1')), undefined);
  assert.equal(client.getQueryData(cmsKeys.contentItems('t1')), undefined);
  assert.equal(client.getQueryState(cmsKeys.publicContentList('t1'))?.isInvalidated, true);
});

test('deleting a different type keeps the current selection', async () => {
  const m = await mountManager();
  await act(async () => m.current.selectType('t1'));
  await dom.settle();
  await act(async () => m.current.deleteTypeMutation.mutate({ id: 't2' }));
  await dom.settle();
  assert.equal(m.current.selectedTypeId, 't1');
  assert.deepEqual(m.current.contentTypes.map((t) => t.id), ['t1']);
});

test('field create, update and delete keep the cache in sync', async () => {
  const m = await mountManager();
  await act(async () => m.current.selectType('t1'));
  await dom.settle();

  await act(async () => m.current.handleCreateField({ name: 'Summary', type: 'textarea', required: true }));
  await dom.settle();
  assert.deepEqual(m.current.contentFields.map((f) => f.name), ['Body', 'Summary']);
  const created = m.current.contentFields[1];

  await act(async () =>
    m.current.updateFieldMutation.mutate({ contentTypeId: 't1', fieldId: created.id, data: { name: 'Lead' } }));
  await dom.settle();
  assert.deepEqual(m.current.contentFields.map((f) => f.name), ['Body', 'Lead']);

  client.setQueryData(cmsKeys.publicContentItem(), 'x');
  await act(async () =>
    m.current.deleteFieldMutation.mutate({ contentTypeId: 't1', fieldId: created.id }));
  await dom.settle();
  assert.deepEqual(m.current.contentFields.map((f) => f.name), ['Body']);
  assert.equal(client.getQueryState(cmsKeys.publicContentItem())?.isInvalidated, true);
});

test('handleCreateField does nothing without a selected type', async () => {
  const m = await mountManager();
  await act(async () => m.current.handleCreateField({ name: 'x', type: 'text', required: false }));
  await dom.settle();
  assert.equal(backend.writes().length, 0);
});

test('item create, update and delete keep the cache in sync and invalidate public content', async () => {
  const m = await mountManager();
  await act(async () => m.current.selectType('t1'));
  await dom.settle();
  const list = cmsKeys.publicContentList('t1');
  client.setQueryData(list, []);

  await act(async () =>
    m.current.handleCreateItem({ title: 'New', slug: 'new', published: true, fieldValues: [{ fieldId: 'f1', value: 'hi' }] }));
  await dom.settle();
  assert.deepEqual(m.current.contentItems.map((i) => i.title), ['Item i1', 'New']);
  const created = m.current.contentItems[1];
  assert.equal(created.fieldValues?.[0].value, 'hi');
  assert.equal(client.getQueryState(list)?.isInvalidated, true);
  assert.deepEqual(backend.writes()[0].body, {
    title: 'New', slug: 'new', published: true, fieldValues: [{ fieldId: 'f1', value: 'hi' }],
  });

  await act(async () =>
    m.current.updateItemMutation.mutate({ contentTypeId: 't1', itemId: created.id, data: { title: 'Edited' } }));
  await dom.settle();
  assert.deepEqual(m.current.contentItems.map((i) => i.title), ['Item i1', 'Edited']);

  await act(async () => m.current.deleteItemMutation.mutate({ contentTypeId: 't1', itemId: 'i1' }));
  await dom.settle();
  assert.deepEqual(m.current.contentItems.map((i) => i.title), ['Edited']);
});

test('handleCreateItem ignores calls without a type and rejects invalid items', async () => {
  const m = await mountManager();
  await act(async () => m.current.handleCreateItem({ title: 'a', slug: 'b', published: false }));
  assert.equal(backend.writes().length, 0);

  await act(async () => m.current.selectType('t1'));
  await dom.settle();
  assert.throws(() => m.current.handleCreateItem({ title: '', slug: 'b', published: false }), /Title is required/);
  assert.equal(backend.writes().length, 0);
});

test('a failing mutation leaves the cache untouched and reports the error', async () => {
  backend.failures.set('POST /api/v1/content-types', 500);
  const m = await mountManager();
  await act(async () => m.current.handleCreateType({ name: 'Nope' }));
  await dom.settle();
  assert.equal(m.current.contentTypes.length, 2);
  assert.ok(m.current.createTypeMutation.error);
});

// --------------------------------------------------------------- CMSProvider

test('useCMSContext throws outside a provider', async () => {
  function Bad() {
    useCMSContext();
    return null;
  }
  const quiet = console.error;
  console.error = () => {};
  await assert.rejects(async () => {
    await dom.mount(h(Wrap, null, h(Bad)));
  }, /must be used inside <CMSProvider>/);
  console.error = quiet;
});

test('CMSProvider exposes the manager plus delete helpers that call the mutations', async () => {
  const ref: { current: ReturnType<typeof useCMSContext> } = { current: undefined as never };
  function Probe() {
    ref.current = useCMSContext();
    return h('span', { id: 'sel' }, ref.current.selectedTypeId);
  }
  await dom.mount(h(Wrap, null, h(CMSProvider, null, h(Probe))));
  await dom.settle();
  await act(async () => ref.current.selectType('t1'));
  await dom.settle();
  assert.equal(dom.$q('#sel')!.textContent, 't1');

  await act(async () => ref.current.handleDeleteItem('t1', 'i1'));
  await dom.settle();
  await act(async () => ref.current.handleDeleteField('t1', 'f1'));
  await dom.settle();
  await act(async () => ref.current.handleDeleteType('t1'));
  await dom.settle();
  assert.deepEqual(backend.writes().map((r) => [r.method, r.path]), [
    ['DELETE', '/api/v1/content-types/t1/items/i1'],
    ['DELETE', '/api/v1/content-types/t1/fields/f1'],
    ['DELETE', '/api/v1/content-types/t1'],
  ]);
  assert.equal(dom.$q('#sel')!.textContent, '');
});

// -------------------------------------------------------------- useCMSContent

const PUBLIC_ITEMS = [
  { id: 'a', title: 'Alpha', slug: 'alpha', createdAt: '2026-01-01' },
  { id: 'b', title: 'Beta', slug: 'beta', createdAt: '2026-01-02' },
];

async function mountHook<T>(useIt: () => T) {
  const ref: { current: T } = { current: undefined as never };
  function Probe() {
    ref.current = useIt();
    return null;
  }
  await dom.mount(h(Wrap, null, h(Probe)));
  await dom.settle();
  return ref;
}

test('useCMSContent stays idle without a content type', async () => {
  const r = await mountHook(() => hooks.useCMSContent());
  assert.deepEqual(r.current.contentItems, []);
  assert.deepEqual(r.current.contentTypes, []);
  assert.equal(r.current.isLoading, false);
  assert.equal(backend.requests.length, 0);
});

test('useCMSContent fetches sorted, limited public content and can refetch', async () => {
  backend.state.items.t1 = PUBLIC_ITEMS;
  const r = await mountHook(() =>
    hooks.useCMSContent({ contentTypeId: 't1', sortBy: 'title', sortOrder: 'desc', limit: 1 }));
  assert.deepEqual(r.current.contentItems.map((i) => i.id), ['b']);
  assert.equal(r.current.error, null);
  assert.equal(r.current.isFetching, false);

  backend.state.items.t1 = [{ id: 'z', title: 'Zeta', slug: 'z', createdAt: '2026-02-01' }];
  await act(async () => r.current.refetch());
  await dom.settle();
  assert.deepEqual(r.current.contentItems.map((i) => i.id), ['z']);
});

test('useCMSContent respects enabled=false', async () => {
  const r = await mountHook(() => hooks.useCMSContent({ contentTypeId: 't1', enabled: false }));
  assert.deepEqual(r.current.contentItems, []);
  assert.equal(backend.requests.length, 0);
});

test('useCMSContent reports fetch errors', async () => {
  backend.failures.set('GET /api/v1/content-types/t1/items', 500);
  const r = await mountHook(() => hooks.useCMSContent({ contentTypeId: 't1' }));
  assert.ok(r.current.error);
  assert.deepEqual(r.current.contentItems, []);
});

test('useCMSContentItem resolves a single item by slug, and is idle without a slug', async () => {
  backend.state.items.t1 = PUBLIC_ITEMS;
  const found = await mountHook(() => hooks.useCMSContentItem('t1', 'beta'));
  assert.equal(found.current.contentItem?.id, 'b');
  await act(async () => found.current.refetch());
  await dom.settle();
  assert.equal(found.current.contentItem?.id, 'b');

  backend.clear();
  const idle = await mountHook(() => hooks.useCMSContentItem('t1', ''));
  assert.equal(idle.current.contentItem, undefined);
  assert.equal(backend.requests.length, 0);

  const missing = await mountHook(() => hooks.useCMSContentItem('t1', 'nope'));
  assert.ok(missing.current.error);
});

test('useCMSContentTypes loads the content type list', async () => {
  const r = await mountHook(() => hooks.useCMSContentTypes());
  assert.deepEqual(r.current.data?.map((t) => t.id), ['t1', 't2']);
});

function makeCmsFieldValue(
  fieldName: string | undefined,
  value: string | undefined,
  id = 'fv',
): ContentFieldValue {
  return {
    id,
    contentItemId: '1',
    fieldId: 'f-' + id,
    value,
    field: fieldName === undefined ? undefined : {
      id: 'f-' + id,
      contentTypeId: 't1',
      name: fieldName,
      type: 'text',
      required: false,
    },
  };
}

function makeCmsItem(
  overrides: Partial<ContentItem> & Record<string, unknown>,
): ContentItem & Record<string, unknown> {
  const now = new Date('2026-01-01T00:00:00Z');
  return {
    id: '1',
    contentTypeId: 't1',
    title: 'T',
    slug: 't',
    published: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

test('getFieldValue prefers direct properties, then fieldValues by field name', () => {
  const it = makeCmsItem({
    count: 0,
    nothing: null,
    fieldValues: [
      makeCmsFieldValue('Body', 'hello', 'v1'),
      makeCmsFieldValue('Empty', undefined, 'v2'),
    ],
  });
  assert.equal(hooks.getFieldValue(it, 'title'), 'T');
  assert.equal(hooks.getFieldValue(it, 'count'), '0');
  assert.equal(hooks.getFieldValue(it, 'nothing'), undefined);
  assert.equal(hooks.getFieldValue(it, 'Body'), 'hello');
  assert.equal(hooks.getFieldValue(it, 'Empty'), undefined);
  assert.equal(hooks.getFieldValue(it, 'Missing'), undefined);
  assert.equal(hooks.getFieldValue(makeCmsItem({ id: '2' }), 'Body'), undefined);
});

test('getFieldValues flattens fieldValues into the item and skips unnamed fields', () => {
  const unnamedFieldValue: ContentFieldValue = {
    id: 'v-unnamed',
    contentItemId: '1',
    fieldId: 'f-unnamed',
    value: 'ignored',
    field: { id: 'f-unnamed', contentTypeId: 't1', name: '', type: 'text', required: false },
  };
  const orphanFieldValue: ContentFieldValue = {
    id: 'v-orphan',
    contentItemId: '1',
    fieldId: 'f-orphan',
    value: 'orphan',
  };
  const it: ContentItem = {
    id: '1',
    contentTypeId: 't1',
    title: 'T',
    slug: 't',
    published: false,
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-01-01T00:00:00Z'),
    fieldValues: [
      makeCmsFieldValue('Body', 'hello', 'v1'),
      unnamedFieldValue,
      orphanFieldValue,
    ],
  };
  const flattened = hooks.getFieldValues(it);
  assert.equal(flattened.id, '1');
  assert.equal(flattened.title, 'T');
  assert.equal(flattened.Body, 'hello');
  assert.equal('' in flattened, false);
  assert.equal('orphan' in flattened, false);
  const minimalItem = makeCmsItem({ id: '2', title: '', slug: '' });
  assert.equal(hooks.getFieldValues(minimalItem).id, '2');
});
