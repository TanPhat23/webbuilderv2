import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getEventWorkflowById,
  getEventWorkflows,
} from "@/features/eventworkflows";
import type {
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

const fetchEventWorkflows = async (
  projectId: string,
): Promise<EventWorkflow[]> => getEventWorkflows({ data: { projectId } });

const fetchEventWorkflowById = async (
  workflowId: string,
): Promise<EventWorkflow> => getEventWorkflowById({ data: { workflowId } });

// ─── Query Hooks ──────────────────────────────────────────────────────────────

/**
 * Fetch all workflows for a project.
 * Uses React Query cache with 30 s stale time.
 */
export function useEventWorkflows(projectId: string) {
  return useQuery<EventWorkflow[]>({
    queryKey: eventWorkflowKeys.list(projectId),
    queryFn: () => fetchEventWorkflows(projectId),
    enabled: projectId.length > 0,
  });
}

/**
 * Fetch a single workflow by ID.
 * Seeds from the list cache via `initialData` so the UI can show data
 * instantly while the detail query refetches in the background.
 */
export function useEventWorkflow(workflowId: string, enabled = true) {
  const queryClient = useQueryClient();

  return useQuery<EventWorkflow>({
    queryKey: eventWorkflowKeys.detail(workflowId),
    queryFn: () => fetchEventWorkflowById(workflowId),
    enabled: enabled && workflowId.length > 0,
    initialData: () => {
      const lists = queryClient.getQueriesData<EventWorkflow[]>({
        queryKey: eventWorkflowKeys.lists(),
      });

      for (const [, data] of lists) {
        const foundWorkflow = data?.find(
          (workflow) => workflow.id === workflowId,
        );

        if (foundWorkflow) {
          return foundWorkflow;
        }
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
  const workflowsQuery = useEventWorkflows(projectId);

  const createMutation = useCreateEventWorkflow();
  const updateMutation = useUpdateEventWorkflow();
  const updateEnabledMutation = useUpdateEventWorkflowEnabled();
  const deleteMutation = useDeleteEventWorkflow();

  const mutationError =
    createMutation.error ??
    updateMutation.error ??
    updateEnabledMutation.error ??
    deleteMutation.error;

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

  const createWorkflow = useCallback(
    (input: CreateEventWorkflowInput) =>
      createMutation.mutateAsync({ projectId, input }),
    [createMutation, projectId],
  );

  const updateWorkflow = useCallback(
    (workflowId: string, input: UpdateEventWorkflowInput) =>
      updateMutation.mutateAsync({ workflowId, input }),
    [updateMutation],
  );

  const updateWorkflowEnabled = useCallback(
    (workflowId: string, enabled: boolean) =>
      updateEnabledMutation.mutateAsync({ workflowId, enabled }),
    [updateEnabledMutation],
  );

  const deleteWorkflow = useCallback(
    (workflowId: string) => deleteMutation.mutateAsync({ workflowId }),
    [deleteMutation],
  );

  return {
    workflows: workflowsQuery.data ?? [],
    isLoading: workflowsQuery.isLoading,
    isFetching: workflowsQuery.isFetching,
    error: workflowsQuery.error
      ? getErrorMessage(workflowsQuery.error, "Failed to load workflows")
      : mutationError
        ? getErrorMessage(mutationError, "Operation failed")
        : null,
    createWorkflow,
    updateWorkflow,
    updateWorkflowEnabled,
    deleteWorkflow,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending || updateEnabledMutation.isPending,
    isDeleting: deleteMutation.isPending,
    invalidateAll,
    invalidateList,
    invalidateDetail,
    refetch: workflowsQuery.refetch,
  };
}
