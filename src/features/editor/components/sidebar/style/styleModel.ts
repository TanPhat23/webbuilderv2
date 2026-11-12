/**
 * Pure helpers for the inspector Style tab. No React and no runtime app
 * imports, so they run under node:test.
 */
import type { ElementType } from "@/types/global.type";

export type StyleMap = Record<string, string | number | undefined>;
export type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";

export const BREAKPOINTS: {
  id: Breakpoint;
  label: string;
  minWidth: string;
}[] = [
  { id: "default", label: "Base", minWidth: "all widths" },
  { id: "sm", label: "SM", minWidth: "≥ 640px" },
  { id: "md", label: "MD", minWidth: "≥ 768px" },
  { id: "lg", label: "LG", minWidth: "≥ 1024px" },
  { id: "xl", label: "XL", minWidth: "≥ 1280px" },
];

const NUMBER_RE = /^(-?(?:\d+\.?\d*|\.\d+))([a-z%]*)$/i;
const UNITS = new Set([
  "",
  "px",
  "rem",
  "em",
  "%",
  "vh",
  "vw",
  "vmin",
  "vmax",
  "svh",
  "dvh",
  "ch",
  "ex",
  "fr",
  "deg",
  "turn",
  "s",
  "ms",
  "pt",
  "cm",
  "mm",
  "Q",
  "q",
  "in",
  "pc",
  "cap",
  "ic",
  "lh",
  "rlh",
  "rex",
  "rcap",
  "rch",
  "ric",
  "vi",
  "vb",
  "svw",
  "svi",
  "svb",
  "svmin",
  "svmax",
  "lvw",
  "lvh",
  "lvi",
  "lvb",
  "lvmin",
  "lvmax",
  "dvw",
  "dvi",
  "dvb",
  "dvmin",
  "dvmax",
  "cqw",
  "cqh",
  "cqi",
  "cqb",
  "cqmin",
  "cqmax",
]);
const KEYWORDS = new Set([
  "auto",
  "none",
  "inherit",
  "initial",
  "unset",
  "revert",
  "normal",
  "fit-content",
  "min-content",
  "max-content",
  "currentcolor",
  "transparent",
  "revert-layer",
]);
const FUNCTION_RE = /^(calc|var|min|max|clamp|env)\(.*\)$/i;

export function normalizeCssInput(
  raw: string,
  defaultUnit: string,
): { ok: true; value: string | undefined } | { ok: false } {
  const s = raw.trim();
  if (s === "") return { ok: true, value: undefined };
  if (KEYWORDS.has(s.toLowerCase()) || FUNCTION_RE.test(s))
    return { ok: true, value: s };
  const m = NUMBER_RE.exec(s);
  if (!m || !UNITS.has(m[2].toLowerCase())) return { ok: false };
  return { ok: true, value: m[2] ? s : `${m[1]}${defaultUnit}` };
}

export function splitNumber(
  value: string | number | undefined,
): { num: number; unit: string } | null {
  if (typeof value === "number") return { num: value, unit: "" };
  if (!value) return null;
  const m = NUMBER_RE.exec(value.trim());
  return m ? { num: Number(m[1]), unit: m[2] } : null;
}

export function stepCssValue(
  value: string | number | undefined,
  delta: number,
  defaultUnit: string,
): string {
  const parts = splitNumber(value);
  const num = parts ? parts.num : 0;
  const unit = parts
    ? parts.unit || (typeof value === "number" ? "" : defaultUnit)
    : defaultUnit;
  const next = Math.round((num + delta) * 100) / 100;
  return `${next}${unit}`;
}

export function compactStyles(styles: StyleMap): StyleMap {
  const out: StyleMap = {};
  for (const [k, v] of Object.entries(styles)) {
    if (v !== undefined && v !== "") out[k] = v;
  }
  return out;
}

export type OptionalSection = "border" | "shadow" | "effects" | "fillImage";

export const SECTION_KEYS: Record<OptionalSection, readonly string[]> = {
  border: [
    "borderWidth",
    "borderStyle",
    "borderColor",
    "borderRadius",
    "borderTopLeftRadius",
    "borderTopRightRadius",
    "borderBottomLeftRadius",
    "borderBottomRightRadius",
  ],
  shadow: ["boxShadow"],
  effects: [
    "opacity",
    "transform",
    "transformOrigin",
    "filter",
    "cursor",
    "overflow",
    "overflowX",
    "overflowY",
    "visibility",
    "boxSizing",
  ],
  fillImage: [
    "backgroundImage",
    "backgroundSize",
    "backgroundPosition",
    "backgroundRepeat",
  ],
};

export const SHADOW_PRESETS = [
  { id: "sm", label: "Small", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  {
    id: "md",
    label: "Medium",
    value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },
  {
    id: "lg",
    label: "Large",
    value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },
  {
    id: "xl",
    label: "Extra large",
    value:
      "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  },
];

export function isSectionOn(
  styles: StyleMap,
  section: OptionalSection,
): boolean {
  return SECTION_KEYS[section].some(
    (k) => styles[k] !== undefined && styles[k] !== "",
  );
}

export function sectionDefaults(section: OptionalSection): StyleMap {
  switch (section) {
    case "border":
      return {
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "currentColor",
      };
    case "shadow":
      return { boxShadow: SHADOW_PRESETS[0].value };
    case "effects":
      return { opacity: 1 };
    case "fillImage":
      return {
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      };
  }
}

export function withoutKeys(
  styles: StyleMap,
  keys: readonly string[],
): StyleMap {
  const drop = new Set(keys);
  return Object.fromEntries(
    Object.entries(styles).filter(([k]) => !drop.has(k)),
  );
}

export type Sides = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};
type SideKey = keyof Sides;
const SIDE_SUFFIX: Record<SideKey, string> = {
  top: "Top",
  right: "Right",
  bottom: "Bottom",
  left: "Left",
};

function str(v: string | number | undefined): string {
  return v === undefined ? "" : String(v);
}

export function readSides(styles: StyleMap, prop: "padding" | "margin"): Sides {
  // Split only between top-level tokens, preserving whitespace inside calc()/var().
  const parts: string[] = [];
  let token = "";
  let depth = 0;
  for (const char of str(styles[prop]).trim()) {
    if (/\s/.test(char) && depth === 0) {
      if (token) parts.push(token);
      token = "";
    } else {
      token += char;
      if (char === "(") depth++;
      if (char === ")") depth--;
    }
  }
  if (token) parts.push(token);
  const [t = "", r = t, b = t, l = r] = parts;
  const base: Sides = { top: t, right: r, bottom: b, left: l };
  const out = { ...base };
  for (const side of Object.keys(SIDE_SUFFIX) as SideKey[]) {
    const v = styles[`${prop}${SIDE_SUFFIX[side]}`];
    if (v !== undefined && v !== "") out[side] = str(v);
  }
  return out;
}

export function sidesDiffer(s: Sides): boolean {
  return s.left !== s.right || s.top !== s.bottom;
}

function expand(styles: StyleMap, prop: "padding" | "margin"): StyleMap {
  const sides = readSides(styles, prop);
  const next = withoutKeys(styles, [prop]);
  for (const side of Object.keys(SIDE_SUFFIX) as SideKey[]) {
    next[`${prop}${SIDE_SUFFIX[side]}`] = sides[side] || undefined;
  }
  return next;
}

export function writeSide(
  styles: StyleMap,
  prop: "padding" | "margin",
  side: SideKey,
  value: string | undefined,
): StyleMap {
  const next = expand(styles, prop);
  next[`${prop}${SIDE_SUFFIX[side]}`] = value;
  return compactStyles(next);
}

export function writeAxis(
  styles: StyleMap,
  prop: "padding" | "margin",
  axis: "x" | "y",
  value: string | undefined,
): StyleMap {
  const [a, b]: SideKey[] =
    axis === "x" ? ["left", "right"] : ["top", "bottom"];
  const next = expand(styles, prop);
  next[`${prop}${SIDE_SUFFIX[a]}`] = value;
  next[`${prop}${SIDE_SUFFIX[b]}`] = value;
  return compactStyles(next);
}

export function splitColorAlpha(value: string | undefined): {
  hex: string | null;
  alpha: number;
  raw: string;
} {
  const raw = value ?? "";
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(raw.trim());
  if (!m) return { hex: null, alpha: 100, raw };
  let h = m[1].toLowerCase();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const alpha =
    h.length === 8 ? Math.round((parseInt(h.slice(6), 16) / 255) * 100) : 100;
  return { hex: `#${h.slice(0, 6)}`, alpha, raw };
}

export function joinColorAlpha(hex: string, alpha: number): string {
  const a = Math.max(0, Math.min(100, Math.round(alpha)));
  if (a >= 100) return hex;
  return `${hex}${Math.round((a / 100) * 255)
    .toString(16)
    .padStart(2, "0")}`;
}

export function toBackgroundImage(
  input: string | undefined,
): string | undefined {
  const s = (input ?? "").trim();
  if (!s) return undefined;
  if (/^(https?:|\/|data:)/i.test(s)) return `url("${s}")`;
  return s;
}

const TEXT_TYPES = [
  "Text",
  "Span",
  "Heading",
  "Label",
  "Blockquote",
  "Code",
  "Button",
  "Input",
  "Textarea",
  "Select",
  "Link",
] as const satisfies readonly ElementType[];

export function isTextElement(type: string): boolean {
  return (TEXT_TYPES as readonly string[]).includes(type);
}
