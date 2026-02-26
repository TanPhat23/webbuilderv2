"use client";

import React from "react";
import { CompactInput } from "./CompactInput";
import { GripHorizontal, GripVertical } from "lucide-react";
import type { DisplayStyles, UpdateStyleFn } from "./types";

interface GapControlsProps {
  /** Current gap value */
  gap: DisplayStyles["gap"];
  /** Current row gap value */
  rowGap: DisplayStyles["rowGap"];
  /** Current column gap value */
  columnGap: DisplayStyles["columnGap"];
  /** Style update callback */
  updateStyle: UpdateStyleFn;
  /** Placeholder for main gap input */
  gapPlaceholder?: string;
  /** Placeholder for row/col gap inputs */
  subGapPlaceholder?: string;
}

/**
 * Figma-style gap controls — a main gap input plus optional row/column gap overrides.
 *
 * ┌─────────────────────────────────┐
 * │  ⋮⋮  10                         │  ← gap
 * ├────────────────┬────────────────┤
 * │  ⋮  10         │  ⋯  10         │  ← rowGap / columnGap
 * └────────────────┴────────────────┘
 */
export function GapControls({
  gap,
  rowGap,
  columnGap,
  updateStyle,
  gapPlaceholder = "0",
  subGapPlaceholder = "—",
}: GapControlsProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
      <CompactInput
        icon={<GripHorizontal className="h-3 w-3" />}
        iconTooltip="Gap"
        iconTooltipSide="left"
        value={gap?.toString() || ""}
        onChange={(val) => updateStyle("gap", val)}
        placeholder={gapPlaceholder}
      />
      <div className="grid grid-cols-2 gap-1.5">
        <CompactInput
          icon={<GripVertical className="h-3 w-3" />}
          iconTooltip="Row Gap"
          iconTooltipSide="left"
          value={rowGap?.toString() || ""}
          onChange={(val) => updateStyle("rowGap", val)}
          placeholder={subGapPlaceholder}
        />
        <CompactInput
          icon={<GripHorizontal className="h-3 w-3" />}
          iconTooltip="Column Gap"
          iconTooltipSide="left"
          value={columnGap?.toString() || ""}
          onChange={(val) => updateStyle("columnGap", val)}
          placeholder={subGapPlaceholder}
        />
      </div>
    </div>
  );
}
