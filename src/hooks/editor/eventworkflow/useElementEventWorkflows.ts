import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { elementEventWorkflowService } from "@/services/elementEventWorkflow";
import { EventWorkflow } from "@/interfaces/eventWorkflow.interface";
import {
  elementEventWorkflowKeys,
  type IElementEventWorkflowConnection,
  getConnectedWorkflowsForEvent,
  isWorkflowConnected as isWorkflowConnectedFn,
  getWorkflowConnections as getWorkflowConnectionsFn,
  isConnectedToEvent as isConnectedToEventFn,
  useElementEventWorkflowStore,
} from "@/globalstore/element-event-workflow-store";
import { getErrorMessage } from "@/lib/utils/hooks/mutationUtils";
import {
  useConnectElementEventWorkflow,
  useDisconnectElementEventWorkflow,
} from "./useElementEventWorkflowMutations";

export function usePageElementConnections(pageId: string | undefined) {
  const queryClient = useQueryClient();
  const { setPageConnections, setPageLoading } = useElementEventWorkflowStore();

  return useQuery({
    queryKey: elementEventWorkflowKeys.byPage(pageId ?? ""),
    queryFn: async () => {
      setPageLoading(pageId!, true);

      const response =
        await elementEventWorkflowService.getElementEventWorkflowsByPage(
          pageId!,
        );

      const connections = Array.isArray(response)
        ? (response as IElementEventWorkflowConnection[])
        : [];

      const grouped = new Map<string, IElementEventWorkflowConnection[]>();
      for (const conn of connections) {
        const bucket = grouped.get(conn.elementId) ?? [];
        bucket.push(conn);
        grouped.set(conn.elementId, bucket);
      }

      grouped.forEach((elementConnections, elementId) => {
        queryClient.setQueryData<IElementEventWorkflowConnection[]>(
          elementEventWorkflowKeys.byElement(elementId),
          elementConnections,
        );
      });

      setPageConnections(pageId!, connections);

      return connections;
    },
    enabled: !!pageId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });
}

export function useElementConnections(
  elementId: string | undefined,
  pageId?: string,
) {
  const queryClient = useQueryClient();

  usePageElementConnections(pageId);

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
    enabled: !!elementId && !pageId,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    initialData: pageId
      ? () => {
          const pageData = queryClient.getQueryData<
            IElementEventWorkflowConnection[]
          >(elementEventWorkflowKeys.byPage(pageId));

          if (!pageData) return undefined;

          return pageData.filter((conn) => conn.elementId === elementId);
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
  const query = useElementConnections(elementId);
  const connections = query.data ?? [];

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
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error
      ? getErrorMessage(query.error, "Failed to load connections")
      : mutationError
        ? getErrorMessage(mutationError, "Operation failed")
        : null,
    getConnectedWorkflows,
    isWorkflowConnected,
    getWorkflowConnections,
    isConnectedToEvent,
    handleConnect: (eventType: string, workflowId: string) =>
      elementId
        ? connectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),
    handleDisconnect: (eventType: string, workflowId: string) =>
      elementId
        ? disconnectMutation.mutateAsync({ elementId, eventType, workflowId })
        : Promise.reject(new Error("Missing elementId")),
    isConnecting: connectMutation.isPending,
    isDisconnecting: disconnectMutation.isPending,
    invalidateAll,
    invalidateElement,
    refetch: query.refetch,
  };
}
