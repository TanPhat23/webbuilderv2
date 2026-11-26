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
import type { StageElementSnapshot } from '../apps/editor/src/features/editor/components/canvas/rectTracker';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { authState } = await import('./support/test-clerk-stub');
const { routerState } = await import('./support/editor-router-stub');
const { useElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { useSelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { useEventModeStore } = await import('../apps/editor/src/features/editor/store/event-mode-store');
const { usePickStore } = await import('../apps/editor/src/features/interactions/editing/pick-store');
const { useCanvasElement } = await import('../apps/editor/src/features/editor/components/elements/shared/useCanvasElement');
const { useCanvasPickMode } = await import('../apps/editor/src/features/editor/components/canvas/useCanvasPickMode');
const { findElementNode, useStageElementRect } = await import('../apps/editor/src/features/editor/components/canvas/rectTracker');
const { useCanvasController } = await import('../apps/editor/src/features/editor/components/canvas/useCanvasController');
const { useCanvasViewportStore } = await import('../apps/editor/src/features/editor/store/canvas-viewport-store');
const { useEditor } = await import('../apps/editor/src/features/editor/hooks/useEditor');
const { rememberPendingMaster, useProjectComponents } = await import('../apps/editor/src/features/editor/hooks/useProjectComponents');
const { EditorContext } = await import('../apps/editor/src/features/editor/context/EditorContext');
const { EditorFlagsProvider } = await import('../apps/editor/src/features/editor/components/context/EditorFlagsContext');
const { editorValue } = await import('./support/sidebar-fixtures');
const { projectKeys } = await import('../apps/editor/src/features/projects/hooks/useProjects');
const { collaboratorKeys } = await import('../apps/editor/src/features/collaboration/hooks/useCollaborators');
const { CollaboratorRole } = await import('../apps/editor/src/features/collaboration/interfaces/collaboration.interface');

const h = React.createElement;
const realFetch = globalThis.fetch;
const realError = console.error;

function makeText(id: string, content = 'Hello', extra: Partial<TextElement> = {}): TextElement {
  return {
    id,
    type: 'Text',
    content,
    pageId: 'page-1',
    styles: {},
    tailwindStyles: 'text-base',
    ...extra,
  };
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
  cleanup();
  routerState.navigations.length = 0;
  authState.userId = 'user-1';
  authState.isLoaded = true;
  useElementStore.getState().setElements([], true);
  useSelectionStore.getState().setSelectedElement(undefined);
  useEventModeStore.setState({ isEventModeEnabled: false, disabledElementEvents: new Set() });
  usePickStore.getState().cancel();
  console.error = () => {};
  globalThis.fetch = (async () => Response.json([])) as typeof fetch;
});

afterEach(() => {
  globalThis.fetch = realFetch;
  console.error = realError;
});

after(cleanup);

test('element-store-remote applies remoteAdd, remoteUpdate, remoteMove, and remoteDelete', () => {
  const frameA = makeFrame('f-a');
  const frameB = makeFrame('f-b');
  useElementStore.getState().setElements([frameA, frameB], true);

  const child = makeText('t-1', 'Initial', { parentId: 'f-a' });
  useElementStore.getState().remoteAdd(child);
  useElementStore.getState().remoteUpdate('t-1', { content: 'Patched' });

  let fA = useElementStore.getState().elements.find((e) => e.id === 'f-a') as FrameElement;
  assert.equal(fA.elements[0]?.content, 'Patched');

  useElementStore.getState().remoteMove('t-1', 'f-b', 0);
  useElementStore.getState().remoteMove('missing-id', 'f-b', 0);
  fA = useElementStore.getState().elements.find((e) => e.id === 'f-a') as FrameElement;
  const fB = useElementStore.getState().elements.find((e) => e.id === 'f-b') as FrameElement;
  assert.equal(fA.elements.length, 0);
  assert.equal(fB.elements[0]?.id, 't-1');

  useElementStore.getState().remoteDelete('t-1');
  assert.equal((useElementStore.getState().elements.find((e) => e.id === 'f-b') as FrameElement).elements.length, 0);
});

test('useCanvasElement builds editable rootProps and updates changed text on blur', async () => {
  const item = makeText('t-edit', 'Original');
  useElementStore.getState().setElements([item], true);
  useSelectionStore.getState().setSelectedElement(item);
  useSelectionStore.getState().setEditingElementId('t-edit');

  let propsRef: ReturnType<typeof useCanvasElement> | undefined;
  function Probe() {
    const props = useCanvasElement(item, { style: { color: 'red' } });
    propsRef = props;
    return h('div', { ...props.rootProps });
  }

  await render(
    h(EditorFlagsProvider, {
      canEdit: true,
      isReadOnly: false,
      isLocked: false,
      permissionsRole: CollaboratorRole.OWNER,
      canCreate: true,
      children: h(Probe),
    }),
  );
  assert.equal(propsRef?.isEditing, true);
  assert.equal(propsRef?.eventsActive, false);
  assert.equal(propsRef?.rootProps.contentEditable, true);
  assert.equal(propsRef?.rootProps.style.color, 'red');

  const node = document.createElement('div');
  node.textContent = 'Edited copy';
  await act(async () => {
    propsRef?.rootProps.onBlur({ currentTarget: node } as unknown as React.FocusEvent<HTMLElement>);
  });
  assert.equal(useElementStore.getState().elements[0]?.content, 'Edited copy');
});

test('useCanvasPickMode picks target elements, blocks multi-click, and cancels on Escape', async () => {
  const picked: string[] = [];
  usePickStore.getState().start((id) => picked.push(id));

  let pickApi: ReturnType<typeof useCanvasPickMode> | undefined;
  function Canvas() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    pickApi = useCanvasPickMode(root);
    return h('div', { ref: setRoot }, h('button', { 'data-element-id': 'picked-el' }, 'Pick me'));
  }

  const r = await render(h(Canvas));
  assert.equal(pickApi?.picking, true);
  const child = r.container.querySelector('[data-element-id="picked-el"]') as HTMLElement;

  let prevented = false;
  let stopped = false;
  const makeMouseEvent = (type: string, detail: number): React.MouseEvent => ({
    type,
    detail,
    target: child,
    preventDefault: () => { prevented = true; },
    stopPropagation: () => { stopped = true; },
  } as unknown as React.MouseEvent);

  await act(async () => {
    pickApi?.blockPickPointer(makeMouseEvent('mousedown', 1));
    pickApi?.handleClickCapture(makeMouseEvent('click', 1));
  });
  assert.deepEqual(picked, ['picked-el']);
  assert.equal(prevented && stopped, true);

  await act(async () => {
    pickApi?.handleDoubleClickCapture(makeMouseEvent('dblclick', 2));
  });

  await act(() => {
    usePickStore.getState().start(() => {});
  });
  await act(() => {
    window.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  });
  assert.equal(usePickStore.getState().onPick, null);
});

test('useCanvasController ignores the second press of a double click that completed a pick', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  useSelectionStore.getState().setSelectedElement(undefined);
  let controller: ReturnType<typeof useCanvasController> | undefined;
  function PickProbe() {
    const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
    controller = useCanvasController({
      siteRoot,
      stageEl: null,
      iframeRef: { current: null },
      canEdit: true,
      canCreate: true,
      queryClient: client,
      projectId: 'proj-1',
      userId: 'user-1',
    });
    return h('div', { ref: setSiteRoot, id: 'wb-site-root' }, h('button', { 'data-element-id': 'picked-el' }, 'Pick me'));
  }

  try {
    const r = await render(h(PickProbe));
    const target = r.container.querySelector('[data-element-id="picked-el"]') as HTMLElement;
    const picked: string[] = [];
    usePickStore.getState().start((id) => picked.push(id));

    const mouse = (type: string, detail: number): React.MouseEvent => {
      let stopped = false;
      return {
        type,
        detail,
        target,
        preventDefault() {},
        stopPropagation() { stopped = true; },
        isPropagationStopped: () => stopped,
      } as unknown as React.MouseEvent;
    };
    const press = (): React.PointerEvent =>
      ({ button: 0, clientX: 5, clientY: 5, altKey: false, shiftKey: false, target, preventDefault() {}, stopPropagation() {} }) as unknown as React.PointerEvent;
    const release = (): void => {
      const up = new Event('pointerup', { bubbles: true, cancelable: true });
      Object.defineProperties(up, { clientX: { value: 5 }, clientY: { value: 5 } });
      window.dispatchEvent(up);
    };

    // First click completes the pick.
    await act(async () => {
      controller?.siteHandlers.onClickCapture(mouse('click', 1));
    });
    assert.deepEqual(picked, ['picked-el']);

    // Second press of the double click: pick mode swallows the mouse events, so it must not select on release.
    await act(async () => {
      controller?.siteHandlers.onPointerDown(press());
      controller?.siteHandlers.onMouseDownCapture(mouse('mousedown', 2));
      release();
    });
    assert.equal(useSelectionStore.getState().selectedElementId, undefined);

    // A later ordinary click still selects.
    await act(async () => {
      controller?.siteHandlers.onMouseDownCapture(mouse('mousedown', 1));
      controller?.siteHandlers.onPointerDown(press());
      release();
    });
    assert.equal(useSelectionStore.getState().selectedElementId, 'picked-el');
  } finally {
    usePickStore.getState().cancel();
    client.clear();
  }
});

test('useStageElementRect measures stage-projected element bounds and clears when the element disappears', async () => {
  useCanvasViewportStore.getState().setManualZoom(1);
  assert.equal(findElementNode(null, 'x'), null);

  const stageEl = document.createElement('div');
  const iframeEl = document.createElement('iframe');
  const siteRoot = document.createElement('div');
  const box = document.createElement('span');
  box.setAttribute('data-element-id', 'box-1');
  siteRoot.appendChild(box);
  stageEl.append(iframeEl);
  document.body.appendChild(stageEl);

  const rect = (left: number, top: number, width: number, height: number): DOMRect =>
    ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON: () => ({}) }) as DOMRect;
  stageEl.getBoundingClientRect = () => rect(10, 20, 800, 600);
  iframeEl.getBoundingClientRect = () => rect(10, 20, 500, 400);
  Object.defineProperty(iframeEl, 'clientHeight', { configurable: true, value: 400 });
  box.getBoundingClientRect = () => rect(25, 50, 120, 40);

  assert.equal(findElementNode(siteRoot, 'box-1'), box);

  let measured: StageElementSnapshot | undefined;
  function Box() {
    measured = useStageElementRect(siteRoot, stageEl, iframeEl, 'box-1');
    return null;
  }

  try {
    const view = await render(h(Box));
    assert.equal(measured?.node, box);
    assert.deepEqual(measured?.rect, { left: 25, top: 50, width: 120, height: 40 });
    assert.equal(measured?.visibleInFrame, true);

    box.remove();
    await act(async () => {
      siteRoot.ownerDocument.dispatchEvent(new Event('scroll'));
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    assert.equal(measured?.node, null);
    assert.equal(measured?.rect, null);
    await view.unmount();
  } finally {
    stageEl.remove();
    useCanvasViewportStore.getState().resetViewport();
  }
});

test('useCanvasController root drops enforce create permissions and the single component root', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  useElementStore.getState().beginPage('proj-1', 'page-1', false);
  useElementStore.getState().setElements([], true);
  useCanvasViewportStore.getState().setManualZoom(1);

  let controller: ReturnType<typeof useCanvasController> | undefined;
  function DropProbe(props: { canCreate: boolean }) {
    const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
    controller = useCanvasController({
      siteRoot,
      stageEl: null,
      iframeRef: { current: null },
      canEdit: true,
      canCreate: props.canCreate,
      queryClient: client,
      projectId: 'proj-1',
      userId: 'user-1',
    });
    return h('div', { ref: setSiteRoot, id: 'wb-site-root' });
  }

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
  const dragEvent = (): React.DragEvent =>
    ({
      target: document.body,
      relatedTarget: null,
      clientX: 10,
      clientY: 10,
      dataTransfer,
      preventDefault() {},
      stopPropagation() {},
    }) as unknown as React.DragEvent;
  const realElementsFromPoint = document.elementsFromPoint;
  document.elementsFromPoint = () => [document.body];
  const dropOnce = async (): Promise<void> => {
    await act(async () => {
      controller?.siteHandlers.onDragOver(dragEvent());
      controller?.siteHandlers.onDrop(dragEvent());
    });
  };

  try {
    dataTransfer.setData('elementType', 'Text');

    const r = await render(h(DropProbe, { canCreate: false }));
    await dropOnce();
    assert.equal(controller?.drop, null);
    assert.equal(useElementStore.getState().elements.length, 0);

    await r.rerender(h(DropProbe, { canCreate: true }));
    await act(async () => {
      controller?.siteHandlers.onDragOver(dragEvent());
    });
    assert.deepEqual(controller?.drop, { kind: 'root' });
    await act(async () => {
      controller?.siteHandlers.onDragLeave(dragEvent());
    });
    assert.equal(controller?.drop, null);

    await dropOnce();
    assert.deepEqual(useElementStore.getState().elements.map((el) => el.type), ['Text']);

    // A master (component) page holds one root: once it exists, a drop that is not inside it is rejected.
    useElementStore.getState().beginPage('proj-1', 'cp-1', true);
    useElementStore.getState().setElements([makeFrame('master-root')], true);
    await dropOnce();
    assert.equal(useElementStore.getState().elements.length, 1);
  } finally {
    document.elementsFromPoint = realElementsFromPoint;
    useCanvasViewportStore.getState().resetViewport();
    client.clear();
  }
});

test('useEditor addNewSection creates a Section only when creation is permitted', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  client.setQueryData(projectKeys.pages('p1'), [
    { Id: 'home', Name: 'Home', Type: 'sp', Styles: null, ProjectId: 'p1', CreatedAt: new Date(0), UpdatedAt: new Date(0), DeletedAt: null },
  ]);
  client.setQueryData(projectKeys.detail('p1'), { id: 'p1' });
  client.setQueryData(collaboratorKeys.byProject('p1'), [{ userId: 'user-1', role: CollaboratorRole.OWNER }]);

  let editorResult: ReturnType<typeof useEditor> | undefined;
  function EditorProbe(props: { readOnly: boolean }) {
    editorResult = useEditor('p1', 'home', { isReadOnly: props.readOnly });
    return null;
  }

  try {
    const r = await render(h(QueryClientProvider, { client }, h(EditorProbe, { readOnly: true })));
    await flush(5);
    useElementStore.getState().setElements([], true);
    await act(async () => {
      editorResult?.addNewSection();
    });
    assert.equal(useElementStore.getState().elements.length, 0);

    await r.rerender(h(QueryClientProvider, { client }, h(EditorProbe, { readOnly: false })));
    await flush(5);
    await act(async () => {
      editorResult?.addNewSection();
    });
    assert.deepEqual(useElementStore.getState().elements.map((el) => el.type), ['Section']);
  } finally {
    await cleanup();
    client.clear();
  }
});

test('useEditor and useProjectComponents resolve queries, component masters, and lifecycle redirects', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const pages = [
    { Id: 'home', Name: 'Home', Type: 'sp', Styles: null, ProjectId: 'p1', CreatedAt: new Date(0), UpdatedAt: new Date(0), DeletedAt: null },
    { Id: 'cp-1', Name: 'Card', Type: 'cp', Styles: null, ProjectId: 'p1', CreatedAt: new Date(0), UpdatedAt: new Date(0), DeletedAt: null },
  ];
  client.setQueryData(projectKeys.pages('p1'), pages);
  client.setQueryData(projectKeys.detail('p1'), { id: 'p1', deletedAt: '2026-11-23T00:00:00Z' });
  client.setQueryData(collaboratorKeys.byProject('p1'), [
    { userId: 'user-1', role: CollaboratorRole.OWNER },
  ]);
  rememberPendingMaster('p1', 'cp-1', [makeFrame('master-1')]);

  let editorResult: ReturnType<typeof useEditor> | undefined;
  let compResult: ReturnType<typeof useProjectComponents> | undefined;

  function CompProbe() {
    compResult = useProjectComponents(true);
    return null;
  }

  function EditorProbe() {
    editorResult = useEditor('p1', 'missing-page');
    const ctx = {
      ...editorValue(),
      projectId: 'p1',
      pageId: 'cp-1',
      editor: editorResult,
    };
    return h(EditorContext.Provider, { value: ctx }, h(CompProbe));
  }

  try {
    await render(h(QueryClientProvider, { client }, h(EditorProbe)));
    await flush(10);

    assert.equal(editorResult?.isReadOnly, false);
    assert.equal(editorResult?.permissions.canEditElements, true);
    assert.equal(compResult?.pages.length, 1);
    assert.equal(compResult?.elements.some((e) => e.id === 'master-1'), true);
    assert.ok(routerState.navigations.some((n) => n.to === '/editor/p1?page=home'));
    assert.ok(routerState.navigations.some((n) => n.to === '/dashboard'));
  } finally {
    await cleanup();
    client.clear();
  }
});
