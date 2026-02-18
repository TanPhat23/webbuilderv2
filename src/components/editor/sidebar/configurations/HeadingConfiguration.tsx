"use client";

import React from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  HeadingElement,
  HeadingSettings,
} from "@/interfaces/elements.interface";
import { ConfigField, ConfigSection, SectionDivider } from "./_shared";
import { cn } from "@/lib/utils";
import { Heading, Type } from "lucide-react";

/* ─── Level Options ─── */

interface HeadingLevelOption {
  value: 1 | 2 | 3 | 4 | 5 | 6;
  label: string;
  tag: string;
  description: string;
  fontSize: string;
}

const HEADING_LEVEL_OPTIONS: HeadingLevelOption[] = [
  {
    value: 1,
    label: "Heading 1",
    tag: "h1",
    description: "Page title — largest heading",
    fontSize: "2rem",
  },
  {
    value: 2,
    label: "Heading 2",
    tag: "h2",
    description: "Section heading",
    fontSize: "1.5rem",
  },
  {
    value: 3,
    label: "Heading 3",
    tag: "h3",
    description: "Sub-section heading",
    fontSize: "1.25rem",
  },
  {
    value: 4,
    label: "Heading 4",
    tag: "h4",
    description: "Minor heading",
    fontSize: "1.125rem",
  },
  {
    value: 5,
    label: "Heading 5",
    tag: "h5",
    description: "Small heading",
    fontSize: "1rem",
  },
  {
    value: 6,
    label: "Heading 6",
    tag: "h6",
    description: "Smallest heading",
    fontSize: "0.875rem",
  },
];

/* ─── Main Component ─── */

export default function HeadingConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Heading") {
    return null;
  }

  const settings: HeadingSettings =
    (selectedElement as HeadingElement).settings ?? { level: 2 };

  const currentLevel = settings.level ?? 2;
  const currentOption =
    HEADING_LEVEL_OPTIONS.find((opt) => opt.value === currentLevel) ??
    HEADING_LEVEL_OPTIONS[1];

  const handleLevelChange = (level: 1 | 2 | 3 | 4 | 5 | 6) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, level },
    });
  };

  return (
    <AccordionItem value="heading-settings" className="border-border/40">
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
            <Heading className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Heading Settings</span>
          <span className="ml-auto mr-1 shrink-0">
            <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground uppercase">
              {currentOption.tag}
            </span>
          </span>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Level Selector ── */}
          <ConfigSection
            title="Level"
            icon={<Type className="h-3 w-3" />}
          >
            <ConfigField
              label="Heading level"
              hint="Sets the semantic heading tag (h1–h6). Use h1 for page titles and progressively smaller levels for sub-sections. Proper heading hierarchy improves accessibility and SEO."
              vertical
            >
              <div className="grid grid-cols-6 gap-1 w-full">
                {HEADING_LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleLevelChange(opt.value)}
                    className={cn(
                      "flex items-center justify-center rounded-md py-1.5 text-[11px] font-mono font-semibold transition-all duration-150",
                      "border border-border/50 hover:border-border",
                      currentLevel === opt.value
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground",
                    )}
                    title={opt.description}
                  >
                    H{opt.value}
                  </button>
                ))}
              </div>
            </ConfigField>

            <SectionDivider />

            {/* Level info */}
            <div className="flex items-center gap-2 pl-0.5 animate-in fade-in-0 duration-150">
              <span
                className="font-bold text-foreground/70 leading-none"
                style={{ fontSize: currentOption.fontSize }}
              >
                Aa
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-medium text-muted-foreground/70">
                  {currentOption.label}
                </span>
                <span className="text-[10px] text-muted-foreground/50">
                  {currentOption.description}
                </span>
              </div>
            </div>

            {/* SEO / a11y hint */}
            <div className="flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150">
              <Heading className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {currentLevel === 1
                  ? "Use only one h1 per page for best SEO"
                  : `Renders as <${currentOption.tag}> in the document`}
              </span>
            </div>
          </ConfigSection>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
