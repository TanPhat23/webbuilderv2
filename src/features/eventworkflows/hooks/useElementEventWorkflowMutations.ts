import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createElementEventWorkflow,
  disconnectElementEventWorkflow,
} from "@/features/eventworkflows";
import {
  CreateElementEventWorkflowSchema,
  getFirstError,
  validateCreateConnection,
  validateDisconnectConnection,
} from "@/features/eventworkflows/schema/elementEventWorkflowSchemas";
import { EventTypeSchema } from "@/features/eventworkflows/schema/eventSchemas";
import {
  elementEventWorkflowKeys,
  type IElementEventWorkflowConnection,
  useElementEventWorkflowStore,
} from "@/features/editor";
import { showErrorToast, showSuccessToast } from "@/utils/errors/errorToast";
import { getErrorMessage } from "@/hooks/utils/mutationUtils";
import { z } from "zod";

type ConnectionVariables = {
  elementId: string;
  eventType: string;
  workflowId: string;
};

type DisconnectConnectionResult = {
  elementId: string;
  connectionId: string;
};

const getElementConnectionsFromCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  elementId: string,
): IElementEventWorkflowConnection[] =>
  queryClient.getQueryData<IElementEventWorkflowConnection[]>(
    elementEventWorkflowKeys.byElement(elementId),
  ) ?? [];

export const useConnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId,
    }: ConnectionVariables): Promise<IElementEventWorkflowConnection> => {
      const validation = validateCreateConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });

      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid connection data");
      }

      const cachedConnections = getElementConnectionsFromCache(
        queryClient,
        elementId,
      );

      if (
        cachedConnections.some(
          (connection) =>
            connection.eventName === eventType &&
            connection.workflowId === workflowId,
        )
      ) {
        throw new Error("Workflow already connected to this event");
      }

      const validatedConnection = CreateElementEventWorkflowSchema.parse({
        elementId,
        eventName: eventType,
        workflowId,
      });

      return createElementEventWorkflow({
        data: {
          elementId: validatedConnection.elementId,
          workflowId: validatedConnection.workflowId,
          eventName: validatedConnection.eventName,
        },
      });
    },

    onSuccess: (connection, { elementId }) => {
      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (oldConnections) => [...(oldConnections ?? []), connection],
      );

      useElementEventWorkflowStore.getState().addConnection(connection);
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
    }: ConnectionVariables): Promise<DisconnectConnectionResult> => {
      const validation = validateDisconnectConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });

      if (!validation.success) {
        throw new Error(getFirstError(validation) ?? "Invalid disconnect data");
      }

      const cachedConnections = getElementConnectionsFromCache(
        queryClient,
        elementId,
      );

      const connection = cachedConnections.find(
        (cachedConnection) =>
          cachedConnection.eventName === eventType &&
          cachedConnection.workflowId === workflowId,
      );

      if (!connection) {
        throw new Error("Connection not found");
      }

      const result = await disconnectElementEventWorkflow({
        data: {
          elementId,
          eventName: eventType as z.infer<typeof EventTypeSchema>,
          workflowId,
        },
      });

      return {
        elementId,
        connectionId: result.connectionId,
      };
    },

    onSuccess: ({ elementId, connectionId }) => {
      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (oldConnections) =>
          oldConnections?.filter(
            (connection) => connection.id !== connectionId,
          ) ?? [],
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
