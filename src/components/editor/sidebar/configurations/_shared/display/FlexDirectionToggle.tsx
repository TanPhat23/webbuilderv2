"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowDown, ArrowLeft, ArrowUp } from "lucide-react";

const DIRECTION_OPTIONS = [
  { value: "row", label: "Row", icon: ArrowRight },
  { value: "column", label: "Column", icon: ArrowDown },
  { value: "row-reverse", label: "Row Reverse", icon: ArrowLeft },
  { value: "column-reverse", label: "Column Reverse", icon: ArrowUp },
] as const;

interface FlexDirectionToggleProps {
  value: string;
  onChange: (value: React.CSSProperties["flexDirection"]) => void;
}

/**
 * Figma-style flex direction selector with arrow icons.
 *
 * ┌────┬────┬────┬────┐
 * │ →  │ ↓  │ ←  │ ↑  │
 * └────┴────┴────┴────┘
 */
export function FlexDirectionToggle({
  value,
  onChange,
}: FlexDirectionToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val as React.CSSProperties["flexDirection"]);
      }}
      className="w-full h-8 gap-0 rounded-lg bg-muted/50 p-0.5"
    >
      {DIRECTION_OPTIONS.map((option) => {
        const Icon = option.icon;
        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={option.value}
                aria-label={option.label}
                className={cn(
                  "flex-1 h-7 rounded-md text-muted-foreground",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              {option.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </ToggleGroup>
  );
}
