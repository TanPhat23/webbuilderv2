"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  Monitor,
  Tablet,
  Smartphone,
  AppWindow,
  TvMinimalPlay,
} from "lucide-react";

interface BreakpointSelectorProps {
  currentBreakpoint: "default" | "sm" | "md" | "lg" | "xl";
  onBreakpointChange: (
    breakpoint: "default" | "sm" | "md" | "lg" | "xl",
  ) => void;
}

interface BreakpointOption {
  value: "default" | "sm" | "md" | "lg" | "xl";
  label: string;
  description: string;
  icon: React.ReactNode;
}

const BREAKPOINTS: BreakpointOption[] = [
  {
    value: "default",
    label: "Base",
    description: "All screen sizes",
    icon: <AppWindow className="h-3.5 w-3.5" />,
  },
  {
    value: "sm",
    label: "SM",
    description: "Small — 640px+",
    icon: <Smartphone className="h-3.5 w-3.5" />,
  },
  {
    value: "md",
    label: "MD",
    description: "Medium — 768px+",
    icon: <Tablet className="h-3.5 w-3.5" />,
  },
  {
    value: "lg",
    label: "LG",
    description: "Large — 1024px+",
    icon: <Monitor className="h-3.5 w-3.5" />,
  },
  {
    value: "xl",
    label: "XL",
    description: "Extra large — 1280px+",
    icon: <TvMinimalPlay className="h-3.5 w-3.5" />,
  },
];

export const BreakpointSelector = ({
  currentBreakpoint,
  onBreakpointChange,
}: BreakpointSelectorProps) => {
  return (
    <div className="flex items-center justify-between gap-2 px-0.5 mb-3">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
        Breakpoint
      </span>

      <ToggleGroup
        type="single"
        value={currentBreakpoint}
        onValueChange={(value) => {
          if (value) {
            onBreakpointChange(value as "default" | "sm" | "md" | "lg" | "xl");
          }
        }}
        variant="outline"
        size="sm"
        className="h-8 gap-0 rounded-lg bg-muted/40 p-0.5"
      >
        {BREAKPOINTS.map((bp) => (
          <Tooltip key={bp.value}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={bp.value}
                aria-label={bp.description}
                className={cn(
                  "h-7 w-8 min-w-0 rounded-md p-0",
                  "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                  "transition-all duration-150 ease-out",
                  "hover:text-foreground/80",
                )}
              >
                <span className="flex items-center justify-center">
                  {bp.icon}
                </span>
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[11px]">
              <span className="font-medium">{bp.label}</span>
              <span className="text-muted-foreground ml-1.5">
                {bp.description}
              </span>
            </TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </div>
  );
};
