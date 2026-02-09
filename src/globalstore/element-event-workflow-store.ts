import { create } from "zustand";
import { getQueryClient } from "@/client/queryclient";
import { EVENT_TYPES } from "@/constants/eventWorkflows";
import { EventWorkflow } from "@/interfaces/eventWorkflow.interface";

// ─── Types ───────────────────────────────────────────────────────────
export interface IElementEventWorkflowConnection {
  id: string;
  elementId: string;
  eventName: string;
  workflowId: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Query Key Factory ──────────────────────────────────────────────
// Hierarchical keys enable React Query filter-based invalidation:
//   queryKey: ["elementEventWorkflows"]                           → matches ALL
//   queryKey: ["elementEventWorkflows", "byElement"]              → matches all element queries
//   queryKey: ["elementEventWorkflows", "byElement", elementId]   → exact element
// ─────────────────────────────────────────────────────────────────────
export const elementEventWorkflowKeys = {
  all: ["elementEventWorkflows"] as const,
  byElements: () => [...elementEventWorkflowKeys.all, "byElement"] as const,
  byElement: (elementId: string) =>
    [...elementEventWorkflowKeys.byElements(), elementId] as const,
};

// ─── Zustand Store (state + helpers only) ────────────────────────────
interface ElementEventWorkflowState {
  isConnecting: boolean;
  isDisconnecting: boolean;
  mutationError: string | null;

  setIsConnecting: (value: boolean) => void;
  setIsDisconnecting: (value: boolean) => void;
  setMutationError: (value: string | null) => void;

  resetFlags: () => void;

  // Cache helpers (non-React, use getQueryClient)
  invalidateAll: () => void;
  invalidateElement: (elementId: string) => void;
  resetCache: () => void;
}

export const useElementEventWorkflowStore = create<ElementEventWorkflowState>(
  (set) => ({
    isConnecting: false,
    isDisconnecting: false,
    mutationError: null,

    setIsConnecting: (value) => set({ isConnecting: value }),
    setIsDisconnecting: (value) => set({ isDisconnecting: value }),
    setMutationError: (value) => set({ mutationError: value }),

    resetFlags: () =>
      set({
        isConnecting: false,
        isDisconnecting: false,
        mutationError: null,
      }),

    invalidateAll: () => {
      const qc = getQueryClient();
      qc.invalidateQueries({ queryKey: elementEventWorkflowKeys.all });
    },

    invalidateElement: (elementId: string) => {
      const qc = getQueryClient();
      qc.invalidateQueries({
        queryKey: elementEventWorkflowKeys.byElement(elementId),
        exact: true,
      });
    },

    resetCache: () => {
      const qc = getQueryClient();
      qc.removeQueries({ queryKey: elementEventWorkflowKeys.all });
    },
  }),
);

// ─── Non-React helpers ──────────────────────────────────────────────
/**
 * Read connections for an element from the React Query cache synchronously.
 * Returns empty array if not cached.
 */
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

/**
 * Synchronous helpers for deriving connection state.
 * Useful outside React or in custom hooks.
 */
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
  return EVENT_TYPES.filter((event) =>
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
