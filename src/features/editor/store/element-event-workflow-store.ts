import { getQueryClient } from "@/client/queryclient";
import { WORKFLOW_EVENT_TYPES } from "@/features/eventworkflows";
import { EventWorkflow } from "@/features/eventworkflows";


export interface IElementEventWorkflowConnection {
  id: string;
  elementId: string;
  eventName: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}

export const elementEventWorkflowKeys = {
  all: ["elementEventWorkflows"] as const,
  byElements: () => [...elementEventWorkflowKeys.all, "byElement"] as const,
  byElement: (elementId: string) =>
    [...elementEventWorkflowKeys.byElements(), elementId] as const,
  byPages: () => [...elementEventWorkflowKeys.all, "byPage"] as const,
  byPage: (pageId: string) =>
    [...elementEventWorkflowKeys.byPages(), pageId] as const,
};


export function getConnectionsFromCache(
  elementId: string,
): IElementEventWorkflowConnection[] {
  const qc = getQueryClient();
  return (
    qc.getQueryData<IElementEventWorkflowConnection[]>(
      elementEventWorkflowKeys.byElement(elementId),
    ) ?? []
  );
}


export function getConnectedWorkflowsForEvent(
  connections: IElementEventWorkflowConnection[],
  eventType: string,
  workflows: EventWorkflow[],
): EventWorkflow[] {
  return connections
    .filter((conn) => conn.eventName === eventType)
    .map((conn) => workflows.find((w) => w.id === conn.workflowId))
    .filter(Boolean) as EventWorkflow[];
}

export function isWorkflowConnected(
  connections: IElementEventWorkflowConnection[],
  workflowId: string,
): boolean {
  return connections.some((conn) => conn.workflowId === workflowId);
}

export function getWorkflowConnections(
  connections: IElementEventWorkflowConnection[],
  workflowId: string,
) {
  return WORKFLOW_EVENT_TYPES.filter((event) =>
    connections.some(
      (conn) =>
        conn.workflowId === workflowId && conn.eventName === event.value,
    ),
  );
}

export function isConnectedToEvent(
  connections: IElementEventWorkflowConnection[],
  eventType: string,
  workflowId: string,
): boolean {
  return connections.some(
    (conn) => conn.eventName === eventType && conn.workflowId === workflowId,
  );
}
