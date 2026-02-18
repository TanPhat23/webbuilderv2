"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ConfigField } from "./ConfigField";
import { cn } from "@/lib/utils";
import { Pipette } from "lucide-react";

/* ─── Preset Definitions ─── */

export interface ColorPreset {
  label: string;
  value: string;
}

export const BG_COLOR_PRESETS: ColorPreset[] = [
  { label: "Background", value: "var(--background)" },
  { label: "Card", value: "var(--card)" },
  { label: "Primary", value: "var(--primary)" },
  { label: "Secondary", value: "var(--secondary)" },
  { label: "Muted", value: "var(--muted)" },
  { label: "Accent", value: "var(--accent)" },
  { label: "Destructive", value: "var(--destructive)" },
];

export const TEXT_COLOR_PRESETS: ColorPreset[] = [
  { label: "Foreground", value: "var(--foreground)" },
  { label: "Card FG", value: "var(--card-foreground)" },
  { label: "Primary FG", value: "var(--primary-foreground)" },
  { label: "Secondary FG", value: "var(--secondary-foreground)" },
  { label: "Muted FG", value: "var(--muted-foreground)" },
  { label: "Accent FG", value: "var(--accent-foreground)" },
  { label: "Destructive FG", value: "var(--destructive-foreground)" },
];

export const BORDER_COLOR_PRESETS: ColorPreset[] = [
  { label: "Border", value: "var(--border)" },
  { label: "Primary", value: "var(--primary)" },
  { label: "Secondary", value: "var(--secondary)" },
  { label: "Muted", value: "var(--muted)" },
  { label: "Accent", value: "var(--accent)" },
  { label: "Destructive", value: "var(--destructive)" },
];

/* ─── Helpers ─── */

function resolveSelectValue(color: string | undefined): string {
  if (!color) return "default";
  if (color.startsWith("var(")) return color;
  return "custom";
}

function isValidHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{0,8})$/.test(value);
}

/* ─── Swatch ─── */

interface ColorSwatchProps {
  color: string;
  className?: string;
}

function ColorSwatch({ color, className }: ColorSwatchProps) {
  const isVar = color.startsWith("var(");
  const isTransparent = !color || color === "transparent";

  return (
    <span
      className={cn(
        "inline-block h-4 w-4 shrink-0 rounded-[4px] border border-border/60 shadow-sm",
        isTransparent && "bg-[repeating-conic-gradient(#e5e7eb_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]",
        className
      )}
      style={
        !isTransparent
          ? { backgroundColor: isVar ? `hsl(${color})` : color }
          : undefined
      }
    >
      {/* For CSS vars we just set the style directly — the browser resolves it */}
      {isVar && (
        <span
          className="block h-full w-full rounded-[3px]"
          style={{ backgroundColor: color }}
        />
      )}
    </span>
  );
}

/* ─── Main Component ─── */

interface ColorPickerFieldProps {
  /** Label shown on the left */
  label: string;
  /** Optional tooltip hint */
  hint?: string;
  /** Current CSS color value (can be undefined, a var(), or a hex string) */
  value: string | undefined;
  /** Called when color changes. `undefined` means "reset / default" */
  onChange: (color: string | undefined) => void;
  /** Preset theme tokens to offer */
  presets?: ColorPreset[];
  /** Additional className for the outer wrapper */
  className?: string;
}


export function ColorPickerField({
  label,
  hint,
  value,
  onChange,
  presets = BG_COLOR_PRESETS,
  className,
}: ColorPickerFieldProps) {
  const [selectValue, setSelectValue] = useState(() => resolveSelectValue(value));
  const [hexInput, setHexInput] = useState(() =>
    value && !value.startsWith("var(") ? value : ""
  );

  // Sync internal state when the prop changes externally
  useEffect(() => {
    const next = resolveSelectValue(value);
    setSelectValue(next);
    if (next === "custom" && value) {
      setHexInput(value);
    } else if (next !== "custom") {
      setHexInput("");
    }
  }, [value]);

  const handleSelectChange = useCallback(
    (next: string) => {
      setSelectValue(next);
      if (next === "default") {
        onChange(undefined);
        setHexInput("");
      } else if (next === "custom") {
        onChange("");
        setHexInput("");
      } else {
        // theme var
        onChange(next);
        setHexInput("");
      }
    },
    [onChange]
  );

  const handleHexChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (isValidHex(raw)) {
        setHexInput(raw);
        onChange(raw);
      }
    },
    [onChange]
  );

  const handleNativeColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setHexInput(raw);
      setSelectValue("custom");
      onChange(raw);
    },
    [onChange]
  );

  const isCustom = selectValue === "custom";
  const displayColor = isCustom ? hexInput : value;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <ConfigField label={label} hint={hint}>
        {/* Preview swatch */}
        {displayColor && displayColor.length > 0 && (
          <ColorSwatch color={displayColor} />
        )}

        <Select value={selectValue} onValueChange={handleSelectChange}>
          <SelectTrigger className="h-7 w-[120px] px-2 text-[11px] rounded-md">
            <SelectValue placeholder="Default" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">
              <span className="text-muted-foreground">Default</span>
            </SelectItem>
            {presets.map((preset) => (
              <SelectItem key={preset.value} value={preset.value}>
                <div className="flex items-center gap-2">
                  <ColorSwatch color={preset.value} className="h-3 w-3 rounded-sm" />
                  <span>{preset.label}</span>
                </div>
              </SelectItem>
            ))}
            <SelectItem value="custom">
              <div className="flex items-center gap-2">
                <Pipette className="h-3 w-3 text-muted-foreground" />
                <span>Custom</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </ConfigField>

      {/* Custom color row (only when custom is selected) */}
      {isCustom && (
        <div className="flex items-center gap-1.5 pl-[calc(50%-60px)] animate-in fade-in-0 slide-in-from-top-1 duration-150">
          {/* Native color input disguised as a swatch button */}
          <label className="relative cursor-pointer group">
            <input
              type="color"
              value={hexInput || "#000000"}
              onChange={handleNativeColorChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              tabIndex={-1}
            />
            <div
              className={cn(
                "h-7 w-7 rounded-md border border-border/60 shadow-sm",
                "transition-all group-hover:border-foreground/30 group-hover:shadow-md"
              )}
              style={{ backgroundColor: hexInput || "transparent" }}
            />
          </label>

          {/* Hex text input */}
          <Input
            type="text"
            value={hexInput}
            onChange={handleHexChange}
            placeholder="#000000"
            maxLength={9}
            className="h-7 w-[88px] px-2 text-[11px] font-mono tracking-wide"
            autoComplete="off"
          />
        </div>
      )}
    </div>
  );
}
