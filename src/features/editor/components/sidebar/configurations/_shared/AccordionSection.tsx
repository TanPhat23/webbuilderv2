"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AccordionSectionProps {
  /** Unique value for the accordion item */
  value: string;
  /** Section title shown in the trigger */
  title: string;
  /** Optional icon rendered before the title (lucide-react, sized h-3.5 w-3.5) */
  icon?: React.ReactNode;
  /** Optional badge / indicator rendered after the title */
  badge?: React.ReactNode;
  /** Content rendered inside the collapsible area */
  children: React.ReactNode;
  /** Additional className for the AccordionItem wrapper */
  className?: string;
  /** Additional className for the AccordionContent inner container */
  contentClassName?: string;
  /** Whether this is a nested (sub-level) section — uses smaller text */
  nested?: boolean;
  /** If true, hides the bottom border on the AccordionItem */
  noBorder?: boolean;
}


export function AccordionSection({
  value,
  title,
  icon,
  badge,
  children,
  className,
  contentClassName,
  nested = false,
  noBorder = false,
}: AccordionSectionProps) {
  return (
    <AccordionItem
      value={value}
      className={cn(
        "border-border/40",
        noBorder && "border-b-0",
        className
      )}
    >
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          nested
            ? "text-[11px] font-medium text-muted-foreground"
            : "text-xs font-semibold text-foreground/90"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <span
              className={cn(
                "shrink-0 transition-colors duration-150",
                "text-muted-foreground/60 group-hover/trigger:text-muted-foreground",
                nested ? "[&>svg]:h-3 [&>svg]:w-3" : "[&>svg]:h-3.5 [&>svg]:w-3.5"
              )}
            >
              {icon}
            </span>
          )}
          <span className="truncate">{title}</span>
          {badge && (
            <span className="ml-auto mr-1 shrink-0">{badge}</span>
          )}
        </div>
      </AccordionTrigger>
      <AccordionContent
        className={cn(
          "pb-3 pt-1",
          nested ? "pl-1" : "px-0.5",
          contentClassName
        )}
      >
        <div className="flex flex-col gap-2.5">{children}</div>
      </AccordionContent>
    </AccordionItem>
  );
}

/* ─── Lightweight sub-section divider ─── */

interface SectionDividerProps {
  className?: string;
}

/**
 * A subtle horizontal line to separate groups within an accordion section.
 */
export function SectionDivider({ className }: SectionDividerProps) {
  return (
    <div
      className={cn("h-px w-full bg-border/30 my-1", className)}
      role="separator"
    />
  );
}
