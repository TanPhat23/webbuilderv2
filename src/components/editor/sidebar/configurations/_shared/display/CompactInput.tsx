"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CompactInputProps {
  /** Short label prefix shown before the input (e.g. "W", "H") */
  label?: string;
  /** Icon element shown before the input (alternative to label) */
  icon?: React.ReactNode;
  /** Tooltip hint for the icon */
  iconTooltip?: string;
  /** Tooltip side placement */
  iconTooltipSide?: "top" | "bottom" | "left" | "right";
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional trailing badge text (e.g. "Fill") */
  badge?: string;
  /** Additional className for the outer wrapper */
  className?: string;
  /** Input type — defaults to "text" */
  type?: "text" | "number";
}

/**
 * Figma-style compact input with an icon or text prefix.
 *
 * ┌──────────────────────────────┐
 * │  W  120px              Fill  │
 * └──────────────────────────────┘
 */
export function CompactInput({
  label,
  icon,
  iconTooltip,
  iconTooltipSide = "left",
  value,
  onChange,
  placeholder = "auto",
  badge,
  className,
  type = "text",
}: CompactInputProps) {
  const prefixContent = icon ? (
    iconTooltip ? (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="flex items-center justify-center text-muted-foreground/60 shrink-0">
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent side={iconTooltipSide} className="text-[11px]">
          {iconTooltip}
        </TooltipContent>
      </Tooltip>
    ) : (
      <span className="flex items-center justify-center text-muted-foreground/60 shrink-0">
        {icon}
      </span>
    )
  ) : label ? (
    <span className="text-[10px] font-medium text-muted-foreground select-none shrink-0">
      {label}
    </span>
  ) : null;

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 h-8",
        className,
      )}
    >
      {prefixContent}
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-6 border-0 bg-transparent px-0.5 text-[11px] font-mono shadow-none focus-visible:ring-0"
        autoComplete="off"
      />
      {badge && (
        <span className="text-[10px] text-muted-foreground/60 select-none shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}
