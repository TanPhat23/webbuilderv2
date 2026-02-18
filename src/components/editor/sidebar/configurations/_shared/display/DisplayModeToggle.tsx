"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Square, Rows3, LayoutGrid, Scissors } from "lucide-react";

const DISPLAY_OPTIONS = [
  { value: "block", label: "Block", icon: Square },
  { value: "flex", label: "Flex", icon: Rows3 },
  { value: "grid", label: "Grid", icon: LayoutGrid },
  { value: "none", label: "None", icon: Scissors },
] as const;

interface DisplayModeToggleProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Figma-style display mode selector.
 *
 * ┌────┬────┬────┬────┐
 * │ ◻  │ ☰  │ ⊞  │ ✂  │
 * └────┴────┴────┴────┘
 */
export function DisplayModeToggle({ value, onChange }: DisplayModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val);
      }}
      className="w-full h-8 gap-0 rounded-lg bg-muted/50 p-0.5"
    >
      {DISPLAY_OPTIONS.map((option) => {
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
