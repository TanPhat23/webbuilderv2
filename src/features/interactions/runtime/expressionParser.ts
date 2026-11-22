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
export const BLOCKED = new Set(["__proto__", "constructor", "prototype"]);

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

const LITERAL_KEYWORDS = new Map<string, unknown>([
  ["true", true],
  ["false", false],
  ["null", null],
  ["undefined", undefined],
]);

type Tok = { t: "num" | "str" | "id" | "op" | "end"; v: string; at: number };

const NUMBER_PATTERN = /^(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?/;
const IDENT_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$]*/;

function readStringToken(src: string, start: number, quote: string): { token: Tok; next: number } {
  let j = start + 1;
  let value = "";
  while (j < src.length && src[j] !== quote) {
    if (src[j] === "\\") {
      const escaped = src[j + 1] ?? "";
      value += escaped === "n" ? "\n" : escaped === "t" ? "\t" : escaped;
      j += 2;
    } else {
      value += src[j++];
    }
  }
  if (j >= src.length) throw new ExpressionError("unterminated string", start);
  return { token: { t: "str", v: value, at: start }, next: j + 1 };
}

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
      const m = NUMBER_PATTERN.exec(src.slice(i));
      const v = m ? m[0] : c;
      out.push({ t: "num", v, at: i });
      i += v.length;
      continue;
    }
    if (c === '"' || c === "'") {
      const parsed = readStringToken(src, i, c);
      out.push(parsed.token);
      i = parsed.next;
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      const m = IDENT_PATTERN.exec(src.slice(i));
      const v = m ? m[0] : c;
      out.push({ t: "id", v, at: i });
      i += v.length;
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

function blockedError(name: string, at: number): ExpressionError {
  return new ExpressionError(`"${name}" is not allowed`, at);
}

function validateAstDepth(root: ExprNode, endOffset: number): void {
  const pending: Array<[ExprNode, number]> = [[root, 0]];
  while (pending.length) {
    const item = pending.pop();
    if (!item) break;
    const [node, depth] = item;
    if (depth > MAX_DEPTH) {
      throw new ExpressionError("expression nested too deeply", endOffset);
    }
    switch (node.k) {
      case "mem":
        pending.push([node.obj, depth + 1], [node.prop, depth + 1]);
        break;
      case "un":
        pending.push([node.arg, depth + 1]);
        break;
      case "bin":
        pending.push([node.l, depth + 1], [node.r, depth + 1]);
        break;
      case "cond":
        pending.push([node.test, depth + 1], [node.yes, depth + 1], [node.no, depth + 1]);
        break;
    }
  }
}

class ExpressionParser {
  private p = 0;

  constructor(private readonly toks: Tok[]) {}

  parse(): ExprNode {
    const root = this.expr(0, 0);
    const end = this.peek();
    if (end.t !== "end") throw this.unexpected(end);
    validateAstDepth(root, end.at);
    return root;
  }

  private peek(): Tok {
    return this.toks[this.p];
  }

  private next(): Tok {
    return this.toks[this.p++];
  }

  private unexpected(t: Tok): ExpressionError {
    return new ExpressionError(
      t.t === "end" ? "unexpected end of expression" : `unexpected "${t.v}"`,
      t.at,
    );
  }

  private expectOp(v: string): void {
    const t = this.next();
    if (t.t !== "op" || t.v !== v) throw new ExpressionError(`expected "${v}"`, t.at);
  }

  private guard(depth: number): void {
    if (depth > MAX_DEPTH) {
      throw new ExpressionError("expression nested too deeply", this.peek().at);
    }
  }

  private primary(depth: number): ExprNode {
    this.guard(depth);
    const t = this.next();
    if (t.t === "num") return { k: "lit", v: Number(t.v) };
    if (t.t === "str") return { k: "lit", v: t.v };
    if (t.t === "id") {
      if (LITERAL_KEYWORDS.has(t.v)) return { k: "lit", v: LITERAL_KEYWORDS.get(t.v) };
      if (BLOCKED.has(t.v)) throw blockedError(t.v, t.at);
      return { k: "id", name: t.v };
    }
    if (t.t === "op" && t.v === "(") {
      const inner = this.expr(0, depth + 1);
      this.expectOp(")");
      return inner;
    }
    throw this.unexpected(t);
  }

  private postfix(start: ExprNode, depth: number): ExprNode {
    let node = start;
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && t.v === ".") {
        this.next();
        const propToken = this.next();
        if (propToken.t !== "id") {
          throw new ExpressionError("expected a property name", propToken.at);
        }
        if (BLOCKED.has(propToken.v)) throw blockedError(propToken.v, propToken.at);
        node = { k: "mem", obj: node, prop: { k: "lit", v: propToken.v } };
        continue;
      }
      if (t.t === "op" && t.v === "[") {
        this.next();
        const prop = this.expr(0, depth + 1);
        this.expectOp("]");
        if (prop.k === "lit" && BLOCKED.has(String(prop.v))) {
          throw blockedError(String(prop.v), t.at);
        }
        node = { k: "mem", obj: node, prop };
        continue;
      }
      if (t.t === "op" && t.v === "(") {
        throw new ExpressionError("function calls are not supported", t.at);
      }
      return node;
    }
  }

  private unary(depth: number): ExprNode {
    this.guard(depth);
    const t = this.peek();
    if (t.t === "op" && (t.v === "!" || t.v === "-")) {
      this.next();
      return { k: "un", op: t.v, arg: this.unary(depth + 1) };
    }
    return this.postfix(this.primary(depth), depth);
  }

  private expr(minPrec: number, depth: number): ExprNode {
    this.guard(depth);
    let left = this.unary(depth);
    for (;;) {
      const t = this.peek();
      if (t.t === "op" && t.v === "?" && minPrec <= 1) {
        this.next();
        const yes = this.expr(1, depth + 1);
        this.expectOp(":");
        const no = this.expr(1, depth + 1);
        left = { k: "cond", test: left, yes, no };
        continue;
      }
      const prec = t.t === "op" ? BINARY[t.v] : undefined;
      if (prec === undefined || prec < minPrec) return left;
      this.next();
      const right = this.expr(prec + 1, depth + 1);
      const op = t.v === "===" ? "==" : t.v === "!==" ? "!=" : t.v;
      left = { k: "bin", op, l: left, r: right };
    }
  }
}

export function parseExpression(src: string): ExprNode {
  if (src.length > MAX_LENGTH) {
    throw new ExpressionError(`expression longer than ${MAX_LENGTH} characters`, 0);
  }
  return new ExpressionParser(tokenize(src)).parse();
}
