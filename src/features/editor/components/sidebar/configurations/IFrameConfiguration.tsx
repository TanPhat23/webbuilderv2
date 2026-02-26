"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import {
  IFrameElement,
  IFrameSettings,
} from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Globe,
  Settings2,
  Shield,
  Monitor,
  Loader,
  ExternalLink,
  Lock,
  CheckCircle2,
} from "lucide-react";

/* ─── Sandbox Options ─── */

interface SandboxOption {
  value: string;
  label: string;
  description: string;
}

const SANDBOX_OPTIONS: SandboxOption[] = [
  {
    value: "allow-scripts",
    label: "Scripts",
    description: "Allow JavaScript execution",
  },
  {
    value: "allow-same-origin",
    label: "Same Origin",
    description: "Treat content as same-origin",
  },
  {
    value: "allow-forms",
    label: "Forms",
    description: "Allow form submission",
  },
  {
    value: "allow-popups",
    label: "Popups",
    description: "Allow popups (window.open, target=_blank)",
  },
  {
    value: "allow-modals",
    label: "Modals",
    description: "Allow modal dialogs (alert, confirm, prompt)",
  },
  {
    value: "allow-top-navigation",
    label: "Top Navigation",
    description: "Allow navigating the top-level browsing context",
  },
];

/* ─── Loading Options ─── */

const LOADING_OPTIONS = [
  { value: "lazy", label: "Lazy", description: "Load when near viewport" },
  { value: "eager", label: "Eager", description: "Load immediately" },
] as const;

/* ─── Referrer Policy Options ─── */

const REFERRER_POLICY_OPTIONS = [
  { value: "no-referrer", label: "No Referrer" },
  { value: "no-referrer-when-downgrade", label: "No Referrer When Downgrade" },
  { value: "origin", label: "Origin" },
  { value: "origin-when-cross-origin", label: "Origin When Cross-Origin" },
  { value: "same-origin", label: "Same Origin" },
  { value: "strict-origin", label: "Strict Origin" },
  {
    value: "strict-origin-when-cross-origin",
    label: "Strict Origin When Cross-Origin",
  },
  { value: "unsafe-url", label: "Unsafe URL" },
] as const;

/* ─── Main Component ─── */

export default function IFrameConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "IFrame") {
    return null;
  }

  const element = selectedElement as IFrameElement;
  const settings: IFrameSettings = element.settings ?? {};
  const src = element.src ?? "";

  /* ─── Handlers ─── */

  const handleSrcChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };

  const updateSetting = <K extends keyof IFrameSettings>(
    key: K,
    value: IFrameSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value },
    });
  };

  const handleNumberInput = (
    name: keyof IFrameSettings,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  /* ─── Sandbox Helpers ─── */

  const currentSandboxValues = settings.sandbox
    ? settings.sandbox.split(" ").filter(Boolean)
    : [];

  const isSandboxEnabled = settings.sandbox !== undefined;

  const toggleSandboxValue = (value: string) => {
    const current = new Set(currentSandboxValues);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    const newSandbox = Array.from(current).join(" ");
    updateSetting("sandbox", newSandbox || "");
  };

  const toggleSandboxEnabled = (enabled: boolean) => {
    if (enabled) {
      // Enable sandbox with restrictive default (allow-scripts allow-same-origin)
      updateSetting("sandbox", "allow-scripts allow-same-origin");
    } else {
      updateSetting("sandbox", undefined);
    }
  };

  /* ─── Derived State ─── */

  const hasSrc = src.length > 0;
  const isExternalUrl =
    hasSrc && (src.startsWith("http://") || src.startsWith("https://"));

  return (
    <AccordionItem value="iframe-settings" className="border-border/40">
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
            <Globe className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">IFrame Settings</span>
          {hasSrc && (
            <span className="ml-auto mr-1 shrink-0">
              <CheckCircle2 className="h-3 w-3 text-emerald-500/60" />
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["source", "security", "display"]}
          className="w-full"
        >
          {/* ── Source ── */}
          <AccordionSection
            value="source"
            title="Source"
            icon={<Settings2 />}
            nested
          >
            {/* Source URL */}
            <ConfigField
              label="Source URL"
              htmlFor="iframe-src"
              hint="The URL of the page to embed. Must be a valid URL that allows embedding (not blocked by X-Frame-Options or CSP)."
              vertical
            >
              <Input
                id="iframe-src"
                type="text"
                value={src}
                onChange={handleSrcChange}
                placeholder="https://example.com"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* URL indicator */}
            {hasSrc && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150">
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
                      External embed
                    </>
                  ) : (
                    <>
                      <Globe className="h-2.5 w-2.5" />
                      Internal embed
                    </>
                  )}
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Allow */}
            <ConfigField
              label="Allow"
              htmlFor="iframe-allow"
              hint="Feature policy directives (Permissions-Policy). Controls which browser features the iframe can access. Example: 'camera; microphone; fullscreen'."
              vertical
            >
              <Input
                id="iframe-allow"
                type="text"
                value={settings.allow ?? ""}
                onChange={(e) =>
                  updateSetting("allow", e.target.value || undefined)
                }
                placeholder="camera; microphone; fullscreen"
                className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {settings.allow && (
              <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
                <span className="text-[10px] text-muted-foreground/50 mr-0.5">
                  allow=
                </span>
                {settings.allow
                  .split(";")
                  .map((p) => p.trim())
                  .filter(Boolean)
                  .map((permission) => (
                    <span
                      key={permission}
                      className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                    >
                      {permission}
                    </span>
                  ))}
              </div>
            )}
          </AccordionSection>

          {/* ── Security ── */}
          <AccordionSection
            value="security"
            title="Security"
            icon={<Shield />}
            nested
          >
            {/* Sandbox toggle */}
            <ConfigField
              label="Sandbox"
              htmlFor="iframe-sandbox-toggle"
              hint="Enable sandboxing to restrict iframe capabilities. When enabled, all restrictions are applied and you selectively allow features. This is a security best practice for embedding third-party content."
            >
              <Switch
                id="iframe-sandbox-toggle"
                checked={isSandboxEnabled}
                onCheckedChange={toggleSandboxEnabled}
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Sandbox permissions */}
            {isSandboxEnabled && (
              <>
                <SectionDivider />
                <ConfigSection
                  title="Sandbox Permissions"
                  icon={<Lock className="h-3 w-3" />}
                >
                  {SANDBOX_OPTIONS.map((opt) => (
                    <ConfigField
                      key={opt.value}
                      label={opt.label}
                      hint={opt.description}
                    >
                      <Switch
                        checked={currentSandboxValues.includes(opt.value)}
                        onCheckedChange={() => toggleSandboxValue(opt.value)}
                        className="scale-75 origin-right"
                      />
                    </ConfigField>
                  ))}

                  {/* Active sandbox summary */}
                  {currentSandboxValues.length > 0 && (
                    <>
                      <SectionDivider />
                      <div className="flex items-center gap-1 flex-wrap pt-0.5 animate-in fade-in-0 duration-150">
                        <span className="text-[10px] text-muted-foreground/50 mr-0.5">
                          sandbox=
                        </span>
                        {currentSandboxValues.map((v) => (
                          <span
                            key={v}
                            className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground"
                          >
                            {v}
                          </span>
                        ))}
                      </div>
                    </>
                  )}

                  {currentSandboxValues.length === 0 && (
                    <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                      <Shield className="h-3 w-3 text-amber-500/60" />
                      <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                        Maximum restriction — no permissions granted
                      </span>
                    </div>
                  )}
                </ConfigSection>
              </>
            )}

            {!isSandboxEnabled && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Shield className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 leading-tight">
                  No sandbox — iframe has full access to browser APIs
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Referrer Policy */}
            <ConfigField
              label="Referrer policy"
              htmlFor="iframe-referrerPolicy"
              hint="Controls how much referrer information is sent when navigating from the iframe. Stricter policies improve privacy."
            >
              <Select
                value={
                  settings.referrerPolicy ?? "strict-origin-when-cross-origin"
                }
                onValueChange={(value) =>
                  updateSetting(
                    "referrerPolicy",
                    value as IFrameSettings["referrerPolicy"],
                  )
                }
              >
                <SelectTrigger
                  id="iframe-referrerPolicy"
                  className="h-7 w-[160px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REFERRER_POLICY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="text-[11px]">{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>
          </AccordionSection>

          {/* ── Display ── */}
          <AccordionSection
            value="display"
            title="Display"
            icon={<Monitor />}
            nested
          >
            {/* Loading */}
            <ConfigField
              label="Loading"
              htmlFor="iframe-loading"
              hint="Lazy loading defers loading the iframe until it's near the viewport, improving initial page performance."
            >
              <Select
                value={settings.loading ?? "lazy"}
                onValueChange={(value) =>
                  updateSetting(
                    "loading",
                    value as IFrameSettings["loading"],
                  )
                }
              >
                <SelectTrigger
                  id="iframe-loading"
                  className="h-7 w-[100px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LOADING_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Loading info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Loader className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                {
                  LOADING_OPTIONS.find(
                    (o) => o.value === (settings.loading ?? "lazy"),
                  )?.description
                }
              </span>
            </div>

            <SectionDivider />

            {/* Width */}
            <ConfigField
              label="Width"
              htmlFor="iframe-width"
              hint="Intrinsic width of the iframe in pixels. Can be overridden by CSS styles."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="iframe-width"
                  type="number"
                  value={settings.width ?? ""}
                  onChange={(e) => handleNumberInput("width", e)}
                  placeholder="auto"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Height */}
            <ConfigField
              label="Height"
              htmlFor="iframe-height"
              hint="Intrinsic height of the iframe in pixels. Can be overridden by CSS styles."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="iframe-height"
                  type="number"
                  value={settings.height ?? ""}
                  onChange={(e) => handleNumberInput("height", e)}
                  placeholder="auto"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Dimensions summary */}
            {(settings.width || settings.height) && (
              <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                <Monitor className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {settings.width ?? "auto"} × {settings.height ?? "auto"}
                </span>
              </div>
            )}
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
