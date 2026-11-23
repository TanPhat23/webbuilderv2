/**
 * `@tanstack/react-router` stand-in for editor component tests: controllable
 * params/search, a recording `useNavigate`, and a `Link` that renders a plain anchor.
 */
import { createElement, type ReactNode } from 'react';
export * from '@tanstack/react-router';

export const routerState: {
  params: Record<string, string>;
  search: Record<string, unknown>;
  navigations: Array<Record<string, unknown>>;
} = { params: {}, search: {}, navigations: [] };

export const useParams = (_opts?: unknown) => ({ ...routerState.params });
export const useSearch = (_opts?: unknown) => ({ ...routerState.search });
export const useNavigate = (_opts?: unknown) => (opts: Record<string, unknown>) => {
  routerState.navigations.push(opts);
  return Promise.resolve();
};

export function Link(props: {
  to?: string;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const { to, params, search, children, ...rest } = props;
  let href = String(to ?? '');
  for (const [k, v] of Object.entries(params ?? {})) href = href.replace('$' + k, v);
  const qs = new URLSearchParams(Object.entries(search ?? {}).map(([k, v]) => [k, String(v)])).toString();
  return createElement('a', { ...rest, href: qs ? href + '?' + qs : href }, children);
}
