import type { ResponsiveStyles } from "@/types/elements";
import type { SizeAxis } from "./sizing";

export type DimensionDirection = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

type AxisEdge = -1 | 0 | 1;

interface HandleVector {
  readonly horizontal: AxisEdge;
  readonly vertical: AxisEdge;
  readonly cursor: string;
}

const HANDLE_VECTORS: Readonly<Record<DimensionDirection, HandleVector>> = {
  n: { horizontal: 0, vertical: -1, cursor: "ns-resize" },
  s: { horizontal: 0, vertical: 1, cursor: "ns-resize" },
  e: { horizontal: 1, vertical: 0, cursor: "ew-resize" },
  w: { horizontal: -1, vertical: 0, cursor: "ew-resize" },
  ne: { horizontal: 1, vertical: -1, cursor: "nesw-resize" },
  nw: { horizontal: -1, vertical: -1, cursor: "nwse-resize" },
  se: { horizontal: 1, vertical: 1, cursor: "nwse-resize" },
  sw: { horizontal: -1, vertical: 1, cursor: "nesw-resize" },
};

export interface ResizeOrigin {
  readonly rect: DOMRectReadOnly;
  readonly parentRect: DOMRectReadOnly;
  readonly parentWidth: number;
  readonly parentHeight: number;
  readonly mainAxis: SizeAxis | null;
  readonly widthUnit: "px" | "%";
  readonly heightUnit: "px" | "%";
}

export interface ResizePointerInput {
  readonly clientX: number;
  readonly clientY: number;
  readonly shiftKey: boolean;
  readonly altKey: boolean;
}

export interface ResizePreview {
  readonly widthPx: number;
  readonly heightPx: number;
  readonly widthLabel: string;
  readonly heightLabel: string;
  readonly styles: ResponsiveStyles;
}

const MIN_SIZE_PX = 20;
const EDGE_SNAP_PX = 8;

export function resizeCursor(direction: DimensionDirection): string {
  return HANDLE_VECTORS[direction].cursor;
}

export function detectLengthUnit(value: string | number | undefined): "px" | "%" {
  return typeof value === "string" && value.trim().endsWith("%") ? "%" : "px";
}

function snapValue(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function formatLength(px: number, unit: "px" | "%", parentTotal: number): string {
  if (unit === "%" && parentTotal > 0) {
    const pct = Math.min(100, Math.max(0, (px / parentTotal) * 100));
    return `${pct.toFixed(2)}%`;
  }
  return `${Math.round(px)}px`;
}

function formatOffset(px: number, unit: "px" | "%", parentTotal: number): string {
  if (unit === "%" && parentTotal > 0) {
    const pct = Math.min(100, Math.max(0, (px / parentTotal) * 100));
    return `${pct.toFixed(2)}%`;
  }
  return `${Math.round(px)}px`;
}

function computeAxis(
  edge: AxisEdge,
  pointer: number,
  start: number,
  size: number,
  parentStart: number,
  symmetric: boolean,
): { readonly size: number; readonly offset: number } {
  if (edge === 0) return { size, offset: start - parentStart };
  const rawDelta = edge === 1 ? pointer - (start + size) : start - pointer;
  const appliedDelta = symmetric ? rawDelta * 2 : rawDelta;
  const nextSize = Math.max(MIN_SIZE_PX, size + appliedDelta);
  const actualDelta = nextSize - size;

  let nextOffset = start - parentStart;
  if (symmetric) {
    nextOffset -= actualDelta / 2;
  } else if (edge === -1) {
    nextOffset -= actualDelta;
  }
  return { size: nextSize, offset: nextOffset };
}

function applyFixedAxis(
  styles: NonNullable<ResponsiveStyles["default"]>,
  axis: SizeAxis,
  value: string,
  mainAxis: SizeAxis | null,
): void {
  styles[axis] = value;
  if (mainAxis === axis && styles.flexGrow !== undefined) {
    delete styles.flexGrow;
    delete styles.flexBasis;
    styles.flexShrink = "0";
  }
  if (mainAxis && mainAxis !== axis && styles.alignSelf === "stretch") {
    delete styles.alignSelf;
  }
}

export function computeResizePreview(
  direction: DimensionDirection,
  origin: ResizeOrigin,
  pointer: ResizePointerInput,
  currentStyles: ResponsiveStyles | undefined,
): ResizePreview {
  const vec = HANDLE_VECTORS[direction];
  const isCorner = vec.horizontal !== 0 && vec.vertical !== 0;

  let x = computeAxis(
    vec.horizontal,
    pointer.clientX,
    origin.rect.left,
    origin.rect.width,
    origin.parentRect.left,
    pointer.altKey,
  );
  let y = computeAxis(
    vec.vertical,
    pointer.clientY,
    origin.rect.top,
    origin.rect.height,
    origin.parentRect.top,
    pointer.altKey,
  );

  if (pointer.shiftKey && !isCorner) {
    if (vec.horizontal !== 0) {
      const snapped = Math.max(MIN_SIZE_PX, snapValue(x.size, EDGE_SNAP_PX));
      const diff = snapped - x.size;
      x = {
        size: snapped,
        offset: pointer.altKey ? x.offset - diff / 2 : vec.horizontal === -1 ? x.offset - diff : x.offset,
      };
    }
    if (vec.vertical !== 0) {
      const snapped = Math.max(MIN_SIZE_PX, snapValue(y.size, EDGE_SNAP_PX));
      const diff = snapped - y.size;
      y = {
        size: snapped,
        offset: pointer.altKey ? y.offset - diff / 2 : vec.vertical === -1 ? y.offset - diff : y.offset,
      };
    }
  } else if (pointer.shiftKey && isCorner && origin.rect.height > 0) {
    const ratio = origin.rect.width / origin.rect.height;
    if (Math.abs(x.size - origin.rect.width) >= Math.abs(y.size - origin.rect.height)) {
      const nextHeight = Math.max(MIN_SIZE_PX, x.size / ratio);
      const diff = nextHeight - origin.rect.height;
      y = {
        size: nextHeight,
        offset: pointer.altKey
          ? origin.rect.top - origin.parentRect.top - diff / 2
          : vec.vertical === -1
            ? origin.rect.top - origin.parentRect.top - diff
            : origin.rect.top - origin.parentRect.top,
      };
    } else {
      const nextWidth = Math.max(MIN_SIZE_PX, y.size * ratio);
      const diff = nextWidth - origin.rect.width;
      x = {
        size: nextWidth,
        offset: pointer.altKey
          ? origin.rect.left - origin.parentRect.left - diff / 2
          : vec.horizontal === -1
            ? origin.rect.left - origin.parentRect.left - diff
            : origin.rect.left - origin.parentRect.left,
      };
    }
  }

  const widthPx = Math.round(x.size);
  const heightPx = Math.round(y.size);
  const widthLabel = formatLength(widthPx, origin.widthUnit, origin.parentWidth);
  const heightLabel = formatLength(heightPx, origin.heightUnit, origin.parentHeight);

  const base = currentStyles ?? { default: {} };
  const nextDefault: NonNullable<ResponsiveStyles["default"]> = { ...base.default };

  if (vec.horizontal !== 0) {
    applyFixedAxis(nextDefault, "width", widthLabel, origin.mainAxis);
  }
  if (vec.vertical !== 0) {
    applyFixedAxis(nextDefault, "height", heightLabel, origin.mainAxis);
  }
  if (nextDefault.position === "absolute") {
    if (vec.horizontal !== 0) {
      nextDefault.left = formatOffset(x.offset, origin.widthUnit, origin.parentWidth);
    }
    if (vec.vertical !== 0) {
      nextDefault.top = formatOffset(y.offset, origin.heightUnit, origin.parentHeight);
    }
  }

  return {
    widthPx,
    heightPx,
    widthLabel,
    heightLabel,
    styles: { ...base, default: nextDefault },
  };
}
