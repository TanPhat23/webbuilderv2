// tests/interactions-variables.test.ts
import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createVariableStore, safeStorage } from "../src/features/interactions/runtime/variables";

const memStorage = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
};

const defs = {
  step: { type: "number" as const, default: 0, lifetime: "page" as const },
  user: { type: "object" as const, default: null, lifetime: "session" as const },
  theme: { type: "string" as const, default: "light", lifetime: "local" as const },
};

test("defaults, set and snapshot; undeclared names are refused", () => {
  const s = createVariableStore(defs, { namespace: "p1" });
  assert.deepEqual(s.snapshot(), { step: 0, user: null, theme: "light" });
  assert.equal(s.set("step", 2), true);
  assert.equal(s.get("step"), 2);
  assert.equal(s.set("ghost", 1), false);
  assert.equal(s.has("ghost"), false);
});

test("session and local lifetimes persist under a namespaced key; page does not", () => {
  const session = memStorage();
  const local = memStorage();
  const a = createVariableStore(defs, { namespace: "proj1", session, local });
  a.set("user", { id: 1 });
  a.set("theme", "dark");
  a.set("step", 5);
  assert.equal(session.m.get("wb:proj1:user"), '{"id":1}');
  assert.equal(local.m.get("wb:proj1:theme"), '"dark"');
  assert.equal([...session.m.keys(), ...local.m.keys()].some((k) => k.endsWith(":step")), false);

  const b = createVariableStore(defs, { namespace: "proj1", session, local });
  assert.deepEqual(b.get("user"), { id: 1 });
  assert.equal(b.get("theme"), "dark");
  assert.equal(b.get("step"), 0, "page lifetime resets");
});

test("defaults are copied, not shared", () => {
  const d = { list: { type: "list" as const, default: [1] } };
  const a = createVariableStore(d, { namespace: "x" });
  (a.get("list") as number[]).push(2);
  const b = createVariableStore(d, { namespace: "x" });
  assert.deepEqual(b.get("list"), [1]);
});

test("blocked or broken storage falls back to memory", () => {
  const throwing = { getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("QuotaExceeded"); } };
  const s = createVariableStore(defs, { namespace: "p", session: throwing, local: throwing });
  assert.equal(s.get("theme"), "light");
  assert.equal(s.set("theme", "dark"), true);
  assert.equal(s.get("theme"), "dark");

  assert.equal(safeStorage(() => { throw new Error("denied"); }), null);
  assert.equal(safeStorage(() => throwing), null);
  const corrupt = memStorage();
  corrupt.m.set("wb:p:theme", "{not json");
  assert.equal(createVariableStore(defs, { namespace: "p", local: corrupt }).get("theme"), "light");
});

test("subscribers hear about changes", () => {
  const s = createVariableStore(defs, { namespace: "p" });
  let calls = 0;
  const off = s.subscribe(() => calls++);
  s.set("step", 1);
  off();
  s.set("step", 2);
  assert.equal(calls, 1);
});
