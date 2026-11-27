import assert from 'node:assert/strict';
import { after, afterEach, beforeEach, test } from 'node:test';
import { redirectModules } from './support/test-stub-modules';
import { $q, act, cleanup, React, render, win } from './support/sidebar-dom-harness';
import type { EditorElement } from '@webbuilder/site-runtime/types/global.type';

redirectModules({
  '@clerk/tanstack-react-start': './test-clerk-stub.ts',
  '@clerk/tanstack-react-start/server': './test-clerk-server-stub.ts',
  '@tanstack/react-start': './test-start-stub.ts',
  '@tanstack/react-router': './editor-router-stub.ts',
  sonner: './editor-logic-sonner-stub.ts',
});

const { EditorContextMenu } = await import('../apps/editor/src/features/editor/components/EditorContextMenu');
const { EditorContext } = await import('../apps/editor/src/features/editor/context/EditorContext');
const { ElementStore } = await import('../apps/editor/src/features/editor/store/element-store');
const { SelectionStore } = await import('../apps/editor/src/features/editor/store/selection-store');
const { editorValue, withEditor } = await import('./support/sidebar-fixtures');
const { QueryClient, QueryClientProvider } = await import('@tanstack/react-query');

const h = React.createElement;
const el = (id: string, type: string, extra: Record<string, unknown> = {}): EditorElement =>
  ({ id, type, content: '', pageId: 'page-1', styles: {}, tailwindStyles: '', ...extra }) as unknown as EditorElement;

const text = el('text', 'Text', { parentId: 'card', content: 'Cardamom Kouign-Amann Deluxe Edition' });
const card = el('card', 'Frame', { parentId: 'section', elements: [text] });
const section = el('section', 'Section', { name: 'Menu', elements: [card] });
const lone = el('lone', 'Section');

const queryClient = new QueryClient({ defaultOptions: { queries: { gcTime: Infinity, retry: false } } });

async function mountMenu(options: { readOnly?: boolean } = {}) {
  const menu = h(EditorContextMenu, { isReadOnly: options.readOnly ?? false, children: h('div', { id: 'menu-target' }, 'target') });
  const r = await render(h(QueryClientProvider, { client: queryClient }, withEditor(editorValue({ isReadOnly: options.readOnly ?? false }), menu, EditorContext)));
  await act(() => {
    $q(r.container, '#menu-target').dispatchEvent(new win.MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 5, clientY: 5 }));
  });
  return r;
}

const action = (name: string): HTMLElement | null => document.querySelector<HTMLElement>('[data-action="' + name + '"]');
const needAction = (name: string): HTMLElement => {
  const node = action(name);
  assert.ok(node, 'data-action=' + name);
  return node;
};
const isDisabled = (node: HTMLElement): boolean => node.hasAttribute('data-disabled') || node.getAttribute('aria-disabled') === 'true';
const layerItems = (): HTMLElement[] =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-action^="select-layer-"]'));
const openLayers = () => act(() => { needAction('select-layer').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
const hovered = (): string | undefined => SelectionStore.getState().hoveredElementId;

beforeEach(async () => {
  await cleanup();
  ElementStore.getState().beginPage('proj-1', 'page-1', false);
  ElementStore.getState().setElements([section, lone], true);
  SelectionStore.getState().clearSelection();
  SelectionStore.getState().setSelectedElement(text);
});
afterEach(async () => {
  await cleanup();
  SelectionStore.getState().clearSelection();
});
after(() => queryClient.clear());

test('Select layer is the first menu entry, a submenu trigger with the stable data-action', async () => {
  await mountMenu();
  const trigger = needAction('select-layer');
  assert.equal(trigger.getAttribute('role'), 'menuitem');
  assert.equal(trigger.getAttribute('aria-haspopup'), 'menu');
  assert.match(trigger.textContent ?? '', /Select layer/);
  const items = Array.from($q(document.body, '[role="menu"]').querySelectorAll('[role="menuitem"]'));
  assert.equal(items[0], trigger, 'before the clipboard group');
  assert.ok(trigger.compareDocumentPosition(needAction('copy')) & win.Node.DOCUMENT_POSITION_FOLLOWING);
});

test('the submenu lists the element and every ancestor, innermost first, with type and short name or text', async () => {
  await mountMenu();
  await openLayers();
  assert.deepEqual(layerItems().map((i) => i.getAttribute('data-action')), ['select-layer-text', 'select-layer-card', 'select-layer-section']);
  assert.deepEqual(layerItems().map((i) => (i.textContent ?? '').trim()), ['Text "Cardamom Kouign-Amann D…"', 'Frame', 'Section "Menu"']);
  for (const item of layerItems()) assert.equal(item.getAttribute('role'), 'menuitem');
});

test('the currently selected layer is marked', async () => {
  await mountMenu();
  await openLayers();
  assert.deepEqual(layerItems().map((i) => i.getAttribute('data-current')), ['true', null, null]);
  assert.ok(needAction('select-layer-text').querySelector('svg.lucide-check'), 'check icon');
});

test('picking a layer selects that element and closes the menu', async () => {
  await mountMenu();
  await openLayers();
  await act(() => { needAction('select-layer-card').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'card');
  assert.equal(SelectionStore.getState().editingElementId, undefined);
  assert.equal(document.querySelector('[role="menu"]'), null, 'menu closed');
});

test('hovering or focusing a layer previews it on the canvas and leaving restores the previous hover', async () => {
  SelectionStore.setState({ hoveredElementId: 'text' });
  await mountMenu();
  await openLayers();
  const card_ = needAction('select-layer-card');
  const section_ = needAction('select-layer-section');

  await act(() => { card_.dispatchEvent(new win.PointerEvent('pointerover', { bubbles: true })); });
  assert.equal(hovered(), 'card');
  await act(() => { card_.dispatchEvent(new win.PointerEvent('pointerout', { bubbles: true })); });
  assert.equal(hovered(), 'text', 'restored');

  await act(() => { section_.focus(); });
  assert.equal(hovered(), 'section');
  await act(() => { section_.blur(); });
  assert.equal(hovered(), 'text', 'restored on blur');
  assert.equal(SelectionStore.getState().selectedElementId, 'text', 'previewing never selects');
});

test('moving between layers keeps previewing the latest and closing the menu restores the hover', async () => {
  await mountMenu();
  await openLayers();
  await act(() => { needAction('select-layer-card').focus(); });
  await act(() => { needAction('select-layer-section').focus(); });
  assert.equal(hovered(), 'section');
  await act(() => { document.dispatchEvent(new win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); });
  assert.equal(document.querySelector('[role="menu"]'), null);
  assert.equal(hovered(), undefined, 'the hover set by the preview does not outlive the menu');
});

test('a root element with no ancestors hides the submenu', async () => {
  SelectionStore.getState().setSelectedElement(lone);
  await mountMenu();
  assert.equal(action('select-layer'), null);
  assert.ok(action('copy'), 'the rest of the menu is intact');
});

test('without a selection the submenu is hidden', async () => {
  SelectionStore.getState().clearSelection();
  await mountMenu();
  assert.equal(action('select-layer'), null);
});

test('read-only: Select layer stays enabled and selecting works', async () => {
  await mountMenu({ readOnly: true });
  assert.equal(isDisabled(needAction('select-layer')), false);
  assert.equal(isDisabled(needAction('cut')), true, 'control: edit actions are disabled');
  await openLayers();
  assert.equal(isDisabled(needAction('select-layer-section')), false);
  await act(() => { needAction('select-layer-section').dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })); });
  assert.equal(SelectionStore.getState().selectedElementId, 'section');
});
