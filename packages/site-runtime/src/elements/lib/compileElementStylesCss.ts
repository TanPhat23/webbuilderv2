import type { CSSProperties } from "react";
import type { Breakpoint, EditorElement } from "../../types/elements";
import { getViewChildren } from "../element-children";

const BREAKPOINT_MEDIA: ReadonlyArray<{
  readonly bp: Breakpoint;
  readonly minWidthPx: number | null;
}> = [
  { bp: "default", minWidthPx: null },
  { bp: "sm", minWidthPx: 640 },
  { bp: "md", minWidthPx: 768 },
  { bp: "lg", minWidthPx: 1024 },
  { bp: "xl", minWidthPx: 1280 },
];

const UNITLESS_NUMBER_PROPS: ReadonlySet<string> = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "columnCount",
  "columns",
  "flex",
  "flexGrow",
  "flexPositive",
  "flexShrink",
  "flexNegative",
  "flexOrder",
  "gridArea",
  "gridRow",
  "gridRowEnd",
  "gridRowSpan",
  "gridRowStart",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnSpan",
  "gridColumnStart",
  "fontWeight",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "scale",
]);

const CAMEL_PROP_RE = /^[a-z][a-zA-Z0-9]*$/;
const UNSAFE_VALUE_RE = /[;{}]|\/\*|\*\/|\\$|<\/style|javascript\s*:|expression\s*\(/i;

function hasBalancedQuotes(value: string): boolean {
  let activeQuote: '"' | "'" | null = null;
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch === "\\") {
      i += 1;
      if (i >= value.length) return false;
      continue;
    }
    if (activeQuote === null) {
      if (ch === '"' || ch === "'") {
        activeQuote = ch;
      }
    } else if (ch === activeQuote) {
      activeQuote = null;
    }
  }
  return activeQuote === null;
}

/** Escapes an element ID for safe use inside a `[data-element-id="..."]` CSS selector. */
export function escapeElementIdSelector(id: string): string {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") {
    return CSS.escape(id);
  }
  return id.replace(/[^a-zA-Z0-9_-]/g, (ch) => `\\${ch}`);
}

function toKebabProperty(prop: string): string | null {
  if (!CAMEL_PROP_RE.test(prop)) return null;
  return prop.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function formatCssValue(prop: string, raw: unknown): string | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) return null;
    if (raw === 0 || UNITLESS_NUMBER_PROPS.has(prop)) return String(raw);
    return `${raw}px`;
  }
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!trimmed || UNSAFE_VALUE_RE.test(trimmed)) return null;
  if (/[\r\n]/.test(trimmed)) return null;
  if (!hasBalancedQuotes(trimmed)) return null;
  return trimmed;
}

function compileDeclarationBlock(styleMap: CSSProperties | undefined): string {
  if (!styleMap || typeof styleMap !== "object" || Array.isArray(styleMap)) {
    return "";
  }
  const decls: string[] = [];
  const entries: ReadonlyArray<readonly [string, unknown]> = Object.entries(styleMap);
  for (const [key, rawVal] of entries) {
    if (!Object.hasOwn(styleMap, key)) continue;
    const cssProp = toKebabProperty(key);
    if (!cssProp) continue;
    const formatted = formatCssValue(key, rawVal);
    if (formatted === null) continue;
    decls.push(`${cssProp}:${formatted};`);
  }
  return decls.join("");
}

function collectElementsPreOrder(
  elements: readonly EditorElement[],
  out: EditorElement[],
  seenIds: Set<string>,
): void {
  for (const el of elements) {
    if (!seenIds.has(el.id)) {
      seenIds.add(el.id);
      out.push(el);
    }
    const children = getViewChildren(el);
    if (children && children.length > 0) {
      collectElementsPreOrder(children, out, seenIds);
    }
  }
}

/** Compiles element responsive styles into base and mobile-first `@media (min-width: ...)` CSS rules. */
export function compileElementStylesCss(
  elements: readonly EditorElement[] | undefined,
): string {
  if (!elements || elements.length === 0) return "";
  const flat: EditorElement[] = [];
  collectElementsPreOrder(elements, flat, new Set<string>());

  const chunks: string[] = [];
  for (const { bp, minWidthPx } of BREAKPOINT_MEDIA) {
    const rules: string[] = [];
    for (const el of flat) {
      const styleMap = el.styles?.[bp];
      const block = compileDeclarationBlock(styleMap);
      if (!block) continue;
      const selector = `[data-element-id="${escapeElementIdSelector(el.id)}"]`;
      rules.push(`${selector}{${block}}`);
    }
    if (rules.length === 0) continue;
    if (minWidthPx === null) {
      chunks.push(rules.join(""));
    } else {
      chunks.push(`@media (min-width: ${minWidthPx}px){${rules.join("")}}`);
    }
  }
  return chunks.join("\n");
}
