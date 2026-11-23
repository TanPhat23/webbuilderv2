/**
 * Helpers for the feature-area tests: a recording fetch stub, a hook renderer
 * that can fire state updates, and a renderer that also returns the element
 * tree a component produced so event handlers can be invoked directly.
 * Everything runs under node without a DOM (one server render per call).
 */
import * as React from 'react';
import { createElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { makeClient } from './test-hook-harness';

export interface Recorded {
  url: URL;
  method: string;
  headers: Record<string, string>;
  body: unknown;
  rawBody: unknown;
}

export interface FetchStub {
  requests: Recorded[];
  respond: (req: Recorded) => Response | Promise<Response>;
  /** Requests excluding the /api/gettoken handshake. */
  api(): Recorded[];
  restore(): void;
}

/** Replace globalThis.fetch with a recorder; the token handshake is answered automatically. */
export function installFetch(): FetchStub {
  const real = globalThis.fetch;
  const stub: FetchStub = {
    requests: [],
    respond: () => Response.json({}),
    api: () => stub.requests.filter((r) => r.url.pathname !== '/api/gettoken'),
    restore: () => {
      globalThis.fetch = real;
    },
  };
  globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url, 'http://localhost:3000');
    const rec: Recorded = {
      url,
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      rawBody: init?.body,
    };
    stub.requests.push(rec);
    if (url.pathname === '/api/gettoken') return Response.json({ tokenJWT: 'jwt-test' });
    return stub.respond(rec);
  }) as typeof fetch;
  return stub;
}

/** Silence console methods for the duration of a test file section. */
export function muteConsole(): () => void {
  const saved = { log: console.log, warn: console.warn, error: console.error };
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  return () => Object.assign(console, saved);
}

/**
 * Render a hook and, during the first pass, run `actions` in order. State
 * updates made inside an action re-render the probe synchronously (React
 * supports render-phase updates), so the returned result reflects them and
 * handlers captured in it close over the new state.
 */
export function renderHookActing<T>(
  hook: () => T,
  actions: ((r: T) => void)[] = [],
  client: QueryClient = makeClient(),
): { result: T; client: QueryClient } {
  let result: T | undefined;
  let next = 0;
  function Probe(): ReactNode {
    result = hook();
    while (next < actions.length) actions[next++](result);
    return null;
  }
  renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return { result: result as T, client };
}

export interface Rendered {
  html: string;
  /** The element tree the component function returned (child components unexpanded). */
  tree: ReactNode;
}

/** Render a function component (inside a QueryClientProvider) and capture its returned element tree. */
export function renderTree(
  component: (props: never) => ReactNode,
  props: Record<string, unknown> = {},
  client: QueryClient = makeClient(),
): Rendered {
  let tree: ReactNode = null;
  function Probe(): ReactNode {
    tree = (component as (p: unknown) => ReactNode)(props);
    return tree;
  }
  const html = renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return { html, tree };
}

type Props = Record<string, unknown>;

/** All elements in a (non-expanded) tree, depth first. */
export function elements(node: unknown, out: ReactElement[] = []): ReactElement[] {
  if (Array.isArray(node)) {
    node.forEach((n) => elements(n, out));
  } else if (isValidElement(node)) {
    out.push(node);
    elements((node.props as Props).children, out);
  }
  return out;
}

export function propsOf(el: ReactElement): Props {
  return el.props as Props;
}

/** Concatenated text of string/number leaves. */
export function textOf(node: unknown): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement(node)) return textOf((node.props as Props).children);
  return '';
}

export function findAll(tree: unknown, pred: (el: ReactElement) => boolean): ReactElement[] {
  return elements(tree).filter(pred);
}

export function findOne(tree: unknown, pred: (el: ReactElement) => boolean, what = 'element'): ReactElement {
  const hits = findAll(tree, pred);
  if (hits.length === 0) throw new Error('no ' + what + ' found');
  return hits[0];
}

/** First element whose own text content includes `text` and which has an `onClick`. */
export function clickableWithText(tree: unknown, text: string): ReactElement {
  const hits = findAll(tree, (el) => typeof propsOf(el).onClick === 'function' && textOf(el).includes(text));
  if (hits.length === 0) throw new Error('no clickable element with text ' + JSON.stringify(text));
  // deepest match is the most specific one
  return hits[hits.length - 1];
}

export function click(el: ReactElement, event: Props = {}): unknown {
  const onClick = propsOf(el).onClick as (e: Props) => unknown;
  return onClick({ preventDefault() {}, stopPropagation() {}, ...event });
}

type Cleanup = void | (() => void);
export interface CapturedEffect {
  run: () => Cleanup;
  deps: unknown[] | undefined;
  layout: boolean;
}

// React's internal dispatcher holder; swapping a few hooks on it while a component renders is
// how server-rendered effects (normally skipped) get captured so a test can run them by hand.
const internals = (React as unknown as Record<string, { H: Record<string, unknown> | null }>)
  .__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;

/** Run `fn` (a hook or component body) in a render, capturing every useEffect/useLayoutEffect it registers. */
export function renderCapturingEffects<T>(
  fn: () => T,
  client: QueryClient = makeClient(),
): { result: T; effects: CapturedEffect[]; client: QueryClient } {
  const effects: CapturedEffect[] = [];
  let result: T | undefined;
  function Probe(): ReactNode {
    const original = internals.H as Record<string, unknown>;
    internals.H = {
      ...original,
      useEffect: (run: () => Cleanup, deps?: unknown[]) => effects.push({ run, deps, layout: false }),
      useLayoutEffect: (run: () => Cleanup, deps?: unknown[]) => effects.push({ run, deps, layout: true }),
    };
    try {
      result = fn();
    } finally {
      internals.H = original;
    }
    return null;
  }
  renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return { result: result as T, effects, client };
}
