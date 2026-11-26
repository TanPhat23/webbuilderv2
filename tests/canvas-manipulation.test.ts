import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';
import {
  $q,
  act,
  cleanup,
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

const { useCanvasManipulation } = await import(
  '../apps/editor/src/features/editor/components/canvas/useCanvasManipulation'
);
const { useElementStore } = await import(
  '../apps/editor/src/features/editor/store/element-store'
);
const { useSelectionStore } = await import(
  '../apps/editor/src/features/editor/store/selection-store'
);

const h = React.createElement;

function makeText(id: string, parentId?: string): TextElement {
  return {
    id,
    type: 'Text',
    content: id,
    pageId: 'page-1',
    parentId,
    styles: { default: {} },
    tailwindStyles: 'p-8',
  };
}

function makeFrame(id: string, children: TextElement[] = []): FrameElement {
  return {
    id,
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    styles: { default: {} },
    tailwindStyles: '',
    elements: children,
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

function makePointerEvent(
  type: string,
  init: {
    clientX?: number;
    clientY?: number;
    button?: number;
    shiftKey?: boolean;
    altKey?: boolean;
  } = {},
): Event {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperties(ev, {
    clientX: { value: init.clientX ?? 0 },
    clientY: { value: init.clientY ?? 0 },
    button: { value: init.button ?? 0 },
    shiftKey: { value: init.shiftKey ?? false },
    altKey: { value: init.altKey ?? false },
  });
  return ev;
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
});

afterEach(async () => {
  await cleanup();
  globalThis.requestAnimationFrame = realRaf;
  globalThis.cancelAnimationFrame = realCancelRaf;
});

after(cleanup);

test('click (<= 4px movement) stays idle and never calls moveElement', async () => {
  const a = makeText('a');
  const b = makeText('b');
  useElementStore.getState().setElements([a, b], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'a', 'data-element-type': 'Text' }, 'a'),
      h('div', { 'data-element-id': 'b', 'data-element-type': 'Text' }, 'b'),
    );
  }

  const r = await render(h(Host));
  const nodeA = $q<HTMLElement>(r.container, '[data-element-id="a"]');

  await act(() => {
    apiRef.current?.handleCanvasPointerDown({
      button: 0,
      clientX: 10,
      clientY: 10,
      target: nodeA,
      preventDefault() {},
      stopPropagation() {},
    } as unknown as React.PointerEvent);
    window.dispatchEvent(makePointerEvent('pointermove', { clientX: 12, clientY: 12 }));
    window.dispatchEvent(makePointerEvent('pointerup', { clientX: 12, clientY: 12 }));
  });

  assert.equal(apiRef.current?.session.kind, 'idle');
  assert.deepEqual(
    useElementStore.getState().elements.map((e) => e.id),
    ['a', 'b'],
  );
});

test('pointer drag (> 4px) enters moving, resolves drop target, and commits one moveElement on pointerup', async () => {
  const a = makeText('a');
  const b = makeText('b');
  const c = makeText('c');
  useElementStore.getState().setElements([a, b, c], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'a', 'data-element-type': 'Text' }, 'a'),
      h('div', { 'data-element-id': 'b', 'data-element-type': 'Text' }, 'b'),
      h('div', { 'data-element-id': 'c', 'data-element-type': 'Text' }, 'c'),
    );
  }

  const r = await render(h(Host));
  const nodeA = $q<HTMLElement>(r.container, '[data-element-id="a"]');
  const nodeB = $q<HTMLElement>(r.container, '[data-element-id="b"]');
  const nodeC = $q<HTMLElement>(r.container, '[data-element-id="c"]');

  nodeA.getBoundingClientRect = () => makeRect(0, 0, 200, 40);
  nodeB.getBoundingClientRect = () => makeRect(0, 50, 200, 40);
  nodeC.getBoundingClientRect = () => makeRect(0, 100, 200, 40);

  const doc = nodeA.ownerDocument as Document & {
    elementsFromPoint?: (x: number, y: number) => Element[];
  };
  const prevEfp = doc.elementsFromPoint;
  doc.elementsFromPoint = (_x: number, y: number) => {
    if (y >= 100) return [nodeC];
    if (y >= 50) return [nodeB];
    return [nodeA];
  };

  try {
    await act(() => {
      apiRef.current?.handleCanvasPointerDown({
        button: 0,
        clientX: 20,
        clientY: 20,
        target: nodeA,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
    });

    // Moving 'a' onto the top half of 'b' is a no-op (a is already right before b)
    await act(() => {
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 20, clientY: 55 }));
    });
    assert.equal(apiRef.current?.session.kind, 'moving');
    assert.equal(nodeA.getAttribute('data-dragging'), 'true');
    if (apiRef.current?.session.kind === 'moving') {
      assert.equal(apiRef.current.session.target, null);
    }

    // Moving 'a' onto the bottom half of 'c' is a real move (after c)
    await act(() => {
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 20, clientY: 135 }));
    });
    if (apiRef.current?.session.kind === 'moving') {
      assert.equal(apiRef.current.session.target?.targetId, 'c');
      assert.equal(apiRef.current.session.target?.position, 'after');
    }

    await act(() => {
      window.dispatchEvent(makePointerEvent('pointerup', { clientX: 20, clientY: 135 }));
    });
    assert.equal(apiRef.current?.session.kind, 'idle');
    assert.equal(nodeA.getAttribute('data-dragging'), null);
    assert.deepEqual(
      useElementStore.getState().elements.map((e) => e.id),
      ['b', 'c', 'a'],
    );
  } finally {
    doc.elementsFromPoint = prevEfp;
  }
});

test('startResize previews live DOM styles, reverts on Escape, and commits once on pointerup', async () => {
  const box = makeFrame('box', []);
  useElementStore.getState().setElements([box], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'box', 'data-element-type': 'Frame' }),
    );
  }

  const r = await render(h(Host));
  const rootNode = $q<HTMLElement>(r.container, '[data-canvas-root]');
  const boxNode = $q<HTMLElement>(r.container, '[data-element-id="box"]');
  rootNode.getBoundingClientRect = () => makeRect(0, 0, 1000, 600);
  boxNode.getBoundingClientRect = () => makeRect(100, 100, 200, 100);

  const getSession = () => apiRef.current?.session;

  // 1) Start resize, drag, then press Escape -> inline style restored, store untouched
  await act(() => {
    apiRef.current?.startResize(box, boxNode, 'e', {
      button: 0,
      clientX: 300,
      clientY: 150,
      preventDefault() {},
      stopPropagation() {},
    } as unknown as React.PointerEvent);
    window.dispatchEvent(makePointerEvent('pointermove', { clientX: 360, clientY: 150 }));
  });
  assert.equal(boxNode.style.width, '260px');
  assert.equal(getSession()?.kind, 'resizing');

  await act(() => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  });
  assert.equal(getSession()?.kind, 'idle');
  assert.equal(boxNode.style.width, '');
  assert.equal(useElementStore.getState().elements[0]?.styles?.default?.width, undefined);

  // 2) Start resize, drag, release -> commits single updateElement
  await act(() => {
    apiRef.current?.startResize(box, boxNode, 'e', {
      button: 0,
      clientX: 300,
      clientY: 150,
      preventDefault() {},
      stopPropagation() {},
    } as unknown as React.PointerEvent);
    window.dispatchEvent(makePointerEvent('pointermove', { clientX: 380, clientY: 150 }));
    window.dispatchEvent(makePointerEvent('pointerup', { clientX: 380, clientY: 150 }));
  });
  assert.equal(getSession()?.kind, 'idle');
  assert.equal(useElementStore.getState().elements[0]?.styles?.default?.width, '280px');
});

test('startSpacing seeds from getComputedStyle, reverts inline "" on Escape, and commits on pointerup', async () => {
  const item = makeText('item');
  useElementStore.getState().setElements([item], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'item', 'data-element-type': 'Text' }),
    );
  }

  const r = await render(h(Host));
  const itemNode = $q<HTMLElement>(r.container, '[data-element-id="item"]');
  const view = itemNode.ownerDocument.defaultView ?? window;
  const origGetComputedStyle = view.getComputedStyle;
  view.getComputedStyle = ((el: Element) => {
    if (el === itemNode) {
      return {
        paddingTop: '32px',
        paddingRight: '32px',
        paddingBottom: '32px',
        paddingLeft: '32px',
        marginTop: '0px',
        marginRight: '0px',
        marginBottom: '0px',
        marginLeft: '0px',
        gap: '0px',
        rowGap: '0px',
        columnGap: '0px',
        display: 'block',
        flexDirection: 'row',
        gridTemplateColumns: 'none',
      } as unknown as CSSStyleDeclaration;
    }
    return origGetComputedStyle.call(view, el);
  }) as typeof view.getComputedStyle;

  try {
    const getSession = () => apiRef.current?.session;

    // 1) Drag padding-top +10px inward (32 -> 42), then Escape -> reverts to ""
    await act(() => {
      apiRef.current?.startSpacing(item, itemNode, 'padding-top', {
        button: 0,
        clientX: 50,
        clientY: 50,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 50, clientY: 60 }));
    });
    const active = getSession();
    assert.equal(active?.kind, 'spacing');
    if (active?.kind === 'spacing') {
      assert.equal(active.preview.padding.top, 42);
    }
    assert.equal(itemNode.style.paddingTop, '42px');

    await act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    assert.equal(getSession()?.kind, 'idle');
    assert.equal(itemNode.style.paddingTop, '');
    assert.equal(useElementStore.getState().elements[0]?.styles?.default?.paddingTop, undefined);

    // 2) Drag padding-top +8px inward (32 -> 40), then pointerup -> commits 40px
    await act(() => {
      apiRef.current?.startSpacing(item, itemNode, 'padding-top', {
        button: 0,
        clientX: 50,
        clientY: 50,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 50, clientY: 58 }));
      window.dispatchEvent(makePointerEvent('pointerup', { clientX: 50, clientY: 58 }));
    });
    assert.equal(getSession()?.kind, 'idle');
    assert.equal(useElementStore.getState().elements[0]?.styles?.default?.paddingTop, '40px');
  } finally {
    view.getComputedStyle = origGetComputedStyle;
  }
});

test('pointer drag aborts without committing on pointercancel and window blur', async () => {
  const box = makeFrame('box', []);
  useElementStore.getState().setElements([box], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'box', 'data-element-type': 'Frame' }),
    );
  }

  const r = await render(h(Host));
  const rootNode = $q<HTMLElement>(r.container, '[data-canvas-root]');
  const boxNode = $q<HTMLElement>(r.container, '[data-element-id="box"]');
  rootNode.getBoundingClientRect = () => makeRect(0, 0, 1000, 600);
  boxNode.getBoundingClientRect = () => makeRect(100, 100, 200, 100);

  for (const abort of [
    () => window.dispatchEvent(makePointerEvent('pointercancel', { clientX: 360, clientY: 150 })),
    () => {
      document.hasFocus = () => false;
      window.dispatchEvent(new Event('blur'));
    },
  ]) {
    await act(() => {
      apiRef.current?.startResize(box, boxNode, 'e', {
        button: 0,
        clientX: 300,
        clientY: 150,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 360, clientY: 150 }));
    });
    assert.equal(boxNode.style.width, '260px');
    await act(() => {
      abort();
    });
    assert.equal(apiRef.current?.session.kind, 'idle');
    assert.equal(boxNode.style.width, '');
    assert.equal(useElementStore.getState().elements[0]?.styles?.default?.width, undefined);
    // The listeners are gone: a later pointerup must not commit anything.
    await act(() => {
      window.dispatchEvent(makePointerEvent('pointerup', { clientX: 360, clientY: 150 }));
    });
    assert.equal(useElementStore.getState().elements[0]?.styles?.default?.width, undefined);
  }
});

test('click selects the element and Alt+click selects its parent, clearing text editing', async () => {
  const child = makeText('child', 'parent');
  const parent = makeFrame('parent', [child]);
  useElementStore.getState().setElements([parent], true);
  useSelectionStore.setState({ selectedElementId: 'other', editingElementId: 'other' });

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h(
        'div',
        { 'data-element-id': 'parent', 'data-element-type': 'Frame' },
        h('div', { 'data-element-id': 'child', 'data-element-type': 'Text' }, 'child'),
      ),
    );
  }

  const r = await render(h(Host));
  const childNode = $q<HTMLElement>(r.container, '[data-element-id="child"]');
  const click = async (altKey: boolean) => {
    await act(() => {
      apiRef.current?.handleCanvasPointerDown({
        button: 0,
        clientX: 10,
        clientY: 10,
        altKey,
        target: childNode,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
      window.dispatchEvent(makePointerEvent('pointerup', { clientX: 10, clientY: 10 }));
    });
  };

  await click(false);
  assert.equal(useSelectionStore.getState().selectedElementId, 'child');
  assert.equal(useSelectionStore.getState().editingElementId, undefined);

  await click(true);
  assert.equal(useSelectionStore.getState().selectedElementId, 'parent');
});

test('refreshMove re-runs drop hit-testing at the last pointer position without a new pointermove', async () => {
  const a = makeText('a');
  const b = makeText('b');
  const c = makeText('c');
  useElementStore.getState().setElements([a, b, c], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };

  function Host() {
    const [root, setRoot] = React.useState<HTMLDivElement | null>(null);
    apiRef.current = useCanvasManipulation({ root, canEdit: true, picking: false });
    return h(
      'div',
      { ref: setRoot, 'data-canvas-root': true },
      h('div', { 'data-element-id': 'a', 'data-element-type': 'Text' }, 'a'),
      h('div', { 'data-element-id': 'b', 'data-element-type': 'Text' }, 'b'),
      h('div', { 'data-element-id': 'c', 'data-element-type': 'Text' }, 'c'),
    );
  }

  const r = await render(h(Host));
  const nodeA = $q<HTMLElement>(r.container, '[data-element-id="a"]');
  const nodeB = $q<HTMLElement>(r.container, '[data-element-id="b"]');
  const nodeC = $q<HTMLElement>(r.container, '[data-element-id="c"]');
  nodeA.getBoundingClientRect = () => makeRect(0, 0, 200, 40);
  nodeB.getBoundingClientRect = () => makeRect(0, 50, 200, 40);
  nodeC.getBoundingClientRect = () => makeRect(0, 100, 200, 40);

  const doc = nodeA.ownerDocument as Document & {
    elementsFromPoint?: (x: number, y: number) => Element[];
  };
  const prevEfp = doc.elementsFromPoint;
  let stack: Element[] = [nodeC];
  doc.elementsFromPoint = () => stack;

  try {
    await act(() => {
      apiRef.current?.handleCanvasPointerDown({
        button: 0,
        clientX: 20,
        clientY: 20,
        target: nodeA,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
    });
    await act(() => {
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 20, clientY: 135 }));
    });
    const before = apiRef.current?.session;
    assert.equal(before?.kind === 'moving' ? before.target?.targetId : undefined, 'c');

    // The page scrolled under a still pointer: a different element is now hit.
    stack = [nodeB];
    await act(() => {
      apiRef.current?.refreshMove();
    });
    const after = apiRef.current?.session;
    assert.equal(after?.kind === 'moving' ? after.target?.targetId : undefined, 'b');

    await act(() => {
      window.dispatchEvent(makePointerEvent('pointercancel'));
    });
    assert.equal(apiRef.current?.session.kind, 'idle');
    // No gesture left: refreshMove is a harmless no-op.
    await act(() => {
      apiRef.current?.refreshMove();
    });
    assert.equal(apiRef.current?.session.kind, 'idle');
  } finally {
    doc.elementsFromPoint = prevEfp;
  }
});

test('blur from cross-realm focus transfer does not cancel a gesture; losing focus everywhere does', async () => {
  const box = makeFrame('box', []);
  useElementStore.getState().setElements([box], true);

  const apiRef: { current: ReturnType<typeof useCanvasManipulation> | undefined } = {
    current: undefined,
  };
  function Host() {
    apiRef.current = useCanvasManipulation({ root: null, canEdit: true, picking: false });
    return null;
  }
  await render(h(Host));

  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const iframeDoc = iframe.contentDocument;
  assert.ok(iframeDoc, 'jsdom iframe document');
  const node = iframeDoc.createElement('div');
  iframeDoc.body.appendChild(node);
  node.getBoundingClientRect = () => makeRect(100, 100, 200, 100);
  const prevParentFocus = document.hasFocus;
  const prevIframeFocus = iframeDoc.hasFocus;

  try {
    await act(() => {
      apiRef.current?.startResize(box, node, 'e', {
        button: 0,
        clientX: 300,
        clientY: 150,
        preventDefault() {},
        stopPropagation() {},
      } as unknown as React.PointerEvent);
      window.dispatchEvent(makePointerEvent('pointermove', { clientX: 360, clientY: 150 }));
    });
    assert.equal(apiRef.current?.session.kind, 'resizing');
    assert.equal(node.style.width, '260px');

    // Focus moved from the parent into the iframe: the parent blurs, the iframe has focus.
    document.hasFocus = () => false;
    iframeDoc.hasFocus = () => true;
    await act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    assert.equal(apiRef.current?.session.kind, 'resizing');
    assert.equal(node.style.width, '260px');

    // Neither realm has focus any more: abort cleanly.
    iframeDoc.hasFocus = () => false;
    await act(() => {
      window.dispatchEvent(new Event('blur'));
    });
    assert.equal(apiRef.current?.session.kind, 'idle');
    assert.equal(node.style.width, '');
    assert.equal(useElementStore.getState().elements[0]?.styles?.default?.width, undefined);
  } finally {
    document.hasFocus = prevParentFocus;
    iframeDoc.hasFocus = prevIframeFocus;
    iframe.remove();
  }
});
