/**
 * Shared fixtures for editor component tests: element factories, store resets,
 * a canvas wrapper (flags + child loader), synthetic drag events and a toast spy.
 */
import { createElement as h } from 'react';
import { fire, jsdomWindow, mount, act } from './editor-test-env';
import { routerState } from './editor-router-stub';

export { routerState };

const { default: ElementRenderer } = await import('../../apps/editor/src/features/editor/components/ElementRenderer');
const { ChildElementLoaderProvider } = await import('../../apps/editor/src/features/editor/components/context/ChildElementLoaderContext');
const { EditorFlagsProvider } = await import('../../apps/editor/src/features/editor/components/context/EditorFlagsContext');
const { useElementStore } = await import('../../apps/editor/src/features/editor/store/element-store');
const { useSelectionStore } = await import('../../apps/editor/src/features/editor/store/selection-store');
const { useEventModeStore } = await import('../../apps/editor/src/features/editor/store/event-mode-store');
const { projectKeys } = await import('../../apps/editor/src/features/projects/hooks/useProjects');
const { toast } = await import('sonner');

export { ElementRenderer, ChildElementLoaderProvider, EditorFlagsProvider, useElementStore, useSelectionStore, useEventModeStore, projectKeys };

export type Any = any;

let seq = 0;
export const el = (type: string, extra: Record<string, unknown> = {}): Any => ({
  id: extra.id ?? `${type.toLowerCase()}-${++seq}`, type, pageId: 'page-1', tailwindStyles: '', ...extra,
});

export function resetStores(elements: Any[] = []) {
  useElementStore.setState({ elements, past: [], future: [], activePage: null, isComponentPage: false,
    elementsChangeCallback: null, collaborativeCallback: null });
  useSelectionStore.getState().clearSelection();
  useEventModeStore.setState({ isEventModeEnabled: false });
  useEventModeStore.getState().clearDisabledElements();
  routerState.params = {};
  routerState.search = {};
  routerState.navigations.length = 0;
}

export const renderChildren = (els: Any[], data?: Any) =>
  els.map((e) => h(ElementRenderer as Any, { key: e.id, element: e, data }));

export interface CanvasOpts { canEdit?: boolean; canCreate?: boolean; client?: Any }

/** Wrap a node in editor flags + the child element loader. */
export function canvas(node: Any, { canEdit = true, canCreate = true }: CanvasOpts = {}) {
  return h(EditorFlagsProvider as Any, { isReadOnly: !canEdit, isLocked: false, permissionsRole: null, canEdit, canCreate },
    h(ChildElementLoaderProvider as Any, { renderElements: renderChildren }, node));
}

export const mountElement = (element: Any, opts: CanvasOpts = {}, data?: Any) =>
  mount(canvas(h(ElementRenderer as Any, { element, data }), opts), opts.client);

/** Native-style drag event carrying a minimal `dataTransfer`. */
export async function drag(target: Element, type: 'dragover' | 'dragleave' | 'drop', types: string[], payload?: string) {
  const ev = new (jsdomWindow as Any).Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(ev, 'dataTransfer', { value: { types, getData: () => payload ?? '' } });
  await act(async () => { target.dispatchEvent(ev); });
  return ev;
}

/** Replace `toast.success/error` with recorders; returns the log and a restore fn. */
export function spyToast() {
  const calls: Array<{ kind: string; msg: string }> = [];
  const orig = { success: toast.success, error: toast.error };
  (toast as Any).success = (msg: string) => { calls.push({ kind: 'success', msg }); return 1; };
  (toast as Any).error = (msg: string) => { calls.push({ kind: 'error', msg }); return 1; };
  return { calls, restore() { (toast as Any).success = orig.success; (toast as Any).error = orig.error; } };
}

export const select = (element: Any) => useSelectionStore.getState().setSelectedElement(element);
export { fire, mount, act };
