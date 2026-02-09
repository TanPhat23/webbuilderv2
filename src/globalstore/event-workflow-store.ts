import { create } from "zustand";
import { getQueryClient } from "@/client/queryclient";
import { eventWorkflowService } from "@/services/eventWorkflow.service";
import { EventWorkflow } from "@/interfaces/eventWorkflow.interface";

export const eventWorkflowKeys = {
  all: ["eventWorkflows"] as const,
  lists: () => [...eventWorkflowKeys.all, "list"] as const,
  list: (projectId: string) =>
    [...eventWorkflowKeys.lists(), projectId] as const,
  details: () => [...eventWorkflowKeys.all, "detail"] as const,
  detail: (workflowId: string) =>
    [...eventWorkflowKeys.details(), workflowId] as const,
};

interface EventWorkflowState {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  mutationError: string | null;

  setIsCreating: (value: boolean) => void;
  setIsUpdating: (value: boolean) => void;
  setIsDeleting: (value: boolean) => void;
  setMutationError: (value: string | null) => void;

  resetFlags: () => void;

  // Cache helpers (non-React)
  invalidateAll: () => void;
  invalidateList: (projectId?: string) => void;
  invalidateDetail: (workflowId: string) => void;
  resetCache: () => void;
}

export const useEventWorkflowStore = create<EventWorkflowState>((set) => ({
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  mutationError: null,

  setIsCreating: (value) => set({ isCreating: value }),
  setIsUpdating: (value) => set({ isUpdating: value }),
  setIsDeleting: (value) => set({ isDeleting: value }),
  setMutationError: (value) => set({ mutationError: value }),

  resetFlags: () =>
    set({
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      mutationError: null,
    }),

  invalidateAll: () => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: eventWorkflowKeys.all });
  },

  invalidateList: (projectId?: string) => {
    const qc = getQueryClient();
    if (projectId) {
      qc.invalidateQueries({
        queryKey: eventWorkflowKeys.list(projectId),
        exact: true,
      });
    } else {
      qc.invalidateQueries({ queryKey: eventWorkflowKeys.lists() });
    }
  },

  invalidateDetail: (workflowId: string) => {
    const qc = getQueryClient();
    qc.invalidateQueries({
      queryKey: eventWorkflowKeys.detail(workflowId),
      exact: true,
    });
  },

  resetCache: () => {
    const qc = getQueryClient();
    qc.removeQueries({ queryKey: eventWorkflowKeys.all });
  },
}));

/**
 * Fetch a single workflow by ID outside of React (e.g. from Zustand actions).
 * Uses queryClient.fetchQuery so the result is cached.
 */
export async function fetchWorkflowById(
  workflowId: string,
  force = false,
): Promise<EventWorkflow | null> {
  if (!workflowId) return null;
  const qc = getQueryClient();

  try {
    const workflow = await qc.fetchQuery({
      queryKey: eventWorkflowKeys.detail(workflowId),
      queryFn: () => eventWorkflowService.getEventWorkflowById(workflowId),
      staleTime: force ? 0 : 30_000,
    });
    return workflow;
  } catch (error) {
    console.error("Failed to fetch workflow:", error);
    return null;
  }
}

/**
 * Read a single workflow from the React Query cache synchronously.
 * Returns undefined if not cached.
 */
export function getWorkflowFromCache(
  workflowId: string,
): EventWorkflow | undefined {
  const qc = getQueryClient();
  return qc.getQueryData<EventWorkflow>(eventWorkflowKeys.detail(workflowId));
}
