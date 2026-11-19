import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "../src/types/global.type";
import { componentSetting, detach, isMissingComponent, resolveComponents, usageCount } from "../src/features/projects/lib/components";
import { ComponentConversionUnconfirmed, persistComponentInstance } from "../src/features/editor/services/component-conversion";
import { RealtimeRequestRejected } from "../src/features/collaboration/lib/yjs/MessageDispatcher";
import { plainComponentSnapshot, resolveElements } from "../src/features/projects/lib/resolve-elements";
import { diffTrees } from "../src/features/editor/utils/element/treeDiff";

const text = (id: string, pageId: string, content = ""): EditorElement => ({ id, pageId, content, type: "Text" });
const section = (id: string, pageId: string, elements: EditorElement[] = []): Extract<EditorElement, { type: "Section" }> => ({
  id, pageId, elements, type: "Section", content: "",
});
const instance = (id: string, pageId: string, master: string, rootId: string): Extract<EditorElement, { type: "Section" }> => ({
  ...section(id, pageId), settings: { component: { pageId: master, rootId } },
});
const kids = (el: EditorElement) => (el as Extract<EditorElement, { type: "Section" }>).elements;

test("component copies have stable ids, scoped content and merged root styles", () => {
  const master = {
    ...section("root", "cp", [
      { ...text("title", "cp", "Original"), styles: { default: { color: "red" } } },
      { id: "pic", pageId: "cp", type: "Image", content: "Old alt", src: "/old.png" },
      { id: "cta", pageId: "cp", type: "Button", content: "Buy", href: "/old" },
    ]),
    styles: { default: { margin: 4, color: "blue" }, md: { width: 200 } },
  };
  const first = {
    ...instance("first", "home", "cp", "root"),
    styles: { default: { margin: 8 } },
    settings: { component: { pageId: "cp", rootId: "root", overrides: {
      title: { text: "Changed", color: "green", href: "/ignored" },
      pic: { src: "/new.png", alt: "New alt" },
      cta: { href: "/new" },
      absent: { text: "Ignored" },
    } } },
  };
  const second = instance("second", "home", "cp", "root");
  const out = resolveComponents([first, second], [master], new Set(["cp"]));
  assert.deepEqual(out.map((e) => e.id), ["first", "second"]);
  assert.deepEqual(out[0].styles, { default: { margin: 8, color: "blue" }, md: { width: 200 } });
  assert.deepEqual(kids(out[0]).map((e) => [e.id, e.pageId, e.parentId, e.content, e.src, e.href]), [
    ["first~title", "home", "first", "Changed", undefined, undefined],
    ["first~pic", "home", "first", "New alt", "/new.png", undefined],
    ["first~cta", "home", "first", "Buy", undefined, "/new"],
  ]);
  assert.equal(kids(out[0])[0].styles?.default?.color, "red");
  assert.equal(kids(out[1])[0].id, "second~title");
  assert.equal(kids(out[1])[0].content, "Original");
  assert.equal(kids(master)[0].id, "title");
  assert.deepEqual(resolveComponents([first, second], [master], new Set(["cp"])), out);
});

test("nested component ids are scoped to their nested instance", () => {
  const inner = section("inner", "b", [text("leaf", "b", "Nested")]);
  const outer = section("outer", "a", [
    instance("one", "a", "b", "inner"), instance("two", "a", "b", "inner"),
  ]);
  const [result] = resolveComponents([instance("x", "home", "a", "outer")], [inner, outer], new Set(["a", "b"]));
  assert.deepEqual(kids(result).map((e) => kids(e)[0].id), ["x~one~leaf", "x~two~leaf"]);
  assert.equal(usageCount([outer, instance("x", "home", "a", "outer")], "b"), 2);
});

test("cycles and missing or non-component masters leave no published markup", () => {
  const a = section("root-a", "a", [instance("nested-b", "a", "b", "root-b")]);
  const b = section("root-b", "b", [
    instance("nested-a", "b", "a", "root-a"), text("safe", "b", "Safe sibling"),
  ]);
  const out = resolveComponents([
    instance("x", "home", "a", "root-a"),
    instance("bad-root", "home", "a", "nonexistent"),
    instance("not-cp", "home", "normal", "normal-root"),
  ], [a, b, section("normal-root", "normal")], new Set(["a", "b"]));
  assert.equal(out.length, 1);
  assert.deepEqual(kids(kids(out[0])[0]).map((e) => e.id), ["x~nested-b~safe"]);
  assert.deepEqual(resolveComponents([instance("loop", "a", "a", "root-a")], [a], new Set(["a"])), []);
});

test("no branch expands more than eight component references", () => {
  const masters = Array.from({ length: 9 }, (_, index) =>
    section("root", String(index), [
      text("leaf", String(index), String(index)),
      instance("next", String(index), String(index + 1), "root"),
    ]),
  );
  const [out] = resolveComponents([instance("x", "home", "0", "root")], masters, new Set(masters.map((e) => e.pageId)));
  let level = out;
  for (let i = 0; i < 7; i++) level = kids(level)[1];
  assert.deepEqual(kids(level).map((e) => e.content), ["7"]);
});

test("detach keeps the instance position and rekeys the materialized subtree", () => {
  const linked = { ...instance("x", "home", "cp", "root"), parentId: "parent", order: 3 };
  const master = section("root", "cp", [text("title", "cp", "Master")]);
  const detached = detach(linked, [master], new Set(["cp"]));
  assert.equal(detached.id, "x");
  assert.equal(detached.order, 3);
  assert.equal(detached.parentId, "parent");
  assert.equal(componentSetting(detached), undefined);
  assert.equal(kids(detached)[0].content, "Master");
  assert.equal(kids(detached)[0].parentId, "x");
  assert.notEqual(kids(detached)[0].id, "x~title");
  assert.equal(componentSetting(detach(linked, [], new Set())), undefined);
});

test("an editor placeholder survives resolution and detaching it clears the link", () => {
  const linked = instance("x", "home", "missing", "root");
  const [placeholder] = resolveComponents([linked], [], new Set(), { showMissing: true });
  assert.equal(isMissingComponent(placeholder), true);
  assert.equal(placeholder.id, "x");
  assert.equal(isMissingComponent(detach(linked, [], new Set())), false);
});

test("component conversion keeps the original if staging or deleting fails", async () => {
  const original = text("original", "home", "Content");
  const staged = instance("staged", "home", "master", "root");
  for (const reject of ["staged", "original"]) {
    const stored = new Set([original.id]);
    await assert.rejects(persistComponentInstance({
      stage: async () => {
        if (reject === "staged") throw new RealtimeRequestRejected("Cannot create");
        stored.add(staged.id);
      },
      removeOriginal: async () => {
        if (reject === "original") throw new RealtimeRequestRejected("Cannot delete");
        stored.delete(original.id);
      },
      removeStaged: async () => { stored.delete(staged.id); },
    }), RealtimeRequestRejected);
    assert.deepEqual([...stored], [original.id]);
  }
});

test("a lost delete acknowledgement preserves the only confirmed copy", async () => {
  let replacementExists = false;
  await assert.rejects(persistComponentInstance({
    stage: async () => { replacementExists = true; },
    removeOriginal: async () => { throw new Error("Connection closed"); },
    removeStaged: async () => { replacementExists = false; },
  }), ComponentConversionUnconfirmed);
  assert.equal(replacementExists, true);
});

test("account snapshots flatten project links so they can be pasted into another project", () => {
  const root = section("root", "master", [text("title", "master", "Master content")]);
  const original = section("wrapper", "home", [instance("link", "home", "master", "root")]);
  const snapshot = plainComponentSnapshot(original, "other-project-page", { elements: [root], pageIds: new Set(["master"]) });
  const [copied] = kids(snapshot);
  assert.equal(componentSetting(copied), undefined);
  assert.equal(copied.pageId, "other-project-page");
  assert.equal(kids(copied)[0].content, "Master content");
  assert.equal(kids(copied)[0].parentId, copied.id);
  assert.notEqual(copied.id, "link");
});

test("realtime detach clears the link before attaching the materialized children", () => {
  const linked = { ...instance("x", "home", "cp", "root"), elements: undefined } as unknown as EditorElement;
  const root = section("root", "cp", [text("title", "cp", "Master")]);
  const local = detach(linked, [root], new Set(["cp"]));
  const operations = diffTrees([linked], [local]);
  assert.equal(operations[0].type, "update");
  assert.equal(operations[1].type, "create");
});

test("page resolution expands instances inside shared sections and preserves missing canvas instances", () => {
  const source = {
    ...section("shared", "source", [
      instance("card", "source", "cp", "master"),
      instance("missing", "source", "cp", "unknown"),
    ]),
    settings: { sharedSection: { slot: "header" as const } },
  };
  const link = {
    ...section("link", "home"),
    settings: { sharedSection: { slot: "header" as const, sourcePageId: "source", sourceId: "shared" } },
  };
  const inputs = {
    page: [link],
    project: [source, section("master", "cp", [text("label", "cp", "Card")])],
    pageIds: new Set(["source", "home"]),
    componentIds: new Set(["cp"]),
  };
  const [published] = resolveElements(inputs);
  assert.equal(published.id, "link");
  assert.deepEqual(kids(published).map((element) => element.id), ["card"]);
  assert.equal(kids(kids(published)[0])[0].id, "card~label");
  const [canvas] = resolveElements({ ...inputs, showMissing: true });
  assert.ok(isMissingComponent(kids(canvas)[1]));
});
