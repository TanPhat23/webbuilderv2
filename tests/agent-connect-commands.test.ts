import assert from "node:assert/strict";
import { test } from "node:test";
import {
  antigravityConfig,
  claudeCodeCommand,
  codexCommand,
  connectionStatus,
  openCodeConfig,
} from "../apps/editor/src/features/agent/connectCommands";

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

test("the Antigravity config generates a valid mcpServers Streamable HTTP entry", () => {
  const parsed: unknown = JSON.parse(
    antigravityConfig("https://api.example.com/mcp", "wbk_abc"),
  );
  assert.deepEqual(parsed, {
    mcpServers: {
      webbuilder: {
        url: "https://api.example.com/mcp",
        headers: {
          Authorization: "Bearer wbk_abc",
        },
      },
    },
  });
});

test("the OpenCode config generates a valid remote mcp entry with bearer auth", () => {
  const parsed: unknown = JSON.parse(
    openCodeConfig("https://api.example.com/mcp", "wbk_abc"),
  );
  assert.deepEqual(parsed, {
    $schema: "https://opencode.ai/config.json",
    mcp: {
      webbuilder: {
        type: "remote",
        url: "https://api.example.com/mcp",
        enabled: true,
        headers: {
          Authorization: "Bearer wbk_abc",
        },
      },
    },
  });
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
    assert.throws(() => antigravityConfig(bad, "wbk_abc"), Error, bad);
    assert.throws(() => openCodeConfig(bad, "wbk_abc"), Error, bad);
  }
  assert.ok(claudeCodeCommand("http://localhost:8090/mcp", "wbk_abc").includes("http://localhost:8090/mcp"));
});

test("connectionStatus reports Editing, recent Connected window, and Not connected state", () => {
  const now = 1_000_000;
  assert.deepEqual(connectionStatus(true, null, now), {
    label: "Editing…",
    dot: "bg-primary animate-pulse",
  });
  assert.deepEqual(connectionStatus(false, null, now), {
    label: "Not connected",
    dot: "bg-muted-foreground/40",
  });
  assert.deepEqual(connectionStatus(false, now - 60_000, now), {
    label: "Connected",
    dot: "bg-emerald-500",
  });
  assert.deepEqual(connectionStatus(false, now - 5 * 60_000, now), {
    label: "Not connected",
    dot: "bg-muted-foreground/40",
  });
});
