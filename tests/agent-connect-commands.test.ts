import assert from "node:assert/strict";
import { test } from "node:test";
import { claudeCodeCommand, codexCommands } from "../src/features/agent/connectCommands";

test("the Claude Code command registers an HTTP server with a bearer header", () => {
  assert.equal(
    claudeCodeCommand("https://api.example.com/mcp", "wbk_abc"),
    `claude mcp add --transport http webbuilder https://api.example.com/mcp --header "Authorization: Bearer wbk_abc"`,
  );
});

test("the Codex commands keep the secret in an environment variable, not in the command", () => {
  const c = codexCommands("https://api.example.com/mcp");
  assert.equal(c.export("wbk_abc"), `export WEBBUILDER_TOKEN=wbk_abc`);
  assert.equal(c.add, `codex mcp add webbuilder --url https://api.example.com/mcp --bearer-token-env-var WEBBUILDER_TOKEN`);
  assert.ok(!c.add.includes("wbk_"));
});

test("a url or token with shell metacharacters is rejected, not quoted into a command", () => {
  assert.throws(() => claudeCodeCommand("https://x/mcp; rm -rf ~", "wbk_abc"));
  assert.throws(() => claudeCodeCommand("https://x/mcp", 'wbk_abc" && echo pwned'));
  assert.throws(() => codexCommands("https://x/mcp$(id)"));
  // Characters that are harmless inside a URL but not in an unquoted shell word.
  for (const bad of ["https://x/mcp?a=1&rm", "https://x/mcp&&id", "https://x/mcp|id", "https://x/mcp#(id)", "https://x/mcp*", "https://x/mcp!"]) {
    assert.throws(() => claudeCodeCommand(bad, "wbk_abc"), Error, bad);
    assert.throws(() => codexCommands(bad), Error, bad);
  }
  assert.ok(claudeCodeCommand("http://localhost:8090/mcp", "wbk_abc").includes("http://localhost:8090/mcp"));
});
