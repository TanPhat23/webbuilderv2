"use client";

import React from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConfigField } from "./ConfigField";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

export interface ToggleOption {
  /** Unique value for this option */
  value: string;
  /** Icon element (lucide-react icon recommended, sized at h-3.5 w-3.5) */
  icon?: React.ReactNode;
  /** Text label — used as tooltip if icon is provided, or inline if no icon */
  label: string;
}

interface ToggleGroupFieldProps {
  /** Label shown on the left */
  label: string;
  /** Optional tooltip hint for the label */
  hint?: string;
  /** Currently selected value (single mode) or values (multi mode) */
  value: string | undefined;
  /** Called with the new selected value. `undefined` means deselected. */
  onChange: (value: string | undefined) => void;
  /** Available options */
  options: ToggleOption[];
  /** Allow deselecting (default: true) */
  allowDeselect?: boolean;
  /** Visual variant for the toggle items */
  variant?: "default" | "outline";
  /** Size of the toggle items */
  size?: "default" | "sm" | "lg";
  /** Additional className for the outer wrapper */
  className?: string;
  /** Additional className for the ToggleGroup container */
  groupClassName?: string;
  /** If true, include a "Default" / "None" option at the start */
  includeDefault?: boolean;
  /** Label for the default option (default: "Default") */
  defaultLabel?: string;
}

export function ToggleGroupField({
  label,
  hint,
  value,
  onChange,
  options,
  allowDeselect = true,
  variant = "outline",
  size = "sm",
  className,
  groupClassName,
  includeDefault = false,
  defaultLabel = "Default",
}: ToggleGroupFieldProps) {
  const handleValueChange = (next: string) => {
    if (next === "__default__") {
      onChange(undefined);
      return;
    }

    if (!next && allowDeselect) {
      onChange(undefined);
      return;
    }

    if (next) {
      onChange(next);
    }
  };

  const allOptions: ToggleOption[] = includeDefault
    ? [{ value: "__default__", label: defaultLabel }, ...options]
    : options;

  const resolvedValue = value ?? (includeDefault ? "__default__" : "");

  return (
    <ConfigField label={label} hint={hint} className={className}>
      <ToggleGroup
        type="single"
        value={resolvedValue}
        onValueChange={handleValueChange}
        variant={variant}
        size={size}
        className={cn(
          "h-7 gap-0 rounded-md bg-muted/40 p-0.5",
          groupClassName
        )}
      >
        {allOptions.map((option) => (
          <ToggleGroupItemWithTooltip key={option.value} option={option} />
        ))}
      </ToggleGroup>
    </ConfigField>
  );
}

/* ─── Internal: Toggle item with tooltip ─── */

interface ToggleGroupItemWithTooltipProps {
  option: ToggleOption;
}

function ToggleGroupItemWithTooltip({
  option,
}: ToggleGroupItemWithTooltipProps) {
  const content = option.icon ? (
    <span className="flex items-center justify-center">{option.icon}</span>
  ) : (
    <span className="text-[10px] font-medium leading-none px-0.5">
      {option.label}
    </span>
  );

  // If there's an icon, wrap in a tooltip to show the label
  if (option.icon) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <ToggleGroupItem
            value={option.value}
            aria-label={option.label}
            className={cn(
              "h-6 w-7 min-w-0 rounded-[4px] p-0",
              "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
              "transition-all duration-150 ease-out",
              "hover:text-foreground/80"
            )}
          >
            {content}
          </ToggleGroupItem>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-[11px]">
          {option.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  // No icon — text-only toggle item, no tooltip needed
  return (
    <ToggleGroupItem
      value={option.value}
      aria-label={option.label}
      className={cn(
        "h-6 min-w-[28px] rounded-[4px] px-1.5",
        "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        "transition-all duration-150 ease-out",
        "hover:text-foreground/80"
      )}
    >
      {content}
    </ToggleGroupItem>
  );
}

/* ─── Multi-select ToggleGroup variant ─── */

interface ToggleGroupMultiFieldProps {
  /** Label shown on the left */
  label: string;
  /** Optional tooltip hint for the label */
  hint?: string;
  /** Currently selected values */
  value: string[];
  /** Called with the new set of selected values */
  onChange: (values: string[]) => void;
  /** Available options */
  options: ToggleOption[];
  /** Visual variant for the toggle items */
  variant?: "default" | "outline";
  /** Size of the toggle items */
  size?: "default" | "sm" | "lg";
  /** Additional className for the outer wrapper */
  className?: string;
  /** Additional className for the ToggleGroup container */
  groupClassName?: string;
}

/**
 * Multi-select variant for cases like text-decoration
 * where multiple values can be active simultaneously.
 */
export function ToggleGroupMultiField({
  label,
  hint,
  value,
  onChange,
  options,
  variant = "outline",
  size = "sm",
  className,
  groupClassName,
}: ToggleGroupMultiFieldProps) {
  return (
    <ConfigField label={label} hint={hint} className={className}>
      <ToggleGroup
        type="multiple"
        value={value}
        onValueChange={onChange}
        variant={variant}
        size={size}
        className={cn(
          "h-7 gap-0 rounded-md bg-muted/40 p-0.5",
          groupClassName
        )}
      >
        {options.map((option) => (
          <ToggleGroupItemWithTooltip key={option.value} option={option} />
        ))}
      </ToggleGroup>
    </ConfigField>
  );
}
