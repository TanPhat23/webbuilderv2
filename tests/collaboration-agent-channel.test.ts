import assert from "node:assert/strict";
import { test } from "node:test";
import { AgentChannel } from "../apps/editor/src/features/collaboration/lib/realtime/AgentChannel";
import type { AgentOutcome, AgentRequest } from "../apps/editor/src/features/agent/protocol";

const env = (type: string, extra: Record<string, unknown> = {}) => ({ type, projectId: "p", pageId: "home", payload: {}, ...extra }) as never;
const tick = () => new Promise((r) => setTimeout(r, 0));

test("ignores messages that are not agent requests", () => {
  const ch = new AgentChannel({ onRequest: async () => ({ ok: true, result: {} }), send: () => {} });
  assert.equal(ch.dispatchMessage(env("element:update")), false);
  assert.equal(ch.dispatchMessage(env("error", { requestId: "x" })), false);
});

test("runs the request and sends the outcome back under the same request id", async () => {
  const seen: AgentRequest[] = [];
  const sent: [string, AgentOutcome][] = [];
  const ch = new AgentChannel({
    onRequest: async (r) => { seen.push(r); return { ok: true, result: { n: 1 } }; },
    send: (id, o) => sent.push([id, o]),
  });
  assert.equal(ch.dispatchMessage(env("agent:request", { requestId: "r1", payload: { tool: "get_code", args: { a: 1 }, pageId: "home" } })), true);
  await tick();
  assert.deepEqual(seen, [{ requestId: "r1", tool: "get_code", args: { a: 1 }, pageId: "home" }]);
  assert.deepEqual(sent, [["r1", { ok: true, result: { n: 1 } }]]);
});

test("a handler that throws still answers, with an internal error", async () => {
  const sent: [string, AgentOutcome][] = [];
  const ch = new AgentChannel({ onRequest: async () => { throw new Error("nope"); }, send: (id, o) => sent.push([id, o]) });
  ch.dispatchMessage(env("agent:request", { requestId: "r2", payload: { tool: "apply_edits", args: {} } }));
  await tick();
  assert.equal(sent[0][0], "r2");
  assert.ok(!sent[0][1].ok && sent[0][1].error.code === "internal");
});

test("a request without an id is swallowed, not run", async () => {
  let ran = false;
  const ch = new AgentChannel({ onRequest: async () => { ran = true; return { ok: true, result: {} }; }, send: () => {} });
  assert.equal(ch.dispatchMessage(env("agent:request", { payload: { tool: "get_code" } })), true);
  await tick();
  assert.equal(ran, false);
});
