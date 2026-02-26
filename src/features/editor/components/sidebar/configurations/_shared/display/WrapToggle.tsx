"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WrapText } from "lucide-react";
import type { DisplayStyles, UpdateStyleFn } from "./types";

interface WrapToggleProps {
  /** Current flexWrap value */
  flexWrap: DisplayStyles["flexWrap"];
  /** Style update callback */
  updateStyle: UpdateStyleFn;
}

/**
 * Figma-style wrap toggle button.
 *
 * Toggles between `wrap` and `nowrap`. Active state is highlighted
 * with a primary accent.
 *
 * ┌────┐
 * │ ↩  │
 * └────┘
 */
export function WrapToggle({ flexWrap, updateStyle }: WrapToggleProps) {
  const isWrap = flexWrap === "wrap";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() =>
            updateStyle("flexWrap", isWrap ? "nowrap" : "wrap")
          }
          className={cn(
            "h-8 w-8 flex items-center justify-center rounded-md border border-border/60 shrink-0 transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isWrap
              ? "bg-primary/10 text-primary border-primary/30"
              : "bg-background text-muted-foreground hover:text-foreground",
          )}
          aria-label={isWrap ? "Disable wrap" : "Enable wrap"}
          aria-pressed={isWrap}
        >
          <WrapText className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" className="text-[11px]">
        {isWrap ? "Wrap (on)" : "Wrap (off)"}
      </TooltipContent>
    </Tooltip>
  );
}
