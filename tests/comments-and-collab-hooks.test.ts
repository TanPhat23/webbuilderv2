import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { redirectModules } from './support/test-stub-modules';
import {
  act,
  cleanup,
  flush,
  React,
  render,
} from './support/sidebar-dom-harness';
import type { FrameElement, TextElement } from '@webbuilder/site-runtime/types/elements/elements';
import type {
  CollaborationContextValue,
  WSCollaborationConfig,
} from '../apps/editor/src/features/collaboration/interfaces/websocket';
import type { ElementComment } from '../apps/editor/src/features/comments/interfaces/elementcomment.interface';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { authState, userState } = await import('./support/test-clerk-stub');
const { routerState } = await import('./support/editor-router-stub');
const { useElementComments, useProjectComments, elementCommentKeys } = await import('../apps/editor/src/features/comments/hooks/useElementComments');
const { useCollabRoom } = await import('../apps/editor/src/providers/collaboration/useCollabRoom');
const { useComponentActions } = await import('../apps/editor/src/features/editor/hooks/useComponentActions');
const { useInteractionEvents } = await import('@webbuilder/site-runtime/interactions/hooks/useInteractionEvents');
const { extractFormValues } = await import('@webbuilder/site-runtime/interactions/runtime/hostDom');
const { createVariableStore } = await import('@webbuilder/site-runtime/interactions/runtime/variables');
const { CollaborationContext } = await import('../apps/editor/src/features/collaboration/context/CollaborationContext');
const { EditorContext } = await import('../apps/editor/src/features/editor/context/EditorContext');
const { editorValue } = await import('./support/sidebar-fixtures');
const { useElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { projectKeys } = await import('../apps/editor/src/features/projects/hooks/useProjects');
const { collaboratorKeys } = await import('../apps/editor/src/features/collaboration/hooks/useCollaborators');
const { CollaboratorRole } = await import('../apps/editor/src/features/collaboration/interfaces/collaboration.interface');

const h = React.createElement;
const realFetch = globalThis.fetch;
const realWs = globalThis.WebSocket;
const realError = console.error;
const realWarn = console.warn;

class FakeWebSocket {
  static OPEN = 1;
  static instances: FakeWebSocket[] = [];
  readyState = 0;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onclose: ((e: { code: number }) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  constructor(readonly url: string) {
    FakeWebSocket.instances.push(this);
  }
  send(data: string) {
    this.sent.push(data);
  }
  close() {
    this.readyState = 3;
  }
  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }
  receive(data: unknown) {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

function makeText(id: string): TextElement {
  return {
    id,
    type: 'Text',
    content: 'Copy',
    pageId: 'page-1',
    styles: {},
    tailwindStyles: '',
  };
}

function makeFrame(id: string): FrameElement {
  return {
    id,
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    styles: {},
    tailwindStyles: '',
    elements: [],
  };
}

beforeEach(() => {
  FakeWebSocket.instances = [];
  routerState.params = { id: 'proj-1' };
  routerState.search = {};
  authState.userId = 'user-1';
  authState.isLoaded = true;
  userState.user = { id: 'user-1' };
  console.error = () => {};
  console.warn = () => {};
  globalThis.WebSocket = FakeWebSocket as unknown as typeof WebSocket;
  useElementStore.getState().beginPage('proj-1', 'page-1', false);
  useElementStore.getState().setElements([], true);
});

afterEach(async () => {
  await cleanup();
  globalThis.fetch = realFetch;
  globalThis.WebSocket = realWs;
  console.error = realError;
  console.warn = realWarn;
});

after(cleanup);

test('useElementComments and useProjectComments manage comments, counts, and mutations', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  const calls: Array<{ method: string; path: string }> = [];
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://localhost:3000',
    );
    if (url.pathname === '/api/gettoken') return Response.json({ tokenJWT: 'tok-1' });
    const method = init?.method ?? 'GET';
    calls.push({ method, path: url.pathname });
    if (url.pathname.endsWith('/toggle-resolved') || method === 'PUT' || method === 'PATCH') {
      return Response.json({ id: 'c1', elementId: 'el-1', authorId: 'user-1', content: 'Updated', resolved: true });
    }
    if (method === 'POST') {
      return Response.json({ id: 'c-new', elementId: 'el-1', authorId: 'user-1', content: 'Hello', resolved: false });
    }
    if (method === 'DELETE') return Response.json({ ok: true });
    return Response.json({ data: [] });
  }) as typeof fetch;

  try {
    client.setQueryData(projectKeys.detail('proj-1'), { id: 'proj-1', name: 'Site' });
    const seedComments: ElementComment[] = [
      {
        id: 'c1',
        elementId: 'el-1',
        authorId: 'user-1',
        projectId: 'proj-1',
        content: 'First',
        resolved: false,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
      {
        id: 'c2',
        elementId: 'el-1',
        authorId: 'user-2',
        projectId: 'proj-1',
        content: 'Second',
        resolved: true,
        createdAt: '2026-01-01',
        updatedAt: '2026-01-01',
      },
    ];
    client.setQueryData(elementCommentKeys.list('el-1'), { data: seedComments });
    client.setQueryData(elementCommentKeys.projectList('proj-1'), { data: seedComments });

    const elApiRef: { current: ReturnType<typeof useElementComments> | undefined } = { current: undefined };
    const projApiRef: { current: ReturnType<typeof useProjectComments> | undefined } = { current: undefined };

    function Probe() {
      elApiRef.current = useElementComments({ elementId: 'el-1', autoLoad: false });
      projApiRef.current = useProjectComments('proj-1');
      return null;
    }

    await render(h(QueryClientProvider, { client }, h(Probe)));
    assert.equal(elApiRef.current?.comments.length, 2);
    assert.equal(elApiRef.current?.unresolvedCount, 1);
    assert.equal(elApiRef.current?.canEditComment(seedComments[0]), true);
    assert.equal(elApiRef.current?.canDeleteComment(seedComments[1]), false);
    assert.equal(projApiRef.current?.totalComments, 2);
    assert.deepEqual(projApiRef.current?.elementIds, ['el-1']);

    await act(async () => {
      const created = await elApiRef.current?.createComment('Hello');
      assert.equal(created?.id, 'c-new');
      const updated = await elApiRef.current?.updateComment('c1', 'Updated');
      assert.equal(updated?.id, 'c1');
      const toggled = await elApiRef.current?.toggleResolved('c1');
      assert.equal(toggled?.id, 'c1');
      const deleted = await elApiRef.current?.deleteComment('c2');
      assert.equal(deleted, true);
      const invalid = await elApiRef.current?.createComment('   ');
      assert.equal(invalid, null);
    });

    assert.equal(calls.some((c) => c.method === 'POST'), true);
    assert.equal(calls.some((c) => c.method === 'DELETE'), true);
  } finally {
    await cleanup();
    client.clear();
  }
});

test('useCollabRoom initializes provider lifecycle, status updates, and cleanup', async () => {
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.endsWith('/ws-ticket')) {
      return Response.json({ ticket: 'ticket-1', expiresIn: 30 }, { status: 201 });
    }
    return Response.json([]);
  }) as typeof fetch;
  const roomApiRef: { current: ReturnType<typeof useCollabRoom> | undefined } = { current: undefined };
  let syncCount = 0;

  function RoomProbe({ enabled }: { enabled: boolean }) {
    const config: WSCollaborationConfig = {
      projectId: 'proj-1',
      pageId: 'page-1',
      onSync: () => { syncCount += 1; },
    };
    roomApiRef.current = useCollabRoom({
      config,
      wsUrl: 'ws://localhost:1234',
      enabled,
      userId: 'user-1',
      getToken: async () => 'tok-1',
      isLoaded: true,
    });
    return null;
  }

  try {
    const r = await render(h(RoomProbe, { enabled: false }));
    assert.equal(roomApiRef.current?.providerRef.current, null);

    await r.rerender(h(RoomProbe, { enabled: true }));
    await flush(10);
    assert.ok(roomApiRef.current?.providerRef.current);

    const sock = FakeWebSocket.instances.at(-1);
    assert.ok(sock);
    await act(async () => {
      sock.open();
      sock.receive({ type: 'sync:page', payload: { seq: 0, elements: [], users: [] } });
    });
    await flush(10);
    assert.equal(roomApiRef.current?.state.roomState, 'connected');
    assert.equal(roomApiRef.current?.state.isSynced, true);
    assert.equal(syncCount, 1);

    await act(async () => {
      useElementStore.getState().setElements([makeFrame('f1')], false);
    });

    await r.unmount();
    assert.equal(roomApiRef.current?.providerRef.current, null);
  } finally {
    await cleanup();
  }
});

test('useComponentActions validates permissions and inputs before creating a component', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://localhost:3000',
    );
    if (url.pathname === '/api/gettoken') return Response.json({ tokenJWT: 'tok-1' });
    return Response.json({
      id: 'cp-new',
      name: 'Empty Card',
      type: 'cp',
      projectId: 'proj-1',
      styles: {},
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
  }) as typeof fetch;

  try {
    client.setQueryData(collaboratorKeys.byProject('proj-1'), [
      { userId: 'user-1', role: CollaboratorRole.OWNER },
    ]);
    client.setQueryData(projectKeys.pages('proj-1'), [
      { Id: 'page-1', Name: 'Home', Type: 'sp', ProjectId: 'proj-1', DeletedAt: null },
    ]);

    const item = makeText('src-el');
    useElementStore.getState().setElements([item], true);

    const compActionsRef: { current: ReturnType<typeof useComponentActions> | undefined } = { current: undefined };
    const canvasRef: React.RefObject<HTMLElement | null> = { current: null };
    const collab: CollaborationContextValue = {
      isConnected: true,
      roomState: 'connected',
      error: null,
      isSynced: true,
      pendingUpdates: 0,
      collabType: 'websocket',
      canvasRef,
      updateElement: async () => {},
      createElement: async () => {},
      deleteElement: async () => {},
      moveElement: async () => {},
      reconnect: async () => {},
    };

    function CompHost() {
      compActionsRef.current = useComponentActions();
      return null;
    }

    await render(
      h(
        QueryClientProvider,
        { client },
        h(
          EditorContext.Provider,
          { value: { ...editorValue(), projectId: 'proj-1', pageId: 'page-1' } },
          h(CollaborationContext.Provider, { value: collab }, h(CompHost)),
        ),
      ),
    );

    assert.equal(compActionsRef.current?.canCreate, true);
    assert.equal(compActionsRef.current?.canReplace, true);

    await assert.rejects(() => compActionsRef.current!.createComponent('   '), /1 to 255/);
    await assert.rejects(() => compActionsRef.current!.createComponent('Card', { fromElementId: 'missing' }), /Select an element/);

    const created = await compActionsRef.current!.createComponent('Empty Card');
    assert.equal(created.id, 'cp-new');
    assert.equal(created.name, 'Empty Card');
  } finally {
    await cleanup();
    client.clear();
  }
});

test('useInteractionEvents wires native, hover, image error, and mutation handlers on the host root', async () => {
  const vars = createVariableStore(
    {
      clicks: { type: 'string', default: '0' },
      broken: { type: 'string', default: '0' },
    },
    { namespace: 'test-ns' },
  );
  function Host() {
    const rootRef = React.useRef<HTMLDivElement | null>(null);
    const idsRef = React.useRef(new Set(['btn-1', 'img-1']));
    const firedRef = React.useRef(new Map<string, Set<string>>());
    const imageErrorsRef = React.useRef(new WeakMap());
    const index = React.useMemo(
      () =>
        new Map([
          ['btn-1', { ix1: { on: 'click', do: [{ set: 'clicks', to: '1' }] } }],
          ['img-1', { ix2: { on: 'error', do: [{ set: 'broken', to: '1' }] } }],
        ]) as unknown as Parameters<typeof useInteractionEvents>[0]['index'],
      [],
    );
    const platformFactory = React.useCallback(
      () => ({
        byId: (id: string) => rootRef.current?.querySelector(`[data-element-id="${id}"]`) ?? null,
        toast: () => {},
        navigate: () => {},
        openUrl: () => {},
        scrollTo: () => {},
      }),
      [],
    );

    useInteractionEvents({
      rootRef,
      enabled: true,
      platform: platformFactory as never,
      flows: {},
      vars,
      index,
      idsRef,
      fired: firedRef.current,
      imageErrors: imageErrorsRef.current,
    });

    return h(
      'div',
      { ref: rootRef },
      h('form', { name: 'signup' },
        h('input', { name: 'email', defaultValue: 'a@b.com' }),
        h('button', { type: 'button', 'data-element-id': 'btn-1' }, 'Go'),
      ),
      h('img', { 'data-element-id': 'img-1', src: '/missing.png', alt: '' }),
    );
  }

  try {
    const r = await render(h(Host));
    const formInput = r.container.querySelector('input[name="email"]')!;
    const formValues = extractFormValues(formInput, r.container.ownerDocument);
    assert.deepEqual({ ...formValues }, { email: 'a@b.com' });

    const btn = r.container.querySelector('[data-element-id="btn-1"]')!;
    const img = r.container.querySelector('[data-element-id="img-1"]')!;
    await act(async () => {
      btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
      btn.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true, cancelable: true }));
      img.dispatchEvent(new window.Event('error', { bubbles: false }));
      img.setAttribute('src', '/missing-2.png');
    });
    await flush(10);
    assert.equal(vars.get('clicks'), '1');
    assert.equal(vars.get('broken'), '1');
  } finally {
    await cleanup();
  }
});
