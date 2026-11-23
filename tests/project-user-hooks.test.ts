import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';

redirectModules({
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './test-router-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
});

const { paramsState, searchState } = await import('./support/test-router-stub');
const { disposeClients, makeClient, renderHook, runQuery } = await import('./support/test-hook-harness');
const projects = await import('../src/features/projects/hooks/useProjects');
const users = await import('../src/features/users/hooks/useUsers');

after(disposeClients);

const realFetch = globalThis.fetch;
const realLog = console.log;
const realWarn = console.warn;
const realError = console.error;
let calls: { method: string; path: string; body: unknown }[] = [];
let failNext = false;

beforeEach(() => {
  calls = [];
  failNext = false;
  paramsState.params = {};
  searchState.search = {};
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url);
    if (url.pathname === '/api/gettoken') return Response.json({ tokenJWT: 'jwt' });
    calls.push({
      method: init?.method ?? 'GET',
      path: url.pathname,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
    });
    if (failNext) return new Response('bad', { status: 500 });
    if (url.pathname.endsWith('/pages')) {
      return Response.json([
        { id: 'a', projectId: 'p1', name: 'Home', type: 'sp', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
        { id: 'b', projectId: 'p1', name: 'Card', type: 'cp', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
        { id: 'c', projectId: 'p1', name: 'Gone', type: 'sp', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', deletedAt: '2026-02-01T00:00:00Z' },
      ]);
    }
    if (init?.method === 'DELETE') return new Response(null, { status: 204 });
    return Response.json({ id: 'p1', name: 'Site', views: 3 });
  }) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.log = realLog;
  console.warn = realWarn;
  console.error = realError;
});

test('projectKeys build hierarchical cache keys', () => {
  const k = projects.projectKeys;
  assert.deepEqual(k.all, ['projects']);
  assert.deepEqual(k.lists(), ['projects', 'list']);
  assert.deepEqual(k.list({ a: 1 }), ['projects', 'list', { a: 1 }]);
  assert.deepEqual(k.details(), ['projects', 'detail']);
  assert.deepEqual(k.detail('p'), ['projects', 'detail', 'p']);
  assert.deepEqual(k.userProjects(), ['projects', 'user']);
  assert.deepEqual(k.pages('p'), ['projects', 'detail', 'p', 'pages']);
});

test('useUserProjects and useProject run their queries through the API', async () => {
  const a = renderHook(() => projects.useUserProjects());
  await runQuery(a.client, projects.projectKeys.userProjects());
  const b = renderHook(() => projects.useProject('p1'));
  const project = await runQuery<{ id: string }>(b.client, projects.projectKeys.detail('p1'));
  assert.equal(project.id, 'p1');
  assert.deepEqual(calls.map((c) => c.path), ['/api/v1/projects/user', '/api/v1/projects/p1']);
});

test('useProject stays idle without a project id', () => {
  const { result, client } = renderHook(() => projects.useProject(null));
  assert.equal(result.fetchStatus, 'idle');
  assert.equal(client.getQueryCache().find({ queryKey: projects.projectKeys.detail('') })?.state.data, undefined);
});

test('useCurrentProject reads the project id from the route', async () => {
  paramsState.params = { id: 'p1' };
  const { result, client } = renderHook(() => projects.useCurrentProject());
  assert.equal(result.fetchStatus, 'fetching');
  await runQuery(client, projects.projectKeys.detail('p1'));
  paramsState.params = {};
  assert.equal(renderHook(() => projects.useCurrentProject()).result.fetchStatus, 'idle');
});

test('useProjectPages fetches and converts pages', async () => {
  const { client } = renderHook(() => projects.useProjectPages('p1', 1000));
  const pages = await runQuery<{ Id: string; CreatedAt: Date }[]>(client, projects.projectKeys.pages('p1'));
  assert.deepEqual(pages.map((p) => p.Id), ['a', 'b', 'c']);
  assert.ok(pages[0].CreatedAt instanceof Date);
});

test('useProjectRoutePages hides component pages and deleted pages', async () => {
  const { client } = renderHook(() => projects.useProjectRoutePages('p1'));
  await runQuery(client, projects.projectKeys.pages('p1'));
  const { result } = renderHook(() => projects.useProjectRoutePages('p1'), client);
  assert.deepEqual(result.data?.map((p) => p.Id), ['a']);
});

test('useCurrentPage picks the page named by the ?page search param', async () => {
  paramsState.params = { id: 'p1' };
  searchState.search = { page: 'b' };
  const first = renderHook(() => projects.useCurrentPage());
  assert.equal(first.result, null, 'pages are not loaded yet');
  await runQuery(first.client, projects.projectKeys.pages('p1'));
  assert.equal(renderHook(() => projects.useCurrentPage(), first.client).result?.Id, 'b');
  searchState.search = { page: 'missing' };
  assert.equal(renderHook(() => projects.useCurrentPage(), first.client).result, null);
  searchState.search = {};
  assert.equal(renderHook(() => projects.useCurrentPage(), first.client).result, null);
});

test('useCreateProject posts the project and refreshes the user list', async () => {
  const client = makeClient();
  const invalidated: unknown[] = [];
  client.invalidateQueries = (async (f) => void invalidated.push(f?.queryKey)) as never;
  const { result } = renderHook(() => projects.useCreateProject(), client);
  const created = await result.mutateAsync({ name: 'Site', description: null } as never);
  assert.equal(created.views, 3);
  assert.equal(calls[0].method, 'POST');
  assert.equal((calls[0].body as { name: string }).name, 'Site');
  assert.deepEqual(invalidated, [projects.projectKeys.userProjects()]);
});

test('useUpdateProject caches the returned project and refreshes the list', async () => {
  const client = makeClient();
  const invalidated: unknown[] = [];
  client.invalidateQueries = (async (f) => void invalidated.push(f?.queryKey)) as never;
  const { result } = renderHook(() => projects.useUpdateProject(), client);
  await result.mutateAsync({ projectId: 'p1', updates: { name: 'New' } } as never);
  assert.equal(calls[0].method, 'PATCH');
  assert.equal((client.getQueryData(projects.projectKeys.detail('p1')) as { id: string }).id, 'p1');
  assert.deepEqual(invalidated, [projects.projectKeys.userProjects()]);
});

test('usePublishProject sends the published flag', async () => {
  const client = makeClient();
  const { result } = renderHook(() => projects.usePublishProject(), client);
  await result.mutateAsync({ projectId: 'p1', publish: true });
  await result.mutateAsync({ projectId: 'p1', publish: false });
  assert.deepEqual(calls.map((c) => (c.body as { published: boolean }).published), [true, false]);
});

test('useDeleteProject deletes and refreshes the list', async () => {
  const client = makeClient();
  const invalidated: unknown[] = [];
  client.invalidateQueries = (async (f) => void invalidated.push(f?.queryKey)) as never;
  const { result } = renderHook(() => projects.useDeleteProject(), client);
  await result.mutateAsync('p1');
  assert.deepEqual(calls.map((c) => [c.method, c.path]), [['DELETE', '/api/v1/projects/p1']]);
  assert.equal(invalidated.length, 1);
});

test('project mutations report failures instead of invalidating', async () => {
  failNext = true;
  const client = makeClient();
  const invalidated: unknown[] = [];
  client.invalidateQueries = (async (f) => void invalidated.push(f?.queryKey)) as never;
  const create = renderHook(() => projects.useCreateProject(), client).result;
  const update = renderHook(() => projects.useUpdateProject(), client).result;
  const del = renderHook(() => projects.useDeleteProject(), client).result;
  const publish = renderHook(() => projects.usePublishProject(), client).result;
  await assert.rejects(create.mutateAsync({ name: 'x' } as never));
  await assert.rejects(update.mutateAsync({ projectId: 'p1', updates: {} } as never));
  await assert.rejects(del.mutateAsync('p1'));
  await assert.rejects(publish.mutateAsync({ projectId: 'p1', publish: true }));
  assert.equal(invalidated.length, 0);
});

test('user query keys include their parameters', () => {
  const k = users.userKeys;
  assert.deepEqual(k.all, ['users']);
  assert.deepEqual(k.lists(), ['users', 'list']);
  assert.deepEqual(k.list({ q: 1 }), ['users', 'list', { q: 1 }]);
  assert.deepEqual(k.search('ann', 5, 1), ['users', 'search', 'ann', 5, 1]);
  assert.deepEqual(k.byEmail('e'), ['users', 'email', 'e']);
  assert.deepEqual(k.byUsername('u'), ['users', 'username', 'u']);
});

test('useSearchUsers is disabled for blank queries and searches otherwise', async () => {
  const blank = renderHook(() => users.useSearchUsers('   '));
  assert.equal(blank.result.fetchStatus, 'idle');
  assert.deepEqual(await runQuery(blank.client, users.userKeys.search('   ', 20, 0)), []);
  assert.equal(calls.length, 0);

  const disabled = renderHook(() => users.useSearchUsers('ann', false));
  assert.equal(disabled.result.fetchStatus, 'idle');

  const live = renderHook(() => users.useSearchUsers('ann', true, 5, 2));
  assert.equal(live.result.fetchStatus, 'fetching');
  await runQuery(live.client, users.userKeys.search('ann', 5, 2));
  assert.equal(calls[0].path, '/api/v1/users/search');
});

test('useUserByEmail / useUserByUsername look users up and guard empty input', async () => {
  const byEmail = renderHook(() => users.useUserByEmail('a@b.c'));
  await runQuery(byEmail.client, users.userKeys.byEmail('a@b.c'));
  const byName = renderHook(() => users.useUserByUsername('ann'));
  await runQuery(byName.client, users.userKeys.byUsername('ann'));
  assert.deepEqual(calls.map((c) => c.path), ['/api/v1/users/email/a@b.c', '/api/v1/users/username/ann']);

  const noEmail = renderHook(() => users.useUserByEmail(''));
  assert.equal(noEmail.result.fetchStatus, 'idle');
  await assert.rejects(runQuery(noEmail.client, users.userKeys.byEmail('')), /Email is required/);
  const noName = renderHook(() => users.useUserByUsername(''));
  await assert.rejects(runQuery(noName.client, users.userKeys.byUsername('')), /Username is required/);
});
