import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import {
  DEFAULT_EXEC_TIMEOUT_MS,
  ExecInputError,
  describeError,
  resolveExecFile,
  resolveExecTimeout,
  toJsonSafe,
  wrapExecBody,
} from "../scripts/sandbox/exec-helpers";

const root = path.resolve("/repo/webbuilder");

test("resolveExecFile accepts .ts/.mjs/.js inside the root, relative or absolute", () => {
  assert.equal(resolveExecFile(root, "scripts/sandbox/examples/a.ts"), path.join(root, "scripts/sandbox/examples/a.ts"));
  assert.equal(resolveExecFile(root, ".sandbox/exec/e.mjs"), path.join(root, ".sandbox/exec/e.mjs"));
  assert.equal(resolveExecFile(root, path.join(root, "x.js")), path.join(root, "x.js"));
  assert.equal(resolveExecFile(root, "a/../b.ts"), path.join(root, "b.ts"));
});

test("resolveExecFile rejects paths outside the root", () => {
  for (const bad of ["../x.ts", "a/../../x.ts", "/etc/evil.js", path.resolve(root, "..", "webbuilder-evil", "x.ts")]) {
    assert.throws(() => resolveExecFile(root, bad), ExecInputError, bad);
  }
});

test("resolveExecFile rejects other extensions, non-strings and NUL bytes", () => {
  for (const bad of ["x.sh", "x.json", "x", "x.ts.txt", "x.tsx", "", "  ", ".sandbox/", "x.ts\0.png"]) {
    assert.throws(() => resolveExecFile(root, bad), ExecInputError, JSON.stringify(bad));
  }
  for (const bad of [undefined, null, 1, {}, ["x.ts"]]) assert.throws(() => resolveExecFile(root, bad), ExecInputError);
});

test("resolveExecTimeout defaults to 60s and bounds overrides", () => {
  assert.equal(resolveExecTimeout(undefined), DEFAULT_EXEC_TIMEOUT_MS);
  assert.equal(DEFAULT_EXEC_TIMEOUT_MS, 60_000);
  assert.equal(resolveExecTimeout(5000.9), 5000);
  for (const bad of [0, 10, 601_000, Number.NaN, "5000"]) assert.throws(() => resolveExecTimeout(bad), ExecInputError);
});

test("wrapExecBody puts the context in scope of an async default export", async () => {
  const src = wrapExecBody("log('hi'); return [projectId, baseURL, await Promise.resolve(page)].join(',');");
  assert.match(src, /^export default async function \(\{ page, context, projectId, baseURL, log \}\)/);
  const mod: { default: (c: Record<string, unknown>) => Promise<unknown> } = await import(
    "data:text/javascript;base64," + Buffer.from(src).toString("base64")
  );
  const logs: unknown[][] = [];
  const out = await mod.default({ page: "P", context: "C", projectId: "id1", baseURL: "http://b", log: (...a: unknown[]) => logs.push(a) });
  assert.equal(out, "id1,http://b,P");
  assert.deepEqual(logs, [["hi"]]);
  assert.throws(() => wrapExecBody("  \n"), ExecInputError);
});

test("toJsonSafe passes plain JSON through and survives JSON.stringify for hostile values", () => {
  assert.deepEqual(toJsonSafe({ a: 1, b: [true, null, "x"], c: { d: 1.5 } }), { a: 1, b: [true, null, "x"], c: { d: 1.5 } });
  const cyc: { self?: unknown; n: number } = { n: 1 };
  cyc.self = cyc;
  assert.deepEqual(toJsonSafe(cyc), { n: 1, self: "[Circular]" });
  assert.equal(toJsonSafe(undefined), null);
  assert.equal(toJsonSafe(10n), "10");
  assert.equal(toJsonSafe(Number.NaN), "NaN");
  assert.equal(toJsonSafe(Symbol("s")), "Symbol(s)");
  assert.equal(toJsonSafe(function named() {}), "[Function named]");
  assert.equal(toJsonSafe(new Date(0)), "1970-01-01T00:00:00.000Z");
  assert.deepEqual(toJsonSafe(new Set([1, 2])), [1, 2]);
  assert.deepEqual(toJsonSafe(new Map([["k", 1]])), [["k", 1]]);
  assert.equal(toJsonSafe(new (class Page {})()), "[Page]");
  assert.deepEqual(toJsonSafe(Object.assign(Object.create(null), { z: 1 })), { z: 1 });
  const err = toJsonSafe(new TypeError("boom"));
  assert.ok(typeof err === "object" && err !== null && !Array.isArray(err) && err.name === "TypeError" && err.message === "boom");
  const hostile = { get bad(): number { throw new Error("nope"); }, ok: 1 };
  assert.deepEqual(toJsonSafe(hostile), { bad: "[Throws nope]", ok: 1 });
  assert.doesNotThrow(() => JSON.stringify(toJsonSafe([cyc, hostile, 1n, undefined])));
});

test("toJsonSafe caps depth, string length and entries", () => {
  const deep = { a: { b: { c: { d: 1 } } } };
  assert.deepEqual(toJsonSafe(deep, { maxDepth: 2, maxString: 10, maxEntries: 10 }), { a: { b: "[Object]" } });
  const long = toJsonSafe("x".repeat(30), { maxDepth: 2, maxString: 10, maxEntries: 10 });
  assert.equal(typeof long === "string" && long.startsWith("xxxxxxxxxx…[truncated 20"), true);
  assert.deepEqual(toJsonSafe([1, 2, 3, 4], { maxDepth: 2, maxString: 10, maxEntries: 2 }), [1, 2, "[2 more items]"]);
});

test("describeError handles Error and non-Error throws", () => {
  assert.equal(describeError(new RangeError("r")).name, "RangeError");
  assert.ok(describeError(new Error("e")).stack);
  assert.equal(describeError(new Error("\x1b[2mwaiting\x1b[22m")).message, "waiting");
  assert.deepEqual(describeError("str"), { name: "NonError", message: "str" });
  assert.equal(describeError({ a: 1 }).message, '{"a":1}');
});
