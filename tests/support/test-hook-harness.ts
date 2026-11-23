/**
 * Render React hooks under node without a DOM. `renderHook` runs one server
 * render (effects never fire), so queries are never auto-fetched; use
 * `runQuery` to execute the `queryFn` the hook registered, and call the
 * returned mutation handles directly.
 */
import { createElement, type ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider, type QueryKey } from '@tanstack/react-query';

const created: QueryClient[] = [];

export function makeClient(): QueryClient {
  // gcTime: Infinity stops react-query scheduling timers that hold the process open.
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  created.push(client);
  return client;
}

/**
 * Hooks that set their own `gcTime` (e.g. QUERY_CONFIG presets) schedule GC
 * timers that keep node alive. Call this from `after()` in every test file.
 */
export function disposeClients(): void {
  for (const client of created.splice(0)) client.clear();
}

export function renderHook<T>(
  hook: () => T,
  client: QueryClient = makeClient(),
): { result: T; client: QueryClient } {
  let result: T | undefined;
  function Probe(): ReactNode {
    result = hook();
    return null;
  }
  renderToStaticMarkup(createElement(QueryClientProvider, { client }, createElement(Probe)));
  return { result: result as T, client };
}

/** Execute the queryFn the hook registered for `key` and return its data. */
export async function runQuery<T = unknown>(client: QueryClient, key: QueryKey): Promise<T> {
  const query = client.getQueryCache().find({ queryKey: key });
  if (!query) throw new Error(`no query registered for ${JSON.stringify(key)}`);
  return (await query.fetch()) as T;
}
