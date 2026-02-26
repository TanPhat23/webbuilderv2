"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

interface ConfigFieldProps {
  /** Label text shown on the left */
  label: string;
  /** Optional HTML `for` attribute linking to an input */
  htmlFor?: string;
  /** Optional tooltip hint shown on hover */
  hint?: string;
  /** Control(s) rendered on the right side */
  children: React.ReactNode;
  /** Stack vertically instead of horizontal row */
  vertical?: boolean;
  /** Additional className for the outer wrapper */
  className?: string;
  /** Whether to render a full-width child (no label row) */
  fullWidth?: boolean;
}

/**
 * Figma-inspired compact property row.
 *
 * Horizontal (default):
 *   ┌─────────────────────────────────────┐
 *   │  Label ⓘ          [  control  ]     │
 *   └─────────────────────────────────────┘
 *
 * Vertical:
 *   ┌─────────────────────────────────────┐
 *   │  Label ⓘ                            │
 *   │  [         control            ]     │
 *   └─────────────────────────────────────┘
 */
export function ConfigField({
  label,
  htmlFor,
  hint,
  children,
  vertical = false,
  className,
  fullWidth = false,
}: ConfigFieldProps) {
  const labelContent = (
    <div className="flex items-center gap-1 shrink-0">
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-[11px] font-medium text-muted-foreground select-none leading-none",
          hint && "cursor-help"
        )}
      >
        {label}
      </Label>
      {hint && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[200px] text-xs">
            {hint}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  if (fullWidth) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {labelContent}
        {children}
      </div>
    );
  }

  if (vertical) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        {labelContent}
        <div className="flex items-center gap-2">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 min-h-[28px]",
        className
      )}
    >
      {labelContent}
      <div className="flex items-center gap-1.5 flex-1 justify-end min-w-0">
        {children}
      </div>
    </div>
  );
}

/* ─── Section wrapper for grouping fields ─── */

interface ConfigSectionProps {
  /** Optional section title */
  title?: string;
  /** Optional icon shown before the title */
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/**
 * Groups related ConfigField rows with an optional mini header.
 */
export function ConfigSection({
  title,
  icon,
  children,
  className,
}: ConfigSectionProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {title && (
        <div className="flex items-center gap-1.5 mb-2">
          {icon && (
            <span className="text-muted-foreground/60">{icon}</span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {title}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

/* ─── Compact empty state ─── */

interface ConfigEmptyProps {
  icon?: React.ReactNode;
  message: string;
  className?: string;
}

export function ConfigEmpty({ icon, message, className }: ConfigEmptyProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-6 text-center",
        "rounded-lg border border-dashed border-border/50 bg-muted/20",
        className
      )}
    >
      {icon && (
        <span className="text-muted-foreground/40">{icon}</span>
      )}
      <span className="text-[11px] text-muted-foreground/60">{message}</span>
    </div>
  );
}
