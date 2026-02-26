"use client";

import React, { memo } from "react";
import { X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";

interface ElementLabelProps {
  element: EditorElement;
  showSpacingInfo: boolean;
  onToggleSpacing: () => void;
}

export const ElementLabel = memo(function ElementLabel({
  element,
  showSpacingInfo,
  onToggleSpacing,
}: ElementLabelProps) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-40 text-xs px-2 py-1 pointer-events-none select-none rounded-sm flex items-center gap-2 transition-all duration-200 shadow-sm",
        showSpacingInfo
          ? "bg-orange-50 text-orange-700 border border-orange-200"
          : "bg-blue-500 text-white border border-blue-600",
      )}
      style={{
        transform: "translateY(-100%) translateY(-4px)",
        maxWidth: "200px",
      }}
    >
      <span className="font-semibold truncate max-w-25">{element.type}</span>

      <div
        className={cn(
          "h-3 w-px shrink-0",
          showSpacingInfo ? "bg-orange-200" : "bg-blue-400",
        )}
      />

      {showSpacingInfo ? (
        <span className="text-[10px] font-mono uppercase tracking-wider">
          Spacing
        </span>
      ) : (
        <span className="text-[10px] opacity-90 font-mono">
          {element.styles?.default?.width ?? "auto"} &times;{" "}
          {element.styles?.default?.height ?? "auto"}
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSpacing();
        }}
        className={cn(
          "ml-1 p-0.5 rounded hover:bg-black/10 transition-colors pointer-events-auto cursor-pointer",
          showSpacingInfo ? "text-orange-700" : "text-white",
        )}
        title={
          showSpacingInfo ? "Exit Spacing Mode" : "Enter Spacing Mode (Alt)"
        }
      >
        {showSpacingInfo ? (
          <X size={10} strokeWidth={3} />
        ) : (
          <Plus size={10} strokeWidth={3} />
        )}
      </button>
    </div>
  );
});
