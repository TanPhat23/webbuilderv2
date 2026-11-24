/** Command strings the user pastes into a terminal. Inputs are checked, never escaped. */
// Host and path only. No query string, so none of & ? ( ) * ! # can reach the
// unquoted URL in the pasted command.
const SAFE_URL = /^https?:\/\/[A-Za-z0-9._~:/%+@-]+$/;
const SAFE_TOKEN = /^wbk_[A-Za-z0-9_-]+$/;

function checkUrl(url: string): string {
  if (!SAFE_URL.test(url)) throw new Error("Unsafe MCP URL");
  return url;
}
function checkToken(token: string): string {
  if (!SAFE_TOKEN.test(token)) throw new Error("Unexpected token format");
  return token;
}

export function claudeCodeCommand(mcpUrl: string, token: string): string {
  return `claude mcp add --transport http webbuilder ${checkUrl(mcpUrl)} --header "Authorization: Bearer ${checkToken(token)}"`;
}

export function codexCommand(mcpUrl: string, token: string): string {
  return `export WEBBUILDER_TOKEN=${checkToken(token)} && codex mcp add webbuilder --url ${checkUrl(mcpUrl)} --bearer-token-env-var WEBBUILDER_TOKEN`;
}

export function antigravityConfig(mcpUrl: string, token: string): string {
  return JSON.stringify(
    {
      mcpServers: {
        webbuilder: {
          url: checkUrl(mcpUrl),
          headers: {
            Authorization: `Bearer ${checkToken(token)}`,
          },
        },
      },
    },
    null,
    2,
  );
}

export function openCodeConfig(mcpUrl: string, token: string): string {
  return JSON.stringify(
    {
      $schema: "https://opencode.ai/config.json",
      mcp: {
        webbuilder: {
          type: "remote",
          url: checkUrl(mcpUrl),
          enabled: true,
          headers: {
            Authorization: `Bearer ${checkToken(token)}`,
          },
        },
      },
    },
    null,
    2,
  );
}

export function connectionStatus(
  editing: boolean,
  lastAt: number | null,
  now = Date.now(),
): { label: string; dot: string } {
  if (editing) return { label: "Editing…", dot: "bg-primary animate-pulse" };
  const recent = lastAt !== null && now - lastAt < 5 * 60_000;
  return recent
    ? { label: "Connected", dot: "bg-emerald-500" }
    : { label: "Not connected", dot: "bg-muted-foreground/40" };
}
