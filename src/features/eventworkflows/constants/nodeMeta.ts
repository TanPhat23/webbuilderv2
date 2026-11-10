import React from "react";
import { Zap, ArrowRight, GitBranch, CheckCircle, type LucideIcon } from "lucide-react";
import { NodeType } from "../types/workflow.types";

export type CanvasNodeType =
  | NodeType.TRIGGER
  | NodeType.ACTION
  | NodeType.CONDITION
  | NodeType.OUTPUT;

export interface NodeTypeColors {
  bg: string;
  border: string;
  borderSelected: string;
  shadowSelected: string;
  icon: string;
  iconBg: string;
}

export interface NodeMetadata {
  type: CanvasNodeType;
  label: string;
  description: string;
  icon: LucideIcon;
  colors: NodeTypeColors;
}

export const NODE_TYPES_ORDER = [
  NodeType.TRIGGER,
  NodeType.ACTION,
  NodeType.CONDITION,
  NodeType.OUTPUT,
] as const;

export const NODE_META: Record<CanvasNodeType, NodeMetadata> = {
  [NodeType.TRIGGER]: {
    type: NodeType.TRIGGER,
    label: "Trigger",
    description: "Start point of the workflow",
    icon: Zap,
    colors: {
      bg: "bg-accent/10 dark:bg-accent/20",
      border: "border-accent/30 dark:border-accent/60",
      borderSelected: "border-accent",
      shadowSelected: "shadow-accent/20",
      icon: "text-accent dark:text-accent-foreground",
      iconBg: "bg-accent/10 dark:bg-accent/20",
    },
  },
  [NodeType.ACTION]: {
    type: NodeType.ACTION,
    label: "Action",
    description: "Perform an action or task",
    icon: ArrowRight,
    colors: {
      bg: "bg-primary/10 dark:bg-primary/20",
      border: "border-primary/30 dark:border-primary/60",
      borderSelected: "border-primary",
      shadowSelected: "shadow-primary/20",
      icon: "text-primary dark:text-primary-foreground",
      iconBg: "bg-primary/10 dark:bg-primary/20",
    },
  },
  [NodeType.CONDITION]: {
    type: NodeType.CONDITION,
    label: "Condition",
    description: "Branch based on conditions",
    icon: GitBranch,
    colors: {
      bg: "bg-secondary/10 dark:bg-secondary/20",
      border: "border-secondary/30 dark:border-secondary/60",
      borderSelected: "border-secondary",
      shadowSelected: "shadow-secondary/20",
      icon: "text-secondary dark:text-secondary-foreground",
      iconBg: "bg-secondary/10 dark:bg-secondary/20",
    },
  },
  [NodeType.OUTPUT]: {
    type: NodeType.OUTPUT,
    label: "Output",
    description: "End point of the workflow",
    icon: CheckCircle,
    colors: {
      bg: "bg-muted/10 dark:bg-muted/20",
      border: "border-muted/30 dark:border-muted/60",
      borderSelected: "border-muted",
      shadowSelected: "shadow-muted/20",
      icon: "text-muted-foreground",
      iconBg: "bg-muted/10 dark:bg-muted/20",
    },
  },
};

export interface NodeIconProps {
  type: NodeType;
  className?: string;
}

export const isCanvasNodeType = (type: NodeType): type is CanvasNodeType => {
  return (
    type === NodeType.TRIGGER ||
    type === NodeType.ACTION ||
    type === NodeType.CONDITION ||
    type === NodeType.OUTPUT
  );
};

export const resolveNodeIcon = (type: NodeType): LucideIcon => {
  if (isCanvasNodeType(type)) {
    return NODE_META[type].icon;
  }
  return Zap;
};

export const NodeIcon = ({ type, className }: NodeIconProps) => {
  const IconComponent = resolveNodeIcon(type);
  return React.createElement(IconComponent, {
    className: className ?? "h-4 w-4",
  });
};
