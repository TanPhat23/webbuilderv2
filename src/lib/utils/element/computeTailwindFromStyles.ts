import type { CSSProperties } from "react";
import { get, isUndefined, isNull, isString, isNumber, includes } from "lodash";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

function computeTailwindFromStylesSingle(
  styles: Partial<CSSProperties> | undefined,
): string {
  if (!styles) return "";

  const classes: string[] = [];

  const pushArbitrary = (prefix: string, raw: unknown) => {
    if (isEmptyValue(raw)) return;

    let normalized: string;
    if (isNumber(raw)) {
      normalized = `${raw}px`;
    } else {
      normalized = String(raw);
    }

    const safe = sanitizeForArbitrary(normalized);
    if (!safe) return;
    classes.push(`${prefix}-[${safe}]`);
  };

  const getMappedClass = (
    value: unknown,
    map: Record<string, string>,
    prefix: string,
  ): string | undefined => {
    if (isEmptyValue(value)) return undefined;

    const strValue = String(value).trim();
    const mappedClass = get(map, strValue);

    return (
      mappedClass ||
      (prefix ? `${prefix}-[${sanitizeForArbitrary(strValue)}]` : undefined)
    );
  };

  const width = get(styles, "width");
  if (!isEmptyValue(width)) {
    width === "auto" ? classes.push("w-auto") : pushArbitrary("w", width);
  }

  const height = get(styles, "height");
  if (!isEmptyValue(height)) {
    height === "auto" ? classes.push("h-auto") : pushArbitrary("h", height);
  }

  const bgColor = get(styles, "backgroundColor");
  if (bgColor) {
    pushIf(classes, `bg-[${sanitizeForArbitrary(bgColor)}]`);
  }

  const color = get(styles, "color");
  if (color) {
    pushIf(classes, `text-[${sanitizeForArbitrary(color)}]`);
  }

  const borderRadius = get(styles, "borderRadius");
  if (!isEmptyValue(borderRadius)) {
    const val = isNumber(borderRadius)
      ? `${borderRadius}px`
      : String(borderRadius);
    pushIf(classes, `rounded-[${sanitizeForArbitrary(val)}]`);
  }

  const borderWidth = get(styles, "borderWidth");
  if (!isEmptyValue(borderWidth)) {
    const val = isNumber(borderWidth)
      ? `${borderWidth}px`
      : String(borderWidth);
    pushIf(classes, `border-[${sanitizeForArbitrary(val)}]`);
  }

  const borderColor = get(styles, "borderColor");
  if (borderColor) {
    pushIf(classes, `border-[${sanitizeForArbitrary(borderColor)}]`);
  }

  const opacity = get(styles, "opacity");
  if (!isEmptyValue(opacity)) {
    let normalized: string;
    if (isNumber(opacity)) {
      normalized =
        opacity > 1 && opacity <= 100 ? String(opacity / 100) : String(opacity);
    } else {
      normalized = String(opacity);
    }
    pushIf(classes, `opacity-[${sanitizeForArbitrary(normalized)}]`);
  }

  const spacingProps = [
    "padding",
    "paddingTop",
    "paddingBottom",
    "paddingLeft",
    "paddingRight",
    "margin",
    "marginTop",
    "marginBottom",
    "marginLeft",
    "marginRight",
  ];

  const spacingPrefixes = {
    padding: "p",
    paddingTop: "pt",
    paddingBottom: "pb",
    paddingLeft: "pl",
    paddingRight: "pr",
    margin: "m",
    marginTop: "mt",
    marginBottom: "mb",
    marginLeft: "ml",
    marginRight: "mr",
  };

  spacingProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      const prefix = get(spacingPrefixes, prop);
      pushArbitrary(prefix, value);
    }
  });

  const display = get(styles, "display");
  if (display) {
    const displayClass = get(DISPLAY_MAP, String(display).trim());
    displayClass ? classes.push(displayClass) : pushIf(classes, "block");
  }

  const flexDirection = get(styles, "flexDirection");
  if (flexDirection) {
    const flexClass = getMappedClass(flexDirection, FLEX_DIRECTION_MAP, "flex");
    if (flexClass) classes.push(flexClass);
  }

  const justifyContent = get(styles, "justifyContent");
  if (justifyContent) {
    const justifyClass = getMappedClass(
      justifyContent,
      JUSTIFY_CONTENT_MAP,
      "justify",
    );
    if (justifyClass) classes.push(justifyClass);
  }

  const alignItems = get(styles, "alignItems");
  if (alignItems) {
    const alignClass = getMappedClass(alignItems, ALIGN_ITEMS_MAP, "items");
    if (alignClass) classes.push(alignClass);
  }

  const gapProps = ["gap", "rowGap", "columnGap"];
  const gapPrefixes = { gap: "gap", rowGap: "row-gap", columnGap: "col-gap" };

  gapProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      const prefix = get(gapPrefixes, prop);
      pushArbitrary(prefix, value);
    }
  });

  const fontSize = get(styles, "fontSize");
  if (!isEmptyValue(fontSize)) {
    pushArbitrary("text", fontSize);
  }

  // Font weight
  const fontWeight = get(styles, "fontWeight");
  if (!isEmptyValue(fontWeight)) {
    if (isNumber(fontWeight)) {
      const weightClass = get(FONT_WEIGHT_MAP, fontWeight);
      weightClass
        ? classes.push(weightClass)
        : pushIf(classes, `font-[${sanitizeForArbitrary(String(fontWeight))}]`);
    } else {
      const weightStr = String(fontWeight).trim();
      if (includes(["normal", "400"], weightStr)) classes.push("font-normal");
      else if (includes(["bold", "700"], weightStr)) classes.push("font-bold");
      else pushIf(classes, `font-[${sanitizeForArbitrary(weightStr)}]`);
    }
  }

  const lineHeight = get(styles, "lineHeight");
  if (!isEmptyValue(lineHeight)) {
    pushArbitrary("leading", lineHeight);
  }

  const letterSpacing = get(styles, "letterSpacing");
  if (!isEmptyValue(letterSpacing)) {
    pushArbitrary("tracking", letterSpacing);
  }

  const textAlign = get(styles, "textAlign");
  if (textAlign) {
    const alignClass = getMappedClass(textAlign, TEXT_ALIGN_MAP, "text");
    if (alignClass) classes.push(alignClass);
  }

  const textTransform = get(styles, "textTransform");
  if (textTransform) {
    const transformClass = getMappedClass(
      textTransform,
      TEXT_TRANSFORM_MAP,
      "",
    );
    if (transformClass) classes.push(transformClass);
  }

  const textDecoration = get(styles, "textDecoration");
  if (textDecoration) {
    const decorationClass = getMappedClass(
      textDecoration,
      TEXT_DECORATION_MAP,
      "",
    );
    if (decorationClass) classes.push(decorationClass);
  }

  const fontStyle = get(styles, "fontStyle");
  if (fontStyle) {
    const styleStr = String(fontStyle).trim();
    if (includes(["italic", "oblique"], styleStr)) classes.push("italic");
  }

  const fontFamily = get(styles, "fontFamily");
  if (fontFamily) {
    const ffRaw = String(fontFamily).trim();
    if (isCssVar(ffRaw)) {
      pushIf(classes, `font-[${sanitizeForArbitrary(ffRaw)}]`);
    } else {
      if (/serif/i.test(ffRaw)) classes.push("serif");
      else if (/sans/i.test(ffRaw)) classes.push("sans");
      else if (/monospace/i.test(ffRaw)) classes.push("mono");
      else pushIf(classes, `font-[${sanitizeForArbitrary(ffRaw)}]`);
    }
  }

  const zIndex = get(styles, "zIndex");
  if (!isEmptyValue(zIndex)) {
    classes.push(`z-[${String(zIndex)}]`);
  }

  const offsetProps = ["top", "bottom", "left", "right"];
  offsetProps.forEach((prop) => {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) {
      pushArbitrary(prop, value);
    }
  });

  return classes.join(" ").trim();
}

const isCssVar = (val: string): boolean =>
  /^var\(\s*--[a-zA-Z0-9\-_]+\s*\)$/.test(val.trim());

const basicClean = (val: string): string =>
  String(val)
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\[/g, "")
    .replace(/\]/g, "")
    .trim();

const isEmptyValue = (val: unknown): boolean =>
  isUndefined(val) || isNull(val) || val === "";

function sanitizeForArbitrary(raw: string | number): string {
  const asStr = String(raw);
  let cleaned = basicClean(asStr);

  // Normalize spaces after commas so values like `var(--bg, #fff)` become `var(--bg,#fff)`
  // This avoids unnecessary quoting when the only whitespace is after commas.
  cleaned = cleaned.replace(/,\s+/g, ",");

  if (cleaned.length === 0) return "";

  if (isCssVar(cleaned)) return cleaned;

  const containsWhitespace = /\s/.test(cleaned);
  const containsSingleQuote = /'/.test(cleaned);
  const containsDoubleQuote = /"/.test(cleaned);

  if (containsWhitespace || containsSingleQuote || containsDoubleQuote) {
    const escaped = cleaned.replace(/'/g, "\\'");
    return `'${escaped}'`;
  }

  return cleaned;
}

const pushIf = (arr: string[], cls?: string | false | null) => {
  if (!cls) return;
  const n = String(cls).trim();
  if (n.length) arr.push(n);
};

const DISPLAY_MAP = {
  flex: "flex",
  grid: "grid",
  none: "hidden",
  "inline-block": "inline-block",
  block: "block",
} as const;

const FLEX_DIRECTION_MAP = {
  column: "flex-col",
  "column-reverse": "flex-col-reverse",
  row: "flex-row",
  "row-reverse": "flex-row-reverse",
} as const;

const JUSTIFY_CONTENT_MAP = {
  center: "justify-center",
  "flex-start": "justify-start",
  start: "justify-start",
  "flex-end": "justify-end",
  end: "justify-end",
  "space-between": "justify-between",
  "space-around": "justify-around",
  "space-evenly": "justify-evenly",
} as const;

const ALIGN_ITEMS_MAP = {
  center: "items-center",
  "flex-start": "items-start",
  start: "items-start",
  "flex-end": "items-end",
  end: "items-end",
  stretch: "items-stretch",
} as const;

const TEXT_ALIGN_MAP = {
  center: "text-center",
  right: "text-right",
  left: "text-left",
  justify: "text-justify",
  start: "text-left",
  end: "text-right",
} as const;

const TEXT_TRANSFORM_MAP = {
  uppercase: "uppercase",
  lowercase: "lowercase",
  capitalize: "capitalize",
  none: "normal-case",
} as const;

const TEXT_DECORATION_MAP = {
  underline: "underline",
  overline: "overline",
  "line-through": "line-through",
  lineThrough: "line-through",
  none: "no-underline",
} as const;

const FONT_WEIGHT_MAP = {
  100: "font-thin",
  200: "font-extralight",
  300: "font-light",
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
  800: "font-extrabold",
  900: "font-black",
} as const;

export function computeTailwindFromStyles(
  styles: ResponsiveStyles | undefined,
): string {
  if (!styles) return "";

  const classes: string[] = [];
  const breakpoints: (keyof ResponsiveStyles)[] = [
    "default",
    "sm",
    "md",
    "lg",
    "xl",
  ];

  breakpoints.forEach((bp) => {
    const bpStyles = styles[bp];
    if (bpStyles) {
      const prefix = bp === "default" ? "" : `${bp}:`;
      const bpClasses = computeTailwindFromStylesSingle(bpStyles);
      bpClasses.split(" ").forEach((cls) => {
        if (cls) classes.push(`${prefix}${cls}`);
      });
    }
  });

  return classes.join(" ");
}

export default computeTailwindFromStyles;
export { computeTailwindFromStylesSingle };
