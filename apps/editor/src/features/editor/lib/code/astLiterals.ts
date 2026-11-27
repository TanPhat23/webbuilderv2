import { generate } from "@babel/generator";
import * as t from "@babel/types";
import type { CodeTextSegment } from "./customCode";
import {
  evaluateStaticExpression,
  findUnboundIdentifier,
  type StaticValue,
} from "./normalize/staticScope";

export interface CodeDiagnostic {
  message: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
}

export class CodeError extends Error {
  constructor(
    message: string,
    readonly loc?: t.SourceLocation | null,
  ) {
    super(message);
  }
}

export type Literal = { readonly ok: true; readonly value: unknown } | { readonly ok: false };

export function cleanJsxText(value: string): string {
  const lines = value.split(/\r\n|\n|\r/);
  let lastNonEmpty = -1;
  lines.forEach((line, i) => {
    if (/[^ \t]/.test(line)) lastNonEmpty = i;
  });
  if (lastNonEmpty === -1) {
    return lines.length === 1 && /[^\r\n]/.test(value) ? " " : "";
  }
  let out = "";
  lines.forEach((raw, i) => {
    let line = raw.replace(/\t/g, " ");
    if (i !== 0) line = line.replace(/^ +/, "");
    if (i !== lines.length - 1) line = line.replace(/ +$/, "");
    if (line) out += i === lastNonEmpty ? line : `${line} `;
  });
  return out;
}

function unaryLiteralValue(node: t.UnaryExpression): Literal {
  if (node.operator !== "-" && node.operator !== "+") return { ok: false };
  const inner = literalValue(node.argument);
  if (!inner.ok || typeof inner.value !== "number") return { ok: false };
  return { ok: true, value: node.operator === "-" ? -inner.value : inner.value };
}

function arrayLiteralValue(node: t.ArrayExpression): Literal {
  const out: unknown[] = [];
  for (const item of node.elements) {
    if (!item || t.isSpreadElement(item)) return { ok: false };
    const v = literalValue(item);
    if (!v.ok) return v;
    out.push(v.value);
  }
  return { ok: true, value: out };
}

function objectPropertyKey(key: t.ObjectProperty["key"]): string | null {
  if (t.isIdentifier(key)) return key.name;
  if (t.isStringLiteral(key) || t.isNumericLiteral(key)) return String(key.value);
  return null;
}

function objectLiteralValue(node: t.ObjectExpression): Literal {
  const out: Record<string, unknown> = {};
  for (const prop of node.properties) {
    if (!t.isObjectProperty(prop) || prop.computed) return { ok: false };
    const key = objectPropertyKey(prop.key);
    if (key === null) return { ok: false };
    const v = literalValue(prop.value);
    if (!v.ok) return v;
    out[key] = v.value;
  }
  return { ok: true, value: out };
}

export function literalValue(node: t.Node): Literal {
  if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node)) {
    return { ok: true, value: node.value };
  }
  if (t.isNullLiteral(node)) return { ok: true, value: null };
  if (t.isIdentifier(node, { name: "undefined" })) return { ok: true, value: undefined };
  if (t.isTemplateLiteral(node) && node.expressions.length === 0) {
    return { ok: true, value: node.quasis.map((q) => q.value.cooked ?? "").join("") };
  }
  if (t.isUnaryExpression(node)) return unaryLiteralValue(node);
  if (t.isArrayExpression(node)) return arrayLiteralValue(node);
  if (t.isObjectExpression(node)) return objectLiteralValue(node);
  return { ok: false };
}

export function attributeValue(
  attr: t.JSXAttribute,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): Literal {
  const value = attr.value;
  if (value === null || value === undefined) return { ok: true, value: true };
  if (t.isStringLiteral(value)) return { ok: true, value: value.value };
  if (t.isJSXExpressionContainer(value) && !t.isJSXEmptyExpression(value.expression)) {
    return staticConsts
      ? evaluateStaticExpression(value.expression, staticConsts)
      : literalValue(value.expression);
  }
  return { ok: false };
}

export function attributeName(attr: t.JSXAttribute): string {
  return t.isJSXIdentifier(attr.name) ? attr.name.name : `${attr.name.namespace.name}:${attr.name.name.name}`;
}

export function tagName(node: t.JSXElement): string {
  const name = node.openingElement.name;
  if (!t.isJSXIdentifier(name)) {
    throw new CodeError("Only plain tags are supported here.", node.loc);
  }
  return name.name;
}

export function isTag(node: t.Node, name: string): boolean {
  return t.isJSXElement(node) && t.isJSXIdentifier(node.openingElement.name, { name });
}

export interface SplitChildrenOptions {
  readonly boundIdentifiers: ReadonlySet<string>;
  readonly staticConsts: ReadonlyMap<string, StaticValue>;
  readonly allowDynamicText?: boolean;
}

export interface SplitChildrenResult {
  readonly text: string;
  readonly elements: t.JSXElement[];
  readonly codeText: readonly CodeTextSegment[] | undefined;
  readonly visibilityByElement: ReadonlyMap<t.JSXElement, string>;
}

function appendTextSegment(segments: CodeTextSegment[], text: string): void {
  if (text === "") return;
  const lastIdx = segments.length - 1;
  const last = lastIdx >= 0 ? segments[lastIdx] : undefined;
  if (typeof last === "string") {
    segments[lastIdx] = last + text;
  } else {
    segments.push(text);
  }
}

export function splitChildren(
  node: t.JSXElement,
  opts?: SplitChildrenOptions,
): SplitChildrenResult {
  const text: string[] = [];
  const elements: t.JSXElement[] = [];
  const segments: CodeTextSegment[] = [];
  const visibilityByElement = new Map<t.JSXElement, string>();
  let hasDynamicExpr = false;

  for (const child of node.children) {
    if (t.isJSXText(child)) {
      const cleaned = cleanJsxText(child.value);
      text.push(cleaned);
      appendTextSegment(segments, cleaned);
    } else if (t.isJSXElement(child)) {
      elements.push(child);
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      if (!opts) {
        const v = literalValue(child.expression);
        if (v.ok && (typeof v.value === "string" || typeof v.value === "number")) {
          text.push(String(v.value));
        } else {
          throw new CodeError("Dynamic expressions can't be converted to visual elements.", child.loc);
        }
        continue;
      }

      const staticVal = evaluateStaticExpression(child.expression, opts.staticConsts);
      if (staticVal.ok && (typeof staticVal.value === "string" || typeof staticVal.value === "number")) {
        const str = String(staticVal.value);
        text.push(str);
        appendTextSegment(segments, str);
        continue;
      }

      const unparenExpr = unparen(child.expression);
      if (unparenExpr && t.isLogicalExpression(unparenExpr) && unparenExpr.operator === "&&") {
        const right = unparen(unparenExpr.right);
        if (right && t.isJSXElement(right)) {
          const bad = findUnboundIdentifier(unparenExpr.left, opts.boundIdentifiers);
          if (bad) {
            throw new CodeError(
              `'${bad.name}' is not defined in this component.`,
              bad.loc ?? unparenExpr.left.loc,
            );
          }
          elements.push(right);
          visibilityByElement.set(right, generate(unparenExpr.left).code);
          continue;
        }
      }

      const bad = findUnboundIdentifier(child.expression, opts.boundIdentifiers);
      if (bad) {
        throw new CodeError(
          `'${bad.name}' is not defined in this component.`,
          bad.loc ?? child.loc,
        );
      }
      if (!opts.allowDynamicText) {
        throw new CodeError("Dynamic expressions can't be converted to visual elements.", child.loc);
      }
      const exprCode = generate(child.expression).code;
      hasDynamicExpr = true;
      text.push(`{${exprCode}}`);
      segments.push({ expr: exprCode });
    } else {
      throw new CodeError("Nested fragments and spread children aren't supported here.", child.loc);
    }
  }

  return {
    text: text.join(""),
    elements,
    codeText: hasDynamicExpr ? segments : undefined,
    visibilityByElement,
  };
}

export function stringAttributeValue(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  name: string,
  requireLiteral = false,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): string | undefined {
  const attr = attrs.get(name);
  if (!attr) return undefined;
  const v = attributeValue(attr, staticConsts);
  if (v.ok && typeof v.value === "string") return v.value;
  if (requireLiteral) {
    throw new CodeError(`The "${name}" attribute must be a plain string here.`, attr.loc);
  }
  return undefined;
}

export function stringAttribute(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  name: string,
  before: string | undefined,
  staticConsts?: ReadonlyMap<string, StaticValue>,
): string | undefined {
  const value = stringAttributeValue(attrs, name, true, staticConsts);
  if (value !== undefined) return value;
  return before ? "" : before;
}

export function unparen(node: t.Node | null | undefined): t.Node | null | undefined {
  return t.isParenthesizedExpression(node) ? unparen(node.expression) : node;
}

export function diagnosticAt(message: string, loc?: t.SourceLocation | null): CodeDiagnostic {
  return {
    message,
    line: loc?.start.line ?? 1,
    column: (loc?.start.column ?? 0) + 1,
    endLine: loc?.end.line ?? loc?.start.line ?? 1,
    endColumn: (loc?.end.column ?? 0) + 1,
  };
}
