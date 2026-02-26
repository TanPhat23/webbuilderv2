/**
 * Workflow Canvas Types and Interfaces
 * Similar to n8n's node-based workflow system
 */

export enum NodeType {
  TRIGGER = "trigger",
  ACTION = "action",
  CONDITION = "condition",
  OUTPUT = "output",
}

export interface Position {
  x: number;
  y: number;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: Position;
  data: {
    label: string;
    description?: string;
    icon?: string;
    config?: Record<string, any>;
  };
  inputs?: {
    port: string;
  };
  outputs?: {
    port: string;
  }[];
}

export interface Connection {
  id: string;
  source: string; // node id
  target: string; // node id
  sourcePort?: string;
  targetPort?: string;
}

export interface WorkflowData {
  nodes: WorkflowNode[];
  connections: Connection[];
  metadata?: {
    name?: string;
    description?: string;
  };
}

export interface DragData {
  type: string;
  nodeType: NodeType;
  label: string;
  icon?: string;
}

export interface SelectionState {
  selectedNodeId?: string;
  selectedConnectionId?: string;
}

export interface CanvasState {
  workflow: WorkflowData;
  selection: SelectionState;
  zoom: number;
  panX: number;
  panY: number;
}
