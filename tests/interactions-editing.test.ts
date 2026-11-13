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
  assert.deepEqual(stepIdsBefore(steps, [2]), ["r"]);
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

test("autocomplete only offers branch results guaranteed to have run", () => {
  const branchSteps: any[] = [
    { if: "{{ true }}", then: [{ id: "both", toast: "a" }, { id: "thenOnly", toast: "b" }], else: [{ id: "both", toast: "c" }, { id: "elseOnly", toast: "d" }] },
    { toast: "after" },
  ];
  assert.deepEqual(stepIdsBefore(branchSteps, [0, "else", 1]), ["both"]);
  assert.deepEqual(stepIdsBefore(branchSteps, [1]), ["both"]);
});

test("out-of-bounds moves leave lists unchanged", () => {
  assert.deepEqual(moveStep(steps, [], 99, 0), steps);
  assert.deepEqual(moveStep(steps, [], 0, -1), steps);
});

test("headers preserve special keys as own properties", () => {
  const parsed = parseHeaders("__proto__: value\nconstructor: x");
  assert.equal(Object.hasOwn(parsed, "__proto__"), true);
  assert.equal(parsed.__proto__, "value");
  assert.equal(parsed.constructor, "x");
});

test("element suggestions generate valid expressions for UUID element IDs", async () => {
  const { parseExpression } = await import("../src/features/interactions/runtime/expression");
  const ctx = { variables: [], stepIds: [], elements: [{ id: "0194aabc-1234-7000-a000-123456789abc", name: "Email" }] };
  const item = suggest("{{ el.Em", 8, ctx)!.items[0];
  assert.equal(item.insert, "el['0194aabc-1234-7000-a000-123456789abc'].");
  assert.doesNotThrow(() => parseExpression(`${item.insert}value`));
  assert.deepEqual(suggest(`{{ ${item.insert}v`, 3 + item.insert.length + 1, ctx)!.items.map((i) => i.label), ["value", "visible"]);
});
