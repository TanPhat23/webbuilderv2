/**
 * useEventWorkflowMutations.ts
 *
 * React Query mutations for creating, updating, toggling, and deleting event
 * workflows.
 *
 * Mutation state (isPending, isError, error) is owned entirely by TanStack
 * Query — there is no Zustand flag syncing here. Consumers that need aggregate
 * flags (isCreating, isUpdating, …) should use the `useEventWorkflowActions`
 * convenience hook in `useEventWorkflows.ts`, which derives them from these
 * mutation objects.
 *
 * Cache updates follow an optimistic-write pattern:
 *   1. Write the server response directly into the detail cache entry.
 *   2. Patch every matching list cache entry so UIs stay consistent without
 *      a redundant network round-trip.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventWorkflowService } from "@/features/eventworkflows";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/features/eventworkflows";
import { eventWorkflowKeys } from "@/features/editor";
import { onMutationError } from "@/hooks/utils/mutationUtils";

// ─── Variable types ───────────────────────────────────────────────────────────

type CreateWorkflowVariables = {
  projectId: string;
  input: CreateEventWorkflowInput;
};

type UpdateWorkflowVariables = {
  workflowId: string;
  input: UpdateEventWorkflowInput;
};

type UpdateWorkflowEnabledVariables = {
  workflowId: string;
  enabled: boolean;
};

type DeleteWorkflowVariables = {
  workflowId: string;
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/** Create a new event workflow for a project. */
export const useCreateEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, input }: CreateWorkflowVariables) =>
      eventWorkflowService.createEventWorkflow(projectId, input),

    onSuccess: (created, { projectId }) => {
      // Append to the project list (avoids a full refetch).
      queryClient.setQueryData<EventWorkflow[]>(
        eventWorkflowKeys.list(projectId),
        (old) => (old ? [...old, created] : [created]),
      );
      // Seed the detail cache so detail queries resolve instantly.
      queryClient.setQueryData(eventWorkflowKeys.detail(created.id), created);
    },

    onError: onMutationError("Failed to create workflow", { log: true }),
  });
};

/** Update the name, description, or canvas data of an existing workflow. */
export const useUpdateEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, input }: UpdateWorkflowVariables) =>
      eventWorkflowService.updateEventWorkflow(workflowId, input),

    onSuccess: (updated, { workflowId }) => {
      // Update the detail cache entry.
      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);

      // Patch every list cache entry that contains this workflow.
      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.map((w) => (w.id === workflowId ? updated : w)),
      );
    },

    onError: onMutationError("Failed to update workflow", { log: true }),
  });
};

/** Toggle the enabled / disabled state of a workflow. */
export const useUpdateEventWorkflowEnabled = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ workflowId, enabled }: UpdateWorkflowEnabledVariables) =>
      eventWorkflowService.updateEventWorkflowEnabled(workflowId, enabled),

    onSuccess: (updated, { workflowId }) => {
      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);

      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.map((w) => (w.id === workflowId ? updated : w)),
      );
    },

    onError: onMutationError("Failed to update workflow status", { log: true }),
  });
};

/** Permanently delete a workflow and remove it from all caches. */
export const useDeleteEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowId }: DeleteWorkflowVariables) => {
      await eventWorkflowService.deleteEventWorkflow(workflowId);
      // Return the id so onSuccess can reference it without closing over variables.
      return workflowId;
    },

    onSuccess: (workflowId) => {
      // Remove the detail cache entry entirely.
      queryClient.removeQueries({
        queryKey: eventWorkflowKeys.detail(workflowId),
        exact: true,
      });

      // Remove from every list cache entry.
      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => old?.filter((w) => w.id !== workflowId),
      );
    },

    onError: onMutationError("Failed to delete workflow", { log: true }),
  });
};
