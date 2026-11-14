import { parseExpression, scanTemplate, type ExprNode } from "../runtime/expression";

/** Helpers emitted into generated modules. They preserve the interpreter's
 * own-property restriction and avoid JavaScript's implicit comparison coercion.
 * Kept as separate snippets so a module only contains the ones it calls. */
export const expressionHelpers = {
  read: `const read = (obj: unknown, key: unknown): unknown => {
  if (obj === null || obj === undefined || (typeof obj !== "object" && typeof obj !== "string")) return undefined;
  const name = String(key);
  if (name === "__proto__" || name === "constructor" || name === "prototype") return undefined;
  const boxed = Object(obj) as Record<string, unknown>;
  return Object.hasOwn(boxed, name) ? boxed[name] : undefined;
};`,
  text: `const text = (value: unknown): string => value == null ? "" : typeof value === "object" ? (JSON.stringify(value) ?? "") : String(value);`,
  add: `const add = (a: unknown, b: unknown): string | number => typeof a === "string" || typeof b === "string" ? text(a) + text(b) : Number(a) + Number(b);`,
  compare: `const compare = (op: string, a: unknown, b: unknown): boolean => {
  if (!((typeof a === "number" && typeof b === "number") || (typeof a === "string" && typeof b === "string"))) return false;
  switch (op) { case "<": return (a as number) < (b as number); case "<=": return (a as number) <= (b as number); case ">": return (a as number) > (b as number); case ">=": return (a as number) >= (b as number); default: return false; }
};`,
} as const;

export const expressionRuntime = "\n" + Object.values(expressionHelpers).join("\n");

/** Compile only the parser's whitelisted AST, never arbitrary input as code. */
export function compileExpression(source: string): string {
  function emit(node: ExprNode): string {
    switch (node.k) {
      case "lit": return node.v === undefined ? "undefined" : JSON.stringify(node.v);
      case "id": return `read(scope, ${JSON.stringify(node.name)})`;
      case "mem": return `read(${emit(node.obj)}, ${emit(node.prop)})`;
      case "un": return node.op === "!" ? `(!${emit(node.arg)})` : `(-Number(${emit(node.arg)}))`;
      case "cond": return `(${emit(node.test)} ? ${emit(node.yes)} : ${emit(node.no)})`;
      case "bin": {
        const left = emit(node.l), right = emit(node.r);
        if (node.op === "+") return `add(${left}, ${right})`;
        if (["<", "<=", ">", ">="].includes(node.op)) return `compare(${JSON.stringify(node.op)}, ${left}, ${right})`;
        if (["-", "*", "/", "%"].includes(node.op)) return `(Number(${left}) ${node.op} Number(${right}))`;
        const op = node.op === "==" ? "===" : node.op === "!=" ? "!==" : node.op;
        return `(${left} ${op} ${right})`;
      }
    }
  }
  return emit(parseExpression(source));
}

const escapeTemplate = (raw: string) => raw.replace(/[\\`]/g, "\\$&").replace(/\$\{/g, "\\${");

/**
 * Compile a `{{ }}` template. One whole expression keeps its type; mixed text
 * becomes a template literal. An expression that doesn't parse becomes a call
 * to `fail`, which throws when the step runs, as the interpreter does.
 */
export function compileTemplate(template: string): string {
  const { expressions } = scanTemplate(template);
  const compile = (source: string) => {
    try { return compileExpression(source); }
    catch (e) { return `fail(${JSON.stringify(`{{${source}}}: ${(e as Error).message}`)})`; }
  };
  if (!expressions.length) return JSON.stringify(template);
  const [only] = expressions;
  if (expressions.length === 1 && !template.slice(0, only.start).trim() && !template.slice(only.end).trim()) {
    return compile(only.source);
  }
  let out = "`";
  let cursor = 0;
  for (const part of expressions) {
    out += escapeTemplate(template.slice(cursor, part.start)) + "${text(" + compile(part.source) + ")}";
    cursor = part.end;
  }
  return out + escapeTemplate(template.slice(cursor)) + "`";
}
