import { useQuery, useQueryClient } from "@tanstack/react-query";
import { eventWorkflowService } from "@/services/eventWorkflow.service";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/interfaces/eventWorkflow.interface";
import {
  eventWorkflowKeys,
  useEventWorkflowStore,
} from "@/globalstore/event-workflow-store";
import {
  useCreateEventWorkflow,
  useDeleteEventWorkflow,
  useUpdateEventWorkflow,
  useUpdateEventWorkflowEnabled,
} from "./useEventWorkflowMutations";

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
 * Seeds from the list cache via `initialData` so we can show data
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
    // Seed from any list cache that already contains this workflow
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

/**
 * Convenience hook that returns workflows + mutation actions in one call.
 * Designed as a drop-in replacement for components that need both query data
 * and mutation actions/flags.
 */
export function useEventWorkflowActions(projectId: string) {
  const query = useEventWorkflows(projectId);
  const store = useEventWorkflowStore();

  const createMutation = useCreateEventWorkflow();
  const updateMutation = useUpdateEventWorkflow();
  const updateEnabledMutation = useUpdateEventWorkflowEnabled();
  const deleteMutation = useDeleteEventWorkflow();

  return {
    // React Query data
    workflows: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load workflows"
      : store.mutationError,

    // Mutation actions
    createWorkflow: (input: CreateEventWorkflowInput) =>
      createMutation.mutateAsync({ projectId, input }),
    updateWorkflow: (workflowId: string, input: UpdateEventWorkflowInput) =>
      updateMutation.mutateAsync({ workflowId, input }),
    updateWorkflowEnabled: (workflowId: string, enabled: boolean) =>
      updateEnabledMutation.mutateAsync({ workflowId, enabled }),
    deleteWorkflow: (workflowId: string) =>
      deleteMutation.mutateAsync({ workflowId }),

    // Mutation flags (from store)
    isCreating: store.isCreating,
    isUpdating: store.isUpdating,
    isDeleting: store.isDeleting,

    // Cache helpers
    invalidateAll: store.invalidateAll,
    invalidateList: store.invalidateList,
    invalidateDetail: store.invalidateDetail,

    // Pass-through for components needing the raw query
    refetch: query.refetch,
  };
}
