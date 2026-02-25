import { getQueryClient } from "@/client/queryclient";
import { eventWorkflowService } from "@/services/eventWorkflow.service";
import { EventWorkflow } from "@/interfaces/eventWorkflow.interface";

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Hierarchical keys enable React Query filter-based invalidation:
//   ["eventWorkflows"]                          → matches ALL
//   ["eventWorkflows", "list"]                  → matches all list queries
//   ["eventWorkflows", "list", projectId]        → exact project list
//   ["eventWorkflows", "detail"]                 → matches all detail queries
//   ["eventWorkflows", "detail", workflowId]     → exact workflow detail
// ─────────────────────────────────────────────────────────────────────────────
export const eventWorkflowKeys = {
  all: ["eventWorkflows"] as const,
  lists: () => [...eventWorkflowKeys.all, "list"] as const,
  list: (projectId: string) =>
    [...eventWorkflowKeys.lists(), projectId] as const,
  details: () => [...eventWorkflowKeys.all, "detail"] as const,
  detail: (workflowId: string) =>
    [...eventWorkflowKeys.details(), workflowId] as const,
};

// ─── Non-React Utilities ──────────────────────────────────────────────────────

/**
 * Fetch a single workflow by ID outside of React (e.g. server actions, plain
 * utilities, or Zustand slices that cannot call hooks).
 *
 * Uses `queryClient.fetchQuery` so the result is cached and deduplicated.
 *
 * @param workflowId - The workflow to fetch.
 * @param force      - When `true`, bypasses the stale-time check and always
 *                     hits the network.
 */
export async function fetchWorkflowById(
  workflowId: string,
  force = false,
): Promise<EventWorkflow | null> {
  if (!workflowId) return null;
  const qc = getQueryClient();

  try {
    return await qc.fetchQuery({
      queryKey: eventWorkflowKeys.detail(workflowId),
      queryFn: () => eventWorkflowService.getEventWorkflowById(workflowId),
      staleTime: force ? 0 : 30_000,
    });
  } catch (error) {
    console.error("Failed to fetch workflow:", error);
    return null;
  }
}

/**
 * Read a single workflow from the React Query cache synchronously.
 * Returns `undefined` when the entry is not yet cached.
 */
export function getWorkflowFromCache(
  workflowId: string,
): EventWorkflow | undefined {
  const qc = getQueryClient();
  return qc.getQueryData<EventWorkflow>(eventWorkflowKeys.detail(workflowId));
}
