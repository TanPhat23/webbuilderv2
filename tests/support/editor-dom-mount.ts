/** Mount helper; import AFTER `./editor-dom-harness`. */
import './editor-dom-harness';
import { createElement, act, type ReactElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { makeClient, disposeClients } from './test-hook-harness';
import { jsdomWindow } from './editor-dom-harness';

export { act, jsdomWindow };

export interface Mounted {
  container: HTMLElement;
  root: Root;
  client: QueryClient;
  rerender(el: ReactElement): Promise<void>;
  unmount(): Promise<void>;
}

const live: Mounted[] = [];

export async function mount(el: ReactElement, client: QueryClient = makeClient()): Promise<Mounted> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const wrap = (node: ReactElement) => createElement(QueryClientProvider, { client }, node);
  await act(async () => { root.render(wrap(el)); });
  const m: Mounted = {
    container, root, client,
    async rerender(next) { await act(async () => { root.render(wrap(next)); }); },
    async unmount() { await act(async () => { root.unmount(); }); container.remove(); },
  };
  live.push(m);
  return m;
}

export async function cleanup(): Promise<void> {
  for (const m of live.splice(0)) await m.unmount().catch(() => {});
  disposeClients();
}

/** Dispatch a bubbling event wrapped in act. */
export async function fire(
  target: Element,
  type: string,
  init: Record<string, unknown> = {},
  Ctor: new (type: string, eventInitDict?: EventInit) => Event = jsdomWindow.Event,
): Promise<Event> {
  const ev = new Ctor(type, { bubbles: true, cancelable: true, ...init });
  await act(async () => { target.dispatchEvent(ev); });
  return ev;
}
export const h = createElement;

export { makeClient };

/** Click helper wrapped in act. */
export const click = (el: Element, init: Record<string, unknown> = {}) =>
  fire(el, 'click', init, jsdomWindow.MouseEvent);
