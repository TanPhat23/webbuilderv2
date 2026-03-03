"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import {
  Connection,
  NodeType,
  Position,
  WorkflowData,
  WorkflowNode,
  CanvasState,
  SelectionState,
} from "@/features/eventworkflows/components";

interface WorkflowCanvasStore {
  // State
  workflow: WorkflowData;
  selection: SelectionState;
  zoom: number;
  panX: number;
  panY: number;

  // Node operations
  addNode: (
    type: NodeType,
    position: Position,
    data: Omit<WorkflowNode["data"], "">,
  ) => string;
  updateNode: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (nodeId: string) => void;
  getNode: (nodeId: string) => WorkflowNode | undefined;

  // Connection operations
  addConnection: (
    source: string,
    target: string,
    sourcePort?: string,
  ) => string;
  deleteConnection: (connectionId: string) => void;
  getConnectionsForNode: (nodeId: string) => Connection[];

  // Selection operations
  selectNode: (nodeId: string | undefined) => void;
  selectConnection: (connectionId: string | undefined) => void;
  deselectAll: () => void;

  // Canvas operations
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  resetView: () => void;

  // Workflow operations
  loadWorkflow: (workflow: WorkflowData) => void;
  getWorkflow: () => WorkflowData;
  clearWorkflow: () => void;

  // Batch operations
  deleteNodeWithConnections: (nodeId: string) => void;
  moveNode: (nodeId: string, position: Position) => void;
}

const initialState: CanvasState = {
  workflow: {
    nodes: [],
    connections: [],
    metadata: {},
  },
  selection: {
    selectedNodeId: undefined,
    selectedConnectionId: undefined,
  },
  zoom: 1,
  panX: 0,
  panY: 0,
};

export const useWorkflowCanvas = create<WorkflowCanvasStore>((set, get) => ({
  ...initialState,

  // Node operations
  addNode: (type, position, data) => {
    const nodeId = uuidv4();
    const newNode: WorkflowNode = {
      id: nodeId,
      type,
      position,
      data: {
        ...data,
      },
      inputs:
        type !== NodeType.TRIGGER ? { port: `${nodeId}-input` } : undefined,
      outputs:
        type !== NodeType.OUTPUT ? [{ port: `${nodeId}-output` }] : undefined,
    };

    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: [...state.workflow.nodes, newNode],
      },
    }));

    return nodeId;
  },

  updateNode: (nodeId, updates) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map((node) =>
          node.id === nodeId ? { ...node, ...updates } : node,
        ),
      },
    }));
  },

  deleteNode: (nodeId: string) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.filter((node) => node.id !== nodeId),
        connections: state.workflow.connections.filter(
          (conn: Connection) =>
            conn.source !== nodeId && conn.target !== nodeId,
        ),
      },
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: undefined,
      },
    }));
  },

  getNode: (nodeId: string) => {
    const state = get();
    return state.workflow.nodes.find(
      (node: WorkflowNode) => node.id === nodeId,
    );
  },

  // Connection operations
  addConnection: (source: string, target: string, sourcePort?: string) => {
    const connectionId = uuidv4();
    const sourceNode = get().getNode(source);
    const targetNode = get().getNode(target);

    // Prevent cycles and self-connections
    if (source === target || !sourceNode || !targetNode) {
      return "";
    }

    const newConnection: Connection = {
      id: connectionId,
      source,
      target,
      sourcePort: sourcePort ?? `${source}-output`,
      targetPort: `${target}-input`,
    };

    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: [...state.workflow.connections, newConnection],
      },
    }));

    return connectionId;
  },

  deleteConnection: (connectionId: string) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        connections: state.workflow.connections.filter(
          (conn: Connection) => conn.id !== connectionId,
        ),
      },
      selection: {
        ...state.selection,
        selectedConnectionId: undefined,
      },
    }));
  },

  getConnectionsForNode: (nodeId: string) => {
    const state = get();
    return state.workflow.connections.filter(
      (conn: Connection) => conn.source === nodeId || conn.target === nodeId,
    );
  },

  // Selection operations
  selectNode: (nodeId: string | undefined) => {
    set({
      selection: {
        selectedNodeId: nodeId,
        selectedConnectionId: undefined,
      },
    });
  },

  selectConnection: (connectionId: string | undefined) => {
    set({
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: connectionId,
      },
    });
  },

  deselectAll: () => {
    set({
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: undefined,
      },
    });
  },

  // Canvas operations
  setZoom: (zoom: number) => {
    set({ zoom: Math.max(0.5, Math.min(zoom, 3)) });
  },

  setPan: (x: number, y: number) => {
    set({ panX: x, panY: y });
  },

  resetView: () => {
    set({
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  // Workflow operations
  loadWorkflow: (workflow: WorkflowData) => {
    set({
      workflow,
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: undefined,
      },
    });
  },

  getWorkflow: () => {
    return get().workflow;
  },

  clearWorkflow: () => {
    set({
      workflow: {
        nodes: [],
        connections: [],
        metadata: {},
      },
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: undefined,
      },
      zoom: 1,
      panX: 0,
      panY: 0,
    });
  },

  // Batch operations
  deleteNodeWithConnections: (nodeId: string) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.filter(
          (node: WorkflowNode) => node.id !== nodeId,
        ),
        connections: state.workflow.connections.filter(
          (conn: Connection) =>
            conn.source !== nodeId && conn.target !== nodeId,
        ),
      },
      selection: {
        selectedNodeId: undefined,
        selectedConnectionId: undefined,
      },
    }));
  },

  moveNode: (nodeId: string, position: Position) => {
    set((state) => ({
      workflow: {
        ...state.workflow,
        nodes: state.workflow.nodes.map((node: WorkflowNode) =>
          node.id === nodeId ? { ...node, position } : node,
        ),
      },
    }));
  },
}));

export default useWorkflowCanvas;
