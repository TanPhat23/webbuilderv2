"use client";

import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  BlockquoteElement,
  BlockquoteSettings,
} from "@/interfaces/elements.interface";
import {
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Quote,
  ExternalLink,
  Link2,
  BookOpen,
} from "lucide-react";

/* ─── Main Component ─── */

export default function BlockquoteConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Blockquote") {
    return null;
  }

  const settings: BlockquoteSettings =
    (selectedElement as BlockquoteElement).settings ?? {};

  /* ─── Handlers ─── */

  const handleCiteChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, cite: e.target.value || undefined },
    });
  };

  /* ─── Derived State ─── */

  const hasCite = !!settings.cite && settings.cite.length > 0;
  const isExternalCite =
    hasCite &&
    (settings.cite!.startsWith("http://") ||
      settings.cite!.startsWith("https://"));

  return (
    <AccordionItem value="blockquote-settings" className="border-border/40">
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
            <Quote className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Blockquote Settings</span>
          {hasCite && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                cited
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Citation Source ── */}
          <ConfigSection
            title="Citation"
            icon={<BookOpen className="h-3 w-3" />}
          >
            {/* Cite URL */}
            <ConfigField
              label="Source URL"
              htmlFor="blockquote-cite"
              hint="The URL of the source document or message that the quote is taken from. This is used by search engines and assistive technologies to attribute the quote. It does not render visually — use content text for visible attribution."
              vertical
            >
              <Input
                id="blockquote-cite"
                type="text"
                value={settings.cite ?? ""}
                onChange={handleCiteChange}
                placeholder="https://example.com/article"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL type indicator */}
            {hasCite && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isExternalCite
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {isExternalCite ? (
                    <>
                      <ExternalLink className="h-2.5 w-2.5" />
                      External source
                    </>
                  ) : (
                    <>
                      <Link2 className="h-2.5 w-2.5" />
                      Internal reference
                    </>
                  )}
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Semantic info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Quote className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {hasCite
                  ? "The cite attribute provides machine-readable attribution — it is not displayed visually by the browser"
                  : "Add a source URL to semantically attribute this quote for SEO and accessibility"}
              </span>
            </div>
          </ConfigSection>

          {/* ── Summary ── */}
          <SectionDivider />
          <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Quote className="h-2.5 w-2.5" />
              &lt;blockquote&gt;
            </span>
            {hasCite && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Link2 className="h-2.5 w-2.5" />
                cite
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
