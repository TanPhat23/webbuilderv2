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

test("scroll reveal settings are accepted when valid and rejected with a path when not", () => {
  const tree = [{ id: "s", type: "Section", pageId: "p", content: "", styles: {}, settings: null, elements: [] }] as never;
  const ok = applyEdits(tree, [{ op: "update", id: "s", set: { settings: { reveal: "fade-up", revealDelay: 200 } } }], "p");
  assert.ok(ok.ok);
  const badEffect = applyEdits(tree, [{ op: "update", id: "s", set: { settings: { reveal: "explode" } } }], "p");
  assert.ok(!badEffect.ok && badEffect.issues[0].path === "operations[0].set.settings.reveal");
  const badDelay = applyEdits(tree, [{ op: "create", element: { type: "Frame", settings: { reveal: "fade", revealDelay: 99999 } } }], "p");
  assert.ok(!badDelay.ok && badDelay.issues[0].path === "operations[0].element.settings.revealDelay");
});

const componentRoot = el("master-root", "Text", { pageId: "master", content: "Master" });
const componentProject = { elements: [componentRoot], pageIds: new Set(["master"]) };

test("create component instances from the master type and reject children", () => {
  const operation = { op: "create", ref: "linked", element: { component: { id: "master", overrides: { "master-root": { text: "Here" } } } } };
  const created = applyEdits([], [operation], PAGE, componentProject);
  assert.ok(created.ok);
  assert.equal(created.elements[0].type, "Text");
  assert.deepEqual(created.elements[0].settings?.component, { pageId: "master", rootId: "master-root", overrides: { "master-root": { text: "Here" } } });
  assert.equal("elements" in created.elements[0], false);
  const nested = applyEdits([], [operation, { op: "create", parentId: "linked", element: { type: "Text" } }], PAGE, componentProject);
  assert.ok(!nested.ok);
});

test("reject non-component pages, cycles, and unsupported or oversized overrides", () => {
  for (const component of [
    { id: "not-a-master" },
    { id: "master", overrides: { "master-root": { color: "red" } } },
    { id: "master", overrides: { "master-root": { text: "y".repeat(20_001) } } },
  ]) {
    assert.equal(applyEdits([], [{ op: "create", element: { component } }], PAGE, componentProject).ok, false);
  }
  assert.equal(applyEdits([], [{ op: "create", element: { component: { id: "master" } } }], "master", componentProject).ok, false);
});

test("update can clear component overrides without changing the link", () => {
  const before = [el("instance", "Text", { settings: { component: { pageId: "master", rootId: "master-root", overrides: { "master-root": { text: "Old" } } } } })];
  const result = applyEdits(before, [{ op: "update", id: "instance", set: { settings: { component: { overrides: null } } } }], PAGE);
  assert.ok(result.ok);
  assert.deepEqual(result.elements[0].settings?.component, { pageId: "master", rootId: "master-root" });
  assert.equal(applyEdits(before, [{ op: "update", id: "instance", set: { settings: { component: { pageId: "other" } } } }], PAGE).ok, false);
});
