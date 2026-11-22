import { clamp } from "lodash-es";
import type { ResizeDirection } from "@/features/editor/constants/direction";
import type { ResponsiveStyles } from "@/types/elements";
import type { SizeAxis } from "./sizing";

type Edge = -1 | 0 | 1;
type Point = Pick<MouseEvent, "clientX" | "clientY">;
type SpacingProperty =
  | "gap"
  | `padding${"Top" | "Bottom" | "Left" | "Right"}`
  | `margin${"Top" | "Bottom" | "Left" | "Right"}`;

interface DimensionHandle {
  kind: "dimensions";
  horizontal: Edge;
  vertical: Edge;
  cursor: string;
}

interface SpacingHandle {
  kind: "spacing";
  property: SpacingProperty;
  coordinate: keyof Point;
  sign: -1 | 1;
  cursor: string;
}

const dimensions = (
  horizontal: Edge,
  vertical: Edge,
  cursor: string,
): DimensionHandle => ({ kind: "dimensions", horizontal, vertical, cursor });

const spacing = (
  property: SpacingProperty,
  coordinate: keyof Point,
  sign: -1 | 1,
  cursor = "move",
): SpacingHandle => ({ kind: "spacing", property, coordinate, sign, cursor });

export const resizeHandles = {
  n: dimensions(0, -1, "ns-resize"),
  s: dimensions(0, 1, "ns-resize"),
  e: dimensions(1, 0, "ew-resize"),
  w: dimensions(-1, 0, "ew-resize"),
  ne: dimensions(1, -1, "nesw-resize"),
  nw: dimensions(-1, -1, "nwse-resize"),
  se: dimensions(1, 1, "nwse-resize"),
  sw: dimensions(-1, 1, "nesw-resize"),
  gap: spacing("gap", "clientY", 1, "ns-resize"),
  "padding-n": spacing("paddingTop", "clientY", -1),
  "padding-s": spacing("paddingBottom", "clientY", 1),
  "padding-e": spacing("paddingRight", "clientX", 1),
  "padding-w": spacing("paddingLeft", "clientX", -1),
  "margin-n": spacing("marginTop", "clientY", -1),
  "margin-s": spacing("marginBottom", "clientY", 1),
  "margin-e": spacing("marginRight", "clientX", 1),
  "margin-w": spacing("marginLeft", "clientX", -1),
} satisfies Record<ResizeDirection, DimensionHandle | SpacingHandle>;

const MIN_SIZE = 20;

export function computeSpacingStyles(
  handle: SpacingHandle,
  initial: ResponsiveStyles["default"],
  styles: ResponsiveStyles,
  delta: Point,
): ResponsiveStyles {
  const { property, coordinate, sign } = handle;
  const start = parseInt(String(initial?.[property] ?? "0"), 10);
  const value = Math.max(0, start + sign * delta[coordinate]);
  return {
    ...styles,
    default: { ...styles.default, [property]: `${value}px` },
  };
}

interface AxisBounds {
  size: number;
  offset: number;
}

function dragAxis({
  edge,
  pointer,
  start,
  size,
  parentStart,
}: {
  edge: Edge;
  pointer: number;
  start: number;
  size: number;
  parentStart: number;
}): AxisBounds {
  if (edge === -1)
    return { size: size + (start - pointer), offset: pointer - parentStart };
  if (edge === 1) return { size: pointer - start, offset: start - parentStart };
  return { size, offset: start - parentStart };
}

interface DimensionOrigin {
  rect: DOMRectReadOnly;
  parentRect: DOMRectReadOnly;
}

function lockedAspectRatio(
  handle: DimensionHandle,
  rect: DOMRectReadOnly,
  shiftKey: boolean,
): number {
  if (!shiftKey || !handle.horizontal || !handle.vertical) return 0;
  return rect.height > 0 ? rect.width / rect.height : 0;
}

function dragBounds(
  handle: DimensionHandle,
  { rect, parentRect }: DimensionOrigin,
  pointer: Point & { shiftKey: boolean },
) {
  const { horizontal, vertical } = handle;
  const x = dragAxis({
    edge: horizontal,
    pointer: pointer.clientX,
    start: rect.left,
    size: rect.width,
    parentStart: parentRect.left,
  });
  const y = dragAxis({
    edge: vertical,
    pointer: pointer.clientY,
    start: rect.top,
    size: rect.height,
    parentStart: parentRect.top,
  });
  const ratio = lockedAspectRatio(handle, rect, pointer.shiftKey);
  if (!(ratio > 0)) return { x, y };

  if (Math.abs(x.size - rect.width) > Math.abs(y.size - rect.height)) {
    y.size = x.size / ratio;
    if (vertical < 0) y.offset = rect.bottom - parentRect.top - y.size;
  } else {
    x.size = y.size * ratio;
    if (horizontal < 0) x.offset = rect.right - parentRect.left - x.size;
  }
  return { x, y };
}

function percent(value: number, total: number): string {
  return `${clamp((value / total) * 100, 0, 100).toFixed(2)}%`;
}

function fixAxis(
  styles: NonNullable<ResponsiveStyles["default"]>,
  axis: SizeAxis,
  value: string,
  mainAxis: SizeAxis | null,
) {
  styles[axis] = value;
  // Dragging an axis makes it fixed, so remove its Fill styles.
  if (mainAxis === axis && styles.flexGrow !== undefined) {
    delete styles.flexGrow;
    delete styles.flexBasis;
    styles.flexShrink = "0";
  }
  if (mainAxis && mainAxis !== axis && styles.alignSelf === "stretch") {
    delete styles.alignSelf;
  }
}

export function computeDimensionStyles(
  handle: DimensionHandle,
  origin: DimensionOrigin,
  pointer: Point & { shiftKey: boolean },
  styles: ResponsiveStyles,
  parent: { width: number; height: number; mainAxis: SizeAxis | null },
): ResponsiveStyles {
  const { x, y } = dragBounds(handle, origin, pointer);
  const { width, height, mainAxis } = parent;
  const next = { ...styles.default };
  if (handle.horizontal)
    fixAxis(
      next,
      "width",
      percent(Math.max(MIN_SIZE, x.size), width),
      mainAxis,
    );
  if (handle.vertical)
    fixAxis(
      next,
      "height",
      percent(Math.max(MIN_SIZE, y.size), height),
      mainAxis,
    );
  if (next.position === "absolute") {
    next.left = percent(x.offset, width);
    next.top = percent(y.offset, height);
  }
  return { ...styles, default: next };
}
