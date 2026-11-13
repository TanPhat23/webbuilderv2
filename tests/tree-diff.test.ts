import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  diffTrees,
  patchWithDeletions,
} from "../src/features/editor/utils/element/treeDiff";
import { useElementStore } from "../src/features/editor/store/element-store";

const el = (id: string, elements: any[] = [], extra: Record<string, unknown> = {}) =>
  ({ id, type: "Frame", content: "", styles: {}, tailwindStyles: "", elements, pageId: "p", ...extra }) as any;

/** Applies ops to a tree the way the server would, to prove they are enough. */
function apply(tree: any[], ops: ReturnType<typeof diffTrees>): any[] {
  const clone = structuredClone(tree);
  const find = (list: any[], id: string): any[] | undefined => {
    for (const e of list) {
      if (e.id === id) return list;
      const hit = find(e.elements ?? [], id);
      if (hit) return hit;
    }
  };
  const get = (id: string): any => {
    const list = find(clone, id);
    return list?.find((e) => e.id === id);
  };
  const listOf = (parentId: string | null) =>
    parentId ? get(parentId).elements : clone;
  for (const op of ops) {
    if (op.type === "delete") {
      const list = find(clone, op.id)!;
      list.splice(list.findIndex((e) => e.id === op.id), 1);
    } else if (op.type === "create") {
      const parentId = (op.element as any).parentId ?? null;
      const list = listOf(parentId);
      list.push(structuredClone(op.element));
    } else if (op.type === "move") {
      const from = find(clone, op.id)!;
      const [moved] = from.splice(from.findIndex((e) => e.id === op.id), 1);
      listOf(op.newParentId).splice(op.newPosition, 0, moved);
    } else {
      const target = get(op.id);
      Object.assign(target, op.patch);
    }
  }
  return clone;
}
const ids = (tree: any[]): any[] =>
  tree.map((e) => (e.elements?.length ? [e.id, ids(e.elements)] : e.id));

test("patchWithDeletions sends removed keys as null and skips unchanged ones", () => {
  assert.equal(patchWithDeletions({ a: 1 }, { a: 1 }), undefined);
  assert.deepEqual(patchWithDeletions({ a: 1, b: 2 }, { a: 1 }), { b: null });
  assert.deepEqual(
    patchWithDeletions(
      { default: { width: "12%", color: "red" }, md: { gap: "4px" } },
      { default: { color: "red", height: "40px" }, md: { gap: "4px" } },
    ),
    { default: { width: null, height: "40px" } },
  );
});

test("a deleted section comes back as one create at its old position", () => {
  const before = [el("a"), el("b", [el("b1", [], { parentId: "b" })]), el("c")];
  const after = [el("a"), el("c")];
  assert.deepEqual(diffTrees(after, before).map((o) => [o.type, (o as any).id ?? (o as any).element.id]), [
    ["create", "b"],
  ]);
  // Undoing it removes the section and its child with a single delete.
  assert.deepEqual(diffTrees(before, after), [{ type: "delete", id: "b" }]);
});

test("reordering and moving between parents become moves", () => {
  const before = [el("a"), el("b"), el("c", [el("c1")])];
  const reordered = [el("c", [el("c1")]), el("a"), el("b")];
  const moves = diffTrees(before, reordered);
  assert.ok(moves.every((o) => o.type === "move"));
  assert.deepEqual(ids(apply(before, moves)), ids(reordered));

  const nested = [el("a"), el("c", [el("c1"), el("b")])];
  const ops = diffTrees(before, nested);
  assert.deepEqual(ids(apply(before, ops)), ids(nested));
});

test("style changes and removals become an update patch", () => {
  const before = [el("a", [], { styles: { default: { width: "12%", color: "red" } }, tailwindStyles: "w-[12%]" })];
  const after = [el("a", [], { styles: { default: { color: "red" } }, tailwindStyles: "" })];
  const ops = diffTrees(before, after);
  assert.equal(ops.length, 1);
  assert.deepEqual((ops[0] as any).patch.styles, { default: { width: null } });
  // An empty class string is a real change and must be sent.
  assert.equal((ops[0] as any).patch.tailwindStyles, "");
});

test("identical trees produce nothing", () => {
  const t = [el("a", [el("a1")]), el("b")];
  assert.deepEqual(diffTrees(t, structuredClone(t)), []);
});

test("undo sends the reverse of a delete; edits send removed style keys", () => {
  const sent: any[] = [];
  const store = useElementStore;
  store.getState().loadElements([el("a"), el("b"), el("c")], true);
  store.getState().setCollaborativeCallback(((type: string, id: string, data: any) => {
    sent.push([type, id, data]);
  }) as any);

  store.getState().deleteElement("b");
  sent.length = 0;
  store.getState().undo();
  assert.deepEqual(sent.map((s) => [s[0], s[1]]), [["create", "b"]]);
  assert.deepEqual(store.getState().elements.map((e: any) => e.id), ["a", "b", "c"]);

  sent.length = 0;
  store.getState().redo();
  assert.deepEqual(sent.map((s) => [s[0], s[1]]), [["delete", "b"]]);

  store.getState().updateElement("a", { styles: { default: { width: "10px", color: "red" } } } as any);
  sent.length = 0;
  store.getState().updateElement("a", { styles: { default: { color: "red" } } } as any);
  assert.deepEqual(sent[0][2].styles, { default: { width: null } });
  store.getState().setCollaborativeCallback(null as any);
});
