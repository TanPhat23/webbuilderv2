/**
 * Defines all possible directions for resizing, margin, padding, and gap handles.
 * Used throughout the editor for type safety and consistency.
 */

export type ResizeDirection =
  | "se"
  | "sw"
  | "ne"
  | "nw"
  | "n"
  | "s"
  | "e"
  | "w"
  | "gap"
  | "padding-n"
  | "padding-s"
  | "padding-e"
  | "padding-w"
  | "margin-n"
  | "margin-s"
  | "margin-e"
  | "margin-w";

/**
 * Maps each ResizeDirection to its corresponding Tailwind/utility class string.
 */
export const directionalClasses: Record<ResizeDirection, string> = {
  n: "top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-n-resize",
  s: "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-s-resize",
  e: "right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-e-resize",
  w: "left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-w-resize",
  ne: "right-0 top-0 translate-x-1/2 -translate-y-1/2 cursor-ne-resize",
  nw: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nw-resize",
  se: "right-0 bottom-0 translate-x-1/2 translate-y-1/2 cursor-se-resize",
  sw: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2 cursor-sw-resize",

  "margin-n":
    "top-0 left-1/2 -translate-x-1/2 -translate-y-full cursor-n-resize",
  "margin-s":
    "bottom-0 left-1/2 -translate-x-1/2 translate-y-full cursor-s-resize",
  "margin-e":
    "right-0 top-1/2 translate-x-full -translate-y-1/2 cursor-e-resize",
  "margin-w":
    "left-0 top-1/2 -translate-x-full -translate-y-1/2 cursor-w-resize",

  "padding-n":
    "top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 cursor-n-resize",
  "padding-s":
    "bottom-0 left-1/2 -translate-x-1/2 translate-y-1/3 cursor-s-resize",
  "padding-e":
    "right-0 top-1/2 translate-x-1/3 -translate-y-1/2 cursor-e-resize",
  "padding-w":
    "left-0 top-1/2 -translate-x-1/3 -translate-y-1/2 cursor-w-resize",

  gap: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize",
};

/**
 * Helper to check if a style object has a non-zero margin property.
 */
export function hasMargin(
  styles: React.CSSProperties | undefined,
  prop: keyof React.CSSProperties,
): boolean {
  const value = styles?.[prop];
  return value !== undefined && value !== null && value !== "0" && value !== 0;
}

/**
 * Helper to check if a style object has a non-zero padding property.
 */
export function hasPadding(
  styles: React.CSSProperties | undefined,
  prop: keyof React.CSSProperties,
): boolean {
  const value = styles?.[prop];
  return value !== undefined && value !== null && value !== "0" && value !== 0;
}

/**
 * Helper to check if a style object has a non-zero gap property.
 */
export function hasGap(styles: React.CSSProperties | undefined): boolean {
  const value = styles?.gap;
  return value !== undefined && value !== null && value !== "0" && value !== 0;
}

/**
 * Returns the list of resize handles to render based on the element's styles.
 */
export function getResizeHandles(
  styles: React.CSSProperties | undefined,
): ResizeDirection[] {
  return [
    "n",
    "s",
    "e",
    "w",
    "ne",
    "nw",
    "se",
    "sw",
    ...(hasMargin(styles, "marginTop") ? ["margin-n" as ResizeDirection] : []),
    ...(hasMargin(styles, "marginBottom")
      ? ["margin-s" as ResizeDirection]
      : []),
    ...(hasMargin(styles, "marginRight")
      ? ["margin-e" as ResizeDirection]
      : []),
    ...(hasMargin(styles, "marginLeft") ? ["margin-w" as ResizeDirection] : []),
    ...(hasPadding(styles, "paddingTop")
      ? ["padding-n" as ResizeDirection]
      : []),
    ...(hasPadding(styles, "paddingBottom")
      ? ["padding-s" as ResizeDirection]
      : []),
    ...(hasPadding(styles, "paddingRight")
      ? ["padding-e" as ResizeDirection]
      : []),
    ...(hasPadding(styles, "paddingLeft")
      ? ["padding-w" as ResizeDirection]
      : []),
    ...(hasGap(styles) ? ["gap" as ResizeDirection] : []),
  ];
}
