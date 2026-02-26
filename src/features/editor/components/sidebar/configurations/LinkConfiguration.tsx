"use client";

import React, { ChangeEvent } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { ConfigField, ConfigSection, SectionDivider } from "./_shared";
import { Link2, ExternalLink, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkSettings {
  target?: string;
  rel?: string;
  nofollow?: boolean;
  noopener?: boolean;
  noreferrer?: boolean;
}

export const LinkConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Link") {
    return null;
  }

  const href = selectedElement.href ?? "";
  const settings = (selectedElement.settings as LinkSettings) ?? {};

  const target = settings.target ?? "_self";
  const nofollow = settings.nofollow ?? false;
  const noopener = settings.noopener ?? true;
  const noreferrer = settings.noreferrer ?? false;

  const handleHrefChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      href: e.target.value,
    });
  };

  const updateSettings = (patch: Partial<LinkSettings>) => {
    const next = { ...settings, ...patch };

    // Rebuild the `rel` string from booleans
    const relParts: string[] = [];
    if (next.noopener ?? noopener) relParts.push("noopener");
    if (next.noreferrer ?? noreferrer) relParts.push("noreferrer");
    if (next.nofollow ?? nofollow) relParts.push("nofollow");

    updateElement(selectedElement.id, {
      settings: {
        ...next,
        rel: relParts.length > 0 ? relParts.join(" ") : undefined,
      },
    });
  };

  const handleTargetChange = (value: string) => {
    const isExternal = value === "_blank";
    updateSettings({
      target: value,
      // Auto-enable noopener for external links (security best practice)
      noopener: isExternal ? true : noopener,
    });
  };

  // Detect if the URL is external
  const isExternalUrl =
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//");

  return (
    <AccordionItem value="link-settings" className="border-border/40">
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
            <Link2 className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Link Settings</span>
          {isExternalUrl && (
            <span className="ml-auto mr-1 shrink-0">
              <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── URL ── */}
          <ConfigSection>
            <ConfigField
              label="URL"
              htmlFor="link-href"
              hint="The destination URL. Use an absolute URL for external links or a relative path for internal pages."
            >
              <Input
                id="link-href"
                name="href"
                type="text"
                value={href}
                onChange={handleHrefChange}
                placeholder="/page or https://..."
                className="h-7 w-full max-w-[180px] px-2 text-[11px] font-mono"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL type indicator */}
            {href && (
              <div className="flex items-center gap-1.5 pl-1 animate-in fade-in-0 slide-in-from-top-1 duration-150">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                    isExternalUrl
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                  )}
                >
                  {isExternalUrl ? (
                    <>
                      <ExternalLink className="h-2.5 w-2.5" />
                      External
                    </>
                  ) : (
                    <>
                      <Link2 className="h-2.5 w-2.5" />
                      Internal
                    </>
                  )}
                </span>
              </div>
            )}
          </ConfigSection>

          <SectionDivider />

          {/* ── Behavior ── */}
          <ConfigSection
            title="Behavior"
            icon={<ExternalLink className="h-3 w-3" />}
          >
            <ConfigField
              label="Target"
              htmlFor="link-target"
              hint="Where to open the linked document."
            >
              <Select value={target} onValueChange={handleTargetChange}>
                <SelectTrigger
                  id="link-target"
                  className="h-7 w-[120px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_self">
                    <span className="flex items-center gap-1.5">Same tab</span>
                  </SelectItem>
                  <SelectItem value="_blank">
                    <span className="flex items-center gap-1.5">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      New tab
                    </span>
                  </SelectItem>
                  <SelectItem value="_parent">Parent frame</SelectItem>
                  <SelectItem value="_top">Top frame</SelectItem>
                </SelectContent>
              </Select>
            </ConfigField>
          </ConfigSection>

          <SectionDivider />

          {/* ── Security & SEO ── */}
          <ConfigSection
            title="Security & SEO"
            icon={<Shield className="h-3 w-3" />}
          >
            <ConfigField
              label="noopener"
              htmlFor="link-noopener"
              hint="Prevents the new page from accessing window.opener. Recommended for external links."
            >
              <Switch
                id="link-noopener"
                checked={noopener}
                onCheckedChange={(checked) =>
                  updateSettings({ noopener: !!checked })
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            <ConfigField
              label="noreferrer"
              htmlFor="link-noreferrer"
              hint="Prevents the browser from sending the referring page's address. Implies noopener."
            >
              <Switch
                id="link-noreferrer"
                checked={noreferrer}
                onCheckedChange={(checked) =>
                  updateSettings({ noreferrer: !!checked })
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            <ConfigField
              label="nofollow"
              htmlFor="link-nofollow"
              hint="Tells search engines not to follow this link. Useful for untrusted or paid links."
            >
              <Switch
                id="link-nofollow"
                checked={nofollow}
                onCheckedChange={(checked) =>
                  updateSettings({ nofollow: !!checked })
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Visual summary of active rel attributes */}
            {(noopener || noreferrer || nofollow) && (
              <div className="flex items-center gap-1 flex-wrap pt-0.5 animate-in fade-in-0 duration-150">
                <span className="text-[10px] text-muted-foreground/50 mr-0.5">
                  rel=
                </span>
                {noopener && (
                  <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    noopener
                  </span>
                )}
                {noreferrer && (
                  <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    noreferrer
                  </span>
                )}
                {nofollow && (
                  <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                    nofollow
                  </span>
                )}
              </div>
            )}
          </ConfigSection>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
