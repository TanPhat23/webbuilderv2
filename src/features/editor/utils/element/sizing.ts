/**
 * Element sizing as three modes per axis (Fixed / Fill / Hug) instead of raw
 * width and height values.
 *
 * What "fill" means in CSS depends on the parent: `width: 100%` is right in a
 * block, but in a flex row it ignores the siblings and overflows. The mode is
 * therefore resolved against the parent's layout and stored as plain CSS, so
 * the canvas, the preview and generated code all render it without knowing
 * about modes.
 *
 * Pure: no React, no DOM.
 */

export type SizeAxis = "width" | "height";
export type SizeMode = "fixed" | "fill" | "hug";
export type SizingStyles = Record<string, string | number | undefined>;

export interface ParentLayout {
  /** How the parent lays out its children. */
  kind: "row" | "column" | "block";
  /** Whether a flex parent stretches children on its cross axis. */
  stretch: boolean;
}

export const BLOCK_PARENT: ParentLayout = { kind: "block", stretch: false };

interface LayoutSource {
  styles?: unknown;
  tailwindStyles?: string | null;
}

/** Base (unprefixed) Tailwind classes; `md:flex` and `hover:flex` don't count. */
function baseClasses(tailwind: string | null | undefined): Set<string> {
  return new Set(
    (tailwind ?? "").split(/\s+/).filter((c) => c && !c.includes(":")),
  );
}

/**
 * Reads the parent's base layout from its styles, falling back to its
 * Tailwind classes (templates often set `flex` only as a class).
 */
export function parentLayout(parent: LayoutSource | null | undefined): ParentLayout {
  if (!parent) return BLOCK_PARENT;
  const all = (parent.styles ?? {}) as Record<string, SizingStyles | undefined>;
  const base = all.default ?? {};
  const classes = baseClasses(parent.tailwindStyles);

  const display =
    (base.display as string | undefined) ??
    (classes.has("flex") || classes.has("inline-flex") ? "flex" : undefined);
  if (display !== "flex" && display !== "inline-flex") return BLOCK_PARENT;

  const direction =
    (base.flexDirection as string | undefined) ??
    (classes.has("flex-col") || classes.has("flex-col-reverse")
      ? "column"
      : "row");

  let align = base.alignItems as string | undefined;
  if (!align) {
    for (const v of ["start", "center", "end", "baseline"]) {
      if (classes.has(`items-${v}`)) align = v;
    }
  }

  return {
    kind: direction.startsWith("column") ? "column" : "row",
    stretch: !align || align === "stretch" || align === "normal",
  };
}

function isMainAxis(axis: SizeAxis, layout: ParentLayout): boolean {
  return (
    (layout.kind === "row" && axis === "width") ||
    (layout.kind === "column" && axis === "height")
  );
}

const MIN_KEY = { width: "minWidth", height: "minHeight" } as const;
const INTRINSIC = new Set(["auto", "fit-content", "max-content", "min-content"]);

function isUnset(v: string | number | undefined): boolean {
  return v === undefined || v === "" || v === "auto";
}

function isZero(v: string | number | undefined): boolean {
  return v === 0 || v === "0" || v === "0px";
}

export function readSizeMode(
  styles: SizingStyles,
  axis: SizeAxis,
  layout: ParentLayout,
): SizeMode {
  const value = styles[axis];
  const main = isMainAxis(axis, layout);

  if (main && Number(styles.flexGrow) > 0) return "fill";
  if (value === "100%") return "fill";

  if (isUnset(value)) {
    if (layout.kind === "block") return axis === "width" ? "fill" : "hug";
    if (main) return "hug";
    const self = styles.alignSelf;
    if (self === "stretch") return "fill";
    return layout.stretch && isUnset(self) ? "fill" : "hug";
  }
  if (INTRINSIC.has(String(value))) return "hug";
  return "fixed";
}

/**
 * Returns `styles` with one axis switched to `mode`. `fixed` is the size to
 * use for Fixed (e.g. the measured "320px"); the current value is kept when
 * it already is a fixed size.
 */
export function writeSizeMode(
  styles: SizingStyles,
  axis: SizeAxis,
  mode: SizeMode,
  layout: ParentLayout,
  fixed?: string,
): SizingStyles {
  const next: SizingStyles = { ...styles };
  const main = isMainAxis(axis, layout);
  const cross = layout.kind !== "block" && !main;
  const current = styles[axis];

  // Drop whatever the previous mode left behind on this axis.
  if (main) {
    delete next.flexGrow;
    delete next.flexShrink;
    delete next.flexBasis;
    if (isZero(next[MIN_KEY[axis]])) delete next[MIN_KEY[axis]];
  }
  if (cross && next.alignSelf === "stretch") delete next.alignSelf;
  delete next[axis];

  if (mode === "fill") {
    if (main) {
      // Share the free space with siblings instead of claiming 100% of it.
      next.flexGrow = 1;
      next.flexShrink = 1;
      next.flexBasis = "0%";
      next[MIN_KEY[axis]] = "0px";
    } else if (cross) {
      next.alignSelf = "stretch";
    } else {
      next[axis] = "100%";
    }
  } else if (mode === "hug") {
    // `auto` already hugs on a flex main axis and for block heights.
    const autoHugs = main || (axis === "height" && layout.kind === "block");
    if (!autoHugs) next[axis] = "fit-content";
  } else {
    const keep =
      !isUnset(current) && current !== "100%" && !INTRINSIC.has(String(current));
    next[axis] = keep ? current : (fixed ?? "200px");
    if (main) next.flexShrink = 0;
  }
  return next;
}

/**
 * Fixes a size that doesn't fit the parent it is being placed in: `100%`
 * along a flex parent's main axis becomes Fill. Returns null when nothing
 * needs to change.
 */
export function adaptToParent(
  styles: SizingStyles,
  layout: ParentLayout,
): SizingStyles | null {
  if (layout.kind === "block") return null;
  const axis: SizeAxis = layout.kind === "row" ? "width" : "height";
  if (styles[axis] !== "100%" || Number(styles.flexGrow) > 0) return null;
  return writeSizeMode(styles, axis, "fill", layout);
}

/**
 * Matches Tailwind size classes for one axis at one breakpoint ("w-full",
 * "md:h-[40%]"). Switching an axis's mode replaces its size, so a size class
 * left on the element would otherwise keep overriding the new mode.
 */
export function isSizeClass(
  cls: string,
  axis: SizeAxis,
  breakpoint = "default",
): boolean {
  const parts = cls.split(":");
  const utility = parts.pop() ?? "";
  const prefix = parts.join(":");
  if (prefix !== (breakpoint === "default" ? "" : breakpoint)) return false;
  return utility.startsWith(axis === "width" ? "w-" : "h-");
}

/** Short text for the canvas label: "Fill", "Hug" or the fixed value. */
export function sizeLabel(
  styles: SizingStyles,
  axis: SizeAxis,
  layout: ParentLayout,
): string {
  const mode = readSizeMode(styles, axis, layout);
  if (mode === "fill") return "Fill";
  if (mode === "hug") return "Hug";
  return String(styles[axis]);
}
