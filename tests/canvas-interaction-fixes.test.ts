import { afterEach, after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { redirectModules } from './support/test-stub-modules';
import { act, cleanup, React, render } from './support/sidebar-dom-harness';
import type { TextElement } from '@webbuilder/site-runtime/types/elements/elements';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
});

const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { getSelectedElement } = await import('../apps/editor/src/features/editor/store/selected-element');
const { useCanvasElement } = await import('../apps/editor/src/features/editor/components/elements/shared/useCanvasElement');
const { requestCaretAtPoint } = await import('../apps/editor/src/features/editor/components/elements/shared/caretRequest');
const { useFrameThrottledValue } = await import('../apps/editor/src/features/editor/components/canvas/useFrameThrottledValue');
const { EditorFlagsProvider } = await import('../apps/editor/src/features/editor/components/context/EditorFlagsContext');
const { CollaboratorRole } = await import('../apps/editor/src/features/collaboration/interfaces/collaboration.interface');

const h = React.createElement;

function makeText(id: string, content = id): TextElement {
  return { id, type: 'Text', content, pageId: 'page-1', styles: {}, tailwindStyles: '' };
}

beforeEach(() => {
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([], true);
  SelectionStore.getState().clearSelection();
});

afterEach(async () => {
  await cleanup();
  SelectionStore.getState().clearSelection();
  delete (document as unknown as Record<string, unknown>).caretPositionFromPoint;
});

after(cleanup);

// ---- M1 -------------------------------------------------------------------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test('useFrameThrottledValue commits once per frame with the latest value, and null at once', async () => {
  let renders = 0;
  let setter!: (value: number | null) => void;
  let current: number | null = null;
  function Probe(): null {
    const [value, set] = useFrameThrottledValue();
    renders += 1;
    setter = set;
    current = value;
    return null;
  }
  await render(h(Probe));
  const base = renders;

  await act(() => {
    for (let y = 1; y <= 50; y++) setter(y);
  });
  assert.equal(renders, base, 'no state commit per pointer event');
  assert.equal(current, null);

  await act(async () => {
    await sleep(30);
  });
  assert.equal(current, 50, 'the frame commits the latest value');
  assert.equal(renders, base + 1, 'one render for fifty events');

  await act(() => {
    setter(70);
    setter(null);
  });
  assert.equal(current, null, 'null commits immediately');
  await act(async () => {
    await sleep(30);
  });
  assert.equal(current, null, 'the cancelled frame does not resurrect the value');
});

test('CanvasStage memoizes the site content so pointer-frame state does not re-render it', () => {
  const source = readFileSync(
    new URL('../apps/editor/src/features/editor/components/canvas/CanvasStage.tsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /const siteContent = useMemo\(/);
  assert.match(source, /<SiteFrame[\s\S]*\{siteContent\}[\s\S]*<\/SiteFrame>/);
});

// ---- M3 -------------------------------------------------------------------

function Editable({ element }: { element: TextElement }): React.ReactElement {
  const { rootProps } = useCanvasElement(element);
  return h('div', { ...rootProps, tabIndex: 0 }, element.content);
}

async function mountEditable(content: string): Promise<{ node: HTMLElement }> {
  const element = makeText('el-1', content);
  ElementStore.getState().setElements([element], true);
  SelectionStore.getState().setSelectedElement(element);
  const r = await render(
    h(EditorFlagsProvider, {
      canEdit: true,
      isReadOnly: false,
      isLocked: false,
      permissionsRole: CollaboratorRole.OWNER,
      canCreate: true,
      children: h(Editable, { element }),
    }),
  );
  const node = r.container.querySelector<HTMLElement>('[data-element-id="el-1"]');
  assert.ok(node);
  return { node };
}

test('double click puts the caret at the click point when the document can resolve it', async () => {
  const { node } = await mountEditable('Hello world');
  const text = node.firstChild!;
  const calls: Array<[number, number]> = [];
  (document as unknown as Record<string, unknown>).caretPositionFromPoint = (x: number, y: number) => {
    calls.push([x, y]);
    return { offsetNode: text, offset: 5 };
  };

  requestCaretAtPoint('el-1', { x: 40, y: 12 });
  await act(() => {
    SelectionStore.getState().setEditingElementId('el-1');
  });

  assert.deepEqual(calls, [[40, 12]]);
  const range = window.getSelection()!.getRangeAt(0);
  assert.equal(range.collapsed, true);
  assert.equal(range.startContainer, text);
  assert.equal(range.startOffset, 5);
});

test('double click falls back to the end of the text without caret APIs or when the point misses the element', async () => {
  const { node } = await mountEditable('Hello world');
  requestCaretAtPoint('el-1', { x: 40, y: 12 });
  await act(() => {
    SelectionStore.getState().setEditingElementId('el-1');
  });
  let range = window.getSelection()!.getRangeAt(0);
  assert.equal(range.startContainer, node);
  assert.equal(range.startOffset, node.childNodes.length);
  assert.equal(range.collapsed, true);

  // Point resolves outside the element: still the end.
  await act(() => {
    SelectionStore.getState().setEditingElementId(undefined);
  });
  const outside = document.createElement('p');
  outside.textContent = 'elsewhere';
  document.body.appendChild(outside);
  (document as unknown as Record<string, unknown>).caretPositionFromPoint = () => ({
    offsetNode: outside.firstChild,
    offset: 3,
  });
  requestCaretAtPoint('el-1', { x: 1, y: 1 });
  await act(() => {
    SelectionStore.getState().setEditingElementId('el-1');
  });
  range = window.getSelection()!.getRangeAt(0);
  assert.equal(range.startContainer, node);
  outside.remove();
});

// ---- M4 -------------------------------------------------------------------

test('getSelectedElement ignores the hovered element', () => {
  const a = makeText('a');
  const b = makeText('b');
  ElementStore.getState().setElements([a, b], true);
  SelectionStore.getState().setHoveredElement(b);
  assert.equal(getSelectedElement(), undefined);
  SelectionStore.getState().setSelectedElement(a);
  assert.equal(getSelectedElement()?.id, 'a');
});

test('the context menu saves and replaces from the selection only', () => {
  const source = readFileSync(
    new URL('../apps/editor/src/features/editor/components/EditorContextMenu.tsx', import.meta.url),
    'utf8',
  );
  assert.equal(source.includes('getSelectedOrHoveredElement'), false);
  assert.equal(source.includes('setSaveElement(getSelectedElement())'), true);
  assert.equal(source.includes('setSource(getSelectedElement())'), true);
});
