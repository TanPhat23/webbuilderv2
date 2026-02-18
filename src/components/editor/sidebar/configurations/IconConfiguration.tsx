"use client";

import React, { ChangeEvent, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Accordion } from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  IconElement,
  IconSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
  SliderField,
  ColorPickerField,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Smile,
  Settings2,
  Paintbrush,
  Search,
  X,
  Ruler,
  PenTool,
  Palette,
  Droplets,
} from "lucide-react";
import { DynamicIcon, iconNames } from "lucide-react/dynamic";
import type { IconName } from "lucide-react/dynamic";

/* ─── Constants ─── */

const ALL_ICON_NAMES = Array.from(iconNames);
const MAX_VISIBLE_ICONS = 60;

const DEFAULT_SIZE = 24;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_COLOR = "currentColor";
const DEFAULT_FILL = "none";

/* ─── Color Presets ─── */

const ICON_COLOR_PRESETS = [
  { color: "currentColor", label: "Inherit" },
  { color: "#000000", label: "Black" },
  { color: "#ffffff", label: "White" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
  { color: "#6b7280", label: "Gray" },
] as const;

const FILL_COLOR_PRESETS = [
  { color: "none", label: "None" },
  { color: "currentColor", label: "Inherit" },
  { color: "#000000", label: "Black" },
  { color: "#ffffff", label: "White" },
  { color: "#ef4444", label: "Red" },
  { color: "#f97316", label: "Orange" },
  { color: "#eab308", label: "Yellow" },
  { color: "#22c55e", label: "Green" },
  { color: "#3b82f6", label: "Blue" },
  { color: "#8b5cf6", label: "Purple" },
  { color: "#ec4899", label: "Pink" },
] as const;

/* ─── Icon Picker Sub-component ─── */

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.slice(0, MAX_VISIBLE_ICONS);
    const query = search.toLowerCase().trim();
    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(query),
    ).slice(0, MAX_VISIBLE_ICONS);
  }, [search]);

  const totalMatches = useMemo(() => {
    if (!search.trim()) return ALL_ICON_NAMES.length;
    const query = search.toLowerCase().trim();
    return ALL_ICON_NAMES.filter((name) =>
      name.toLowerCase().includes(query),
    ).length;
  }, [search]);

  const isValidIcon = value && ALL_ICON_NAMES.includes(value as IconName);

  return (
    <div className="flex flex-col gap-2">
      {/* Current selection */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-lg border transition-colors",
            isValidIcon
              ? "border-border bg-muted/30"
              : "border-dashed border-border/50 bg-muted/10",
          )}
        >
          {isValidIcon ? (
            <DynamicIcon name={value as IconName} size={20} strokeWidth={2} />
          ) : (
            <Smile className="h-5 w-5 text-muted-foreground/30" />
          )}
        </div>
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <Input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="icon-name"
            className="h-7 w-full px-2 text-[11px] font-mono rounded-md"
            autoComplete="off"
          />
          {value && !isValidIcon && (
            <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60">
              Unknown icon name
            </span>
          )}
          {isValidIcon && (
            <span className="text-[10px] text-muted-foreground/50 font-mono truncate">
              {value}
            </span>
          )}
        </div>
      </div>

      {/* Toggle picker */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex items-center gap-1.5 text-[10px] font-medium transition-colors px-1",
          isExpanded
            ? "text-primary"
            : "text-muted-foreground/60 hover:text-muted-foreground",
        )}
      >
        <Search className="h-3 w-3" />
        <span>{isExpanded ? "Hide icon browser" : "Browse icons"}</span>
        {!isExpanded && (
          <span className="text-muted-foreground/40 ml-auto">
            {ALL_ICON_NAMES.length.toLocaleString()} icons
          </span>
        )}
      </button>

      {/* Expanded picker */}
      {isExpanded && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground/40" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="h-7 w-full pl-7 pr-7 text-[11px] rounded-md"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center gap-1.5 px-0.5">
            <span className="text-[10px] text-muted-foreground/50">
              {totalMatches > MAX_VISIBLE_ICONS
                ? `Showing ${MAX_VISIBLE_ICONS} of ${totalMatches.toLocaleString()} matches`
                : `${totalMatches} match${totalMatches !== 1 ? "es" : ""}`}
            </span>
          </div>

          {/* Icon grid */}
          <div className="grid grid-cols-6 gap-1 max-h-[240px] overflow-y-auto rounded-md border border-border/30 bg-muted/10 p-1.5">
            {filteredIcons.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  onChange(name);
                  setIsExpanded(false);
                  setSearch("");
                }}
                title={name}
                className={cn(
                  "flex items-center justify-center aspect-square rounded-md transition-all duration-100",
                  "hover:bg-muted/80 hover:shadow-sm",
                  value === name
                    ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary"
                    : "bg-background text-foreground/70 hover:text-foreground border border-transparent hover:border-border/50",
                )}
              >
                <DynamicIcon
                  name={name as IconName}
                  size={16}
                  strokeWidth={2}
                />
              </button>
            ))}

            {filteredIcons.length === 0 && (
              <div className="col-span-6 flex flex-col items-center justify-center py-8 gap-2 text-center">
                <Search className="h-5 w-5 text-muted-foreground/30" />
                <span className="text-[11px] text-muted-foreground/50">
                  No icons matching &ldquo;{search}&rdquo;
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Component ─── */

export default function IconConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Icon") {
    return null;
  }

  const settings: IconSettings =
    (selectedElement as IconElement).settings ?? {};

  /* ─── Handlers ─── */

  const updateSetting = <K extends keyof IconSettings>(
    key: K,
    value: IconSettings[K],
  ) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value },
    });
  };

  const handleIconNameChange = (iconName: string) => {
    updateSetting("iconName", iconName || undefined);
  };

  const handleNumberInput = (
    name: keyof IconSettings,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  /* ─── Derived State ─── */

  const iconName = settings.iconName ?? "";
  const size = settings.size ?? DEFAULT_SIZE;
  const strokeWidth = settings.strokeWidth ?? DEFAULT_STROKE_WIDTH;
  const color = settings.color ?? DEFAULT_COLOR;
  const fill = settings.fill ?? DEFAULT_FILL;
  const absoluteStrokeWidth = settings.absoluteStrokeWidth ?? false;

  const isValidIcon =
    iconName.length > 0 && ALL_ICON_NAMES.includes(iconName as IconName);

  return (
    <AccordionItem value="icon-settings" className="border-border/40">
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
            {isValidIcon ? (
              <DynamicIcon
                name={iconName as IconName}
                size={14}
                strokeWidth={2}
              />
            ) : (
              <Smile className="h-3.5 w-3.5" />
            )}
          </span>
          <span className="truncate">Icon Settings</span>
          {iconName && (
            <span className="ml-auto mr-1 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-mono",
                  isValidIcon
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                )}
              >
                {iconName}
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["icon-select", "sizing", "colors"]}
          className="w-full"
        >
          {/* ── Icon Selection ── */}
          <AccordionSection
            value="icon-select"
            title="Icon"
            icon={<Smile />}
            nested
          >
            <IconPicker value={iconName} onChange={handleIconNameChange} />
          </AccordionSection>

          {/* ── Sizing ── */}
          <AccordionSection
            value="sizing"
            title="Sizing"
            icon={<Ruler />}
            nested
          >
            {/* Size */}
            <ConfigField
              label="Size"
              htmlFor="icon-size"
              hint="The width and height of the icon in pixels. The icon scales proportionally."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="icon-size"
                  type="number"
                  value={size}
                  onChange={(e) => handleNumberInput("size", e)}
                  placeholder="24"
                  min={8}
                  max={512}
                  step={1}
                  className="h-7 w-[64px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Quick size presets */}
            <div className="flex items-center gap-1 pl-0.5">
              {[16, 20, 24, 32, 40, 48, 64].map((presetSize) => (
                <button
                  key={presetSize}
                  type="button"
                  onClick={() => updateSetting("size", presetSize)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-all",
                    size === presetSize
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/40 text-muted-foreground/60 hover:bg-muted/80 hover:text-muted-foreground",
                  )}
                >
                  {presetSize}
                </button>
              ))}
            </div>

            <SectionDivider />

            {/* Stroke Width */}
            <ConfigField
              label="Stroke width"
              htmlFor="icon-strokeWidth"
              hint="The thickness of the icon's lines. Default is 2. Lower values create thinner icons, higher values create bolder icons."
            >
              <div className="flex items-center gap-1">
                <Input
                  id="icon-strokeWidth"
                  type="number"
                  value={strokeWidth}
                  onChange={(e) => handleNumberInput("strokeWidth", e)}
                  placeholder="2"
                  min={0.5}
                  max={4}
                  step={0.25}
                  className="h-7 w-[64px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
                <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                  px
                </span>
              </div>
            </ConfigField>

            {/* Quick stroke presets */}
            <div className="flex items-center gap-1 pl-0.5">
              {[0.5, 1, 1.5, 2, 2.5, 3].map((presetStroke) => (
                <button
                  key={presetStroke}
                  type="button"
                  onClick={() => updateSetting("strokeWidth", presetStroke)}
                  className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums transition-all",
                    strokeWidth === presetStroke
                      ? "bg-primary text-primary-foreground font-medium"
                      : "bg-muted/40 text-muted-foreground/60 hover:bg-muted/80 hover:text-muted-foreground",
                  )}
                >
                  {presetStroke}
                </button>
              ))}
            </div>

            <SectionDivider />

            {/* Absolute Stroke Width */}
            <ConfigField
              label="Absolute stroke"
              htmlFor="icon-absoluteStrokeWidth"
              hint="When enabled, the stroke width stays constant regardless of the icon size. When disabled (default), the stroke scales proportionally with the icon."
            >
              <Switch
                id="icon-absoluteStrokeWidth"
                checked={absoluteStrokeWidth}
                onCheckedChange={(checked) =>
                  updateSetting("absoluteStrokeWidth", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Stroke behavior info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <PenTool className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {absoluteStrokeWidth
                  ? `Fixed ${strokeWidth}px stroke — consistent at any size`
                  : `Proportional stroke — scales with ${size}px icon`}
              </span>
            </div>

            {/* Size preview */}
            <SectionDivider />
            <div className="flex items-center justify-center py-2 animate-in fade-in-0 duration-150">
              <div className="flex items-center justify-center rounded-lg border border-border/40 bg-muted/10 p-3">
                {isValidIcon ? (
                  <DynamicIcon
                    name={iconName as IconName}
                    size={Math.min(size, 64)}
                    strokeWidth={strokeWidth}
                    absoluteStrokeWidth={absoluteStrokeWidth}
                    color={color}
                    fill={fill}
                  />
                ) : (
                  <Smile
                    size={Math.min(size, 64)}
                    strokeWidth={strokeWidth}
                    className="text-muted-foreground/30"
                  />
                )}
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 animate-in fade-in-0 duration-150">
              <Ruler className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                {size}px &middot; stroke {strokeWidth}
              </span>
            </div>
          </AccordionSection>

          {/* ── Colors ── */}
          <AccordionSection
            value="colors"
            title="Colors"
            icon={<Palette />}
            nested
          >
            {/* Stroke Color */}
            <ConfigSection
              title="Stroke Color"
              icon={<Paintbrush className="h-3 w-3" />}
            >
              <ConfigField
                label="Color"
                htmlFor="icon-color"
                hint="The stroke (outline) color of the icon. Use 'currentColor' to inherit the text color from the parent element."
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-6 h-6 rounded border border-border/60 shrink-0"
                    style={{
                      backgroundColor:
                        color === "currentColor" ? "#6b7280" : color,
                    }}
                  />
                  <Input
                    id="icon-color"
                    type="text"
                    value={color}
                    onChange={(e) =>
                      updateSetting("color", e.target.value || DEFAULT_COLOR)
                    }
                    placeholder="currentColor"
                    className="h-7 w-[110px] px-2 text-[11px] font-mono rounded-md"
                    autoComplete="off"
                  />
                </div>
              </ConfigField>

              {/* Color presets */}
              <div className="flex items-center gap-1 flex-wrap pl-0.5">
                {ICON_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => updateSetting("color", preset.color)}
                    title={preset.label}
                    className={cn(
                      "w-5 h-5 rounded-full border transition-all",
                      color === preset.color
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary"
                        : "border-border/50 hover:border-border hover:scale-110",
                      preset.color === "currentColor" &&
                        "bg-gradient-to-br from-gray-400 to-gray-600",
                    )}
                    style={
                      preset.color !== "currentColor"
                        ? { backgroundColor: preset.color }
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Color info */}
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Paintbrush className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  {color === "currentColor"
                    ? "Inheriting color from parent text color"
                    : `Stroke: ${color}`}
                </span>
              </div>
            </ConfigSection>

            <SectionDivider />

            {/* Fill Color */}
            <ConfigSection
              title="Fill Color"
              icon={<Droplets className="h-3 w-3" />}
            >
              <ConfigField
                label="Fill"
                htmlFor="icon-fill"
                hint="The fill color for the icon interior. Use 'none' for outlined icons (default). Use 'currentColor' to fill with the inherited text color."
              >
                <div className="flex items-center gap-1.5">
                  <div
                    className={cn(
                      "w-6 h-6 rounded border border-border/60 shrink-0",
                      fill === "none" &&
                        "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
                    )}
                    style={
                      fill !== "none"
                        ? {
                            backgroundColor:
                              fill === "currentColor" ? "#6b7280" : fill,
                          }
                        : undefined
                    }
                  />
                  <Input
                    id="icon-fill"
                    type="text"
                    value={fill}
                    onChange={(e) =>
                      updateSetting("fill", e.target.value || DEFAULT_FILL)
                    }
                    placeholder="none"
                    className="h-7 w-[110px] px-2 text-[11px] font-mono rounded-md"
                    autoComplete="off"
                  />
                </div>
              </ConfigField>

              {/* Fill presets */}
              <div className="flex items-center gap-1 flex-wrap pl-0.5">
                {FILL_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.color}
                    type="button"
                    onClick={() => updateSetting("fill", preset.color)}
                    title={preset.label}
                    className={cn(
                      "w-5 h-5 rounded-full border transition-all",
                      fill === preset.color
                        ? "ring-2 ring-primary ring-offset-1 ring-offset-background border-primary"
                        : "border-border/50 hover:border-border hover:scale-110",
                      preset.color === "none" &&
                        "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:6px_6px]",
                      preset.color === "currentColor" &&
                        "bg-gradient-to-br from-gray-400 to-gray-600",
                    )}
                    style={
                      preset.color !== "none" && preset.color !== "currentColor"
                        ? { backgroundColor: preset.color }
                        : undefined
                    }
                  />
                ))}
              </div>

              {/* Fill info */}
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Droplets className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  {fill === "none"
                    ? "No fill — outlined icon"
                    : fill === "currentColor"
                      ? "Fill inheriting parent text color"
                      : `Fill: ${fill}`}
                </span>
              </div>
            </ConfigSection>
          </AccordionSection>
        </Accordion>

        {/* ── Final Summary ── */}
        <SectionDivider className="mt-2" />
        <div className="flex items-center gap-1.5 flex-wrap pt-2 pl-0.5 animate-in fade-in-0 duration-150">
          {isValidIcon ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <DynamicIcon
                name={iconName as IconName}
                size={10}
                strokeWidth={2}
              />
              {iconName}
            </span>
          ) : iconName ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
              <Smile className="h-2.5 w-2.5" />
              unknown
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Smile className="h-2.5 w-2.5" />
              no icon
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <Ruler className="h-2.5 w-2.5" />
            {size}px
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
            <PenTool className="h-2.5 w-2.5" />
            {strokeWidth}
          </span>
          {fill !== "none" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Droplets className="h-2.5 w-2.5" />
              filled
            </span>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
