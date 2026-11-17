import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface ConfigPanelProps {
  /** Unique accordion value for this element's settings panel */
  value: string;
  /** Icon shown before the title (e.g. `<Video className="h-3.5 w-3.5" />`) */
  icon: React.ReactNode;
  /** Panel title shown in the trigger */
  title: string;
  /**
   * Optional status indicator pinned to the right of the trigger (a badge,
   * check icon, ...). Falsy values render nothing.
   */
  trailing?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Top-level accordion item shared by every element configuration panel:
 * the collapsible trigger (icon, title, optional trailing indicator) plus the
 * content area. Panels render their own nested `<Accordion>` or fields as
 * children.
 */
export function ConfigPanel({
  value,
  icon,
  title,
  trailing,
  children,
}: ConfigPanelProps) {
  return (
    <AccordionItem value={value} className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            {icon}
          </span>
          <span className="truncate">{title}</span>
          {trailing ? (
            <span className="ml-auto mr-1 shrink-0">{trailing}</span>
          ) : null}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
