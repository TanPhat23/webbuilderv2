/**
 * Minimal jsdom + react-dom/client harness for interaction tests. Importing
 * this module installs jsdom globals (so it must be imported before any
 * module that touches `document` at load time). Each node:test file runs in
 * its own process, so the globals never leak between files.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const g = globalThis as Record<string, unknown>;
const win = dom.window as unknown as Record<string, unknown>;
for (const key of [
  'window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLButtonElement', 'Element', 'Node',
  'Event', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'FocusEvent', 'InputEvent', 'MutationObserver',
  'getComputedStyle', 'DocumentFragment', 'SVGElement', 'CustomEvent',
]) {
  if (win[key] !== undefined) {
    Object.defineProperty(globalThis, key, { value: win[key], configurable: true, writable: true });
  }
}
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
g.IS_REACT_ACT_ENVIRONMENT = true;
g.requestAnimationFrame = (cb: (t: number) => void) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id: number) => clearTimeout(id);
const proto = dom.window.HTMLElement.prototype as unknown as Record<string, unknown>;
proto.scrollIntoView = () => {};
proto.hasPointerCapture = () => false;
proto.releasePointerCapture = () => {};
class RO { observe() {} unobserve() {} disconnect() {} }
g.ResizeObserver = RO;
(dom.window as unknown as Record<string, unknown>).ResizeObserver = RO;
(dom.window as unknown as Record<string, unknown>).matchMedia = () => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { act } = React;

export { dom, act };

export interface Mounted {
  container: HTMLElement;
  rerender(el: React.ReactElement): Promise<void>;
  unmount(): Promise<void>;
}

const mounted: Mounted[] = [];

export async function mount(el: React.ReactElement): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  await act(async () => { root.render(el); });
  const m: Mounted = {
    container,
    async rerender(next) { await act(async () => { root.render(next); }); },
    async unmount() { await act(async () => { root.unmount(); }); container.remove(); },
  };
  mounted.push(m);
  return m;
}

export async function unmountAll(): Promise<void> {
  for (const m of mounted.splice(0)) await m.unmount().catch(() => {});
  document.body.innerHTML = '';
}

/** Let pending promises (fetch stubs, react-query) settle inside act. */
export async function settle(times = 6): Promise<void> {
  for (let i = 0; i < times; i++) {
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  }
}

export async function click(el: Element): Promise<void> {
  await act(async () => {
    el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true }));
  });
}

/** Set an <input> value the way React's onChange expects, then fire input. */
export async function type(el: Element, value: string): Promise<void> {
  const input = el as HTMLInputElement;
  const setter = Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, 'value')!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
  });
}

export async function key(el: Element, k: string): Promise<void> {
  await act(async () => {
    el.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  });
}

export function $q<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}
export function $all<T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return [...root.querySelectorAll<T>(sel)];
}
export function byTitle(title: string, root: ParentNode = document): HTMLElement | null {
  return root.querySelector<HTMLElement>(`[title="${title}"]`);
}
export function byText(text: string, tag = '*', root: ParentNode = document): HTMLElement | null {
  return [...root.querySelectorAll<HTMLElement>(tag)].find((e) => e.textContent?.trim() === text) ?? null;
}
