import { after, afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { act, cleanup, React, render } from './support/sidebar-dom-harness';
import type { FrameElement, TextElement } from '@webbuilder/site-runtime/types/elements/elements';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { ElementKeyboardActions } = await import('../apps/editor/src/features/editor/lib/keyBoardEvents');
const { useEditorShortcuts } = await import('../apps/editor/src/features/editor/hooks/useEditorShortcuts');

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
