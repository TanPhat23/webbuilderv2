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
