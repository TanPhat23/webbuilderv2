# Interactions Core Implementation Plan (Plan 1 of 3)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elements carry declarative interactions in `settings.interactions`. Makers author them in an Inspector "Interact" tab. They run on the editor canvas (with events on) and in Preview. A run log shows what happened. Agents can use a typed ops module, `describe()`, and a published JSON schema.

**Architecture:** A new `src/features/interactions/` feature. It has a pure core:

- the schema and validation;
- a safe expression evaluator;
- reference checks;
- a variable store;
- the interpreter.

The core is plugged into the DOM through a `Platform` port, and an `InteractionHost` delegates native events from one wrapper node. Interactions are stored on the element and edited only through `updateElement`, so the existing realtime sync, undo/redo `diffTrees` and delete paths carry them. **No Go change is needed in this plan.**

**Tech Stack:** TypeScript, React 19, zustand, zod ^4.3.6 (`z.toJSONSchema`), sonner, shadcn/ui (`command`, `popover`, `select`, `switch`, `tabs`), node:test + tsx.

**Spec:** `docs/superpowers/specs/2026-11-13-interactions-design.md`

**What this plan covers:** spec build steps 1–2 (§1 element interactions, §2 Interact tab and run log, §3 interpreter, §4 ops, `describe` and schema).

**Later plans:**

- **Plan 2:** the Page and Project `Logic` documents. This covers the Go columns, the `page:logic` and `project:logic` ops, and the Logic rail panel.
- **Plan 3:** codegen, migration of the old workflows, and removal of `features/eventworkflows`. The migration maps `onX` names to DOM names, maps `onScroll` to `visible` with `once: false`, and maps the `resetForm` action to the `reset` step.

Until Plan 2, no variables or flows are declared. So `set` and `run` steps validate and run, but they are skipped with "no variable/flow named …". The verb menu hides `set` and `run` while nothing is declared. The old workflow runtime (`useElementEvents`) keeps running side by side until Plan 3.

## Global Constraints

- Interaction ids match `^ix_[a-z0-9]{8}$` (`ix_` + 8 random base36 chars).
- Variable, flow and step-id names match `^[a-zA-Z_][a-zA-Z0-9_]{0,63}$`.
- The expression evaluator never uses `eval` or `new Function`. It blocks `__proto__`, `constructor` and `prototype`. Expressions are at most 2000 characters, with nesting at most 64.
- `run` recursion is limited to 16 (`MAX_FLOW_DEPTH`).
- `call` never throws. It stores `{ ok, status, data, error }`.
- Any other failing step stops its interaction and logs the step path.
- Dangling references (an element, variable or flow that doesn't exist) produce a warning badge in the editor. At runtime the step is skipped with a log entry.
- Every storage access is wrapped in try/catch and falls back to memory.
- Unit tests go in `tests/*.test.ts` and run with `bun run test:unit` (`node --import tsx --test tests/*.test.ts`). Integration tests run with `bun run test:integration`.
- Stage explicit paths only (`git add <file> …`, never `-A` or `.`). Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. Do not push.
- Do not run Playwright or any browser test that signs in through Clerk.
- Do not edit or commit anything in `~/Code/Go/*` in this plan.

## Review Focus

1. **Hostile expressions** must not run code or hang. Examples: `constructor.constructor('x')()`, `a['__proto__']`, 5,000 nested parentheses, a 10k-char string. The expected result is a validation or runtime error. Tested in Task 1.
2. **An element deleted after a step was pointed at it** must not break the interaction. The step is skipped with "element … is not on the page", later steps still run, and the editor shows a "missing element" warning. Tested in Tasks 3 and 6.
3. **A form `submit` interaction** must not reload the page, even when the maker never set `preventDefault`. Tested in Task 7.
4. **Storage blocked** (private mode, or a storage getter that throws) still leaves variables working in memory. Tested in Task 4.
5. **Two collaborators adding or removing different interactions on the same element** both keep their changes. Removal travels as `null` and undo restores it. Tested in Task 9 (wire patch) and Task 13 (real server).

---

## File Structure

```
src/features/interactions/
  schema.ts            types, verb schemas, validateInteractionMap, verbOf, constants
  references.ts        referenceWarnings (dangling element/variable/flow/step refs)
  ops.ts               pure ops: addInteraction/updateInteraction/removeInteraction, getInteractions
  ops-store.ts         commit(): applies an op to the element store via updateElement
  describe.ts          describe(pageId, tree, logic) for agents
  schema-json.ts       buildJsonSchema() → public/interactions.schema.json
  runtime/
    expression.ts      tokenizer, Pratt parser, evaluate, interpolate, templateErrors, templateRefs
    variables.ts       createVariableStore, safeStorage
    run.ts             runInteraction/runSteps, skip(), RunContext, RunLogEntry
    executors.ts       Platform port, createExecutors, browserPlatform, editorPlatform, elementScope
    dispatch.ts        indexInteractions, chainIds, enteredIds, plan
    run-log-store.ts   zustand run log (last 200)
  editing/
    steps-edit.ts      path-based immutable step edits, stepIdsBefore, defaultStep, summarize
    fields.ts          per-verb field definitions, labels, headers text <-> record
    suggest.ts         {{ autocomplete suggestions
    pick-store.ts      pick-from-canvas mode
  components/
    InteractionHost.tsx   native event delegation + RunLogPanel portal
    RunLogPanel.tsx
    InteractTab.tsx       Inspector tab
    InteractionCard.tsx
    StepList.tsx          recursive list + StepRow
    StepForm.tsx
    VerbMenu.tsx
    ExpressionInput.tsx
    ElementRefInput.tsx
scripts/interactions-schema.ts
public/interactions.schema.json
```

Files modified:

- `src/features/editor/components/sidebar/Inspector.tsx`: add the Interact tab.
- `src/features/editor/components/ElementLoader.tsx`: wrap the canvas list in `InteractionHost`.
- `src/features/editor/components/canvas/CanvasInteractionLayer.tsx`: pick-mode click capture.
- `src/features/editor/components/resizehandler/ElementLabel.tsx`: ⚡ marker.
- `src/app/preview/$id.tsx`: wrap the preview in `InteractionHost`.
- `src/features/preview/components/Preview*Component.tsx` (13 files): add `id` and `data-element-id`.
- `package.json`: add the `interactions:schema` script.
- `tests/integration/realtime-server.itest.ts`: one new test.

---

### Task 1: Expression evaluator

**Files:**
- Create: `src/features/interactions/runtime/expression.ts`
- Test: `tests/interactions-expression.test.ts`

**Interfaces:**
- Produces:
  - `parseExpression(src: string): ExprNode` (throws `ExpressionError`)
  - `evaluate(src: string, scope: Scope): unknown`
  - `interpolate(template: string, scope: Scope): unknown`
  - `templateErrors(template: string): string[]`
  - `templateRefs(template: string): string[][]`
  - `toText(v: unknown): string`
  - `class ExpressionError extends Error { offset: number }`
  - `type Scope = Record<string, unknown>`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-expression.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  evaluate,
  interpolate,
  parseExpression,
  templateErrors,
  templateRefs,
  ExpressionError,
} from "../src/features/interactions/runtime/expression";

const scope = {
  vars: { count: 2, user: { name: "Ada", tags: ["a", "b"] }, empty: "" },
  steps: { signup: { ok: true, status: 201, data: { id: 7 } } },
  event: { value: "hi" },
};

test("literals, property access and arithmetic", () => {
  assert.equal(evaluate("1 + 2 * 3", scope), 7);
  assert.equal(evaluate("(1 + 2) * 3", scope), 9);
  assert.equal(evaluate("vars.count % 2", scope), 0);
  assert.equal(evaluate("vars.user.name", scope), "Ada");
  assert.equal(evaluate("vars.user.tags[1]", scope), "b");
  assert.equal(evaluate("vars.user['name']", scope), "Ada");
  assert.equal(evaluate("vars.user.tags.length", scope), 2);
  assert.equal(evaluate("'a' + vars.count", scope), "a2");
  assert.equal(evaluate("-vars.count", scope), -2);
});

test("comparison, logic and ternary", () => {
  assert.equal(evaluate("steps.signup.ok && steps.signup.status == 201", scope), true);
  assert.equal(evaluate("vars.empty || 'fallback'", scope), "fallback");
  assert.equal(evaluate("!steps.signup.ok", scope), false);
  assert.equal(evaluate("vars.count > 1 ? 'many' : 'one'", scope), "many");
  assert.equal(evaluate("vars.count >= 3 ? 'a' : vars.count == 2 ? 'b' : 'c'", scope), "b");
  assert.equal(evaluate("vars.count === 2", scope), true);
  assert.equal(evaluate("'2' == 2", scope), false, "equality is strict");
  assert.equal(evaluate("'b' < 'c'", scope), true);
  assert.equal(evaluate("1 < 'c'", scope), false, "mixed types never compare true");
});

test("missing paths are undefined, never throw", () => {
  assert.equal(evaluate("vars.nope.deeper", scope), undefined);
  assert.equal(evaluate("nothing", scope), undefined);
  assert.equal(evaluate("vars.user.toString", scope), undefined, "no prototype members");
});

test("interpolate keeps the type of a whole expression and stringifies mixed text", () => {
  assert.deepEqual(interpolate("{{ steps.signup.data }}", scope), { id: 7 });
  assert.equal(interpolate("  {{ vars.count }} ", scope), 2);
  assert.equal(interpolate("Hi {{ vars.user.name }}, you have {{ vars.count }}", scope), "Hi Ada, you have 2");
  assert.equal(interpolate("{{ vars.user }}!", scope), '{"name":"Ada","tags":["a","b"]}!');
  assert.equal(interpolate("{{ a }} and {{ b }}", {}), " and ");
  assert.equal(interpolate("no braces", scope), "no braces");
});

test("hostile input is rejected, not executed", () => {
  assert.throws(() => parseExpression("constructor.constructor('x')()"), ExpressionError);
  assert.throws(() => parseExpression("vars.__proto__"), ExpressionError);
  assert.throws(() => parseExpression("vars['constructor']"), ExpressionError);
  assert.throws(() => parseExpression("vars.prototype"), ExpressionError);
  assert.throws(() => parseExpression("alert(1)"), /function calls are not supported/);
  assert.throws(() => parseExpression("x = 1"), ExpressionError);
  assert.throws(() => parseExpression("(".repeat(5000) + "1" + ")".repeat(5000)), ExpressionError);
  assert.throws(() => parseExpression("'" + "a".repeat(10_000) + "'"), /longer than 2000/);
  // A computed key that only resolves to a blocked name at runtime is undefined.
  assert.equal(evaluate("vars[event.value]", { vars: {}, event: { value: "__proto__" } }), undefined);
});

test("syntax errors carry a readable message", () => {
  assert.throws(() => parseExpression("1 +"), /unexpected end of expression/);
  assert.throws(() => parseExpression("'open"), /unterminated string/);
  assert.throws(() => parseExpression("a ? b"), /expected ":"/);
  assert.throws(() => parseExpression("a b"), /unexpected "b"/);
});

test("templateErrors reports each bad expression and unclosed braces", () => {
  assert.deepEqual(templateErrors("fine {{ a.b }}"), []);
  assert.equal(templateErrors("{{ 1 + }}").length, 1);
  assert.match(templateErrors("hello {{ vars.")[0], /unclosed \{\{/);
  assert.equal(templateErrors("{{}}").length, 1);
});

test("templateRefs lists member chains rooted at identifiers", () => {
  assert.deepEqual(
    templateRefs("{{ steps.signup.ok && vars.user.tags[0] }} {{ el.abc.value }}"),
    [["steps", "signup", "ok"], ["vars", "user", "tags", "0"], ["el", "abc", "value"]],
  );
  assert.deepEqual(templateRefs("{{ vars[event.value] }}"), [["vars"], ["event", "value"]]);
  assert.deepEqual(templateRefs("{{ broken + }}"), []);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-expression.test.ts`
Expected: FAIL. The tests can't resolve `../src/features/interactions/runtime/expression`.

- [ ] **Step 3: Implement**

```ts
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
    return postfix(primary(depth + 1), depth + 1);
  };

  const expr = (minPrec: number, depth: number): ExprNode => {
    guard(depth);
    let left = unary(depth + 1);
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

const WHOLE = /^\s*\{\{([\s\S]*?)\}\}\s*$/;
const ANY = /\{\{([\s\S]*?)\}\}/g;

/**
 * Fills a template. A template that is exactly one `{{ expr }}` returns the
 * value with its type (an object stays an object); mixed text returns a string.
 */
export function interpolate(template: string, scope: Scope): unknown {
  const whole = WHOLE.exec(template);
  if (whole && !whole[1].includes("{{") && !whole[1].includes("}}")) {
    return evaluate(whole[1], scope);
  }
  if (!template.includes("{{")) return template;
  return template.replace(ANY, (_m, src: string) => toText(evaluate(src, scope)));
}

export function templateErrors(template: string): string[] {
  const out: string[] = [];
  for (const m of template.matchAll(ANY)) {
    try {
      parseExpression(m[1]);
    } catch (e) {
      out.push(`{{${m[1]}}}: ${(e as Error).message}`);
    }
  }
  if (template.replace(ANY, "").includes("{{")) out.push("unclosed {{");
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
  for (const m of template.matchAll(ANY)) {
    try {
      walk(parseExpression(m[1]));
    } catch {
      // Syntax errors are reported by templateErrors.
    }
  }
  return out;
}
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-expression.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/runtime/expression.ts tests/interactions-expression.test.ts
git commit -m "feat(interactions): safe {{ }} expression evaluator

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Schema and validation

**Files:**
- Create: `src/features/interactions/schema.ts`
- Test: `tests/interactions-schema.test.ts`

**Interfaces:**
- Consumes: `templateErrors` (Task 1).
- Produces:
  - Constants: `ON_EVENTS` (16 events), `KEY_EVENTS`, `type OnEvent`, `VERBS`, `type Verb`, `VERB_SCHEMAS`, `InteractionHead`, `NAME_RE`, `IX_ID_RE`, `TOAST_KINDS`, `ANIMATION_PRESETS`, `HTTP_METHODS`.
  - Step types: `type Step`, `type IfStep`, `type CallStep`.
  - `interface Interaction { on; enabled?; preventDefault?; stopPropagation?; key?; once?; do: Step[] }`
  - `type InteractionMap = Record<string, Interaction>`
  - `interface Issue { path: string; message: string; level: "error" | "incomplete" | "warning" }`
  - `verbOf(step: unknown): Verb | null`
  - `validateInteractionMap(value: unknown, at?: string): Issue[]`
  - `isPlainObject(v): v is Record<string, unknown>`
  - `ELEMENT_FIELDS: Partial<Record<Verb, string[]>>`
  - `TEMPLATE_FIELDS: Record<Verb, string[]>`

**Issue levels:**

- `error`: wrong types, unknown keys, not exactly one verb, a bad id. It always blocks a write.
- `incomplete`: a required value is missing or empty, or a template has a syntax error. This is normal while a maker is typing. The UI may save it; agents get it as an error.
- `warning`: from `references.ts` (Task 3). It never blocks.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-schema.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  validateInteractionMap,
  verbOf,
  VERBS,
} from "../src/features/interactions/schema";

const ok = (map: unknown) => assert.deepEqual(validateInteractionMap(map), []);

test("the spec example is valid", () => {
  ok({
    ix_7f2ab9cd: {
      on: "submit",
      enabled: true,
      do: [
        { id: "signup", call: "api", method: "POST", url: "/api/signup", body: "{{ form }}" },
        {
          if: "{{ steps.signup.ok }}",
          then: [{ toast: "Welcome!", kind: "success" }, { set: "user", to: "{{ steps.signup.data }}" }],
          else: [{ run: "showError" }],
        },
      ],
    },
  });
});

test("every verb has a schema and a valid minimal step", () => {
  const minimal: Record<string, unknown> = {
    navigate: { navigate: "/x" }, show: { show: "e1" }, hide: { hide: "e1" },
    toggle: { toggle: "e1" }, scroll: { scroll: 120 }, modal: { modal: "open" },
    toast: { toast: "hi" }, copy: { copy: "x" }, download: { download: "/f.pdf" },
    animate: { animate: "e1", preset: "bounce" }, class: { class: "toggle", target: "e1", name: "open" },
    set: { set: "user", to: "1" }, call: { call: "api", method: "GET", url: "/a" },
    submit: { submit: "f1" }, reset: { reset: "f1" }, wait: { wait: 10 }, if: { if: "{{ true }}", then: [] },
    run: { run: "flowA" }, code: { code: "return 1" },
  };
  assert.deepEqual([...VERBS].sort(), Object.keys(minimal).sort());
  for (const [verb, step] of Object.entries(minimal)) {
    assert.equal(verbOf(step), verb);
    ok({ ix_aaaaaaaa: { on: "click", do: [step] } });
  }
});

test("path-addressed errors with levels", () => {
  const issues = validateInteractionMap({
    ix_aaaaaaaa: {
      on: "click",
      do: [
        { call: "api", method: "POST" },                  // url missing → incomplete
        { toast: 5 },                                     // wrong type → error
        { toast: "x", show: "e1" },                       // two verbs → error
        { nope: true },                                   // no verb → error
        { if: "{{ a }}", then: [{ navigate: "" }] },      // nested empty → incomplete
        { toast: "Hi {{ vars. }}" },                      // template syntax → incomplete
        { wait: 10, extra: 1 },                           // unknown key → error
      ],
    },
  });
  const byPath = Object.fromEntries(issues.map((i) => [i.path, i]));
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[0].url"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[0].url"].message, "required");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[1].toast"].level, "error");
  assert.match(byPath["interactions.ix_aaaaaaaa.do[2]"].message, /more than one action: show, toast|more than one action: toast, show/);
  assert.match(byPath["interactions.ix_aaaaaaaa.do[3]"].message, /needs one action/);
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[4].then[0].navigate"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[5].toast"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[6]"].level, "error");
});

test("interaction-level checks", () => {
  const issues = validateInteractionMap({
    bad_id: { on: "click", do: [] },
    ix_bbbbbbbb: { on: "hover", do: [] },
    ix_cccccccc: { on: "click" },
  });
  const paths = issues.map((i) => i.path);
  assert.ok(paths.includes("interactions.bad_id"));
  assert.ok(paths.includes("interactions.ix_bbbbbbbb.on"));
  assert.ok(paths.includes("interactions.ix_cccccccc.do"));
  assert.deepEqual(validateInteractionMap(undefined), []);
  assert.equal(validateInteractionMap([])[0].path, "interactions");
});

test("key belongs to key events and once belongs to visible", () => {
  ok({
    ix_aaaaaaaa: { on: "keydown", key: "Enter", do: [] },
    ix_bbbbbbbb: { on: "visible", once: false, do: [] },
    ix_cccccccc: { on: "mousedown", do: [] },
    ix_dddddddd: { on: "error", do: [] },
  });
  const paths = validateInteractionMap({
    ix_aaaaaaaa: { on: "click", key: "Enter", do: [] },
    ix_bbbbbbbb: { on: "click", once: true, do: [] },
    ix_cccccccc: { on: "keyup", key: "", do: [] },
  }).map((i) => `${i.path}|${i.level}`);
  assert.ok(paths.includes("interactions.ix_aaaaaaaa.key|error"));
  assert.ok(paths.includes("interactions.ix_bbbbbbbb.once|error"));
  assert.ok(paths.includes("interactions.ix_cccccccc.key|incomplete"));
});

test("deep nesting is bounded", () => {
  let steps: any[] = [{ toast: "x" }];
  for (let i = 0; i < 40; i++) steps = [{ if: "{{ true }}", then: steps }];
  const issues = validateInteractionMap({ ix_aaaaaaaa: { on: "click", do: steps } });
  assert.ok(issues.some((i) => /nested too deeply/.test(i.message)));
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-schema.test.ts`
Expected: FAIL. The tests can't resolve `../src/features/interactions/schema`.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/schema.ts
/**
 * The interaction format: what an element does when an event fires.
 *
 * Stored in `element.settings.interactions`, keyed by interaction id, so the
 * realtime server's per-key deep merge lets collaborators edit different
 * interactions on one element without overwriting each other.
 *
 * A step is an object with exactly one verb key. Validation is hand-routed
 * (find the verb, then check that verb's schema) so every issue carries a
 * precise path such as `interactions.ix_1.do[2].url`.
 */
import { z } from "zod";
import { templateErrors } from "./runtime/expression";

export const ON_EVENTS = [
  "click", "dblclick", "mousedown", "mouseup", "mouseenter", "mouseleave",
  "focus", "blur", "change", "input", "submit", "keydown", "keyup",
  "load", "error", "visible",
] as const;

/** Events whose interactions may filter on `key`. */
export const KEY_EVENTS: ReadonlySet<string> = new Set(["keydown", "keyup"]);
export type OnEvent = (typeof ON_EVENTS)[number];

export const NAME_RE = /^[a-zA-Z_][a-zA-Z0-9_]{0,63}$/;
export const IX_ID_RE = /^ix_[a-z0-9]{8}$/;
export const TOAST_KINDS = ["success", "error", "info", "warning"] as const;
export const ANIMATION_PRESETS = ["fadeIn", "slideIn", "bounce", "pulse", "shake", "spin"] as const;
export const HTTP_METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

type WithId = { id?: string };
export type IfStep = WithId & { if: string; then: Step[]; else?: Step[] };
export type CallStep = WithId & {
  call: "api";
  method: (typeof HTTP_METHODS)[number];
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
};
export type Step = WithId &
  (
    | { navigate: string; newTab?: boolean; replace?: boolean }
    | { show: string; duration?: number }
    | { hide: string; duration?: number }
    | { toggle: string; duration?: number }
    | { scroll: string | number; smooth?: boolean; offset?: number }
    | { modal: "open" | "close"; target?: string }
    | { toast: string; kind?: (typeof TOAST_KINDS)[number]; duration?: number }
    | { copy: string }
    | { download: string; filename?: string }
    | { animate: string; preset: (typeof ANIMATION_PRESETS)[number]; duration?: number }
    | { class: "add" | "remove" | "toggle"; target: string; name: string }
    | { set: string; to: string }
    | Omit<CallStep, "id">
    | { submit: string }
    | { reset: string }
    | { wait: number }
    | Omit<IfStep, "id">
    | { run: string }
    | { code: string }
  );

export interface Interaction {
  on: OnEvent;
  enabled?: boolean;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  /** keydown/keyup only: run just for this KeyboardEvent.key (case-insensitive). */
  key?: string;
  /** visible only: run the first time only (default true). */
  once?: boolean;
  do: Step[];
}
export type InteractionMap = Record<string, Interaction>;

export interface Issue {
  path: string;
  message: string;
  level: "error" | "incomplete" | "warning";
}

const stepId = z.string().regex(NAME_RE, "must be a name like signup or step_2").optional();
const elementRef = z.string().min(1);
const nonEmpty = z.string().min(1);
const duration = z.number().nonnegative().optional();

export const VERB_SCHEMAS = {
  navigate: z.strictObject({ id: stepId, navigate: nonEmpty, newTab: z.boolean().optional(), replace: z.boolean().optional() }),
  show: z.strictObject({ id: stepId, show: elementRef, duration }),
  hide: z.strictObject({ id: stepId, hide: elementRef, duration }),
  toggle: z.strictObject({ id: stepId, toggle: elementRef, duration }),
  scroll: z.strictObject({ id: stepId, scroll: z.union([elementRef, z.number()]), smooth: z.boolean().optional(), offset: z.number().optional() }),
  modal: z.strictObject({ id: stepId, modal: z.enum(["open", "close"]), target: elementRef.optional() }),
  toast: z.strictObject({ id: stepId, toast: nonEmpty, kind: z.enum(TOAST_KINDS).optional(), duration: z.number().positive().optional() }),
  copy: z.strictObject({ id: stepId, copy: nonEmpty }),
  download: z.strictObject({ id: stepId, download: nonEmpty, filename: z.string().optional() }),
  animate: z.strictObject({ id: stepId, animate: elementRef, preset: z.enum(ANIMATION_PRESETS), duration: z.number().positive().optional() }),
  class: z.strictObject({
    id: stepId,
    class: z.enum(["add", "remove", "toggle"]),
    target: elementRef,
    name: z.string().regex(/^[A-Za-z0-9_:\-/[\].%]+$/, "one class name, no spaces"),
  }),
  set: z.strictObject({ id: stepId, set: z.string().regex(NAME_RE, "must be a variable name"), to: z.string() }),
  call: z.strictObject({
    id: stepId,
    call: z.literal("api"),
    method: z.enum(HTTP_METHODS),
    url: nonEmpty,
    headers: z.record(z.string(), z.string()).optional(),
    body: z.string().optional(),
    timeout: z.number().positive().max(60_000).optional(),
  }),
  submit: z.strictObject({ id: stepId, submit: elementRef }),
  reset: z.strictObject({ id: stepId, reset: elementRef }),
  wait: z.strictObject({ id: stepId, wait: z.number().nonnegative().max(60_000) }),
  if: z.strictObject({ id: stepId, if: nonEmpty, then: z.array(z.unknown()), else: z.array(z.unknown()).optional() }),
  run: z.strictObject({ id: stepId, run: z.string().regex(NAME_RE, "must be a flow name") }),
  code: z.strictObject({ id: stepId, code: nonEmpty }),
} as const;

export type Verb = keyof typeof VERB_SCHEMAS;
export const VERBS = Object.keys(VERB_SCHEMAS) as Verb[];
const VERB_SET = new Set<string>(VERBS);

/** Fields that hold element ids (checked against the page in references.ts). */
export const ELEMENT_FIELDS: Partial<Record<Verb, string[]>> = {
  show: ["show"], hide: ["hide"], toggle: ["toggle"], scroll: ["scroll"],
  modal: ["target"], animate: ["animate"], class: ["target"], submit: ["submit"],
  reset: ["reset"],
};

/** Fields that may contain `{{ }}` templates. */
export const TEMPLATE_FIELDS: Record<Verb, string[]> = {
  navigate: ["navigate"], show: [], hide: [], toggle: [], scroll: [], modal: [],
  toast: ["toast"], copy: ["copy"], download: ["download", "filename"],
  animate: [], class: [], set: ["to"], call: ["url", "body"], submit: [],
  reset: [], wait: [], if: ["if"], run: [], code: [],
};

export const InteractionHead = z.strictObject({
  on: z.enum(ON_EVENTS),
  enabled: z.boolean().optional(),
  preventDefault: z.boolean().optional(),
  stopPropagation: z.boolean().optional(),
  key: z.string().min(1).optional(),
  once: z.boolean().optional(),
  do: z.array(z.unknown()),
});

export function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function verbOf(step: unknown): Verb | null {
  if (!isPlainObject(step)) return null;
  const verbs = Object.keys(step).filter((k) => VERB_SET.has(k));
  return verbs.length === 1 ? (verbs[0] as Verb) : null;
}

function joinPath(base: string, segs: readonly PropertyKey[]): string {
  return segs.reduce<string>(
    (acc, s) => (typeof s === "number" ? `${acc}[${s}]` : `${acc}.${String(s)}`),
    base,
  );
}

function zodIssues(
  schema: z.ZodType,
  value: unknown,
  path: string,
  out: Issue[],
) {
  const r = schema.safeParse(value, { reportInput: true });
  if (r.success) return;
  for (const issue of r.error.issues) {
    const input = (issue as { input?: unknown }).input;
    const missing = input === undefined || input === "";
    out.push({
      path: joinPath(path, issue.path),
      message: missing ? "required" : issue.message,
      level: missing ? "incomplete" : "error",
    });
  }
}

const MAX_NESTING = 32;

function validateSteps(value: unknown, path: string, out: Issue[], depth: number) {
  if (!Array.isArray(value)) {
    out.push({ path, message: "must be a list of steps", level: "error" });
    return;
  }
  if (depth > MAX_NESTING) {
    out.push({ path, message: "steps nested too deeply", level: "error" });
    return;
  }
  value.forEach((step, i) => validateStep(step, `${path}[${i}]`, out, depth));
}

function validateStep(step: unknown, path: string, out: Issue[], depth: number) {
  if (!isPlainObject(step)) {
    out.push({ path, message: "must be a step object", level: "error" });
    return;
  }
  const verbs = Object.keys(step).filter((k) => VERB_SET.has(k));
  if (verbs.length !== 1) {
    out.push({
      path,
      message: verbs.length
        ? `has more than one action: ${verbs.join(", ")}`
        : `needs one action: ${VERBS.join(", ")}`,
      level: "error",
    });
    return;
  }
  const verb = verbs[0] as Verb;
  zodIssues(VERB_SCHEMAS[verb], step, path, out);
  for (const field of TEMPLATE_FIELDS[verb]) {
    const v = step[field];
    if (typeof v !== "string") continue;
    for (const message of templateErrors(v)) {
      out.push({ path: `${path}.${field}`, message, level: "incomplete" });
    }
  }
  if (verb === "call" && isPlainObject(step.headers)) {
    for (const [k, v] of Object.entries(step.headers)) {
      if (typeof v !== "string") continue;
      for (const message of templateErrors(v)) {
        out.push({ path: `${path}.headers.${k}`, message, level: "incomplete" });
      }
    }
  }
  if (verb === "if") {
    validateSteps(step.then, `${path}.then`, out, depth + 1);
    if (step.else !== undefined) validateSteps(step.else, `${path}.else`, out, depth + 1);
  }
}

/** Every structural and syntax issue in an interactions map. */
export function validateInteractionMap(value: unknown, at = "interactions"): Issue[] {
  if (value === undefined) return [];
  const out: Issue[] = [];
  if (!isPlainObject(value)) {
    out.push({ path: at, message: "must be an object keyed by interaction id", level: "error" });
    return out;
  }
  for (const [ixId, ix] of Object.entries(value)) {
    const path = `${at}.${ixId}`;
    if (!IX_ID_RE.test(ixId)) {
      out.push({ path, message: "interaction ids look like ix_ab12cd34", level: "error" });
    }
    if (!isPlainObject(ix)) {
      out.push({ path, message: "must be an interaction object", level: "error" });
      continue;
    }
    zodIssues(InteractionHead, ix, path, out);
    if (ix.key !== undefined && !KEY_EVENTS.has(String(ix.on))) {
      out.push({ path: `${path}.key`, message: "key only applies to keydown and keyup", level: "error" });
    }
    if (ix.once !== undefined && ix.on !== "visible") {
      out.push({ path: `${path}.once`, message: "once only applies to visible", level: "error" });
    }
    if (Array.isArray(ix.do)) validateSteps(ix.do, `${path}.do`, out, 0);
  }
  return out;
}
```

If `reportInput` turns out not to exist in the installed zod (it does in 4.x), the tests will fail on `level`. In that case, read the value at `issue.path` from `value` yourself to decide "missing".

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-schema.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/schema.ts tests/interactions-schema.test.ts
git commit -m "feat(interactions): interaction format and path-addressed validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Reference warnings

**Files:**
- Create: `src/features/interactions/references.ts`
- Test: `tests/interactions-references.test.ts`

**Interfaces:**
- Consumes: `InteractionMap`, `Issue`, `verbOf`, `ELEMENT_FIELDS`, `TEMPLATE_FIELDS` and `isPlainObject` (Task 2); `templateRefs` (Task 1).
- Produces:
  - `interface RefContext { elementIds: ReadonlySet<string>; variables: ReadonlySet<string>; flows: ReadonlySet<string> }`
  - `referenceWarnings(map: InteractionMap, ctx: RefContext, at?: string): Issue[]` (every issue has level `"warning"`)

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-references.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { referenceWarnings } from "../src/features/interactions/references";

const ctx = {
  elementIds: new Set(["btn", "modal1"]),
  variables: new Set(["user"]),
  flows: new Set(["showError"]),
};

test("no warnings when everything resolves", () => {
  const w = referenceWarnings(
    {
      ix_aaaaaaaa: {
        on: "click",
        do: [
          { id: "r", call: "api", method: "GET", url: "/a" },
          { if: "{{ steps.r.ok && vars.user }}", then: [{ show: "modal1" }], else: [{ run: "showError" }] },
          { set: "user", to: "{{ el.btn.value }}" },
        ],
      },
    },
    ctx,
  );
  assert.deepEqual(w, []);
});

test("a deleted element, unknown variable, flow or step id are warnings with paths", () => {
  const w = referenceWarnings(
    {
      ix_aaaaaaaa: {
        on: "click",
        do: [
          { show: "gone" },
          { set: "nope", to: "1" },
          { run: "missingFlow" },
          { toast: "{{ steps.later.data }} {{ vars.ghost }} {{ el.gone2.value }}" },
          { id: "later", call: "api", method: "GET", url: "/x" },
        ],
      },
    },
    ctx,
  );
  const msgs = Object.fromEntries(w.map((i) => [i.path + "|" + i.message, i.level]));
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[0].show|missing element gone"]);
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[1].set|no variable named nope"]);
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[2].run|no flow named missingFlow"]);
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[3].toast|no earlier step with id later"]);
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[3].toast|no variable named ghost"]);
  assert.ok(msgs["interactions.ix_aaaaaaaa.do[3].toast|missing element gone2"]);
  assert.ok(w.every((i) => i.level === "warning"));
});

test("scroll to a number is not an element reference", () => {
  assert.deepEqual(
    referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [{ scroll: 300 }] } }, ctx),
    [],
  );
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-references.test.ts`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/references.ts
/**
 * Warnings for references that don't resolve: an element that was deleted,
 * a variable or flow that isn't declared, or `steps.x` read before step x
 * runs. These never block a save; the editor shows them as badges and the
 * runtime skips the step.
 */
import {
  ELEMENT_FIELDS,
  TEMPLATE_FIELDS,
  isPlainObject,
  verbOf,
  type InteractionMap,
  type Issue,
  type Step,
} from "./schema";
import { templateRefs } from "./runtime/expression";

export interface RefContext {
  elementIds: ReadonlySet<string>;
  variables: ReadonlySet<string>;
  flows: ReadonlySet<string>;
}

export function referenceWarnings(
  map: InteractionMap,
  ctx: RefContext,
  at = "interactions",
): Issue[] {
  const out: Issue[] = [];
  const warn = (path: string, message: string) =>
    out.push({ path, message, level: "warning" });

  const checkTemplate = (text: string, path: string, seen: Set<string>) => {
    for (const [root, name] of templateRefs(text)) {
      if (!name) continue;
      if (root === "vars" && !ctx.variables.has(name)) warn(path, `no variable named ${name}`);
      if (root === "el" && !ctx.elementIds.has(name)) warn(path, `missing element ${name}`);
      if (root === "steps" && !seen.has(name)) warn(path, `no earlier step with id ${name}`);
    }
  };

  const walk = (steps: unknown, path: string, seen: Set<string>) => {
    if (!Array.isArray(steps)) return;
    steps.forEach((raw, i) => {
      const verb = verbOf(raw);
      if (!verb || !isPlainObject(raw)) return;
      const step = raw as Step & Record<string, unknown>;
      const p = `${path}[${i}]`;
      for (const field of ELEMENT_FIELDS[verb] ?? []) {
        const v = step[field];
        if (typeof v === "string" && v && !ctx.elementIds.has(v)) {
          warn(`${p}.${field}`, `missing element ${v}`);
        }
      }
      if (verb === "set" && typeof step.set === "string" && !ctx.variables.has(step.set)) {
        warn(`${p}.set`, `no variable named ${step.set}`);
      }
      if (verb === "run" && typeof step.run === "string" && !ctx.flows.has(step.run)) {
        warn(`${p}.run`, `no flow named ${step.run}`);
      }
      for (const field of TEMPLATE_FIELDS[verb]) {
        const v = step[field];
        if (typeof v === "string") checkTemplate(v, `${p}.${field}`, seen);
      }
      if (verb === "if") {
        walk(step.then, `${p}.then`, seen);
        walk(step.else, `${p}.else`, seen);
      }
      if (typeof step.id === "string") seen.add(step.id);
    });
  };

  for (const [ixId, ix] of Object.entries(map)) {
    if (isPlainObject(ix)) walk(ix.do, `${at}.${ixId}.do`, new Set());
  }
  return out;
}
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-references.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/references.ts tests/interactions-references.test.ts
git commit -m "feat(interactions): warnings for dangling element, variable, flow and step references

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Variable store

**Files:**
- Create: `src/features/interactions/runtime/variables.ts`
- Test: `tests/interactions-variables.test.ts`

**Interfaces:**
- Produces:
  - `type Lifetime = "page" | "session" | "local"`
  - `interface VariableDef { type: "string" | "number" | "boolean" | "object" | "list"; default: unknown; lifetime?: Lifetime }`
  - `interface StorageLike { getItem(k: string): string | null; setItem(k: string, v: string): void }`
  - `interface VariableStore { has(n): boolean; get(n): unknown; set(n, v): boolean; snapshot(): Record<string, unknown>; subscribe(fn: () => void): () => void }`
  - `createVariableStore(defs: Record<string, VariableDef>, opts: { namespace: string; session?: StorageLike | null; local?: StorageLike | null }): VariableStore`
  - `safeStorage(get: () => StorageLike): StorageLike | null`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-variables.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createVariableStore, safeStorage } from "../src/features/interactions/runtime/variables";

const memStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

const defs = {
  step: { type: "number" as const, default: 0, lifetime: "page" as const },
  user: { type: "object" as const, default: null, lifetime: "session" as const },
  theme: { type: "string" as const, default: "light", lifetime: "local" as const },
};

test("defaults, set and snapshot; undeclared names are refused", () => {
  const s = createVariableStore(defs, { namespace: "p1" });
  assert.deepEqual(s.snapshot(), { step: 0, user: null, theme: "light" });
  assert.equal(s.set("step", 2), true);
  assert.equal(s.get("step"), 2);
  assert.equal(s.set("ghost", 1), false);
  assert.equal(s.has("ghost"), false);
});

test("session and local lifetimes persist under a namespaced key; page does not", () => {
  const session = memStorage();
  const local = memStorage();
  const a = createVariableStore(defs, { namespace: "proj1", session, local });
  a.set("user", { id: 1 });
  a.set("theme", "dark");
  a.set("step", 5);
  assert.equal(session.m.get("wb:proj1:user"), '{"id":1}');
  assert.equal(local.m.get("wb:proj1:theme"), '"dark"');
  assert.equal([...session.m.keys(), ...local.m.keys()].some((k) => k.endsWith(":step")), false);

  const b = createVariableStore(defs, { namespace: "proj1", session, local });
  assert.deepEqual(b.get("user"), { id: 1 });
  assert.equal(b.get("theme"), "dark");
  assert.equal(b.get("step"), 0, "page lifetime resets");
});

test("defaults are copied, not shared", () => {
  const d = { list: { type: "list" as const, default: [1] } };
  const a = createVariableStore(d, { namespace: "x" });
  (a.get("list") as number[]).push(2);
  const b = createVariableStore(d, { namespace: "x" });
  assert.deepEqual(b.get("list"), [1]);
});

test("blocked or broken storage falls back to memory", () => {
  const throwing = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceeded"); } };
  const s = createVariableStore(defs, { namespace: "p", session: throwing, local: throwing });
  assert.equal(s.get("theme"), "light");
  assert.equal(s.set("theme", "dark"), true);
  assert.equal(s.get("theme"), "dark");

  assert.equal(safeStorage(() => { throw new Error("denied"); }), null);
  assert.equal(safeStorage(() => throwing), null);
  const corrupt = memStorage();
  corrupt.m.set("wb:p:theme", "{not json");
  assert.equal(createVariableStore(defs, { namespace: "p", local: corrupt }).get("theme"), "light");
});

test("subscribers hear about changes", () => {
  const s = createVariableStore(defs, { namespace: "p" });
  let calls = 0;
  const off = s.subscribe(() => calls++);
  s.set("step", 1);
  off();
  s.set("step", 2);
  assert.equal(calls, 1);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-variables.test.ts`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/runtime/variables.ts
/**
 * Runtime values of declared variables. A variable's lifetime decides where
 * it lives: `page` in memory (reset on load), `session` in sessionStorage,
 * `local` in localStorage. Storage can be missing or throw (private mode,
 * blocked site data), so every access falls back to memory.
 */
export type Lifetime = "page" | "session" | "local";

export interface VariableDef {
  type: "string" | "number" | "boolean" | "object" | "list";
  default: unknown;
  lifetime?: Lifetime;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface VariableStore {
  has(name: string): boolean;
  get(name: string): unknown;
  set(name: string, value: unknown): boolean;
  snapshot(): Record<string, unknown>;
  subscribe(fn: () => void): () => void;
}

/** Returns the storage if it can be read, else null. */
export function safeStorage(get: () => StorageLike): StorageLike | null {
  try {
    const s = get();
    s.getItem("wb:probe");
    return s;
  } catch {
    return null;
  }
}

const copy = (v: unknown): unknown =>
  v === undefined ? null : JSON.parse(JSON.stringify(v));

export function createVariableStore(
  defs: Record<string, VariableDef>,
  opts: { namespace: string; session?: StorageLike | null; local?: StorageLike | null },
): VariableStore {
  const values = new Map<string, unknown>();
  const listeners = new Set<() => void>();
  const declared = (name: string) => Object.hasOwn(defs, name);
  const key = (name: string) => `wb:${opts.namespace}:${name}`;
  const storageFor = (name: string): StorageLike | null | undefined => {
    const lifetime = defs[name]?.lifetime ?? "page";
    if (lifetime === "session") return opts.session;
    if (lifetime === "local") return opts.local;
    return null;
  };

  for (const [name, def] of Object.entries(defs)) {
    let value = copy(def.default);
    const storage = storageFor(name);
    if (storage) {
      try {
        const raw = storage.getItem(key(name));
        if (raw !== null) value = JSON.parse(raw);
      } catch {
        // Unreadable or corrupt: keep the default.
      }
    }
    values.set(name, value);
  }

  return {
    has: declared,
    get: (name) => values.get(name),
    set(name, value) {
      if (!declared(name)) return false;
      values.set(name, value);
      const storage = storageFor(name);
      if (storage) {
        try {
          storage.setItem(key(name), JSON.stringify(value));
        } catch {
          // Quota or blocked: the value still lives in memory.
        }
      }
      for (const fn of listeners) fn();
      return true;
    },
    snapshot: () => Object.fromEntries(values),
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-variables.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/runtime/variables.ts tests/interactions-variables.test.ts
git commit -m "feat(interactions): variable store with page/session/local lifetimes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Interpreter

**Files:**
- Create: `src/features/interactions/runtime/run.ts`
- Test: `tests/interactions-run.test.ts`

**Interfaces:**
- Consumes: `interpolate` (Task 1); `verbOf`, `Step`, `Interaction`, `Verb`, `IfStep` (Task 2); `VariableStore` shape (Task 4).
- Produces:
  - `MAX_FLOW_DEPTH = 16`
  - `skip(reason: string): Skipped`
  - `interface RunLogEntry { at: number; elementId: string; ixId: string; path: string; verb: Verb | "interaction"; status: "ok" | "skipped" | "error"; detail?: string }`
  - `interface StepApi { value(template: string): unknown; ctx: RunContext }`
  - `type Executor = (step: any, api: StepApi) => unknown | Promise<unknown>`
  - `type Executors = Partial<Record<Verb, Executor>>`
  - `interface CallResult { ok: boolean; status: number; data: unknown; error: string | null }`
  - `interface RunContext { elementId; ixId; executors; flows: Record<string, { do: Step[] }>; vars: Pick<VariableStore, "get" | "set" | "snapshot">; event?: unknown; form?: Record<string, unknown>; el?: Record<string, unknown>; steps: Record<string, unknown>; log(e: RunLogEntry): void; sleep?(ms: number): Promise<void>; now?(): number }`
  - `runInteraction(ix: Interaction, ctx: RunContext): Promise<"done" | "stopped">`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-run.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { runInteraction, skip, MAX_FLOW_DEPTH, type RunContext, type RunLogEntry } from "../src/features/interactions/runtime/run";
import { createVariableStore } from "../src/features/interactions/runtime/variables";

function ctx(over: Partial<RunContext> = {}): RunContext & { logs: RunLogEntry[]; calls: string[] } {
  const logs: RunLogEntry[] = [];
  const calls: string[] = [];
  return {
    elementId: "btn",
    ixId: "ix_aaaaaaaa",
    executors: {
      toast: (s, { value }) => void calls.push(`toast:${value(s.toast)}`),
      show: (s) => (s.show === "gone" ? skip(`element ${s.show} is not on the page`) : void calls.push(`show:${s.show}`)),
      call: async (s) => (s.url === "/ok" ? { ok: true, status: 200, data: { n: 1 }, error: null } : { ok: false, status: 500, data: null, error: "HTTP 500" }),
      copy: () => { throw new Error("clipboard denied"); },
    },
    flows: {},
    vars: createVariableStore({ user: { type: "object", default: null } }, { namespace: "t" }),
    steps: {},
    log: (e) => logs.push(e),
    sleep: async () => {},
    now: () => 0,
    logs,
    calls,
    ...over,
  } as any;
}

test("steps run in order and step results are readable later", async () => {
  const c = ctx();
  const r = await runInteraction(
    {
      on: "click",
      do: [
        { id: "r", call: "api", method: "GET", url: "/ok" },
        { if: "{{ steps.r.ok }}", then: [{ toast: "got {{ steps.r.data.n }}" }], else: [{ toast: "nope" }] },
        { set: "user", to: "{{ steps.r.data }}" },
        { toast: "user {{ vars.user.n }}" },
      ],
    },
    c,
  );
  assert.equal(r, "done");
  assert.deepEqual(c.calls, ["toast:got 1", "toast:user 1"]);
  assert.deepEqual(c.logs.map((l) => l.path), [
    "ix_aaaaaaaa.do[0]", "ix_aaaaaaaa.do[1]", "ix_aaaaaaaa.do[1].then[0]", "ix_aaaaaaaa.do[2]", "ix_aaaaaaaa.do[3]",
  ]);
  assert.equal(c.logs[1].detail, "then");
});

test("a failed call does not stop the interaction; the else branch can handle it", async () => {
  const c = ctx();
  await runInteraction(
    { on: "click", do: [{ id: "r", call: "api", method: "GET", url: "/bad" }, { if: "{{ steps.r.ok }}", then: [], else: [{ toast: "failed {{ steps.r.status }}" }] }] },
    c,
  );
  assert.deepEqual(c.calls, ["toast:failed 500"]);
});

test("a call executor that throws is turned into ok:false and logged", async () => {
  const c = ctx({ executors: { ...ctx().executors, call: async () => { throw new Error("offline"); } } });
  await runInteraction({ on: "click", do: [{ id: "r", call: "api", method: "GET", url: "/x" }, { toast: "{{ steps.r.error }}" }] }, c);
  assert.equal(c.logs[0].status, "error");
  assert.deepEqual(c.calls, ["toast:offline"]);
});

test("any other failure stops the interaction with the step path", async () => {
  const c = ctx();
  const r = await runInteraction({ on: "click", do: [{ copy: "x" }, { toast: "never" }] }, c);
  assert.equal(r, "stopped");
  assert.deepEqual(c.calls, []);
  assert.equal(c.logs[0].status, "error");
  assert.equal(c.logs[0].detail, "clipboard denied");
  assert.equal(c.logs[0].path, "ix_aaaaaaaa.do[0]");
});

test("an expression error stops the interaction", async () => {
  const c = ctx();
  assert.equal(await runInteraction({ on: "click", do: [{ toast: "{{ 1 + }}" }, { toast: "never" }] }, c), "stopped");
  assert.match(c.logs[0].detail!, /unexpected end/);
});

test("dangling references are skipped and the rest still runs", async () => {
  const c = ctx();
  await runInteraction({ on: "click", do: [{ show: "gone" }, { set: "ghost", to: "1" }, { run: "noFlow" }, { toast: "after" }] }, c);
  assert.deepEqual(c.logs.map((l) => l.status), ["skipped", "skipped", "skipped", "ok"]);
  assert.equal(c.logs[0].detail, "element gone is not on the page");
  assert.equal(c.logs[1].detail, "no variable named ghost");
  assert.equal(c.logs[2].detail, "no flow named noFlow");
  assert.deepEqual(c.calls, ["toast:after"]);
});

test("verbs without an executor are skipped", async () => {
  const c = ctx();
  await runInteraction({ on: "click", do: [{ navigate: "/x" }] }, c);
  assert.equal(c.logs[0].status, "skipped");
});

test("flows run with their own path and recursion is bounded", async () => {
  const c = ctx({ flows: { greet: { do: [{ toast: "hi" }] }, loop: { do: [{ run: "loop" }] } } });
  await runInteraction({ on: "click", do: [{ run: "greet" }] }, c);
  assert.deepEqual(c.calls, ["toast:hi"]);
  assert.equal(c.logs[1].path, "flow:greet.do[0]");

  const d = ctx({ flows: { loop: { do: [{ run: "loop" }] } } });
  assert.equal(await runInteraction({ on: "click", do: [{ run: "loop" }] }, d), "stopped");
  assert.match(d.logs.at(-1)!.detail!, new RegExp(`${MAX_FLOW_DEPTH}`));
});

test("wait uses the injected sleep", async () => {
  const waited: number[] = [];
  const c = ctx({ sleep: async (ms) => void waited.push(ms) });
  await runInteraction({ on: "click", do: [{ wait: 250 }] }, c);
  assert.deepEqual(waited, [250]);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-run.test.ts`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/runtime/run.ts
/**
 * Runs an interaction's steps in order.
 *
 * - `call` never throws: it records { ok, status, data, error } so an `if`
 *   can branch on it.
 * - An executor may return skip(reason) for a dangling reference; the step is
 *   logged as skipped and the next one runs.
 * - Any other failure (including an expression error) logs the step path and
 *   stops the interaction.
 *
 * DOM work lives in executors (see executors.ts); this file is pure.
 */
import { interpolate } from "./expression";
import { verbOf, type IfStep, type Interaction, type Step, type Verb } from "../schema";

export const MAX_FLOW_DEPTH = 16;

const SKIP = Symbol("skip");
export interface Skipped {
  [SKIP]: string;
}
export const skip = (reason: string): Skipped => ({ [SKIP]: reason });
const isSkipped = (v: unknown): v is Skipped =>
  typeof v === "object" && v !== null && SKIP in v;

export interface RunLogEntry {
  at: number;
  elementId: string;
  ixId: string;
  path: string;
  verb: Verb | "interaction";
  status: "ok" | "skipped" | "error";
  detail?: string;
}

export interface CallResult {
  ok: boolean;
  status: number;
  data: unknown;
  error: string | null;
}

export interface StepApi {
  value(template: string): unknown;
  ctx: RunContext;
}
// Executors receive the step already narrowed by verb; `any` keeps the
// registry simple.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Executor = (step: any, api: StepApi) => unknown | Promise<unknown>;
export type Executors = Partial<Record<Verb, Executor>>;

export interface RunContext {
  elementId: string;
  ixId: string;
  executors: Executors;
  flows: Record<string, { do: Step[] }>;
  vars: {
    get(name: string): unknown;
    set(name: string, value: unknown): boolean;
    snapshot(): Record<string, unknown>;
  };
  event?: unknown;
  form?: Record<string, unknown>;
  el?: Record<string, unknown>;
  steps: Record<string, unknown>;
  log(entry: RunLogEntry): void;
  sleep?(ms: number): Promise<void>;
  now?(): number;
}

class Stop extends Error {}

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const scopeOf = (ctx: RunContext) => ({
  vars: ctx.vars.snapshot(),
  event: ctx.event ?? null,
  form: ctx.form ?? {},
  el: ctx.el ?? {},
  steps: ctx.steps,
});

const message = (e: unknown) => (e instanceof Error ? e.message : String(e));

export async function runInteraction(
  ix: Interaction,
  ctx: RunContext,
): Promise<"done" | "stopped"> {
  try {
    await runSteps(ix.do, ctx, `${ctx.ixId}.do`, 0);
    return "done";
  } catch (e) {
    if (e instanceof Stop) return "stopped";
    throw e;
  }
}

async function runSteps(steps: Step[], ctx: RunContext, path: string, depth: number) {
  for (let i = 0; i < steps.length; i++) {
    await runStep(steps[i], ctx, `${path}[${i}]`, depth);
  }
}

async function runStep(step: Step, ctx: RunContext, path: string, depth: number) {
  const verb = verbOf(step);
  const at = ctx.now?.() ?? Date.now();
  const log = (status: RunLogEntry["status"], detail?: string) =>
    ctx.log({
      at,
      elementId: ctx.elementId,
      ixId: ctx.ixId,
      path,
      verb: verb ?? "interaction",
      status,
      ...(detail !== undefined ? { detail } : {}),
    });
  if (!verb) {
    log("error", "not a valid step");
    throw new Stop();
  }
  const value = (template: string) => interpolate(template, scopeOf(ctx));
  const s = step as Step & Record<string, unknown>;

  try {
    let result: unknown;
    switch (verb) {
      case "if": {
        const ifStep = step as IfStep;
        const yes = Boolean(value(ifStep.if));
        log("ok", yes ? "then" : "else");
        await runSteps(
          yes ? ifStep.then : (ifStep.else ?? []),
          ctx,
          `${path}.${yes ? "then" : "else"}`,
          depth,
        );
        return;
      }
      case "run": {
        const name = s.run as string;
        const flow = Object.hasOwn(ctx.flows, name) ? ctx.flows[name] : undefined;
        if (!flow) {
          log("skipped", `no flow named ${name}`);
          return;
        }
        if (depth >= MAX_FLOW_DEPTH) {
          log("error", `flows nested more than ${MAX_FLOW_DEPTH} deep`);
          throw new Stop();
        }
        log("ok");
        await runSteps(flow.do, ctx, `flow:${name}.do`, depth + 1);
        return;
      }
      case "set": {
        const name = s.set as string;
        if (!ctx.vars.set(name, value(s.to as string))) {
          log("skipped", `no variable named ${name}`);
          return;
        }
        result = ctx.vars.get(name);
        break;
      }
      case "wait":
        await (ctx.sleep ?? defaultSleep)(s.wait as number);
        break;
      default: {
        const exec = ctx.executors[verb];
        if (!exec) {
          log("skipped", `${verb} is not available here`);
          return;
        }
        result = await exec(step, { value, ctx });
        if (isSkipped(result)) {
          log("skipped", result[SKIP]);
          return;
        }
      }
    }
    if (typeof s.id === "string") ctx.steps[s.id] = result;
    log("ok");
  } catch (e) {
    if (e instanceof Stop) throw e;
    if (verb === "call") {
      const failed: CallResult = { ok: false, status: 0, data: null, error: message(e) };
      if (typeof s.id === "string") ctx.steps[s.id] = failed;
      log("error", message(e));
      return;
    }
    log("error", message(e));
    throw new Stop();
  }
}
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-run.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/runtime/run.ts tests/interactions-run.test.ts
git commit -m "feat(interactions): step interpreter with run log, skips and bounded flows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Executors and platform

**Files:**
- Create: `src/features/interactions/runtime/executors.ts`
- Test: `tests/interactions-executors.test.ts`

**Interfaces:**
- Consumes: `Executors`, `skip`, `CallResult` (Task 5); `toText` (Task 1); `CallStep` (Task 2).
- Produces:
  - `interface NodeLike { tagName: string; style: { display: string }; hidden?: boolean; classList: { add(c): void; remove(c): void; toggle(c): void }; setAttribute(n, v): void; scrollIntoView(o: { behavior: "smooth" | "auto"; block: "start" }): void; getBoundingClientRect(): { top: number }; requestSubmit?(): void; reset?(): void; value?: unknown; checked?: unknown; textContent?: string | null }`
  - `interface Platform { byId; navigate; toast; copy; fetch; download; scrollTo; scrollY; later; runCode }` (exact signatures in the code below)
  - `createExecutors(p: Platform): Executors`
  - `browserPlatform(doc: Document): Platform`
  - `editorPlatform(doc: Document): Platform` (`navigate` shows a toast instead of leaving the editor)
  - `elementScope(byId: (id: string) => NodeLike | null): Record<string, unknown>` (a lazy `el.<id>` proxy)

These port today's `eventExecutor` behaviour onto the new step shapes.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-executors.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createExecutors, elementScope, type Platform, type NodeLike } from "../src/features/interactions/runtime/executors";
import { runInteraction, type RunLogEntry } from "../src/features/interactions/runtime/run";
import { createVariableStore } from "../src/features/interactions/runtime/variables";
import { evaluate } from "../src/features/interactions/runtime/expression";

function node(tagName = "DIV", extra: Partial<NodeLike> = {}): NodeLike & { classes: Set<string>; attrs: Record<string, string> } {
  const classes = new Set<string>();
  const attrs: Record<string, string> = {};
  return {
    tagName, style: { display: "" }, classes, attrs,
    classList: { add: (c) => void classes.add(c), remove: (c) => void classes.delete(c), toggle: (c) => void (classes.has(c) ? classes.delete(c) : classes.add(c)) },
    setAttribute: (k, v) => void (attrs[k] = v),
    scrollIntoView: () => {},
    getBoundingClientRect: () => ({ top: 100 }),
    ...extra,
  };
}

function platform(nodes: Record<string, NodeLike>, over: Partial<Platform> = {}) {
  const events: string[] = [];
  const timers: (() => void)[] = [];
  const p: Platform = {
    byId: (id) => nodes[id] ?? null,
    navigate: (url, o) => void events.push(`navigate:${url}:${o.newTab}:${o.replace}`),
    toast: (kind, text) => void events.push(`toast:${kind}:${text}`),
    copy: async (text) => void events.push(`copy:${text}`),
    fetch: async () => ({ ok: true, status: 200, text: async () => '{"id":7}' }),
    download: (url, name) => void events.push(`download:${url}:${name}`),
    scrollTo: (y) => void events.push(`scrollTo:${y}`),
    scrollY: () => 50,
    later: (fn) => void timers.push(fn),
    runCode: () => 42,
    ...over,
  };
  return { p, events, timers };
}

async function go(p: Platform, steps: any[], logs: RunLogEntry[] = []) {
  const ctx = {
    elementId: "self", ixId: "ix_aaaaaaaa", executors: createExecutors(p), flows: {},
    vars: createVariableStore({}, { namespace: "t" }), steps: {} as Record<string, unknown>,
    log: (e: RunLogEntry) => logs.push(e), sleep: async () => {},
  };
  await runInteraction({ on: "click", do: steps }, ctx);
  return { logs, steps: ctx.steps };
}

test("show, hide and toggle change display", async () => {
  const box = node();
  const { p } = platform({ box });
  await go(p, [{ hide: "box" }]);
  assert.equal(box.style.display, "none");
  await go(p, [{ toggle: "box" }]);
  assert.equal(box.style.display, "");
  await go(p, [{ toggle: "box" }, { show: "box" }]);
  assert.equal(box.style.display, "");
});

test("a deleted target is skipped and later steps still run", async () => {
  const { p, events } = platform({});
  const { logs } = await go(p, [{ show: "gone" }, { toast: "after" }]);
  assert.equal(logs[0].status, "skipped");
  assert.equal(logs[0].detail, "element gone is not on the page");
  assert.deepEqual(events, ["toast:info:after"]);
});

test("navigate, toast, copy, download, scroll, class, animate, modal, submit", async () => {
  const form = node("FORM");
  let submitted = 0;
  form.requestSubmit = () => void submitted++;
  const box = node();
  const { p, events, timers } = platform({ form, box, self: node() });
  await go(p, [
    { navigate: "/pricing", newTab: true },
    { toast: "Saved", kind: "success" },
    { copy: "abc" },
    { download: "/f.pdf", filename: "f.pdf" },
    { scroll: "box", offset: -10 },
    { scroll: 300 },
    { class: "add", target: "box", name: "open" },
    { animate: "box", preset: "bounce" },
    { modal: "open", target: "box" },
    { submit: "form" },
  ]);
  assert.deepEqual(events, [
    "navigate:/pricing:true:false", "toast:success:Saved", "copy:abc", "download:/f.pdf:f.pdf",
    "scrollTo:140", "scrollTo:300",
  ]);
  assert.ok(box.classes.has("open"));
  assert.ok(box.classes.has("animate-bounce"));
  timers.forEach((t) => t());
  assert.ok(!box.classes.has("animate-bounce"), "animation class removed after the duration");
  assert.equal(box.style.display, "block");
  assert.equal(box.attrs["aria-hidden"], "false");
  assert.equal(submitted, 1);
});

test("submit or reset on something that is not a form is skipped; reset clears a form", async () => {
  const form = node("FORM");
  let resets = 0;
  form.reset = () => void resets++;
  const { p } = platform({ box: node(), form });
  const { logs } = await go(p, [{ submit: "box" }, { reset: "box" }, { reset: "form" }]);
  assert.deepEqual(logs.map((l) => l.status), ["skipped", "skipped", "ok"]);
  assert.equal(resets, 1);
});

test("call returns ok/status/data, sends JSON bodies and never throws", async () => {
  const seen: any[] = [];
  const { p } = platform({}, {
    fetch: async (url, init) => { seen.push({ url, init }); return { ok: false, status: 422, text: async () => "not json" }; },
  });
  const { steps } = await go(p, [{ id: "r", call: "api", method: "POST", url: "/api/{{ 'x' }}", body: "{{ steps }}" }]);
  assert.deepEqual(steps.r, { ok: false, status: 422, data: "not json", error: "HTTP 422" });
  assert.equal(seen[0].url, "/api/x");
  assert.equal(seen[0].init.headers["Content-Type"], "application/json");
  assert.equal(seen[0].init.body, "{}");

  const offline = platform({}, { fetch: async () => { throw new Error("Failed to fetch"); } });
  const r2 = await go(offline.p, [{ id: "r", call: "api", method: "GET", url: "/a" }]);
  assert.deepEqual(r2.steps.r, { ok: false, status: 0, data: null, error: "Failed to fetch" });

  const ok = platform({});
  const r3 = await go(ok.p, [{ id: "r", call: "api", method: "GET", url: "/a", body: "ignored on GET" }]);
  assert.deepEqual(r3.steps.r, { ok: true, status: 200, data: { id: 7 }, error: null });
});

test("el.<id> reads value, checked, visible and text lazily", () => {
  const input = node("INPUT", { value: "hello", checked: false, textContent: "" });
  const hidden = node("DIV", { textContent: "Hi" });
  hidden.style.display = "none";
  const el = elementScope((id) => ({ input, hidden } as Record<string, NodeLike>)[id] ?? null);
  const scope = { el };
  assert.equal(evaluate("el.input.value", scope), "hello");
  assert.equal(evaluate("el.hidden.visible", scope), false);
  assert.equal(evaluate("el.hidden.text", scope), "Hi");
  assert.equal(evaluate("el.missing.value", scope), undefined);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-executors.test.ts`
Expected: FAIL. The module is not found.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/runtime/executors.ts
/**
 * What each verb does to the page. DOM access goes through a small Platform
 * port so the executors can be tested without a browser, and so the editor
 * can swap behaviour (navigation must not leave the editor).
 *
 * Behaviour ported from features/editor/lib/events/eventExecutor.ts.
 */
import { toast as sonner } from "sonner";
import { toText } from "./expression";
import { skip, type CallResult, type Executors } from "./run";
import type { CallStep } from "../schema";

export interface NodeLike {
  tagName: string;
  style: { display: string };
  hidden?: boolean;
  classList: { add(c: string): void; remove(c: string): void; toggle(c: string): void };
  setAttribute(name: string, value: string): void;
  scrollIntoView(opts: { behavior: "smooth" | "auto"; block: "start" }): void;
  getBoundingClientRect(): { top: number };
  requestSubmit?(): void;
  reset?(): void;
  value?: unknown;
  checked?: unknown;
  textContent?: string | null;
}

export type ToastKind = "success" | "error" | "info" | "warning";

export interface Platform {
  byId(id: string): NodeLike | null;
  navigate(url: string, opts: { newTab: boolean; replace: boolean }): void;
  toast(kind: ToastKind, text: string, duration?: number): void;
  copy(text: string): Promise<void>;
  fetch(
    url: string,
    init: { method: string; headers: Record<string, string>; body?: string; signal?: AbortSignal },
  ): Promise<{ ok: boolean; status: number; text(): Promise<string> }>;
  download(url: string, filename?: string): void;
  scrollTo(y: number, smooth: boolean): void;
  scrollY(): number;
  later(fn: () => void, ms: number): void;
  runCode(code: string, scope: Record<string, unknown>): unknown;
}

const missing = (id: string) => skip(`element ${id} is not on the page`);

export function createExecutors(p: Platform): Executors {
  const visibility =
    (mode: "show" | "hide" | "toggle") =>
    (step: Record<string, string>) => {
      const node = p.byId(step[mode]);
      if (!node) return missing(step[mode]);
      const hidden = node.style.display === "none";
      const show = mode === "show" || (mode === "toggle" && hidden);
      node.style.display = show ? "" : "none";
      return show;
    };

  return {
    navigate: (s, { value }) => {
      p.navigate(toText(value(s.navigate)), { newTab: !!s.newTab, replace: !!s.replace });
    },
    show: visibility("show"),
    hide: visibility("hide"),
    toggle: visibility("toggle"),
    scroll: (s) => {
      const smooth = s.smooth !== false;
      if (typeof s.scroll === "number") {
        p.scrollTo(s.scroll, smooth);
        return;
      }
      const node = p.byId(s.scroll);
      if (!node) return missing(s.scroll);
      if (s.offset) {
        p.scrollTo(p.scrollY() + node.getBoundingClientRect().top + s.offset, smooth);
      } else {
        node.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
      }
    },
    modal: (s, { ctx }) => {
      const id: string = s.target ?? ctx.elementId;
      const node = p.byId(id);
      if (!node) return missing(id);
      const open = s.modal === "open";
      node.style.display = open ? "block" : "none";
      node.setAttribute("aria-hidden", open ? "false" : "true");
    },
    toast: (s, { value }) => {
      p.toast(s.kind ?? "info", toText(value(s.toast)), s.duration);
    },
    copy: async (s, { value }) => {
      await p.copy(toText(value(s.copy)));
    },
    download: (s, { value }) => {
      p.download(
        toText(value(s.download)),
        s.filename !== undefined ? toText(value(s.filename)) : undefined,
      );
    },
    animate: (s) => {
      const node = p.byId(s.animate);
      if (!node) return missing(s.animate);
      const cls = `animate-${s.preset}`;
      node.classList.add(cls);
      p.later(() => node.classList.remove(cls), s.duration ?? 1000);
    },
    class: (s) => {
      const node = p.byId(s.target);
      if (!node) return missing(s.target);
      node.classList[s.class as "add" | "remove" | "toggle"](s.name);
    },
    submit: (s) => {
      const node = p.byId(s.submit);
      if (!node) return missing(s.submit);
      if (node.tagName !== "FORM" || !node.requestSubmit) {
        return skip(`element ${s.submit} is not a form`);
      }
      node.requestSubmit();
    },
    reset: (s) => {
      const node = p.byId(s.reset);
      if (!node) return missing(s.reset);
      if (node.tagName !== "FORM" || !node.reset) {
        return skip(`element ${s.reset} is not a form`);
      }
      node.reset();
    },
    call: (s, { value }) => callApi(p, s as CallStep, value),
    code: (s, { ctx }) =>
      p.runCode(s.code, {
        vars: ctx.vars.snapshot(),
        steps: ctx.steps,
        event: ctx.event ?? null,
        form: ctx.form ?? {},
      }),
  };
}

async function callApi(
  p: Platform,
  s: CallStep,
  value: (t: string) => unknown,
): Promise<CallResult> {
  const headers: Record<string, string> = {};
  for (const [k, v] of Object.entries(s.headers ?? {})) headers[k] = toText(value(v));
  let body: string | undefined;
  if (s.body !== undefined && s.method !== "GET") {
    const v = value(s.body);
    body = typeof v === "string" ? v : JSON.stringify(v ?? null);
    const hasType = Object.keys(headers).some((h) => h.toLowerCase() === "content-type");
    if (typeof v !== "string" && !hasType) headers["Content-Type"] = "application/json";
  }
  const controller = new AbortController();
  p.later(() => controller.abort(), s.timeout ?? 15_000);
  try {
    const res = await p.fetch(toText(value(s.url)), {
      method: s.method,
      headers,
      body,
      signal: controller.signal,
    });
    const text = await res.text();
    let data: unknown = text;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // Not JSON: keep the text.
    }
    return { ok: res.ok, status: res.status, data, error: res.ok ? null : `HTTP ${res.status}` };
  } catch (e) {
    const error = controller.signal.aborted
      ? "timed out"
      : e instanceof Error
        ? e.message
        : String(e);
    return { ok: false, status: 0, data: null, error };
  }
}

/** `el.<id>` for expressions: read lazily from the live page. */
export function elementScope(byId: (id: string) => NodeLike | null): Record<string, unknown> {
  const read = (id: string) => {
    const n = byId(id);
    if (!n) return undefined;
    return {
      value: n.value ?? null,
      checked: n.checked ?? null,
      visible: n.style.display !== "none" && !n.hidden,
      text: n.textContent ?? "",
    };
  };
  return new Proxy({} as Record<string, unknown>, {
    get: (_t, key) => (typeof key === "string" ? read(key) : undefined),
    getOwnPropertyDescriptor: (_t, key) => {
      if (typeof key !== "string") return undefined;
      const v = read(key);
      return v === undefined
        ? undefined
        : { value: v, enumerable: true, configurable: true, writable: false };
    },
  });
}

export function browserPlatform(doc: Document): Platform {
  const win = doc.defaultView ?? window;
  return {
    byId: (id) => doc.getElementById(id) as unknown as NodeLike | null,
    navigate(url, { newTab, replace }) {
      if (newTab) win.open(url, "_blank", "noopener");
      else if (replace) win.location.replace(url);
      else win.location.assign(url);
    },
    toast: (kind, text, duration) => {
      sonner[kind](text, duration ? { duration } : undefined);
    },
    copy: (text) => win.navigator.clipboard.writeText(text),
    fetch: (url, init) => win.fetch(url, init),
    download(url, filename) {
      const a = doc.createElement("a");
      a.href = url;
      a.download = filename ?? "";
      doc.body.appendChild(a);
      a.click();
      a.remove();
    },
    scrollTo: (y, smooth) => win.scrollTo({ top: y, behavior: smooth ? "smooth" : "auto" }),
    scrollY: () => win.scrollY,
    later: (fn, ms) => {
      win.setTimeout(fn, ms);
    },
    // The `code` step is the explicit escape hatch (spec §1), like the old
    // customCode action.
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    runCode: (code, scope) => new Function("scope", code)(scope),
  };
}

/** In the editor, navigation would leave the editor: say where it would go. */
export function editorPlatform(doc: Document): Platform {
  return {
    ...browserPlatform(doc),
    navigate: (url, { newTab }) => {
      sonner.info(`Would ${newTab ? "open" : "go to"} ${url}`, {
        description: "Navigation runs in Preview.",
      });
    },
  };
}
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-executors.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/runtime/executors.ts tests/interactions-executors.test.ts
git commit -m "feat(interactions): step executors behind a platform port

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Event dispatch planning and run log store

**Files:**
- Create: `src/features/interactions/runtime/dispatch.ts`
- Create: `src/features/interactions/runtime/run-log-store.ts`
- Test: `tests/interactions-dispatch.test.ts`

**Interfaces:**
- Consumes: `InteractionMap`, `Interaction`, `OnEvent` and `isPlainObject` (Task 2); `RunLogEntry` (Task 5).
- Produces:
  - `indexInteractions(tree: { id: string; settings?: unknown; elements?: unknown }[]): Map<string, InteractionMap>`
  - `interface ChainNode { parentElement: ChainNode | null; getAttribute?(name: string): string | null }`
  - `chainIds(node: ChainNode | null, root: unknown): string[]` (innermost first)
  - `enteredIds(into: string[], from: string[]): string[]`
  - `interface Planned { elementId: string; ixId: string; ix: Interaction }`
  - `plan(index, ids: string[], on: OnEvent, opts: { bubble: boolean; key?: string }): { runs: Planned[]; preventDefault: boolean }`. An interaction with `key` runs only when `opts.key` matches, ignoring case.
  - `NATIVE_EVENTS: Record<string, OnEvent>` (native type → `on`)
  - `SELF_ONLY: ReadonlySet<OnEvent>` (focus, blur, error)
  - `visibleTargets(index): Map<string, { repeat: boolean }>`
  - `useRunLogStore` (zustand: `{ entries: RunLogEntry[]; push(e): void; clear(): void }`)
  - `RUN_LOG_LIMIT = 200`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-dispatch.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { chainIds, enteredIds, indexInteractions, plan, visibleTargets } from "../src/features/interactions/runtime/dispatch";
import { useRunLogStore, RUN_LOG_LIMIT } from "../src/features/interactions/runtime/run-log-store";

const tree = [
  {
    id: "card",
    settings: { interactions: { ix_card0001: { on: "click", do: [{ toast: "card" }] } } },
    elements: [
      {
        id: "btn",
        settings: {
          interactions: {
            ix_btn00001: { on: "click", do: [{ toast: "btn" }] },
            ix_btn00002: { on: "click", enabled: false, do: [{ toast: "off" }] },
          },
        },
        elements: [],
      },
      { id: "form", settings: { interactions: { ix_form0001: { on: "submit", do: [] } } }, elements: [] },
      { id: "form2", settings: { interactions: { ix_form0002: { on: "submit", preventDefault: false, do: [] } } }, elements: [] },
    ],
  },
  { id: "plain", elements: [] },
];

test("index only holds elements with interactions, nested ones included", () => {
  const index = indexInteractions(tree);
  assert.deepEqual([...index.keys()].sort(), ["btn", "card", "form", "form2"]);
});

test("click bubbles from the inner element outward and skips disabled ones", () => {
  const index = indexInteractions(tree);
  const { runs } = plan(index, ["btn", "card"], "click", { bubble: true });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001", "ix_card0001"]);
});

test("stopPropagation stops after that element", () => {
  const t = structuredClone(tree);
  (t[0].elements[0].settings!.interactions as any).ix_btn00001.stopPropagation = true;
  const { runs } = plan(indexInteractions(t), ["btn", "card"], "click", { bubble: true });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001"]);
});

test("submit prevents the page reload unless the maker opted out", () => {
  const index = indexInteractions(tree);
  assert.equal(plan(index, ["form", "card"], "submit", { bubble: true }).preventDefault, true);
  assert.equal(plan(index, ["form2", "card"], "submit", { bubble: true }).preventDefault, false);
  assert.equal(plan(index, ["btn", "card"], "click", { bubble: true }).preventDefault, false);
});

test("a key filter matches KeyboardEvent.key ignoring case", () => {
  const index = indexInteractions([
    {
      id: "input",
      settings: {
        interactions: {
          ix_enter001: { on: "keydown", key: "Enter", do: [] },
          ix_anykey01: { on: "keydown", do: [] },
        },
      },
    },
  ]);
  assert.deepEqual(plan(index, ["input"], "keydown", { bubble: true, key: "enter" }).runs.map((r) => r.ixId), ["ix_enter001", "ix_anykey01"]);
  assert.deepEqual(plan(index, ["input"], "keydown", { bubble: true, key: "a" }).runs.map((r) => r.ixId), ["ix_anykey01"]);
});

test("visibleTargets lists elements to observe and whether they repeat", () => {
  const index = indexInteractions([
    { id: "hero", settings: { interactions: { ix_vis00001: { on: "visible", do: [] } } } },
    { id: "ticker", settings: { interactions: { ix_vis00002: { on: "visible", once: false, do: [] } } } },
    { id: "off", settings: { interactions: { ix_vis00003: { on: "visible", enabled: false, do: [] } } } },
  ]);
  assert.deepEqual(Object.fromEntries(visibleTargets(index)), { hero: { repeat: false }, ticker: { repeat: true } });
});

test("bubble:false only uses the given ids", () => {
  const { runs } = plan(indexInteractions(tree), ["btn"], "click", { bubble: false });
  assert.deepEqual(runs.map((r) => r.ixId), ["ix_btn00001"]);
});

test("chainIds walks up to the root, enteredIds diffs hover chains", () => {
  const root = { parentElement: null, getAttribute: () => null };
  const card = { parentElement: root, getAttribute: (n: string) => (n === "data-element-id" ? "card" : null) };
  const span = { parentElement: card, getAttribute: () => null };
  const btn = { parentElement: span, getAttribute: (n: string) => (n === "data-element-id" ? "btn" : null) };
  const text = { parentElement: btn };
  assert.deepEqual(chainIds(text, root), ["btn", "card"]);
  assert.deepEqual(chainIds(null, root), []);
  assert.deepEqual(enteredIds(["btn", "card"], ["card"]), ["btn"]);
  assert.deepEqual(enteredIds(["card"], ["btn", "card"]), []);
});

test("the run log keeps the newest entries", () => {
  const { push, clear } = useRunLogStore.getState();
  clear();
  for (let i = 0; i < RUN_LOG_LIMIT + 50; i++) {
    push({ at: i, elementId: "e", ixId: "ix", path: `p${i}`, verb: "toast", status: "ok" });
  }
  const entries = useRunLogStore.getState().entries;
  assert.equal(entries.length, RUN_LOG_LIMIT);
  assert.equal(entries[0].path, "p50");
  assert.equal(entries.at(-1)!.path, `p${RUN_LOG_LIMIT + 49}`);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-dispatch.test.ts`
Expected: FAIL. The modules are not found.

- [ ] **Step 3: Implement**

```ts
// src/features/interactions/runtime/dispatch.ts
/**
 * Which interactions a DOM event should run. One listener on a wrapper node
 * receives every event; these helpers turn the event's target into the chain
 * of element ids it passed through and pick the matching interactions.
 *
 * Pure: the DOM is reached only through the ChainNode shape.
 */
import { isPlainObject, type Interaction, type InteractionMap, type OnEvent } from "../schema";

export function indexInteractions(
  tree: { id: string; settings?: unknown; elements?: unknown }[],
): Map<string, InteractionMap> {
  const index = new Map<string, InteractionMap>();
  const visit = (list: unknown) => {
    if (!Array.isArray(list)) return;
    for (const el of list as { id: string; settings?: unknown; elements?: unknown }[]) {
      const settings = el.settings;
      const map = isPlainObject(settings) ? settings.interactions : undefined;
      if (isPlainObject(map) && Object.keys(map).length) index.set(el.id, map as InteractionMap);
      visit(el.elements);
    }
  };
  visit(tree);
  return index;
}

export interface ChainNode {
  parentElement: ChainNode | null;
  getAttribute?(name: string): string | null;
}

/** Element ids from the event target up to (not including) the root. */
export function chainIds(node: ChainNode | null, root: unknown): string[] {
  const out: string[] = [];
  for (let n = node; n && n !== root; n = n.parentElement) {
    const id = n.getAttribute?.("data-element-id");
    if (id) out.push(id);
  }
  return out;
}

/** Ids in `into` that are not in `from`: the elements the pointer entered (or left). */
export function enteredIds(into: string[], from: string[]): string[] {
  const before = new Set(from);
  return into.filter((id) => !before.has(id));
}

export interface Planned {
  elementId: string;
  ixId: string;
  ix: Interaction;
}

export function plan(
  index: Map<string, InteractionMap>,
  ids: string[],
  on: OnEvent,
  opts: { bubble: boolean; key?: string },
): { runs: Planned[]; preventDefault: boolean } {
  const runs: Planned[] = [];
  let preventDefault = false;
  const pressed = opts.key?.toLowerCase();
  for (const elementId of ids) {
    const map = index.get(elementId);
    if (!map) continue;
    let stop = false;
    for (const [ixId, ix] of Object.entries(map)) {
      if (!isPlainObject(ix) || ix.on !== on || ix.enabled === false) continue;
      if (typeof ix.key === "string" && ix.key.toLowerCase() !== pressed) continue;
      runs.push({ elementId, ixId, ix });
      if (ix.preventDefault || (on === "submit" && ix.preventDefault !== false)) {
        preventDefault = true;
      }
      if (ix.stopPropagation) stop = true;
    }
    if (stop && opts.bubble) break;
  }
  return { runs, preventDefault };
}

/**
 * Native event type → interaction `on`, for events delegated from the host.
 * Handled separately by InteractionHost: mouseover/mouseout (enter/leave),
 * error (doesn't bubble, so a capture listener), load and visible (no DOM
 * event on the element).
 */
export const NATIVE_EVENTS: Record<string, OnEvent> = {
  click: "click",
  dblclick: "dblclick",
  mousedown: "mousedown",
  mouseup: "mouseup",
  focusin: "focus",
  focusout: "blur",
  change: "change",
  input: "input",
  submit: "submit",
  keydown: "keydown",
  keyup: "keyup",
};

/** Events that belong to the element itself, not its ancestors. */
export const SELF_ONLY: ReadonlySet<OnEvent> = new Set<OnEvent>(["focus", "blur", "error"]);

/** Element ids with an enabled `visible` interaction, and whether each should keep firing. */
export function visibleTargets(index: Map<string, InteractionMap>): Map<string, { repeat: boolean }> {
  const out = new Map<string, { repeat: boolean }>();
  for (const [elementId, map] of index) {
    for (const ix of Object.values(map)) {
      if (!isPlainObject(ix) || ix.on !== "visible" || ix.enabled === false) continue;
      const repeat = ix.once === false || out.get(elementId)?.repeat === true;
      out.set(elementId, { repeat });
    }
  }
  return out;
}
```

```ts
// src/features/interactions/runtime/run-log-store.ts
import { create } from "zustand";
import type { RunLogEntry } from "./run";

export const RUN_LOG_LIMIT = 200;

interface RunLogState {
  entries: RunLogEntry[];
  push(entry: RunLogEntry): void;
  clear(): void;
}

/** What interactions did, newest last. Shown by RunLogPanel. */
export const useRunLogStore = create<RunLogState>()((set) => ({
  entries: [],
  push: (entry) =>
    set((s) => ({ entries: [...s.entries.slice(-(RUN_LOG_LIMIT - 1)), entry] })),
  clear: () => set({ entries: [] }),
}));
```

- [ ] **Step 4: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-dispatch.test.ts`
Expected: PASS (9 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/interactions/runtime/dispatch.ts src/features/interactions/runtime/run-log-store.ts tests/interactions-dispatch.test.ts
git commit -m "feat(interactions): event dispatch planning and run log store

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: InteractionHost, run log panel, and wiring into the canvas and Preview

**Files:**
- Create: `src/features/interactions/components/InteractionHost.tsx`
- Create: `src/features/interactions/components/RunLogPanel.tsx`
- Modify: `src/features/editor/components/ElementLoader.tsx:51-64`
- Modify: `src/app/preview/$id.tsx` (the `PreviewRenderer` return, around lines 88–100)
- Modify: the 13 `src/features/preview/components/Preview*Component.tsx` files, i.e. every file in that folder except `PreviewElementLoader.tsx`
- Test: `tests/interactions-preview-ids.test.ts`

**Interfaces:**
- Consumes:
  - `indexInteractions`, `chainIds`, `enteredIds`, `plan`, `visibleTargets`, `NATIVE_EVENTS`, `SELF_ONLY`, `useRunLogStore` (Task 7)
  - `runInteraction` (Task 5)
  - `createExecutors`, `browserPlatform`, `editorPlatform`, `elementScope`, `Platform` (Task 6)
  - `createVariableStore`, `safeStorage`, `VariableDef` (Task 4)
- Produces: `<InteractionHost elements enabled namespace showLog? platform? variables? flows?>{children}</InteractionHost>`. Plan 2 passes `variables` and `flows`.

- [ ] **Step 1: Write the failing test (preview elements must be addressable by id)**

Show/hide/scroll targets and event delegation both find elements by id. No preview component sets one today.

```ts
// tests/interactions-preview-ids.test.ts
import { strict as assert } from "node:assert";
import { readdirSync, readFileSync } from "node:fs";
import { test } from "node:test";

const dir = "src/features/preview/components";

test("every preview component puts the element id on its root", () => {
  const files = readdirSync(dir).filter((f) => /^Preview.*Component\.tsx$/.test(f));
  assert.ok(files.length >= 13);
  for (const f of files) {
    const src = readFileSync(`${dir}/${f}`, "utf8");
    assert.match(src, /id=\{element\.id\}/, `${f} sets id`);
    assert.match(src, /data-element-id=\{element\.id\}/, `${f} sets data-element-id`);
  }
});
```

- [ ] **Step 2: Run the test to make sure it fails**

Run: `node --import tsx --test tests/interactions-preview-ids.test.ts`
Expected: FAIL with "PreviewBaseComponent.tsx sets id".

- [ ] **Step 3: Add the ids to the preview components**

In each of the 13 files, find the root JSX element the component returns. For `PreviewBaseComponent.tsx` that is the `<div className={element.tailwindStyles} …>`. Add these two attributes as its first props:

```tsx
      id={element.id}
      data-element-id={element.id}
```

For example, `PreviewBaseComponent.tsx` becomes:

```tsx
    <div
      id={element.id}
      data-element-id={element.id}
      className={element.tailwindStyles}
      style={safeStyles}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(content),
      }}
    ></div>
```

Some components return early or wrap the root in a fragment, for example a loading state in the CMS components. Put the attributes on the element that carries `element.tailwindStyles`. CMS list and grid components repeat child templates per item, so those children will share ids. That is acceptable in v1: show/hide acts on the first match.

Run: `node --import tsx --test tests/interactions-preview-ids.test.ts`
Expected: PASS.

- [ ] **Step 4: Write `InteractionHost` and `RunLogPanel`**

```tsx
// src/features/interactions/components/InteractionHost.tsx
/**
 * Runs element interactions. One wrapper node (display: contents, so layout
 * is untouched) listens for native events from every element inside it and
 * runs the interactions of the element(s) the event passed through.
 *
 * Used by the editor canvas (when events are on) and by Preview.
 */
import React, { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import type { EditorElement } from "@/types/global.type";
import type { Step } from "../schema";
import {
  NATIVE_EVENTS,
  SELF_ONLY,
  chainIds,
  enteredIds,
  indexInteractions,
  plan,
  visibleTargets,
  type ChainNode,
  type Planned,
} from "../runtime/dispatch";
import { runInteraction } from "../runtime/run";
import {
  browserPlatform,
  createExecutors,
  elementScope,
  type Platform,
} from "../runtime/executors";
import { createVariableStore, safeStorage, type VariableDef } from "../runtime/variables";
import { useRunLogStore } from "../runtime/run-log-store";
import RunLogPanel from "./RunLogPanel";

const NO_VARIABLES: Record<string, VariableDef> = {};
const NO_FLOWS: Record<string, { do: Step[] }> = {};

interface InteractionHostProps {
  elements: EditorElement[];
  enabled: boolean;
  /** Storage namespace for session/local variables, e.g. the project id. */
  namespace: string;
  showLog?: boolean;
  platform?: (doc: Document) => Platform;
  variables?: Record<string, VariableDef>;
  flows?: Record<string, { do: Step[] }>;
  children: React.ReactNode;
}

function eventScope(e: Event | null) {
  if (!e) return null;
  const t = e.target as (HTMLInputElement & { files?: unknown }) | null;
  return {
    type: e.type,
    value: t && "value" in t ? t.value : null,
    checked: t && "checked" in t ? t.checked : null,
    key: (e as KeyboardEvent).key ?? null,
  };
}

function formValues(target: EventTarget | null): Record<string, unknown> {
  const el = target as Element | null;
  const form = (el?.tagName === "FORM" ? el : el?.closest?.("form")) as HTMLFormElement | null;
  if (!form) return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of new FormData(form)) out[k] = typeof v === "string" ? v : v.name;
  return out;
}

export function InteractionHost({
  elements,
  enabled,
  namespace,
  showLog = false,
  platform = browserPlatform,
  variables = NO_VARIABLES,
  flows = NO_FLOWS,
  children,
}: InteractionHostProps) {
  const ref = useRef<HTMLDivElement>(null);
  const index = useMemo(() => indexInteractions(elements), [elements]);
  const indexRef = useRef(index);
  indexRef.current = index;

  const vars = useMemo(
    () =>
      createVariableStore(variables, {
        namespace,
        session: safeStorage(() => window.sessionStorage),
        local: safeStorage(() => window.localStorage),
      }),
    [variables, namespace],
  );

  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root) return;
    const doc = root.ownerDocument;
    const executors = createExecutors(platform(doc));
    const el = elementScope((id) => doc.getElementById(id) as never);
    const log = useRunLogStore.getState().push;

    const fire = (runs: Planned[], event: Event | null, form: Record<string, unknown> = {}) => {
      if (!runs.length) return;
      void (async () => {
        for (const { elementId, ixId, ix } of runs) {
          try {
            await runInteraction(ix, {
              elementId, ixId, executors, flows, vars, el, log,
              event: eventScope(event), form, steps: {},
            });
          } catch (e) {
            console.error("Interaction failed", ixId, e);
          }
        }
      })();
    };

    const onEvent = (e: Event) => {
      const on = NATIVE_EVENTS[e.type];
      if (!on) return;
      const chain = chainIds(e.target as unknown as ChainNode, root);
      const self = SELF_ONLY.has(on);
      const { runs, preventDefault } = plan(
        indexRef.current,
        self ? chain.slice(0, 1) : chain,
        on,
        { bubble: !self, key: (e as KeyboardEvent).key },
      );
      if (!runs.length) return;
      if (preventDefault) e.preventDefault();
      fire(runs, e, formValues(e.target));
    };

    const onHover = (e: Event) => {
      const m = e as MouseEvent;
      const into = chainIds(m.target as unknown as ChainNode, root);
      const from = chainIds(m.relatedTarget as unknown as ChainNode, root);
      const on = e.type === "mouseover" ? "mouseenter" : "mouseleave";
      fire(plan(indexRef.current, enteredIds(into, from), on, { bubble: false }).runs, e);
    };

    // `error` doesn't bubble (a broken <img>), so listen in the capture phase
    // and only for the element that failed.
    const onError = (e: Event) => {
      const id = chainIds(e.target as unknown as ChainNode, root)[0];
      if (!id) return;
      fire(plan(indexRef.current, [id], "error", { bubble: false }).runs, e);
    };

    const types = Object.keys(NATIVE_EVENTS);
    types.forEach((t) => root.addEventListener(t, onEvent));
    root.addEventListener("mouseover", onHover);
    root.addEventListener("mouseout", onHover);
    root.addEventListener("error", onError, true);

    // `load` interactions run once when the host turns on.
    for (const [elementId] of indexRef.current) {
      fire(plan(indexRef.current, [elementId], "load", { bubble: false }).runs, null);
    }

    return () => {
      types.forEach((t) => root.removeEventListener(t, onEvent));
      root.removeEventListener("mouseover", onHover);
      root.removeEventListener("mouseout", onHover);
      root.removeEventListener("error", onError, true);
    };
  }, [enabled, platform, flows, vars]);

  // `visible`: watch elements with a visible interaction. Re-run when the
  // index changes so new or edited interactions are picked up.
  useEffect(() => {
    const root = ref.current;
    if (!enabled || !root || typeof IntersectionObserver === "undefined") return;
    const targets = visibleTargets(index);
    if (!targets.size) return;
    const doc = root.ownerDocument;
    const executors = createExecutors(platform(doc));
    const el = elementScope((id) => doc.getElementById(id) as never);
    const log = useRunLogStore.getState().push;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const id = (entry.target as HTMLElement).dataset.elementId;
        if (!id) continue;
        if (!targets.get(id)?.repeat) observer.unobserve(entry.target);
        for (const { elementId, ixId, ix } of plan(index, [id], "visible", { bubble: false }).runs) {
          void runInteraction(ix, { elementId, ixId, executors, flows, vars, el, log, steps: {} })
            .catch((e) => console.error("Interaction failed", ixId, e));
        }
      }
    }, { threshold: 0.25 });
    for (const id of targets.keys()) {
      const node = doc.getElementById(id);
      if (node) observer.observe(node);
    }
    return () => observer.disconnect();
  }, [enabled, index, platform, flows, vars]);

  return (
    <>
      <div ref={ref} style={{ display: "contents" }}>
        {children}
      </div>
      {showLog && enabled && typeof document !== "undefined"
        ? createPortal(<RunLogPanel />, document.body)
        : null}
    </>
  );
}

export default InteractionHost;
```

```tsx
// src/features/interactions/components/RunLogPanel.tsx
import { useState } from "react";
import { ListTree, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRunLogStore } from "../runtime/run-log-store";

const STATUS_CLASS = {
  ok: "text-emerald-600 dark:text-emerald-400",
  skipped: "text-amber-600 dark:text-amber-400",
  error: "text-destructive",
} as const;

/** Floating log of what interactions did, newest first. */
export default function RunLogPanel() {
  const entries = useRunLogStore((s) => s.entries);
  const clear = useRunLogStore((s) => s.clear);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button
        size="sm"
        variant="secondary"
        className="fixed bottom-4 right-4 z-[60] h-8 gap-1.5 text-xs shadow-md"
        onClick={() => setOpen(true)}
      >
        <ListTree className="h-3.5 w-3.5" />
        Run log{entries.length ? ` (${entries.length})` : ""}
      </Button>
    );
  }

  return (
    <section
      aria-label="Interaction run log"
      className="fixed bottom-4 right-4 z-[60] flex max-h-[45vh] w-[360px] flex-col rounded-md border border-border bg-card text-xs shadow-lg"
    >
      <header className="flex h-8 shrink-0 items-center gap-1 border-b border-border px-2">
        <ListTree className="h-3.5 w-3.5" />
        <span className="flex-1 font-semibold">Run log</span>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Clear run log" onClick={clear}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Collapse run log" onClick={() => setOpen(false)}>
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto font-mono text-[11px]">
        {entries.length === 0 && (
          <li className="p-3 font-sans text-muted-foreground">
            Nothing yet. Interact with the page to see each step here.
          </li>
        )}
        {[...entries].reverse().map((e, i) => (
          <li key={`${e.at}-${i}`} className="border-b border-border/60 px-2 py-1">
            <span className={cn("mr-1.5 font-semibold", STATUS_CLASS[e.status])}>{e.status}</span>
            <span>{e.verb}</span>
            <span className="ml-1.5 text-muted-foreground">{e.path}</span>
            {e.detail && <div className="pl-1 text-muted-foreground">{e.detail}</div>}
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 5: Wire the editor canvas**

In `src/features/editor/components/ElementLoader.tsx`, add these imports:

```tsx
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
import { editorPlatform } from "@/features/interactions/runtime/executors";
import { useEventModeStore } from "@/features/editor";
```

Replace the body of `RootElementLoader`'s return (lines 51–64) with:

```tsx
  const eventsOn = useEventModeStore((s) => s.isEventModeEnabled);
  const list = elements ?? pageElements;

  return (
    <EditorFlagsProvider
      isReadOnly={isReadOnly}
      isLocked={isLocked}
      permissionsRole={permissions?.role ?? null}
      canEdit={editable && !!permissions?.canEditElements}
      canCreate={editable && !!permissions?.canCreateElements}
      iframeRef={iframeRef}
    >
      <CanvasInteractionLayer>
        <InteractionHost
          elements={list}
          enabled={eventsOn}
          namespace={params.id ?? "editor"}
          platform={editorPlatform}
          showLog
        >
          <ElementList elements={list} data={data} />
        </InteractionHost>
      </CanvasInteractionLayer>
    </EditorFlagsProvider>
  );
```

Put the `useEventModeStore` call next to the other hooks at the top of `RootElementLoader`, not after a conditional.

- [ ] **Step 6: Wire Preview**

In `src/app/preview/$id.tsx`:

1. Import `InteractionHost` and `useSearch`, and read the run-log flag at the top of `PreviewRenderer`, before any early return:

```tsx
import { useSearch } from "@tanstack/react-router";
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
// …
  const showLog = Boolean((useSearch({ strict: false }) as { runlog?: unknown }).runlog);
```

2. Replace `<PreviewElementLoader elements={elements} />` with:

```tsx
      <InteractionHost elements={elements} enabled namespace={projectId} showLog={showLog}>
        <PreviewElementLoader elements={elements} />
      </InteractionHost>
```

If the route's `validateSearch` rejects unknown params, add `runlog: z.coerce.boolean().optional()` to it. The preview is public, so the run log only appears with `?runlog=1`. That keeps it hidden from site visitors.

- [ ] **Step 7: Typecheck and run all unit tests**

Run: `bunx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "src/(features/interactions|features/editor/components/ElementLoader|app/preview|features/preview)" || echo "no errors in touched files"`
Expected: `no errors in touched files`

Run: `bun run test:unit`
Expected: all tests pass, including `interactions-preview-ids`.

- [ ] **Step 8: Commit**

```bash
git add src/features/interactions/components/InteractionHost.tsx src/features/interactions/components/RunLogPanel.tsx src/features/editor/components/ElementLoader.tsx 'src/app/preview/$id.tsx' src/features/preview/components/*.tsx tests/interactions-preview-ids.test.ts
git commit -m "feat(interactions): run interactions on the canvas and in Preview with a run log

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Ops, store commit, describe and JSON schema

**Files:**
- Create: `src/features/interactions/ops.ts`
- Create: `src/features/interactions/ops-store.ts`
- Create: `src/features/interactions/describe.ts`
- Create: `src/features/interactions/schema-json.ts`
- Create: `scripts/interactions-schema.ts`
- Create: `public/interactions.schema.json` (generated)
- Modify: `package.json` (scripts)
- Test: `tests/interactions-ops.test.ts`

**Interfaces:**
- Consumes: `validateInteractionMap`, `isPlainObject`, `Interaction`, `InteractionMap`, `Issue`, `OnEvent`, `Step`, `VERB_SCHEMAS`, `VERBS`, `InteractionHead`, `IX_ID_RE` (Task 2); `VariableDef` (Task 4); `createElementStore` / `useElementStore` from `src/features/editor/store/element-store`.
- Produces:
  - `newInteractionId(random?: () => number): string`
  - `getInteractions(el: { settings?: unknown } | null | undefined): InteractionMap`
  - `hasInteractions(el): boolean`
  - `interface OpOptions { allowIncomplete?: boolean }`
  - `type OpResult = { ok: true; settings: Record<string, unknown>; id?: string } | { ok: false; issues: Issue[] }`
  - `addInteraction(el, on: OnEvent, steps?: Step[], opts?: OpOptions, random?: () => number): OpResult`
  - `updateInteraction(el, ixId: string, patch: Partial<Interaction>, opts?: OpOptions): OpResult`
  - `removeInteraction(el, ixId: string): OpResult`
  - `commit(elementId: string, change: (el: EditorElement) => OpResult, store?: ElementStoreLike): OpResult`
  - `describe(pageId: string, tree: EditorElement[], logic?: { variables?: Record<string, VariableDef>; flows?: Record<string, { do: Step[] }> }): Description`
  - `buildJsonSchema(): Record<string, unknown>`

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-ops.test.ts
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  addInteraction, getInteractions, hasInteractions, newInteractionId, removeInteraction, updateInteraction,
} from "../src/features/interactions/ops";
import { commit } from "../src/features/interactions/ops-store";
import { describe as describePage } from "../src/features/interactions/describe";
import { buildJsonSchema } from "../src/features/interactions/schema-json";
import { VERBS } from "../src/features/interactions/schema";
import { createElementStore } from "../src/features/editor/store/element-store";

const el = (id: string, extra: Record<string, unknown> = {}) =>
  ({ id, type: "Frame", content: "", styles: {}, tailwindStyles: "", elements: [], pageId: "p", ...extra }) as any;

test("ids have the documented shape", () => {
  assert.match(newInteractionId(), /^ix_[a-z0-9]{8}$/);
});

test("add, update, remove keep other settings and other interactions", () => {
  const base = el("b", { settings: { level: 2 } });
  const a = addInteraction(base, "click", [{ toast: "hi" }]);
  assert.ok(a.ok);
  const withA = { ...base, settings: a.settings };
  assert.equal((withA.settings as any).level, 2);
  assert.deepEqual(getInteractions(withA)[a.id!], { on: "click", do: [{ toast: "hi" }] });
  assert.ok(hasInteractions(withA));

  const u = updateInteraction(withA, a.id!, { enabled: false });
  assert.ok(u.ok);
  assert.equal((u.settings as any).interactions[a.id!].enabled, false);

  const r = removeInteraction({ ...withA, settings: u.ok ? u.settings : {} }, a.id!);
  assert.ok(r.ok);
  assert.deepEqual((r.settings as any).interactions, {});
});

test("strict ops reject incomplete steps; the editor may save them", () => {
  const strict = addInteraction(el("b"), "click", [{ navigate: "" } as any]);
  assert.equal(strict.ok, false);
  assert.equal(!strict.ok && strict.issues[0].path.endsWith(".do[0].navigate"), true);
  assert.ok(addInteraction(el("b"), "click", [{ navigate: "" } as any], { allowIncomplete: true }).ok);
  const broken = addInteraction(el("b"), "click", [{ toast: 5 } as any], { allowIncomplete: true });
  assert.equal(broken.ok, false, "type errors always block");
  assert.equal(updateInteraction(el("b"), "ix_nonexist", {}).ok, false);
});

test("an incomplete sibling does not block a strict edit of another interaction", () => {
  const withDraft = el("b", { settings: { interactions: { ix_draft001: { on: "click", do: [{ navigate: "" }] } } } });
  assert.ok(addInteraction(withDraft, "mouseenter", [{ toast: "x" }]).ok);
});

test("commit goes through updateElement; removal travels as null", async () => {
  const store = createElementStore();
  const wire: any[] = [];
  store.getState().setCollaborativeCallback(((type: string, id: string, data: unknown) => wire.push({ type, id, data })) as any);
  store.getState().addElement(el("btn"));
  const added = commit("btn", (e) => addInteraction(e, "click", [{ toast: "hi" }]), store);
  assert.ok(added.ok);
  const removed = commit("btn", (e) => removeInteraction(e, added.id!), store);
  assert.ok(removed.ok);
  await new Promise((r) => setTimeout(r, 0));
  const updates = wire.filter((w) => w.type === "update");
  assert.deepEqual(updates.at(-1).data.settings, { interactions: { [added.id!]: null } });

  store.getState().undo();
  assert.ok(getInteractions(store.getState().elements[0])[added.id!], "undo restores it locally");
  assert.equal(commit("nope", (e) => addInteraction(e, "click"), store).ok, false);
});

test("describe gives agents a flat, compact page", () => {
  const tree = [
    el("sec", { name: "Hero", elements: [el("btn", { type: "Button", content: "<b>Sign up</b>", settings: { interactions: { ix_aaaaaaaa: { on: "click", do: [] } } } })] }),
  ];
  const d = describePage("p1", tree);
  assert.equal(d.pageId, "p1");
  assert.deepEqual(d.elements.map((e) => [e.id, e.parentId, e.children]), [["sec", null, ["btn"]], ["btn", "sec", []]]);
  assert.equal(d.elements[0].name, "Hero");
  assert.equal(d.elements[1].text, "Sign up");
  assert.ok(d.elements[1].interactions?.ix_aaaaaaaa);
  assert.equal("interactions" in d.elements[0], false);
  assert.deepEqual(d.variables, {});
});

test("the published JSON schema is up to date and covers every verb", () => {
  const built = buildJsonSchema() as any;
  const committed = JSON.parse(readFileSync("public/interactions.schema.json", "utf8"));
  assert.deepEqual(committed, built, "run `bun run interactions:schema`");
  assert.equal(built.$defs.step.oneOf.length, VERBS.length);
  const ifSchema = built.$defs.step.oneOf.find((s: any) => s.properties?.if);
  assert.deepEqual(ifSchema.properties.then.items, { $ref: "#/$defs/step" });
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-ops.test.ts`
Expected: FAIL. The modules are not found.

- [ ] **Step 3: Implement `ops.ts`**

```ts
// src/features/interactions/ops.ts
/**
 * The one way to change interactions: used by the Interact tab, and the
 * surface the in-app assistant and MCP server will call (later plans).
 *
 * Pure: takes an element, returns its next `settings` (or the issues that
 * block the change). `ops-store.ts` applies the result to the editor.
 *
 * Strict by default (agents): incomplete steps are rejected. The editor
 * passes `allowIncomplete` because a maker saves a step before filling it in.
 * Only issues inside the interaction being changed can block the change.
 */
import {
  isPlainObject,
  validateInteractionMap,
  type Interaction,
  type InteractionMap,
  type Issue,
  type OnEvent,
  type Step,
} from "./schema";

const ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

export function newInteractionId(random: () => number = Math.random): string {
  let id = "ix_";
  for (let i = 0; i < 8; i++) id += ALPHABET[Math.floor(random() * 36) % 36];
  return id;
}

type HasSettings = { settings?: unknown } | null | undefined;

export function getInteractions(el: HasSettings): InteractionMap {
  const settings = el?.settings;
  if (!isPlainObject(settings)) return {};
  const map = settings.interactions;
  return isPlainObject(map) ? (map as InteractionMap) : {};
}

export const hasInteractions = (el: HasSettings) => Object.keys(getInteractions(el)).length > 0;

export interface OpOptions {
  allowIncomplete?: boolean;
}

export type OpResult =
  | { ok: true; settings: Record<string, unknown>; id?: string }
  | { ok: false; issues: Issue[] };

function finish(
  el: HasSettings,
  map: InteractionMap,
  touched: string | null,
  opts: OpOptions,
  id?: string,
): OpResult {
  const prefix = touched ? `interactions.${touched}` : null;
  const issues = validateInteractionMap(map).filter(
    (i) =>
      (!prefix || i.path === prefix || i.path.startsWith(`${prefix}.`)) &&
      (i.level === "error" || (i.level === "incomplete" && !opts.allowIncomplete)),
  );
  if (issues.length) return { ok: false, issues };
  const settings = { ...(isPlainObject(el?.settings) ? el!.settings : {}), interactions: map };
  return id ? { ok: true, settings, id } : { ok: true, settings };
}

export function addInteraction(
  el: HasSettings,
  on: OnEvent,
  steps: Step[] = [],
  opts: OpOptions = {},
  random?: () => number,
): OpResult {
  const map = getInteractions(el);
  let id = newInteractionId(random);
  for (let i = 0; i < 10 && Object.hasOwn(map, id); i++) id = newInteractionId(random);
  return finish(el, { ...map, [id]: { on, do: steps } }, id, opts, id);
}

export function updateInteraction(
  el: HasSettings,
  ixId: string,
  patch: Partial<Interaction>,
  opts: OpOptions = {},
): OpResult {
  const map = getInteractions(el);
  if (!Object.hasOwn(map, ixId)) {
    return {
      ok: false,
      issues: [{ path: `interactions.${ixId}`, message: "no such interaction", level: "error" }],
    };
  }
  return finish(el, { ...map, [ixId]: { ...map[ixId], ...patch } }, ixId, opts);
}

export function removeInteraction(el: HasSettings, ixId: string): OpResult {
  const { [ixId]: _removed, ...rest } = getInteractions(el);
  return finish(el, rest, null, { allowIncomplete: true });
}
```

The `null` touched value in `removeInteraction` means every remaining error-level issue counts. Removing is still allowed while drafts exist, because `allowIncomplete` is true.

- [ ] **Step 4: Implement `ops-store.ts`, `describe.ts`, `schema-json.ts` and the script**

```ts
// src/features/interactions/ops-store.ts
/**
 * Applies an op to the editor's element store. Going through updateElement
 * gives undo/redo, collaborator sync and server persistence for free; the
 * store sends removed interaction keys as null so the server drops them.
 */
import type { EditorElement } from "@/types/global.type";
import { useElementStore } from "@/features/editor/store/element-store";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import type { OpResult } from "./ops";

export interface ElementStoreLike {
  getState(): {
    elements: unknown[];
    updateElement(id: string, patch: Partial<EditorElement>): unknown;
  };
}

export function commit(
  elementId: string,
  change: (el: EditorElement) => OpResult,
  store: ElementStoreLike = useElementStore as unknown as ElementStoreLike,
): OpResult {
  const state = store.getState();
  const el = elementHelper.findById(state.elements as EditorElement[], elementId) as
    | EditorElement
    | undefined;
  if (!el) {
    return {
      ok: false,
      issues: [{ path: elementId, message: "element not found", level: "error" }],
    };
  }
  const result = change(el);
  if (result.ok) {
    state.updateElement(elementId, { settings: result.settings } as Partial<EditorElement>);
  }
  return result;
}
```

```ts
// src/features/interactions/describe.ts
/**
 * One compact read of a page for an agent: every element (flat, with parent
 * and child ids), its interactions, and the variables and flows in scope.
 */
import type { EditorElement } from "@/types/global.type";
import type { InteractionMap, Step } from "./schema";
import type { VariableDef } from "./runtime/variables";
import { getInteractions } from "./ops";

export interface DescribedElement {
  id: string;
  type: string;
  name?: string;
  parentId: string | null;
  children: string[];
  text?: string;
  interactions?: InteractionMap;
}

export interface Description {
  pageId: string;
  elements: DescribedElement[];
  variables: Record<string, VariableDef>;
  flows: Record<string, { do: Step[] }>;
}

const childrenOf = (el: EditorElement): EditorElement[] => {
  const kids = (el as unknown as { elements?: unknown }).elements;
  return Array.isArray(kids) ? (kids as EditorElement[]) : [];
};

export function describe(
  pageId: string,
  tree: EditorElement[],
  logic: { variables?: Record<string, VariableDef>; flows?: Record<string, { do: Step[] }> } = {},
): Description {
  const elements: DescribedElement[] = [];
  const visit = (list: EditorElement[], parentId: string | null) => {
    for (const el of list) {
      const kids = childrenOf(el);
      const text =
        typeof el.content === "string"
          ? el.content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, 60)
          : "";
      const interactions = getInteractions(el);
      elements.push({
        id: el.id,
        type: el.type,
        ...(el.name ? { name: el.name } : {}),
        parentId,
        children: kids.map((k) => k.id),
        ...(text ? { text } : {}),
        ...(Object.keys(interactions).length ? { interactions } : {}),
      });
      visit(kids, el.id);
    }
  };
  visit(tree, null);
  return { pageId, elements, variables: logic.variables ?? {}, flows: logic.flows ?? {} };
}
```

```ts
// src/features/interactions/schema-json.ts
/**
 * The interaction format as JSON Schema, published at
 * /interactions.schema.json for agents and MCP clients. Regenerate with
 * `bun run interactions:schema`; a unit test fails when it is stale.
 */
import { z } from "zod";
import { IX_ID_RE, InteractionHead, VERBS, VERB_SCHEMAS } from "./schema";

const STEP_REF = { $ref: "#/$defs/step" };

const toJson = (schema: z.ZodType) => {
  const out = z.toJSONSchema(schema, { io: "input" }) as Record<string, any>;
  delete out.$schema;
  return out;
};

export function buildJsonSchema(): Record<string, unknown> {
  const steps = VERBS.map((verb) => {
    const js = toJson(VERB_SCHEMAS[verb]);
    if (verb === "if") {
      js.properties.then = { type: "array", items: STEP_REF };
      js.properties.else = { type: "array", items: STEP_REF };
    }
    return js;
  });
  const interaction = toJson(InteractionHead);
  interaction.properties.do = { type: "array", items: STEP_REF };
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: "interactions.schema.json",
    title: "Element interactions (settings.interactions)",
    type: "object",
    propertyNames: { pattern: IX_ID_RE.source },
    additionalProperties: { $ref: "#/$defs/interaction" },
    $defs: { step: { oneOf: steps }, interaction },
  };
}
```

```ts
// scripts/interactions-schema.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { buildJsonSchema } from "../src/features/interactions/schema-json";

mkdirSync("public", { recursive: true });
writeFileSync("public/interactions.schema.json", JSON.stringify(buildJsonSchema(), null, 2) + "\n");
console.log("wrote public/interactions.schema.json");
```

In `package.json` `scripts`, add after `"test:integration"`:

```json
    "interactions:schema": "node --import tsx scripts/interactions-schema.ts"
```

Then generate the file:

Run: `bun run interactions:schema`
Expected: `wrote public/interactions.schema.json`

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-ops.test.ts`
Expected: PASS (8 tests).

If the "removal travels as null" assertion fails because the callback runs later than one tick, check `triggerCollaborativeCallback` in `element-store.ts:154`. Wait the way it requires (it may be deferred) rather than changing the store.

- [ ] **Step 6: Commit**

```bash
git add src/features/interactions/ops.ts src/features/interactions/ops-store.ts src/features/interactions/describe.ts src/features/interactions/schema-json.ts scripts/interactions-schema.ts public/interactions.schema.json package.json tests/interactions-ops.test.ts
git commit -m "feat(interactions): typed ops, describe() and published JSON schema for agents

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Editing model (step paths, summaries, fields, autocomplete, pick mode)

**Files:**
- Create: `src/features/interactions/editing/steps-edit.ts`
- Create: `src/features/interactions/editing/fields.ts`
- Create: `src/features/interactions/editing/suggest.ts`
- Create: `src/features/interactions/editing/pick-store.ts`
- Test: `tests/interactions-editing.test.ts`

**Interfaces:**
- Consumes: `Step`, `IfStep`, `Verb`, `VERBS`, `verbOf`, `TOAST_KINDS`, `ANIMATION_PRESETS`, `HTTP_METHODS` (Task 2).
- Produces:
  - `type StepPath = Array<number | "then" | "else">`. A step path ends in a number, for example `[1, "then", 0]`. A list path is empty or ends in a branch, for example `[1, "then"]`.
  - Step edits: `getStep(steps, path)`, `insertStep(steps, listPath, index, step)`, `removeStep(steps, path)`, `replaceStep(steps, path, step)`, `moveStep(steps, listPath, from, to)`
  - `issuePath(ixId, path): string`
  - `stepIdsBefore(steps, path): string[]`
  - `defaultStep(verb): Step`
  - `summarize(step, nameOf: (id: string) => string | undefined): string`
  - `type FieldKind = "text" | "expr" | "element" | "number" | "boolean" | "select" | "variable" | "flow" | "code" | "headers"`
  - `interface FieldDef { key: string; label: string; kind: FieldKind; options?: readonly string[]; optional?: boolean; placeholder?: string }`
  - `FIELDS: Record<Verb, FieldDef[]>`
  - `VERB_LABELS: Record<Verb, string>`
  - `menuVerbs(ctx: { variables: number; flows: number }): Verb[]`
  - `parseHeaders(text): Record<string, string>` and `formatHeaders(rec): string`
  - `interface SuggestContext { variables: string[]; stepIds: string[]; elements: { id: string; name: string }[] }`
  - `interface Suggestion { label: string; insert: string; detail?: string }`
  - `suggest(text: string, caret: number, ctx: SuggestContext): { from: number; items: Suggestion[] } | null`
  - `usePickStore` (zustand: `{ onPick: ((id: string) => void) | null; start(cb): void; cancel(): void; pick(id): boolean }`)

- [ ] **Step 1: Write the failing tests**

```ts
// tests/interactions-editing.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  defaultStep, getStep, insertStep, issuePath, moveStep, removeStep, replaceStep, stepIdsBefore, summarize,
} from "../src/features/interactions/editing/steps-edit";
import { FIELDS, VERB_LABELS, formatHeaders, menuVerbs, parseHeaders } from "../src/features/interactions/editing/fields";
import { suggest } from "../src/features/interactions/editing/suggest";
import { usePickStore } from "../src/features/interactions/editing/pick-store";
import { VERBS, VERB_SCHEMAS, validateInteractionMap } from "../src/features/interactions/schema";

const steps: any[] = [
  { id: "r", call: "api", method: "GET", url: "/a" },
  { if: "{{ steps.r.ok }}", then: [{ toast: "a" }, { id: "inner", toast: "b" }], else: [] },
  { toast: "c" },
];

test("path-based edits are immutable and reach nested branches", () => {
  assert.equal((getStep(steps, [1, "then", 1]) as any).toast, "b");
  const ins = insertStep(steps, [1, "else"], 0, { toast: "e" } as any);
  assert.deepEqual((ins[1] as any).else, [{ toast: "e" }]);
  assert.deepEqual(steps[1].else, [], "original untouched");
  const rem = removeStep(steps, [1, "then", 0]);
  assert.deepEqual((rem[1] as any).then.map((s: any) => s.toast), ["b"]);
  const rep = replaceStep(steps, [2], { toast: "z" } as any);
  assert.equal((rep[2] as any).toast, "z");
  const mv = moveStep(steps, [], 2, 0);
  assert.equal((mv[0] as any).toast, "c");
  assert.equal(issuePath("ix_aaaaaaaa", [1, "then", 0]), "interactions.ix_aaaaaaaa.do[1].then[0]");
});

test("stepIdsBefore lists ids that run earlier, including earlier nested ones", () => {
  assert.deepEqual(stepIdsBefore(steps, [0]), []);
  assert.deepEqual(stepIdsBefore(steps, [1, "then", 1]), ["r"]);
  assert.deepEqual(stepIdsBefore(steps, [2]), ["r", "inner"]);
});

test("every verb has a default, fields, a label and a readable summary", () => {
  const names = (id: string) => (id === "m1" ? "Signup modal" : undefined);
  for (const verb of VERBS) {
    const step = defaultStep(verb);
    assert.ok(VERB_LABELS[verb]);
    assert.ok(FIELDS[verb].length > 0, verb);
    for (const f of FIELDS[verb]) {
      assert.ok(f.key in (VERB_SCHEMAS[verb] as any).shape, `${verb}.${f.key} is a real key`);
    }
    // Defaults are drafts: no type errors, only "incomplete" at most.
    const issues = validateInteractionMap({ ix_aaaaaaaa: { on: "click", do: [step] } });
    assert.ok(issues.every((i) => i.level === "incomplete"), `${verb}: ${JSON.stringify(issues)}`);
    assert.ok(summarize(step, names).length > 0);
  }
  assert.equal(summarize({ show: "m1" } as any, names), "Show Signup modal");
  assert.equal(summarize({ show: "gone" } as any, names), "Show missing element");
  assert.equal(summarize({ id: "r", call: "api", method: "POST", url: "/x" } as any, names), "Call API POST /x → r");
  assert.equal(summarize({ if: "{{ steps.r.ok }}", then: [] } as any, names), "If steps.r.ok");
});

test("the verb menu hides set/run until something is declared", () => {
  assert.ok(!menuVerbs({ variables: 0, flows: 0 }).includes("set"));
  assert.ok(!menuVerbs({ variables: 0, flows: 0 }).includes("run"));
  assert.ok(menuVerbs({ variables: 1, flows: 0 }).includes("set"));
  assert.ok(menuVerbs({ variables: 0, flows: 2 }).includes("run"));
});

test("headers round-trip through text", () => {
  const rec = parseHeaders("Authorization: Bearer {{ vars.token }}\n\nX-Test:1\nbroken line");
  assert.deepEqual(rec, { Authorization: "Bearer {{ vars.token }}", "X-Test": "1" });
  assert.equal(formatHeaders(rec), "Authorization: Bearer {{ vars.token }}\nX-Test: 1");
});

test("autocomplete after {{", () => {
  const ctx = { variables: ["user", "theme"], stepIds: ["signup"], elements: [{ id: "e1", name: "Email field" }] };
  assert.equal(suggest("hello", 5, ctx), null);
  assert.equal(suggest("{{ a }} x", 9, ctx), null, "outside braces");
  const roots = suggest("Hi {{ ", 6, ctx)!;
  assert.deepEqual(roots.items.map((i) => i.label), ["vars", "steps", "el", "event", "form"]);
  const vars = suggest("{{ vars.u", 9, ctx)!;
  assert.deepEqual(vars, { from: 3, items: [{ label: "user", insert: "vars.user" }] });
  assert.deepEqual(suggest("{{ steps.signup.", 16, ctx)!.items.map((i) => i.label), ["ok", "status", "data", "error"]);
  assert.deepEqual(suggest("{{ el.Em", 8, ctx)!.items, [{ label: "Email field", insert: "el.e1.", detail: "e1" }]);
  assert.deepEqual(suggest("{{ el.e1.v", 10, ctx)!.items.map((i) => i.label), ["value", "visible"]);
});

test("pick mode hands the picked id to the waiting field once", () => {
  const got: string[] = [];
  usePickStore.getState().start((id) => got.push(id));
  assert.equal(usePickStore.getState().pick("e1"), true);
  assert.equal(usePickStore.getState().pick("e2"), false);
  assert.deepEqual(got, ["e1"]);
  usePickStore.getState().start(() => got.push("x"));
  usePickStore.getState().cancel();
  assert.equal(usePickStore.getState().onPick, null);
});
```

- [ ] **Step 2: Run the tests to make sure they fail**

Run: `node --import tsx --test tests/interactions-editing.test.ts`
Expected: FAIL. The modules are not found.

- [ ] **Step 3: Implement `steps-edit.ts`**

```ts
// src/features/interactions/editing/steps-edit.ts
/**
 * Immutable edits on a nested step list, addressed by path:
 *   step path  [1, "then", 0]  → the first step of step 1's then-branch
 *   list path  [1, "then"]     → that branch; []  → the top-level list
 */
import { verbOf, type IfStep, type Step, type Verb } from "../schema";

export type StepPath = Array<number | "then" | "else">;
type Branch = "then" | "else";

const isIf = (s: Step | undefined): s is IfStep =>
  !!s && typeof s === "object" && "if" in s;

function listAt(steps: Step[], listPath: StepPath): Step[] | undefined {
  let list: Step[] | undefined = steps;
  for (let i = 0; i < listPath.length; i += 2) {
    const step: Step | undefined = list?.[listPath[i] as number];
    if (!isIf(step)) return undefined;
    list = listPath[i + 1] === "then" ? step.then : (step.else ?? []);
  }
  return list;
}

function updateList(steps: Step[], listPath: StepPath, fn: (list: Step[]) => Step[]): Step[] {
  if (listPath.length === 0) return fn(steps);
  const [index, branch, ...rest] = listPath as [number, Branch, ...StepPath];
  return steps.map((s, i) => {
    if (i !== index || !isIf(s)) return s;
    const current = branch === "then" ? s.then : (s.else ?? []);
    return { ...s, [branch]: updateList(current, rest, fn) } as Step;
  });
}

const last = (path: StepPath) => path[path.length - 1] as number;
const parent = (path: StepPath) => path.slice(0, -1);

export const getStep = (steps: Step[], path: StepPath): Step | undefined =>
  listAt(steps, parent(path))?.[last(path)];

export const insertStep = (steps: Step[], listPath: StepPath, index: number, step: Step) =>
  updateList(steps, listPath, (l) => [...l.slice(0, index), step, ...l.slice(index)]);

export const removeStep = (steps: Step[], path: StepPath) =>
  updateList(steps, parent(path), (l) => l.filter((_, i) => i !== last(path)));

export const replaceStep = (steps: Step[], path: StepPath, step: Step) =>
  updateList(steps, parent(path), (l) => l.map((s, i) => (i === last(path) ? step : s)));

export const moveStep = (steps: Step[], listPath: StepPath, from: number, to: number) =>
  updateList(steps, listPath, (l) => {
    const next = [...l];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    return next;
  });

/** The validation path of a step, to match issues to rows. */
export const issuePath = (ixId: string, path: StepPath) =>
  `interactions.${ixId}.do` +
  path.map((p) => (typeof p === "number" ? `[${p}]` : `.${p}`)).join("");

/** Ids of steps that run before `path` (what `steps.<id>` may read there). */
export function stepIdsBefore(steps: Step[], path: StepPath): string[] {
  const out: string[] = [];
  const collect = (list: Step[]) => {
    for (const s of list) {
      if (s.id) out.push(s.id);
      if (isIf(s)) {
        collect(s.then);
        collect(s.else ?? []);
      }
    }
  };
  let list = steps;
  for (let i = 0; i < path.length; i += 2) {
    const index = path[i] as number;
    collect(list.slice(0, index));
    const branch = path[i + 1] as Branch | undefined;
    const step = list[index];
    if (!branch || !isIf(step)) break;
    list = branch === "then" ? step.then : (step.else ?? []);
  }
  return out;
}

export function defaultStep(verb: Verb): Step {
  const defaults: Record<Verb, Step> = {
    navigate: { navigate: "" },
    show: { show: "" },
    hide: { hide: "" },
    toggle: { toggle: "" },
    scroll: { scroll: "" },
    modal: { modal: "open" },
    toast: { toast: "" },
    copy: { copy: "" },
    download: { download: "" },
    animate: { animate: "", preset: "fadeIn" },
    class: { class: "toggle", target: "", name: "" },
    set: { set: "", to: "" },
    call: { call: "api", method: "GET", url: "" },
    submit: { submit: "" },
    reset: { reset: "" },
    wait: { wait: 500 },
    if: { if: "", then: [], else: [] },
    run: { run: "" },
    code: { code: "" },
  };
  return structuredClone(defaults[verb]);
}

const strip = (t: string) => t.replace(/^\s*\{\{\s*|\s*\}\}\s*$/g, "");
const or = (v: unknown) => (v === undefined || v === "" ? "…" : String(v));
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** One-line sentence for a step row. */
export function summarize(step: Step, nameOf: (id: string) => string | undefined): string {
  const s = step as Record<string, any>;
  const name = (id: unknown) =>
    typeof id !== "string" || id === "" ? "…" : (nameOf(id) ?? "missing element");
  switch (verbOf(step)) {
    case "navigate": return `Go to ${or(s.navigate)}`;
    case "show": return `Show ${name(s.show)}`;
    case "hide": return `Hide ${name(s.hide)}`;
    case "toggle": return `Toggle ${name(s.toggle)}`;
    case "scroll": return typeof s.scroll === "number" ? `Scroll to ${s.scroll}px` : `Scroll to ${name(s.scroll)}`;
    case "modal": return `${cap(s.modal)} modal ${s.target ? name(s.target) : "(this element)"}`;
    case "toast": return `Show toast "${or(s.toast)}"`;
    case "copy": return `Copy "${or(s.copy)}"`;
    case "download": return `Download ${or(s.download)}`;
    case "animate": return `Animate ${name(s.animate)} (${s.preset})`;
    case "class": return `${cap(s.class)} class ${or(s.name)} on ${name(s.target)}`;
    case "set": return `Set ${or(s.set)} = ${or(s.to)}`;
    case "call": return `Call API ${s.method} ${or(s.url)}${s.id ? ` → ${s.id}` : ""}`;
    case "submit": return `Submit ${name(s.submit)}`;
    case "reset": return `Reset ${name(s.reset)}`;
    case "wait": return `Wait ${s.wait} ms`;
    case "if": return `If ${or(strip(s.if ?? ""))}`;
    case "run": return `Run flow ${or(s.run)}`;
    case "code": return "Run code";
    default: return "Invalid step";
  }
}
```

The `scroll` default is `{ scroll: "" }`. An empty element ref is "incomplete", not an error, so the "defaults are drafts" test holds.

- [ ] **Step 4: Implement `fields.ts`, `suggest.ts` and `pick-store.ts`**

```ts
// src/features/interactions/editing/fields.ts
import {
  ANIMATION_PRESETS,
  HTTP_METHODS,
  TOAST_KINDS,
  VERBS,
  type Verb,
} from "../schema";

export type FieldKind =
  | "text" | "expr" | "element" | "number" | "boolean"
  | "select" | "variable" | "flow" | "code" | "headers";

export interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  options?: readonly string[];
  optional?: boolean;
  placeholder?: string;
}

const duration: FieldDef = { key: "duration", label: "Duration (ms)", kind: "number", optional: true };

export const FIELDS: Record<Verb, FieldDef[]> = {
  navigate: [
    { key: "navigate", label: "To", kind: "expr", placeholder: "/pricing or https://…" },
    { key: "newTab", label: "Open in new tab", kind: "boolean", optional: true },
    { key: "replace", label: "Replace history", kind: "boolean", optional: true },
  ],
  show: [{ key: "show", label: "Element", kind: "element" }, duration],
  hide: [{ key: "hide", label: "Element", kind: "element" }, duration],
  toggle: [{ key: "toggle", label: "Element", kind: "element" }, duration],
  scroll: [
    { key: "scroll", label: "To element", kind: "element" },
    { key: "offset", label: "Offset (px)", kind: "number", optional: true },
    { key: "smooth", label: "Smooth", kind: "boolean", optional: true },
  ],
  modal: [
    { key: "modal", label: "Action", kind: "select", options: ["open", "close"] },
    { key: "target", label: "Modal", kind: "element", optional: true },
  ],
  toast: [
    { key: "toast", label: "Message", kind: "expr" },
    { key: "kind", label: "Kind", kind: "select", options: TOAST_KINDS, optional: true },
    { key: "duration", label: "Duration (ms)", kind: "number", optional: true },
  ],
  copy: [{ key: "copy", label: "Text", kind: "expr" }],
  download: [
    { key: "download", label: "URL", kind: "expr" },
    { key: "filename", label: "File name", kind: "expr", optional: true },
  ],
  animate: [
    { key: "animate", label: "Element", kind: "element" },
    { key: "preset", label: "Animation", kind: "select", options: ANIMATION_PRESETS },
    { key: "duration", label: "Duration (ms)", kind: "number", optional: true },
  ],
  class: [
    { key: "class", label: "Action", kind: "select", options: ["add", "remove", "toggle"] },
    { key: "target", label: "Element", kind: "element" },
    { key: "name", label: "Class", kind: "text", placeholder: "is-open" },
  ],
  set: [
    { key: "set", label: "Variable", kind: "variable" },
    { key: "to", label: "Value", kind: "expr" },
  ],
  call: [
    { key: "method", label: "Method", kind: "select", options: HTTP_METHODS },
    { key: "url", label: "URL", kind: "expr", placeholder: "/api/signup" },
    { key: "body", label: "Body", kind: "expr", optional: true, placeholder: "{{ form }}" },
    { key: "headers", label: "Headers", kind: "headers", optional: true },
    { key: "timeout", label: "Timeout (ms)", kind: "number", optional: true },
  ],
  submit: [{ key: "submit", label: "Form", kind: "element" }],
  reset: [{ key: "reset", label: "Form", kind: "element" }],
  wait: [{ key: "wait", label: "Milliseconds", kind: "number" }],
  if: [{ key: "if", label: "Condition", kind: "expr", placeholder: "{{ steps.signup.ok }}" }],
  run: [{ key: "run", label: "Flow", kind: "flow" }],
  code: [{ key: "code", label: "JavaScript", kind: "code" }],
};

export const VERB_LABELS: Record<Verb, string> = {
  navigate: "Go to page or URL", show: "Show element", hide: "Hide element",
  toggle: "Toggle element", scroll: "Scroll to", modal: "Open or close modal",
  toast: "Show toast", copy: "Copy to clipboard", download: "Download file",
  animate: "Animate element", class: "Add, remove or toggle class",
  set: "Set variable", call: "Call API", submit: "Submit form", reset: "Reset form", wait: "Wait",
  if: "If / else", run: "Run flow", code: "Run code",
};

/** Verbs offered in the menu. set/run need something declared (Plan 2). */
export function menuVerbs(ctx: { variables: number; flows: number }): Verb[] {
  return VERBS.filter(
    (v) => (v !== "set" || ctx.variables > 0) && (v !== "run" || ctx.flows > 0),
  );
}

export function parseHeaders(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const at = line.indexOf(":");
    if (at <= 0) continue;
    const key = line.slice(0, at).trim();
    if (key) out[key] = line.slice(at + 1).trim();
  }
  return out;
}

export const formatHeaders = (rec: Record<string, string>) =>
  Object.entries(rec)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
```

```ts
// src/features/interactions/editing/suggest.ts
/** Autocomplete for `{{ … }}` fields: roots, then names under each root. */
export interface SuggestContext {
  variables: string[];
  stepIds: string[];
  elements: { id: string; name: string }[];
}

export interface Suggestion {
  label: string;
  insert: string;
  detail?: string;
}

const ROOTS = ["vars", "steps", "el", "event", "form"];
const STEP_FIELDS = ["ok", "status", "data", "error"];
const EL_FIELDS = ["value", "checked", "visible", "text"];
const EVENT_FIELDS = ["value", "checked", "key"];

const starts = (s: string, prefix: string) => s.toLowerCase().startsWith(prefix.toLowerCase());

export function suggest(
  text: string,
  caret: number,
  ctx: SuggestContext,
): { from: number; items: Suggestion[] } | null {
  const before = text.slice(0, caret);
  const open = before.lastIndexOf("{{");
  if (open < 0 || before.indexOf("}}", open) >= 0) return null;
  const token = /[A-Za-z_$][\w$]*(?:\.[\w$]*)*$/.exec(before.slice(open + 2))?.[0] ?? "";
  const from = caret - token.length;
  const [root, ...rest] = token.split(".");
  let items: Suggestion[] = [];

  if (rest.length === 0) {
    items = ROOTS.filter((r) => starts(r, root)).map((r) => ({ label: r, insert: `${r}.` }));
  } else if (rest.length === 1) {
    const p = rest[0];
    if (root === "vars") {
      items = ctx.variables.filter((v) => starts(v, p)).map((v) => ({ label: v, insert: `vars.${v}` }));
    } else if (root === "steps") {
      items = ctx.stepIds.filter((v) => starts(v, p)).map((v) => ({ label: v, insert: `steps.${v}.` }));
    } else if (root === "el") {
      items = ctx.elements
        .filter((e) => starts(e.name, p) || starts(e.id, p))
        .map((e) => ({ label: e.name, insert: `el.${e.id}.`, detail: e.id }));
    } else if (root === "event") {
      items = EVENT_FIELDS.filter((f) => starts(f, p)).map((f) => ({ label: f, insert: `event.${f}` }));
    }
  } else if (rest.length === 2) {
    const [name, p] = rest;
    const pool = root === "steps" ? STEP_FIELDS : root === "el" ? EL_FIELDS : [];
    items = pool.filter((f) => starts(f, p)).map((f) => ({ label: f, insert: `${root}.${name}.${f}` }));
  }
  return items.length ? { from, items } : null;
}
```

```ts
// src/features/interactions/editing/pick-store.ts
import { create } from "zustand";

interface PickState {
  /** Set while a field waits for the maker to click an element on the canvas. */
  onPick: ((id: string) => void) | null;
  start(cb: (id: string) => void): void;
  cancel(): void;
  /** Hands `id` to the waiting field. Returns false when nothing is waiting. */
  pick(id: string): boolean;
}

export const usePickStore = create<PickState>()((set, get) => ({
  onPick: null,
  start: (cb) => set({ onPick: cb }),
  cancel: () => set({ onPick: null }),
  pick: (id) => {
    const cb = get().onPick;
    if (!cb) return false;
    set({ onPick: null });
    cb(id);
    return true;
  },
}));
```

- [ ] **Step 5: Run the tests to make sure they pass**

Run: `node --import tsx --test tests/interactions-editing.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 6: Commit**

```bash
git add src/features/interactions/editing tests/interactions-editing.test.ts
git commit -m "feat(interactions): editing model for the Interact tab

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: The Interact tab

**Files:**
- Create: `src/features/interactions/components/InteractTab.tsx`
- Create: `src/features/interactions/components/InteractionCard.tsx`
- Create: `src/features/interactions/components/StepList.tsx`
- Create: `src/features/interactions/components/StepForm.tsx`
- Create: `src/features/interactions/components/VerbMenu.tsx`
- Create: `src/features/interactions/components/ExpressionInput.tsx`
- Create: `src/features/interactions/components/ElementRefInput.tsx`
- Modify: `src/features/editor/components/sidebar/Inspector.tsx:12-13, 65-72, 99-100`

**Interfaces:**
- Consumes:
  - Tasks 2, 3, 9 and 10: `getInteractions`, `addInteraction`, `updateInteraction`, `removeInteraction`, `commit`, `validateInteractionMap`, `referenceWarnings`, `ON_EVENTS`, the editing helpers and `usePickStore`.
  - From the editor: `useSelectedElement`, `useElements` (`@/features/editor`); `elementHelper` (`@/features/editor/utils/element/elementhelper`).
- Produces: `InteractTab` (default export), lazily loaded by the Inspector.

This task is UI. Its logic is already unit-tested in Tasks 9–10. You verify it by typechecking and by the manual checklist in Step 9.

- [ ] **Step 1: `ExpressionInput`**

```tsx
// src/features/interactions/components/ExpressionInput.tsx
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { suggest, type SuggestContext, type Suggestion } from "../editing/suggest";

interface Props {
  value: string;
  onChange(value: string): void;
  ctx: SuggestContext;
  placeholder?: string;
  multiline?: boolean;
  invalid?: boolean;
  "aria-label": string;
}

/** Text field with `{{` autocomplete. */
export function ExpressionInput({ value, onChange, ctx, placeholder, multiline, invalid, ...rest }: Props) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [menu, setMenu] = useState<{ from: number; items: Suggestion[] } | null>(null);
  const [active, setActive] = useState(0);

  const refresh = (text: string, caret: number) => {
    setMenu(suggest(text, caret, ctx));
    setActive(0);
  };

  const apply = (item: Suggestion) => {
    const node = ref.current;
    if (!node || !menu) return;
    const caret = node.selectionStart ?? value.length;
    const next = value.slice(0, menu.from) + item.insert + value.slice(caret);
    onChange(next);
    const pos = menu.from + item.insert.length;
    requestAnimationFrame(() => {
      node.setSelectionRange(pos, pos);
      refresh(next, pos);
    });
  };

  const common = {
    ref,
    value,
    placeholder,
    "aria-invalid": invalid || undefined,
    "aria-label": rest["aria-label"],
    className: cn("font-mono", invalid && "border-destructive"),
    onChange: (e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) => {
      onChange(e.target.value);
      refresh(e.target.value, e.target.selectionStart ?? e.target.value.length);
    },
    onBlur: () => setTimeout(() => setMenu(null), 120),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!menu) return;
      if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % menu.items.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + menu.items.length) % menu.items.length); }
      else if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); apply(menu.items[active]); }
      else if (e.key === "Escape") setMenu(null);
    },
  };

  return (
    <div className="relative">
      {multiline ? <Textarea rows={3} {...common} /> : <Input {...common} />}
      {menu && (
        <ul role="listbox" className="absolute left-0 right-0 top-full z-50 mt-1 max-h-40 overflow-y-auto rounded-md border border-border bg-popover py-1 text-[11px] shadow-md">
          {menu.items.map((item, i) => (
            <li
              key={item.insert}
              role="option"
              aria-selected={i === active}
              className={cn("flex cursor-pointer justify-between gap-2 px-2 py-1", i === active && "bg-accent")}
              onMouseDown={(e) => { e.preventDefault(); apply(item); }}
            >
              <span className="font-mono">{item.label}</span>
              {item.detail && <span className="truncate text-muted-foreground">{item.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `ElementRefInput`**

```tsx
// src/features/interactions/components/ElementRefInput.tsx
import { useEffect } from "react";
import { Crosshair, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePickStore } from "../editing/pick-store";

interface Props {
  value: string;
  onChange(id: string): void;
  elements: { id: string; name: string }[];
  "aria-label": string;
}

/** Choose an element from a list, or pick it by clicking it on the canvas. */
export function ElementRefInput({ value, onChange, elements, ...rest }: Props) {
  const picking = usePickStore((s) => s.onPick !== null);
  const start = usePickStore((s) => s.start);
  const cancel = usePickStore((s) => s.cancel);
  const exists = !value || elements.some((e) => e.id === value);

  useEffect(() => {
    if (!picking) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && cancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picking, cancel]);

  return (
    <div className="flex items-center gap-1">
      <Select value={exists ? value : ""} onValueChange={onChange}>
        <SelectTrigger aria-label={rest["aria-label"]} className={cn("min-w-0 flex-1", !exists && "border-amber-500")}>
          <SelectValue placeholder={exists ? "Choose element" : "Missing element"} />
        </SelectTrigger>
        <SelectContent>
          {elements.map((e) => (
            <SelectItem key={e.id} value={e.id} className="text-[11px]">{e.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {!exists && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-label="Missing element" />}
      <Button
        type="button"
        variant={picking ? "default" : "outline"}
        size="icon"
        className="h-7 w-7 shrink-0"
        aria-label={picking ? "Cancel picking" : "Pick on canvas"}
        title={picking ? "Click an element on the canvas (Esc to cancel)" : "Pick on canvas"}
        onClick={() => (picking ? cancel() : start(onChange))}
      >
        <Crosshair className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: `StepForm`**

```tsx
// src/features/interactions/components/StepForm.tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { verbOf, type Issue, type Step } from "../schema";
import { FIELDS, formatHeaders, parseHeaders, type FieldDef } from "../editing/fields";
import type { SuggestContext } from "../editing/suggest";
import { ExpressionInput } from "./ExpressionInput";
import { ElementRefInput } from "./ElementRefInput";

interface Props {
  step: Step;
  onChange(step: Step): void;
  issues: Issue[];           // issues for this step only (path === stepPath or startsWith stepPath + ".")
  stepPath: string;
  suggestCtx: SuggestContext;
  variables: string[];
  flows: string[];
}

export function StepForm({ step, onChange, issues, stepPath, suggestCtx, variables, flows }: Props) {
  const verb = verbOf(step);
  if (!verb) return <p className="text-[11px] text-destructive">This step is not valid.</p>;
  const s = step as Record<string, unknown>;
  const set = (key: string, v: unknown) => {
    const next = { ...s };
    if (key === "id" && !v) {
      delete next.id;
      onChange(next as Step);
      return;
    }
    if (v === undefined || v === "") {
      const def = FIELDS[verb].find((f) => f.key === key);
      if (def?.optional) delete next[key];
      else next[key] = v ?? "";
    } else next[key] = v;
    onChange(next as Step);
  };
  const issueFor = (key: string) => issues.find((i) => i.path === `${stepPath}.${key}`);

  const field = (f: FieldDef) => {
    const id = `${stepPath}.${f.key}`;
    const value = s[f.key];
    const issue = issueFor(f.key);
    const label = `${f.label}${f.optional ? " (optional)" : ""}`;
    let control: React.ReactNode;
    switch (f.kind) {
      case "expr":
        control = <ExpressionInput aria-label={f.label} value={String(value ?? "")} onChange={(v) => set(f.key, v)} ctx={suggestCtx} placeholder={f.placeholder} multiline={f.key === "body"} invalid={issue?.level !== "warning" && !!issue} />;
        break;
      case "element":
        control = <ElementRefInput aria-label={f.label} value={typeof value === "string" ? value : ""} onChange={(v) => set(f.key, v)} elements={suggestCtx.elements} />;
        break;
      case "number":
        control = <Input id={id} type="number" value={value === undefined ? "" : String(value)} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value === "" ? undefined : Number(e.target.value))} />;
        break;
      case "boolean":
        control = <Switch id={id} checked={value === true} onCheckedChange={(c) => set(f.key, c || undefined)} />;
        break;
      case "select":
      case "variable":
      case "flow": {
        const options = f.kind === "variable" ? variables : f.kind === "flow" ? flows : (f.options ?? []);
        control = (
          <Select value={typeof value === "string" ? value : ""} onValueChange={(v) => set(f.key, v)}>
            <SelectTrigger id={id} aria-label={f.label}><SelectValue placeholder="Choose" /></SelectTrigger>
            <SelectContent>
              {options.map((o) => <SelectItem key={o} value={o} className="text-[11px]">{o}</SelectItem>)}
            </SelectContent>
          </Select>
        );
        break;
      }
      case "headers":
        control = <Textarea id={id} rows={2} className="font-mono" placeholder="Authorization: Bearer {{ vars.token }}" value={formatHeaders((value as Record<string, string>) ?? {})} onChange={(e) => { const rec = parseHeaders(e.target.value); set(f.key, Object.keys(rec).length ? rec : undefined); }} />;
        break;
      case "code":
        control = <Textarea id={id} rows={4} className="font-mono" value={String(value ?? "")} onChange={(e) => set(f.key, e.target.value)} />;
        break;
      default:
        control = <Input id={id} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
    }
    return (
      <div key={f.key} className={f.kind === "boolean" ? "flex items-center justify-between gap-2" : "space-y-1"}>
        <Label htmlFor={id} className="text-[11px] text-muted-foreground">{label}</Label>
        {control}
        {issue && (
          <p className={issue.level === "warning" ? "text-[10px] text-amber-600" : "text-[10px] text-destructive"}>
            {issue.message}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-2 pt-2">
      {FIELDS[verb].map(field)}
      <div className="space-y-1">
        <Label htmlFor={`${stepPath}.id`} className="text-[11px] text-muted-foreground">Result name (optional)</Label>
        <Input id={`${stepPath}.id`} className="font-mono" placeholder="e.g. signup" value={typeof s.id === "string" ? s.id : ""} onChange={(e) => set("id", e.target.value || undefined)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: `VerbMenu`**

```tsx
// src/features/interactions/components/VerbMenu.tsx
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import type { Verb } from "../schema";
import { VERB_LABELS } from "../editing/fields";

export function VerbMenu({ verbs, onPick, label = "Add step" }: { verbs: Verb[]; onPick(verb: Verb): void; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 gap-1 px-2 text-[11px] text-muted-foreground">
          <Plus className="h-3 w-3" /> {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 p-0" align="start">
        <Command>
          <CommandInput placeholder="Search actions…" className="text-[11px]" />
          <CommandList>
            <CommandEmpty>No action found.</CommandEmpty>
            <CommandGroup>
              {verbs.map((v) => (
                <CommandItem key={v} value={`${v} ${VERB_LABELS[v]}`} className="text-[11px]" onSelect={() => { onPick(v); setOpen(false); }}>
                  {VERB_LABELS[v]}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 5: `StepList` (recursive, with drag to reorder)**

```tsx
// src/features/interactions/components/StepList.tsx
import { useState } from "react";
import { ChevronRight, GripVertical, Trash2, Copy, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { verbOf, type IfStep, type Issue, type Step } from "../schema";
import {
  defaultStep, insertStep, issuePath, moveStep, removeStep, replaceStep, stepIdsBefore, summarize, type StepPath,
} from "../editing/steps-edit";
import type { SuggestContext } from "../editing/suggest";
import { StepForm } from "./StepForm";
import { VerbMenu } from "./VerbMenu";
import type { Verb } from "../schema";

export interface StepListShared {
  ixId: string;
  root: Step[];                      // the interaction's whole `do` list
  onRootChange(next: Step[]): void;
  issues: Issue[];
  nameOf(id: string): string | undefined;
  elements: { id: string; name: string }[];
  variables: string[];
  flows: string[];
  verbs: Verb[];
}

export function StepList({ listPath, steps, shared }: { listPath: StepPath; steps: Step[]; shared: StepListShared }) {
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  return (
    <div className="space-y-1">
      <ol className="space-y-1">
        {steps.map((step, i) => (
          <li
            key={i}
            onDragOver={(e) => dragFrom !== null && e.preventDefault()}
            onDrop={() => {
              if (dragFrom !== null && dragFrom !== i) shared.onRootChange(moveStep(shared.root, listPath, dragFrom, i));
              setDragFrom(null);
            }}
          >
            <StepRow step={step} path={[...listPath, i]} index={i} shared={shared} onDragStart={() => setDragFrom(i)} />
          </li>
        ))}
      </ol>
      <VerbMenu verbs={shared.verbs} onPick={(v) => shared.onRootChange(insertStep(shared.root, listPath, steps.length, defaultStep(v)))} />
    </div>
  );
}

function StepRow({ step, path, index, shared, onDragStart }: { step: Step; path: StepPath; index: number; shared: StepListShared; onDragStart(): void }) {
  const [open, setOpen] = useState(false);
  const p = issuePath(shared.ixId, path);
  const mine = shared.issues.filter((i) => i.path === p || i.path.startsWith(`${p}.`) && !i.path.slice(p.length).match(/^\.(then|else)\[/));
  const worst = mine.some((i) => i.level !== "warning") ? "error" : mine.length ? "warning" : null;
  const isIf = verbOf(step) === "if";
  const suggestCtx: SuggestContext = { variables: shared.variables, stepIds: stepIdsBefore(shared.root, path), elements: shared.elements };

  return (
    <div className="rounded-md border border-border bg-background">
      <div className="flex items-center gap-1 px-1 py-1">
        <span draggable onDragStart={onDragStart} className="cursor-grab text-muted-foreground" aria-label="Drag to reorder">
          <GripVertical className="h-3.5 w-3.5" />
        </span>
        <button type="button" className="flex min-w-0 flex-1 items-center gap-1 text-left text-[11px]" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          <ChevronRight className={cn("h-3 w-3 shrink-0 transition-transform", open && "rotate-90")} />
          <span className="w-4 shrink-0 text-muted-foreground">{index + 1}</span>
          <span className="truncate">{summarize(step, shared.nameOf)}</span>
        </button>
        {worst && <AlertTriangle className={cn("h-3.5 w-3.5 shrink-0", worst === "error" ? "text-destructive" : "text-amber-500")} aria-label={mine[0].message} />}
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Duplicate step" onClick={() => shared.onRootChange(insertStep(shared.root, path.slice(0, -1), index + 1, structuredClone(step)))}>
          <Copy className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Delete step" onClick={() => shared.onRootChange(removeStep(shared.root, path))}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {open && (
        <div className="border-t border-border px-2 pb-2">
          <StepForm
            step={step}
            stepPath={p}
            issues={mine}
            onChange={(next) => shared.onRootChange(replaceStep(shared.root, path, next))}
            suggestCtx={suggestCtx}
            variables={shared.variables}
            flows={shared.flows}
          />
        </div>
      )}
      {isIf && (
        <div className="space-y-1 border-t border-border py-1 pl-4 pr-1">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Then</p>
          <StepList listPath={[...path, "then"]} steps={(step as IfStep).then} shared={shared} />
          <p className="text-[10px] font-semibold uppercase text-muted-foreground">Else</p>
          <StepList listPath={[...path, "else"]} steps={(step as IfStep).else ?? []} shared={shared} />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: `InteractionCard` and `InteractTab`**

```tsx
// src/features/interactions/components/InteractionCard.tsx
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KEY_EVENTS, ON_EVENTS, type Interaction, type OnEvent, type Step } from "../schema";
import { StepList, type StepListShared } from "./StepList";

export const EVENT_LABELS: Record<OnEvent, string> = {
  click: "Clicked", dblclick: "Double-clicked", mousedown: "Mouse pressed", mouseup: "Mouse released",
  mouseenter: "Hovered", mouseleave: "Hover ends",
  focus: "Focused", blur: "Loses focus", change: "Changed", input: "Typed into",
  submit: "Submitted", keydown: "Key pressed", keyup: "Key released", load: "Page loads",
  error: "Fails to load", visible: "Scrolled into view",
};

interface Props {
  ixId: string;
  ix: Interaction;
  onChange(patch: Partial<Interaction>): void;
  onRemove(): void;
  shared: Omit<StepListShared, "ixId" | "root" | "onRootChange">;
}

export function InteractionCard({ ixId, ix, onChange, onRemove, shared }: Props) {
  const steps = Array.isArray(ix.do) ? ix.do : [];
  return (
    <section aria-label={`When ${EVENT_LABELS[ix.on] ?? ix.on}`} className="space-y-2 rounded-md border border-border p-2">
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-muted-foreground">When</span>
        <Select
          value={ix.on}
          onValueChange={(v) =>
            // key and once belong to specific events: drop them when they no longer apply.
            onChange({
              on: v as OnEvent,
              ...(KEY_EVENTS.has(v) ? {} : { key: undefined }),
              ...(v === "visible" ? {} : { once: undefined }),
            })
          }
        >
          <SelectTrigger aria-label="Event" className="h-7 min-w-0 flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {ON_EVENTS.map((e) => <SelectItem key={e} value={e} className="text-[11px]">{EVENT_LABELS[e]}</SelectItem>)}
          </SelectContent>
        </Select>
        <Switch aria-label="Enabled" checked={ix.enabled !== false} onCheckedChange={(c) => onChange({ enabled: c ? undefined : false })} />
        <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Delete interaction" onClick={onRemove}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      {KEY_EVENTS.has(ix.on) && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={`${ixId}.key`} className="text-[11px] text-muted-foreground">Only key</Label>
          <Input
            id={`${ixId}.key`}
            className="h-7 flex-1 font-mono"
            placeholder="Any key (e.g. Enter, Escape, a)"
            value={ix.key ?? ""}
            onChange={(e) => onChange({ key: e.target.value || undefined })}
          />
        </div>
      )}
      {ix.on === "visible" && (
        <div className="flex items-center justify-between gap-1.5">
          <Label htmlFor={`${ixId}.once`} className="text-[11px] text-muted-foreground">Only the first time</Label>
          <Switch id={`${ixId}.once`} checked={ix.once !== false} onCheckedChange={(c) => onChange({ once: c ? undefined : false })} />
        </div>
      )}
      <StepList
        listPath={[]}
        steps={steps}
        shared={{ ...shared, ixId, root: steps, onRootChange: (next: Step[]) => onChange({ do: next }) }}
      />
    </section>
  );
}
```

`onChange({ enabled: undefined })` leaves `enabled: undefined` in the object. `patchWithDeletions` treats an `undefined` value as removed and sends `null`, so the key is dropped on the server. That is the intended behaviour.

```tsx
// src/features/interactions/components/InteractTab.tsx
import { useMemo } from "react";
import { toast } from "sonner";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EditorElement } from "@/types/global.type";
import { useElements, useSelectedElement } from "@/features/editor";
import { validateInteractionMap, type Interaction } from "../schema";
import { referenceWarnings } from "../references";
import { addInteraction, getInteractions, removeInteraction, updateInteraction, type OpResult } from "../ops";
import { commit } from "../ops-store";
import { menuVerbs } from "../editing/fields";
import { InteractionCard } from "./InteractionCard";

function flatten(tree: EditorElement[]): { id: string; name: string }[] {
  const out: { id: string; name: string }[] = [];
  const visit = (list: EditorElement[]) => {
    for (const el of list) {
      out.push({ id: el.id, name: el.name || `${el.type} ${el.id.slice(0, 4)}` });
      const kids = (el as unknown as { elements?: EditorElement[] }).elements;
      if (Array.isArray(kids)) visit(kids);
    }
  };
  visit(tree);
  return out;
}

// Plan 2 supplies page/project variables and flows here.
const NO_NAMES: string[] = [];

export default function InteractTab() {
  const selected = useSelectedElement();
  const tree = useElements();
  const elements = useMemo(() => flatten(tree), [tree]);
  const names = useMemo(() => new Map(elements.map((e) => [e.id, e.name])), [elements]);
  const map = getInteractions(selected);

  const issues = useMemo(
    () => [
      ...validateInteractionMap(map),
      ...referenceWarnings(map, {
        elementIds: new Set(names.keys()),
        variables: new Set(NO_NAMES),
        flows: new Set(NO_NAMES),
      }),
    ],
    [map, names],
  );

  if (!selected) return null;

  const apply = (change: (el: EditorElement) => OpResult) => {
    const r = commit(selected.id, change);
    if (!r.ok) toast.error(r.issues[0]?.message ?? "That change isn't valid");
  };
  const shared = {
    issues,
    nameOf: (id: string) => names.get(id),
    elements,
    variables: NO_NAMES,
    flows: NO_NAMES,
    verbs: menuVerbs({ variables: NO_NAMES.length, flows: NO_NAMES.length }),
  };
  const entries = Object.entries(map);

  return (
    <div className="space-y-2 p-3">
      {entries.length === 0 && (
        <div className="flex flex-col items-center gap-1 py-6 text-center text-[11px] text-muted-foreground">
          <Zap className="h-4 w-4" />
          <p>Nothing happens when people interact with this element yet.</p>
        </div>
      )}
      {entries.map(([ixId, ix]) => (
        <InteractionCard
          key={ixId}
          ixId={ixId}
          ix={ix}
          shared={shared}
          onChange={(patch: Partial<Interaction>) =>
            apply((el) => updateInteraction(el, ixId, patch, { allowIncomplete: true }))
          }
          onRemove={() => apply((el) => removeInteraction(el, ixId))}
        />
      ))}
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-full gap-1 text-[11px]"
        onClick={() => apply((el) => addInteraction(el, "click", [], { allowIncomplete: true }))}
      >
        <Plus className="h-3 w-3" /> Add interaction
      </Button>
    </div>
  );
}
```

If `useElements` or `useSelectedElement` isn't re-exported from `@/features/editor`, import them from `@/features/editor/store/selectors/element-selectors` and `…/selection-selectors`. `Inspector.tsx` already imports `useSelectedElement` from `@/features/editor`.

- [ ] **Step 7: Add the tab to the Inspector**

In `src/features/editor/components/sidebar/Inspector.tsx`:

1. After line 13 (`const StyleTab = …`), add:

```tsx
const InteractTab = React.lazy(() => import("@/features/interactions/components/InteractTab"));
```

2. After the Settings `TabsTrigger` (line 71), add:

```tsx
              <TabsTrigger value="interact" className="px-1.5 text-[11px]">
                Interact
              </TabsTrigger>
```

3. After the Settings `TabsContent` closes (line 99), add:

```tsx
          <TabsContent
            value="interact"
            className={`min-h-0 flex-1 overflow-x-hidden overflow-y-auto ${DENSE}`}
          >
            <Suspense fallback={<Fallback />}>
              <InteractTab key={selected.id} />
            </Suspense>
          </TabsContent>
```

- [ ] **Step 8: Typecheck and run the unit tests**

Run: `bunx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "src/features/interactions|Inspector.tsx" || echo "no errors in touched files"`
Expected: `no errors in touched files`

Run: `bun run test:unit`
Expected: all tests pass.

- [ ] **Step 9: Manual check in the dev server (no Clerk automation)**

Run `bun run dev`, sign in yourself in your own browser, and open a project's editor. Check each of these:

1. Select a button. Inspector → **Interact** → **Add interaction**. A "When Clicked" card appears.
2. **Add step → Show toast**, then type `Hi {{ ` in Message. The roots `vars steps el event form` appear. Pick one and the text is inserted.
3. Leave Message empty and collapse the row. The row shows a red ⚠ (incomplete).
4. **Add step → If / else**. Then and Else lists appear indented, and each has its own **Add step**.
5. Drag a step by its grip above another step. The order changes.
6. Press Ctrl/Cmd+Z. The last edit is undone.
7. Turn on events with the ⚡ toggle in the top bar and click the button. The toast shows and the **Run log** button appears bottom-right. The log lists `ok toast ix_….do[0]`.
8. On an input, set the event to **Key pressed** and **Only key** to `Enter`. Typing letters does nothing, but Enter runs the steps. Switch the event to **Clicked**: the key field disappears and the key is dropped.
9. On an element below the fold, set the event to **Scrolled into view**. Scrolling to it runs once. Turn off **Only the first time**: it runs again each time it comes back into view.
10. On an image with a broken source, set the event to **Fails to load** and reload Preview. The steps run.

- [ ] **Step 10: Commit**

```bash
git add src/features/interactions/components/InteractTab.tsx src/features/interactions/components/InteractionCard.tsx src/features/interactions/components/StepList.tsx src/features/interactions/components/StepForm.tsx src/features/interactions/components/VerbMenu.tsx src/features/interactions/components/ExpressionInput.tsx src/features/interactions/components/ElementRefInput.tsx src/features/editor/components/sidebar/Inspector.tsx
git commit -m "feat(interactions): Interact tab in the Inspector

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Pick from canvas, and the ⚡ marker

**Files:**
- Modify: `src/features/editor/components/canvas/CanvasInteractionLayer.tsx` (handlers near lines 124–144, root div at line 257)
- Modify: `src/features/editor/components/resizehandler/ElementLabel.tsx:38`

**Interfaces:**
- Consumes: `usePickStore` (Task 10), `hasInteractions` (Task 9).

- [ ] **Step 1: Click-to-pick on the canvas**

In `CanvasInteractionLayer.tsx`, add this import:

```tsx
import { usePickStore } from "@/features/interactions/editing/pick-store";
```

After `onContextMenu` (around line 144), add:

```tsx
  // While a field in the Interact tab is waiting for an element, a click
  // picks the element under the cursor instead of doing anything else.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!usePickStore.getState().onPick) return;
    const id = elementNodeFrom(root, e.target)?.dataset.elementId;
    if (!id) return;
    e.preventDefault();
    e.stopPropagation();
    usePickStore.getState().pick(id);
  };
  const picking = usePickStore((s) => s.onPick !== null);
```

On the root `<div ref={setRoot} data-canvas-root …>` (line 257), add:

```tsx
      onClickCapture={onClickCapture}
      data-picking={picking || undefined}
      style={picking ? { cursor: "crosshair" } : undefined}
```

Put the `usePickStore` hook call with the other hooks at the top of the component, not inside a handler.

- [ ] **Step 2: ⚡ marker on the label**

In `ElementLabel.tsx`, add these imports:

```tsx
import { Zap } from "lucide-react";
import { hasInteractions } from "@/features/interactions/ops";
```

After the type `<span>` (line 38), add:

```tsx
      {hasInteractions(element) && (
        <Zap size={10} strokeWidth={3} aria-label="Has interactions" className="shrink-0" />
      )}
```

- [ ] **Step 3: Typecheck and run the unit tests**

Run: `bunx tsc --noEmit -p tsconfig.json 2>&1 | grep -E "CanvasInteractionLayer|ElementLabel" || echo "no errors in touched files"`
Expected: `no errors in touched files`

Run: `bun run test:unit`
Expected: all pass.

- [ ] **Step 4: Manual check**

1. In the editor, add a **Show element** step and press the crosshair. The cursor becomes a crosshair over the canvas.
2. Click another element. The field now shows that element's name, and the selection did not change.
3. Press the crosshair again, then Esc. Picking is cancelled.
4. Select an element that has interactions. Its blue label shows ⚡.
5. Delete the picked target element. The step row shows an amber ⚠ and the field says "Missing element".
6. With events on, the step is skipped and the run log says why.

- [ ] **Step 5: Commit**

```bash
git add src/features/editor/components/canvas/CanvasInteractionLayer.tsx src/features/editor/components/resizehandler/ElementLabel.tsx
git commit -m "feat(interactions): pick elements on the canvas and mark elements with interactions

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Real-server integration test

**Files:**
- Modify: `tests/integration/realtime-server.itest.ts` (append one test at the end)

**Interfaces:**
- Consumes: `addInteraction`, `removeInteraction` (Task 9); `commit` with a store argument (Task 9); the file's existing helpers `nextPage`, `connect`, `el`, `uid`, `until`, `saved`.

- [ ] **Step 1: Write the test**

Append to `tests/integration/realtime-server.itest.ts`:

```ts
test('two people adding different interactions to one element both keep theirs; removal and undo sync', async () => {
  const page = nextPage();
  const a = await connect('alice', page);
  const b = await connect('bob', page);
  a.store.getState().addElement(el('btn', { pageId: page }));
  await until(() => b.tree.length === 1, 'bob sees the element');

  const { addInteraction, removeInteraction } = await import('../../src/features/interactions/ops');
  const { commit } = await import('../../src/features/interactions/ops-store');
  const count = (tree: any[]) => Object.keys(tree[0]?.settings?.interactions ?? {}).length;

  // Both edit before seeing each other's change.
  const ra = commit(uid('btn'), (e) => addInteraction(e, 'click', [{ toast: 'from alice' }]), a.store);
  const rb = commit(uid('btn'), (e) => addInteraction(e, 'mouseenter', [{ toast: 'from bob' }]), b.store);
  assert.ok(ra.ok && rb.ok);
  await until(() => count(a.tree) === 2 && count(b.tree) === 2, 'both see both interactions');
  assert.equal(count(await saved(page)), 2, 'server keeps both');

  commit(uid('btn'), (e) => removeInteraction(e, ra.id!), a.store);
  await until(() => count(b.tree) === 1, 'bob sees the removal');
  assert.deepEqual(Object.keys((await saved(page))[0].settings.interactions), [rb.id]);

  a.store.getState().undo();
  await until(() => count(b.tree) === 2, 'bob sees the undo');
  assert.equal(count(await saved(page)), 2, 'server restores it');
  assert.equal(a.failures.length + b.failures.length, 0);
});
```

- [ ] **Step 2: Run it**

Docker must be running.

Run: `bun run test:integration`
Expected: all 6 tests pass, including the new one.

If the new test times out at "both see both interactions", find out whether the server merges `settings`. Look for `MergeMap` on `Settings` in `~/Code/Go/webbuilder.realtimev2.go/internal/utils/element/element.go`. **Do not change the Go code in this plan.** Report back instead.

- [ ] **Step 3: Commit**

```bash
git add tests/integration/realtime-server.itest.ts
git commit -m "test(interactions): concurrent interaction edits, removal and undo against the real server

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: Final verification

Verification rerun on 2026-11-14 against the current cutover: 328 unit tests passed, TypeScript reported no errors, schema generation produced no changes, and the integration suite passed (one API smoke test and seven multi-client tests). The authenticated manual checks in Tasks 11 and 12 still need a person. Plans 2 and 3 were subsequently implemented; legacy storage and REST reads remain until after the compatibility release.

With the user's permission, four unauthenticated local browser fixture tests also passed: interaction editing, preview form submission and animation, event dispatch, and canvas picking/cancellation/label. The picking fixture's Vite dependency scan reported missing stub exports and skipped pre-bundling before the test passed. These fixtures do not cover every Task 11 and 12 manual scenario in the signed-in editor.

- [x] **Step 1: Full unit suite**

Run: `bun run test:unit`
Expected: all tests pass. That is 157 existing tests plus the new interaction tests, with 0 failures.

- [x] **Step 2: Typecheck**

Run: `bunx tsc --noEmit -p tsconfig.json 2>&1 | grep -c "error TS"`
Expected: the same count as on `editor-redesign` before Task 1. Record the baseline before starting Task 1 with the same command. There must be no errors in `src/features/interactions/**`.

- [x] **Step 3: Schema is current**

Run: `bun run interactions:schema && git status --short public/interactions.schema.json`
Expected: no output, which means the file is unchanged.

- [x] **Step 4: Integration suite**

Run: `bun run test:integration`
Expected: all tests pass.

- [ ] **Step 5: Report**

Report these to the user:

- the test counts;
- the manual checks from Tasks 11 and 12 that were done, and which still need a person;
- that Plan 2 (Logic documents) and Plan 3 (codegen, migration and removal) remain.

Do not push.
