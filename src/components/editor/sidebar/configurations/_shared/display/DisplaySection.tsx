"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Columns3, Rows3, GripHorizontal, GripVertical } from "lucide-react";
import { DisplayModeToggle } from "./DisplayModeToggle";
import { FlexDirectionToggle } from "./FlexDirectionToggle";
import { AlignmentMatrix } from "./AlignmentMatrix";
import { SizeRow } from "./SizeRow";
import { GapControls } from "./GapControls";
import { CompactPaddingRow } from "./CompactPaddingRow";
import { ClipContentCheck } from "./ClipContentCheck";
import { WrapToggle } from "./WrapToggle";
import { CompactInput } from "./CompactInput";
import type { DisplayStyles, UpdateStyleFn, BatchUpdateStyleFn } from "./types";

interface DisplaySectionProps {
  /** Current resolved styles for the active breakpoint */
  styles: DisplayStyles;
  /** Single-property style update callback */
  updateStyle: UpdateStyleFn;
  /** Batch style update callback — sets multiple properties atomically */
  batchUpdateStyle: BatchUpdateStyleFn;
}

/**
 * Figma-inspired "Auto layout" section.
 *
 * Composes all display sub-components into a cohesive panel:
 *
 * ┌─────────────────────────────────────┐
 * │  [ Block ] [ Flex ] [ Grid ] [None] │  ← DisplayModeToggle
 * │                                     │
 * │  (mode-specific controls below)     │
 * └─────────────────────────────────────┘
 *
 * **Flex mode:**
 *   - FlexDirectionToggle (4 arrows)
 *   - SizeRow (W / H)
 *   - AlignmentMatrix + GapControls + WrapToggle
 *   - CompactPaddingRow (horiz / vert)
 *   - ClipContentCheck
 *
 * **Grid mode:**
 *   - SizeRow
 *   - Template columns / rows
 *   - GapControls
 *   - Justify / Align selects
 *   - ClipContentCheck
 *
 * **Block / inline-block:**
 *   - SizeRow
 *   - ClipContentCheck
 */
export function DisplaySection({
  styles,
  updateStyle,
  batchUpdateStyle,
}: DisplaySectionProps) {
  const display = styles.display || "block";

  return (
    <div className="flex flex-col gap-2.5">
      {/* Display mode selector */}
      <DisplayModeToggle
        value={display}
        onChange={(val) => updateStyle("display", val)}
      />

      {/* ─── Flex Controls ─── */}
      {display === "flex" && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {/* Direction toggle */}
          <FlexDirectionToggle
            value={styles.flexDirection || "row"}
            onChange={(val) => updateStyle("flexDirection", val)}
          />

          {/* W / H */}
          <SizeRow
            width={styles.width}
            height={styles.height}
            updateStyle={updateStyle}
          />

          {/* Alignment matrix + Gap + Wrap */}
          <div className="flex items-start gap-1.5">
            <AlignmentMatrix
              justifyContent={styles.justifyContent}
              alignItems={styles.alignItems}
              onBatchUpdate={batchUpdateStyle}
            />

            <GapControls
              gap={styles.gap}
              rowGap={styles.rowGap}
              columnGap={styles.columnGap}
              updateStyle={updateStyle}
            />

            <WrapToggle
              flexWrap={styles.flexWrap}
              updateStyle={updateStyle}
            />
          </div>

          {/* Compact padding */}
          <CompactPaddingRow
            paddingTop={styles.paddingTop}
            paddingBottom={styles.paddingBottom}
            paddingLeft={styles.paddingLeft}
            paddingRight={styles.paddingRight}
            updateStyle={updateStyle}
          />

          {/* Clip content */}
          <ClipContentCheck
            overflow={styles.overflow}
            updateStyle={updateStyle}
            idSuffix="flex"
          />
        </div>
      )}

      {/* ─── Grid Controls ─── */}
      {display === "grid" && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          {/* W / H */}
          <SizeRow
            width={styles.width}
            height={styles.height}
            updateStyle={updateStyle}
          />

          {/* Grid template inputs */}
          <div className="flex flex-col gap-1.5">
            <CompactInput
              icon={<Columns3 className="h-3 w-3" />}
              iconTooltip="Columns"
              iconTooltipSide="left"
              value={styles.gridTemplateColumns?.toString() || ""}
              onChange={(val) => updateStyle("gridTemplateColumns", val)}
              placeholder="e.g. 1fr 1fr"
            />
            <CompactInput
              icon={<Rows3 className="h-3 w-3" />}
              iconTooltip="Rows"
              iconTooltipSide="left"
              value={styles.gridTemplateRows?.toString() || ""}
              onChange={(val) => updateStyle("gridTemplateRows", val)}
              placeholder="e.g. auto 1fr"
            />
          </div>

          {/* Gap controls */}
          <div className="flex flex-col gap-1.5">
            <CompactInput
              icon={<GripHorizontal className="h-3 w-3" />}
              iconTooltip="Gap"
              iconTooltipSide="left"
              value={styles.gap?.toString() || ""}
              onChange={(val) => updateStyle("gap", val)}
              placeholder="8px"
            />
            <div className="grid grid-cols-2 gap-1.5">
              <CompactInput
                icon={<GripVertical className="h-3 w-3" />}
                iconTooltip="Row Gap"
                iconTooltipSide="left"
                value={styles.rowGap?.toString() || ""}
                onChange={(val) => updateStyle("rowGap", val)}
                placeholder="8px"
              />
              <CompactInput
                icon={<GripHorizontal className="h-3 w-3" />}
                iconTooltip="Column Gap"
                iconTooltipSide="left"
                value={styles.columnGap?.toString() || ""}
                onChange={(val) => updateStyle("columnGap", val)}
                placeholder="16px"
              />
            </div>
          </div>

          {/* Alignment controls */}
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-muted-foreground/70 select-none px-0.5">
                Justify
              </span>
              <Select
                value={styles.justifyItems || "stretch"}
                onValueChange={(value) => updateStyle("justifyItems", value)}
              >
                <SelectTrigger className="h-8 px-2 text-[11px] rounded-md">
                  <SelectValue placeholder="Justify" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-medium text-muted-foreground/70 select-none px-0.5">
                Align
              </span>
              <Select
                value={styles.alignItems || "stretch"}
                onValueChange={(value) => updateStyle("alignItems", value)}
              >
                <SelectTrigger className="h-8 px-2 text-[11px] rounded-md">
                  <SelectValue placeholder="Align" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stretch">Stretch</SelectItem>
                  <SelectItem value="start">Start</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="end">End</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Clip content */}
          <ClipContentCheck
            overflow={styles.overflow}
            updateStyle={updateStyle}
            idSuffix="grid"
          />
        </div>
      )}

      {/* ─── Block / Inline-block ─── */}
      {display !== "flex" && display !== "grid" && display !== "none" && (
        <div className="flex flex-col gap-2 animate-in fade-in-0 slide-in-from-top-1 duration-200">
          <SizeRow
            width={styles.width}
            height={styles.height}
            updateStyle={updateStyle}
          />
          <ClipContentCheck
            overflow={styles.overflow}
            updateStyle={updateStyle}
            idSuffix="block"
          />
        </div>
      )}
    </div>
  );
}
