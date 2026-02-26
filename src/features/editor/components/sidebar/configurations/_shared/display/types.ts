import React from "react";

/**
 * Subset of CSS properties used by the Display & Layout section.
 */
export type DisplayStyles = Pick<
  React.CSSProperties,
  | "display"
  | "flexDirection"
  | "flexWrap"
  | "justifyContent"
  | "alignItems"
  | "alignContent"
  | "gap"
  | "rowGap"
  | "columnGap"
  | "gridTemplateColumns"
  | "gridTemplateRows"
  | "justifyItems"
  | "width"
  | "height"
  | "overflow"
  | "paddingTop"
  | "paddingBottom"
  | "paddingLeft"
  | "paddingRight"
>;

/**
 * Single-property update callback.
 */
export type UpdateStyleFn = <K extends keyof DisplayStyles>(
  property: K,
  value: DisplayStyles[K],
) => void;

/**
 * Batch update callback — merges a partial styles object in one pass
 * so multiple properties are written atomically (fixes the 9-dot matrix bug).
 */
export type BatchUpdateStyleFn = (partial: Partial<DisplayStyles>) => void;
