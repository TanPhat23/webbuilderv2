import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getElementEventWorkflowsByElement,
  getElementEventWorkflowsByPage,
  type EventWorkflow,
} from "@/features/eventworkflows";
import {
  elementEventWorkflowKeys,
  type IElementEventWorkflowConnection,
  getConnectedWorkflowsForEvent,
  isWorkflowConnected as isWorkflowConnectedFn,
  getWorkflowConnections as getWorkflowConnectionsFn,
  isConnectedToEvent as isConnectedToEventFn,
  useElementEventWorkflowStore,
} from "@/features/editor";
import { getErrorMessage } from "@/hooks/utils/mutationUtils";
import {
  useConnectElementEventWorkflow,
  useDisconnectElementEventWorkflow,
} from "./useElementEventWorkflowMutations";

const fetchPageElementConnections = async (
  pageId: string,
): Promise<IElementEventWorkflowConnection[]> =>
  getElementEventWorkflowsByPage({
    data: { pageId },
  });

const fetchElementConnections = async (
  elementId: string,
): Promise<IElementEventWorkflowConnection[]> =>
  getElementEventWorkflowsByElement({
    data: { elementId },
  });

export function usePageElementConnections(pageId: string | undefined) {
  const queryClient = useQueryClient();
  const { setPageConnections, setPageLoading } = useElementEventWorkflowStore();

  return useQuery<IElementEventWorkflowConnection[]>({
    queryKey: elementEventWorkflowKeys.byPage(pageId ?? ""),
    queryFn: async () => {
      if (!pageId) {
        return [];
      }

      setPageLoading(pageId, true);

      const connections = await fetchPageElementConnections(pageId);
      const groupedConnections = new Map<
        string,
        IElementEventWorkflowConnection[]
      >();

      for (const connection of connections) {
        const existingConnections =
          groupedConnections.get(connection.elementId) ?? [];
        existingConnections.push(connection);
        groupedConnections.set(connection.elementId, existingConnections);
      }

      groupedConnections.forEach((elementConnections, elementId) => {
        queryClient.setQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
          elementConnections,
        );
      });

      setPageConnections(pageId, connections);

      return connections;
    },
    enabled: pageId !== undefined && pageId.length > 0,
  });
}

export function useElementConnections(
  elementId: string | undefined,
  pageId?: string,
) {
  const queryClient = useQueryClient();

  usePageElementConnections(pageId);

  return useQuery<IElementEventWorkflowConnection[]>({
    queryKey: elementEventWorkflowKeys.byElement(elementId ?? ""),
    queryFn: async () => {
      if (!elementId) {
        return [];
      }

      return fetchElementConnections(elementId);
    },
    enabled: elementId !== undefined && elementId.length > 0 && !pageId,
    initialData: pageId
      ? () => {
          const pageConnections = queryClient.getQueryData<
            IElementEventWorkflowConnection[]
          >(elementEventWorkflowKeys.byPage(pageId));

          if (!pageConnections) {
            return undefined;
          }

          return pageConnections.filter(
            (connection) => connection.elementId === elementId,
          );
        }
      : undefined,
    initialDataUpdatedAt: pageId
      ? () =>
          queryClient.getQueryState(elementEventWorkflowKeys.byPage(pageId))
            ?.dataUpdatedAt
      : undefined,
  });
}

export function useElementEventWorkflowActions(elementId: string | undefined) {
  const queryClient = useQueryClient();
  const connectionsQuery = useElementConnections(elementId);
  const connections = connectionsQuery.data ?? [];

  const connectMutation = useConnectElementEventWorkflow();
  const disconnectMutation = useDisconnectElementEventWorkflow();

  const mutationError = connectMutation.error ?? disconnectMutation.error;

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

  const handleConnect = useCallback(
    (eventType: string, workflowId: string) =>
      elementId
        ? connectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),
    [connectMutation, elementId],
  );

  const handleDisconnect = useCallback(
    (eventType: string, workflowId: string) =>
      elementId
        ? disconnectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),
    [disconnectMutation, elementId],
  );

  const invalidateAll = useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: elementEventWorkflowKeys.all,
      }),
    [queryClient],
  );

  const invalidateElement = useCallback(
    (id: string) =>
      queryClient.invalidateQueries({
        queryKey: elementEventWorkflowKeys.byElement(id),
        exact: true,
      }),
    [queryClient],
  );

  return {
    connections,
    isLoading: connectionsQuery.isLoading,
    isFetching: connectionsQuery.isFetching,
    error: connectionsQuery.error
      ? getErrorMessage(connectionsQuery.error, "Failed to load connections")
      : mutationError
        ? getErrorMessage(mutationError, "Operation failed")
        : null,
    getConnectedWorkflows,
    isWorkflowConnected,
    getWorkflowConnections,
    isConnectedToEvent,
    handleConnect,
    handleDisconnect,
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    invalidateAll,
    invalidateElement,
    refetch: connectionsQuery.refetch,
  };
}
