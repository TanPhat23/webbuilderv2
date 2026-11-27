import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { redirectModules } from './support/test-stub-modules';
import { act, cleanup, React, render } from './support/sidebar-dom-harness';
import type { FrameElement, TextElement } from '@webbuilder/site-runtime/types/elements/elements';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { ElementKeyboardActions } = await import('../apps/editor/src/features/editor/lib/keyBoardEvents');
const { useEditorShortcuts } = await import('../apps/editor/src/features/editor/hooks/useEditorShortcuts');

const { useCanvasElement } = await import(
  '../apps/editor/src/features/editor/components/elements/shared/useCanvasElement'
);
const { EditorFlagsProvider } = await import(
  '../apps/editor/src/features/editor/components/context/EditorFlagsContext'
);
const { CollaboratorRole } = await import(
  '../apps/editor/src/features/collaboration/interfaces/collaboration.interface'
);

const h = React.createElement;

function makeText(id: string, parentId?: string): TextElement {
  return { id, type: 'Text', content: id, pageId: 'page-1', parentId, styles: {}, tailwindStyles: '' };
}

function makeFrame(id: string, children: EditorElement[] = []): FrameElement {
  return {
    id,
    type: 'Frame',
    content: '',
    pageId: 'page-1',
    styles: {},
    tailwindStyles: '',
    elements: children,
  } as FrameElement;
}

function installSessionStorage(): () => void {
  const prev = Object.getOwnPropertyDescriptor(globalThis, 'sessionStorage');
  const store = new Map<string, string>();
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => void store.set(k, v),
      removeItem: (k: string) => void store.delete(k),
      clear: () => store.clear(),
    },
  });
  return () => {
    if (prev) Object.defineProperty(globalThis, 'sessionStorage', prev);
    else delete (globalThis as Record<string, unknown>).sessionStorage;
  };
}

function ids(elements: readonly EditorElement[]): string[] {
  return elements.map((e) => e.id);
}

function childrenOf(element: EditorElement | undefined): EditorElement[] {
  return element && 'elements' in element && Array.isArray(element.elements)
    ? (element.elements as EditorElement[])
    : [];
}

function pressKey(
  target: EventTarget,
  key: string,
  init: KeyboardEventInit = {},
): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
}

function Shortcuts(): null {
  const stageRef = React.useRef<HTMLElement | null>(null);
  useEditorShortcuts({ stageRef, mountNode: null, isReadOnly: false, isLocked: false });
  return null;
}

let restoreStorage: (() => void) | undefined;

beforeEach(() => {
  restoreStorage = installSessionStorage();
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([], true);
  SelectionStore.getState().clearSelection();
});

afterEach(async () => {
  await cleanup();
  restoreStorage?.();
  SelectionStore.getState().clearSelection();
});

after(cleanup);

test('Delete and Backspace never fall back to the hovered element when nothing is selected', async () => {
  ElementStore.getState().setElements([makeText('el-1')], true);
  SelectionStore.getState().setHoveredElement(makeText('el-1'));
  await render(h(Shortcuts));

  await act(() => {
    pressKey(document, 'Delete');
    pressKey(document, 'Backspace');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);

  // Control: the same key does delete once the element is actually selected.
  SelectionStore.getState().setSelectedElement(makeText('el-1'));
  await act(() => {
    pressKey(document, 'Delete');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), []);
});

test('Delete and Backspace are ignored while editing text or typing in a field', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  await render(h(Shortcuts));

  // editingElementId set
  SelectionStore.getState().setEditingElementId('el-1');
  await act(() => {
    pressKey(document, 'Delete');
    pressKey(document, 'Backspace');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);
  SelectionStore.getState().setEditingElementId(undefined);

  // focus inside a contentEditable node
  const editable = document.createElement('div');
  Object.defineProperty(editable, 'isContentEditable', { value: true });
  document.body.appendChild(editable);
  await act(() => {
    pressKey(editable, 'Delete');
    pressKey(editable, 'Backspace');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);

  // focus inside an input
  const input = document.createElement('input');
  document.body.appendChild(input);
  await act(() => {
    pressKey(input, 'Delete');
    pressKey(input, 'Backspace');
    pressKey(input, 'x', { ctrlKey: true });
  });
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);
  editable.remove();
  input.remove();
});

test('clipboard shortcuts never act on a hovered element and are blocked while editing', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setHoveredElement(el);
  await render(h(Shortcuts));

  await act(() => {
    pressKey(document, 'c', { ctrlKey: true });
    pressKey(document, 'x', { ctrlKey: true });
  });
  assert.equal(sessionStorage.getItem('copiedElement'), null);
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);

  SelectionStore.getState().setSelectedElement(el);
  SelectionStore.getState().setEditingElementId('el-1');
  await act(() => {
    pressKey(document, 'c', { ctrlKey: true });
    pressKey(document, 'x', { metaKey: true });
  });
  assert.equal(sessionStorage.getItem('copiedElement'), null);
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);
});

test('Escape steps out of text editing, then up to the parent, then clears selection', () => {
  const child = makeText('child', 'parent');
  const parent = makeFrame('parent', [child]);
  ElementStore.getState().setElements([parent], true);
  SelectionStore.getState().setSelectedElement(child);
  SelectionStore.getState().setEditingElementId('child');

  const kb = new ElementKeyboardActions();
  kb.stepOutSelection();
  assert.equal(SelectionStore.getState().editingElementId, undefined);
  assert.equal(SelectionStore.getState().selectedElementId, 'child');

  kb.stepOutSelection();
  assert.equal(SelectionStore.getState().selectedElementId, 'parent');

  kb.stepOutSelection();
  assert.equal(SelectionStore.getState().selectedElementId, undefined);
});

test('Escape through the hook steps out of editing but leaves typing in unrelated inputs alone', async () => {
  const child = makeText('child', 'parent');
  ElementStore.getState().setElements([makeFrame('parent', [child])], true);
  SelectionStore.getState().setSelectedElement(child);
  await render(h(Shortcuts));

  const input = document.createElement('input');
  document.body.appendChild(input);
  await act(() => {
    pressKey(input, 'Escape');
  });
  assert.equal(SelectionStore.getState().selectedElementId, 'child');
  input.remove();

  SelectionStore.getState().setEditingElementId('child');
  await act(() => {
    pressKey(document, 'Escape');
  });
  assert.equal(SelectionStore.getState().editingElementId, undefined);
  assert.equal(SelectionStore.getState().selectedElementId, 'child');
});

test('pasteElement inserts inside a selected container, after a selected leaf, and at the root otherwise', () => {
  const copied = makeText('copied');
  sessionStorage.setItem('copiedElement', JSON.stringify(copied));
  sessionStorage.setItem('copiedElementProject', 'proj-1');
  const kb = new ElementKeyboardActions();

  // container selected -> inside
  const inner = makeText('inner', 'box');
  const box = makeFrame('box', [inner]);
  const tail = makeText('tail');
  ElementStore.getState().setElements([box, tail], true);
  SelectionStore.getState().setSelectedElement(box);
  kb.pasteElement();
  let state = ElementStore.getState().elements;
  assert.deepEqual(ids(state), ['box', 'tail']);
  assert.equal(childrenOf(state[0]).length, 2);
  assert.equal(childrenOf(state[0])[0]?.id, 'inner');
  assert.equal(childrenOf(state[0])[1]?.content, 'copied');

  // leaf selected -> after
  ElementStore.getState().setElements([makeText('lead'), makeText('mid'), makeText('end')], true);
  SelectionStore.getState().setSelectedElement(makeText('lead'));
  kb.pasteElement();
  state = ElementStore.getState().elements;
  assert.equal(state.length, 4);
  assert.equal(state[0]?.id, 'lead');
  assert.equal(state[1]?.content, 'copied');
  assert.equal(state[2]?.id, 'mid');

  // nothing selected -> appended to the root
  ElementStore.getState().setElements([makeText('only')], true);
  SelectionStore.getState().clearSelection();
  kb.pasteElement();
  state = ElementStore.getState().elements;
  assert.equal(state.length, 2);
  assert.equal(state[1]?.content, 'copied');
});

test('Ctrl+Shift+Z and Meta+Shift+Z redo, Ctrl+Z undoes', async () => {
  const calls: string[] = [];
  const original = { undo: ElementStore.getState().undo, redo: ElementStore.getState().redo };
  ElementStore.setState({
    undo: () => {
      calls.push('undo');
      return ElementStore.getState();
    },
    redo: () => {
      calls.push('redo');
      return ElementStore.getState();
    },
  });
  try {
    await render(h(Shortcuts));
    await act(() => {
      pressKey(document, 'Z', { ctrlKey: true, shiftKey: true });
      pressKey(document, 'z', { metaKey: true, shiftKey: true });
      pressKey(document, 'z', { ctrlKey: true });
    });
    assert.deepEqual(calls, ['redo', 'redo', 'undo']);
  } finally {
    ElementStore.setState(original);
  }
});

test('Escape on a focused contentEditable node commits the text, leaves editing, and keeps the selection', async () => {
  const child = makeText('child', 'parent');
  ElementStore.getState().setElements([makeFrame('parent', [child])], true);
  SelectionStore.getState().setSelectedElement(child);
  SelectionStore.getState().setEditingElementId('child');

  function Editable(): React.ReactElement {
    const { rootProps } = useCanvasElement(child);
    return h('div', { ...rootProps, tabIndex: 0 }, 'child');
  }
  const r = await render(
    h(EditorFlagsProvider, {
      canEdit: true,
      isReadOnly: false,
      isLocked: false,
      permissionsRole: CollaboratorRole.OWNER,
      canCreate: true,
      children: h(React.Fragment, null, h(Shortcuts), h(Editable)),
    }),
  );
  const node = r.container.querySelector<HTMLElement>('[data-element-id="child"]');
  assert.ok(node);
  assert.equal(node.getAttribute('contenteditable'), 'true');
  assert.equal(document.activeElement, node, 'editing focuses the node');

  node.textContent = 'Edited';
  await act(() => {
    pressKey(node, 'Escape');
  });

  assert.equal(SelectionStore.getState().editingElementId, undefined);
  assert.equal(SelectionStore.getState().selectedElementId, 'child', 'selection is kept, not stepped up to the parent');
  const saved = childrenOf(ElementStore.getState().elements[0])[0];
  assert.equal(saved?.content, 'Edited');
  assert.equal(node.getAttribute('contenteditable'), null);
});


function ScopedShortcuts({ mountNode, readOnly = false }: { mountNode?: HTMLElement | null; readOnly?: boolean }): React.ReactElement {
  const stageRef = React.useRef<HTMLElement | null>(null);
  useEditorShortcuts({ stageRef, mountNode: mountNode ?? null, isReadOnly: readOnly, isLocked: false });
  return h(
    'div',
    null,
    h('button', { id: 'sidebar-btn' }, 'sidebar'),
    h('p', { id: 'outside-text' }, 'some page text'),
    h('div', { role: 'dialog', id: 'dlg' }, h('span', { id: 'dlg-child' }, 'dialog')),
    h('div', { role: 'menu', id: 'menu' }, h('span', { id: 'menu-item', role: 'menuitem' }, 'item')),
    h('div', { role: 'listbox', id: 'listbox' }, 'list'),
    h('section', { ref: stageRef as React.RefObject<HTMLElement>, id: 'stage' }, h('span', { id: 'stage-child' }, 'canvas text')),
  );
}

function selectElementText(el: Element): void {
  const selection = window.getSelection();
  assert.ok(selection);
  selection.removeAllRanges();
  selection.selectAllChildren(el);
}

test('Delete and Backspace only act on the canvas, not on sidebar controls or the document at large', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  const r = await render(h(ScopedShortcuts));
  const sidebar = r.container.querySelector('#sidebar-btn')!;

  let event!: KeyboardEvent;
  await act(() => {
    event = pressKey(sidebar, 'Backspace');
    pressKey(sidebar, 'Delete');
  });
  assert.equal(event.defaultPrevented, false);
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);

  // Control: a key press from inside the stage deletes the selected element.
  await act(() => {
    pressKey(r.container.querySelector('#stage-child')!, 'Delete');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), []);

  // Control: a key press with nothing focused (document.body) is canvas-scoped.
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  await act(() => {
    pressKey(document.body, 'Backspace');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), []);
});

test('keys from dialogs, menus, listboxes and menu items are ignored, including Escape', async () => {
  const child = makeText('child', 'parent');
  ElementStore.getState().setElements([makeFrame('parent', [child])], true);
  SelectionStore.getState().setSelectedElement(child);
  const r = await render(h(ScopedShortcuts));

  await act(() => {
    for (const sel of ['#dlg-child', '#dlg', '#menu-item', '#menu', '#listbox']) {
      const node = r.container.querySelector(sel)!;
      pressKey(node, 'Escape');
      pressKey(node, 'Delete');
    }
  });
  assert.equal(SelectionStore.getState().selectedElementId, 'child', 'Escape in an overlay does not step out');
  assert.equal(childrenOf(ElementStore.getState().elements[0]).length, 1);

  // Control: Escape from the body steps out one level.
  await act(() => {
    pressKey(document.body, 'Escape');
  });
  assert.equal(SelectionStore.getState().selectedElementId, 'parent');
});

test('events another handler already prevented are ignored', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  const r = await render(h(ScopedShortcuts));
  const stageChild = r.container.querySelector('#stage-child')!;
  const stop = (e: Event): void => e.preventDefault();
  // Registered on the element, so it runs before the document-level handler.
  stageChild.addEventListener('keydown', stop);
  await act(() => {
    pressKey(stageChild, 'Delete');
  });
  stageChild.removeEventListener('keydown', stop);
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);
});

test('copy and cut keep the native behaviour when text is selected outside the canvas', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  const r = await render(h(ScopedShortcuts));

  selectElementText(r.container.querySelector('#outside-text')!);
  let copy!: KeyboardEvent;
  let cut!: KeyboardEvent;
  await act(() => {
    copy = pressKey(document.body, 'c', { ctrlKey: true });
    cut = pressKey(document.body, 'x', { metaKey: true });
  });
  assert.equal(copy.defaultPrevented, false);
  assert.equal(cut.defaultPrevented, false);
  assert.equal(sessionStorage.getItem('copiedElement'), null);
  assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);

  // A collapsed selection is not "text selected": copy acts on the element.
  window.getSelection()!.removeAllRanges();
  await act(() => {
    copy = pressKey(document.body, 'c', { ctrlKey: true });
  });
  assert.equal(copy.defaultPrevented, true);
  assert.ok(sessionStorage.getItem('copiedElement'));

  // Text selected inside the stage is canvas text, so the element is copied.
  sessionStorage.removeItem('copiedElement');
  selectElementText(r.container.querySelector('#stage-child')!);
  await act(() => {
    pressKey(document.body, 'c', { ctrlKey: true });
  });
  assert.ok(sessionStorage.getItem('copiedElement'));
  window.getSelection()!.removeAllRanges();
});

test('shortcuts from the iframe document act on the canvas', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  SelectionStore.getState().setSelectedElement(el);
  const frameDoc = document.implementation.createHTMLDocument('frame');
  const mount = frameDoc.createElement('div');
  frameDoc.body.appendChild(mount);
  await render(h(ScopedShortcuts, { mountNode: mount }));

  await act(() => {
    pressKey(mount, 'Delete');
  });
  assert.deepEqual(ids(ElementStore.getState().elements), []);
});

test('read-only shortcuts stay silent when nothing is selected and toast when something is', async () => {
  const el = makeText('el-1');
  ElementStore.getState().setElements([el], true);
  const toastMod = await import('sonner');
  const original = toastMod.toast.error;
  const calls: unknown[] = [];
  (toastMod.toast as { error: unknown }).error = (...args: unknown[]) => {
    calls.push(args[0]);
  };
  try {
    const kb = new ElementKeyboardActions();
    kb.setReadOnly(true);
    kb.deleteElement();
    kb.cutElement();
    kb.bringToFront();
    kb.sendToBack();
    kb.pasteElement();
    assert.deepEqual(calls, [], 'no toasts with nothing selected or copied');

    SelectionStore.getState().setSelectedElement(el);
    kb.deleteElement();
    assert.equal(calls.length, 1);
    assert.deepEqual(ids(ElementStore.getState().elements), ['el-1']);
  } finally {
    (toastMod.toast as { error: unknown }).error = original;
  }
});
