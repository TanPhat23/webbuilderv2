"use client";

import { useQuery } from "@tanstack/react-query";
import { useDeferredValue } from "react";
import { userService } from "../services/user";
import type { User } from "../services/user";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";

export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...userKeys.lists(), filters] as const,
  search: (query: string, limit?: number, offset?: number) =>
    [...userKeys.all, "search", query, limit, offset] as const,
  byEmail: (email: string) => [...userKeys.all, "email", email] as const,
  byUsername: (username: string) =>
    [...userKeys.all, "username", username] as const,
};

/**
 * Hook to search users by query string.
 *
 * Uses `useDeferredValue` to debounce the search query and prevent
 * excessive API calls while the user is typing.
 *
 * @param query   - The search string.
 * @param enabled - Whether the query should be enabled (default: true).
 * @param limit   - Maximum number of results (default: 20).
 * @param offset  - Pagination offset (default: 0).
 */
export function useSearchUsers(
  query: string,
  enabled = true,
  limit = 20,
  offset = 0,
) {
  // Debounce the query to prevent excessive API calls
  const debouncedQuery = useDeferredValue(query);

  return useQuery({
    queryKey: userKeys.search(debouncedQuery, limit, offset),
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const result = await userService.searchUsers(
        debouncedQuery,
        limit,
        offset,
      );
      return result;
    },
    enabled: !!debouncedQuery.trim() && enabled,
    ...QUERY_CONFIG.DEFAULT,
  });
}

/**
 * Hook to get a user by their email address.
 *
 * @param email   - The email to look up.
 * @param enabled - Whether the query should be enabled (default: true).
 */
export function useUserByEmail(email: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.byEmail(email),
    queryFn: async () => {
      if (!email) throw new Error("Email is required");
      return await userService.getUserByEmail(email);
    },
    enabled: !!email && enabled,
    ...QUERY_CONFIG.DEFAULT,
  });
}

/**
 * Hook to get a user by their username.
 *
 * @param username - The username to look up.
 * @param enabled  - Whether the query should be enabled (default: true).
 */
export function useUserByUsername(username: string, enabled = true) {
  return useQuery({
    queryKey: userKeys.byUsername(username),
    queryFn: async () => {
      if (!username) throw new Error("Username is required");
      return await userService.getUserByUsername(username);
    },
    enabled: !!username && enabled,
    ...QUERY_CONFIG.DEFAULT,
  });
}
