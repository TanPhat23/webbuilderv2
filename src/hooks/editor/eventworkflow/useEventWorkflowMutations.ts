import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventWorkflowService } from "@/services/eventWorkflow.service";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/interfaces/eventWorkflow.interface";
import {
  eventWorkflowKeys,
  useEventWorkflowStore,
} from "@/globalstore/eventworkflowstore";

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

export const useCreateEventWorkflow = () => {
  const queryClient = useQueryClient();
  const setIsCreating = useEventWorkflowStore((s) => s.setIsCreating);
  const setMutationError = useEventWorkflowStore((s) => s.setMutationError);

  return useMutation({
    mutationFn: async ({ projectId, input }: CreateWorkflowVariables) =>
      eventWorkflowService.createEventWorkflow(projectId, input),
    onSuccess: (created, variables) => {
      setMutationError(null);
      const { projectId } = variables;

      queryClient.setQueryData<EventWorkflow[]>(
        eventWorkflowKeys.list(projectId),
        (old) => (old ? [...old, created] : [created]),
      );
      queryClient.setQueryData(eventWorkflowKeys.detail(created.id), created);
    },
    onError: (error) => {
      const msg =
        error instanceof Error ? error.message : "Failed to create workflow";
      setMutationError(msg);
      console.error("Failed to create workflow:", error);
    },
    onSettled: () => {
      setIsCreating(false);
    },
    onMutate: () => {
      setIsCreating(true);
      setMutationError(null);
    },
  });
};

export const useUpdateEventWorkflow = () => {
  const queryClient = useQueryClient();
  const setIsUpdating = useEventWorkflowStore((s) => s.setIsUpdating);
  const setMutationError = useEventWorkflowStore((s) => s.setMutationError);

  return useMutation({
    mutationFn: async ({ workflowId, input }: UpdateWorkflowVariables) =>
      eventWorkflowService.updateEventWorkflow(workflowId, input),
    onSuccess: (updated, variables) => {
      setMutationError(null);
      const { workflowId } = variables;

      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);
      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) =>
          old ? old.map((w) => (w.id === workflowId ? updated : w)) : old,
      );
    },
    onError: (error) => {
      const msg =
        error instanceof Error ? error.message : "Failed to update workflow";
      setMutationError(msg);
      console.error("Failed to update workflow:", error);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
    onMutate: () => {
      setIsUpdating(true);
      setMutationError(null);
    },
  });
};

export const useUpdateEventWorkflowEnabled = () => {
  const queryClient = useQueryClient();
  const setIsUpdating = useEventWorkflowStore((s) => s.setIsUpdating);
  const setMutationError = useEventWorkflowStore((s) => s.setMutationError);

  return useMutation({
    mutationFn: async ({
      workflowId,
      enabled,
    }: UpdateWorkflowEnabledVariables) =>
      eventWorkflowService.updateEventWorkflowEnabled(workflowId, enabled),
    onSuccess: (updated, variables) => {
      setMutationError(null);
      const { workflowId } = variables;

      queryClient.setQueryData(eventWorkflowKeys.detail(workflowId), updated);
      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) =>
          old ? old.map((w) => (w.id === workflowId ? updated : w)) : old,
      );
    },
    onError: (error) => {
      const msg =
        error instanceof Error
          ? error.message
          : "Failed to update workflow status";
      setMutationError(msg);
      console.error("Failed to update workflow status:", error);
    },
    onSettled: () => {
      setIsUpdating(false);
    },
    onMutate: () => {
      setIsUpdating(true);
      setMutationError(null);
    },
  });
};

export const useDeleteEventWorkflow = () => {
  const queryClient = useQueryClient();
  const setIsDeleting = useEventWorkflowStore((s) => s.setIsDeleting);
  const setMutationError = useEventWorkflowStore((s) => s.setMutationError);

  return useMutation({
    mutationFn: async ({ workflowId }: DeleteWorkflowVariables) => {
      await eventWorkflowService.deleteEventWorkflow(workflowId);
      return workflowId;
    },
    onSuccess: (workflowId) => {
      setMutationError(null);

      queryClient.removeQueries({
        queryKey: eventWorkflowKeys.detail(workflowId),
        exact: true,
      });
      queryClient.setQueriesData<EventWorkflow[]>(
        { queryKey: eventWorkflowKeys.lists() },
        (old) => (old ? old.filter((w) => w.id !== workflowId) : old),
      );
    },
    onError: (error) => {
      const msg =
        error instanceof Error ? error.message : "Failed to delete workflow";
      setMutationError(msg);
      console.error("Failed to delete workflow:", error);
    },
    onSettled: () => {
      setIsDeleting(false);
    },
    onMutate: () => {
      setIsDeleting(true);
      setMutationError(null);
    },
  });
};
