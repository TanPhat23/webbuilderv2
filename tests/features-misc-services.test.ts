import { afterEach, beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';

redirectModules({
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-start/server': './test-features-misc-start-server-stub.ts',
  '@clerk/tanstack-react-start/server': './test-features-misc-clerk-server-stub.ts',
});

const { installFetch, muteConsole } = await import('./support/test-features-misc-harness');
const { serverAuth } = await import('./support/test-features-misc-clerk-server-stub');
const { responseHeaders } = await import('./support/test-features-misc-start-server-stub');
const { agentTokenService } = await import('../src/features/agent/services/agentTokens.service');
const { aiContentService } = await import('../src/features/ai/services/aicontent.service');
const { elementCommentService } = await import('../src/features/comments/services/elementcomment.service');
const { imageService } = await import('../src/features/images/services/image.service');
const { notificationService } = await import('../src/features/notifications/services/notification.service');
const { notificationsServer } = await import('../src/features/notifications/server/notifications.server');
const { subscriptionService } = await import('../src/features/subscription/services/subscription.service');
const { getPreviewData } = await import('../src/features/preview/api/preview.api');
const { createPage, deleteProjectPage, renameComponentPage } = await import('../src/features/projects/api/page.api');
const { sendElementOp } = await import('../src/features/collaboration/lib/realtime/sendElementOp');
const { useAgentActivity } = await import('../src/features/agent/activity');

let net: ReturnType<typeof installFetch>;
let restoreConsole: () => void;

beforeEach(() => {
  net = installFetch();
  restoreConsole = muteConsole();
  serverAuth.userId = 'user-1';
  serverAuth.token = 'tok-1';
});
afterEach(() => {
  net.restore();
  restoreConsole();
});

const last = () => net.api().at(-1)!;

test('agent token service lists, creates and revokes with the supplied bearer token', async () => {
  net.respond = (r) => (r.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json([{ id: 't1' }]));
  assert.deepEqual(await agentTokenService.list('T'), [{ id: 't1' }]);
  await agentTokenService.create('my cli', 'T');
  assert.equal(await agentTokenService.revoke('t1', 'T'), true);
  const calls = net.api();
  assert.deepEqual(calls.map((c) => c.method), ['GET', 'POST', 'DELETE']);
  assert.deepEqual(calls[1].body, { name: 'my cli' });
  assert.ok(calls[2].url.pathname.endsWith('/t1'));
  for (const c of calls) assert.equal(c.headers.Authorization, 'Bearer T');
});

test('useAgentActivity.mark records the time and editing flag', () => {
  assert.equal(useAgentActivity.getState().lastAt, null);
  assert.equal(useAgentActivity.getState().editing, false);
  const before = Date.now();
  useAgentActivity.getState().mark(true);
  const state = useAgentActivity.getState();
  assert.equal(state.editing, true);
  assert.ok(state.lastAt !== null && state.lastAt >= before);
  state.mark(false);
  assert.equal(useAgentActivity.getState().editing, false);
});

test('aiContentService.generateContent posts the params and rethrows failures', async () => {
  net.respond = () => Response.json({ content: 'hello' });
  assert.deepEqual(await aiContentService.generateContent({ prompt: 'p', includeImages: true }), { content: 'hello' });
  assert.deepEqual(last().body, { prompt: 'p', includeImages: true });
  assert.equal(last().method, 'POST');

  net.respond = () => new Response('bad', { status: 500 });
  await assert.rejects(aiContentService.generateContent({ prompt: 'p' }));
});

test('aiContentService.generateContentStream emits growing chunks, then completes', async () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  try {
    net.respond = () => Response.json({ content: 'abc' });
    const chunks: string[] = [];
    let complete: string | undefined;
    const done = aiContentService.generateContentStream(
      { prompt: 'p' },
      { onChunk: (c) => chunks.push(c), onComplete: (c) => (complete = c) },
    );
    // Each character waits on a 300ms timer; drive them until the stream finishes.
    let settled = false;
    void done.then(() => (settled = true));
    for (let i = 0; i < 50 && !settled; i++) {
      await new Promise<void>((resolve) => setImmediate(resolve));
      mock.timers.tick(300);
    }
    await done;
    assert.deepEqual(chunks, ['a', 'ab', 'abc']);
    assert.equal(complete, 'abc');
  } finally {
    mock.timers.reset();
  }
});

test('aiContentService.generateContentStream is silent without content and reports errors', async () => {
  net.respond = () => Response.json({});
  let completed = false;
  await aiContentService.generateContentStream({ prompt: 'p' }, { onComplete: () => (completed = true) });
  assert.equal(completed, false);

  net.respond = () => new Response('nope', { status: 500 });
  let reported: Error | undefined;
  await assert.rejects(aiContentService.generateContentStream({ prompt: 'p' }, { onError: (e) => (reported = e) }));
  assert.ok(reported instanceof Error);
  // Without an onError callback the error still propagates.
  await assert.rejects(aiContentService.generateContentStream({ prompt: 'p' }, {}));
});

test('elementCommentService maps each operation to its verb and route', async () => {
  net.respond = () => Response.json({ id: 'c1', data: [] });
  await elementCommentService.createElementComment({ elementId: 'e', content: 'hi', projectId: 'p' });
  await elementCommentService.getElementCommentById('c1');
  await elementCommentService.getElementComments('e1');
  await elementCommentService.getProjectComments('p1');
  await elementCommentService.getCommentsByAuthorId('a1');
  await elementCommentService.updateElementComment('c1', { content: 'x' });
  assert.equal(await elementCommentService.deleteElementComment('c1'), true);
  await elementCommentService.toggleResolvedStatus('c1');

  const calls = net.api();
  assert.deepEqual(calls.map((c) => c.method), ['POST', 'GET', 'GET', 'GET', 'GET', 'PATCH', 'DELETE', 'PATCH']);
  assert.deepEqual(calls[0].body, { elementId: 'e', content: 'hi', projectId: 'p' });
  assert.deepEqual(calls[5].body, { content: 'x' });
  assert.deepEqual(calls[7].body, {});
  assert.ok(calls[2].url.pathname.includes('e1'));
  assert.ok(calls[3].url.pathname.includes('p1'));
  assert.ok(calls[4].url.pathname.includes('a1'));
  assert.ok(calls[1].url.pathname.includes('c1'));
});

test('imageService uploads multipart data with the token and reports failures', async () => {
  net.respond = () => Response.json({ imageId: 'i1' });
  const file = new File(['x'], 'a.png', { type: 'image/png' });
  assert.deepEqual(await imageService.uploadImage(file, 'logo'), { imageId: 'i1' });
  const upload = last();
  assert.equal(upload.method, 'POST');
  assert.equal(upload.headers.Authorization, 'Bearer jwt-test');
  const form = upload.rawBody as FormData;
  assert.equal(form.get('imageName'), 'logo');
  assert.equal((form.get('image') as File).name, 'a.png');

  await imageService.uploadImage(file);
  assert.equal((last().rawBody as FormData).has('imageName'), false);

  net.respond = () => new Response('', { status: 413 });
  await assert.rejects(imageService.uploadImage(file), /Failed to upload image: 413/);
});

test('imageService lists and deletes images through the api client', async () => {
  net.respond = (r) => (r.method === 'DELETE' ? new Response(null, { status: 204 }) : Response.json([{ imageId: 'i' }]));
  assert.deepEqual(await imageService.getUserImages(), [{ imageId: 'i' }]);
  assert.equal(await imageService.deleteImage('i9'), true);
  const calls = net.api();
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[1].method, 'DELETE');
  assert.ok(calls[1].url.pathname.endsWith('i9'));
});

test('notificationService adds filter and search query params and surfaces errors', async () => {
  net.respond = () => Response.json({ notifications: [] });
  await notificationService.getNotifications();
  assert.equal(last().url.search, '');
  await notificationService.getNotifications({ filter: 'unread', search: 'hello' });
  assert.equal(last().url.searchParams.get('filter'), 'unread');
  assert.equal(last().url.searchParams.get('search'), 'hello');
  assert.equal(last().url.pathname, '/api/notifications');

  await notificationService.updateNotification({ notificationId: 'n1', read: true });
  assert.equal(last().method, 'PATCH');
  assert.deepEqual(last().body, { notificationId: 'n1', read: true });

  net.respond = () => new Response('', { status: 500 });
  await assert.rejects(notificationService.getNotifications(), /Failed to fetch notifications/);
  await assert.rejects(notificationService.updateNotification({ notificationId: 'n', read: false }), /Failed to update notification/);
});

const apiNotification = {
  id: 'n1', userId: 'u1', type: 'alert', title: 'T', description: 'D', read: false,
  createdAt: '2026-01-01', updatedAt: '2026-01-02',
};

test('notificationsServer maps API notifications to the app shape and sends the token', async () => {
  net.respond = (r) =>
    r.method === 'GET'
      ? Response.json({ notifications: [apiNotification], stats: { total: 1 }, filterCounts: {} })
      : r.method === 'PATCH' ? Response.json(apiNotification) : new Response(null, { status: 204 });
  const list = await notificationsServer.list('T', 'unread', '');
  assert.deepEqual(list.notifications[0], {
    Id: 'n1', UserId: 'u1', Type: 'alert', Title: 'T', Description: 'D', Read: false,
    CreatedAt: '2026-01-01', UpdatedAt: '2026-01-02',
  });
  assert.equal(last().url.searchParams.get('filter'), 'unread');
  assert.equal(last().url.searchParams.has('search'), false);
  assert.equal(last().headers.Authorization, 'Bearer T');

  await notificationsServer.list('T', 'all', 'q');
  assert.equal(last().url.searchParams.get('search'), 'q');

  const updated = await notificationsServer.setRead('T', 'n1', true);
  assert.equal(updated.Id, 'n1');
  assert.deepEqual(last().body, { read: true });

  await notificationsServer.markAllRead('T');
  assert.deepEqual(last().body, {});
  await notificationsServer.createProfileUpdate('T', 'changed bio');
  assert.deepEqual(last().body, { description: 'changed bio' });
  await notificationsServer.createProfileUpdate('T');
  assert.deepEqual(last().body, {});
});

test('subscriptionService hits status, list, payment and cancel routes', async () => {
  net.respond = () => Response.json({ ok: true });
  await subscriptionService.getSubscriptionStatus();
  await subscriptionService.getAllSubscriptions();
  await subscriptionService.createPayment({ planId: 'pro' } as never);
  await subscriptionService.cancelSubscription({ subscriptionId: 's1' });
  const calls = net.api();
  assert.deepEqual(calls.map((c) => c.method), ['GET', 'GET', 'POST', 'POST']);
  assert.deepEqual(calls[2].body, { planId: 'pro' });
  assert.deepEqual(calls[3].body, { subscriptionId: 's1' });
  assert.equal(new Set(calls.map((c) => c.url.pathname)).size, 4);
});

// ---- preview.api ---------------------------------------------------------

const apiPage = (over: Record<string, unknown>) => ({
  id: 'pg1', projectId: 'p1', name: '', type: 'sp', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', ...over,
});

function previewRoutes(opts: { projectStatus?: number } = {}) {
  net.respond = (r) => {
    const p = r.url.pathname;
    if (p.includes('/pages')) return Response.json([apiPage({})]);
    if (p.includes('/elements')) return Response.json([]);
    if (p.includes('/projects/')) {
      if (opts.projectStatus && !r.headers.Authorization) return new Response('nf', { status: opts.projectStatus });
      return Response.json({ id: 'p1', name: 'Site' });
    }
    return Response.json([]);
  };
}

test('getPreviewData validates ids, disables caching and serves public data to anonymous users', async () => {
  serverAuth.userId = null;
  previewRoutes();
  await assert.rejects(getPreviewData({ data: { id: 'bad id' } } as never));
  await assert.rejects(getPreviewData({ data: { id: 'p1', pageId: 'no/slash' } } as never));
  const result = (await getPreviewData({ data: { id: 'p1' } } as never)) as { project: { id: string }; page: { id: string } };
  assert.equal(responseHeaders['Cache-Control'], 'private, no-store');
  assert.equal(result.project.id, 'p1');
  assert.equal(result.page.id, 'pg1');
  for (const r of net.api()) assert.equal(r.headers.Authorization, undefined);
  assert.ok(net.api().some((r) => r.url.searchParams.get('previewCache') === '1'));
});

test('getPreviewData falls back to the signed-in draft read and maps a missing page to not-found', async () => {
  previewRoutes({ projectStatus: 404 });
  const result = (await getPreviewData({ data: { id: 'p1', pageId: 'pg1' } } as never)) as { page: { id: string } };
  assert.equal(result.page.id, 'pg1');
  assert.ok(net.api().some((r) => r.headers.Authorization === 'Bearer tok-1'));
  assert.ok(net.api().every((r) => r.url.searchParams.get('previewCache') === null || !r.headers.Authorization));

  // 404 for a page that does not exist becomes the router's notFound().
  await assert.rejects(getPreviewData({ data: { id: 'p1', pageId: 'missing' } } as never), (e: unknown) => {
    assert.ok(typeof e === 'object' && e !== null && 'isNotFound' in e);
    return true;
  });

  // Non-404 failures propagate untouched.
  net.respond = () => new Response('boom', { status: 500 });
  await assert.rejects(getPreviewData({ data: { id: 'p1' } } as never), (e: unknown) => !(typeof e === 'object' && e !== null && 'isNotFound' in e));
});

// ---- page.api ------------------------------------------------------------

test('createPage validates input, generates an id and converts the API page', async () => {
  net.respond = () => Response.json(apiPage({ id: 'new', name: 'About' }));
  const page = await createPage({ data: { Name: 'About', ProjectId: 'p1' } } as never);
  assert.equal(page.Id, 'new');
  assert.equal(page.Name, 'About');
  const body = last().body as { id: string; type: string; styles: unknown };
  assert.equal(last().method, 'POST');
  assert.equal(last().headers.Authorization, 'Bearer tok-1');
  assert.match(body.id, /^[0-9a-f-]{36}$/);
  assert.equal(body.type, 'sp');
  assert.deepEqual(body.styles, {});

  await createPage({ data: { Id: 'mine', Name: 'X', ProjectId: 'p1', Type: 'cp', Styles: { a: 1 } } } as never);
  assert.deepEqual(last().body, { id: 'mine', name: 'X', type: 'cp', styles: { a: 1 } });

  await assert.rejects(createPage({ data: { Name: '', ProjectId: 'p1' } } as never));
});

test('deleteProjectPage and renameComponentPage validate path ids and call the API', async () => {
  net.respond = () => new Response(null, { status: 204 });
  await deleteProjectPage({ data: { projectId: 'p1', pageId: 'pg1' } });
  assert.equal(last().method, 'DELETE');
  await assert.rejects(deleteProjectPage({ data: { projectId: 'p/1', pageId: 'pg1' } }));

  net.respond = () => Response.json({});
  await renameComponentPage({ data: { projectId: 'p1', pageId: 'pg1', name: '  Card  ' } });
  assert.equal(last().method, 'PATCH');
  assert.deepEqual(last().body, { name: 'Card' });
  await assert.rejects(renameComponentPage({ data: { projectId: 'p1', pageId: 'pg1', name: '   ' } }));
  await assert.rejects(renameComponentPage({ data: { projectId: 'p1', pageId: 'pg1', name: 'x'.repeat(256) } }));
});

// ---- sendElementOp -------------------------------------------------------

function fakeProvider() {
  const calls: unknown[][] = [];
  const rec = (name: string) => async (...args: unknown[]) => {
    calls.push([name, ...args]);
  };
  return {
    calls,
    provider: {
      updateElement: rec('update'),
      deleteElement: rec('delete'),
      createElement: rec('create'),
      moveElement: rec('move'),
    },
  };
}

test('sendElementOp routes update and delete operations only when their inputs are present', async () => {
  const { calls, provider } = fakeProvider();
  const pending = new Set<string>();
  await sendElementOp(provider as never, () => [], pending, 'update', 'e1', { content: 'x' });
  await sendElementOp(provider as never, () => [], pending, 'update', undefined, { content: 'x' });
  await sendElementOp(provider as never, () => [], pending, 'update', 'e1', undefined);
  await sendElementOp(provider as never, () => [], pending, 'delete', 'e2', undefined);
  await sendElementOp(provider as never, () => [], pending, 'delete', undefined, undefined);
  assert.deepEqual(calls, [['update', 'e1', { content: 'x' }], ['delete', 'e2']]);
});

test('sendElementOp create uses the element location, then the element parent, then null', async () => {
  const { calls, provider } = fakeProvider();
  const pending = new Set<string>();
  const parent = { id: 'root', parentId: null, pageId: 'pg', type: 'Section', content: '', styles: {}, elements: [{ id: 'c1', parentId: 'root', elements: [] }] };
  const created = { id: 'c1', parentId: 'stale' };
  await sendElementOp(provider as never, () => [parent] as never, pending, 'create', 'c1', created);
  const orphan = { id: 'o1', parentId: 'known-parent' };
  await sendElementOp(provider as never, () => [], pending, 'create', 'o1', orphan);
  const rootless = { id: 'r1' };
  await sendElementOp(provider as never, () => [], pending, 'create', 'r1', rootless);
  await sendElementOp(provider as never, () => [], pending, 'create', 'r2', undefined);

  assert.equal(calls.length, 3);
  assert.deepEqual(calls[0].slice(0, 2), ['create', created]);
  assert.equal(calls[0][2], 'root');
  assert.equal(calls[0][3], 0);
  assert.deepEqual(calls[1], ['create', orphan, 'known-parent', undefined]);
  assert.deepEqual(calls[2], ['create', rootless, null, undefined]);
});

test('sendElementOp drops a move while the same element is already moving and always clears the flag', async () => {
  const { calls, provider } = fakeProvider();
  const pending = new Set<string>(['busy']);
  const move = (elementId: string) => ({ elementId, newParentId: 'p', newPosition: 2 });
  await sendElementOp(provider as never, () => [], pending, 'move', undefined, move('busy'));
  assert.equal(calls.length, 0);

  await sendElementOp(provider as never, () => [], pending, 'move', undefined, move('free'));
  assert.deepEqual(calls, [['move', 'free', 'p', 2]]);
  assert.equal(pending.has('free'), false);

  const failing = { ...provider, moveElement: async () => { throw new Error('ws closed'); } };
  await assert.rejects(sendElementOp(failing as never, () => [], pending, 'move', undefined, move('boom')), /ws closed/);
  assert.equal(pending.has('boom'), false);
});
