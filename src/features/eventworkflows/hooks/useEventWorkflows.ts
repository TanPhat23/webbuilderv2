import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventWorkflowService } from "@/features/eventworkflows";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/features/eventworkflows";
import { eventWorkflowKeys } from "@/features/editor";
import { getErrorMessage } from "@/hooks/utils/mutationUtils";
import {
  useCreateEventWorkflow,
  useDeleteEventWorkflow,
  useUpdateEventWorkflow,
  useUpdateEventWorkflowEnabled,
} from "./useEventWorkflowMutations";

// ─── Query Hooks ──────────────────────────────────────────────────────────────

/**
 * Fetch all workflows for a project.
 * Uses React Query cache with 30 s stale time.
 */
export function useEventWorkflows(projectId: string) {
  return useQuery({
    queryKey: eventWorkflowKeys.list(projectId),
    queryFn: async () => {
      const result = await eventWorkflowService.getEventWorkflows(projectId);
      return Array.isArray(result) ? result : [];
    },
    enabled: !!projectId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Fetch a single workflow by ID.
 * Seeds from the list cache via `initialData` so the UI can show data
 * instantly while the detail query refetches in the background.
 */
export function useEventWorkflow(workflowId: string, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: eventWorkflowKeys.detail(workflowId),
    queryFn: () => eventWorkflowService.getEventWorkflowById(workflowId),
    enabled: enabled && !!workflowId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    // Seed from any list cache that already contains this workflow so the
    // component renders immediately rather than showing a loading state.
    initialData: () => {
      const lists = queryClient.getQueriesData<EventWorkflow[]>({
        queryKey: eventWorkflowKeys.lists(),
      });
      for (const [, data] of lists) {
        const found = data?.find((w) => w.id === workflowId);
        if (found) return found;
      }
      return undefined;
    },
  });
}

// ─── Convenience Hook ─────────────────────────────────────────────────────────

/**
 * Returns workflows + mutation actions + aggregate state flags in one call.
 *
 * Mutation flags (`isCreating`, `isUpdating`, `isDeleting`) are derived
 * directly from TanStack Query's `mutation.isPending` — no Zustand store
 * is involved. Cache invalidation helpers are created with `useQueryClient`
 * so they stay in sync with the active QueryClient instance.
 */
export function useEventWorkflowActions(projectId: string) {
  const queryClient = useQueryClient();
  const query = useEventWorkflows(projectId);

  const createMutation = useCreateEventWorkflow();
  const updateMutation = useUpdateEventWorkflow();
  const updateEnabledMutation = useUpdateEventWorkflowEnabled();
  const deleteMutation = useDeleteEventWorkflow();

  // Derive the most recent mutation error (last one wins).
  const mutationError =
    createMutation.error ??
    updateMutation.error ??
    updateEnabledMutation.error ??
    deleteMutation.error;

  // ─── Cache helpers ───────────────────────────────────────────────────────
  const invalidateAll = useCallback(
    () => queryClient.invalidateQueries({ queryKey: eventWorkflowKeys.all }),
    [queryClient],
  );

  const invalidateList = useCallback(
    (pid?: string) =>
      pid
        ? queryClient.invalidateQueries({
            queryKey: eventWorkflowKeys.list(pid),
            exact: true,
          })
        : queryClient.invalidateQueries({
            queryKey: eventWorkflowKeys.lists(),
          }),
    [queryClient],
  );

  const invalidateDetail = useCallback(
    (workflowId: string) =>
      queryClient.invalidateQueries({
        queryKey: eventWorkflowKeys.detail(workflowId),
        exact: true,
      }),
    [queryClient],
  );

  return {
    // ── React Query data ────────────────────────────────────────────────────
    workflows: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    /** Combined error: query error takes priority, then the latest mutation error. */
    error: query.error
      ? getErrorMessage(query.error, "Failed to load workflows")
      : mutationError
        ? getErrorMessage(mutationError, "Operation failed")
        : null,

    // ── Mutation actions ────────────────────────────────────────────────────
    createWorkflow: (input: CreateEventWorkflowInput) =>
      createMutation.mutateAsync({ projectId, input }),
    updateWorkflow: (workflowId: string, input: UpdateEventWorkflowInput) =>
      updateMutation.mutateAsync({ workflowId, input }),
    updateWorkflowEnabled: (workflowId: string, enabled: boolean) =>
      updateEnabledMutation.mutateAsync({ workflowId, enabled }),
    deleteWorkflow: (workflowId: string) =>
      deleteMutation.mutateAsync({ workflowId }),

    // ── Mutation flags (derived from TanStack Query, not Zustand) ───────────
    isCreating: createMutation.isPending,
    /** True while either the full-update or the enabled-toggle mutation is in flight. */
    isUpdating: updateMutation.isPending || updateEnabledMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // ── Cache helpers ───────────────────────────────────────────────────────
    invalidateAll,
    invalidateList,
    invalidateDetail,

    // ── Raw query pass-through ──────────────────────────────────────────────
    refetch: query.refetch,
  };
}
