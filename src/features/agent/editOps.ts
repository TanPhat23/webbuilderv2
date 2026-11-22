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
import { REVEAL_EFFECTS, MAX_REVEAL_DELAY } from "@/features/preview/lib/reveal";
import {
  componentRoots, componentSetting, makeComponentInstance, validComponentOverrides, wouldCreateComponentCycle,
  type ComponentOverrides, type ComponentSource,
} from "@/features/projects/lib/components";
import type { AgentIssue } from "./protocol";

export const AGENT_ELEMENT_TYPES = ["Section", "Frame", "Text", "Button", "Link", "Image", "Input", "Select", "List", "Form", "Carousel"] as const;
const CONTAINERS = new Set<string>(["Section", "Frame", "Select", "List", "Form", "Carousel"]);
export const MAX_OPS = 200;
const MAX_TEXT = 20_000;
const MAX_SETTINGS_JSON = 20_000;
const MAX_ELEMENTS = 2_000;
const RESERVED = new Set<string>([...(HIDDEN_SETTINGS as Iterable<string>)]);

export interface NewElementInput { type?: string; component?: { id: string; overrides?: ComponentOverrides }; name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface ElementPatch { name?: string; content?: string; tailwindStyles?: string; src?: string; href?: string; settings?: Record<string, unknown> }
export interface EditOp { op: "create" | "update" | "move" | "delete"; id?: string; ref?: string; parentId?: string | null; index?: number; element?: NewElementInput; set?: ElementPatch }

export type EditResult =
  | { ok: true; elements: EditorElement[]; created: { ref?: string; id: string }[]; changes: number }
  | { ok: false; issues: AgentIssue[] };

type Node = Record<string, unknown> & { id: string; type: string; elements?: Node[] };

const fail = (path: string, message: string): EditResult => ({ ok: false, issues: [{ path, message }] });
const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

const TEXT_FIELDS = ["name", "content", "tailwindStyles", "src", "href"] as const;
const EDIT_OPERATIONS: ReadonlySet<unknown> = new Set<EditOp["op"]>(["create", "update", "move", "delete"]);

/** Shape checks that need no tree. Returns the first problem. */
function checkShapes(ops: unknown[]): AgentIssue | undefined {
  for (let index = 0; index < ops.length; index++) {
    const path = `operations[${index}]`;
    const op = ops[index];
    if (!isObject(op)) return { path, message: "must be an object" };
    if (!EDIT_OPERATIONS.has(op.op)) {
      return { path: `${path}.op`, message: "must be create, update, move or delete" };
    }
    if (op.parentId !== undefined && op.parentId !== null && typeof op.parentId !== "string") {
      return { path: `${path}.parentId`, message: "must be a string or null" };
    }
    if (op.index !== undefined && (typeof op.index !== "number" || !Number.isInteger(op.index) || op.index < 0)) {
      return { path: `${path}.index`, message: "must be a non-negative integer" };
    }
    if (op.op === "create") {
      const issue = checkCreateElement(op.element, `${path}.element`);
      if (issue) return issue;
      continue;
    }
    if (typeof op.id !== "string" || !op.id) {
      return { path: `${path}.id`, message: `${op.op} needs an element id` };
    }
    if (op.op === "update") {
      const issue = checkUpdateFields(op.set, `${path}.set`);
      if (issue) return issue;
    }
  }
  return undefined;
}

function checkCreateElement(element: unknown, path: string): AgentIssue | undefined {
  if (!isObject(element)) return { path, message: "create needs an element" };
  if (element.component !== undefined) {
    const issue = checkCreateComponent(element.component, `${path}.component`);
    if (issue) return issue;
  }
  if ((element.component === undefined || element.type !== undefined) &&
      !AGENT_ELEMENT_TYPES.some((type) => type === element.type)) {
    return {
      path: `${path}.type`,
      message: `unsupported type ${JSON.stringify(element.type)}; use one of ${AGENT_ELEMENT_TYPES.join(", ")}`,
    };
  }
  const issue = checkFields(element, path);
  if (isObject(element.settings) && "component" in element.settings) {
    return { path: `${path}.settings.component`, message: "use element.component to create a linked instance" };
  }
  return issue;
}

function checkCreateComponent(component: unknown, path: string): AgentIssue | undefined {
  if (!isObject(component) || typeof component.id !== "string" || !component.id || component.id.length > 255 ||
      Object.keys(component).some((key) => key !== "id" && key !== "overrides")) {
    return { path, message: "must contain a component page id and optional overrides" };
  }
  if (component.overrides !== undefined && !validComponentOverrides(component.overrides)) {
    return { path: `${path}.overrides`, message: "must be a bounded map of text, src, alt or href strings" };
  }
  return undefined;
}

function checkUpdateFields(fields: unknown, path: string): AgentIssue | undefined {
  if (!isObject(fields)) return { path, message: "update needs the fields to set" };
  const issue = checkFields(fields, path);
  if (issue) return issue;
  if (!isObject(fields.settings) || !("component" in fields.settings)) return undefined;

  const setting = fields.settings.component;
  if (!isObject(setting) || Object.keys(setting).length !== 1 || !Object.hasOwn(setting, "overrides") ||
      (setting.overrides !== null && !validComponentOverrides(setting.overrides))) {
    return { path: `${path}.settings.component.overrides`, message: "must be a bounded map of content overrides or null to clear it" };
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
      if (key !== "component" && RESERVED.has(key)) return { path: `${path}.settings.${key}`, message: `"${key}" is reserved and cannot be set from here` };
    }
    const { reveal, revealDelay } = obj.settings;
    if (reveal !== undefined && !(REVEAL_EFFECTS as readonly string[]).includes(reveal as string)) {
      return { path: `${path}.settings.reveal`, message: `must be one of ${REVEAL_EFFECTS.join(", ")}` };
    }
    if (revealDelay !== undefined && (typeof revealDelay !== "number" || !Number.isFinite(revealDelay) || revealDelay < 0 || revealDelay > MAX_REVEAL_DELAY)) {
      return { path: `${path}.settings.revealDelay`, message: `must be a number of milliseconds from 0 to ${MAX_REVEAL_DELAY}` };
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

type NodeLocation = { node: Node; siblings: Node[] };

type ValidatedEditOp = Pick<EditOp, "parentId" | "index"> & (
  | { op: "create"; element: NewElementInput; ref?: unknown }
  | { op: "update"; id: string; set: ElementPatch }
  | { op: "move" | "delete"; id: string }
);

interface EditBatch {
  root: Node[];
  pageId: string;
  components?: ComponentSource;
  masters?: ReturnType<typeof componentRoots>;
  refs: Map<string, string>;
  created: { ref?: string; id: string }[];
}

function findNode(root: Node[], id: string): NodeLocation | undefined {
  let hit: NodeLocation | undefined;
  walk(root, (node, _parent, siblings) => {
    if (!hit && node.id === id) hit = { node, siblings };
  });
  return hit;
}

function childrenOf(batch: EditBatch, parent: string | null | undefined, path: string): { list: Node[]; id: string | null } | AgentIssue {
  if (parent === undefined || parent === null) return { list: batch.root, id: null };
  const id = batch.refs.get(parent) ?? parent;
  const hit = findNode(batch.root, id);
  if (!hit) return { path, message: `unknown element "${parent}"` };
  if (componentSetting(hit.node as unknown as EditorElement)) return { path, message: "component instances cannot have children" };
  if (!CONTAINERS.has(hit.node.type)) return { path, message: `${hit.node.type} elements cannot have children` };
  hit.node.elements ??= [];
  return { list: hit.node.elements, id };
}

function place(list: Node[], node: Node, index: number | undefined, path: string): AgentIssue | undefined {
  if (index !== undefined && index > list.length) {
    return { path, message: `out of range: this parent has ${list.length} children, so the index is 0 to ${list.length}` };
  }
  list.splice(index ?? list.length, 0, node);
  return undefined;
}

function createElement(batch: EditBatch, op: Extract<ValidatedEditOp, { op: "create" }>, path: string): AgentIssue | undefined {
  const { element, ref } = op;
  if (ref !== undefined && (typeof ref !== "string" || !ref || batch.refs.has(ref) || findNode(batch.root, ref))) {
    return { path: `${path}.ref`, message: "a ref must be a new, unique name" };
  }
  const target = childrenOf(batch, op.parentId, `${path}.parentId`);
  if ("path" in target) return target;

  const { pageId, components, masters } = batch;
  const master = element.component && masters?.get(element.component.id);
  if (element.component && (!master || !components || wouldCreateComponentCycle(pageId, element.component.id, components))) {
    return { path: `${path}.element.component.id`, message: "choose a component with a master that does not reference this page" };
  }
  const instance = master && makeComponentInstance(master, pageId, element.component?.overrides);
  const id = instance?.id ?? newEntityId();
  const node: Node = {
    id, type: instance?.type ?? element.type!, pageId, parentId: target.id, content: element.content ?? "", styles: {},
    settings: instance?.settings ?? element.settings ?? null,
    ...(element.name !== undefined && { name: element.name }),
    ...(element.tailwindStyles !== undefined && { tailwindStyles: element.tailwindStyles }),
    ...(element.src !== undefined && { src: element.src }),
    ...(element.href !== undefined && { href: element.href }),
    ...(!instance && CONTAINERS.has(element.type!) && { elements: [] }),
  };
  const issue = place(target.list, node, op.index, `${path}.index`);
  if (issue) return issue;
  if (ref) batch.refs.set(ref, id);
  batch.created.push({ ...(ref && { ref }), id });
  return undefined;
}

function updateElement(node: Node, fields: ElementPatch, path: string): AgentIssue | undefined {
  for (const field of TEXT_FIELDS) {
    if (fields[field] !== undefined) node[field] = fields[field];
  }
  if (!fields.settings) return undefined;

  const { component, ...other } = fields.settings;
  const settings = { ...((node.settings as Record<string, unknown> | null) ?? {}), ...other };
  if (component !== undefined) {
    const link = componentSetting(node as unknown as EditorElement);
    if (!link) return { path: `${path}.set.settings.component`, message: "this element is not a component instance" };
    const { overrides } = component as { overrides: ComponentOverrides | null };
    settings.component = { pageId: link.pageId, rootId: link.rootId, ...(overrides && { overrides }) };
  }
  node.settings = settings;
  return undefined;
}

function moveElement(batch: EditBatch, hit: NodeLocation, { parentId, index }: Pick<EditOp, "parentId" | "index">, path: string): AgentIssue | undefined {
  const { node, siblings } = hit;
  if (parentId !== undefined && parentId !== null) {
    const targetId = batch.refs.get(parentId) ?? parentId;
    if (targetId === node.id || (node.elements && findNode(node.elements, targetId))) {
      return { path: `${path}.parentId`, message: "an element cannot be moved into itself or its own descendant" };
    }
  }
  const target = childrenOf(batch, parentId, `${path}.parentId`);
  if ("path" in target) return target;
  siblings.splice(siblings.indexOf(node), 1);
  node.parentId = target.id;
  return place(target.list, node, index, `${path}.index`);
}

export function applyEdits(current: EditorElement[], ops: unknown, pageId: string, components?: ComponentSource): EditResult {
  if (!Array.isArray(ops) || ops.length === 0) return fail("operations", "at least one operation is required");
  if (ops.length > MAX_OPS) return fail("operations", `at most ${MAX_OPS} operations per call`);
  const shape = checkShapes(ops);
  if (shape) return { ok: false, issues: [shape] };

  const root = structuredClone(current) as unknown as Node[];
  const batch: EditBatch = {
    root, pageId, components, masters: components && componentRoots(components),
    refs: new Map(), created: [],
  };

  const validatedOps = ops as ValidatedEditOp[];
  for (let index = 0; index < validatedOps.length; index++) {
    const op = validatedOps[index];
    const path = `operations[${index}]`;
    if (op.op === "create") {
      const issue = createElement(batch, op, path);
      if (issue) return { ok: false, issues: [issue] };
      continue;
    }

    const hit = findNode(root, op.id);
    if (!hit) return fail(`${path}.id`, `unknown element "${op.id}"`);
    if (op.op === "delete") {
      hit.siblings.splice(hit.siblings.indexOf(hit.node), 1);
      continue;
    }

    const issue = op.op === "update" ? updateElement(hit.node, op.set, path) : moveElement(batch, hit, op, path);
    if (issue) return { ok: false, issues: [issue] };
  }

  if (components?.pageIds.has(pageId) && root.length > 1) return fail("operations", "a component page can have only one root");
  if (countAll(root) > MAX_ELEMENTS) return fail("operations", `the page would exceed ${MAX_ELEMENTS} elements`);
  return { ok: true, elements: root as unknown as EditorElement[], created: batch.created, changes: validatedOps.length };
}
