/** `@tanstack/react-router` with controllable `useParams` / `useSearch`. */
export * from '@tanstack/react-router';
export const paramsState: { params: Record<string, string> } = { params: {} };
export const searchState: { search: Record<string, unknown> } = { search: {} };
export const useParams = (_opts?: unknown) => ({ ...paramsState.params });
export const useSearch = (_opts?: unknown) => ({ ...searchState.search });
