"use client";

import { cn } from "@/lib/utils";
import type { BatchUpdateStyleFn } from "./types";

const JUSTIFY_VALUES = ["flex-start", "center", "flex-end"] as const;
const ALIGN_VALUES = ["flex-start", "center", "flex-end"] as const;

type JustifyValue = (typeof JUSTIFY_VALUES)[number];
type AlignValue = (typeof ALIGN_VALUES)[number];

const JUSTIFY_LABELS: Record<JustifyValue, string> = {
  "flex-start": "Start",
  center: "Center",
  "flex-end": "End",
};

const ALIGN_LABELS: Record<AlignValue, string> = {
  "flex-start": "Top",
  center: "Middle",
  "flex-end": "Bottom",
};

interface AlignmentMatrixProps {
  /** Current justifyContent value */
  justifyContent: string | undefined;
  /** Current alignItems value */
  alignItems: string | undefined;
  /**
   * Batch update function — sets both justifyContent and alignItems
   * in a single pass to avoid stale-state overwrites.
   */
  onBatchUpdate: BatchUpdateStyleFn;
  /** Additional className for the outer wrapper */
  className?: string;
}

/**
 * Figma-style 3×3 alignment matrix.
 *
 * Combines `justifyContent` (columns: start, center, end)
 * and `alignItems` (rows: start, center, end) into a single
 * clickable dot grid.
 *
 * ┌───────────────┐
 * │  ·   ·   ·    │  ← align: flex-start
 * │  ·   ●   ·    │  ← align: center
 * │  ·   ·   ·    │  ← align: flex-end
 * └───────────────┘
 *    ↑   ↑   ↑
 *   start center end  (justify)
 *
 * Uses `onBatchUpdate` to set both properties atomically,
 * preventing the bug where sequential `updateStyle` calls
 * read from stale state.
 */

export function AlignmentMatrix({
  justifyContent,
  alignItems,
  onBatchUpdate,
  className,
}: AlignmentMatrixProps) {
  const currentJustify = justifyContent || "flex-start";
  const currentAlign = alignItems || "flex-start";

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-background p-1 shrink-0",
        className,
      )}
    >
      <div className="grid grid-cols-3 gap-0">
        {ALIGN_VALUES.map((align) =>
          JUSTIFY_VALUES.map((justify) => {
            const isActive =
              currentJustify === justify && currentAlign === align;

            return (
              <button
                type="button"
                onClick={() =>
                  onBatchUpdate({
                    justifyContent: justify,
                    alignItems: align,
                  })
                }
                className={cn(
                  "w-6 h-6 flex items-center justify-center rounded-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground/30 hover:text-muted-foreground/60",
                )}
                aria-pressed={isActive}
              >
                <div
                  className={cn(
                    "rounded-full transition-all",
                    isActive
                      ? "w-2 h-2 bg-primary shadow-sm shadow-primary/30"
                      : "w-1.5 h-1.5 bg-current",
                  )}
                />
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}
