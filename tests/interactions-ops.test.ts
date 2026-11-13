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

test("id generation never replaces an existing interaction after repeated collisions", () => {
  const existing = { on: "click", do: [{ toast: "original" }] };
  const base = el("b", { settings: { interactions: { ix_00000000: existing } } });
  const result = addInteraction(base, "click", [{ toast: "new" }], {}, () => 0);
  assert.equal(result.ok, false);
  assert.deepEqual(getInteractions(base).ix_00000000, existing);
});

test("published schema enforces event-specific options", async () => {
  // AJV bundled with eslint supports the draft-07 subset used by these conditions.
  const { createRequire } = await import("node:module");
  const Ajv = createRequire(import.meta.url)("ajv");
  const schema: any = structuredClone(buildJsonSchema());
  delete schema.$schema;
  const validate = new Ajv({ schemaId: "auto" }).compile(schema);
  const doc = (on: string, options: Record<string, unknown>) => ({
    ix_abcdefgh: { on, do: [], ...options },
  });
  assert.equal(validate(doc("click", { key: "Enter" })), false);
  assert.equal(validate(doc("keydown", { key: "Enter" })), true);
  assert.equal(validate(doc("keyup", { key: "Enter" })), true);
  assert.equal(validate(doc("click", { once: true })), false);
  assert.equal(validate(doc("visible", { once: false })), true);
  assert.equal(validate(doc("click", {})), true);
});
