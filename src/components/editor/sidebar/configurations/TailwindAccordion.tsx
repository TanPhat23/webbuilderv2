"use client";

import React, { useEffect, useRef, useState } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { AccordionSection } from "./_shared";
import { Code2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TailwindAccordion() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [value, setValue] = useState<string>(
    selectedElement?.tailwindStyles ?? "",
  );
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setValue(selectedElement?.tailwindStyles ?? "");
  }, [selectedElement?.id, selectedElement?.tailwindStyles]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, []);

  if (!selectedElement) return null;

  const commit = (val: string) => {
    updateElement(selectedElement.id, { tailwindStyles: val });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value;
    setValue(next);

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }
    debounceRef.current = window.setTimeout(() => {
      commit(next);
      debounceRef.current = null;
    }, 250) as unknown as number;
  };

  const handleBlur = () => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    commit(value);
  };

  // Count classes for the badge
  const classCount = value.trim().split(/\s+/).filter(Boolean).length;

  return (
    <AccordionSection
      value="tailwind"
      title="Tailwind CSS"
      icon={<Code2 />}
      badge={
        classCount > 0 ? (
          <Badge
            variant="secondary"
            className="h-4 min-w-[18px] px-1 text-[9px] font-mono tabular-nums"
          >
            {classCount}
          </Badge>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-2">
        {/* Helper hint */}
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-muted-foreground/40 shrink-0" />
          <span className="text-[10px] text-muted-foreground/60 leading-tight">
            Add utility classes to override or extend styles
          </span>
        </div>

        {/* Textarea */}
        <div className="relative group/tw">
          <Textarea
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="p-4 bg-white rounded-lg shadow hover:scale-105 ..."
            className={cn(
              "min-h-[72px] resize-y text-[11px] font-mono leading-relaxed",
              "rounded-lg border-border/50 bg-muted/20",
              "placeholder:text-muted-foreground/30",
              "focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10",
              "transition-colors duration-150",
            )}
            rows={3}
          />

          {/* Live class count indicator */}
          {classCount > 0 && (
            <div
              className={cn(
                "absolute bottom-1.5 right-1.5",
                "flex items-center gap-1 rounded-md bg-background/80 backdrop-blur-sm",
                "border border-border/40 px-1.5 py-0.5",
                "text-[9px] font-mono text-muted-foreground/50 tabular-nums",
                "opacity-0 group-hover/tw:opacity-100 group-focus-within/tw:opacity-100",
                "transition-opacity duration-150",
              )}
            >
              {classCount} {classCount === 1 ? "class" : "classes"}
            </div>
          )}
        </div>

        {/* Quick reference chips */}
        {classCount === 0 && (
          <div className="flex flex-wrap gap-1 animate-in fade-in-0 slide-in-from-top-1 duration-200">
            {["p-4", "rounded-lg", "shadow-md", "hover:opacity-80"].map(
              (example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => {
                    const next = value ? `${value} ${example}` : example;
                    setValue(next);
                    commit(next);
                  }}
                  className={cn(
                    "inline-flex items-center rounded-md px-1.5 py-0.5",
                    "text-[10px] font-mono text-muted-foreground/60",
                    "bg-muted/30 border border-border/30",
                    "hover:bg-muted/60 hover:text-muted-foreground hover:border-border/50",
                    "transition-all duration-150 cursor-pointer",
                  )}
                >
                  {example}
                </button>
              ),
            )}
          </div>
        )}
      </div>
    </AccordionSection>
  );
}
