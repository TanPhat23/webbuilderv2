import assert from "node:assert/strict";
import { test } from "node:test";
import { registerAgentHost, runAgentRequest } from "../src/features/agent/runtime";

test("before an editor registers, requests get editor_not_ready", async () => {
  registerAgentHost(null);
  const out = await runAgentRequest({ requestId: "a", tool: "get_code", args: {} });
  assert.ok(!out.ok && out.error.code === "editor_not_ready");
});
