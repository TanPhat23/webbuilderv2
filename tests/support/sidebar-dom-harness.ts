/**
 * Minimal DOM test harness for sidebar components: jsdom + react-dom/client +
 * act. Importing this module installs the jsdom globals BEFORE react-dom/client
 * loads, so import it before any component under test.
 */
import { register } from 'node:module';
import { JSDOM } from 'jsdom';

// Vite globals: files reading import.meta.env must not throw under node.
register('data:text/javascript,' + encodeURIComponent(`
export async function load(url, context, nextLoad) {
  const result = await nextLoad(url, context);
  if (url.includes('/src/') && result.source) {
    const src = result.source.toString();
    if (src.includes('import.meta.env')) result.source = src.replaceAll('import.meta.env', '(import.meta.env || {})');
  }
  return result;
}
`));

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

const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const win = dom.window;

const g = globalThis as Record<string, unknown>;
const define = (name: string, value: unknown) =>
  Object.defineProperty(globalThis, name, { value, configurable: true, writable: true });

for (const name of [
  'window', 'document', 'HTMLElement', 'HTMLInputElement', 'HTMLTextAreaElement', 'HTMLSelectElement',
  'HTMLButtonElement', 'HTMLIFrameElement', 'Element', 'Node', 'Event', 'KeyboardEvent', 'MouseEvent',
  'FocusEvent', 'InputEvent', 'CustomEvent', 'MutationObserver', 'DocumentFragment', 'SVGElement',
  'getComputedStyle', 'DOMRect', 'File', 'FileReader', 'Blob', 'FormData', 'CSS',
]) {
  if (name in win) define(name, (win as Record<string, unknown>)[name]);
}
// Every DOM class (HTMLFormElement, ShadowRoot, ...) that node does not already provide.
for (const name of Object.getOwnPropertyNames(win)) {
  if (/^[A-Z]/.test(name) && !(name in globalThis)) define(name, (win as Record<string, unknown>)[name]);
}
define('navigator', win.navigator);
define('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0));
define('cancelAnimationFrame', (id: number) => clearTimeout(id));
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
define('ResizeObserver', ResizeObserverStub);
(win as Record<string, unknown>).ResizeObserver = ResizeObserverStub;
(win as Record<string, unknown>).matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
const protoEl = win.HTMLElement.prototype as unknown as Record<string, unknown>;
protoEl.scrollIntoView = () => {};
protoEl.hasPointerCapture = () => false;
protoEl.setPointerCapture = () => {};
protoEl.releasePointerCapture = () => {};
if (!('PointerEvent' in win)) (win as Record<string, unknown>).PointerEvent = win.MouseEvent;
define('PointerEvent', (win as Record<string, unknown>).PointerEvent);
g.IS_REACT_ACT_ENVIRONMENT = true;

const React = await import('react');
const { createRoot } = await import('react-dom/client');
const { TooltipProvider } = await import('../../src/components/ui/tooltip');
export { React };

type Root = ReturnType<typeof createRoot>;
const mounted: { root: Root; container: HTMLElement }[] = [];

const wrap = (el: React.ReactElement) => React.createElement(TooltipProvider, null, el);

export async function render(element: React.ReactElement) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mounted.push({ root, container });
  await React.act(async () => { root.render(wrap(element)); });
  return {
    container,
    rerender: async (next: React.ReactElement) => { await React.act(async () => { root.render(wrap(next)); }); },
    unmount: async () => { await React.act(async () => { root.unmount(); }); },
  };
}

export async function cleanup() {
  for (const m of mounted.splice(0)) {
    await React.act(async () => { m.root.unmount(); });
    m.container.remove();
  }
  document.body.innerHTML = '';
}

export async function act(fn: () => unknown | Promise<unknown>) {
  await React.act(async () => { await fn(); });
}

/** Wait for pending microtasks/timeouts inside act (lazy imports, queries). */
export async function flush(ms = 0) {
  await React.act(async () => { await new Promise((r) => setTimeout(r, ms)); });
}

export const $q = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T => {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error('no element for ' + sel);
  return el;
};
export const $$q = <T extends Element = HTMLElement>(root: ParentNode, sel: string): T[] =>
  Array.from(root.querySelectorAll<T>(sel));
export const byLabel = <T extends HTMLElement = HTMLElement>(root: ParentNode, label: string): T =>
  $q<T>(root, '[aria-label="' + label + '"]');
export const maybeByLabel = <T extends HTMLElement = HTMLElement>(root: ParentNode, label: string): T | null =>
  root.querySelector<T>('[aria-label="' + label + '"]');
export const byText = (root: ParentNode, text: string, sel = 'button'): HTMLElement => {
  const el = Array.from(root.querySelectorAll<HTMLElement>(sel)).find((e) => (e.textContent ?? '').trim() === text);
  if (!el) throw new Error('no ' + sel + ' with text ' + text);
  return el;
};

export async function click(el: Element) {
  await act(() => { (el as HTMLElement).dispatchEvent(new win.MouseEvent('click', { bubbles: true, cancelable: true })); });
}

/** Radix triggers listen for pointerdown, not click. */
export async function pointerDown(el: Element) {
  await act(() => {
    el.dispatchEvent(new win.MouseEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, ctrlKey: false } as MouseEventInit));
  });
}

export async function type(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof win.HTMLTextAreaElement ? win.HTMLTextAreaElement.prototype : win.HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, 'value')!.set!;
  await act(() => {
    setter.call(el, value);
    el.dispatchEvent(new win.Event('input', { bubbles: true }));
  });
}

export async function setChecked(el: HTMLInputElement, checked: boolean) {
  if (el.checked !== checked) await click(el);
}

export async function focus(el: HTMLElement) {
  await act(() => { el.focus(); el.dispatchEvent(new win.FocusEvent('focusin', { bubbles: true })); });
}

export async function blur(el: HTMLElement) {
  await act(() => { el.dispatchEvent(new win.FocusEvent('focusout', { bubbles: true })); });
}

export async function keyDown(el: Element, key: string, init: KeyboardEventInit = {}) {
  await act(() => { el.dispatchEvent(new win.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...init })); });
}

/** Open a Radix Select via keyboard and choose the option with this text. */
export async function pickOption(trigger: HTMLElement, text: string) {
  await keyDown(trigger, 'Enter');
  const opts = Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]'));
  const opt = opts.find((o) => (o.textContent ?? '').trim() === text);
  if (!opt) throw new Error('no option ' + text + ' among ' + opts.map((o) => o.textContent).join('|'));
  await click(opt);
  await flush();
}

/** Texts of the options of the currently open Radix Select. */
export function openOptionTexts(): string[] {
  return Array.from(document.body.querySelectorAll<HTMLElement>('[role="option"]')).map((o) => (o.textContent ?? '').trim());
}

export { win };
