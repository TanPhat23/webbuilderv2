import { strict as assert } from "node:assert";
import { test } from "node:test";
import { referenceWarnings } from "../src/features/interactions/references";

const ctx = { elementIds: new Set(["btn", "modal1"]), variables: new Set(["user"]), flows: new Set(["showError"]) };

test("resolved references across elements, variables, flows, and earlier steps produce no warnings", () => {
  assert.deepEqual(referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [
    { id: "r", call: "api", method: "GET", url: "/a" },
    { if: "{{ steps.r.ok && vars.user }}", then: [{ show: "modal1" }], else: [{ run: "showError" }] },
    { set: "user", to: "{{ el.btn.value }}" },
  ] } }, ctx), []);
});

test("dangling references and forward step reads warn at their source paths", () => {
  const warnings = referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [
    { show: "gone" }, { set: "nope", to: "1" }, { run: "missingFlow" },
    { toast: "{{ steps.later.data }} {{ vars.ghost }} {{ el.gone2.value }}" },
    { id: "later", call: "api", method: "GET", url: "/x" },
  ] } }, ctx);
  const pairs = warnings.map((w) => `${w.path}|${w.message}`);
  for (const expected of [
    "interactions.ix_aaaaaaaa.do[0].show|missing element gone",
    "interactions.ix_aaaaaaaa.do[1].set|no variable named nope",
    "interactions.ix_aaaaaaaa.do[2].run|no flow named missingFlow",
    "interactions.ix_aaaaaaaa.do[3].toast|no earlier step with id later",
    "interactions.ix_aaaaaaaa.do[3].toast|no variable named ghost",
    "interactions.ix_aaaaaaaa.do[3].toast|missing element gone2",
  ]) assert.ok(pairs.includes(expected), expected);
  assert.ok(warnings.every((w) => w.level === "warning"));
});

test("scroll to a number is not an element reference", () => {
  assert.deepEqual(referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [{ scroll: 300 }] } }, ctx), []);
});

test("step references respect conditional branches and only definitely executed ids escape", () => {
  const warnings = referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [
    { if: "{{ true }}", then: [
      { id: "onlyThen", wait: 0 }, { id: "both", wait: 0 },
    ], else: [
      { toast: "{{ steps.onlyThen }}" }, { id: "both", wait: 0 },
    ] },
    { toast: "{{ steps.onlyThen }} {{ steps.both }}" },
    { if: "{{ true }}", then: [{ id: "optional", wait: 0 }] },
    { toast: "{{ steps.optional }}" },
  ] } }, ctx);
  assert.deepEqual(warnings.map((w) => [w.path, w.message]), [
    ["interactions.ix_aaaaaaaa.do[0].else[0].toast", "no earlier step with id onlyThen"],
    ["interactions.ix_aaaaaaaa.do[1].toast", "no earlier step with id onlyThen"],
    ["interactions.ix_aaaaaaaa.do[3].toast", "no earlier step with id optional"],
  ]);
});

test("call header templates receive reference warnings with header paths", () => {
  const warnings = referenceWarnings({ ix_aaaaaaaa: { on: "click", do: [
    { call: "api", method: "GET", url: "/", headers: { Authorization: "{{ vars.token }}", "X-Element": "{{ el.gone.value }}" } },
  ] } }, ctx, "custom");
  assert.deepEqual(warnings.map((w) => [w.path, w.message]), [
    ["custom.ix_aaaaaaaa.do[0].headers.Authorization", "no variable named token"],
    ["custom.ix_aaaaaaaa.do[0].headers.X-Element", "missing element gone"],
  ]);
});
