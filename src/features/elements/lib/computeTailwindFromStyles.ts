import type { CSSProperties } from "react";
import { get, isNull, isNumber, isUndefined, includes } from "lodash-es";
import type { ResponsiveStyles } from "@/types/elements";

const SPACING_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  ["padding", "p"],
  ["paddingTop", "pt"],
  ["paddingBottom", "pb"],
  ["paddingLeft", "pl"],
  ["paddingRight", "pr"],
  ["margin", "m"],
  ["marginTop", "mt"],
  ["marginBottom", "mb"],
  ["marginLeft", "ml"],
  ["marginRight", "mr"],
];

const GAP_ENTRIES: ReadonlyArray<readonly [string, string]> = [
  ["gap", "gap"],
  ["rowGap", "row-gap"],
  ["columnGap", "col-gap"],
];

const OFFSET_PROPS = ["top", "bottom", "left", "right"] as const;

function pushArbitrary(
  classes: string[],
  prefix: string,
  raw: unknown,
): void {
  if (isEmptyValue(raw)) return;
  const normalized = isNumber(raw) ? `${raw}px` : String(raw);
  const safe = sanitizeForArbitrary(normalized);
  if (safe) classes.push(`${prefix}-[${safe}]`);
}

function lookupClass(
  map: Readonly<Record<string, string>>,
  key: string | number,
): string | undefined {
  const strKey = String(key);
  return Object.hasOwn(map, strKey) ? map[strKey] : undefined;
}

function pushRawArbitrary(
  classes: string[],
  prefix: string,
  raw: unknown,
): void {
  if (isEmptyValue(raw)) return;
  const safe = sanitizeForArbitrary(String(raw));
  if (safe) classes.push(`${prefix}-[${safe}]`);
}

function getMappedClass(
  value: unknown,
  map: Readonly<Record<string, string>>,
  prefix: string,
): string | undefined {
  if (isEmptyValue(value)) return undefined;
  const strValue = String(value).trim();
  const mappedClass = lookupClass(map, strValue);
  if (mappedClass) return mappedClass;
  if (!prefix) return undefined;
  const safe = sanitizeForArbitrary(strValue);
  return safe ? `${prefix}-[${safe}]` : undefined;
}

function pushDimensionClass(
  classes: string[],
  value: unknown,
  prefix: "w" | "h",
  autoClass: "w-auto" | "h-auto",
): void {
  if (isEmptyValue(value)) return;
  if (value === "auto") classes.push(autoClass);
  else pushArbitrary(classes, prefix, value);
}

function pushPrefixedEntries(
  classes: string[],
  styles: Partial<CSSProperties>,
  entries: ReadonlyArray<readonly [string, string]>,
): void {
  for (const [prop, prefix] of entries) {
    const value = get(styles, prop);
    if (!isEmptyValue(value)) pushArbitrary(classes, prefix, value);
  }
}

function pushOpacityClass(classes: string[], opacity: unknown): void {
  if (isEmptyValue(opacity)) return;
  let normalized: string;
  if (isNumber(opacity)) {
    normalized =
      opacity > 1 && opacity <= 100 ? String(opacity / 100) : String(opacity);
  } else {
    normalized = String(opacity);
  }
  pushRawArbitrary(classes, "opacity", normalized);
}

function pushBoxAndColorStyles(
  classes: string[],
  styles: Partial<CSSProperties>,
): void {
  pushDimensionClass(classes, get(styles, "width"), "w", "w-auto");
  pushDimensionClass(classes, get(styles, "height"), "h", "h-auto");
  pushRawArbitrary(classes, "bg", get(styles, "backgroundColor"));
  pushRawArbitrary(classes, "text", get(styles, "color"));
  pushArbitrary(classes, "rounded", get(styles, "borderRadius"));
  pushArbitrary(classes, "border", get(styles, "borderWidth"));
  pushRawArbitrary(classes, "border", get(styles, "borderColor"));
  pushOpacityClass(classes, get(styles, "opacity"));
  pushPrefixedEntries(classes, styles, SPACING_ENTRIES);
}

function pushMappedProp(
  classes: string[],
  styles: Partial<CSSProperties>,
  prop: keyof CSSProperties,
  map: Readonly<Record<string, string>>,
  prefix: string,
): void {
  const value = get(styles, prop);
  if (!value) return;
  const cls = getMappedClass(value, map, prefix);
  if (cls) classes.push(cls);
}

function pushLayoutStyles(
  classes: string[],
  styles: Partial<CSSProperties>,
): void {
  const display = get(styles, "display");
  if (display) {
    classes.push(lookupClass(DISPLAY_MAP, String(display).trim()) ?? "block");
  }
  pushMappedProp(classes, styles, "flexDirection", FLEX_DIRECTION_MAP, "flex");
  pushMappedProp(classes, styles, "justifyContent", JUSTIFY_CONTENT_MAP, "justify");
  pushMappedProp(classes, styles, "alignItems", ALIGN_ITEMS_MAP, "items");
  pushPrefixedEntries(classes, styles, GAP_ENTRIES);
}

function pushFontWeightClass(classes: string[], fontWeight: unknown): void {
  if (isEmptyValue(fontWeight)) return;
  if (isNumber(fontWeight)) {
    const weightClass = lookupClass(FONT_WEIGHT_MAP, fontWeight);
    weightClass
      ? classes.push(weightClass)
      : pushRawArbitrary(classes, "font", fontWeight);
    return;
  }
  const weightStr = String(fontWeight).trim();
  if (includes(["normal", "400"], weightStr)) classes.push("font-normal");
  else if (includes(["bold", "700"], weightStr)) classes.push("font-bold");
  else pushRawArbitrary(classes, "font", weightStr);
}

function pushFontFamilyClass(classes: string[], fontFamily: unknown): void {
  if (!fontFamily) return;
  const ffRaw = String(fontFamily).trim();
  if (isCssVar(ffRaw)) {
    pushRawArbitrary(classes, "font", ffRaw);
  } else if (/sans/i.test(ffRaw)) {
    classes.push("sans");
  } else if (/serif/i.test(ffRaw)) {
    classes.push("serif");
  } else if (/monospace/i.test(ffRaw)) {
    classes.push("mono");
  } else {
    pushRawArbitrary(classes, "font", ffRaw);
  }
}

function pushTextStyleClasses(
  classes: string[],
  styles: Partial<CSSProperties>,
): void {
  pushMappedProp(classes, styles, "textAlign", TEXT_ALIGN_MAP, "text");
  pushMappedProp(classes, styles, "textTransform", TEXT_TRANSFORM_MAP, "");
  pushMappedProp(classes, styles, "textDecoration", TEXT_DECORATION_MAP, "");

  const fontStyle = get(styles, "fontStyle");
  if (fontStyle && includes(["italic", "oblique"], String(fontStyle).trim())) {
    classes.push("italic");
  }

  pushFontFamilyClass(classes, get(styles, "fontFamily"));
}

function pushTypographyStyles(
  classes: string[],
  styles: Partial<CSSProperties>,
): void {
  pushArbitrary(classes, "text", get(styles, "fontSize"));
  pushFontWeightClass(classes, get(styles, "fontWeight"));
  pushArbitrary(classes, "leading", get(styles, "lineHeight"));
  pushArbitrary(classes, "tracking", get(styles, "letterSpacing"));
  pushTextStyleClasses(classes, styles);
}

function pushPositionStyles(
  classes: string[],
  styles: Partial<CSSProperties>,
): void {
  const zIndex = get(styles, "zIndex");
  if (!isEmptyValue(zIndex)) {
    classes.push(`z-[${String(zIndex)}]`);
  }
  for (const prop of OFFSET_PROPS) {
    pushArbitrary(classes, prop, get(styles, prop));
  }
}

function computeTailwindFromStylesSingle(
  styles: Partial<CSSProperties> | undefined,
): string {
  if (!styles) return "";
  const classes: string[] = [];
  pushBoxAndColorStyles(classes, styles);
  pushLayoutStyles(classes, styles);
  pushTypographyStyles(classes, styles);
  pushPositionStyles(classes, styles);
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
  cleaned = cleaned.replace(/,\s+/g, ",");

  if (cleaned.length === 0) return "";
  if (isCssVar(cleaned)) return cleaned;

  const needsQuotes = /[\s'"]/.test(cleaned);
  if (needsQuotes) {
    return `'${cleaned.replace(/'/g, "\\'")}'`;
  }

  return cleaned;
}

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

const FONT_WEIGHT_MAP: Readonly<Record<string, string>> = {
  100: "font-thin",
  200: "font-extralight",
  300: "font-light",
  400: "font-normal",
  500: "font-medium",
  600: "font-semibold",
  700: "font-bold",
  800: "font-extrabold",
  900: "font-black",
};

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
