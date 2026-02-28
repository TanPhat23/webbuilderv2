"use client";

import React, { useState } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { cn } from "@/lib/utils";
import { WORKFLOW_EVENT_TYPES } from "@/features/eventworkflows/constants/eventWorkflows";
import { Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkflowCanvas } from "@/features/editor/hooks";
import { Badge } from "@/components/ui/badge";

export interface ElementNodeData {
  label: string;
  elementId: string;
  elementName: string;
  elementType?: string;
  connectedEvents?: string[];
}

const EVENT_HANDLE_COLORS: Record<string, string> = {
  onClick: "bg-accent",
  onDoubleClick: "bg-purple-500",
  onMouseEnter: "bg-sky-500",
  onMouseLeave: "bg-indigo-500",
  onSubmit: "bg-primary",
  onChange: "bg-orange-500",
  onFocus: "bg-teal-500",
  onBlur: "bg-rose-500",
};

const getHandleColor = (eventValue: string) =>
  EVENT_HANDLE_COLORS[eventValue] ?? "bg-muted-foreground";

/** Vertical offset from the top of the node body to the first event row center. */
const HEADER_HEIGHT = 68; // px — header block height (icon + title + border)
const ROW_HEIGHT = 28; // px — height of each event row
const ROW_PADDING = 8; // px — top padding of the events section before "Drag" label
const LABEL_HEIGHT = 20; // px — height of the "Drag an event to connect" label + margin

export const ElementNode: React.FC<NodeProps<ElementNodeData>> = ({
  data,
  selected,
  id,
}) => {
  const { deleteNode } = useWorkflowCanvas();
  const [hovered, setHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(id);
  };

  const connectedEvents = data.connectedEvents ?? [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative bg-card w-55 border-2 rounded-lg transition-all duration-200 select-none cursor-grab active:cursor-grabbing",
        selected
          ? "border-primary shadow-lg shadow-primary/20"
          : "border-border hover:border-primary/50 hover:shadow-md",
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2 border-b border-border">
        <div className="p-1.5 rounded bg-primary/10 shrink-0">
          <Layers className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground leading-none mb-0.5">
            Element
          </p>
          <p className="text-sm font-semibold truncate leading-tight">
            {data.elementName || data.label}
          </p>
        </div>

        <Button
          size="sm"
          variant="ghost"
          onClick={handleDelete}
          className={cn(
            "h-6 w-6 p-0 shrink-0 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10",
            hovered || selected ? "opacity-100" : "opacity-0",
          )}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>

      {/* Event rows */}
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground font-medium mb-1.5 uppercase tracking-wide">
          Drag to connect →
        </p>

        {WORKFLOW_EVENT_TYPES.map((event, index) => {
          const isConnected = connectedEvents.includes(event.value);
          const dotColor = getHandleColor(event.value);

          return (
            <div
              key={event.value}
              className="relative flex items-center gap-2 pr-4"
              style={{ height: ROW_HEIGHT }}
            >
              {/* Color dot */}
              <div
                className={cn(
                  "w-2 h-2 rounded-full shrink-0 transition-all",
                  dotColor,
                  isConnected
                    ? "ring-2 ring-offset-1 ring-offset-card ring-current scale-125"
                    : "",
                )}
              />

              <span className="text-xs flex-1 truncate">{event.label}</span>

              {isConnected && (
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1 py-0 h-3.5 shrink-0 leading-none"
                >
                  linked
                </Badge>
              )}

              {/* React Flow source handle — absolutely positioned on the right edge */}
              <Handle
                type="source"
                position={Position.Right}
                id={event.value}
                isConnectable={true}
                className={cn(
                  dotColor,
                  "w-3 h-3 rounded-full border-2 border-border absolute right-0 transform translate-x-1/2 transition-opacity",
                  {
                    "opacity-100": hovered || selected,
                    "opacity-40": !(hovered || selected),
                  },
                )}
              />
            </div>
          );
        })}
      </div>

      {data.elementType && (
        <div className="px-3 pb-2">
          <p className="text-[10px] text-muted-foreground/70 truncate">
            {data.elementType}
          </p>
        </div>
      )}
    </div>
  );
};

export default ElementNode;
