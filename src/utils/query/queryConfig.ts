/**
 * Standardized React Query cache configuration constants.
 *
 * Centralizes `staleTime` and `gcTime` so every query across the app
 * uses consistent caching behaviour. Adjust the presets here and all
 * consumers update automatically.
 *
 * @example
 * ```ts
 * import { QUERY_CONFIG } from "@/utils/query/queryConfig";
 *
 * useQuery({
 *   queryKey: ["cms-content-types"],
 *   queryFn: () => cmsService.getContentTypes(),
 *   ...QUERY_CONFIG.LONG,
 * });
 * ```
 */

/** One second in milliseconds – base unit for readability. */
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;

/**
 * Preset cache configurations used throughout the app.
 *
 * | Preset    | staleTime | gcTime  | Use-case                                     |
 * |-----------|-----------|---------|----------------------------------------------|
 * | SHORT     |  1 min    |  5 min  | Rapidly-changing data (notifications, etc.)   |
 * | DEFAULT   |  5 min    | 30 min  | Standard data (content items, lists)          |
 * | LONG      | 15 min    |  1 hr   | Rarely-changing data (content types, schemas) |
 * | STATIC    | 60 min    | 24 hr   | Almost-never-changing data (feature flags)    |
 */
export const QUERY_CONFIG = {
  /** Rapidly-changing data – re-fetches after 1 minute. */
  SHORT: {
    staleTime: 1 * MINUTE,
    gcTime: 5 * MINUTE,
  },

  /** Standard data – re-fetches after 5 minutes. */
  DEFAULT: {
    staleTime: 5 * MINUTE,
    gcTime: 30 * MINUTE,
  },

  /** Rarely-changing data – re-fetches after 15 minutes. */
  LONG: {
    staleTime: 15 * MINUTE,
    gcTime: 1 * HOUR,
  },

  /** Almost-never-changing data – re-fetches after 60 minutes. */
  STATIC: {
    staleTime: 60 * MINUTE,
    gcTime: 24 * HOUR,
  },
} as const;

/** Convenience type for spreading into `useQuery` / `useMutation` options. */
export type QueryCachePreset = (typeof QUERY_CONFIG)[keyof typeof QUERY_CONFIG];
