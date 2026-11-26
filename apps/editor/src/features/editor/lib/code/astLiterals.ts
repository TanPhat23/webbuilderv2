import * as t from "@babel/types";

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

export function attributeValue(attr: t.JSXAttribute): Literal {
  const value = attr.value;
  if (value === null || value === undefined) return { ok: true, value: true };
  if (t.isStringLiteral(value)) return { ok: true, value: value.value };
  if (t.isJSXExpressionContainer(value) && !t.isJSXEmptyExpression(value.expression)) {
    return literalValue(value.expression);
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

export function splitChildren(node: t.JSXElement): { text: string; elements: t.JSXElement[] } {
  const text: string[] = [];
  const elements: t.JSXElement[] = [];
  for (const child of node.children) {
    if (t.isJSXText(child)) {
      text.push(cleanJsxText(child.value));
    } else if (t.isJSXElement(child)) {
      elements.push(child);
    } else if (t.isJSXExpressionContainer(child)) {
      if (t.isJSXEmptyExpression(child.expression)) continue;
      const v = literalValue(child.expression);
      if (v.ok && (typeof v.value === "string" || typeof v.value === "number")) {
        text.push(String(v.value));
      } else {
        throw new CodeError("Dynamic expressions can't be converted to visual elements.", child.loc);
      }
    } else {
      throw new CodeError("Nested fragments and spread children aren't supported here.", child.loc);
    }
  }
  return { text: text.join(""), elements };
}

export function stringAttributeValue(
  attrs: ReadonlyMap<string, t.JSXAttribute>,
  name: string,
  requireLiteral = false,
): string | undefined {
  const attr = attrs.get(name);
  if (!attr) return undefined;
  const v = attributeValue(attr);
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
): string | undefined {
  const value = stringAttributeValue(attrs, name, true);
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
