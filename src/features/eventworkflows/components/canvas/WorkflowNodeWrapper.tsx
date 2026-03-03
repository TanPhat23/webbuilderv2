"use client";

import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { NodeType } from "../types/workflow.types";
import {
  Zap,
  GitBranch,
  ArrowRight,
  CheckCircle,
  Trash2,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useWorkflowCanvas } from "@/features/editor/hooks";
import {
  getNodeTypeColor,
  ANIMATION_DURATIONS,
} from "@/features/eventworkflows";

interface WorkflowNodeData {
  label: string;
  description?: string;
  icon?: string;
  type: NodeType;
  onSelect?: (nodeId: string) => void;
  onConfigure?: (nodeId: string) => void;
}

const NodeIcon = ({
  type,
  className,
}: {
  type: NodeType;
  className?: string;
}) => {
  const size = "h-4 w-4";
  switch (type) {
    case NodeType.TRIGGER:
      return <Zap className={cn(size, className)} />;
    case NodeType.ACTION:
      return <ArrowRight className={cn(size, className)} />;
    case NodeType.CONDITION:
      return <GitBranch className={cn(size, className)} />;
    case NodeType.OUTPUT:
      return <CheckCircle className={cn(size, className)} />;
    default:
      return <Zap className={cn(size, className)} />;
  }
};

const getNodeColorClasses = (type: NodeType, isSelected: boolean) => {
  const baseClasses =
    "transition-all duration-200 border-2 rounded-lg p-3 bg-card hover:shadow-md";
  const colors = getNodeTypeColor(type);

  if (isSelected) {
    return cn(
      baseClasses,
      colors.borderSelected,
      "shadow-lg",
      colors.shadowSelected,
      colors.bg,
    );
  }

  return cn(baseClasses, colors.border, colors.bg);
};

const getIconColor = (type: NodeType) => {
  return getNodeTypeColor(type).icon;
};

export const WorkflowNodeWrapper: React.FC<NodeProps<WorkflowNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const { deleteNode } = useWorkflowCanvas();
  const [showPorts, setShowPorts] = React.useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Delete node "${data.label}"?`)) {
      deleteNode(id);
    }
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onConfigure?.(id);
  };

  return (
    <div
      onMouseEnter={() => setShowPorts(true)}
      onMouseLeave={() => setShowPorts(false)}
      className={cn(
        getNodeColorClasses(data.type, selected),
        "w-48 group cursor-grab active:cursor-grabbing select-none transition-all",
      )}
      style={{ transitionDuration: `${ANIMATION_DURATIONS.normal}ms` }}
    >
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={true}
        className={cn(
          "w-3 h-3 rounded-full transition-all",
          showPorts || selected ? "opacity-100" : "opacity-0",
          data.type === NodeType.TRIGGER
            ? "bg-primary border-2 border-white dark:border-slate-900"
            : "bg-accent border-2 border-white dark:border-slate-900",
        )}
      />

      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn("p-1.5 rounded", getNodeTypeColor(data.type).iconBg)}
        >
          <NodeIcon type={data.type} className={getIconColor(data.type)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{data.label}</p>
          {data.description && (
            <p className="text-xs text-muted-foreground truncate">
              {data.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-1">
        {data.type !== NodeType.OUTPUT && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 flex-1 text-xs"
            onClick={handleConfigure}
          >
            <Settings className="h-3 w-3 mr-1" />
            Config
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-destructive hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {data.type !== NodeType.OUTPUT ? (
        <Handle
          type="source"
          position={Position.Right}
          isConnectable={true}
          className={cn(
            "w-3 h-3 rounded-full transition-all",
            showPorts || selected ? "opacity-100" : "opacity-0",
            "bg-primary border-2 border-white dark:border-slate-900",
          )}
        />
      ) : null}
    </div>
  );
};

export default WorkflowNodeWrapper;
