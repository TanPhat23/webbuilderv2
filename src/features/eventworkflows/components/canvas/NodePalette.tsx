"use client";

import React, { useState } from "react";
import { NodeType } from "../types/workflow.types";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  GitBranch,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NODE_TYPE_LABELS,
  NODE_TYPE_DESCRIPTIONS,
  NODE_TYPE_COLORS,
  ANIMATION_DURATIONS,
} from "@/features/eventworkflows";

interface NodePaletteProps {
  onNodeDragStart?: (e: React.DragEvent, nodeType: NodeType) => void;
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
  };
  const colors = NODE_TYPE_COLORS[colorMap[type]];
  return cn(colors.bg, colors.border, "hover:" + colors.border);
};

const NODE_TYPES_ORDER: NodeType[] = [
  NodeType.TRIGGER,
  NodeType.ACTION,
  NodeType.CONDITION,
  NodeType.OUTPUT,
];

export const NodePalette = ({
  onNodeDragStart,
  className,
}: NodePaletteProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleDragStart = (e: React.DragEvent, nodeType: NodeType) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("nodeType", nodeType);
    onNodeDragStart?.(e, nodeType);
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-lg shadow-lg",
        className,
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors"
      >
        <h3 className="font-semibold text-sm">Node Palette</h3>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-border p-3 space-y-2 max-w-xs">
          <p className="text-xs text-muted-foreground mb-3">
            Drag nodes onto the canvas to build your workflow
          </p>

          {NODE_TYPES_ORDER.map((nodeType) => (
            <div
              key={nodeType}
              draggable
              onDragStart={(e) => handleDragStart(e, nodeType)}
              className={cn(
                "p-3 border-2 rounded-lg cursor-move transition-all hover:shadow-md active:opacity-50",
                getNodePaletteColor(nodeType),
              )}
              style={{ transitionDuration: `${ANIMATION_DURATIONS.normal}ms` }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div>
                  <NodeIcon type={nodeType} />
                </div>
                <span className="font-medium text-sm">
                  {NODE_TYPE_LABELS[nodeType]}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {NODE_TYPE_DESCRIPTIONS[nodeType]}
              </p>
            </div>
          ))}

          <div className="pt-3 border-t border-border mt-3">
            <p className="text-xs text-muted-foreground">
              💡 Tip: Hold Ctrl/Cmd while scrolling to zoom the canvas
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodePalette;
