/**
 * Minimal jsdom + react-dom/client harness for editor component tests.
 * `installDom()` must run BEFORE react-dom/client or any component is imported
 * (use it from a side-effect import at the top of the test file). Each test file
 * runs in its own process under `node --test`, so the globals never leak.
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost/',
  pretendToBeVisual: true,
});
const win = dom.window as unknown as Record<string, unknown>;
const g = globalThis as Record<string, unknown>;
for (const key of [
  'window', 'document', 'HTMLElement', 'Element', 'Node', 'Event', 'MouseEvent', 'KeyboardEvent',
  'DragEvent', 'CustomEvent', 'MutationObserver', 'DocumentFragment', 'HTMLInputElement',
  'HTMLTextAreaElement', 'HTMLButtonElement', 'HTMLAnchorElement', 'HTMLIFrameElement', 'SVGElement',
  'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'DOMRect', 'FocusEvent',
  'InputEvent', 'PointerEvent', 'ClipboardEvent', 'HTMLImageElement', 'HTMLVideoElement',
  'HTMLAudioElement', 'HTMLFormElement', 'HTMLSelectElement', 'ShadowRoot', 'Text',
]) {
  if (key in win && !(key in g && key === 'Event')) {
    try { g[key] = win[key]; } catch { /* read-only global */ }
  }
}
g.window = dom.window;
g.document = dom.window.document;
Object.defineProperty(globalThis, 'navigator', { value: dom.window.navigator, configurable: true });
g.localStorage = dom.window.localStorage;
g.sessionStorage = dom.window.sessionStorage;
g.IS_REACT_ACT_ENVIRONMENT = true;
if (!g.ResizeObserver) {
  g.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
  (dom.window as unknown as Record<string, unknown>).ResizeObserver = g.ResizeObserver;
}
if (!g.IntersectionObserver) {
  g.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } };
  (dom.window as unknown as Record<string, unknown>).IntersectionObserver = g.IntersectionObserver;
}
(dom.window as unknown as Record<string, unknown>).matchMedia ??= () => ({
  matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
});
g.matchMedia = (dom.window as unknown as Record<string, unknown>).matchMedia;
export const jsdomWindow = dom.window;
