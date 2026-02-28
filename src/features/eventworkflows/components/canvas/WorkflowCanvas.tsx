"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  NodeMouseHandler,
  EdgeMouseHandler,
  OnConnect,
} from "reactflow";
import "reactflow/dist/style.css";
import { NodeType } from "../types/workflow.types";
import { WorkflowNodeWrapper } from "./WorkflowNodeWrapper";
import { ElementNode } from "../nodes/ElementNode";
import { Button } from "@/components/ui/button";
import { ZoomIn, RotateCcw, Trash2, Plus, Grid3x3 } from "lucide-react";
import { toast } from "sonner";
import { useWorkflowCanvas } from "@/features/editor/hooks";
import { cn } from "@/lib/utils";
import {
  VALIDATION_ERRORS,
  NODE_TYPE_LABELS,
  CONNECTION_CONFIG,
} from "@/features/eventworkflows";

import {
  createReactFlowNode,
  mapWorkflowNodeToReactFlow,
} from "@/features/eventworkflows/utils/createNodeStrategy";
import {
  useConnectElementEventWorkflow,
  useDisconnectElementEventWorkflow,
} from "@/features/eventworkflows/hooks/useElementEventWorkflowMutations";
import { useSelectionStore } from "@/features/editor";

interface WorkflowCanvasProps {
  readOnly?: boolean;
  workflowId?: string;
  onWorkflowChange?: (workflow: unknown) => void;
  onNodeConfigure?: (nodeId: string) => void;
  className?: string;
}

const nodeTypes = {
  workflow: WorkflowNodeWrapper,
  element: ElementNode,
};

export const WorkflowCanvas = ({
  readOnly = false,
  workflowId,
  onWorkflowChange,
  onNodeConfigure,
  className,
}: WorkflowCanvasProps) => {
  const {
    workflow,
    selection,
    addNode,
    deleteNode,
    addConnection,
    deleteConnection,
    selectNode,
    selectConnection,
    deselectAll,
    moveNode,
  } = useWorkflowCanvas();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const selectedElement = useSelectionStore((state) => state.selectedElement);

  const { fitView } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  const connectMutation = useConnectElementEventWorkflow();
  const disconnectMutation = useDisconnectElementEventWorkflow();

  // Derive which events are wired per element node by inspecting connections
  const getConnectedEventsForNode = useCallback(
    (nodeId: string): string[] => {
      return workflow.connections
        .filter((c) => c.source === nodeId && c.sourcePort)
        .map((c) => c.sourcePort as string);
    },
    [workflow.connections],
  );

  const addedElementIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!selectedElement) return;

    const alreadyOnCanvas = workflow.nodes.some(
      (n) =>
        n.type === NodeType.ELEMENT && n.data.elementId === selectedElement.id,
    );

    if (!alreadyOnCanvas && !addedElementIds.current.has(selectedElement.id)) {
      addedElementIds.current.add(selectedElement.id);
      const label = selectedElement.name || selectedElement.type || "Element";
      addNode(
        NodeType.ELEMENT,
        { x: 50, y: 50 },
        {
          label,
          elementId: selectedElement.id,
          elementName: label,
          elementType: selectedElement.type,
          connectedEvents: [],
        },
      );
    }
  }, [selectedElement, workflow.nodes, addNode]);

  useEffect(() => {
    const workflowNodes: Node[] = workflow.nodes.map((node) =>
      mapWorkflowNodeToReactFlow({
        node,
        connectedEvents: getConnectedEventsForNode(node.id),
        onSelect: () => selectNode(node.id),
        onConfigure: onNodeConfigure,
      }),
    );

    const workflowEdges: Edge[] = workflow.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourcePort,
      targetHandle: conn.targetPort,
      animated: selection.selectedConnectionId === conn.id,
      label: conn.sourcePort ?? undefined,
      labelStyle: { fontSize: 10, fill: "var(--color-muted-foreground)" },
      labelBgStyle: { fill: "var(--color-card)", fillOpacity: 0.8 },
      style: {
        stroke:
          selection.selectedConnectionId === conn.id
            ? CONNECTION_CONFIG.colors.selected
            : CONNECTION_CONFIG.colors.default,
        strokeWidth:
          selection.selectedConnectionId === conn.id
            ? CONNECTION_CONFIG.strokeWidth.active
            : CONNECTION_CONFIG.strokeWidth.default,
      },
    }));

    setNodes(workflowNodes);
    setEdges(workflowEdges);
  }, [
    workflow,
    selection.selectedNodeId,
    selection.selectedConnectionId,
    setNodes,
    setEdges,
    onNodeConfigure,
    getConnectedEventsForNode,
  ]);

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === "position" && change.position) {
          moveNode(change.id, change.position);
        }
      });
    },
    [onNodesChange, moveNode],
  );

  const handleConnect: OnConnect = useCallback(
    async (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      if (connection.source === connection.target) {
        toast.error(VALIDATION_ERRORS.selfConnection);
        return;
      }

      const sourceNode = workflow.nodes.find((n) => n.id === connection.source);
      const targetNode = workflow.nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) return;

      // Element → Trigger connection: persist as elementEventWorkflow
      if (
        sourceNode.type === NodeType.ELEMENT &&
        targetNode.type === NodeType.TRIGGER
      ) {
        const eventType = connection.sourceHandle;
        const elementId = sourceNode.data.elementId;

        if (!eventType || !elementId) {
          toast.error("Invalid element connection — missing event or element.");
          return;
        }

        if (!workflowId) {
          toast.error("Save the workflow first before connecting elements.");
          return;
        }

        // Check for duplicate on the canvas
        const duplicate = workflow.connections.find(
          (c) =>
            c.source === connection.source &&
            c.target === connection.target &&
            c.sourcePort === eventType,
        );
        if (duplicate) {
          toast.error("This event is already connected to that trigger.");
          return;
        }

        try {
          await connectMutation.mutateAsync({
            elementId,
            eventType,
            workflowId,
          });
          addConnection(connection.source, connection.target, eventType);
          toast.success(`Connected "${eventType}" → workflow trigger`);
        } catch {
          // errors handled by mutation
        }
        return;
      }

      // Standard workflow node → node connection
      if (sourceNode.type === NodeType.OUTPUT) {
        toast.error(VALIDATION_ERRORS.outputAsSource);
        return;
      }

      if (targetNode.type === NodeType.TRIGGER) {
        toast.error(VALIDATION_ERRORS.triggerAsTarget);
        return;
      }

      addConnection(
        connection.source,
        connection.target,
        connection.sourceHandle ?? undefined,
      );
      toast.success("Nodes connected!");
    },
    [workflow.nodes, workflow.connections, addConnection, connectMutation],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      selectNode(node.id);
      setSelectedNodeId(node.id);
    },
    [selectNode],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      selectConnection(edge.id);
      setSelectedEdgeId(edge.id);
    },
    [selectConnection],
  );

  const handlePaneClick = useCallback(() => {
    deselectAll();
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, [deselectAll]);

  const handleAddNode = (type: NodeType) => {
    const position = { x: Math.random() * 300, y: Math.random() * 300 };
    const node = createReactFlowNode(type, {
      id: crypto.randomUUID(),
      position,
      label: `${type.charAt(0).toUpperCase()}${type.slice(1)}`,
    });
    addNode(type, position, node.data);
  };

  const handleDeleteSelected = useCallback(async () => {
    if (selectedNodeId) {
      const node = workflow.nodes.find((n) => n.id === selectedNodeId);

      // When deleting an element node, also disconnect all its element-event connections
      if (
        node?.type === NodeType.ELEMENT &&
        node.data.elementId &&
        workflowId
      ) {
        const elementConnections = workflow.connections.filter(
          (c) => c.source === selectedNodeId && c.sourcePort,
        );

        for (const conn of elementConnections) {
          if (conn.sourcePort) {
            try {
              await disconnectMutation.mutateAsync({
                elementId: node.data.elementId,
                eventType: conn.sourcePort,
                workflowId,
              });
            } catch {
              // best-effort
            }
          }
        }
      }

      deleteNode(selectedNodeId);
      toast.success("Node deleted");
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      // When deleting an element→trigger edge, also disconnect the service connection
      const conn = workflow.connections.find((c) => c.id === selectedEdgeId);
      if (conn?.sourcePort && workflowId) {
        const sourceNode = workflow.nodes.find((n) => n.id === conn.source);
        const targetNode = workflow.nodes.find((n) => n.id === conn.target);

        if (
          sourceNode?.type === NodeType.ELEMENT &&
          targetNode?.type === NodeType.TRIGGER &&
          sourceNode.data.elementId
        ) {
          try {
            await disconnectMutation.mutateAsync({
              elementId: sourceNode.data.elementId,
              eventType: conn.sourcePort,
              workflowId,
            });
          } catch {
            // best-effort
          }
        }
      }

      deleteConnection(selectedEdgeId);
      toast.success("Connection deleted");
      setSelectedEdgeId(null);
    }
  }, [
    selectedNodeId,
    selectedEdgeId,
    workflow.nodes,
    workflow.connections,
    deleteNode,
    deleteConnection,
    disconnectMutation,
  ]);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const nodeType = e.dataTransfer.getData("nodeType") as NodeType;
      const elementId = e.dataTransfer.getData("elementId");
      const elementName = e.dataTransfer.getData("elementName");
      const elementType = e.dataTransfer.getData("elementType");

      if (!nodeType) return;

      const bounds = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - bounds.left - 110,
        y: e.clientY - bounds.top - 60,
      };

      const node = createReactFlowNode(nodeType, {
        id: crypto.randomUUID(),
        position,
        label:
          elementName ||
          `${nodeType.charAt(0).toUpperCase()}${nodeType.slice(1)}`,
        elementId: elementId || undefined,
        elementName: elementName || undefined,
        elementType: elementType || undefined,
      });
      addNode(nodeType, position, node.data);
    },
    [addNode],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDeleteSelected]);

  useEffect(() => {
    onWorkflowChange?.(workflow);
  }, [workflow, onWorkflowChange]);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-background overflow-hidden",
        className,
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background color="var(--color-border)" gap={50} size={1} />
        <Controls />
        <MiniMap />

        {/* Top toolbar */}
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <div className="bg-card border border-border rounded-lg p-2 shadow-lg flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={() => fitView({ padding: 0.2, duration: 200 })}
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right toolbar — workflow node creation */}
        {!readOnly && (
          <div className="absolute top-4 right-4 z-40">
            <div className="bg-card border border-border rounded-lg p-2 shadow-lg flex flex-col gap-1">
              {(
                [
                  NodeType.TRIGGER,
                  NodeType.ACTION,
                  NodeType.CONDITION,
                  NodeType.OUTPUT,
                ] as NodeType[]
              ).map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant="outline"
                  className="h-9 gap-2 text-xs justify-start"
                  onClick={() => handleAddNode(type)}
                >
                  <Plus className="h-4 w-4 shrink-0" />
                  {NODE_TYPE_LABELS[type]}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Bottom toolbar — delete selected */}
        <div className="absolute bottom-4 left-4 z-40">
          {(selectedNodeId || selectedEdgeId) && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={handleDeleteSelected}
              title="Delete selected (Del)"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                No nodes yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Add workflow nodes from the right panel, or drag elements from
                the palette
              </p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
