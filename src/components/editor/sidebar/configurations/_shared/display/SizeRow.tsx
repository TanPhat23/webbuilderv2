"use client";

import React from "react";
import { CompactInput } from "./CompactInput";
import type { DisplayStyles, UpdateStyleFn } from "./types";

interface SizeRowProps {
  /** Current width value */
  width: DisplayStyles["width"];
  /** Current height value */
  height: DisplayStyles["height"];
  /** Style update callback */
  updateStyle: UpdateStyleFn;
}

/**
 * Figma-style compact width/height input row.
 *
 * ┌──────────────────┬──────────────────┐
 * │  W  auto    Fill │  H  auto         │
 * └──────────────────┴──────────────────┘
 */
export function SizeRow({ width, height, updateStyle }: SizeRowProps) {
  const widthStr = width?.toString() || "auto";
  const heightStr = height?.toString() || "auto";

  return (
    <div className="grid grid-cols-2 gap-1.5">
      <CompactInput
        label="W"
        value={widthStr}
        onChange={(val) => updateStyle("width", val)}
        placeholder="auto"
        badge={widthStr === "100%" ? "Fill" : undefined}
      />
      <CompactInput
        label="H"
        value={heightStr}
        onChange={(val) => updateStyle("height", val)}
        placeholder="auto"
      />
    </div>
  );
}
