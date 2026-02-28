import { Node } from "reactflow";
import {
  NodeType,
  Position,
  WorkflowNode,
} from "@/features/eventworkflows/components/types/workflow.types";
import { getDefaultNodeConfig } from "@/features/eventworkflows/utils/workflowBuild";

export interface WorkflowNodeData {
  label: string;
  description?: string;
  icon?: string;
  type: NodeType;
  config?: Record<string, unknown>;
  onSelect?: () => void;
  onConfigure?: (nodeId: string) => void;
}

export interface ElementNodeData {
  label: string;
  elementId: string;
  elementName: string;
  elementType?: string;
  connectedEvents: string[];
}

export type ReactFlowNodeData = WorkflowNodeData | ElementNodeData;

export interface CreateNodeInput {
  id: string;
  position: Position;
  label?: string;
  elementId?: string;
  elementName?: string;
  elementType?: string;
  onSelect?: () => void;
  onConfigure?: (nodeId: string) => void;
}

export interface MapNodeInput {
  node: WorkflowNode;
  connectedEvents?: string[];
  onSelect?: () => void;
  onConfigure?: (nodeId: string) => void;
}

export interface NodeCreationStrategy {
  create(input: CreateNodeInput): Node<ReactFlowNodeData>;
  map(input: MapNodeInput): Node<ReactFlowNodeData>;
}

class WorkflowTypeStrategy implements NodeCreationStrategy {
  constructor(private readonly nodeType: NodeType) {}

  create(input: CreateNodeInput): Node<WorkflowNodeData> {
    return {
      id: input.id,
      type: "workflow",
      position: input.position,
      data: {
        label: input.label ?? this.nodeType,
        description: `New ${this.nodeType} node`,
        type: this.nodeType,
        config: getDefaultNodeConfig(this.nodeType),
        onSelect: input.onSelect,
        onConfigure: input.onConfigure,
      },
    };
  }

  map({ node, onSelect, onConfigure }: MapNodeInput): Node<WorkflowNodeData> {
    return {
      id: node.id,
      type: "workflow",
      position: node.position,
      data: {
        label: node.data.label,
        description: node.data.description,
        icon: node.data.icon,
        type: node.type,
        onSelect,
        onConfigure,
      },
    };
  }
}

class ElementNodeStrategy implements NodeCreationStrategy {
  create(input: CreateNodeInput): Node<ElementNodeData> {
    const elementId = input.elementId ?? "";
    const elementName = input.elementName ?? input.label ?? "Element";

    return {
      id: input.id,
      type: "element",
      position: input.position,
      data: {
        label: elementName,
        elementId,
        elementName,
        elementType: input.elementType,
        connectedEvents: [],
      },
    };
  }

  map({ node, connectedEvents = [] }: MapNodeInput): Node<ElementNodeData> {
    return {
      id: node.id,
      type: "element",
      position: node.position,
      data: {
        label: node.data.label,
        elementId: node.data.elementId ?? "",
        elementName: node.data.elementName ?? node.data.label,
        elementType: node.data.elementType,
        connectedEvents,
      },
    };
  }
}

const strategies: Record<NodeType, NodeCreationStrategy> = {
  [NodeType.TRIGGER]: new WorkflowTypeStrategy(NodeType.TRIGGER),
  [NodeType.ACTION]: new WorkflowTypeStrategy(NodeType.ACTION),
  [NodeType.CONDITION]: new WorkflowTypeStrategy(NodeType.CONDITION),
  [NodeType.OUTPUT]: new WorkflowTypeStrategy(NodeType.OUTPUT),
  [NodeType.ELEMENT]: new ElementNodeStrategy(),
};

export function createReactFlowNode(
  nodeType: NodeType,
  input: CreateNodeInput,
): Node<ReactFlowNodeData> {
  return strategies[nodeType].create(input);
}

export function mapWorkflowNodeToReactFlow(
  input: MapNodeInput,
): Node<ReactFlowNodeData> {
  return strategies[input.node.type].map(input);
}
