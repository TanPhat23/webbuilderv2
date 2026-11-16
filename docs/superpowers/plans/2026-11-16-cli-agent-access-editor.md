# CLI Agent Access, Part 3: the editor (`webbuilderv2`)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The editor tab becomes the place a CLI's edits are applied: it validates them, checks the user's permission, applies them as one undo step, answers over the collaboration socket, and gives the user a panel to create tokens and copy the connect commands.

**Architecture:** Pure edit operations and a tool executor (`src/features/agent/`), an `agent:request` channel on the existing collaboration provider, a host component that registers the live editor, and a "Connect your CLI" dialog in the top bar.

**Tech Stack:** TypeScript, React 19, zustand, `node --import tsx --test`.

**Overview, global constraints and Review Focus:** `docs/superpowers/plans/2026-11-16-cli-agent-access.md` (read it first; its constraints apply to every task here).

**Spec:** `docs/superpowers/specs/2026-11-16-cli-agent-access-design.md`

Paths used below: `WEB=/home/ghug/Code/Go/webbuilder/webbuilderv2`. Tasks E1-E3 need no running backend. Task E4's end-to-end check needs Plans 1 and 2 finished (the MCP service, the API with migration `00005`, Postgres and Redis).

Backend wire contract these tasks implement against: the realtime socket delivers `{type: "agent:request", requestId, projectId, pageId, payload: {tool, args, pageId}}` and expects `{type: "agent:response", requestId, payload: {ok, result | error: {code, message, issues?[{path, message}]}}}`. `apply_edits` args are `{operations: EditOp[]}` and `set_code` args are `{code: string}`; the operation shapes are the JSON the MCP service validates in its Task M7.

Branch: Task E1 Step 0 creates `feat/agent-cli-access`.

---

### Task E1: Pure edit operations

**Files:**
- Create: `$WEB/src/features/agent/protocol.ts`, `$WEB/src/features/agent/editOps.ts`
- Test: `$WEB/tests/agent-edit-ops.test.ts`

**Interfaces:**
- Consumes: `newEntityId()` from `@/lib/entity-id`; `HIDDEN_SETTINGS` (iterable of strings) from `@/features/editor/lib/code/customCode`; elements nest under `elements`, each carries `parentId`.
- Produces:

```ts
// protocol.ts
export interface AgentIssue { path: string; message: string }
export interface AgentRequest { requestId: string; tool: string; pageId?: string; args: unknown }
export type AgentOutcome =
  | { ok: true; result: unknown }
  | { ok: false; error: { code: string; message: string; issues?: AgentIssue[] } };
// editOps.ts
export const AGENT_ELEMENT_TYPES: readonly string[];
export const MAX_OPS = 200;
export interface NewElementInput { type: string; name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface ElementPatch { name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface EditOp { op: "create" | "update" | "move" | "delete"; id?: string; ref?: string; parentId?: string | null; index?: number; element?: NewElementInput; set?: ElementPatch }
export type EditResult =
  | { ok: true; elements: EditorElement[]; created: { ref?: string; id: string }[]; changes: number }
  | { ok: false; issues: AgentIssue[] };
export function applyEdits(current: EditorElement[], ops: unknown, pageId: string): EditResult;
```

- [ ] **Step 0: Commit the code-editing work this depends on**

The earlier code-editing work (`parseCode.ts`, `customCode.ts`, `classNames.ts`, tests) is uncommitted on `editor-redesign`. Commit it first, in its own commit, so this feature branch starts clean:

```bash
cd $WEB && git status --short
git add src/features/editor/lib/code src/features/editor/hooks/useMonacoEditor.ts src/features/editor/components src/features/editor/interfaces src/features/editor/services src/features/editor/store src/features/interactions src/app/api/generate-code.ts package.json bun.lock tests/code-editing.test.ts tests/code-generation-format.test.ts
git commit -m "feat(editor): editable code tab, formatted generation, custom form code" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
git checkout -b feat/agent-cli-access
```
(Leave `docs/superpowers/**` for Step 7 of this task.) Run `npm run test:unit` first and expect all green (347 tests).

- [ ] **Step 1: Write the failing tests**

```ts
// $WEB/tests/agent-edit-ops.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { applyEdits, MAX_OPS } from "../src/features/agent/editOps";
import type { EditorElement } from "../src/types/global.type";

const PAGE = "page_1";
const el = (id: string, type: string, extra: Record<string, unknown> = {}) =>
  ({ id, type, pageId: PAGE, content: "", styles: {}, settings: null, ...extra }) as unknown as EditorElement;

const tree = (): EditorElement[] => [
  el("sec", "Section", { name: "Hero", elements: [el("title", "Text", { content: "Hello" }), el("cta", "Button", { content: "Buy" })] }),
  el("foot", "Section", { elements: [] }),
];
const kids = (t: EditorElement[], id: string) => ((t.find((e) => e.id === id) as unknown as { elements: EditorElement[] }).elements.map((e) => e.id));

test("update changes fields and merges settings", () => {
  const before = tree();
  const r = applyEdits(before, [{ op: "update", id: "title", set: { content: "Hi", tailwindStyles: "text-xl", settings: { level: 2 } } }], PAGE);
  assert.equal(r.ok, true);
  if (!r.ok) return;
  const title = (r.elements[0] as unknown as { elements: Record<string, unknown>[] }).elements[0];
  assert.equal(title.content, "Hi");
  assert.equal(title.tailwindStyles, "text-xl");
  assert.deepEqual(title.settings, { level: 2 });
});

test("the input tree is never mutated, success or failure", () => {
  const before = tree();
  const snapshot = JSON.stringify(before);
  applyEdits(before, [{ op: "delete", id: "title" }], PAGE);
  applyEdits(before, [{ op: "delete", id: "title" }, { op: "delete", id: "ghost" }], PAGE);
  assert.equal(JSON.stringify(before), snapshot);
});

test("create under a parent at an index, with a generated id and the page id", () => {
  const r = applyEdits(tree(), [{ op: "create", parentId: "sec", index: 0, element: { type: "Text", content: "First" } }], PAGE);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.created.length, 1);
  assert.equal(kids(r.elements, "sec")[0], r.created[0].id);
  const made = (r.elements[0] as unknown as { elements: Record<string, unknown>[] }).elements[0];
  assert.equal(made.pageId, PAGE);
  assert.equal(made.parentId, "sec");
  assert.equal(made.type, "Text");
});

test("refs let later operations nest under an element created earlier in the same call", () => {
  const r = applyEdits(tree(), [
    { op: "create", ref: "card", parentId: "foot", element: { type: "Frame", name: "Card" } },
    { op: "create", parentId: "card", element: { type: "Text", content: "Inside" } },
  ], PAGE);
  assert.ok(r.ok);
  if (!r.ok) return;
  const cardId = r.created[0].id;
  const card = ((r.elements[1] as unknown as { elements: { id: string; elements: { content: string }[] }[] }).elements)[0];
  assert.equal(card.id, cardId);
  assert.equal(card.elements[0].content, "Inside");
});

test("create at the top level when parentId is omitted or null", () => {
  const r = applyEdits(tree(), [{ op: "create", parentId: null, element: { type: "Section" } }, { op: "create", element: { type: "Section" } }], PAGE);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.elements.length, 4);
});

test("move reorders within a parent and reparents, index counted after removal", () => {
  const r = applyEdits(tree(), [{ op: "move", id: "cta", parentId: "foot" }, { op: "move", id: "title", parentId: "sec", index: 0 }], PAGE);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.deepEqual(kids(r.elements, "sec"), ["title"]);
  assert.deepEqual(kids(r.elements, "foot"), ["cta"]);
});

test("delete removes the element and its subtree", () => {
  const r = applyEdits(tree(), [{ op: "delete", id: "sec" }], PAGE);
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.elements.map((e) => e.id), ["foot"]);
});

test("an unknown id is reported with the path of the operation", () => {
  const r = applyEdits(tree(), [{ op: "delete", id: "title" }, { op: "update", id: "ghost", set: { name: "x" } }], PAGE);
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(r.issues, [{ path: "operations[1].id", message: 'unknown element "ghost"' }]);
});

test("nothing is partly applied: one bad operation rejects the whole call", () => {
  const r = applyEdits(tree(), [{ op: "update", id: "title", set: { content: "Changed" } }, { op: "update", id: "ghost", set: { name: "x" } }], PAGE);
  assert.equal(r.ok, false);
  assert.equal("elements" in r, false);
});

test("a leaf cannot be a parent", () => {
  const r = applyEdits(tree(), [{ op: "create", parentId: "title", element: { type: "Text" } }], PAGE);
  assert.equal(r.ok, false);
  if (!r.ok) assert.equal(r.issues[0].path, "operations[0].parentId");
});

test("an element cannot move into itself or its own descendant", () => {
  const nested = [el("a", "Frame", { elements: [el("b", "Frame", { elements: [] })] })];
  for (const parentId of ["a", "b"]) {
    const r = applyEdits(nested, [{ op: "move", id: "a", parentId }], PAGE);
    assert.equal(r.ok, false, `into ${parentId}`);
  }
});

test("unknown element types, bad indexes and reserved settings are rejected", () => {
  assert.equal(applyEdits(tree(), [{ op: "create", parentId: "sec", element: { type: "Heading7" } }], PAGE).ok, false);
  assert.equal(applyEdits(tree(), [{ op: "create", parentId: "sec", index: 9, element: { type: "Text" } }], PAGE).ok, false);
  const hidden = applyEdits(tree(), [{ op: "update", id: "title", set: { settings: { interactions: { x: 1 } } } }], PAGE);
  assert.equal(hidden.ok, false);
  if (!hidden.ok) assert.match(hidden.issues[0].message, /reserved/);
});

test("duplicate or unresolvable refs are rejected", () => {
  const dup = applyEdits(tree(), [
    { op: "create", ref: "x", parentId: "foot", element: { type: "Frame" } },
    { op: "create", ref: "x", parentId: "foot", element: { type: "Frame" } },
  ], PAGE);
  assert.equal(dup.ok, false);
  assert.equal(applyEdits(tree(), [{ op: "create", parentId: "later", element: { type: "Text" } }, { op: "create", ref: "later", element: { type: "Frame" } }], PAGE).ok, false);
});

test("size limits and malformed input", () => {
  assert.equal(applyEdits(tree(), [], PAGE).ok, false);
  assert.equal(applyEdits(tree(), "nope", PAGE).ok, false);
  assert.equal(applyEdits(tree(), Array.from({ length: MAX_OPS + 1 }, () => ({ op: "delete", id: "title" })), PAGE).ok, false);
  assert.equal(applyEdits(tree(), [{ op: "update", id: "title", set: { content: "x".repeat(20_001) } }], PAGE).ok, false);
  assert.equal(applyEdits(tree(), [{ op: "create", element: { type: "Text" }, parentId: 7 }], PAGE).ok, false);
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd $WEB && node --import tsx --test tests/agent-edit-ops.test.ts`
Expected: FAIL (`Cannot find module '../src/features/agent/editOps'`).

- [ ] **Step 3: Implement**

```ts
// $WEB/src/features/agent/protocol.ts
export interface AgentIssue {
  path: string;
  message: string;
}

/** A tool call from the user's CLI, delivered to this tab by the realtime service. */
export interface AgentRequest {
  requestId: string;
  tool: string;
  pageId?: string;
  args: unknown;
}

export type AgentOutcome =
  | { ok: true; result: unknown }
  | { ok: false; error: { code: string; message: string; issues?: AgentIssue[] } };
```

```ts
// $WEB/src/features/agent/editOps.ts
/**
 * Applies a CLI's list of edit operations to an element tree.
 *
 * Pure. The operations are applied to a copy, in order; the first operation
 * that cannot be applied rejects the whole call, so the caller either gets a
 * complete new tree or nothing. Mirrors the shapes in the Go tool arguments.
 */
import type { EditorElement } from "@/types/global.type";
import { newEntityId } from "@/lib/entity-id";
import { HIDDEN_SETTINGS } from "@/features/editor/lib/code/customCode";
import type { AgentIssue } from "./protocol";

export const AGENT_ELEMENT_TYPES = ["Section", "Frame", "Text", "Button", "Link", "Image", "Input", "Select", "List", "Form", "Carousel"] as const;
const CONTAINERS = new Set<string>(["Section", "Frame", "Select", "List", "Form", "Carousel"]);
export const MAX_OPS = 200;
const MAX_TEXT = 20_000;
const MAX_SETTINGS_JSON = 20_000;
const MAX_ELEMENTS = 2_000;
const RESERVED = new Set<string>([...(HIDDEN_SETTINGS as Iterable<string>)]);

export interface NewElementInput { type: string; name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface ElementPatch { name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface EditOp { op: "create" | "update" | "move" | "delete"; id?: string; ref?: string; parentId?: string | null; index?: number; element?: NewElementInput; set?: ElementPatch }

export type EditResult =
  | { ok: true; elements: EditorElement[]; created: { ref?: string; id: string }[]; changes: number }
  | { ok: false; issues: AgentIssue[] };

type Node = Record<string, unknown> & { id: string; type: string; elements?: Node[] };

const fail = (path: string, message: string): EditResult => ({ ok: false, issues: [{ path, message }] });
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const TEXT_FIELDS = ["name", "content", "tailwindStyles", "src", "href"] as const;

/** Shape checks that need no tree. Returns the first problem. */
function checkShapes(ops: unknown[]): AgentIssue | undefined {
  for (let i = 0; i < ops.length; i++) {
    const at = (f: string) => `operations[${i}].${f}`;
    const op = ops[i];
    if (!isObject(op)) return { path: `operations[${i}]`, message: "must be an object" };
    if (!["create", "update", "move", "delete"].includes(op.op as string)) return { path: at("op"), message: "must be create, update, move or delete" };
    if (op.parentId !== undefined && op.parentId !== null && typeof op.parentId !== "string") return { path: at("parentId"), message: "must be a string or null" };
    if (op.index !== undefined && (!Number.isInteger(op.index) || (op.index as number) < 0)) return { path: at("index"), message: "must be a non-negative integer" };
    if (op.op === "create") {
      const el = op.element;
      if (!isObject(el)) return { path: at("element"), message: "create needs an element" };
      if (!AGENT_ELEMENT_TYPES.includes(el.type as never)) return { path: at("element.type"), message: `unsupported type ${JSON.stringify(el.type)}; use one of ${AGENT_ELEMENT_TYPES.join(", ")}` };
      const bad = checkFields(el, at("element"));
      if (bad) return bad;
    } else if (typeof op.id !== "string" || !op.id) {
      return { path: at("id"), message: `${op.op} needs an element id` };
    }
    if (op.op === "update") {
      if (!isObject(op.set)) return { path: at("set"), message: "update needs the fields to set" };
      const bad = checkFields(op.set, at("set"));
      if (bad) return bad;
    }
  }
  return undefined;
}

function checkFields(obj: Record<string, unknown>, path: string): AgentIssue | undefined {
  for (const f of TEXT_FIELDS) {
    const v = obj[f];
    if (v === undefined) continue;
    if (typeof v !== "string") return { path: `${path}.${f}`, message: "must be a string" };
    if (v.length > MAX_TEXT) return { path: `${path}.${f}`, message: `longer than ${MAX_TEXT} characters` };
  }
  if (obj.settings !== undefined) {
    if (!isObject(obj.settings)) return { path: `${path}.settings`, message: "must be an object" };
    if (JSON.stringify(obj.settings).length > MAX_SETTINGS_JSON) return { path: `${path}.settings`, message: "too large" };
    for (const key of Object.keys(obj.settings)) {
      if (RESERVED.has(key)) return { path: `${path}.settings.${key}`, message: `"${key}" is reserved and cannot be set from here` };
    }
  }
  return undefined;
}

function walk(list: Node[], visit: (n: Node, parent: Node | null, siblings: Node[]) => void, parent: Node | null = null): void {
  for (const n of list) {
    visit(n, parent, list);
    if (n.elements) walk(n.elements, visit, n);
  }
}

const countAll = (list: Node[]): number => {
  let n = 0;
  walk(list, () => n++);
  return n;
};

export function applyEdits(current: EditorElement[], ops: unknown, pageId: string): EditResult {
  if (!Array.isArray(ops) || ops.length === 0) return fail("operations", "at least one operation is required");
  if (ops.length > MAX_OPS) return fail("operations", `at most ${MAX_OPS} operations per call`);
  const shape = checkShapes(ops);
  if (shape) return { ok: false, issues: [shape] };

  const root = structuredClone(current) as unknown as Node[];
  const refs = new Map<string, string>();
  const created: { ref?: string; id: string }[] = [];

  const find = (id: string) => {
    let hit: { node: Node; siblings: Node[] } | undefined;
    walk(root, (n, _p, siblings) => { if (!hit && n.id === id) hit = { node: n, siblings }; });
    return hit;
  };
  /** The children list a parent reference points at: the page root, a container, or undefined. */
  const childrenOf = (parent: string | null | undefined, path: string): { list: Node[]; id: string | null } | AgentIssue => {
    if (parent === undefined || parent === null) return { list: root, id: null };
    const id = refs.get(parent) ?? parent;
    const hit = find(id);
    if (!hit) return { path, message: `unknown element "${parent}"` };
    if (!CONTAINERS.has(hit.node.type)) return { path, message: `${hit.node.type} elements cannot have children` };
    hit.node.elements ??= [];
    return { list: hit.node.elements, id };
  };
  const place = (list: Node[], node: Node, index: number | undefined, path: string): AgentIssue | undefined => {
    if (index !== undefined && index > list.length) return { path, message: `out of range: this parent has ${list.length} children, so the index is 0 to ${list.length}` };
    list.splice(index ?? list.length, 0, node);
    return undefined;
  };

  for (let i = 0; i < ops.length; i++) {
    const op = ops[i] as EditOp;
    const at = (f: string) => `operations[${i}].${f}`;

    if (op.op === "create") {
      if (op.ref !== undefined) {
        if (typeof op.ref !== "string" || !op.ref || refs.has(op.ref) || find(op.ref)) return fail(at("ref"), "a ref must be a new, unique name");
      }
      const target = childrenOf(op.parentId, at("parentId"));
      if ("path" in target) return { ok: false, issues: [target] };
      const input = op.element as NewElementInput;
      const id = newEntityId();
      const node: Node = {
        id, type: input.type, pageId, parentId: target.id, content: input.content ?? "", styles: {},
        settings: input.settings ?? null,
        ...(input.name !== undefined && { name: input.name }),
        ...(input.tailwindStyles !== undefined && { tailwindStyles: input.tailwindStyles }),
        ...(input.src !== undefined && { src: input.src }),
        ...(input.href !== undefined && { href: input.href }),
        ...(CONTAINERS.has(input.type) && { elements: [] }),
      };
      const bad = place(target.list, node, op.index, at("index"));
      if (bad) return { ok: false, issues: [bad] };
      if (op.ref) refs.set(op.ref, id);
      created.push({ ...(op.ref && { ref: op.ref }), id });
    } else if (op.op === "update") {
      const hit = find(op.id as string);
      if (!hit) return fail(at("id"), `unknown element "${op.id}"`);
      const set = op.set as ElementPatch;
      for (const f of TEXT_FIELDS) if (set[f] !== undefined) hit.node[f] = set[f];
      if (set.settings) hit.node.settings = { ...((hit.node.settings as Record<string, unknown> | null) ?? {}), ...set.settings };
    } else if (op.op === "move") {
      const hit = find(op.id as string);
      if (!hit) return fail(at("id"), `unknown element "${op.id}"`);
      const targetId = op.parentId === undefined || op.parentId === null ? null : (refs.get(op.parentId) ?? op.parentId);
      if (targetId !== null) {
        let inside = targetId === hit.node.id;
        if (hit.node.elements) walk(hit.node.elements, (n) => { if (n.id === targetId) inside = true; });
        if (inside) return fail(at("parentId"), "an element cannot be moved into itself or its own descendant");
      }
      const target = childrenOf(op.parentId, at("parentId"));
      if ("path" in target) return { ok: false, issues: [target] };
      hit.siblings.splice(hit.siblings.indexOf(hit.node), 1);
      hit.node.parentId = target.id;
      const bad = place(target.list, hit.node, op.index, at("index"));
      if (bad) return { ok: false, issues: [bad] };
    } else {
      const hit = find(op.id as string);
      if (!hit) return fail(at("id"), `unknown element "${op.id}"`);
      hit.siblings.splice(hit.siblings.indexOf(hit.node), 1);
    }
  }

  if (countAll(root) > MAX_ELEMENTS) return fail("operations", `the page would exceed ${MAX_ELEMENTS} elements`);
  return { ok: true, elements: root as unknown as EditorElement[], created, changes: ops.length };
}
```

- [ ] **Step 4: Run and typecheck**

Run: `cd $WEB && node --import tsx --test tests/agent-edit-ops.test.ts && npx tsc --noEmit -p .`
Expected: all tests PASS; no new type errors. (`HIDDEN_SETTINGS` may be a `Set` or an array in `customCode.ts`; `[...(x as Iterable<string>)]` handles both.)

- [ ] **Step 5: Commit**

```bash
cd $WEB && git add src/features/agent tests/agent-edit-ops.test.ts && git commit -m "feat(agent): pure edit operations for CLI-driven page changes" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task E2: Tool executor

**Files:**
- Create: `$WEB/src/features/agent/executor.ts`
- Test: `$WEB/tests/agent-executor.test.ts`

**Interfaces:**
- Consumes: `applyEdits` (Task E1), `parseCode(code, current, pageId)` returning `{ok:true, elements, preamble} | {ok:false, diagnostic:{message,line,column,...}}`, `Preamble`, `isEmptyPreamble` (from `customCode`).
- Produces:

```ts
export interface AgentHost {
  getElements(): EditorElement[];
  getPageId(): string | undefined;
  canEdit(): boolean;
  /** One call = one undo step. */
  replaceTree(next: EditorElement[]): void;
  getSelectedId(): string | undefined;
  generateCode(): Promise<string>;
  getPreamble(): Preamble;
  setPreamble(next: Preamble): void;
  /** Called after a successful write, for the toast and the status badge. */
  notifyChanged(summary: string): void;
}
export function createExecutor(host: AgentHost): (req: AgentRequest) => Promise<AgentOutcome>;
```

- [ ] **Step 1: Write the failing tests**

```ts
// $WEB/tests/agent-executor.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { createExecutor, type AgentHost } from "../src/features/agent/executor";
import type { EditorElement } from "../src/types/global.type";

const PAGE = "page_1";
const el = (id: string, type: string, extra: Record<string, unknown> = {}) =>
  ({ id, type, pageId: PAGE, content: "", styles: {}, settings: null, ...extra }) as unknown as EditorElement;

function host(overrides: Partial<AgentHost> = {}) {
  const calls = { replace: [] as EditorElement[][], notified: [] as string[], preambles: [] as unknown[] };
  let elements: EditorElement[] = [el("sec", "Section", { elements: [el("t", "Text", { content: "Hello" })] })];
  const h: AgentHost = {
    getElements: () => elements,
    getPageId: () => PAGE,
    canEdit: () => true,
    replaceTree: (next) => { calls.replace.push(next); elements = next; },
    getSelectedId: () => "t",
    generateCode: async () => "export default function Generated() { return null }",
    getPreamble: () => ({ imports: "", top: "", body: "" }),
    setPreamble: (p) => calls.preambles.push(p),
    notifyChanged: (s) => calls.notified.push(s),
    ...overrides,
  };
  return { h, calls };
}
const req = (tool: string, args: unknown, extra: Record<string, unknown> = {}) => ({ requestId: `r-${Math.random()}`, tool, pageId: PAGE, args, ...extra });

test("apply_edits applies once, as one undo step, and notifies", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "update", id: "t", set: { content: "A" } }, { op: "update", id: "t", set: { content: "B" } }] }));
  assert.equal(out.ok, true);
  assert.equal(calls.replace.length, 1, "two operations must still be a single replaceTree call");
  assert.equal(calls.notified.length, 1);
});

test("an invalid operation changes nothing and reports issues with paths", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "delete", id: "t" }, { op: "delete", id: "ghost" }] }));
  assert.equal(out.ok, false);
  if (!out.ok) {
    assert.equal(out.error.code, "invalid_edit");
    assert.equal(out.error.issues?.[0].path, "operations[1].id");
  }
  assert.equal(calls.replace.length, 0);
});

test("a read-only user cannot write but can read", async () => {
  const { h, calls } = host({ canEdit: () => false });
  const run = createExecutor(h);
  const denied = await run(req("apply_edits", { operations: [{ op: "delete", id: "t" }] }));
  assert.ok(!denied.ok && denied.error.code === "forbidden");
  assert.equal(calls.replace.length, 0);
  assert.equal((await run(req("get_code", {}))).ok, true);
  assert.equal((await run(req("get_selection", {}))).ok, true);
});

test("a request for a page that is not open fails with page_not_open and changes nothing", async () => {
  const { h, calls } = host({ getPageId: () => "page_2" });
  const out = await createExecutor(h)(req("apply_edits", { operations: [{ op: "delete", id: "t" }] }));
  assert.ok(!out.ok && out.error.code === "page_not_open");
  assert.match(out.ok ? "" : out.error.message, /page_1/);
  assert.equal(calls.replace.length, 0);
});

test("the same request id is applied once even when delivered twice", async () => {
  const { h, calls } = host();
  const run = createExecutor(h);
  const r = req("apply_edits", { operations: [{ op: "update", id: "t", set: { content: "Once" } }] }, { requestId: "dup-1" });
  const first = await run(r);
  const second = await run(r);
  assert.deepEqual(second, first);
  assert.equal(calls.replace.length, 1);
});

test("set_code parses the source, replaces the tree once and saves a changed preamble", async () => {
  const { h, calls } = host();
  const code = `export default function Generated() {\n  return (\n    <section data-element-id="sec">\n      <div data-element-id="t">Changed text</div>\n    </section>\n  );\n}\n`;
  const out = await createExecutor(h)(req("set_code", { code }));
  assert.equal(out.ok, true, JSON.stringify(out));
  assert.equal(calls.replace.length, 1);
  const sec = calls.replace[0][0] as unknown as { elements: { content: string }[] };
  assert.equal(sec.elements[0].content, "Changed text");
});

test("set_code with code the parser rejects reports the location and changes nothing", async () => {
  const { h, calls } = host();
  const out = await createExecutor(h)(req("set_code", { code: "export default function Generated() { return <section> }" }));
  assert.ok(!out.ok && out.error.code === "invalid_edit");
  assert.match(out.ok ? "" : (out.error.issues?.[0].path ?? ""), /^code:\d+:\d+$/);
  assert.equal(calls.replace.length, 0);
});

test("get_selection returns the selected element, get_code returns the source", async () => {
  const { h } = host();
  const run = createExecutor(h);
  const sel = await run(req("get_selection", {}));
  assert.ok(sel.ok);
  assert.deepEqual((sel.ok && (sel.result as { elements: { id: string }[] }).elements.map((e) => e.id)), ["t"]);
  const code = await run(req("get_code", {}));
  assert.ok(code.ok && typeof (code.result as { code: string }).code === "string");
});

test("unknown tools and a throwing host become clean errors", async () => {
  const { h } = host({ generateCode: async () => { throw new Error("boom"); } });
  const run = createExecutor(h);
  const unknown = await run(req("format_disk", {}));
  assert.ok(!unknown.ok && unknown.error.code === "unknown_tool");
  const broke = await run(req("get_code", {}));
  assert.ok(!broke.ok && broke.error.code === "internal");
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd $WEB && node --import tsx --test tests/agent-executor.test.ts`
Expected: FAIL (`Cannot find module '../src/features/agent/executor'`).

- [ ] **Step 3: Implement**

```ts
// $WEB/src/features/agent/executor.ts
/**
 * Runs the CLI's tool calls inside this editor tab. The tab is the only writer:
 * it validates, checks permission, applies through one replaceTree call (one
 * undo step) and answers. Pure apart from the injected host.
 */
import { isEqual } from "lodash-es";
import type { EditorElement } from "@/types/global.type";
import { parseCode } from "@/features/editor/lib/code/parseCode";
import type { Preamble } from "@/features/editor/lib/code/customCode";
import { applyEdits } from "./editOps";
import type { AgentOutcome, AgentRequest } from "./protocol";

export interface AgentHost {
  getElements(): EditorElement[];
  getPageId(): string | undefined;
  canEdit(): boolean;
  /** One call is one undo step. */
  replaceTree(next: EditorElement[]): void;
  getSelectedId(): string | undefined;
  generateCode(): Promise<string>;
  getPreamble(): Preamble;
  setPreamble(next: Preamble): void;
  /** After a successful write: for the toast and the status badge. */
  notifyChanged(summary: string): void;
}

const WRITE_TOOLS = new Set(["apply_edits", "set_code"]);
const REMEMBER = 50;

const error = (code: string, message: string, issues?: { path: string; message: string }[]): AgentOutcome => ({ ok: false, error: { code, message, ...(issues && { issues }) } });

export function createExecutor(host: AgentHost) {
  // Requests can arrive twice (more than one API instance, a reconnect). The
  // first answer is the answer; applying twice would double the edit.
  const done = new Map<string, AgentOutcome>();
  const remember = (id: string, outcome: AgentOutcome) => {
    done.set(id, outcome);
    if (done.size > REMEMBER) done.delete(done.keys().next().value as string);
    return outcome;
  };

  async function run(req: AgentRequest): Promise<AgentOutcome> {
    const pageId = host.getPageId();
    if (req.pageId && pageId !== req.pageId) {
      return error("page_not_open", `Page ${req.pageId} is not the page open in the builder. Ask the user to open it, then try again.`);
    }
    if (!pageId) return error("page_not_open", "No page is open in the builder.");
    if (WRITE_TOOLS.has(req.tool) && !host.canEdit()) return error("forbidden", "The user has read-only access to this project.");
    const args = (req.args ?? {}) as Record<string, unknown>;

    switch (req.tool) {
      case "get_selection": {
        const id = host.getSelectedId();
        const found: { id: string; type: string; name?: string; content?: string }[] = [];
        const visit = (list: EditorElement[]) => {
          for (const e of list) {
            const r = e as unknown as { id: string; type: string; name?: string; content?: string; elements?: EditorElement[] };
            if (r.id === id) found.push({ id: r.id, type: r.type, name: r.name, content: r.content });
            if (r.elements) visit(r.elements);
          }
        };
        visit(host.getElements());
        return { ok: true, result: { elements: found } };
      }
      case "get_code":
        return { ok: true, result: { code: await host.generateCode() } };
      case "apply_edits": {
        const result = applyEdits(host.getElements(), args.operations, pageId);
        if (!result.ok) return error("invalid_edit", "Nothing was applied.", result.issues);
        host.replaceTree(result.elements);
        const summary = `${result.changes} change${result.changes === 1 ? "" : "s"}`;
        host.notifyChanged(summary);
        return { ok: true, result: { summary, created: result.created } };
      }
      case "set_code": {
        if (typeof args.code !== "string" || !args.code) return error("invalid_edit", "Nothing was applied.", [{ path: "code", message: "the code is empty" }]);
        const parsed = parseCode(args.code, host.getElements(), pageId);
        if (!parsed.ok) {
          const d = parsed.diagnostic;
          return error("invalid_edit", "Nothing was applied.", [{ path: `code:${d.line}:${d.column}`, message: d.message }]);
        }
        host.replaceTree(parsed.elements);
        if (!isEqual(parsed.preamble, host.getPreamble())) host.setPreamble(parsed.preamble);
        host.notifyChanged("code updated");
        return { ok: true, result: { summary: "code applied" } };
      }
      default:
        return error("unknown_tool", `Unknown tool "${req.tool}".`);
    }
  }

  return async (req: AgentRequest): Promise<AgentOutcome> => {
    const seen = done.get(req.requestId);
    if (seen) return seen;
    try {
      return remember(req.requestId, await run(req));
    } catch (err) {
      return remember(req.requestId, error("internal", err instanceof Error ? err.message : "The editor failed to run the tool."));
    }
  };
}
```

- [ ] **Step 4: Run and commit**

Run: `cd $WEB && node --import tsx --test tests/agent-executor.test.ts && npx tsc --noEmit -p .`
Expected: PASS. If the `set_code` round-trip test fails because `parseCode` needs a page-level wrapper or different `data-element-id` conventions than the test's hand-written source, generate the source in the test with `codeGenerator`/`generateToJSX` the way `tests/code-editing.test.ts` does, edit one string in it, and feed that in.

```bash
cd $WEB && git add src/features/agent tests/agent-executor.test.ts && git commit -m "feat(agent): tool executor with permission, page and duplicate-request guards" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task E3: Provider channel and host registration

**Files:**
- Create: `$WEB/src/features/collaboration/lib/yjs/AgentChannel.ts`, `$WEB/src/features/agent/runtime.ts`, `$WEB/src/features/agent/activity.ts`, `$WEB/src/features/agent/AgentHost.tsx`
- Modify: `$WEB/src/features/collaboration/interfaces/websocket/ws-collab.interface.ts` (add the two message names to `WS_MESSAGE`), `$WEB/src/features/collaboration/interfaces/websocket/yjs-v2.interface.ts` (add `onAgentRequest` to `YjsProviderV2Options`, line ~226), `$WEB/src/features/collaboration/lib/yjs/Provider.ts`, `$WEB/src/providers/collaborationprovider.tsx` (the `new CustomYjsProviderV2({...})` call, line ~170), `$WEB/src/features/editor/components/ElementLoader.tsx`
- Test: `$WEB/tests/collaboration-agent-channel.test.ts`, `$WEB/tests/agent-runtime.test.ts`

**Interfaces:**
- Consumes: `AgentRequest`, `AgentOutcome` (Task E1), `createExecutor`, `AgentHost` (Task E2), `useSelectionStore.getState().selectedElementId`, `ElementStore.getState()` (`elements`, `replaceTree`, `undo`), `useEditorFlagsOptional()?.canEdit`, `useActiveLogic()`, `loadPreamble/savePreamble(pageId)`, `elementService.generateCode(elements, options, logic, preamble)`.
- Produces:

```ts
// AgentChannel.ts
export interface AgentChannelOptions {
  onRequest: (req: AgentRequest) => Promise<AgentOutcome>;
  send: (requestId: string, outcome: AgentOutcome) => void;
}
export class AgentChannel { constructor(options: AgentChannelOptions); handle(envelope: WSEnvelope<unknown>): boolean }
// runtime.ts
export function registerAgentHost(host: AgentHost | null): void;
export function runAgentRequest(req: AgentRequest): Promise<AgentOutcome>;
// activity.ts
export const useAgentActivity: UseBoundStore<StoreApi<{ lastAt: number | null; editing: boolean; mark(editing: boolean): void }>>;
```

- [ ] **Step 1: Write the failing channel and runtime tests**

```ts
// $WEB/tests/collaboration-agent-channel.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { AgentChannel } from "../src/features/collaboration/lib/yjs/AgentChannel";
import type { AgentOutcome, AgentRequest } from "../src/features/agent/protocol";

const env = (type: string, extra: Record<string, unknown> = {}) => ({ type, projectId: "p", pageId: "home", payload: {}, ...extra }) as never;
const tick = () => new Promise((r) => setTimeout(r, 0));

test("ignores messages that are not agent requests", () => {
  const ch = new AgentChannel({ onRequest: async () => ({ ok: true, result: {} }), send: () => {} });
  assert.equal(ch.handle(env("element:update")), false);
  assert.equal(ch.handle(env("error", { requestId: "x" })), false);
});

test("runs the request and sends the outcome back under the same request id", async () => {
  const seen: AgentRequest[] = [];
  const sent: [string, AgentOutcome][] = [];
  const ch = new AgentChannel({
    onRequest: async (r) => { seen.push(r); return { ok: true, result: { n: 1 } }; },
    send: (id, o) => sent.push([id, o]),
  });
  assert.equal(ch.handle(env("agent:request", { requestId: "r1", payload: { tool: "get_code", args: { a: 1 }, pageId: "home" } })), true);
  await tick();
  assert.deepEqual(seen, [{ requestId: "r1", tool: "get_code", args: { a: 1 }, pageId: "home" }]);
  assert.deepEqual(sent, [["r1", { ok: true, result: { n: 1 } }]]);
});

test("a handler that throws still answers, with an internal error", async () => {
  const sent: [string, AgentOutcome][] = [];
  const ch = new AgentChannel({ onRequest: async () => { throw new Error("nope"); }, send: (id, o) => sent.push([id, o]) });
  ch.handle(env("agent:request", { requestId: "r2", payload: { tool: "apply_edits", args: {} } }));
  await tick();
  assert.equal(sent[0][0], "r2");
  assert.ok(!sent[0][1].ok && sent[0][1].error.code === "internal");
});

test("a request without an id is swallowed, not run", async () => {
  let ran = false;
  const ch = new AgentChannel({ onRequest: async () => { ran = true; return { ok: true, result: {} }; }, send: () => {} });
  assert.equal(ch.handle(env("agent:request", { payload: { tool: "get_code" } })), true);
  await tick();
  assert.equal(ran, false);
});
```

```ts
// $WEB/tests/agent-runtime.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { registerAgentHost, runAgentRequest } from "../src/features/agent/runtime";

test("before an editor registers, requests get editor_not_ready", async () => {
  registerAgentHost(null);
  const out = await runAgentRequest({ requestId: "a", tool: "get_code", args: {} });
  assert.ok(!out.ok && out.error.code === "editor_not_ready");
});
```

- [ ] **Step 2: Run to confirm they fail**

Run: `cd $WEB && node --import tsx --test tests/collaboration-agent-channel.test.ts tests/agent-runtime.test.ts`
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement the channel, runtime and activity store**

```ts
// $WEB/src/features/collaboration/lib/yjs/AgentChannel.ts
import type { WSEnvelope } from "@/features/collaboration";
import type { AgentOutcome, AgentRequest } from "@/features/agent/protocol";

export interface AgentChannelOptions {
  onRequest: (req: AgentRequest) => Promise<AgentOutcome>;
  send: (requestId: string, outcome: AgentOutcome) => void;
}

/**
 * Routes `agent:request` messages (a CLI's tool call, relayed by the realtime
 * service) to the executor and sends the outcome back as `agent:response`.
 * Same shape as LogicChannel: handle() returns true when the message was ours.
 */
export class AgentChannel {
  constructor(private readonly options: AgentChannelOptions) {}

  handle(envelope: WSEnvelope<unknown>): boolean {
    if (envelope.type !== ("agent:request" as WSEnvelope["type"])) return false;
    const requestId = envelope.requestId;
    if (!requestId) return true;
    const payload = (envelope.payload ?? {}) as { tool?: string; args?: unknown; pageId?: string };
    void this.options
      .onRequest({ requestId, tool: String(payload.tool ?? ""), args: payload.args, pageId: payload.pageId })
      .catch((): AgentOutcome => ({ ok: false, error: { code: "internal", message: "The editor failed to run the tool." } }))
      .then((outcome) => this.options.send(requestId, outcome));
    return true;
  }
}
```

```ts
// $WEB/src/features/agent/runtime.ts
import { createExecutor, type AgentHost } from "./executor";
import type { AgentOutcome, AgentRequest } from "./protocol";

let execute: ((req: AgentRequest) => Promise<AgentOutcome>) | null = null;

/** The mounted editor registers itself here; the collaboration provider calls in. */
export function registerAgentHost(host: AgentHost | null): void {
  execute = host ? createExecutor(host) : null;
}

export async function runAgentRequest(req: AgentRequest): Promise<AgentOutcome> {
  if (!execute) return { ok: false, error: { code: "editor_not_ready", message: "The editor is still loading. Try again in a moment." } };
  return execute(req);
}
```

```ts
// $WEB/src/features/agent/activity.ts
import { create } from "zustand";

interface AgentActivity {
  /** When a CLI last called this tab, or null. */
  lastAt: number | null;
  /** True while a write is being applied. */
  editing: boolean;
  mark: (editing: boolean) => void;
}

export const useAgentActivity = create<AgentActivity>((set) => ({
  lastAt: null,
  editing: false,
  mark: (editing) => set({ lastAt: Date.now(), editing }),
}));
```

- [ ] **Step 4: Run the tests**

Run: `cd $WEB && node --import tsx --test tests/collaboration-agent-channel.test.ts tests/agent-runtime.test.ts`
Expected: PASS.

- [ ] **Step 5: Wire the provider**

In `ws-collab.interface.ts`, add to `WS_MESSAGE` (after `LOGIC_UPDATE`, matching the existing style): `AGENT_REQUEST: "agent:request",` and `AGENT_RESPONSE: "agent:response",`. Then in `AgentChannel.ts` replace the cast comparison with `envelope.type !== WS_MESSAGE.AGENT_REQUEST` (import `WS_MESSAGE` from `@/features/collaboration`) and re-run its tests.

In `yjs-v2.interface.ts` add to `YjsProviderV2Options`:

```ts
  /** Runs a CLI tool call in this tab (see features/agent). */
  onAgentRequest?: (req: import("@/features/agent/protocol").AgentRequest) => Promise<import("@/features/agent/protocol").AgentOutcome>;
```

In `Provider.ts`: import `AgentChannel` and `WS_MESSAGE`; add the field `private agentChannel?: AgentChannel;`; in the constructor, right after `this.logicChannel = new LogicChannel({...});` add:

```ts
    if (options.onAgentRequest) {
      this.agentChannel = new AgentChannel({
        onRequest: options.onAgentRequest,
        send: (requestId, outcome) => {
          const payload = outcome.ok ? { ok: true, result: outcome.result } : { ok: false, error: outcome.error };
          const envelope = this.dispatcher.createEnvelope(WS_MESSAGE.AGENT_RESPONSE, this.projectId, this.pageId, payload, { userId: this.userId, requestId });
          this.connection.send(JSON.stringify(envelope));
        },
      });
    }
```

and in `handleMessage`, directly after the `logicChannel.handle` line: `if (this.agentChannel?.handle(envelope)) return;`.

In `collaborationprovider.tsx`, in the `new CustomYjsProviderV2({...})` options add `onAgentRequest: (req) => runAgentRequest(req),` (import from `@/features/agent/runtime`).

Extend `tests/collaboration-provider-options.test.ts` only if it enumerates option keys; otherwise leave it.

- [ ] **Step 6: The host component**

```tsx
// $WEB/src/features/agent/AgentHost.tsx
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { useEditorFlagsOptional } from "@/features/editor/components/context/EditorFlagsContext";
import { useActiveLogic } from "@/features/interactions/logic-hooks";
import { loadPreamble, savePreamble } from "@/features/editor/lib/code/customCode";
import { elementService } from "@/features/editor/services/element.service";
import { registerAgentHost } from "./runtime";
import { useAgentActivity } from "./activity";

/**
 * Registers this editor as the place CLI tool calls run. Renders nothing.
 * Mount it once, inside the editor's flags provider (it reads canEdit).
 */
export function AgentHost() {
  const canEdit = useEditorFlagsOptional()?.canEdit ?? false;
  const logic = useActiveLogic();
  const live = useRef({ canEdit, logic });
  live.current = { canEdit, logic };

  useEffect(() => {
    const pageOf = () => live.current.logic.pageId ?? undefined;
    registerAgentHost({
      getElements: () => ElementStore.getState().elements,
      getPageId: pageOf,
      canEdit: () => live.current.canEdit,
      replaceTree: (next) => ElementStore.getState().replaceTree(next),
      getSelectedId: () => useSelectionStore.getState().selectedElementId,
      generateCode: async () => {
        const { variables, flows, pageId } = live.current.logic;
        const result = await elementService.generateCode(ElementStore.getState().elements, {}, { variables, flows }, loadPreamble(pageId ?? undefined));
        return typeof result === "string" ? result : (result as { code: string }).code;
      },
      getPreamble: () => loadPreamble(pageOf()),
      setPreamble: (next) => savePreamble(pageOf(), next),
      notifyChanged: (summary) => {
        useAgentActivity.getState().mark(false);
        toast("Your CLI changed the page", {
          description: summary,
          action: { label: "Undo", onClick: () => ElementStore.getState().undo() },
        });
      },
    });
    return () => registerAgentHost(null);
  }, []);

  return null;
}
```

Check two names while wiring and adjust to what the code actually exports: `elementService.generateCode`'s return type (the existing `useMonacoEditor.ts` consumes it around line 123: copy exactly how it reads the code string) and `loadPreamble`/`savePreamble`'s page-id parameter type (`useMonacoEditor.ts` lines 46 and 210 show both calls).

Mount it: in `ElementLoader.tsx`, inside `<EditorFlagsProvider ...>` as the first child, add `{!elements && <AgentHost />}` (only the live editor registers, not previews that pass `elements`).

- [ ] **Step 7: Typecheck, full suite, commit**

Run: `cd $WEB && npx tsc --noEmit -p . && npm run test:unit 2>&1 | tail -8`
Expected: no new type errors; all tests PASS.

```bash
cd $WEB && git add src tests && git commit -m "feat(agent): route CLI tool calls through the collaboration socket into the editor" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---

### Task E4: "Connect your CLI" panel, status badge, docs, end-to-end check

**Files:**
- Create: `$WEB/src/features/agent/services/agentTokens.service.ts`, `$WEB/src/features/agent/connectCommands.ts`, `$WEB/src/features/agent/components/ConnectCliButton.tsx`, `$WEB/docs/agent-cli.md`
- Modify: `$WEB/src/features/editor/components/topbar/EditorTopBar.tsx` (line ~82, next to `<CollaborationButton .../>`), `$WEB/docs/superpowers/specs/2026-11-16-cli-agent-access-design.md`, `$WEB/src/utils/shared/constants/endpoints.ts`
- Test: `$WEB/tests/agent-connect-commands.test.ts`

**Interfaces:**
- Consumes: `apiClient.get/post/delete` (`@/services/apiclient`, methods take `(url, body?, options?, token?)` as used in `project.service.ts`: `post<T>(url, body, undefined, token)`, `get<T>(url, undefined, token)`, `delete(url, undefined, token)`); Clerk `useAuth().getToken`; `useAgentActivity` (Task E3).
- Produces:

```ts
// connectCommands.ts
export function claudeCodeCommand(mcpUrl: string, token: string): string;
export function codexCommands(mcpUrl: string): { export: (token: string) => string; add: string };
// agentTokens.service.ts
export interface AgentTokenInfo { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string }
export interface CreatedAgentToken extends AgentTokenInfo { token: string; mcpUrl: string }
export const agentTokenService: { list(token?: string): Promise<AgentTokenInfo[]>; create(name: string, token?: string): Promise<CreatedAgentToken>; revoke(id: string, token?: string): Promise<void> };
```

- [ ] **Step 1: Write the failing command test**

```ts
// $WEB/tests/agent-connect-commands.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { claudeCodeCommand, codexCommands } from "../src/features/agent/connectCommands";

test("the Claude Code command registers an HTTP server with a bearer header", () => {
  assert.equal(
    claudeCodeCommand("https://api.example.com/mcp", "wbk_abc"),
    `claude mcp add --transport http webbuilder https://api.example.com/mcp --header "Authorization: Bearer wbk_abc"`,
  );
});

test("the Codex commands keep the secret in an environment variable, not in the command", () => {
  const c = codexCommands("https://api.example.com/mcp");
  assert.equal(c.export("wbk_abc"), `export WEBBUILDER_TOKEN=wbk_abc`);
  assert.equal(c.add, `codex mcp add webbuilder --url https://api.example.com/mcp --bearer-token-env-var WEBBUILDER_TOKEN`);
  assert.ok(!c.add.includes("wbk_"));
});

test("a url or token with shell metacharacters is rejected, not quoted into a command", () => {
  assert.throws(() => claudeCodeCommand("https://x/mcp; rm -rf ~", "wbk_abc"));
  assert.throws(() => claudeCodeCommand("https://x/mcp", 'wbk_abc" && echo pwned'));
  assert.throws(() => codexCommands("https://x/mcp$(id)"));
});
```

- [ ] **Step 2: Run to confirm it fails**

Run: `cd $WEB && node --import tsx --test tests/agent-connect-commands.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement the commands**

```ts
// $WEB/src/features/agent/connectCommands.ts
/** Command strings the user pastes into a terminal. Inputs are checked, never escaped. */
const SAFE_URL = /^https?:\/\/[A-Za-z0-9._~:/?#@!&'()*+,%=-]+$/;
const SAFE_TOKEN = /^wbk_[A-Za-z0-9_-]+$/;

function checkUrl(url: string): string {
  if (!SAFE_URL.test(url) || /[;&|`$<>"'\\\s]/.test(url.replace(/[?&=]/g, ""))) throw new Error("Unsafe MCP URL");
  return url;
}
function checkToken(token: string): string {
  if (!SAFE_TOKEN.test(token)) throw new Error("Unexpected token format");
  return token;
}

export function claudeCodeCommand(mcpUrl: string, token: string): string {
  return `claude mcp add --transport http webbuilder ${checkUrl(mcpUrl)} --header "Authorization: Bearer ${checkToken(token)}"`;
}

export function codexCommands(mcpUrl: string): { export: (token: string) => string; add: string } {
  const url = checkUrl(mcpUrl);
  return {
    export: (token) => `export WEBBUILDER_TOKEN=${checkToken(token)}`,
    add: `codex mcp add webbuilder --url ${url} --bearer-token-env-var WEBBUILDER_TOKEN`,
  };
}
```

Run: `cd $WEB && node --import tsx --test tests/agent-connect-commands.test.ts`
Expected: PASS. If the third test fails because the URL regex admits a `;`, tighten `SAFE_URL` (remove `;`-adjacent characters); the test is the contract.

- [ ] **Step 4: Token service and endpoints**

In `$WEB/src/utils/shared/constants/endpoints.ts`, add inside `API_ENDPOINTS`:

```ts
  AGENT_TOKENS: {
    LIST: "/api/v1/agent-tokens",
    CREATE: "/api/v1/agent-tokens",
    REVOKE: (id: string) => `/api/v1/agent-tokens/${id}`,
  },
```

```ts
// $WEB/src/features/agent/services/agentTokens.service.ts
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";

export interface AgentTokenInfo { id: string; name: string; prefix: string; createdAt: string; lastUsedAt?: string }
export interface CreatedAgentToken extends AgentTokenInfo { token: string; mcpUrl: string }

export const agentTokenService = {
  list: (token?: string) => apiClient.get<AgentTokenInfo[]>(API_ENDPOINTS.AGENT_TOKENS.LIST, undefined, token),
  create: (name: string, token?: string) =>
    apiClient.post<CreatedAgentToken>(API_ENDPOINTS.AGENT_TOKENS.CREATE, { name }, undefined, token),
  revoke: (id: string, token?: string) => apiClient.delete(API_ENDPOINTS.AGENT_TOKENS.REVOKE(id), undefined, token),
};
```

- [ ] **Step 5: The panel**

`ConnectCliButton.tsx` follows `CollaborationButton.tsx` (a `Dialog` with a `DialogTrigger` `Button`). Behaviour, all in this one file:

```tsx
// $WEB/src/features/agent/components/ConnectCliButton.tsx
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/tanstack-react-start";
import { toast } from "sonner";
import { Terminal, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { agentTokenService, type AgentTokenInfo, type CreatedAgentToken } from "../services/agentTokens.service";
import { claudeCodeCommand, codexCommands } from "../connectCommands";
import { useAgentActivity } from "../activity";

const copy = (text: string) =>
  navigator.clipboard.writeText(text).then(() => toast.success("Copied"), () => toast.error("Could not copy"));

function CommandBlock({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-2">
        <code className="flex-1 break-all text-xs">{text}</code>
        <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" aria-label={`Copy ${label} command`} onClick={() => copy(text)}><Copy className="h-3 w-3" /></Button>
      </div>
    </div>
  );
}

export default function ConnectCliButton() {
  const { getToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [tokens, setTokens] = useState<AgentTokenInfo[]>([]);
  const [name, setName] = useState("My laptop");
  const [created, setCreated] = useState<CreatedAgentToken | null>(null);
  const lastAt = useAgentActivity((s) => s.lastAt);
  const editing = useAgentActivity((s) => s.editing);
  const recent = lastAt !== null && Date.now() - lastAt < 5 * 60_000;

  const refresh = useCallback(async () => {
    try { setTokens(await agentTokenService.list((await getToken()) ?? undefined)); }
    catch { toast.error("Could not load your tokens."); }
  }, [getToken]);
  useEffect(() => { if (open) void refresh(); }, [open, refresh]);

  const create = async () => {
    try {
      setCreated(await agentTokenService.create(name, (await getToken()) ?? undefined));
      void refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the token.");
    }
  };
  const revoke = async (id: string) => {
    try { await agentTokenService.revoke(id, (await getToken()) ?? undefined); await refresh(); }
    catch { toast.error("Could not revoke the token."); }
  };

  const codex = created ? codexCommands(created.mcpUrl) : null;

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setCreated(null); }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1" aria-label="Connect your CLI">
          <Terminal className="h-4 w-4" />
          {editing ? "CLI editing…" : recent ? "CLI connected" : "CLI"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Connect your CLI</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Let Claude Code or Codex CLI read your projects and edit the page you have open. Edits appear here as one undo step. Keep this project open in the builder while the CLI works.
        </p>

        {created ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Copy this now. It will not be shown again.</p>
            <CommandBlock label="Claude Code" text={claudeCodeCommand(created.mcpUrl, created.token)} />
            <CommandBlock label="Codex CLI, step 1" text={codex!.export(created.token)} />
            <CommandBlock label="Codex CLI, step 2" text={codex!.add} />
            <Button variant="outline" onClick={() => setCreated(null)}>Done</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} aria-label="Token name" />
            <Button onClick={create} disabled={!name.trim()}>Create token</Button>
          </div>
        )}

        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">Your tokens</div>
          {tokens.length === 0 && <p className="text-sm text-muted-foreground">None yet.</p>}
          {tokens.map((t) => (
            <div key={t.id} className="flex items-center justify-between rounded-md border px-2 py-1 text-sm">
              <span>{t.name} <span className="text-xs text-muted-foreground">{t.prefix}…{t.lastUsedAt ? ` · used ${new Date(t.lastUsedAt).toLocaleString()}` : " · never used"}</span></span>
              <Button size="icon" variant="ghost" className="h-6 w-6" aria-label={`Revoke ${t.name}`} onClick={() => revoke(t.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

Where the badge flips to "CLI editing…": in `AgentHost.tsx`'s `notifyChanged`, `mark(false)` is already called after a write. To show "editing" during the apply, call `useAgentActivity.getState().mark(true)` at the top of `replaceTree` in the host and `mark(false)` in `notifyChanged` (a write is synchronous, so the badge mostly shows `CLI connected`; the `editing` flag exists so a later async tool can use it. If that is not wanted, delete `editing` from `activity.ts` and the button label).

In `EditorTopBar.tsx` next to line 82 add `<ConnectCliButton />` (import it). Use the same placement and any wrapper the neighbouring buttons use.

- [ ] **Step 8: Typecheck and the full suite**

Run: `cd $WEB && npx tsc --noEmit -p . && npm run test:unit 2>&1 | tail -8`
Expected: no new type errors; all tests PASS.

- [ ] **Step 9: Update the spec where the code disagreed with it**

In `docs/superpowers/specs/2026-11-16-cli-agent-access-design.md` make these edits:

1. **Tools table:** `get_code` and `get_selection` are tab tools (the code generator and the selection live in the editor, so Go cannot produce them). Mark their kind `tab (needs an open tab)`; only `list_pages` and `get_page` work with no tab open. Success criterion 3 becomes "read tools that use the database still work".
2. **Go API changes, item 1 and the Architecture diagram:** the MCP endpoint is its own small Go service (`webbuilder.mcp.go`), not part of the API. It uses plain `net/http` and is stateless with JSON responses (`Stateless: true, JSONResponse: true`), so the Fiber-adaptor streaming question no longer exists; remove that spike from Rollout order and Open questions. The API keeps token create, list and revoke (`/api/v1/agent-tokens`) and the realtime bridge. Update the diagram and the "Go API changes" section to show both services and the Redis hop between them.
3. **Realtime changes:** add the ack step. The realtime bridge publishes `agent:ack:<requestId>` when it hands the request to a tab; the relay treats a missing ack within 2 s as `no_editor_session`. The rate limit answers HTTP 429 with `Retry-After` rather than a tool error.
4. **Editor changes, item 2:** the undo history has no labels, so "Changed by your CLI" is a toast with an Undo action (one `undo()`), not a history entry label.
5. **Open questions:** Codex CLI does connect to remote streamable-HTTP servers with a bearer token from an environment variable (`codex mcp add NAME --url URL --bearer-token-env-var VAR`, checked against `codex mcp add --help`), so no local proxy is needed. Tokens are per user. The panel lives in the editor top bar next to Collaboration.

- [ ] **Step 10: User docs**

Write `$WEB/docs/agent-cli.md` (about 30 lines): what it is, the three steps (open the project, click CLI, create a token, paste the printed commands), the six tools in one table, the error messages a CLI may show (`no_editor_session`, `editor_timeout`, `invalid_edit`, `forbidden`, `page_not_open`) with what to do, how to undo (toast Undo or the usual undo), and how to revoke.

- [ ] **Step 11: End-to-end check in a dev project (the real thing)**

With Postgres and Redis up, the API running (migration `00005` applied, `PUBLIC_MCP_URL` set to the MCP service's URL), the MCP service running, and the editor running, signed in as the dev user:

1. Open a project in the builder. Click **CLI**, create a token, run the printed Claude Code command in a terminal.
2. In Claude Code: "list the pages of project `<id>`, then add a pricing section with three cards to the page I have open." Expected: the section appears on the canvas, a toast reads "Your CLI changed the page", and one Undo removes the whole section.
3. Ask: "show me the selected element" after selecting one. Expected: its id and type come back.
4. Close the editor tab and ask for another edit. Expected: `no_editor_session`; asking to list pages still works.
5. Open the project in two tabs, click in tab B, ask for an edit. Expected: only tab B changes (it was last active), and exactly once.
6. Revoke the token in the panel and ask again. Expected: 401.
7. Repeat steps 1-2 with Codex CLI using the two printed commands.
8. As a viewer-role collaborator with their own token, ask for an edit. Expected: `forbidden`, nothing changes.

Record anything that does not match in the PR description. If any step fails, fix it before merging; do not mark the plan done.

- [ ] **Step 12: Commit**

```bash
cd $WEB && git add src docs tests && git commit -m "feat(agent): connect-your-CLI panel, status badge and docs" -m "Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>"
```

---
