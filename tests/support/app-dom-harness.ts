import { JSDOM } from 'jsdom';
import { act, createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});

const w = dom.window as unknown as Record<string, unknown>;
const g = globalThis as Record<string, unknown>;
for (const key of [
  'window', 'document', 'HTMLElement', 'Element', 'Node', 'Event', 'KeyboardEvent', 'MouseEvent',
  'FocusEvent', 'InputEvent', 'PointerEvent', 'CustomEvent', 'MutationObserver', 'DocumentFragment',
  'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement', 'HTMLButtonElement',
  'getComputedStyle', 'SVGElement', 'HTMLIFrameElement', 'ShadowRoot', 'DOMRect', 'CSS',
]) {
  if (w[key] !== undefined) {
    Object.defineProperty(globalThis, key, { value: w[key], configurable: true, writable: true });
  }
}
for (const key of Object.getOwnPropertyNames(w)) {
  if (/^[A-Z]/.test(key) && !(key in globalThis) && w[key] !== undefined) {
    Object.defineProperty(globalThis, key, { value: w[key], configurable: true, writable: true });
  }
}
if (!('PointerEvent' in w)) w.PointerEvent = w.MouseEvent;
Object.defineProperty(globalThis, 'PointerEvent', { value: w.PointerEvent, configurable: true, writable: true });
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
Object.defineProperty(globalThis, 'localStorage', { value: dom.window.localStorage, configurable: true });

const pendingRafs = new Set<ReturnType<typeof setTimeout>>();
g.requestAnimationFrame = (cb: (t: number) => void) => {
  const handle = setTimeout(() => {
    pendingRafs.delete(handle);
    cb(Date.now());
  }, 16);
  pendingRafs.add(handle);
  return handle as unknown as number;
};
g.cancelAnimationFrame = (id: number) => {
  const handle = id as unknown as ReturnType<typeof setTimeout>;
  pendingRafs.delete(handle);
  clearTimeout(handle);
};

export function clearPendingFrames(): void {
  for (const handle of pendingRafs) clearTimeout(handle);
  pendingRafs.clear();
}

g.IS_REACT_ACT_ENVIRONMENT = true;
class StubResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
g.ResizeObserver = StubResizeObserver;
w.ResizeObserver = StubResizeObserver;
const protoEl = dom.window.HTMLElement.prototype as unknown as Record<string, unknown>;
protoEl.scrollIntoView = () => {};
protoEl.hasPointerCapture = () => false;
protoEl.setPointerCapture = () => {};
protoEl.releasePointerCapture = () => {};
w.matchMedia = () => ({
  matches: false,
  media: '',
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
});

export interface MatchMediaControl {
  fire(): void;
  listeners: number;
}

export function installMatchMedia(matches: (query: string) => boolean): MatchMediaControl {
  const listeners = new Set<() => void>();
  const control: MatchMediaControl = {
    fire: () => listeners.forEach((l) => l()),
    get listeners() {
      return listeners.size;
    },
  };
  w.matchMedia = (query: string) => ({
    matches: matches(query),
    media: query,
    addEventListener: (_: string, cb: () => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
  });
  return control;
}

export const win = dom.window;
export const doc = dom.window.document;

export interface Mounted {
  container: HTMLElement;
  root: Root;
  render(node: ReactNode): Promise<void>;
  unmount(): Promise<void>;
}

export async function mount(node: ReactNode): Promise<Mounted> {
  const container = doc.createElement('div');
  doc.body.appendChild(container);
  const root = createRoot(container);
  const mounted: Mounted = {
    container,
    root,
    async render(next) {
      await act(async () => root.render(next));
    },
    async unmount() {
      await act(async () => root.unmount());
      container.remove();
      clearPendingFrames();
    },
  };
  await mounted.render(node);
  return mounted;
}

export { act, createElement };

export async function fire(target: Element | Window | Document, event: Event): Promise<void> {
  await act(async () => {
    target.dispatchEvent(event);
  });
}
