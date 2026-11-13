/**
 * What changed between two element trees, as the operations the realtime
 * server understands (create, delete, move, update).
 *
 * Undo and redo swap the whole local tree. Diffing the trees lets them send
 * exactly what changed, so collaborators and the saved page follow.
 *
 * Pure: no React, no store.
 */
import type { EditorElement } from "@/types/global.type";

type Json = Record<string, unknown>;

export type TreeOp =
  | { type: "delete"; id: string }
  | { type: "create"; element: EditorElement }
  | { type: "move"; id: string; newParentId: string | null; newPosition: number }
  | { type: "update"; id: string; patch: Partial<EditorElement> };

const isObject = (v: unknown): v is Json =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/**
 * A merge patch that turns `before` into `after`: changed keys carry their new
 * value, removed keys carry `null` (the server deletes a key on null), and
 * unchanged keys are left out. Returns undefined when nothing differs.
 *
 * The server deep-merges styles and settings, so sending the new object alone
 * would leave any removed key in place.
 */
export function patchWithDeletions(
  before: unknown,
  after: unknown,
): Json | undefined {
  const a = isObject(before) ? before : {};
  const b = isObject(after) ? after : {};
  const patch: Json = {};
  for (const key of Object.keys(a)) {
    if (!(key in b) || b[key] === undefined) patch[key] = null;
  }
  for (const [key, value] of Object.entries(b)) {
    if (value === undefined) continue;
    if (isObject(value) && isObject(a[key])) {
      const nested = patchWithDeletions(a[key], value);
      if (nested) patch[key] = nested;
    } else if (!same(a[key], value)) {
      patch[key] = value;
    }
  }
  return Object.keys(patch).length ? patch : undefined;
}

const SCALARS = ["content", "name", "src", "href", "tailwindStyles"] as const;

/** Field changes of one element, excluding its position and children. */
export function elementPatch(
  before: EditorElement,
  after: EditorElement,
): Partial<EditorElement> | undefined {
  const patch: Record<string, unknown> = {};
  for (const key of SCALARS) {
    const next = (after as unknown as Json)[key];
    if (next !== undefined && !same((before as unknown as Json)[key], next)) {
      patch[key] = next;
    }
  }
  for (const key of ["styles", "settings"] as const) {
    const delta = patchWithDeletions(
      (before as unknown as Json)[key],
      (after as unknown as Json)[key],
    );
    if (delta) patch[key] = delta;
  }
  return Object.keys(patch).length
    ? (patch as Partial<EditorElement>)
    : undefined;
}

const ROOT = "";

function childrenOf(el: EditorElement): EditorElement[] {
  const kids = (el as unknown as { elements?: EditorElement[] }).elements;
  return Array.isArray(kids) ? kids : [];
}

interface Index {
  byId: Map<string, EditorElement>;
  /** parent id ("" for the page root) to ordered child ids */
  kids: Map<string, string[]>;
  parent: Map<string, string>;
}

function index(tree: EditorElement[]): Index {
  const out: Index = { byId: new Map(), kids: new Map(), parent: new Map() };
  const visit = (list: EditorElement[], parentId: string) => {
    out.kids.set(parentId, list.map((e) => e.id));
    for (const el of list) {
      out.byId.set(el.id, el);
      out.parent.set(el.id, parentId);
      visit(childrenOf(el), el.id);
    }
  };
  visit(tree, ROOT);
  return out;
}

/**
 * Operations that turn `before` into `after`, in an order that is valid to
 * apply one after another: deletes, creates, moves, then field updates.
 * Positions are computed against the tree as the earlier operations leave it.
 */
export function diffTrees(
  before: EditorElement[],
  after: EditorElement[],
): TreeOp[] {
  const b = index(before);
  const a = index(after);
  const ops: TreeOp[] = [];

  // The server's tree as the operations are applied.
  const kids = new Map<string, string[]>();
  for (const [k, v] of b.kids) kids.set(k, [...v]);
  const parent = new Map(b.parent);
  const detach = (id: string) => {
    const list = kids.get(parent.get(id) ?? ROOT);
    const at = list?.indexOf(id) ?? -1;
    if (list && at >= 0) list.splice(at, 1);
  };

  // Deletes: only the top of each removed subtree, its children go with it.
  for (const id of b.byId.keys()) {
    if (a.byId.has(id)) continue;
    const up = b.parent.get(id) ?? ROOT;
    if (up !== ROOT && !a.byId.has(up)) continue;
    ops.push({ type: "delete", id });
    detach(id);
  }

  // Creates: the top of each added subtree, lowest position first so each
  // insert lands where the final order expects it.
  const added = [...a.byId.keys()]
    .filter((id) => {
      if (b.byId.has(id)) return false;
      const up = a.parent.get(id) ?? ROOT;
      return up === ROOT || b.byId.has(up);
    })
    .sort((x, y) => {
      const px = a.parent.get(x) ?? ROOT;
      const py = a.parent.get(y) ?? ROOT;
      if (px !== py) return px < py ? -1 : 1;
      return (a.kids.get(px)?.indexOf(x) ?? 0) - (a.kids.get(py)?.indexOf(y) ?? 0);
    });
  for (const id of added) {
    const up = a.parent.get(id) ?? ROOT;
    const list = kids.get(up) ?? [];
    const at = Math.min(a.kids.get(up)?.indexOf(id) ?? list.length, list.length);
    list.splice(at, 0, id);
    kids.set(up, list);
    parent.set(id, up);
    // Register the created subtree so later moves can target it.
    const register = (pid: string) => {
      kids.set(pid, [...(a.kids.get(pid) ?? [])]);
      for (const child of a.kids.get(pid) ?? []) {
        parent.set(child, pid);
        register(child);
      }
    };
    register(id);
    ops.push({ type: "create", element: a.byId.get(id)! });
  }

  // Moves: walk the final tree parent by parent and fix any position that
  // doesn't match yet.
  const queue = [ROOT];
  while (queue.length) {
    const pid = queue.shift()!;
    const want = a.kids.get(pid) ?? [];
    const list = kids.get(pid) ?? [];
    kids.set(pid, list);
    want.forEach((id, i) => {
      if (list[i] !== id) {
        detach(id);
        list.splice(i, 0, id);
        parent.set(id, pid);
        ops.push({
          type: "move",
          id,
          newParentId: pid === ROOT ? null : pid,
          newPosition: i,
        });
      }
    });
    queue.push(...want);
  }

  // Field changes of elements that exist on both sides. Created elements
  // already carry their final fields.
  for (const [id, next] of a.byId) {
    const prev = b.byId.get(id);
    if (!prev) continue;
    const patch = elementPatch(prev, next);
    if (patch) ops.push({ type: "update", id, patch });
  }
  return ops;
}
