import { useMutation, useQueryClient } from "@tanstack/react-query";
import { elementEventWorkflowService } from "@/services/elementEventWorkflow";
import {
  CreateElementEventWorkflowSchema,
  getFirstError,
  validateCreateConnection,
  validateDisconnectConnection,
} from "@/schema/elementEventWorkflowSchemas";
import {
  elementEventWorkflowKeys,
  type IElementEventWorkflowConnection,
  useElementEventWorkflowStore,
} from "@/globalstore/element-event-workflow-store";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils/errors/errorToast";
import { getErrorMessage } from "@/lib/utils/hooks/mutationUtils";

type ConnectionVariables = {
  elementId: string;
  eventType: string;
  workflowId: string;
};

export const useConnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId,
    }: ConnectionVariables) => {
      const validation = validateCreateConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid connection data");
      }

      const cached =
        queryClient.getQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
        ) ?? [];

      if (
        cached.some(
          (c) => c.eventName === eventType && c.workflowId === workflowId,
        )
      ) {
        throw new Error("Workflow already connected to this event");
      }

      const validated = CreateElementEventWorkflowSchema.parse({
        elementId,
        eventName: eventType,
        workflowId,
      });

      return elementEventWorkflowService.createElementEventWorkflow({
        elementId: validated.elementId,
        workflowId: validated.workflowId,
        eventName: validated.eventName,
      });
    },

    onSuccess: (newConnection, { elementId }) => {
      const conn = newConnection as IElementEventWorkflowConnection;

      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => [...(old ?? []), conn],
      );

      useElementEventWorkflowStore.getState().addConnection(conn);
      showSuccessToast("Workflow connected successfully!");
    },

    onError: (error) => {
      if (
        error instanceof Error &&
        error.message === "Workflow already connected to this event"
      ) {
        showSuccessToast(error.message);
        return;
      }

      if (error instanceof Error && error.message.startsWith("Invalid")) {
        showErrorToast(error.message);
        return;
      }

      showErrorToast(getErrorMessage(error, "Failed to connect workflow"));
    },
  });
};

export const useDisconnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId,
    }: ConnectionVariables) => {
      const validation = validateDisconnectConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid disconnect data");
      }

      const cached =
        queryClient.getQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
        ) ?? [];

      const connection = cached.find(
        (c) => c.eventName === eventType && c.workflowId === workflowId,
      );

      if (!connection) throw new Error("Connection not found");

      await elementEventWorkflowService.deleteElementEventWorkflow(
        connection.id,
      );

      return { elementId, connectionId: connection.id };
    },

    onSuccess: ({ elementId, connectionId }) => {
      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => old?.filter((c) => c.id !== connectionId) ?? [],
      );

      useElementEventWorkflowStore
        .getState()
        .removeConnection(connectionId, elementId);
      showSuccessToast("Workflow disconnected");
    },

    onError: (error) => {
      showErrorToast(getErrorMessage(error, "Failed to disconnect workflow"));
    },
  });
};
