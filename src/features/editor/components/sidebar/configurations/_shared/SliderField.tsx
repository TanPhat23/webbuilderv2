"use client";

import React, { useCallback, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { ConfigField } from "./ConfigField";
import { cn } from "@/lib/utils";

/* ─── Helpers ─── */

/**
 * Parse a CSS value like "16px", "1.5em", "auto", or a raw number
 * into a numeric value for the slider.
 */
function parseCSSValue(value: string | number | undefined): number {
  if (value === undefined || value === null || value === "") return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a numeric value back into a CSS string with a unit suffix.
 */
function formatCSSValue(value: number, unit: string): string {
  if (unit === "") return value.toString();
  return `${value}${unit}`;
}

/* ─── Types ─── */

interface SliderFieldProps {
  /** Label shown on the left */
  label: string;
  /** Optional tooltip hint */
  hint?: string;
  /** HTML `for` / `id` attribute */
  id?: string;
  /** Current value — can be a CSS string like "16px" or a raw number */
  value: string | number | undefined;
  /** Called with the new CSS string value (e.g. "16px") or raw number */
  onChange: (value: string | number) => void;
  /** Slider minimum */
  min?: number;
  /** Slider maximum */
  max?: number;
  /** Slider step */
  step?: number;
  /** Unit suffix appended to the formatted value (default: "px") */
  unit?: string;
  /**
   * When true, onChange receives a raw number instead of a formatted string.
   * Useful for properties like opacity (0-1) or z-index.
   */
  rawNumber?: boolean;
  /** Placeholder text for the input */
  placeholder?: string;
  /** Allow direct text input (for values like "auto", "50%", etc.) */
  allowTextInput?: boolean;
  /** Width of the text input (default: "w-[56px]") */
  inputWidth?: string;
  /** Additional className for the outer wrapper */
  className?: string;
  /** Show the slider (default: true). Set to false for input-only mode */
  showSlider?: boolean;
  /** Display a unit badge after the input */
  showUnit?: boolean;
}


export function SliderField({
  label,
  hint,
  id,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "px",
  rawNumber = false,
  placeholder,
  allowTextInput = false,
  inputWidth = "w-[56px]",
  className,
  showSlider = true,
  showUnit = true,
}: SliderFieldProps) {
  const numericValue = useMemo(() => parseCSSValue(value), [value]);

  const handleSliderChange = useCallback(
    ([val]: number[]) => {
      if (rawNumber) {
        onChange(val);
      } else {
        onChange(formatCSSValue(val, unit));
      }
    },
    [onChange, rawNumber, unit]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // If text input is allowed, pass the raw string through
      if (allowTextInput) {
        onChange(raw);
        return;
      }

      // Try to parse as number
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        if (rawNumber) {
          onChange(parsed);
        } else {
          onChange(formatCSSValue(parsed, unit));
        }
      } else if (raw === "" || raw === "-") {
        // Allow clearing or typing a negative sign
        if (rawNumber) {
          onChange(0);
        } else {
          onChange(formatCSSValue(0, unit));
        }
      }
    },
    [onChange, rawNumber, unit, allowTextInput]
  );

  // Display value in the input — strip the unit for a cleaner look
  const inputDisplayValue = useMemo(() => {
    if (value === undefined || value === null) return "";
    if (typeof value === "number") return value.toString();
    if (allowTextInput) return value;
    // Strip unit suffix for display
    const num = parseFloat(value);
    return isNaN(num) ? value : num.toString();
  }, [value, allowTextInput]);

  return (
    <ConfigField label={label} hint={hint} htmlFor={id} className={className}>
      {showSlider && (
        <Slider
          id={id}
          min={min}
          max={max}
          step={step}
          value={[numericValue]}
          onValueChange={handleSliderChange}
          className={cn("flex-1 min-w-[60px]", !showSlider && "hidden")}
        />
      )}

      <div className="flex items-center gap-0.5">
        <Input
          id={showSlider ? undefined : id}
          type={allowTextInput ? "text" : "number"}
          value={inputDisplayValue}
          onChange={handleInputChange}
          placeholder={placeholder ?? (rawNumber ? "0" : `0`)}
          className={cn(
            "h-7 px-1.5 text-[11px] text-center font-mono tabular-nums",
            "rounded-md border-border/60 bg-background",
            "focus:border-foreground/30 focus:ring-1 focus:ring-foreground/10",
            "transition-colors",
            inputWidth
          )}
          autoComplete="off"
          min={allowTextInput ? undefined : min}
          max={allowTextInput ? undefined : max}
          step={allowTextInput ? undefined : step}
        />

        {showUnit && unit && !rawNumber && (
          <span className="text-[10px] text-muted-foreground/60 font-medium select-none w-[18px] text-left">
            {unit}
          </span>
        )}
      </div>
    </ConfigField>
  );
}

/* ─── Spacing Group (4-directional padding / margin) ─── */

interface SpacingGroupProps {
  /** "Padding" or "Margin" */
  label: string;
  /** Current style values for each direction */
  values: {
    top: string | number | undefined;
    right: string | number | undefined;
    bottom: string | number | undefined;
    left: string | number | undefined;
  };
  /** Called with (direction, newValue) */
  onChange: (
    direction: "top" | "right" | "bottom" | "left",
    value: string
  ) => void;
  /** Max value for sliders (default: 100) */
  max?: number;
  className?: string;
}

/**
 * Figma-inspired 4-directional spacing control.
 *
 * ┌────────────────────────────────────────────────┐
 * │  PADDING                                       │
 * │  Top        ═══════●══════   [ 16 ] px         │
 * │  Right      ═══════●══════   [  8 ] px         │
 * │  Bottom     ═══════●══════   [ 16 ] px         │
 * │  Left       ═══════●══════   [  8 ] px         │
 * └────────────────────────────────────────────────┘
 */
export function SpacingGroup({
  label,
  values,
  onChange,
  max = 100,
  className,
}: SpacingGroupProps) {
  const directions = ["top", "right", "bottom", "left"] as const;

  const directionLabels: Record<(typeof directions)[number], string> = {
    top: "Top",
    right: "Right",
    bottom: "Bottom",
    left: "Left",
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        {label}
      </span>
      <div className="flex flex-col gap-1">
        {directions.map((dir) => (
          <SliderField
            key={dir}
            label={directionLabels[dir]}
            id={`${label.toLowerCase()}-${dir}`}
            value={values[dir]}
            onChange={(val) => onChange(dir, String(val))}
            min={0}
            max={max}
            step={1}
            unit="px"
            allowTextInput
            placeholder="0px"
          />
        ))}
      </div>
    </div>
  );
}
