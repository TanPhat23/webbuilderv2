import assert from 'node:assert/strict';
import { afterEach, beforeEach, test } from 'node:test';
import { redirectModules } from './support/test-stub-modules';
import { act, cleanup, React, render, win } from './support/sidebar-dom-harness';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
  sonner: './editor-logic-sonner-stub.ts',
});

const { ElementLabel } = await import('../apps/editor/src/features/editor/components/resizehandler/ElementLabel');
const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');

const h = React.createElement;
const el = (id: string, type: string, extra: Record<string, unknown> = {}): EditorElement =>
  ({ id, type, content: '', pageId: 'page-1', styles: {}, tailwindStyles: '', ...extra }) as unknown as EditorElement;

const image = el('image', 'Image', { parentId: 'card' });
const card = el('card', 'Frame', { parentId: 'section', elements: [image] });
const section = el('section', 'Section', { elements: [card] });

const mount = (element: EditorElement) =>
  render(h(ElementLabel, { element, showSpacingInfo: false, onToggleSpacing: () => {} }));
const button = (root: ParentNode): HTMLElement | null => root.querySelector<HTMLElement>('[data-action="select-parent"]');

beforeEach(async () => {
  await cleanup();
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([section], true);
  SelectionStore.getState().setSelectedElement(image);
});
afterEach(async () => {
  await cleanup();
  SelectionStore.getState().clearSelection();
});

test('a child shows a Select parent button before the type name', async () => {
  const r = await mount(image);
  const btn = button(r.container);
  assert.ok(btn);
  assert.equal(btn.tagName, 'BUTTON');
  assert.equal(btn.getAttribute('aria-label'), 'Select parent');
  assert.equal(btn.getAttribute('title'), 'Select parent (Esc)');
  assert.equal(btn.getAttribute('type'), 'button');
  assert.match(btn.className, /pointer-events-auto/);
  const typeName = Array.from(r.container.querySelectorAll('span')).find((s) => s.textContent === 'Image');
  assert.ok(typeName);
  assert.ok(btn.compareDocumentPosition(typeName) & win.Node.DOCUMENT_POSITION_FOLLOWING, 'button precedes the type name');
});

test('the root element has no Select parent button', async () => {
  const r = await mount(section);
  assert.equal(button(r.container), null);
});

test('an element that is not in the tree has no Select parent button', async () => {
  const r = await mount(el('ghost', 'Text'));
  assert.equal(button(r.container), null);
});

test('clicking selects the parent without bubbling pointerdown or click to the canvas', async () => {
  const seen: string[] = [];
  const r = await render(
    h('div', { onPointerDown: () => seen.push('pointerdown'), onClick: () => seen.push('click') },
      h(ElementLabel, { element: image, showSpacingInfo: false, onToggleSpacing: () => {} })),
  );
  const btn = button(r.container)!;
  await act(() => { btn.dispatchEvent(new win.Event('pointerdown', { bubbles: true, cancelable: true })); });
  await act(() => { btn.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'card');
  assert.deepEqual(seen, [], 'neither event reaches the canvas handlers');
});

test('clicking leaves inline text editing', async () => {
  SelectionStore.getState().setEditingElementId('image');
  const r = await mount(image);
  await act(() => { button(r.container)!.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'card');
  assert.equal(SelectionStore.getState().editingElementId, undefined);
});

test('repeated clicks as the HUD re-renders for the new selection climb to the root, where the button disappears', async () => {
  let current = image;
  const r = await mount(current);
  await act(() => { button(r.container)!.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'card');
  current = card;
  await cleanup();
  const r2 = await mount(current);
  await act(() => { button(r2.container)!.dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'section');
  await cleanup();
  const r3 = await mount(section);
  assert.equal(button(r3.container), null);
});
