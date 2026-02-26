"use client";

import React, { useCallback, useEffect, useState } from "react";
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
} from "reactflow";
import "reactflow/dist/style.css";
import { NodeType } from "../types/workflow.types";
import { WorkflowNodeWrapper } from "./WorkflowNodeWrapper";
import { Button } from "@/components/ui/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Trash2,
  Plus,
  Grid3x3,
} from "lucide-react";
import { toast } from "sonner";
import { useWorkflowCanvas } from "@/features/editor/hooks";
import { cn } from "@/lib/utils";
import {
  VALIDATION_ERRORS,
  NODE_TYPE_LABELS,
  CONNECTION_CONFIG,
  ANIMATION_DURATIONS,
} from "@/features/eventworkflows";
import { getDefaultNodeConfig } from "@/features/eventworkflows/utils/workflowBuild";

interface WorkflowCanvasProps {
  readOnly?: boolean;
  onWorkflowChange?: (workflow: any) => void;
  onNodeConfigure?: (nodeId: string) => void;
  className?: string;
}

const nodeTypes = {
  workflow: WorkflowNodeWrapper,
};

export const WorkflowCanvas = ({
  readOnly = false,
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
  const { fitView } = useReactFlow();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);

  useEffect(() => {
    const workflowNodes: Node[] = workflow.nodes.map((node) => ({
      id: node.id,
      data: {
        label: node.data.label,
        description: node.data.description,
        icon: node.data.icon,
        type: node.type,
        onSelect: () => selectNode(node.id),
        onConfigure: onNodeConfigure,
      },
      position: node.position,
      type: "workflow",
    }));

    const workflowEdges: Edge[] = workflow.connections.map((conn) => ({
      id: conn.id,
      source: conn.source,
      target: conn.target,
      animated: selection.selectedConnectionId === conn.id,
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
    selectNode,
    onNodeConfigure,
  ]);

  const handleNodesChange = useCallback(
    (changes: any) => {
      onNodesChange(changes);

      changes.forEach((change: any) => {
        if (change.type === "position" && change.position) {
          moveNode(change.id, change.position);
        }
      });
    },
    [onNodesChange, moveNode],
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        if (connection.source === connection.target) {
          toast.error(VALIDATION_ERRORS.selfConnection);
          return;
        }

        const sourceNode = workflow.nodes.find(
          (n) => n.id === connection.source,
        );
        const targetNode = workflow.nodes.find(
          (n) => n.id === connection.target,
        );

        if (!sourceNode || !targetNode) return;

        if (sourceNode.type === NodeType.OUTPUT) {
          toast.error(VALIDATION_ERRORS.outputAsSource);
          return;
        }

        if (targetNode.type === NodeType.TRIGGER) {
          toast.error(VALIDATION_ERRORS.triggerAsTarget);
          return;
        }

        addConnection(connection.source, connection.target);
        toast.success("Nodes connected!");
      }
    },
    [workflow.nodes, addConnection],
  );

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      selectNode(node.id);
      setSelectedNodeId(node.id);
    },
    [selectNode],
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (event, edge) => {
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
    const nodeLabel = `${type.charAt(0).toUpperCase()}${type.slice(1)}`;
    const defaultConfig = getDefaultNodeConfig(type);

    const randomX = Math.random() * 300;
    const randomY = Math.random() * 300;

    addNode(
      type,
      { x: randomX, y: randomY },
      {
        label: nodeLabel,
        description: `New ${type} node`,
        config: defaultConfig,
      },
    );
  };

  const handleDeleteSelected = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      toast.success("Node deleted");
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      deleteConnection(selectedEdgeId);
      toast.success("Connection deleted");
      setSelectedEdgeId(null);
    }
  };

  const handleResetView = () => {
    fitView({ padding: 0.2, duration: 200 });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        handleDeleteSelected();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNodeId, selectedEdgeId]);

  useEffect(() => {
    onWorkflowChange?.(workflow);
  }, [workflow, onWorkflowChange]);

  return (
    <div
      className={cn(
        "relative w-full h-full bg-background overflow-hidden",
        className,
      )}
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

        {/* Top Toolbar */}
        <div className="absolute top-4 left-4 z-40 flex gap-2">
          <div className="bg-card border border-border rounded-lg p-2 shadow-lg flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={() => {
                toast.info("Use Ctrl+Scroll to zoom");
              }}
              title="Zoom in (Ctrl + Scroll)"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <div className="w-px bg-border" />
            <Button
              size="sm"
              variant="ghost"
              className="h-9 w-9 p-0"
              onClick={handleResetView}
              title="Reset view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Toolbar - Node Creation */}
        {!readOnly && (
          <div className="absolute top-4 right-4 z-40 flex gap-2">
            <div className="bg-card border border-border rounded-lg p-2 shadow-lg flex flex-col gap-1">
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => handleAddNode(NodeType.TRIGGER)}
                title="Add trigger node"
              >
                <Plus className="h-4 w-4" />
                {NODE_TYPE_LABELS[NodeType.TRIGGER]}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => handleAddNode(NodeType.ACTION)}
                title="Add action node"
              >
                <Plus className="h-4 w-4" />
                {NODE_TYPE_LABELS[NodeType.ACTION]}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => handleAddNode(NodeType.CONDITION)}
                title="Add condition node"
              >
                <Plus className="h-4 w-4" />
                {NODE_TYPE_LABELS[NodeType.CONDITION]}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-2 text-xs"
                onClick={() => handleAddNode(NodeType.OUTPUT)}
                title="Add output node"
              >
                <Plus className="h-4 w-4" />
                {NODE_TYPE_LABELS[NodeType.OUTPUT]}
              </Button>
            </div>
          </div>
        )}

        {/* Bottom Toolbar - Actions */}
        <div className="absolute bottom-4 left-4 z-40 flex gap-2">
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

        {/* Empty State */}
        {workflow.nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <Grid3x3 className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                No nodes yet
              </h3>
              <p className="text-sm text-muted-foreground">
                Use the buttons on the right to add nodes
              </p>
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;
