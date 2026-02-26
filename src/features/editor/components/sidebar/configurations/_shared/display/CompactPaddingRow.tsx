"use client";

import React from "react";
import { CompactInput } from "./CompactInput";
import {
  AlignHorizontalJustifyCenter,
  AlignVerticalJustifyCenter,
} from "lucide-react";
import type { DisplayStyles, UpdateStyleFn } from "./types";

interface CompactPaddingRowProps {
  /** Current padding values */
  paddingTop: DisplayStyles["paddingTop"];
  paddingBottom: DisplayStyles["paddingBottom"];
  paddingLeft: DisplayStyles["paddingLeft"];
  paddingRight: DisplayStyles["paddingRight"];
  /** Style update callback */
  updateStyle: UpdateStyleFn;
}

/**
 * Figma-style compact padding controls — horizontal and vertical padding
 * are paired together for a cleaner UI.
 *
 * ┌──────────────────┬──────────────────┐
 * │  ↔  10           │  ↕  10           │
 * └──────────────────┴──────────────────┘
 *
 * Horizontal sets both paddingLeft & paddingRight.
 * Vertical sets both paddingTop & paddingBottom.
 */
export function CompactPaddingRow({
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  updateStyle,
}: CompactPaddingRowProps) {
  const horizontalValue =
    paddingLeft?.toString() || paddingRight?.toString() || "0";
  const verticalValue =
    paddingTop?.toString() || paddingBottom?.toString() || "0";

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <CompactInput
        icon={<AlignHorizontalJustifyCenter className="h-3 w-3" />}
        iconTooltip="Horizontal Padding (Left & Right)"
        iconTooltipSide="bottom"
        value={horizontalValue}
        onChange={(val) => {
          updateStyle("paddingLeft", val);
          updateStyle("paddingRight", val);
        }}
        placeholder="0"
      />
      <CompactInput
        icon={<AlignVerticalJustifyCenter className="h-3 w-3" />}
        iconTooltip="Vertical Padding (Top & Bottom)"
        iconTooltipSide="bottom"
        value={verticalValue}
        onChange={(val) => {
          updateStyle("paddingTop", val);
          updateStyle("paddingBottom", val);
        }}
        placeholder="0"
      />
    </div>
  );
}
