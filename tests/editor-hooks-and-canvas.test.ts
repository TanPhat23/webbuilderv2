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
import type { DropPayload } from '../apps/editor/src/features/editor/utils/element/dragPayload';

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
const { findElementNode, useElementRect } = await import('../apps/editor/src/features/editor/components/canvas/useElementRect');
const { useCanvasRootDrop } = await import('../apps/editor/src/features/editor/hooks/useCanvasRootDrop');
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

test('useElementRect measures relative element bounds and clears when element disappears', async () => {
  const prevCss = (globalThis as Record<string, unknown>).CSS;
  (globalThis as Record<string, unknown>).CSS = { escape: (s: string) => s };
  try {
  assert.equal(findElementNode(null, 'x'), null);
  const item = makeText('box-1');
  useElementStore.getState().setElements([item], true);

  let measured: ReturnType<typeof useElementRect> | undefined;
  let leftOffset = 25;
  function Box() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    measured = useElementRect(root, useElementStore.getState().elements[0]?.id);
    return h(
      'div',
      {
        ref: (node: HTMLDivElement | null) => {
          if (node) {
            node.getBoundingClientRect = () => ({ left: 10, top: 20, width: 500, height: 400 } as DOMRect);
          }
          setRoot(node);
        },
      },
      useElementStore.getState().elements.length > 0
        ? h('span', {
            'data-element-id': 'box-1',
            ref: (node: HTMLSpanElement | null) => {
              if (node) {
                node.getBoundingClientRect = () => ({ left: leftOffset, top: 50, width: 120, height: 40 } as DOMRect);
              }
            },
          })
        : null,
    );
  }

  await render(h(Box));
  assert.deepEqual(measured?.rect, { left: 15, top: 30, width: 120, height: 40 });

  leftOffset = 45;
  await act(async () => {
    useElementStore.getState().setElements([], true);
  });
  assert.equal(measured?.node, null);
  assert.equal(measured?.rect, null);
  } finally {
    (globalThis as Record<string, unknown>).CSS = prevCss;
  }
});

test('useCanvasRootDrop enforces create permissions, single component root, and section creation', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: Infinity } } });
  const added: string[] = [];
  let api: ReturnType<typeof useCanvasRootDrop> | undefined;

  function DropProbe(props: { canCreate: boolean; isComponentPage: boolean }) {
    api = useCanvasRootDrop({
      projectId: 'proj-1',
      pageId: 'page-1',
      userId: 'user-1',
      canCreate: props.canCreate,
      isComponentPage: props.isComponentPage,
      queryClient: client,
      addElement: (el) => {
        added.push(el.type);
        useElementStore.getState().setElements([...useElementStore.getState().elements, el], true);
      },
    });
    return null;
  }

  const fakeDataTransfer = (payload: DropPayload | null): DataTransfer => ({
    getData: (mime: string) => {
      if (!payload) return '';
      if (mime === 'elementType' && payload.kind === 'create') return payload.elementType;
      if (mime === 'elementId' && payload.kind === 'move') return payload.elementId;
      return '';
    },
  } as unknown as DataTransfer);

  const rootTarget = document.createElement('div');
  const dragEvent = (payload: DropPayload | null): React.DragEvent<HTMLDivElement> => ({
    target: rootTarget,
    dataTransfer: fakeDataTransfer(payload),
    preventDefault() {},
    stopPropagation() {},
  } as unknown as React.DragEvent<HTMLDivElement>);

  const r = await render(h(DropProbe, { canCreate: false, isComponentPage: false }));
  await act(async () => {
    api?.addNewSection();
    api?.handleDragOver(dragEvent({ kind: 'create', elementType: 'Text' }));
    api?.handleDrop(dragEvent({ kind: 'create', elementType: 'Text' }));
  });
  assert.deepEqual(added, []);

  await r.rerender(h(DropProbe, { canCreate: true, isComponentPage: true }));
  await act(async () => {
    api?.handleDragOver(dragEvent({ kind: 'create', elementType: 'Text' }));
  });
  assert.equal(api?.isDraggingOver, true);
  await act(async () => {
    api?.handleDragLeave(dragEvent(null));
  });
  assert.equal(api?.isDraggingOver, false);

  await act(async () => {
    api?.handleDrop(dragEvent({ kind: 'move', elementId: 'x' }));
    api?.handleDrop(dragEvent({ kind: 'create', elementType: 'Text' }));
    api?.handleDrop(dragEvent({ kind: 'create', elementType: 'Text' }));
  });
  assert.deepEqual(added, ['Text']);

  await act(async () => {
    api?.addNewSection();
  });
  assert.deepEqual(added, ['Text', 'Section']);
  client.clear();
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
