"use client";

import React, { useState } from "react";
import { NodeType } from "../types/workflow.types";
import {
  Zap,
  ArrowRight,
  GitBranch,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  Box,
  Plus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NODE_TYPE_LABELS,
  NODE_TYPE_DESCRIPTIONS,
  NODE_TYPE_COLORS,
  ANIMATION_DURATIONS,
} from "@/features/eventworkflows";
import { Button } from "@/components/ui/button";

export interface PaletteElement {
  id: string;
  name: string;
  type: string;
}

interface NodePaletteProps {
  onNodeDragStart?: (e: React.DragEvent, nodeType: NodeType) => void;
  elements?: PaletteElement[];
  activeElementIds?: Set<string>;
  onAddElement?: (el: PaletteElement) => void;
  className?: string;
}

const NodeIcon = ({ type }: { type: NodeType }) => {
  switch (type) {
    case NodeType.TRIGGER:
      return <Zap className="h-4 w-4" />;
    case NodeType.ACTION:
      return <ArrowRight className="h-4 w-4" />;
    case NodeType.CONDITION:
      return <GitBranch className="h-4 w-4" />;
    case NodeType.OUTPUT:
      return <CheckCircle className="h-4 w-4" />;
    default:
      return <Zap className="h-4 w-4" />;
  }
};

const getNodePaletteColor = (type: NodeType) => {
  const colorMap: Record<NodeType, keyof typeof NODE_TYPE_COLORS> = {
    [NodeType.TRIGGER]: "trigger",
    [NodeType.ACTION]: "action",
    [NodeType.CONDITION]: "condition",
    [NodeType.OUTPUT]: "output",
    [NodeType.ELEMENT]: "trigger",
  };
  const colors = NODE_TYPE_COLORS[colorMap[type]];
  return cn(colors.bg, colors.border);
};

const NODE_TYPES_ORDER: NodeType[] = [
  NodeType.TRIGGER,
  NodeType.ACTION,
  NodeType.CONDITION,
  NodeType.OUTPUT,
];

export const NodePalette = ({
  onNodeDragStart,
  elements = [],
  activeElementIds = new Set(),
  onAddElement,
  className,
}: NodePaletteProps) => {
  const [nodesExpanded, setNodesExpanded] = useState(true);
  const [elementsExpanded, setElementsExpanded] = useState(true);

  const handleNodeDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("nodeType", nodeType);
    onNodeDragStart?.(e, nodeType);
  };

  const handleElementDragStart = (e: React.DragEvent, el: PaletteElement) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("nodeType", NodeType.ELEMENT);
    e.dataTransfer.setData("elementId", el.id);
    e.dataTransfer.setData("elementName", el.name);
    e.dataTransfer.setData("elementType", el.type);
  };

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Workflow Nodes */}
      <button
        onClick={() => setNodesExpanded(!nodesExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors border-b border-border bg-muted/40"
      >
        <h3 className="font-semibold text-sm">Workflow Nodes</h3>
        {nodesExpanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {nodesExpanded && (
        <div className="p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Drag onto the canvas to build your workflow
          </p>

          {NODE_TYPES_ORDER.map((nodeType) => (
            <div
              key={nodeType}
              draggable
              onDragStart={(e) => handleNodeDragStart(e, nodeType)}
              className={cn(
                "p-3 border-2 rounded-lg cursor-move transition-all hover:shadow-md active:opacity-50 select-none",
                getNodePaletteColor(nodeType),
              )}
              style={{ transitionDuration: `${ANIMATION_DURATIONS.normal}ms` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <NodeIcon type={nodeType} />
                <span className="font-medium text-sm">
                  {NODE_TYPE_LABELS[nodeType]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {NODE_TYPE_DESCRIPTIONS[nodeType]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Canvas Elements */}
      {elements.length > 0 && (
        <>
          <button
            onClick={() => setElementsExpanded(!elementsExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors border-t border-b border-border bg-muted/40"
          >
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Page Elements</h3>
            </div>
            {elementsExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {elementsExpanded && (
            <div className="p-3 space-y-1.5">
              <p className="text-xs text-muted-foreground">
                Add or drag elements to wire their events to workflow triggers
              </p>

              {elements.map((el) => {
                const isActive = activeElementIds.has(el.id);

                return (
                  <div
                    key={el.id}
                    draggable={!isActive}
                    onDragStart={(e) =>
                      !isActive && handleElementDragStart(e, el)
                    }
                    className={cn(
                      "flex items-center gap-2 p-2 border-2 rounded-lg transition-all select-none",
                      isActive
                        ? "border-primary/60 bg-primary/10 cursor-default"
                        : "border-primary/30 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 cursor-move active:opacity-50",
                    )}
                    style={{
                      transitionDuration: `${ANIMATION_DURATIONS.normal}ms`,
                    }}
                  >
                    <div className="p-1 rounded bg-primary/10 shrink-0">
                      <Box className="h-3.5 w-3.5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate leading-tight">
                        {el.name || "Unnamed"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {el.type}
                      </p>
                    </div>

                    {isActive ? (
                      <div
                        className="h-6 w-6 shrink-0 flex items-center justify-center rounded text-primary"
                        title="Already on canvas"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </div>
                    ) : (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 shrink-0 hover:bg-primary/20 hover:text-primary"
                        title="Add to canvas"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddElement?.(el);
                        }}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NodePalette;
