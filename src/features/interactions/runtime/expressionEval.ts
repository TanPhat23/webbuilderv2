import { BLOCKED, parseExpression, type ExprNode } from "./expressionParser";

export type Scope = Record<string, unknown>;

type OrderOp = "<" | "<=" | ">" | ">=";

const NUMERIC_OPS: Record<string, (a: number, b: number) => number> = {
  "-": (a, b) => a - b,
  "*": (a, b) => a * b,
  "/": (a, b) => a / b,
  "%": (a, b) => a % b,
};

function getOwn(obj: unknown, key: unknown): unknown {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj !== "object" && typeof obj !== "string") return undefined;
  const k = String(key);
  if (BLOCKED.has(k)) return undefined;
  if (typeof obj === "string") return Object.getOwnPropertyDescriptor(obj, k)?.value;
  return Object.hasOwn(obj, k) ? Reflect.get(obj, k) : undefined;
}

function comparePair<T extends number | string>(op: OrderOp, l: T, r: T): boolean {
  switch (op) {
    case "<":
      return l < r;
    case "<=":
      return l <= r;
    case ">":
      return l > r;
    case ">=":
      return l >= r;
  }
}

function compareOrdered(op: OrderOp, l: unknown, r: unknown): boolean {
  if (typeof l === "number" && typeof r === "number") return comparePair(op, l, r);
  if (typeof l === "string" && typeof r === "string") return comparePair(op, l, r);
  return false;
}

/** How a value reads inside text: objects as JSON, null/undefined as "". */
export function toText(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v) ?? "";
  return String(v);
}

function evalBinary(op: string, lNode: ExprNode, rNode: ExprNode, scope: Scope): unknown {
  if (op === "&&") {
    const l = runNode(lNode, scope);
    return l ? runNode(rNode, scope) : l;
  }
  if (op === "||") {
    const l = runNode(lNode, scope);
    return l ? l : runNode(rNode, scope);
  }
  const l = runNode(lNode, scope);
  const r = runNode(rNode, scope);
  switch (op) {
    case "==":
      return l === r;
    case "!=":
      return l !== r;
    case "<":
    case "<=":
    case ">":
    case ">=":
      return compareOrdered(op, l, r);
    case "+":
      return typeof l === "string" || typeof r === "string"
        ? toText(l) + toText(r)
        : Number(l) + Number(r);
    default: {
      const fn = NUMERIC_OPS[op];
      return fn ? fn(Number(l), Number(r)) : undefined;
    }
  }
}

function runNode(n: ExprNode, scope: Scope): unknown {
  switch (n.k) {
    case "lit":
      return n.v;
    case "id":
      return getOwn(scope, n.name);
    case "mem":
      return getOwn(runNode(n.obj, scope), runNode(n.prop, scope));
    case "un": {
      const v = runNode(n.arg, scope);
      return n.op === "!" ? !v : -Number(v);
    }
    case "cond":
      return runNode(n.test, scope) ? runNode(n.yes, scope) : runNode(n.no, scope);
    case "bin":
      return evalBinary(n.op, n.l, n.r, scope);
  }
}

const cache = new Map<string, ExprNode>();

export function evaluate(src: string, scope: Scope): unknown {
  let node = cache.get(src);
  if (!node) {
    node = parseExpression(src);
    if (cache.size > 500) cache.clear();
    cache.set(src, node);
  }
  return runNode(node, scope);
}
