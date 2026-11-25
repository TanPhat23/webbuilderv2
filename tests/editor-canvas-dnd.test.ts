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
import type { FrameElement, TextElement } from '../src/types/elements/elements';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { authState } = await import('./support/test-clerk-stub');
const { routerState } = await import('./support/editor-router-stub');
const { useCanvasDragDrop } = await import('../src/features/editor/components/canvas/useCanvasDragDrop');
const VersionHistoryPanel = (await import('../src/features/editor/components/sidebar/SnapshotManager')).default;
const { useElementStore } = await import('../src/features/editor/store/element-store');
const { useSelectionStore } = await import('../src/features/editor/store/selection-store');
const { projectKeys } = await import('../src/features/projects/hooks/useProjects');
const { collaboratorKeys } = await import('../src/features/collaboration/hooks/useCollaborators');
const { CollaboratorRole } = await import('../src/features/collaboration/interfaces/collaboration.interface');

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

test('useCanvasDragDrop computes drop indicators, handles move and create drops, and prevents self-drop', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const prevCss = (globalThis as Record<string, unknown>).CSS;
  (globalThis as Record<string, unknown>).CSS = { escape: (s: string) => s };

  try {
    const child = makeText('el-child');
    const parent = makeFrame('el-parent', [child]);
    const sibling = makeText('el-sibling');
    useElementStore.getState().setElements([parent, sibling], true);

    const dndRef: { current: ReturnType<typeof useCanvasDragDrop> | undefined } = { current: undefined };
    function CanvasHost() {
      const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
      dndRef.current = useCanvasDragDrop({
        root,
        canEdit: true,
        canCreate: true,
        queryClient: client,
        projectId: 'proj-1',
        userId: 'user-1',
      });
      return h(
        'div',
        { ref: setRoot },
        h(
          'div',
          {
            'data-element-id': 'el-parent',
            'data-element-type': 'Frame',
            draggable: true,
          },
          h('div', {
            'data-element-id': 'el-child',
            'data-element-type': 'Text',
            draggable: true,
          }),
        ),
        h('div', {
          'data-element-id': 'el-sibling',
          'data-element-type': 'Text',
          draggable: true,
        }),
      );
    }

    const r = await render(h(CanvasHost));
    const parentNode = $q<HTMLElement>(r.container, '[data-element-id="el-parent"]');
    const childNode = $q<HTMLElement>(r.container, '[data-element-id="el-child"]');
    const siblingNode = $q<HTMLElement>(r.container, '[data-element-id="el-sibling"]');
    parentNode.getBoundingClientRect = () => ({ left: 0, top: 0, width: 200, height: 100 } as DOMRect);
    siblingNode.getBoundingClientRect = () => ({ left: 0, top: 120, width: 200, height: 40 } as DOMRect);

    const storeData = new Map<string, string>();
    const types: string[] = [];
    const dt = {
      types,
      dropEffect: 'none',
      setData(k: string, v: string) {
        const lower = k.toLowerCase();
        storeData.set(lower, v);
        if (!types.includes(lower)) types.push(lower);
      },
      getData: (k: string) => storeData.get(k.toLowerCase()) ?? '',
    } as unknown as DataTransfer;

    const dragEvent = (target: EventTarget, extra: Partial<React.DragEvent> = {}) => ({
      target,
      relatedTarget: null,
      clientX: 10,
      clientY: 125,
      dataTransfer: dt,
      preventDefault() {},
      stopPropagation() {},
      ...extra,
    } as unknown as React.DragEvent);

    const getDrop = () => dndRef.current?.drop ?? null;

    await act(() => {
      dndRef.current?.handleDragStart(dragEvent(parentNode));
    });
    assert.equal(parentNode.getAttribute('data-dragging'), 'true');

    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(childNode));
    });
    assert.ok(getDrop() === null);

    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(siblingNode));
    });
    assert.equal(getDrop()?.targetId, 'el-sibling');

    await act(() => {
      dndRef.current?.handleDrop(dragEvent(siblingNode));
      dndRef.current?.resetDrag();
    });
    assert.equal(parentNode.getAttribute('data-dragging'), null);

    dt.setData('elementType', 'Text');
    storeData.delete('elementid');
    const idx = types.indexOf('elementid');
    if (idx >= 0) types.splice(idx, 1);
    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(siblingNode));
      dndRef.current?.handleDrop(dragEvent(siblingNode));
      dndRef.current?.handleDragLeave(dragEvent(siblingNode, { relatedTarget: document.body }));
    });
    assert.equal(useElementStore.getState().elements.length, 3);

    dt.setData('elementType', 'Heading');
    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(parentNode, { clientX: 60, clientY: 50 }));
      dndRef.current?.handleDragLeave(dragEvent(parentNode, { relatedTarget: null }));
      dndRef.current?.handleDrop(dragEvent(parentNode.firstChild ?? parentNode, { clientX: 60, clientY: 50 }));
    });
    const updatedParent = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(updatedParent?.elements?.some((el) => el.type === 'Heading'));

    const { setElementTypeDrag, getActiveDragPayload } = await import('../src/features/editor/utils/element/dragPayload');
    const emptyDt = {
      types: ['elementtype'],
      dropEffect: 'none',
      effectAllowed: 'uninitialized',
      setData() {},
      getData: () => '',
    } as unknown as DataTransfer;
    setElementTypeDrag(emptyDt, 'Button');
    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(parentNode, { clientX: 60, clientY: 50, dataTransfer: emptyDt }));
      dndRef.current?.handleDrop(dragEvent(parentNode, { clientX: 60, clientY: 50, dataTransfer: emptyDt }));
    });
    const afterFallback = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(afterFallback?.elements?.some((el) => el.type === 'Button'));
    assert.equal(getActiveDragPayload(), null);

    // Persisted elements synced from Go can carry pageId: ""; drop must fall back to activePage.pageId.
    const emptyPageFrame: FrameElement = { ...makeFrame('el-parent', []), pageId: '' };
    useElementStore.getState().setElements([emptyPageFrame], true);
    dt.setData('elementType', 'Section');
    await act(() => {
      dndRef.current?.handleDragOver(dragEvent(parentNode, { clientX: 60, clientY: 50 }));
      dndRef.current?.handleDrop(dragEvent(parentNode, { clientX: 60, clientY: 50 }));
    });
    const afterEmptyPageId = useElementStore.getState().elements.find((el) => el.id === 'el-parent') as FrameElement | undefined;
    assert.ok(afterEmptyPageId?.elements?.some((el) => el.type === 'Section' && el.pageId === 'page-1'));
  } finally {
    (globalThis as Record<string, unknown>).CSS = prevCss;
    await cleanup();
    client.clear();
  }
});

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
