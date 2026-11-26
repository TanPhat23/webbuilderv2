import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { redirectModules } from './support/test-stub-modules';
import {
  $$q,
  $q,
  act,
  cleanup,
  click,
  flush,
  React,
  render,
} from './support/sidebar-dom-harness';
import type { FrameElement, TextElement } from '@webbuilder/site-runtime/types/elements/elements';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { authState } = await import('./support/test-clerk-stub');
const { routerState } = await import('./support/editor-router-stub');
const { useCanvasController } = await import('../apps/editor/src/features/editor/components/canvas/useCanvasController');
const { useCanvasViewportStore } = await import('../apps/editor/src/features/editor/store/canvas-viewport-store');
const VersionHistoryPanel = (await import('../apps/editor/src/features/editor/components/sidebar/SnapshotManager')).default;
const { useElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { useSelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { projectKeys } = await import('../apps/editor/src/features/projects/hooks/useProjects');
const { collaboratorKeys } = await import('../apps/editor/src/features/collaboration/hooks/useCollaborators');
const { CollaboratorRole } = await import('../apps/editor/src/features/collaboration/interfaces/collaboration.interface');

const h = React.createElement;
const realFetch = globalThis.fetch;
const realError = console.error;

function makeText(id: string): TextElement {
  return { id, type: 'Text', content: 'Item', pageId: 'page-1', styles: {}, tailwindStyles: '' };
}

function makeFrame(id: string, children: TextElement[] = []): FrameElement {
  return {
    id,
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    styles: {},
    tailwindStyles: '',
    elements: children,
  };
}

beforeEach(() => {
  routerState.params = { id: 'proj-1' };
  authState.userId = 'user-1';
  authState.isLoaded = true;
  console.error = () => {};
  useElementStore.getState().beginPage('proj-1', 'page-1', false);
  useElementStore.getState().setElements([], true);
  useSelectionStore.getState().setSelectedElement(undefined);
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;
});

afterEach(async () => {
  await cleanup();
  globalThis.fetch = realFetch;
  console.error = realError;
});

after(cleanup);

function makeRect(left: number, top: number, width: number, height: number): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  };
}

interface FakeDragData {
  readonly dataTransfer: DataTransfer;
  readonly set: (key: string, value: string) => void;
}

function createDataTransfer(): FakeDragData {
  const store = new Map<string, string>();
  const types: string[] = [];
  const dataTransfer = {
    types,
    dropEffect: 'none',
    setData(key: string, value: string) {
      const lower = key.toLowerCase();
      store.set(lower, value);
      if (!types.includes(lower)) types.push(lower);
    },
    getData: (key: string) => store.get(key.toLowerCase()) ?? '',
  } as unknown as DataTransfer;
  return { dataTransfer, set: (key, value) => dataTransfer.setData(key, value) };
}

function dragEventAt(
  target: EventTarget,
  dataTransfer: DataTransfer,
  point: { clientX: number; clientY: number },
  extra: Partial<React.DragEvent> = {},
): React.DragEvent {
  return {
    target,
    relatedTarget: null,
    ...point,
    dataTransfer,
    preventDefault() {},
    stopPropagation() {},
    ...extra,
  } as unknown as React.DragEvent;
}

test('useCanvasController resolves sidebar HTML5 drops through the unified hit-tester', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const realElementsFromPoint = document.elementsFromPoint;
  useCanvasViewportStore.getState().setManualZoom(1);

  try {
    const child = makeText('el-child');
    const parent = makeFrame('el-parent', [child]);
    const sibling = makeText('el-sibling');
    useElementStore.getState().setElements([parent, sibling], true);

    const controllerRef: { current: ReturnType<typeof useCanvasController> | undefined } = { current: undefined };
    function CanvasHost({ showChild }: { readonly showChild: boolean }) {
      const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
      controllerRef.current = useCanvasController({
        siteRoot,
        stageEl: null,
        iframeRef: { current: null },
        canEdit: true,
        canCreate: true,
        queryClient: client,
        projectId: 'proj-1',
        userId: 'user-1',
      });
      return h(
        'div',
        { ref: setSiteRoot, id: 'wb-site-root' },
        h(
          'div',
          { 'data-element-id': 'el-parent', 'data-element-type': 'Frame' },
          showChild ? h('div', { 'data-element-id': 'el-child', 'data-element-type': 'Text' }) : null,
        ),
        h('div', { 'data-element-id': 'el-sibling', 'data-element-type': 'Text' }),
      );
    }

    const r = await render(h(CanvasHost, { showChild: true }));
    const siteRoot = $q<HTMLElement>(r.container, '#wb-site-root');
    const parentNode = $q<HTMLElement>(r.container, '[data-element-id="el-parent"]');
    const childNode = $q<HTMLElement>(r.container, '[data-element-id="el-child"]');
    const siblingNode = $q<HTMLElement>(r.container, '[data-element-id="el-sibling"]');
    parentNode.getBoundingClientRect = () => makeRect(0, 0, 200, 100);
    childNode.getBoundingClientRect = () => makeRect(10, 10, 180, 30);
    siblingNode.getBoundingClientRect = () => makeRect(0, 120, 200, 40);
    let stack: Element[] = [siblingNode, siteRoot];
    document.elementsFromPoint = () => stack;

    const { dataTransfer, set } = createDataTransfer();
    const controller = () => {
      if (!controllerRef.current) throw new Error('controller not rendered');
      return controllerRef.current;
    };
    const getDrop = () => controller().drop;

    set('elementType', 'Text');
    await act(() => {
      controller().siteHandlers.onDragOver(dragEventAt(siblingNode, dataTransfer, { clientX: 10, clientY: 125 }));
    });
    assert.deepEqual(getDrop(), {
      kind: 'relative',
      indicator: { targetId: 'el-sibling', position: 'before', horizontal: false },
    });

    await act(() => {
      controller().siteHandlers.onDrop(dragEventAt(siblingNode, dataTransfer, { clientX: 10, clientY: 125 }));
    });
    assert.equal(useElementStore.getState().elements.length, 3);
    assert.equal(getDrop(), null);

    stack = [parentNode, siteRoot];
    set('elementType', 'Heading');
    await act(() => {
      controller().siteHandlers.onDragOver(dragEventAt(parentNode, dataTransfer, { clientX: 60, clientY: 50 }));
      controller().siteHandlers.onDragLeave(
        dragEventAt(parentNode, dataTransfer, { clientX: 60, clientY: 50 }, { relatedTarget: null }),
      );
      controller().siteHandlers.onDragOver(dragEventAt(parentNode, dataTransfer, { clientX: 60, clientY: 50 }));
      controller().siteHandlers.onDrop(dragEventAt(childNode, dataTransfer, { clientX: 60, clientY: 50 }));
    });
    const updatedParent = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(updatedParent?.elements?.some((el) => el.type === 'Heading'));

    const { setElementTypeDrag, getActiveDragPayload } = await import('../apps/editor/src/features/editor/utils/element/dragPayload');
    const emptyDt = {
      types: ['elementtype'],
      dropEffect: 'none',
      effectAllowed: 'uninitialized',
      setData() {},
      getData: () => '',
    } as unknown as DataTransfer;
    setElementTypeDrag(emptyDt, 'Button');
    await act(() => {
      controller().siteHandlers.onDragOver(dragEventAt(parentNode, emptyDt, { clientX: 60, clientY: 50 }));
      controller().siteHandlers.onDrop(dragEventAt(parentNode, emptyDt, { clientX: 60, clientY: 50 }));
    });
    const afterFallback = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(afterFallback?.elements?.some((el) => el.type === 'Button'));
    assert.equal(getActiveDragPayload(), null);

    // Persisted elements synced from Go can carry pageId: ""; drop must fall back to activePage.pageId.
    const emptyPageFrame: FrameElement = { ...makeFrame('el-parent', []), pageId: '' };
    useElementStore.getState().setElements([emptyPageFrame], true);
    await r.rerender(h(CanvasHost, { showChild: false }));
    set('elementType', 'Section');
    await act(() => {
      controller().siteHandlers.onDragOver(dragEventAt(parentNode, dataTransfer, { clientX: 60, clientY: 50 }));
      controller().siteHandlers.onDrop(dragEventAt(parentNode, dataTransfer, { clientX: 60, clientY: 50 }));
    });
    const afterEmptyPageId = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(afterEmptyPageId?.elements?.some((el) => el.type === 'Section' && el.pageId === 'page-1'));
  } finally {
    document.elementsFromPoint = realElementsFromPoint;
    useCanvasViewportStore.getState().resetViewport();
    await cleanup();
    client.clear();
  }
});

test('useCanvasController snaps sidebar drops to the nearest Flex row child slot', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const realElementsFromPoint = document.elementsFromPoint;
  useCanvasViewportStore.getState().setManualZoom(1);

  try {
    const row = makeFrame('row-1', [makeText('card-1'), makeText('card-2'), makeText('card-3')]);
    useElementStore.getState().setElements([row], true);

    const controllerRef: { current: ReturnType<typeof useCanvasController> | undefined } = { current: undefined };
    function CanvasHost() {
      const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
      controllerRef.current = useCanvasController({
        siteRoot,
        stageEl: null,
        iframeRef: { current: null },
        canEdit: true,
        canCreate: true,
        queryClient: client,
        projectId: 'proj-1',
        userId: 'user-1',
      });
      return h(
        'div',
        { ref: setSiteRoot, id: 'wb-site-root' },
        h(
          'div',
          {
            'data-element-id': 'row-1',
            'data-element-type': 'Frame',
            style: { display: 'flex', flexDirection: 'row' },
          },
          ...['card-1', 'card-2', 'card-3'].map((id) =>
            h('div', { key: id, 'data-element-id': id, 'data-element-type': 'Text' }),
          ),
        ),
      );
    }

    const r = await render(h(CanvasHost));
    const siteRoot = $q<HTMLElement>(r.container, '#wb-site-root');
    const rowNode = $q<HTMLElement>(r.container, '[data-element-id="row-1"]');
    rowNode.getBoundingClientRect = () => makeRect(0, 0, 600, 200);
    makeRectOf(r.container, 'card-1', makeRect(20, 40, 100, 120));
    makeRectOf(r.container, 'card-2', makeRect(150, 40, 100, 120));
    makeRectOf(r.container, 'card-3', makeRect(280, 40, 100, 120));
    document.elementsFromPoint = () => [rowNode, siteRoot];

    const { dataTransfer, set } = createDataTransfer();
    set('elementType', 'Text');
    const point = { clientX: 142, clientY: 100 };

    await act(() => {
      controllerRef.current?.siteHandlers.onDragOver(dragEventAt(rowNode, dataTransfer, point));
    });
    assert.deepEqual(controllerRef.current?.drop, {
      kind: 'relative',
      indicator: { targetId: 'card-2', position: 'before', horizontal: true },
    });

    await act(() => {
      controllerRef.current?.siteHandlers.onDrop(dragEventAt(rowNode, dataTransfer, point));
    });
    const savedRow = useElementStore.getState().elements.find((el) => el.id === 'row-1') as FrameElement | undefined;
    const order = savedRow?.elements?.map((el) => el.id) ?? [];
    assert.equal(order.length, 4);
    assert.deepEqual([order[0], order[2], order[3]], ['card-1', 'card-2', 'card-3']);
    assert.equal(savedRow?.elements?.[1]?.type, 'Text');
  } finally {
    document.elementsFromPoint = realElementsFromPoint;
    useCanvasViewportStore.getState().resetViewport();
    await cleanup();
    client.clear();
  }
});

function makeRectOf(container: HTMLElement, id: string, rect: DOMRect): void {
  $q<HTMLElement>(container, `[data-element-id="${id}"]`).getBoundingClientRect = () => rect;
}

test('VersionHistoryPanel lists saved versions and saves or restores snapshots', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity, staleTime: Infinity } },
  });
  const calls: Array<{ method: string; path: string }> = [];
  const restorable = makeText('restored-el');
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      'http://localhost:3000',
    );
    if (url.pathname === '/api/gettoken') return Response.json({ tokenJWT: 'tok-1' });
    const method = init?.method ?? 'GET';
    calls.push({ method, path: url.pathname });
    if (url.pathname === '/api/v1/snapshots/proj-1/snap-1' && method === 'GET') {
      return Response.json({ elements: [restorable] });
    }
    if (url.pathname === '/api/v1/snapshots/proj-1' && method === 'GET') {
      return Response.json([
        {
          id: 'snap-1',
          name: 'Version 1',
          type: 'version',
          timestamp: Date.now() - 120_000,
          createdAt: new Date(Date.now() - 120_000).toISOString(),
          elements: [restorable],
        },
      ]);
    }
    return Response.json({ id: 'snap-new' });
  }) as typeof fetch;

  try {
    client.setQueryData(projectKeys.detail('proj-1'), { id: 'proj-1', name: 'Site' });
    client.setQueryData(collaboratorKeys.byProject('proj-1'), [
      { userId: 'user-1', role: CollaboratorRole.OWNER },
    ]);
    client.setQueryData(
      ['snapshots', 'proj-1'],
      [
        {
          id: 'snap-1',
          name: 'Version 1',
          type: 'version',
          timestamp: Date.now() - 120_000,
          createdAt: new Date(Date.now() - 120_000).toISOString(),
          elements: [restorable],
        },
      ],
    );
    useElementStore.getState().setElements([makeText('live-el')], true);

    const r = await render(h(QueryClientProvider, { client }, h(VersionHistoryPanel)));
    assert.ok(r.container.textContent?.includes('Version 1'));

    const saveBtn = $$q<HTMLButtonElement>(r.container, 'button').find((b) =>
      b.textContent?.includes('Save current version'),
    )!;
    await click(saveBtn);
    await flush(10);
    assert.equal(calls.some((c) => c.method === 'POST'), true);

    await click($q<HTMLElement>(r.container, 'button[aria-label="Restore Version 1"]'));
    assert.ok(document.body.textContent?.includes('Restore this version?'));
    const confirmBtn = $$q<HTMLButtonElement>(document.body, 'button').find(
      (b) => b.textContent?.trim() === 'Restore',
    )!;
    await click(confirmBtn);
    await flush(10);
    assert.equal(useElementStore.getState().elements[0]?.id, 'restored-el');
  } finally {
    await cleanup();
    client.clear();
  }
});
