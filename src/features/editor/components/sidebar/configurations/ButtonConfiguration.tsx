"use client";

import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { ButtonElement } from "@/features/editor";
import {
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  MousePointerClick,
  Link2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

/* ─── Target Options ─── */

const TARGET_OPTIONS = [
  { value: "_self", label: "Same tab" },
  { value: "_blank", label: "New tab" },
  { value: "_parent", label: "Parent frame" },
  { value: "_top", label: "Top frame" },
] as const;

/* ─── Main Component ─── */

export default function ButtonConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Button") {
    return null;
  }

  const element = selectedElement as ButtonElement;
  const href = element.href ?? "";

  /* ─── Handlers ─── */

  const handleHrefChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { href: e.target.value });
  };

  const updateSetting = (name: string, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...(selectedElement.settings ?? {}), [name]: value },
    });
  };

  /* ─── Derived State ─── */

  const hasHref = href.length > 0;
  const isExternalUrl =
    hasHref &&
    (href.startsWith("http://") ||
      href.startsWith("https://") ||
      href.startsWith("//"));
  const isMailto = hasHref && href.startsWith("mailto:");
  const isTel = hasHref && href.startsWith("tel:");
  const isAnchor = hasHref && href.startsWith("#");

  const target =
    (selectedElement.settings as Record<string, unknown> | null)?.target ??
    "_self";

  const getLinkTypeLabel = () => {
    if (isMailto) return "Email link";
    if (isTel) return "Phone link";
    if (isAnchor) return "Anchor link";
    if (isExternalUrl) return "External link";
    if (hasHref) return "Internal link";
    return null;
  };

  const getLinkTypeColor = () => {
    if (isMailto || isTel)
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
    if (isAnchor)
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
    if (isExternalUrl)
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  };

  const getLinkTypeIcon = () => {
    if (isExternalUrl) return <ExternalLink className="h-2.5 w-2.5" />;
    if (isAnchor) return <ArrowRight className="h-2.5 w-2.5" />;
    return <Link2 className="h-2.5 w-2.5" />;
  };

  return (
    <AccordionItem value="button-settings" className="border-border/40">
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
            <MousePointerClick className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Button Settings</span>
          {hasHref && (
            <span className="ml-auto mr-1 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                  getLinkTypeColor(),
                )}
              >
                {getLinkTypeIcon()}
                {isExternalUrl ? "external" : "linked"}
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Link Destination ── */}
          <ConfigSection
            title="Link"
            icon={<Link2 className="h-3 w-3" />}
          >
            {/* Href */}
            <ConfigField
              label="URL"
              htmlFor="button-href"
              hint="Optional URL the button navigates to when clicked. Leave empty for buttons that only trigger actions/events. Supports absolute URLs, relative paths, anchors (#section), mailto:, and tel: links."
              vertical
            >
              <Input
                id="button-href"
                name="href"
                type="text"
                value={href}
                onChange={handleHrefChange}
                placeholder="/page, https://..., #section, mailto:..."
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL type indicator */}
            {hasHref && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    getLinkTypeColor(),
                  )}
                >
                  {getLinkTypeIcon()}
                  {getLinkTypeLabel()}
                </span>
              </div>
            )}

            {!hasHref && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <MousePointerClick className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 leading-tight">
                  No link set — button will only trigger attached events or
                  form actions
                </span>
              </div>
            )}
          </ConfigSection>

          {/* ── Target (only shown when href is set) ── */}
          {hasHref && (
            <>
              <SectionDivider />

              <ConfigSection
                title="Behavior"
                icon={<ExternalLink className="h-3 w-3" />}
              >
                {/* Target */}
                <ConfigField
                  label="Target"
                  htmlFor="button-target"
                  hint="Where to open the linked URL. 'New tab' opens in a separate browser tab; 'Same tab' navigates in the current tab."
                >
                  <Select
                    value={target as string}
                    onValueChange={(value) => updateSetting("target", value)}
                  >
                    <SelectTrigger
                      id="button-target"
                      className="h-7 w-[120px] px-2 text-[11px] rounded-md"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-1.5">
                            {opt.value === "_blank" && (
                              <ExternalLink className="h-3 w-3 text-muted-foreground" />
                            )}
                            <span>{opt.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ConfigField>

                {/* Target hint */}
                {target === "_blank" && isExternalUrl && (
                  <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                    <ExternalLink className="h-3 w-3 text-blue-500/60" />
                    <span className="text-[10px] text-blue-600/60 dark:text-blue-400/60 leading-tight">
                      Opens in a new tab with rel=&quot;noopener noreferrer&quot;
                      for security
                    </span>
                  </div>
                )}
              </ConfigSection>
            </>
          )}

          {/* ── Summary ── */}
          <SectionDivider />
          <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <MousePointerClick className="h-2.5 w-2.5" />
              &lt;button&gt;
            </span>
            {hasHref && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Link2 className="h-2.5 w-2.5" />
                href
              </span>
            )}
            {hasHref && target === "_blank" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <ExternalLink className="h-2.5 w-2.5" />
                new tab
              </span>
            )}
            {!hasHref && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                action only
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
