/**
 * useElementEventWorkflowMutations.ts
 *
 * React Query mutations for connecting and disconnecting element event
 * workflows. Uses the centralized toast utilities and `getErrorMessage`
 * for consistent error handling.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { elementEventWorkflowService } from "@/services/elementEventWorkflow";
import {
  CreateElementEventWorkflowSchema,
  DisconnectElementEventWorkflowSchema,
  getFirstError,
  validateCreateConnection,
  validateDisconnectConnection,
} from "@/schema/elementEventWorkflowSchemas";
import {
  elementEventWorkflowKeys,
  useElementEventWorkflowStore,
  type IElementEventWorkflowConnection,
} from "@/globalstore/element-event-workflow-store";
import {
  showErrorToast,
  showSuccessToast,
} from "@/lib/utils/errors/errorToast";
import { getErrorMessage } from "@/lib/utils/hooks/mutationUtils";

type ConnectVariables = {
  elementId: string;
  eventType: string;
  workflowId: string;
};

type DisconnectVariables = {
  elementId: string;
  eventType: string;
  workflowId: string;
};

/** Hook to connect an element event to a workflow. */
export const useConnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();
  const setIsConnecting = useElementEventWorkflowStore(
    (s) => s.setIsConnecting,
  );
  const setMutationError = useElementEventWorkflowStore(
    (s) => s.setMutationError,
  );

  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId,
    }: ConnectVariables) => {
      const validation = validateCreateConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) || "Invalid connection data");
      }

      const cached =
        queryClient.getQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
        ) ?? [];

      const isDuplicate = cached.some(
        (c) => c.eventName === eventType && c.workflowId === workflowId,
      );
      if (isDuplicate) {
        throw new Error("Workflow already connected to this event");
      }

      const validatedData = CreateElementEventWorkflowSchema.parse({
        elementId,
        eventName: eventType,
        workflowId,
      });

      return elementEventWorkflowService.createElementEventWorkflow({
        elementId: validatedData.elementId,
        workflowId: validatedData.workflowId,
        eventName: validatedData.eventName,
      });
    },
    onMutate: () => {
      setIsConnecting(true);
      setMutationError(null);
    },
    onSuccess: (newConnection, variables) => {
      const { elementId } = variables;

      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => [
          ...(old ?? []),
          newConnection as IElementEventWorkflowConnection,
        ],
      );

      setMutationError(null);
      showSuccessToast("Workflow connected successfully!");
    },
    onError: (error) => {
      if (error instanceof Error) {
        if (error.message === "Workflow already connected to this event") {
          setMutationError(null);
          showSuccessToast(error.message);
          return;
        }
        if (error.message.startsWith("Invalid")) {
          setMutationError(error.message);
          showErrorToast(error.message);
          return;
        }
      }
      const msg = getErrorMessage(error, "Failed to connect workflow");
      setMutationError(msg);
      // eslint-disable-next-line no-console
      console.error("Failed to connect workflow:", error);
      showErrorToast("Failed to connect workflow");
    },
    onSettled: () => {
      setIsConnecting(false);
    },
  });
};

/** Hook to disconnect an element event from a workflow. */
export const useDisconnectElementEventWorkflow = () => {
  const queryClient = useQueryClient();
  const setIsDisconnecting = useElementEventWorkflowStore(
    (s) => s.setIsDisconnecting,
  );
  const setMutationError = useElementEventWorkflowStore(
    (s) => s.setMutationError,
  );

  return useMutation({
    mutationFn: async ({
      elementId,
      eventType,
      workflowId,
    }: DisconnectVariables) => {
      const validation = validateDisconnectConnection({
        elementId,
        eventName: eventType,
        workflowId,
      });
      if (!validation.success) {
        throw new Error(getFirstError(validation) || "Invalid disconnect data");
      }

      DisconnectElementEventWorkflowSchema.parse({
        elementId,
        eventName: eventType,
        workflowId,
      });

      const cached =
        queryClient.getQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
        ) ?? [];

      const connection = cached.find(
        (c) => c.eventName === eventType && c.workflowId === workflowId,
      );

      if (!connection) {
        throw new Error("Connection not found");
      }

      await elementEventWorkflowService.deleteElementEventWorkflow(
        connection.id,
      );

      return { elementId, connectionId: connection.id };
    },
    onMutate: () => {
      setIsDisconnecting(true);
      setMutationError(null);
    },
    onSuccess: ({ elementId, connectionId }) => {
      queryClient.setQueryData<IElementEventWorkflowConnection[]>(
        elementEventWorkflowKeys.byElement(elementId),
        (old) => (old ? old.filter((c) => c.id !== connectionId) : []),
      );

      setMutationError(null);
      showSuccessToast("Workflow disconnected");
    },
    onError: (error) => {
      const msg = getErrorMessage(error, "Failed to disconnect workflow");
      setMutationError(msg);
      // eslint-disable-next-line no-console
      console.error("Failed to disconnect workflow:", error);
      showErrorToast("Failed to disconnect workflow");
    },
    onSettled: () => {
      setIsDisconnecting(false);
    },
  });
};
