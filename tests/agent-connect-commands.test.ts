import assert from "node:assert/strict";
import { test } from "node:test";
import { claudeCodeCommand, codexCommand } from "../src/features/agent/connectCommands";

test("the Claude Code command registers an HTTP server with a bearer header", () => {
  assert.equal(
    claudeCodeCommand("https://api.example.com/mcp", "wbk_abc"),
    `claude mcp add --transport http webbuilder https://api.example.com/mcp --header "Authorization: Bearer wbk_abc"`,
  );
});

test("the Codex command exports the token and registers the server on one line", () => {
  assert.equal(
    codexCommand("https://api.example.com/mcp", "wbk_abc"),
    "export WEBBUILDER_TOKEN=wbk_abc && codex mcp add webbuilder --url https://api.example.com/mcp --bearer-token-env-var WEBBUILDER_TOKEN",
  );
});

test("a url or token with shell metacharacters is rejected, not quoted into a command", () => {
  assert.throws(() => claudeCodeCommand("https://x/mcp; rm -rf ~", "wbk_abc"));
  assert.throws(() => claudeCodeCommand("https://x/mcp", 'wbk_abc" && echo pwned'));
  assert.throws(() => codexCommand("https://x/mcp$(id)", "wbk_abc"));
  assert.throws(() => codexCommand("https://x/mcp", "wbk_abc; id"));
  // Characters that are harmless inside a URL but not in an unquoted shell word.
  for (const bad of ["https://x/mcp?a=1&rm", "https://x/mcp&&id", "https://x/mcp|id", "https://x/mcp#(id)", "https://x/mcp*", "https://x/mcp!"]) {
    assert.throws(() => claudeCodeCommand(bad, "wbk_abc"), Error, bad);
    assert.throws(() => codexCommand(bad, "wbk_abc"), Error, bad);
  }
  assert.ok(claudeCodeCommand("http://localhost:8090/mcp", "wbk_abc").includes("http://localhost:8090/mcp"));
});
