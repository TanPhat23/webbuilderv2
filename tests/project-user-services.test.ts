import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';

redirectModules({
  '@tanstack/react-start': './test-start-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
});

const { serverAuth } = await import('./support/test-clerk-server-stub');
const { projectService, toPage } = await import('../src/features/projects/services/project.service');
const projectApi = await import('../src/features/projects/api/project.api');
const { userService } = await import('../src/features/users/services/user.service');
const { getAuthToken } = await import('../src/features/auth/lib/gettoken');
const { default: getToken } = await import('../src/services/token');

interface Recorded {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body: unknown;
}

const realFetch = globalThis.fetch;
const realLog = console.log;
const realWarn = console.warn;
const realError = console.error;
let requests: Recorded[] = [];
let respond: (req: Recorded) => Response = () => Response.json({});

beforeEach(() => {
  requests = [];
  respond = () => Response.json({});
  serverAuth.userId = 'user-1';
  serverAuth.token = 'tok-1';
  console.log = () => {};
  console.warn = () => {};
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
  console.log = realLog;
  console.warn = realWarn;
  console.error = realError;
});

test('toPage maps the camelCase API page onto the app Page shape', () => {
  const page = toPage({
    id: 'pg',
    projectId: 'pr',
    name: 'Home',
    type: 'sp',
    createdAt: '2026-01-02T03:04:05.000Z',
    updatedAt: '2026-02-03T00:00:00.000Z',
  });
  assert.deepEqual(
    { Id: page.Id, Name: page.Name, Type: page.Type, ProjectId: page.ProjectId, Styles: page.Styles, DeletedAt: page.DeletedAt },
    { Id: 'pg', Name: 'Home', Type: 'sp', ProjectId: 'pr', Styles: null, DeletedAt: null },
  );
  assert.equal(page.CreatedAt.toISOString(), '2026-01-02T03:04:05.000Z');
  assert.equal(page.UpdatedAt.toISOString(), '2026-02-03T00:00:00.000Z');

  const deleted = toPage({
    id: 'a', projectId: 'b', name: 'c', type: 'cp', styles: { color: 'red' } as never,
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', deletedAt: '2026-03-01T00:00:00Z',
  });
  assert.deepEqual(deleted.Styles, { color: 'red' });
  assert.equal(deleted.DeletedAt?.toISOString(), '2026-03-01T00:00:00.000Z');
});

test('authenticated project reads send the bearer token and hit the right route', async () => {
  respond = () => Response.json([{ id: 'x' }]);
  await projectService.getUserProjects('T');
  await projectService.getProjectById('p1', 'T');
  await projectService.getProjectAccess('p1', 'T');
  await projectService.getProjectPagesWithLogic('p1', 'T');
  assert.deepEqual(
    requests.map((r) => [r.method, r.url.pathname]),
    [
      ['GET', '/api/v1/projects/user'],
      ['GET', '/api/v1/projects/p1'],
      ['GET', '/api/v1/projects/p1/access'],
      ['GET', '/api/v1/projects/p1/pages'],
    ],
  );
  for (const r of requests) assert.equal(r.headers.Authorization, 'Bearer T');
});

test('getProjectPages converts API pages to Page objects', async () => {
  respond = () =>
    Response.json([
      { id: 'pg', projectId: 'p1', name: 'Home', type: 'sp', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' },
    ]);
  const pages = await projectService.getProjectPages('p1', 'T');
  assert.equal(pages[0].Id, 'pg');
  assert.ok(pages[0].CreatedAt instanceof Date);
});

test('public reads are sent without an Authorization header', async () => {
  respond = () => Response.json({ id: 'p1' });
  await projectService.getProjectPublic('p1');
  await projectService.getProjects();
  assert.deepEqual(
    requests.map((r) => r.url.pathname),
    ['/api/v1/projects/public/p1', '/api/v1/projects/public'],
  );
  for (const r of requests) assert.equal(r.headers.Authorization, undefined);
});

test('getPagesPublic adds the preview cache flag only when asked', async () => {
  respond = () => Response.json([]);
  await projectService.getPagesPublic('p1');
  await projectService.getPagesPublic('p1', { previewCache: true });
  assert.equal(requests[0].url.pathname, '/api/v1/pages/public/p1');
  assert.equal(requests[0].url.search, '');
  assert.equal(requests[1].url.searchParams.get('previewCache'), '1');
});

test('getFonts returns a fresh copy of the bundled font list', async () => {
  const fonts = await projectService.getFonts();
  assert.deepEqual(fonts, ['Inter', 'Lora', 'JetBrains Mono']);
  fonts.push('x');
  assert.equal((await projectService.getFonts()).length, 3);
});

test('project writes use the expected verbs, routes and bodies', async () => {
  respond = () => Response.json({ id: 'p1' });
  const project = { id: 'p1', name: 'Site' } as never;
  await projectService.createProject(project, 'T');
  await projectService.updateProject(project, 'T');
  await projectService.updateProjectPartial('p1', { name: 'New' } as never, 'T');
  assert.equal(await projectService.deleteProject('p1', 'T'), true);
  await projectService.createPage('p1', { name: 'About', type: 'sp' }, 'T');
  await projectService.renamePage('p1', 'pg', 'Renamed', 'T');
  assert.equal(await projectService.deleteProjectPage('p1', 'pg', 'T'), true);

  assert.deepEqual(
    requests.map((r) => [r.method, r.url.pathname]),
    [
      ['POST', '/api/v1/projects'],
      ['PUT', '/api/v1/projects/p1'],
      ['PATCH', '/api/v1/projects/p1'],
      ['DELETE', '/api/v1/projects/p1'],
      ['POST', '/api/v1/pages/p1'],
      ['PATCH', '/api/v1/pages/p1/pg'],
      ['DELETE', '/api/v1/pages/p1/pg'],
    ],
  );
  assert.deepEqual(requests[0].body, { id: 'p1', name: 'Site' });
  assert.deepEqual(requests[2].body, { name: 'New' });
  assert.deepEqual(requests[4].body, { name: 'About', type: 'sp' });
  assert.deepEqual(requests[5].body, { name: 'Renamed' });
});

test('createProjectWithPage turns blank descriptions into null', async () => {
  respond = () => Response.json({ id: 'p1' });
  await projectService.createProjectWithPage({ name: 'A', description: '   ' }, 'T');
  await projectService.createProjectWithPage({ name: 'B', description: undefined }, 'T');
  await projectService.createProjectWithPage({ name: 'C', description: 'About me' }, 'T');
  assert.deepEqual(requests.map((r) => (r.body as { description: unknown }).description), [null, null, 'About me']);
});

test('a failing API response surfaces as a thrown error', async () => {
  respond = () => new Response('nope', { status: 500 });
  await assert.rejects(projectService.getProjectById('p1', 'T'));
  respond = () => new Response(null, { status: 404 });
  await assert.rejects(projectService.getProjectAccess('p1', 'T'));
});

test('server functions fetch the Clerk token and delegate to the service', async () => {
  respond = (r) =>
    r.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json({ id: 'p1', name: 'N' });
  await projectApi.getUserProjects();
  await projectApi.getProjectById({ data: { projectId: 'p1' } });
  const created = await projectApi.createProject({ data: { name: 'N', description: 'd' } } as never);
  assert.equal(created.views, 0, 'missing view count defaults to 0');
  await projectApi.updateProject({ data: { projectId: 'p1', updates: { name: 'M' } } } as never);
  assert.deepEqual(await projectApi.deleteProject({ data: { projectId: 'p1' } }), { success: true });
  respond = () => Response.json([]);
  assert.deepEqual(await projectApi.getProjectPages({ data: { projectId: 'p1' } }), []);

  for (const r of requests) assert.equal(r.headers.Authorization, 'Bearer tok-1');
  const createBody = requests.find((r) => r.method === 'POST')?.body as { id: string; name: string };
  assert.equal(createBody.name, 'N');
  assert.match(createBody.id, /^[0-9a-f-]{36}$/, 'a client id is generated when none is supplied');
});

test('server functions validate their input before calling the API', async () => {
  await assert.rejects(projectApi.getProjectById({ data: {} } as never));
  await assert.rejects(projectApi.deleteProject({ data: { projectId: 5 } } as never));
  assert.equal(requests.length, 0);
});

test('getAuthToken rejects unauthenticated sessions and missing tokens', async () => {
  assert.deepEqual(await getAuthToken(), { userId: 'user-1', token: 'tok-1' });
  serverAuth.userId = null;
  await assert.rejects(getAuthToken(), /User not authenticated/);
  serverAuth.userId = 'user-1';
  serverAuth.token = null;
  await assert.rejects(getAuthToken(), /Failed to retrieve auth token/);
});

test('server functions propagate auth failures without calling the API', async () => {
  serverAuth.userId = null;
  await assert.rejects(projectApi.getUserProjects(), /not authenticated/);
  assert.equal(requests.length, 0);
});

test('getToken reads the JWT from the token endpoint and throws on failure', async () => {
  respond = () => Response.json({ tokenJWT: 'jwt-123' });
  assert.equal(await getToken(), 'jwt-123');
  assert.equal(requests[0].url.pathname, '/api/gettoken');

  respond = () => new Response('', { status: 401 });
  await assert.rejects(getToken(), /Failed to get authentication token/);
});

/** Answer the token handshake the user service performs, then delegate to `fn`. */
function respondApi(fn: (req: Recorded) => Response): void {
  respond = (req) =>
    req.url.pathname === '/api/gettoken' ? Response.json({ tokenJWT: 'jwt-user' }) : fn(req);
}
const apiRequests = () => requests.filter((r) => r.url.pathname !== '/api/gettoken');

test('searchUsers encodes the query, paging and tolerates bad responses', async () => {
  respondApi(() => Response.json([{ id: 'u', email: 'a@b.c' }]));
  const users = await userService.searchUsers('ann marie', 5, 10);
  assert.equal(users.length, 1);
  const first = apiRequests()[0];
  assert.equal(first.url.pathname, '/api/v1/users/search');
  assert.equal(first.url.searchParams.get('q'), 'ann marie');
  assert.equal(first.url.searchParams.get('limit'), '5');
  assert.equal(first.url.searchParams.get('offset'), '10');
  assert.equal(first.headers.Authorization, 'Bearer jwt-user');

  await userService.searchUsers('x');
  const second = apiRequests()[1];
  assert.equal(second.url.searchParams.get('limit'), '20');
  assert.equal(second.url.searchParams.get('offset'), '0');

  respondApi(() => Response.json({ not: 'an array' }));
  assert.deepEqual(await userService.searchUsers('x'), []);

  respondApi(() => new Response('boom', { status: 500 }));
  assert.deepEqual(await userService.searchUsers('x'), []);
});

test('user lookups by email and username use their dedicated routes', async () => {
  respondApi(() => Response.json({ id: 'u', email: 'e@x.io' }));
  await userService.getUserByEmail('e@x.io');
  await userService.getUserByUsername('ann');
  assert.deepEqual(
    apiRequests().map((r) => r.url.pathname),
    ['/api/v1/users/email/e@x.io', '/api/v1/users/username/ann'],
  );
});
