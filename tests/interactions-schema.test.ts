// tests/interactions-schema.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import {
  validateInteractionMap,
  verbOf,
  VERBS,
} from "../src/features/interactions/schema";

const ok = (map: unknown) => assert.deepEqual(validateInteractionMap(map), []);

test("the spec example is valid", () => {
  ok({
    ix_7f2ab9cd: {
      on: "submit",
      enabled: true,
      do: [
        { id: "signup", call: "api", method: "POST", url: "/api/signup", body: "{{ form }}" },
        {
          if: "{{ steps.signup.ok }}",
          then: [{ toast: "Welcome!", kind: "success" }, { set: "user", to: "{{ steps.signup.data }}" }],
          else: [{ run: "showError" }],
        },
      ],
    },
  });
});

test("every verb has a schema and a valid minimal step", () => {
  const minimal: Record<string, unknown> = {
    navigate: { navigate: "/x" }, show: { show: "e1" }, hide: { hide: "e1" },
    toggle: { toggle: "e1" }, scroll: { scroll: 120 }, modal: { modal: "open" },
    toast: { toast: "hi" }, copy: { copy: "x" }, download: { download: "/f.pdf" },
    animate: { animate: "e1", preset: "bounce" }, class: { class: "toggle", target: "e1", name: "open" },
    set: { set: "user", to: "1" }, call: { call: "api", method: "GET", url: "/a" },
    submit: { submit: "f1" }, reset: { reset: "f1" }, wait: { wait: 10 }, if: { if: "{{ true }}", then: [] },
    run: { run: "flowA" }, code: { code: "return 1" },
  };
  assert.deepEqual([...VERBS].sort(), Object.keys(minimal).sort());
  for (const [verb, step] of Object.entries(minimal)) {
    assert.equal(verbOf(step), verb);
    ok({ ix_aaaaaaaa: { on: "click", do: [step] } });
  }
});

test("path-addressed errors with levels", () => {
  const issues = validateInteractionMap({
    ix_aaaaaaaa: {
      on: "click",
      do: [
        { call: "api", method: "POST" },                  // url missing → incomplete
        { toast: 5 },                                     // wrong type → error
        { toast: "x", show: "e1" },                       // two verbs → error
        { nope: true },                                   // no verb → error
        { if: "{{ a }}", then: [{ navigate: "" }] },      // nested empty → incomplete
        { toast: "Hi {{ vars. }}" },                      // template syntax → incomplete
        { wait: 10, extra: 1 },                           // unknown key → error
      ],
    },
  });
  const byPath = Object.fromEntries(issues.map((i) => [i.path, i]));
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[0].url"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[0].url"].message, "required");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[1].toast"].level, "error");
  assert.match(byPath["interactions.ix_aaaaaaaa.do[2]"].message, /more than one action: show, toast|more than one action: toast, show/);
  assert.match(byPath["interactions.ix_aaaaaaaa.do[3]"].message, /needs one action/);
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[4].then[0].navigate"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[5].toast"].level, "incomplete");
  assert.equal(byPath["interactions.ix_aaaaaaaa.do[6]"].level, "error");
});

test("interaction-level checks", () => {
  const issues = validateInteractionMap({
    bad_id: { on: "click", do: [] },
    ix_bbbbbbbb: { on: "hover", do: [] },
    ix_cccccccc: { on: "click" },
  });
  const paths = issues.map((i) => i.path);
  assert.ok(paths.includes("interactions.bad_id"));
  assert.ok(paths.includes("interactions.ix_bbbbbbbb.on"));
  assert.ok(paths.includes("interactions.ix_cccccccc.do"));
  assert.deepEqual(validateInteractionMap(undefined), []);
  assert.equal(validateInteractionMap([])[0].path, "interactions");
});

test("key belongs to key events and once belongs to visible", () => {
  ok({
    ix_aaaaaaaa: { on: "keydown", key: "Enter", do: [] },
    ix_bbbbbbbb: { on: "visible", once: false, do: [] },
    ix_cccccccc: { on: "mousedown", do: [] },
    ix_dddddddd: { on: "error", do: [] },
  });
  const paths = validateInteractionMap({
    ix_aaaaaaaa: { on: "click", key: "Enter", do: [] },
    ix_bbbbbbbb: { on: "click", once: true, do: [] },
    ix_cccccccc: { on: "keyup", key: "", do: [] },
  }).map((i) => `${i.path}|${i.level}`);
  assert.ok(paths.includes("interactions.ix_aaaaaaaa.key|error"));
  assert.ok(paths.includes("interactions.ix_bbbbbbbb.once|error"));
  assert.ok(paths.includes("interactions.ix_cccccccc.key|incomplete"));
});

test("deep nesting is bounded", () => {
  let steps: any[] = [{ toast: "x" }];
  for (let i = 0; i < 40; i++) steps = [{ if: "{{ true }}", then: steps }];
  const issues = validateInteractionMap({ ix_aaaaaaaa: { on: "click", do: steps } });
  assert.ok(issues.some((i) => /nested too deeply/.test(i.message)));
});
