import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';

redirectModules({
  '@tanstack/react-start': './test-start-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
});

const { serverAuth } = await import('./support/test-clerk-server-stub');
const { cmsService } = await import('../apps/editor/src/features/cms/services/cms.service');
const api = await import('../apps/editor/src/features/cms/api/cms.api');
const schema = await import('../apps/editor/src/features/cms/schema/cms');
const cmsIndex = await import('../apps/editor/src/features/cms');

interface Recorded {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

const realFetch = globalThis.fetch;
const realError = console.error;
let requests: Recorded[] = [];
let respond: (req: Recorded) => Response = () => Response.json({});

beforeEach(() => {
  requests = [];
  respond = () => Response.json({});
  serverAuth.userId = 'user-1';
  serverAuth.token = 'tok-1';
  console.error = () => {};
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const rec: Recorded = {
      url: new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url),
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    };
    requests.push(rec);
    return respond(rec);
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

const route = (r: Recorded) => [r.method, r.url.pathname];

// ------------------------------------------------------------------ schema

test('schemas require non-empty names, titles, slugs and types', () => {
  assert.equal(schema.ContentTypeFormSchema.safeParse({ name: '' }).success, false);
  assert.equal(schema.ContentTypeFormSchema.safeParse({ name: 'Post' }).success, true);
  assert.equal(schema.ContentFieldFormSchema.safeParse({ name: 'a', type: '', required: false }).success, false);
  assert.equal(schema.ContentFieldFormSchema.safeParse({ name: 'a', type: 'text', required: true }).success, true);
  const bad = schema.ContentItemFormSchema.safeParse({ title: '', slug: '', published: false });
  assert.equal(bad.success, false);
  if (!bad.success) assert.deepEqual(bad.error.issues.map((i) => i.message).sort(), ['Slug is required', 'Title is required']);
});

test('the cms barrel re-exports the service and api', () => {
  assert.equal(cmsIndex.cmsService, cmsService);
  assert.equal(cmsIndex.listContentTypes, api.listContentTypes);
  assert.equal(typeof cmsIndex.useCMSWorkspace, 'function');
});

// ----------------------------------------------------------------- service

test('list endpoints accept bare arrays, {data} envelopes and anything else', async () => {
  respond = () => Response.json([{ id: 'a' }]);
  assert.deepEqual(await cmsService.listContentTypes('T'), [{ id: 'a' }]);
  respond = () => Response.json({ data: [{ id: 'b' }] });
  assert.deepEqual(await cmsService.listContentFieldsByContentType('t1', 'T'), [{ id: 'b' }]);
  assert.deepEqual(await cmsService.listContentItemsByContentType('t1', 'T'), [{ id: 'b' }]);
  respond = () => Response.json({ data: 'nope' });
  assert.deepEqual(await cmsService.listContentTypes('T'), []);
  respond = () => Response.json({});
  assert.deepEqual(await cmsService.listContentItemsByContentType('t1', 'T'), []);
  assert.deepEqual(requests.map(route).slice(0, 3), [
    ['GET', '/api/v1/content-types'],
    ['GET', '/api/v1/content-types/t1/fields'],
    ['GET', '/api/v1/content-types/t1/items'],
  ]);
  for (const r of requests) assert.equal(r.headers.Authorization, 'Bearer T');
});

test('content type CRUD uses the expected verbs, routes and bodies', async () => {
  respond = () => Response.json({ id: 't1' });
  await cmsService.createContentType({ name: 'Post' }, 'T');
  await cmsService.getContentTypeById('t1', 'T');
  await cmsService.updateContentType('t1', { name: 'Blog' }, 'T');
  respond = () => new Response(null, { status: 204 });
  await cmsService.deleteContentType('t1', 'T');
  assert.deepEqual(requests.map(route), [
    ['POST', '/api/v1/content-types'],
    ['GET', '/api/v1/content-types/t1'],
    ['PATCH', '/api/v1/content-types/t1'],
    ['DELETE', '/api/v1/content-types/t1'],
  ]);
  assert.deepEqual(requests[0].body, { name: 'Post' });
  assert.deepEqual(requests[2].body, { name: 'Blog' });
});

test('content field CRUD uses the expected verbs, routes and bodies', async () => {
  respond = () => Response.json({ id: 'f1' });
  await cmsService.createContentField('t1', { name: 'Body' }, 'T');
  await cmsService.getContentFieldById('t1', 'f1', 'T');
  await cmsService.updateContentField('t1', 'f1', { required: true }, 'T');
  respond = () => new Response(null, { status: 204 });
  await cmsService.deleteContentField('t1', 'f1', 'T');
  assert.deepEqual(requests.map(route), [
    ['POST', '/api/v1/content-types/t1/fields'],
    ['GET', '/api/v1/content-types/t1/fields/f1'],
    ['PATCH', '/api/v1/content-types/t1/fields/f1'],
    ['DELETE', '/api/v1/content-types/t1/fields/f1'],
  ]);
  assert.deepEqual(requests[2].body, { required: true });
});

test('content item CRUD uses the expected verbs, routes and bodies', async () => {
  respond = () => Response.json({ id: 'i1' });
  const input = { title: 'Hi', fieldValues: [{ fieldId: 'f1', value: 'v' }] };
  await cmsService.createContentItem('t1', input, 'T');
  await cmsService.getContentItemById('t1', 'i1', 'T');
  await cmsService.updateContentItem('t1', 'i1', input, 'T');
  respond = () => new Response(null, { status: 204 });
  await cmsService.deleteContentItem('t1', 'i1', 'T');
  assert.deepEqual(requests.map(route), [
    ['POST', '/api/v1/content-types/t1/items'],
    ['GET', '/api/v1/content-types/t1/items/i1'],
    ['PATCH', '/api/v1/content-types/t1/items/i1'],
    ['DELETE', '/api/v1/content-types/t1/items/i1'],
  ]);
  assert.deepEqual(requests[0].body, input);
  assert.deepEqual(requests[2].body, input);
});

const ITEMS = [
  { id: '1', title: 'banana', slug: 'b', createdAt: '2026-01-02' },
  { id: '2', title: 'apple', slug: 'a', createdAt: '2026-01-03' },
  { id: '3', title: 'cherry', slug: 'c', createdAt: '2026-01-01' },
  { id: '4', slug: 'd', createdAt: null },
  { id: '5', slug: 'e' },
];

test('listPublicContent without a content type returns nothing and does not fetch', async () => {
  assert.deepEqual(await cmsService.listPublicContent(undefined, 'T'), []);
  assert.deepEqual(await cmsService.listPublicContent({}, 'T'), []);
  assert.equal(requests.length, 0);
});

test('listPublicContent sorts newest first by default and sinks missing values', async () => {
  respond = () => Response.json(ITEMS);
  const out = await cmsService.listPublicContent({ contentTypeId: 't1' }, 'T');
  assert.deepEqual(out.map((i) => i.id), ['2', '1', '3', '4', '5']);
  assert.equal(requests[0].url.pathname, '/api/v1/content-types/t1/items');
});

test('listPublicContent honours sortBy, sortOrder and limit', async () => {
  respond = () => Response.json(ITEMS);
  const asc = await cmsService.listPublicContent(
    { contentTypeId: 't1', sortBy: 'title', sortOrder: 'asc' }, 'T',
  );
  assert.deepEqual(asc.map((i) => i.id).slice(0, 3), ['2', '1', '3']);
  const desc = await cmsService.listPublicContent(
    { contentTypeId: 't1', sortBy: 'title', sortOrder: 'desc', limit: 2 }, 'T',
  );
  assert.deepEqual(desc.map((i) => i.id), ['3', '1']);
});

test('listPublicContent leaves the fetched array untouched when sorting', async () => {
  const fetched = ITEMS.map((i) => ({ ...i }));
  respond = () => Response.json(fetched);
  const out = await cmsService.listPublicContent({ contentTypeId: 't1', sortBy: 'title' }, 'T');
  assert.notEqual(out, fetched);
  assert.equal(out.length, ITEMS.length);
});

test('getPublicContentItem finds by slug and throws when missing', async () => {
  respond = () => Response.json({ data: ITEMS });
  const item = await cmsService.getPublicContentItem('t1', 'c', 'T');
  assert.equal(item.id, '3');
  await assert.rejects(() => cmsService.getPublicContentItem('t1', 'zzz', 'T'), /slug "zzz" not found/);
});

// --------------------------------------------------------------------- api

test('read server functions authenticate and forward to the service', async () => {
  respond = () => Response.json([{ id: 'x' }]);
  await api.listContentTypes();
  await api.listContentFieldsByContentType({ data: { contentTypeId: 't1' } });
  await api.listContentItemsByContentType({ data: { contentTypeId: 't1' } });
  respond = () => Response.json({ id: 'x' });
  await api.getContentTypeById({ data: { id: 't1' } });
  await api.getContentFieldById({ data: { contentTypeId: 't1', fieldId: 'f1' } });
  await api.getContentItemById({ data: { contentTypeId: 't1', itemId: 'i1' } });
  assert.deepEqual(requests.map((r) => r.url.pathname), [
    '/api/v1/content-types',
    '/api/v1/content-types/t1/fields',
    '/api/v1/content-types/t1/items',
    '/api/v1/content-types/t1',
    '/api/v1/content-types/t1/fields/f1',
    '/api/v1/content-types/t1/items/i1',
  ]);
  for (const r of requests) assert.equal(r.headers.Authorization, 'Bearer tok-1');
});

test('write server functions validate input, send it and report success for deletes', async () => {
  respond = () => Response.json({ id: 'x' });
  await api.createContentType({ data: { name: 'Post', description: 'd' } });
  await api.updateContentType({ data: { id: 't1', data: { name: 'Blog' } } });
  await api.createContentField({ data: { contentTypeId: 't1', data: { name: 'Body', type: 'text', required: false } } });
  await api.updateContentField({ data: { contentTypeId: 't1', fieldId: 'f1', data: { required: true } } });
  respond = () => new Response(null, { status: 204 });
  assert.deepEqual(await api.deleteContentType({ data: { id: 't1' } }), { success: true });
  assert.deepEqual(await api.deleteContentField({ data: { contentTypeId: 't1', fieldId: 'f1' } }), { success: true });
  assert.deepEqual(await api.deleteContentItem({ data: { contentTypeId: 't1', itemId: 'i1' } }), { success: true });
  assert.deepEqual(requests.map(route), [
    ['POST', '/api/v1/content-types'],
    ['PATCH', '/api/v1/content-types/t1'],
    ['POST', '/api/v1/content-types/t1/fields'],
    ['PATCH', '/api/v1/content-types/t1/fields/f1'],
    ['DELETE', '/api/v1/content-types/t1'],
    ['DELETE', '/api/v1/content-types/t1/fields/f1'],
    ['DELETE', '/api/v1/content-types/t1/items/i1'],
  ]);
  assert.deepEqual(requests[0].body, { name: 'Post', description: 'd' });
  assert.deepEqual(requests[3].body, { required: true });
});

test('item mutations pass field values through and strip unknown keys', async () => {
  respond = () => Response.json({ id: 'i1' });
  await api.createContentItem({
    data: {
      contentTypeId: 't1',
      data: { title: 'Hi', slug: 'hi', published: true, fieldValues: [{ fieldId: 'f1', value: 'v' }] },
    },
  });
  await api.updateContentItem({
    data: { contentTypeId: 't1', itemId: 'i1', data: { title: 'New' } },
  });
  assert.deepEqual(requests[0].body, {
    title: 'Hi', slug: 'hi', published: true, fieldValues: [{ fieldId: 'f1', value: 'v' }],
  });
  assert.deepEqual(requests[1].body, { title: 'New' });
  assert.equal(requests[1].method, 'PATCH');
});

test('server function validators reject malformed input before any request', async () => {
  const bad: Array<() => Promise<unknown>> = [
    () => api.getContentTypeById({ data: { id: '' } }),
    () => api.createContentType({ data: { name: '' } }),
    () => api.getContentFieldById({ data: { contentTypeId: 't', fieldId: '' } }),
    () => api.createContentItem({ data: { contentTypeId: 't', data: { title: '', slug: 's', published: true } } }),
    () => api.getPublicContentItem({ data: { contentTypeId: 't', slug: '' } }),
    () => api.listPublicContent({ data: { limit: -1 } }),
  ];
  for (const call of bad) await assert.rejects(call);
  assert.equal(requests.length, 0);
});

test('public server functions query by content type and slug', async () => {
  respond = () => Response.json(ITEMS);
  const list = await api.listPublicContent({ data: { contentTypeId: 't1', sortBy: 'title', sortOrder: 'asc', limit: 1 } });
  assert.deepEqual(list.map((i) => i.id), ['2']);
  const item = await api.getPublicContentItem({ data: { contentTypeId: 't1', slug: 'e' } });
  assert.equal(item.id, '5');
  assert.deepEqual(await api.listPublicContent({ data: {} }), []);
});

test('server functions fail when the user is not authenticated', async () => {
  serverAuth.userId = null;
  await assert.rejects(() => api.listContentTypes(), /not authenticated/);
  serverAuth.userId = 'user-1';
  serverAuth.token = null;
  await assert.rejects(() => api.deleteContentType({ data: { id: 't1' } }), /auth token/);
  assert.equal(requests.length, 0);
});
