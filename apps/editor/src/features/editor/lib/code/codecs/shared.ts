import { parseExpression } from "@babel/parser";
import * as t from "@babel/types";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { classNameFor } from "../classNames";
import {
  type CodeTextSegment,
  HIDDEN_SETTINGS,
  MAX_CODE_PROPS,
  MAX_CODE_PROP_LENGTH,
  readCodeText,
  readCodeVisible,
  renderCodeTextPlaceholder,
} from "../customCode";
import type { GenerateNodeContext } from "./types";

export type JsxChildNode =
  | t.JSXText
  | t.JSXExpressionContainer
  | t.JSXSpreadChild
  | t.JSXElement
  | t.JSXFragment;

const HIDDEN_SET: ReadonlySet<string> = new Set(HIDDEN_SETTINGS);

export function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Element text as a JSX child. Text JSX would misread or trim (braces, angle
 * brackets, ampersands, edge or repeated whitespace) goes in a string literal.
 */
export function textChild(content: string): t.JSXText | t.JSXExpressionContainer {
  return /[{}<>&]|^\s|\s$|\s{2,}|[\n\r\t]/.test(content)
    ? t.jsxExpressionContainer(t.stringLiteral(content))
    : t.jsxText(content);
}

export function classNameAttr(element: EditorElement): t.JSXAttribute {
  return t.jsxAttribute(
    t.jsxIdentifier("className"),
    t.stringLiteral(classNameFor(element)),
  );
}

export function jsxEl(
  tag: string,
  attrs: Array<t.JSXAttribute | t.JSXSpreadAttribute>,
  children: JsxChildNode[],
): t.JSXElement {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(tag), attrs, false),
    t.jsxClosingElement(t.jsxIdentifier(tag)),
    children,
    false,
  );
}

export function selfClosingJsxEl(
  tag: string,
  attrs: Array<t.JSXAttribute | t.JSXSpreadAttribute>,
): t.JSXElement {
  return t.jsxElement(
    t.jsxOpeningElement(t.jsxIdentifier(tag), attrs, true),
    null,
    [],
    true,
  );
}

export function jsonValueToExpression(value: unknown): t.Expression | null {
  if (typeof value === "string") return t.stringLiteral(value);
  if (typeof value === "boolean") return t.booleanLiteral(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return value < 0
      ? t.unaryExpression("-", t.numericLiteral(-value))
      : t.numericLiteral(value);
  }
  if (value === null) return t.nullLiteral();
  if (Array.isArray(value)) {
    const items: t.Expression[] = [];
    for (const item of value) {
      const expr = jsonValueToExpression(item);
      if (!expr) return null;
      items.push(expr);
    }
    return t.arrayExpression(items);
  }
  if (isPlainRecord(value)) {
    const props: t.ObjectProperty[] = [];
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      const expr = jsonValueToExpression(v);
      if (!expr) return null;
      const keyNode = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k)
        ? t.identifier(k)
        : t.stringLiteral(k);
      props.push(t.objectProperty(keyNode, expr));
    }
    return t.objectExpression(props);
  }
  return null;
}

/**
 * Converts plain `element.settings` entries into JSX attributes while skipping
 * hidden editor bookkeeping keys and optional codec-handled keys.
 */
export function settingsToAttributes(
  settings: unknown,
  skipKeys?: ReadonlySet<string>,
  renameKeys?: Readonly<Record<string, string>>,
): t.JSXAttribute[] {
  const attrs: t.JSXAttribute[] = [];
  if (!isPlainRecord(settings)) return attrs;

  for (const [key, value] of Object.entries(settings)) {
    if (value === undefined) continue;
    if (HIDDEN_SET.has(key)) continue;
    if (skipKeys?.has(key)) continue;

    const attrName = renameKeys && Object.hasOwn(renameKeys, key) ? renameKeys[key]! : key;
    if (typeof value === "string") {
      attrs.push(t.jsxAttribute(t.jsxIdentifier(attrName), t.stringLiteral(value)));
    } else {
      const expr = jsonValueToExpression(value);
      if (expr) {
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(attrName), t.jsxExpressionContainer(expr)),
        );
      } else {
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(attrName), t.stringLiteral(String(value))),
        );
      }
    }
  }

  return attrs;
}

function codeTextSegmentChild(
  seg: CodeTextSegment,
  index: number,
  total: number,
): JsxChildNode | null {
  if (typeof seg !== "string") {
    try {
      return t.jsxExpressionContainer(
        parseExpression(seg.expr, { plugins: ["jsx", "typescript"] }),
      );
    } catch {
      return t.jsxText(`{${seg.expr}}`);
    }
  }
  if (seg === "") return null;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const needsContainer =
    /[{}<>&]|[\n\r\t]|\s{2,}/.test(seg) ||
    (isFirst && /^\s/.test(seg)) ||
    (isLast && /\s$/.test(seg));
  return needsContainer
    ? t.jsxExpressionContainer(t.stringLiteral(seg))
    : t.jsxText(seg);
}

/**
 * Emits mixed JSX text / expression children when `settings.codeText` matches
 * `element.content`; falls back to plain `textChild(element.content)` if the
 * user edited `element.content` visually on the Canvas.
 */
export function elementTextChildren(element: EditorElement): JsxChildNode[] {
  const segments = readCodeText(element.settings);
  if (segments && renderCodeTextPlaceholder(segments) === element.content) {
    const out: JsxChildNode[] = [];
    segments.forEach((seg, index) => {
      const node = codeTextSegmentChild(seg, index, segments.length);
      if (node) out.push(node);
    });
    return out;
  }
  return element.content ? [textChild(element.content)] : [];
}

/** Wraps a generated `JSXElement` in `{cond && (...)}` when `settings.codeVisible` is set. */
export function wrapCodeVisible(
  node: t.JSXElement,
  element: EditorElement,
): t.JSXElement | t.JSXExpressionContainer {
  const cond = readCodeVisible(element.settings);
  if (!cond) return node;
  try {
    const condExpr = parseExpression(cond, { plugins: ["jsx", "typescript"] });
    return t.jsxExpressionContainer(t.logicalExpression("&&", condExpr, node));
  } catch {
    return node;
  }
}

/** Returns attribute names already supplied by `settings.codeProps`. */
export function codePropNames(settings: unknown): ReadonlySet<string> {
  const names = new Set<string>();
  if (!isPlainRecord(settings) || !Array.isArray(settings.codeProps)) return names;
  for (const attr of codePropAttributes(settings.codeProps)) {
    if (t.isJSXAttribute(attr)) {
      const name = t.isJSXIdentifier(attr.name)
        ? attr.name.name
        : `${attr.name.namespace.name}:${attr.name.name.name}`;
      names.add(name);
    }
  }
  return names;
}

export function buildContainerChildren(
  element: EditorElement,
  ctx: GenerateNodeContext,
): JsxChildNode[] {
  const children: JsxChildNode[] = [...elementTextChildren(element)];
  if ("elements" in element && Array.isArray(element.elements)) {
    for (const child of element.elements) {
      const node = ctx.generateChild(child);
      if (node) children.push(node);
    }
  }
  return children;
}

/** Attributes from source text such as `{...register("a")}`; text that does not parse is skipped. */
export function codePropAttributes(props: unknown): Array<t.JSXAttribute | t.JSXSpreadAttribute> {
  if (!Array.isArray(props)) return [];
  const out: Array<t.JSXAttribute | t.JSXSpreadAttribute> = [];
  for (const source of props.slice(0, MAX_CODE_PROPS)) {
    if (typeof source !== "string" || source.length > MAX_CODE_PROP_LENGTH) continue;
    try {
      const tag = parseExpression(`<x ${source} />`, { plugins: ["jsx", "typescript"] });
      if (!t.isJSXElement(tag)) continue;
      for (const attr of tag.openingElement.attributes) {
        out.push(t.cloneNode(attr, true, true));
      }
    } catch {
      // Not valid attribute source.
    }
  }
  return out;
}

export function decorateGeneratedElement(
  node: t.JSXElement,
  element: EditorElement,
  tagElementIds: boolean,
): t.JSXElement {
  if (isPlainRecord(element.settings) && element.settings.codeProps) {
    const customAttrs = codePropAttributes(element.settings.codeProps);
    const hasCustomClassName = customAttrs.some(
      (attr) =>
        t.isJSXAttribute(attr) &&
        t.isJSXIdentifier(attr.name, { name: "className" }),
    );
    if (hasCustomClassName) {
      node.openingElement.attributes = node.openingElement.attributes.filter(
        (attr) =>
          !(
            t.isJSXAttribute(attr) &&
            t.isJSXIdentifier(attr.name, { name: "className" })
          ),
      );
    }
    node.openingElement.attributes.push(...customAttrs);
  }
  if (tagElementIds) {
    node.openingElement.attributes.push(
      t.jsxAttribute(t.jsxIdentifier("data-element-id"), t.stringLiteral(element.id)),
    );
  }
  return node;
}
