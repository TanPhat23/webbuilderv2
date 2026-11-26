import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import { redirectModules } from './support/test-stub-modules';
import { $q, act, cleanup, React, render } from './support/sidebar-dom-harness';
import type { FrameElement, HeadingElement } from '@webbuilder/site-runtime/types/elements/elements';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { useCanvasController } = await import(
  '../apps/editor/src/features/editor/components/canvas/useCanvasController'
);
const { useCanvasManipulation, clientToIframeClient } = await import(
  '../apps/editor/src/features/editor/components/canvas/useCanvasManipulation'
);
const { useCanvasElement } = await import(
  '../apps/editor/src/features/editor/components/elements/shared/useCanvasElement'
);
const { EditorFlagsProvider } = await import(
  '../apps/editor/src/features/editor/components/context/EditorFlagsContext'
);
const { CollaboratorRole } = await import(
  '../apps/editor/src/features/collaboration/interfaces/collaboration.interface'
);
const { useElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { useSelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { useCanvasViewportStore, computeEffectiveZoom } = await import(
  '../apps/editor/src/features/editor/store/canvas-viewport-store'
);

const h = React.createElement;

function makeHeading(id: string): HeadingElement {
  return {
    id,
    type: 'Heading',
    content: 'Title',
    pageId: 'page-1',
    styles: { default: {} },
    tailwindStyles: 'text-2xl',
  };
}

function makeFrame(id: string): FrameElement {
  return {
    id,
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    styles: { default: { width: '200px' } },
    tailwindStyles: '',
    elements: [],
  };
}

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

function makePointerEvent(type: string, init: { clientX?: number; clientY?: number } = {}): Event {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(ev, {
    clientX: { value: init.clientX ?? 0 },
    clientY: { value: init.clientY ?? 0 },
    button: { value: 0 },
    shiftKey: { value: false },
    altKey: { value: false },
  });
  return ev;
}

function pointerDown(target: HTMLElement, clientX: number, clientY: number): React.PointerEvent {
  return {
    button: 0,
    clientX,
    clientY,
    altKey: false,
    shiftKey: false,
    target,
    preventDefault() {},
    stopPropagation() {},
  } as unknown as React.PointerEvent;
}

const realRaf = globalThis.requestAnimationFrame;
const realCancelRaf = globalThis.cancelAnimationFrame;

beforeEach(() => {
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 1;
  }) as typeof requestAnimationFrame;
  globalThis.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
  useElementStore.getState().beginPage('proj-1', 'page-1', false);
  useElementStore.getState().setElements([], true);
  useSelectionStore.getState().clearSelection();
  useCanvasViewportStore.getState().resetViewport();
});

afterEach(async () => {
  await cleanup();
  globalThis.requestAnimationFrame = realRaf;
  globalThis.cancelAnimationFrame = realCancelRaf;
  useCanvasViewportStore.getState().resetViewport();
});

after(cleanup);

type Controller = ReturnType<typeof useCanvasController>;

async function renderHeadingCanvas(): Promise<{
  node: HTMLElement;
  controller: () => Controller;
}> {
  const heading = makeHeading('h1');
  useElementStore.getState().setElements([heading], true);
  let current: Controller | undefined;
  const queryClient = new QueryClient();
  const iframeRef = { current: null };

  function HeadingNode(): React.ReactElement {
    const { rootProps } = useCanvasElement(heading);
    return h('h1', rootProps, heading.content);
  }

  function Host(): React.ReactElement {
    const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
    current = useCanvasController({
      siteRoot,
      stageEl: null,
      iframeRef,
      canEdit: true,
      canCreate: true,
      queryClient,
      projectId: 'proj-1',
      userId: null,
    });
    return h('div', { ref: setSiteRoot, id: 'wb-site-root' }, h(HeadingNode));
  }

  const r = await render(
    h(EditorFlagsProvider, {
      canEdit: true,
      isReadOnly: false,
      isLocked: false,
      permissionsRole: CollaboratorRole.OWNER,
      canCreate: true,
      children: h(Host),
    }),
  );
  const node = $q<HTMLElement>(r.container, '[data-element-id="h1"]');
  return {
    node,
    controller: () => {
      if (!current) throw new Error('controller not rendered');
      return current;
    },
  };
}

test('a single click selects an editable heading without entering text editing', async () => {
  const { node, controller } = await renderHeadingCanvas();

  await act(() => {
    controller().siteHandlers.onPointerDown(pointerDown(node, 20, 20));
    window.dispatchEvent(makePointerEvent('pointerup', { clientX: 22, clientY: 21 }));
  });

  assert.equal(useSelectionStore.getState().selectedElementId, 'h1');
  assert.equal(useSelectionStore.getState().editingElementId, undefined);
  assert.equal(node.getAttribute('contenteditable'), null);
});

test('a double click enters inline text editing and enables contentEditable', async () => {
  const { node, controller } = await renderHeadingCanvas();

  await act(() => {
    controller().siteHandlers.onPointerDown(pointerDown(node, 20, 20));
    window.dispatchEvent(makePointerEvent('pointerup', { clientX: 20, clientY: 20 }));
  });
  await act(() => {
    controller().siteHandlers.onDoubleClick({
      target: node,
      preventDefault() {},
      stopPropagation() {},
    } as unknown as React.MouseEvent);
  });

  assert.equal(useSelectionStore.getState().selectedElementId, 'h1');
  assert.equal(useSelectionStore.getState().editingElementId, 'h1');
  assert.equal(node.getAttribute('contenteditable'), 'true');

  // Selecting something else leaves editing.
  useSelectionStore.getState().setSelectedElement(undefined);
  assert.equal(useSelectionStore.getState().editingElementId, undefined);
});

test('resize at effectiveZoom 0.5 on the md breakpoint commits zoom-corrected px to styles.md and md: tailwind, leaving node.style clean', async () => {
  const box = makeFrame('box-1');
  useElementStore.getState().setElements([box], true);
  useCanvasViewportStore.setState({ activeBreakpoint: 'md', zoomMode: 'manual', manualZoom: 0.5 });
  assert.equal(computeEffectiveZoom(useCanvasViewportStore.getState()), 0.5);

  const frameEl = document.createElement('div');
  frameEl.getBoundingClientRect = () => makeRect(0, 0, 400, 300);
  const iframeRef = { current: frameEl as unknown as HTMLIFrameElement };

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = { current: undefined };
  function Host(): React.ReactElement {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({
      root,
      canEdit: true,
      picking: false,
      getZoom: () => computeEffectiveZoom(useCanvasViewportStore.getState()),
      stageEl: null,
      iframeRef,
    });
    return h(
      'div',
      { ref: setRoot, id: 'wb-site-root' },
      h('div', { 'data-element-id': 'box-1', 'data-element-type': 'Frame' }),
    );
  }
  const r = await render(h(Host));
  const rootNode = $q<HTMLElement>(r.container, '#wb-site-root');
  const boxNode = $q<HTMLElement>(r.container, '[data-element-id="box-1"]');
  rootNode.getBoundingClientRect = () => makeRect(0, 0, 1000, 600);
  boxNode.getBoundingClientRect = () => makeRect(100, 100, 200, 100);

  await act(() => {
    // Right edge sits at iframe x=300, which is screen x=150 at zoom 0.5.
    apiRef.current?.startResize(box, boxNode, 'e', pointerDown(boxNode, 150, 75));
    window.dispatchEvent(makePointerEvent('pointermove', { clientX: 200, clientY: 75 }));
  });
  // +50 screen px / 0.5 zoom = +100 iframe px
  assert.equal(boxNode.style.width, '300px');

  await act(() => {
    window.dispatchEvent(makePointerEvent('pointerup', { clientX: 200, clientY: 75 }));
  });

  const saved = useElementStore.getState().elements[0];
  assert.equal(saved?.styles?.md?.width, '300px');
  assert.equal(saved?.styles?.default?.width, '200px');
  assert.match(saved?.tailwindStyles ?? '', /md:w-\[300px\]/);
  assert.equal(boxNode.style.width, '');
  assert.equal(apiRef.current?.session.kind, 'idle');
});

test('clientToIframeClient divides parent-space pointers by zoom and passes iframe-realm pointers through', () => {
  const frameEl = document.createElement('div');
  frameEl.getBoundingClientRect = () => makeRect(40, 20, 400, 300);
  const iframeWin = {} as unknown as Window;

  const fromParent = clientToIframeClient(
    { clientX: 240, clientY: 120, view: window },
    { iframeWin, frameEl, zoom: 0.5 },
  );
  assert.deepEqual(fromParent, { x: 400, y: 200 });

  const fromIframe = clientToIframeClient(
    { clientX: 400, clientY: 200, view: iframeWin },
    { iframeWin, frameEl, zoom: 0.5 },
  );
  assert.deepEqual(fromIframe, { x: 400, y: 200 });
});

test('Space pans only while the pointer is over the canvas and never steals activation keys', async () => {
  const stage = document.createElement('div');
  const button = document.createElement('button');
  document.body.append(stage, button);
  const queryClient = new QueryClient();
  const iframeRef = { current: null };

  function Host(): React.ReactElement {
    const [siteRoot, setSiteRoot] = React.useState<HTMLDivElement | null>(null);
    useCanvasController({
      siteRoot,
      stageEl: stage,
      iframeRef,
      canEdit: true,
      canCreate: true,
      queryClient,
      projectId: 'proj-1',
      userId: null,
    });
    return h('div', { ref: setSiteRoot, id: 'wb-site-root' });
  }
  await render(h(Host));

  const pressSpace = (target: EventTarget): KeyboardEvent => {
    const event = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    target.dispatchEvent(event);
    return event;
  };

  try {
    // Pointer is not over the canvas: Space belongs to the page chrome.
    assert.equal(pressSpace(document.body).defaultPrevented, false);
    assert.equal(pressSpace(button).defaultPrevented, false);

    await act(() => {
      stage.dispatchEvent(new Event('pointerenter'));
    });
    // Over the canvas, a bare Space enters pan mode...
    assert.equal(pressSpace(document.body).defaultPrevented, true);
    // ...but an activatable control keeps its Space.
    assert.equal(pressSpace(button).defaultPrevented, false);

    await act(() => {
      stage.dispatchEvent(new Event('pointerleave'));
    });
    assert.equal(pressSpace(document.body).defaultPrevented, false);
  } finally {
    stage.remove();
    button.remove();
  }
});
