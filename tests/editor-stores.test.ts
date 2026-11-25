import { after, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';

// Persisted stores read `localStorage` at import time, so install it first.
const backing = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (k: string) => backing.get(k) ?? null,
    setItem: (k: string, v: string) => void backing.set(k, v),
    removeItem: (k: string) => void backing.delete(k),
    clear: () => backing.clear(),
  },
});

const { useEventModeStore } = await import('../src/features/editor/store/event-mode-store');
const { MouseStore, useMouseStore } = await import('../src/features/editor/store/mouse-store');
const { useImageStore } = await import('../src/features/images/store/image-store');
const { useElementStore } = await import('../src/features/editor/store/element-store');
const { useSelectionStore } = await import('../src/features/editor/store/selection-store');
const selectors = await import('../src/features/editor/store/selectors/selection-selectors');
const { elementTree } = await import('../src/features/elements/lib/element-tree-helper');
const { disposeClients, renderHook } = await import('./support/test-hook-harness');

after(disposeClients);

const img = (imageId: string, extra: Record<string, unknown> = {}) =>
  ({ imageId, name: imageId, ...extra }) as never;
const node = (id: string, type = 'Frame', elements?: unknown[]) =>
  ({ id, type, content: '', pageId: 'p', ...(elements ? { elements } : {}) }) as never;

beforeEach(() => backing.clear());

test('event mode can be switched on, off and toggled', () => {
  const s = useEventModeStore;
  s.setState({ isEventModeEnabled: false });
  s.getState().setEventModeEnabled(true);
  assert.equal(s.getState().isEventModeEnabled, true);
  s.getState().toggleEventMode();
  assert.equal(s.getState().isEventModeEnabled, false);
  s.getState().toggleEventMode();
  assert.equal(s.getState().isEventModeEnabled, true);
});

test('per-element event overrides are tracked immutably', () => {
  const s = useEventModeStore;
  s.getState().clearDisabledElements();
  const before = s.getState().disabledElementEvents;
  s.getState().disableElementEvents('a');
  assert.notEqual(s.getState().disabledElementEvents, before, 'a new Set is created');
  assert.equal(before.has('a'), false);
  assert.equal(s.getState().isElementEventsDisabled('a'), true);
  assert.equal(s.getState().isElementEventsDisabled('b'), false);

  s.getState().toggleElementEvents('b');
  assert.equal(s.getState().isElementEventsDisabled('b'), true);
  s.getState().toggleElementEvents('b');
  assert.equal(s.getState().isElementEventsDisabled('b'), false);

  s.getState().enableElementEvents('a');
  assert.equal(s.getState().isElementEventsDisabled('a'), false);

  s.getState().disableElementEvents('c');
  s.getState().clearDisabledElements();
  assert.equal(s.getState().disabledElementEvents.size, 0);
});

test('event mode persists to localStorage with the Set serialised as an array', () => {
  useEventModeStore.setState({ isEventModeEnabled: true, disabledElementEvents: new Set(['x', 'y']) });
  const saved = JSON.parse(backing.get('event-mode-store')!);
  assert.equal(saved.state.isEventModeEnabled, true);
  assert.deepEqual(saved.state.disabledElementEvents, ['x', 'y']);
});

test('event mode rehydrates from storage, tolerating corrupt entries', async () => {
  backing.set(
    'event-mode-store',
    JSON.stringify({ state: { isEventModeEnabled: true, disabledElementEvents: ['q'] }, version: 0 }),
  );
  await useEventModeStore.persist.rehydrate();
  assert.equal(useEventModeStore.getState().isEventModeEnabled, true);
  assert.equal(useEventModeStore.getState().isElementEventsDisabled('q'), true);

  useEventModeStore.setState({ isEventModeEnabled: false });
  backing.set('event-mode-store', '{broken');
  await useEventModeStore.persist.rehydrate();
  assert.equal(useEventModeStore.getState().isEventModeEnabled, false, 'corrupt entry leaves state alone');

  backing.delete('event-mode-store');
  await useEventModeStore.persist.rehydrate();
  assert.equal(useEventModeStore.getState().isEventModeEnabled, false);

  useEventModeStore.persist.clearStorage();
  assert.equal(backing.has('event-mode-store'), false);
});

test('mouse store tracks cursors, selections and users per collaborator', () => {
  const s = MouseStore;
  assert.equal(s, useMouseStore);
  s.getState().clear();
  s.getState().updateMousePosition('a', { x: 1, y: 2 });
  s.getState().updateMousePosition('b', { x: 3, y: 4 });
  assert.deepEqual(s.getState().mousePositions, { a: { x: 1, y: 2 }, b: { x: 3, y: 4 } });
  s.getState().removeMousePosition('a');
  assert.deepEqual(Object.keys(s.getState().mousePositions), ['b']);

  s.getState().setSelectedElement('a', 'el-1');
  s.getState().setSelectedElement('b', 'el-2');
  s.getState().removeSelectedElement('a');
  assert.deepEqual(s.getState().selectedElements, { b: 'el-2' });

  s.getState().setUsers({ a: { id: 'a' } as never, b: { id: 'b' } as never });
  s.getState().removeUser('a');
  assert.deepEqual(Object.keys(s.getState().users), ['b']);

  s.getState().setMousePositions({ z: { x: 0, y: 0 } });
  s.getState().setSelectedElements({ z: 'e' });
  s.getState().setRemoteUsers({ r: { x: 9, y: 9 } });
  s.getState().setSelectedByUser({ r: 'e9' });
  assert.deepEqual(s.getState().mousePositions, { z: { x: 0, y: 0 } });
  assert.deepEqual(s.getState().selectedElements, { z: 'e' });
  assert.deepEqual(s.getState().remoteUsers, { r: { x: 9, y: 9 } });
  assert.deepEqual(s.getState().selectedByUser, { r: 'e9' });

  s.getState().clear();
  assert.deepEqual(
    [s.getState().mousePositions, s.getState().selectedElements, s.getState().users, s.getState().remoteUsers, s.getState().selectedByUser],
    [{}, {}, {}, {}, {}],
  );
});

test('syncFromPresence mirrors remote cursors and selections', () => {
  const s = MouseStore;
  s.getState().clear();
  s.getState().setRemoteUsers({ stale: { x: 1, y: 1 } });

  s.getState().syncFromPresence(null);
  s.getState().syncFromPresence({});
  assert.deepEqual(s.getState().remoteUsers, { stale: { x: 1, y: 1 } }, 'missing awareness is a no-op');

  s.getState().syncFromPresence({
    getStates: () =>
      new Map<unknown, never>([
        [1, { cursor: { x: 10, y: 20 }, selectedElement: 'e1' } as never],
        [2, { cursor: {} } as never],
        [3, { selectedElement: 'e3' } as never],
        [4, undefined as never],
        [5, {} as never],
      ]),
  });
  assert.deepEqual(s.getState().remoteUsers, { 1: { x: 10, y: 20 }, 2: { x: 0, y: 0 } });
  assert.deepEqual(s.getState().selectedByUser, { 1: 'e1', 3: 'e3' });
});

test('image selection store de-duplicates and manages selected images', () => {
  const s = useImageStore;
  s.getState().clearSelectedImages();
  s.getState().selectImage(img('a'));
  s.getState().selectImage(img('a'));
  s.getState().selectImage(img('b'));
  assert.deepEqual(s.getState().selectedImages.map((i) => i.imageId), ['a', 'b']);
  assert.equal(s.getState().isImageSelected('a'), true);
  assert.equal(s.getState().isImageSelected('z'), false);

  s.getState().toggleImageSelection(img('c'));
  assert.equal(s.getState().isImageSelected('c'), true);
  s.getState().toggleImageSelection(img('c'));
  assert.equal(s.getState().isImageSelected('c'), false);

  s.getState().updateImageInStore('a', { name: 'renamed' } as never);
  assert.equal((s.getState().selectedImages[0] as unknown as { name: string }).name, 'renamed');
  assert.equal((s.getState().selectedImages[1] as unknown as { name: string }).name, 'b');

  s.getState().deselectImage('a');
  assert.deepEqual(s.getState().selectedImages.map((i) => i.imageId), ['b']);
  s.getState().selectImage(img('d'));
  s.getState().removeDeletedImages(['b', 'nope']);
  assert.deepEqual(s.getState().selectedImages.map((i) => i.imageId), ['d']);

  const saved = JSON.parse(backing.get('image-selection-storage')!);
  assert.deepEqual(Object.keys(saved.state), ['selectedImages'], 'only the selection is persisted');
  s.getState().clearSelectedImages();
  assert.deepEqual(s.getState().selectedImages, []);
});

/**
 * zustand renders from `getInitialState()` on the server, so `setState` is not
 * visible to `renderToStaticMarkup`. Patch the initial snapshot for one render.
 */
function withState<S extends object, T>(
  store: { getInitialState: () => S },
  patch: Partial<S>,
  run: () => T,
): T {
  const initial = store.getInitialState() as Record<string, unknown>;
  const saved = Object.fromEntries(Object.keys(patch).map((k) => [k, initial[k]]));
  Object.assign(initial, patch);
  try {
    return run();
  } finally {
    Object.assign(initial, saved);
  }
}

test('selection selectors read ids, flags, elements and drag state from the stores', () => {
  const tree = [node('root', 'Frame', [node('child', 'Text'), node('other', 'Text')])];
  const empty = { selectedElementId: undefined, hoveredElementId: undefined, draggingElementId: undefined, draggedOverElementId: undefined };
  const picked = { selectedElementId: 'child', hoveredElementId: 'other', draggingElementId: 'child', draggedOverElementId: 'other' };

  const read = <T,>(hook: () => T, selection: Record<string, string | undefined> = picked) =>
    withState(useElementStore as never, { elements: tree } as never, () =>
      withState(useSelectionStore, selection as never, () => renderHook(hook).result),
    );

  assert.equal(read(() => selectors.useSelectedElementId(), empty), undefined);
  assert.equal(read(() => selectors.useSelectedElement(), empty), undefined);
  assert.equal(read(() => selectors.useElementById(undefined)), undefined);

  assert.equal(read(() => selectors.useSelectedElementId()), 'child');
  assert.equal(read(() => selectors.useHoveredElementId()), 'other');
  assert.equal(read(() => selectors.useDraggingElementId()), 'child');
  assert.equal(read(() => selectors.useIsSelected('child')), true);
  assert.equal(read(() => selectors.useIsSelected('other')), false);
  assert.equal(read(() => selectors.useIsHovered('other')), true);
  assert.equal(read(() => selectors.useIsHovered('child')), false);
  assert.equal(read(() => selectors.useElementById('root'))?.id, 'root');
  assert.equal(read(() => selectors.useElementById('child'))?.id, 'child');
  assert.equal(read(() => selectors.useElementById('missing')), undefined);
  assert.equal(read(() => selectors.useSelectedElement())?.id, 'child');

  const drag = read(() => selectors.useDragState());
  assert.equal(drag.draggingElement?.id, 'child');
  assert.equal(drag.draggedOverElement?.id, 'other');

  const combined = read(() => selectors.useDragAndSelectionState());
  assert.deepEqual(
    [combined.selectedElement?.id, combined.draggedOverElement?.id, combined.hoveredElement?.id],
    ['child', 'other', 'other'],
  );

  const withSetter = read(() => selectors.useSelectedElementWithSetter());
  assert.equal(withSetter.selectedElement?.id, 'child');
  const { setSelectedElement, setDraggingElement, setDraggedOverElement } = useSelectionStore.getState();
  assert.equal(withSetter.setSelectedElement, setSelectedElement);
  assert.equal(read(() => selectors.useSetSelectedElement()), setSelectedElement);
  assert.equal(read(() => selectors.useSetDraggedOverElement()), setDraggedOverElement);

  const actions = read(() => selectors.useDragActions());
  assert.equal(actions.setDraggingElement, setDraggingElement);
  assert.equal(actions.setDraggedOverElement, setDraggedOverElement);
});

test('elementTree.findLocation reports parent id and index, or undefined', () => {
  const tree = [
    node('a', 'Text'),
    node('b', 'Frame', [node('b1', 'Text'), node('b2', 'Frame', [node('b2a', 'Text')])]),
  ];
  assert.deepEqual(elementTree.findLocation(tree, 'a'), { parentId: null, index: 0 });
  assert.deepEqual(elementTree.findLocation(tree, 'b'), { parentId: null, index: 1 });
  assert.deepEqual(elementTree.findLocation(tree, 'b2'), { parentId: 'b', index: 1 });
  assert.deepEqual(elementTree.findLocation(tree, 'b2a'), { parentId: 'b2', index: 0 });
  assert.equal(elementTree.findLocation(tree, 'nope'), undefined);
});

test('elementTree.mapInsertAfterId inserts next to the target at any depth', () => {
  const tree = [node('a', 'Text'), node('b', 'Frame', [node('b1', 'Text'), node('b2', 'Text')])];
  const ids = (list: { id: string; elements?: unknown[] }[]) => list.map((e) => e.id);

  const root = elementTree.mapInsertAfterId(tree, 'a', node('new')) as never as { id: string; parentId?: string }[];
  assert.deepEqual(ids(root), ['a', 'new', 'b']);
  assert.equal(root[1].parentId, undefined);

  const nested = elementTree.mapInsertAfterId(tree, 'b1', node('new')) as never as { id: string; elements: { id: string; parentId?: string }[] }[];
  assert.deepEqual(ids(nested[1].elements as never), ['b1', 'new', 'b2']);
  assert.equal(nested[1].elements[1].parentId, 'b');
  assert.deepEqual(ids(tree as never), ['a', 'b'], 'input is not mutated');

  assert.equal(elementTree.mapInsertAfterId(tree, 'ghost', node('new')), tree, 'missing target returns the same array');
});
