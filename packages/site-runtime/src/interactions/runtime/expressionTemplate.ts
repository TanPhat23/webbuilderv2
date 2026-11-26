import { evaluate, toText, type Scope } from "./expressionEval";
import {
  ExpressionError,
  parseExpression,
  type ExprNode,
} from "./expressionParser";

export type TemplateExpression = { start: number; end: number; source: string };

function findClosingBraces(template: string, from: number): number {
  let i = from;
  let quote = "";
  while (i < template.length) {
    const c = template[i];
    if (quote) {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === quote) quote = "";
    } else if (c === "'" || c === '"') {
      quote = c;
    } else if (c === "}" && template[i + 1] === "}") {
      return i;
    }
    i++;
  }
  return -1;
}

export function scanTemplate(template: string): {
  expressions: TemplateExpression[];
  unclosed: boolean;
} {
  const expressions: TemplateExpression[] = [];
  let cursor = 0;
  while (cursor < template.length) {
    const start = template.indexOf("{{", cursor);
    if (start < 0) break;
    const closeAt = findClosingBraces(template, start + 2);
    if (closeAt < 0) return { expressions, unclosed: true };
    expressions.push({
      start,
      end: closeAt + 2,
      source: template.slice(start + 2, closeAt),
    });
    cursor = closeAt + 2;
  }
  return { expressions, unclosed: false };
}

/** A whole expression retains its type; mixed text is rendered as a string. */
export function interpolate(template: string, scope: Scope): unknown {
  const { expressions } = scanTemplate(template);
  if (expressions.length === 1) {
    const part = expressions[0];
    if (!template.slice(0, part.start).trim() && !template.slice(part.end).trim()) {
      return evaluate(part.source, scope);
    }
  }
  const out: string[] = [];
  let cursor = 0;
  for (const part of expressions) {
    out.push(template.slice(cursor, part.start), toText(evaluate(part.source, scope)));
    cursor = part.end;
  }
  out.push(template.slice(cursor));
  return out.join("");
}

export function templateErrors(template: string): string[] {
  const out: string[] = [];
  const { expressions, unclosed } = scanTemplate(template);
  for (const part of expressions) {
    try {
      parseExpression(part.source);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      out.push(`{{${part.source}}}: ${msg}`);
    }
  }
  if (unclosed) out.push("unclosed {{");
  return out;
}

function chainOf(n: ExprNode): string[] | null {
  if (n.k === "id") return [n.name];
  if (n.k === "mem" && n.prop.k === "lit") {
    const base = chainOf(n.obj);
    return base ? [...base, String(n.prop.v)] : null;
  }
  return null;
}

/** Member chains rooted at identifiers, e.g. [["steps","signup","ok"]]. */
export function templateRefs(template: string): string[][] {
  const out: string[][] = [];
  const walk = (n: ExprNode) => {
    const chain = chainOf(n);
    if (chain) {
      out.push(chain);
      return;
    }
    switch (n.k) {
      case "mem":
        walk(n.obj);
        walk(n.prop);
        break;
      case "un":
        walk(n.arg);
        break;
      case "bin":
        walk(n.l);
        walk(n.r);
        break;
      case "cond":
        walk(n.test);
        walk(n.yes);
        walk(n.no);
        break;
    }
  };
  for (const part of scanTemplate(template).expressions) {
    try {
      walk(parseExpression(part.source));
    } catch (err) {
      if (!(err instanceof ExpressionError)) throw err;
    }
  }
  return out;
}
