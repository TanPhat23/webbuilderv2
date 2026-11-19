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
