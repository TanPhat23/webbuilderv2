"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import {
  type ResizeDirection,
  directionalClasses,
} from "@/features/editor";
import ResizeTooltip from "./ResizeTooltip";
import { Pause } from "lucide-react";

export const STANDARD_DIRECTIONS = new Set([
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]);

type HandleType = "gap" | "margin" | "padding" | "standard";

const HANDLE_COLORS: Record<HandleType, string> = {
  gap: "bg-pink-500 border-pink-200 hover:bg-pink-600 text-white",
  margin: "bg-orange-500 border-orange-200 hover:bg-orange-600",
  padding: "bg-emerald-500 border-emerald-200 hover:bg-emerald-600",
  standard: "bg-blue-500 border-blue-200 hover:bg-blue-600",
};

function getHandleType(direction: ResizeDirection): HandleType {
  if (direction === "gap") return "gap";
  if (direction.startsWith("margin-")) return "margin";
  if (direction.startsWith("padding-")) return "padding";
  return "standard";
}

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResizeStart: (direction: ResizeDirection, e: React.MouseEvent) => void;
  element: EditorElement;
  isResizing: boolean;
  currentResizeDirection: ResizeDirection | null;
}

export const ResizeHandle = memo(function ResizeHandle({
  direction,
  onResizeStart,
  element,
  isResizing,
  currentResizeDirection,
}: ResizeHandleProps) {
  const handleType = getHandleType(direction);
  const isGapHandle = handleType === "gap";
  const isSpacingHandle = handleType === "margin" || handleType === "padding";

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(direction, e);
  };

  const baseClasses = cn(
    "absolute z-50 transition-all duration-200 ease-in-out shadow-sm flex items-center justify-center",
    isGapHandle ? "w-5 h-5 rounded-sm cursor-ns-resize" : "w-3.5 h-3.5",
    !isGapHandle && (isSpacingHandle ? "rounded-[2px]" : "rounded-full"),
    !isGapHandle && "border-2",
    HANDLE_COLORS[handleType],
    directionalClasses[direction],
    "hover:scale-125 active:scale-110",
    isResizing &&
      currentResizeDirection !== direction &&
      "opacity-0 pointer-events-none",
    isResizing &&
      currentResizeDirection === direction &&
      "scale-125 ring-2 ring-offset-1 ring-current z-[60]",
  );

  const flexDirection = element.styles?.default?.flexDirection ?? "row";
  const isColumn = String(flexDirection).includes("column");

  return (
    <ResizeTooltip
      direction={direction}
      element={element}
      isResizing={isResizing}
      currentResizeDirection={currentResizeDirection}
    >
      <div
        className={baseClasses}
        onMouseDown={handleMouseDown}
        onPointerDown={(e) => e.stopPropagation()}
        role="button"
        aria-label={`Resize ${direction}`}
        tabIndex={-1}
      >
        {isGapHandle && (
          <div className={cn("pointer-events-none", isColumn && "rotate-90")}>
            <Pause size={10} />
          </div>
        )}
      </div>
    </ResizeTooltip>
  );
});
