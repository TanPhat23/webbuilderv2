import { create } from "zustand";
import { getQueryClient } from "@/client/queryclient";
import { WORKFLOW_EVENT_TYPES } from "@/features/eventworkflows";
import { EventWorkflow } from "@/features/eventworkflows";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface IElementEventWorkflowConnection {
  id: string;
  elementId: string;
  eventName: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}

type ConnectionsMap = Record<string, IElementEventWorkflowConnection[]>;

interface ElementEventWorkflowState {
  connectionsByElement: ConnectionsMap;
  loadedPages: Set<string>;
  loadingPages: Set<string>;

  setPageConnections: (
    pageId: string,
    connections: IElementEventWorkflowConnection[],
  ) => void;
  addConnection: (connection: IElementEventWorkflowConnection) => void;
  removeConnection: (connectionId: string, elementId: string) => void;
  getElementConnections: (
    elementId: string,
  ) => IElementEventWorkflowConnection[];
  isPageLoaded: (pageId: string) => boolean;
  setPageLoading: (pageId: string, loading: boolean) => void;
  reset: () => void;
}

// ─── Query Key Factory ────────────────────────────────────────────────────────

export const elementEventWorkflowKeys = {
  all: ["elementEventWorkflows"] as const,
  byElements: () => [...elementEventWorkflowKeys.all, "byElement"] as const,
  byElement: (elementId: string) =>
    [...elementEventWorkflowKeys.byElements(), elementId] as const,
  byPages: () => [...elementEventWorkflowKeys.all, "byPage"] as const,
  byPage: (pageId: string) =>
    [...elementEventWorkflowKeys.byPages(), pageId] as const,
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useElementEventWorkflowStore = create<ElementEventWorkflowState>()(
  (set, get) => ({
    connectionsByElement: {},
    loadedPages: new Set(),
    loadingPages: new Set(),

    setPageConnections: (pageId, connections) => {
      const grouped: ConnectionsMap = {};
      for (const conn of connections) {
        if (!grouped[conn.elementId]) grouped[conn.elementId] = [];
        grouped[conn.elementId].push(conn);
      }

      set((state) => {
        const loadedPages = new Set(state.loadedPages);
        const loadingPages = new Set(state.loadingPages);
        loadedPages.add(pageId);
        loadingPages.delete(pageId);

        return {
          connectionsByElement: { ...state.connectionsByElement, ...grouped },
          loadedPages,
          loadingPages,
        };
      });
    },

    addConnection: (connection) => {
      set((state) => {
        const existing = state.connectionsByElement[connection.elementId] ?? [];
        const alreadyExists = existing.some((c) => c.id === connection.id);
        if (alreadyExists) return state;

        return {
          connectionsByElement: {
            ...state.connectionsByElement,
            [connection.elementId]: [...existing, connection],
          },
        };
      });
    },

    removeConnection: (connectionId, elementId) => {
      set((state) => {
        const existing = state.connectionsByElement[elementId] ?? [];
        return {
          connectionsByElement: {
            ...state.connectionsByElement,
            [elementId]: existing.filter((c) => c.id !== connectionId),
          },
        };
      });
    },

    getElementConnections: (elementId) => {
      return get().connectionsByElement[elementId] ?? [];
    },

    isPageLoaded: (pageId) => {
      return get().loadedPages.has(pageId);
    },

    setPageLoading: (pageId, loading) => {
      set((state) => {
        const loadingPages = new Set(state.loadingPages);
        if (loading) {
          loadingPages.add(pageId);
        } else {
          loadingPages.delete(pageId);
        }
        return { loadingPages };
      });
    },

    reset: () => {
      set({
        connectionsByElement: {},
        loadedPages: new Set(),
        loadingPages: new Set(),
      });
    },
  }),
);

// ─── React Query cache helpers ────────────────────────────────────────────────

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

// ─── Pure utilities ───────────────────────────────────────────────────────────

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
