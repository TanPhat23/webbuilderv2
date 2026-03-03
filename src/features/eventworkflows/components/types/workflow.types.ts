export enum NodeType {
  TRIGGER = "trigger",
  ACTION = "action",
  CONDITION = "condition",
  OUTPUT = "output",
  ELEMENT = "element",
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
    config?: Record<string, unknown>;
    // Element node specific
    elementId?: string;
    elementName?: string;
    elementType?: string;
    connectedEvents?: string[]; // event types wired from this element node
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
  sourcePort?: string; // event type when source is an ELEMENT node (e.g. "onClick")
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
  // Element drag data
  elementId?: string;
  elementName?: string;
  elementType?: string;
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
