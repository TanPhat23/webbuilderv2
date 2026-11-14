// src/features/interactions/runtime/expression.ts
/**
 * The `{{ … }}` expression language used by interaction steps.
 *
 * A small, whitelisted grammar: literals, property access, ! && ||,
 * comparisons, + - * / %, ternary and parentheses. No calls, no assignment,
 * no eval. Property access only sees own properties and never
 * __proto__/constructor/prototype, so an expression can read data but cannot
 * reach code.
 *
 * Pure: no DOM, no React.
 */

export type Scope = Record<string, unknown>;

export type ExprNode =
  | { k: "lit"; v: unknown }
  | { k: "id"; name: string }
  | { k: "mem"; obj: ExprNode; prop: ExprNode }
  | { k: "un"; op: "!" | "-"; arg: ExprNode }
  | { k: "bin"; op: string; l: ExprNode; r: ExprNode }
  | { k: "cond"; test: ExprNode; yes: ExprNode; no: ExprNode };

export class ExpressionError extends Error {
  readonly offset: number;
  constructor(message: string, offset: number) {
    super(message);
    this.name = "ExpressionError";
    this.offset = offset;
  }
}

const MAX_LENGTH = 2000;
const MAX_DEPTH = 64;
const BLOCKED = new Set(["__proto__", "constructor", "prototype"]);
const OPS = [
  "===", "!==", "==", "!=", "<=", ">=", "&&", "||",
  "<", ">", "+", "-", "*", "/", "%", "!", "?", ":", ".", "[", "]", "(", ")",
];
const BINARY: Record<string, number> = {
  "||": 2, "&&": 3,
  "==": 4, "!=": 4, "===": 4, "!==": 4,
  "<": 5, "<=": 5, ">": 5, ">=": 5,
  "+": 6, "-": 6,
  "*": 7, "/": 7, "%": 7,
};

type Tok = { t: "num" | "str" | "id" | "op" | "end"; v: string; at: number };

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c) || (c === "." && /[0-9]/.test(src[i + 1] ?? ""))) {
      const m = /^(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(src.slice(i))!;
      out.push({ t: "num", v: m[0], at: i });
      i += m[0].length;
      continue;
    }
    if (c === '"' || c === "'") {
      let j = i + 1;
      let s = "";
      while (j < src.length && src[j] !== c) {
        if (src[j] === "\\") {
          const n = src[j + 1] ?? "";
          s += n === "n" ? "\n" : n === "t" ? "\t" : n;
          j += 2;
        } else {
          s += src[j++];
        }
      }
      if (j >= src.length) throw new ExpressionError("unterminated string", i);
      out.push({ t: "str", v: s, at: i });
      i = j + 1;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const m = /^[A-Za-z_$][A-Za-z0-9_$]*/.exec(src.slice(i))!;
      out.push({ t: "id", v: m[0], at: i });
      i += m[0].length;
      continue;
    }
    const op = OPS.find((o) => src.startsWith(o, i));
    if (!op) throw new ExpressionError(`unexpected "${c}"`, i);
    out.push({ t: "op", v: op, at: i });
    i += op.length;
  }
  out.push({ t: "end", v: "", at: src.length });
  return out;
}

const blocked = (name: string, at: number) =>
  new ExpressionError(`"${name}" is not allowed`, at);

export function parseExpression(src: string): ExprNode {
  if (src.length > MAX_LENGTH) {
    throw new ExpressionError(`expression longer than ${MAX_LENGTH} characters`, 0);
  }
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const next = () => toks[p++];
  const unexpected = (t: Tok) =>
    new ExpressionError(
      t.t === "end" ? "unexpected end of expression" : `unexpected "${t.v}"`,
      t.at,
    );
  const expectOp = (v: string) => {
    const t = next();
    if (t.t !== "op" || t.v !== v) throw new ExpressionError(`expected "${v}"`, t.at);
  };
  const guard = (depth: number) => {
    if (depth > MAX_DEPTH) {
      throw new ExpressionError("expression nested too deeply", peek().at);
    }
  };

  const primary = (depth: number): ExprNode => {
    guard(depth);
    const t = next();
    if (t.t === "num") return { k: "lit", v: Number(t.v) };
    if (t.t === "str") return { k: "lit", v: t.v };
    if (t.t === "id") {
      if (t.v === "true") return { k: "lit", v: true };
      if (t.v === "false") return { k: "lit", v: false };
      if (t.v === "null") return { k: "lit", v: null };
      if (t.v === "undefined") return { k: "lit", v: undefined };
      if (BLOCKED.has(t.v)) throw blocked(t.v, t.at);
      return { k: "id", name: t.v };
    }
    if (t.t === "op" && t.v === "(") {
      const inner = expr(0, depth + 1);
      expectOp(")");
      return inner;
    }
    throw unexpected(t);
  };

  const postfix = (start: ExprNode, depth: number): ExprNode => {
    let node = start;
    for (;;) {
      const t = peek();
      if (t.t === "op" && t.v === ".") {
        next();
        const n = next();
        if (n.t !== "id") throw new ExpressionError("expected a property name", n.at);
        if (BLOCKED.has(n.v)) throw blocked(n.v, n.at);
        node = { k: "mem", obj: node, prop: { k: "lit", v: n.v } };
        continue;
      }
      if (t.t === "op" && t.v === "[") {
        next();
        const prop = expr(0, depth + 1);
        expectOp("]");
        if (prop.k === "lit" && BLOCKED.has(String(prop.v))) throw blocked(String(prop.v), t.at);
        node = { k: "mem", obj: node, prop };
        continue;
      }
      if (t.t === "op" && t.v === "(") {
        throw new ExpressionError("function calls are not supported", t.at);
      }
      return node;
    }
  };

  const unary = (depth: number): ExprNode => {
    guard(depth);
    const t = peek();
    if (t.t === "op" && (t.v === "!" || t.v === "-")) {
      next();
      return { k: "un", op: t.v, arg: unary(depth + 1) };
    }
    return postfix(primary(depth), depth);
  };

  const expr = (minPrec: number, depth: number): ExprNode => {
    guard(depth);
    let left = unary(depth);
    for (;;) {
      const t = peek();
      if (t.t === "op" && t.v === "?" && minPrec <= 1) {
        next();
        const yes = expr(1, depth + 1);
        expectOp(":");
        const no = expr(1, depth + 1);
        left = { k: "cond", test: left, yes, no };
        continue;
      }
      const prec = t.t === "op" ? BINARY[t.v] : undefined;
      if (prec === undefined || prec < minPrec) return left;
      next();
      const right = expr(prec + 1, depth + 1);
      const op = t.v === "===" ? "==" : t.v === "!==" ? "!=" : t.v;
      left = { k: "bin", op, l: left, r: right };
    }
  };

  const root = expr(0, 0);
  const end = peek();
  if (end.t !== "end") throw unexpected(end);
  // Iterative validation also bounds left-associated operators and member
  // chains, which the Pratt parser constructs without recursive calls.
  const pending: Array<[ExprNode, number]> = [[root, 0]];
  while (pending.length) {
    const [node, depth] = pending.pop()!;
    guard(depth);
    switch (node.k) {
      case "mem": pending.push([node.obj, depth + 1], [node.prop, depth + 1]); break;
      case "un": pending.push([node.arg, depth + 1]); break;
      case "bin": pending.push([node.l, depth + 1], [node.r, depth + 1]); break;
      case "cond": pending.push([node.test, depth + 1], [node.yes, depth + 1], [node.no, depth + 1]); break;
    }
  }
  return root;
}

function get(obj: unknown, key: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== "object" && typeof obj !== "string") return undefined;
  const k = String(key);
  if (BLOCKED.has(k)) return undefined;
  const boxed = Object(obj) as Record<string, unknown>;
  return Object.hasOwn(boxed, k) ? boxed[k] : undefined;
}

const comparable = (l: unknown, r: unknown) =>
  (typeof l === "number" && typeof r === "number") ||
  (typeof l === "string" && typeof r === "string");

/** How a value reads inside text: objects as JSON, null/undefined as "". */
export function toText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

function run(n: ExprNode, scope: Scope): unknown {
  switch (n.k) {
    case "lit":
      return n.v;
    case "id":
      return get(scope, n.name);
    case "mem":
      return get(run(n.obj, scope), run(n.prop, scope));
    case "un": {
      const v = run(n.arg, scope);
      return n.op === "!" ? !v : -Number(v);
    }
    case "cond":
      return run(n.test, scope) ? run(n.yes, scope) : run(n.no, scope);
    case "bin": {
      if (n.op === "&&") {
        const l = run(n.l, scope);
        return l ? run(n.r, scope) : l;
      }
      if (n.op === "||") {
        const l = run(n.l, scope);
        return l ? l : run(n.r, scope);
      }
      const l = run(n.l, scope);
      const r = run(n.r, scope);
      switch (n.op) {
        case "==": return l === r;
        case "!=": return l !== r;
        case "<": return comparable(l, r) ? (l as number) < (r as number) : false;
        case "<=": return comparable(l, r) ? (l as number) <= (r as number) : false;
        case ">": return comparable(l, r) ? (l as number) > (r as number) : false;
        case ">=": return comparable(l, r) ? (l as number) >= (r as number) : false;
        case "+":
          return typeof l === "string" || typeof r === "string"
            ? toText(l) + toText(r)
            : Number(l) + Number(r);
        case "-": return Number(l) - Number(r);
        case "*": return Number(l) * Number(r);
        case "/": return Number(l) / Number(r);
        case "%": return Number(l) % Number(r);
      }
    }
  }
  return undefined;
}

const cache = new Map<string, ExprNode>();

export function evaluate(src: string, scope: Scope): unknown {
  let node = cache.get(src);
  if (!node) {
    node = parseExpression(src);
    if (cache.size > 500) cache.clear();
    cache.set(src, node);
  }
  return run(node, scope);
}

type TemplateExpression = { start: number; end: number; source: string };

/** Find template expressions in one pass, respecting quoted strings. */
export function scanTemplate(template: string): { expressions: TemplateExpression[]; unclosed: boolean } {
  const expressions: TemplateExpression[] = [];
  let cursor = 0;
  while (cursor < template.length) {
    const start = template.indexOf("{{", cursor);
    if (start < 0) break;
    let i = start + 2;
    let quote = "";
    while (i < template.length) {
      const c = template[i];
      if (quote) {
        if (c === "\\") { i += 2; continue; }
        if (c === quote) quote = "";
      } else if (c === "'" || c === '"') {
        quote = c;
      } else if (c === "}" && template[i + 1] === "}") {
        break;
      }
      i++;
    }
    if (i >= template.length) return { expressions, unclosed: true };
    expressions.push({ start, end: i + 2, source: template.slice(start + 2, i) });
    cursor = i + 2;
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
      out.push(`{{${part.source}}}: ${(e as Error).message}`);
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
      case "mem": walk(n.obj); walk(n.prop); break;
      case "un": walk(n.arg); break;
      case "bin": walk(n.l); walk(n.r); break;
      case "cond": walk(n.test); walk(n.yes); walk(n.no); break;
    }
  };
  for (const part of scanTemplate(template).expressions) {
    try {
      walk(parseExpression(part.source));
    } catch {
      // Syntax errors are reported by templateErrors.
    }
  }
  return out;
}
