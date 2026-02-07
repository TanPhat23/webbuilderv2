import { useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { elementEventWorkflowService } from "@/services/elementEventWorkflow";
import { EventWorkflow } from "@/interfaces/eventWorkflow.interface";
import {
  elementEventWorkflowKeys,
  useElementEventWorkflowStore,
  type IElementEventWorkflowConnection,
  getConnectedWorkflowsForEvent,
  isWorkflowConnected as isWorkflowConnectedFn,
  getWorkflowConnections as getWorkflowConnectionsFn,
  isConnectedToEvent as isConnectedToEventFn,
} from "@/globalstore/elementeventworkflowstore";
import {
  useConnectElementEventWorkflow,
  useDisconnectElementEventWorkflow,
} from "./useElementEventWorkflowMutations";

/**
 * Fetch element-event-workflow connections for a given element.
 * React Query handles stale time, gc, deduplication, and background refetch.
 */
export function useElementConnections(elementId: string | undefined) {
  return useQuery({
    queryKey: elementEventWorkflowKeys.byElement(elementId ?? ""),
    queryFn: async () => {
      if (!elementId) return [];
      const result =
        await elementEventWorkflowService.getElementEventWorkflowsByElement(
          elementId,
        );
      return Array.isArray(result)
        ? (result as IElementEventWorkflowConnection[])
        : [];
    },
    enabled: !!elementId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

/**
 * Convenience hook that returns connections + mutation actions + derived helpers.
 */
export function useElementEventWorkflowActions(elementId: string | undefined) {
  const query = useElementConnections(elementId);
  const store = useElementEventWorkflowStore();
  const connections = query.data ?? [];

  const connectMutation = useConnectElementEventWorkflow();
  const disconnectMutation = useDisconnectElementEventWorkflow();

  const getConnectedWorkflows = useCallback(
    (eventType: string, workflows: EventWorkflow[]) =>
      getConnectedWorkflowsForEvent(connections, eventType, workflows),
    [connections],
  );

  const isWorkflowConnected = useCallback(
    (workflowId: string) => isWorkflowConnectedFn(connections, workflowId),
    [connections],
  );

  const getWorkflowConnections = useCallback(
    (workflowId: string) => getWorkflowConnectionsFn(connections, workflowId),
    [connections],
  );

  const isConnectedToEvent = useCallback(
    (eventType: string, workflowId: string) =>
      isConnectedToEventFn(connections, eventType, workflowId),
    [connections],
  );

  return {
    // React Query data
    connections,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Failed to load connections"
      : store.mutationError,

    // Computed getters
    getConnectedWorkflows,
    isWorkflowConnected,
    getWorkflowConnections,
    isConnectedToEvent,

    // Mutation actions
    handleConnect: (eventType: string, workflowId: string) =>
      elementId
        ? connectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),
    handleDisconnect: (eventType: string, workflowId: string) =>
      elementId
        ? disconnectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),

    // Mutation flags (from store)
    isConnecting: store.isConnecting,
    isDisconnecting: store.isDisconnecting,

    // Cache helpers
    invalidateAll: store.invalidateAll,
    invalidateElement: store.invalidateElement,

    // Pass-through for components needing the raw query
    refetch: query.refetch,
  };
}
