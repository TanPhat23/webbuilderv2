// Tiny MCP client (streamable HTTP) used by mcp-call.mjs and the smoke tests.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const sandboxEnv = (dir = process.env.SANDBOX_DIR ?? '.sandbox') =>
  JSON.parse(readFileSync(path.join(dir, 'env.json'), 'utf8'));

export async function connect(env = sandboxEnv()) {
  let session;
  let id = 0;
  async function rpc(method, params, notify = false) {
    const res = await fetch(env.mcp, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.mcpToken}`, 'content-type': 'application/json',
        accept: 'application/json, text/event-stream', ...(session ? { 'mcp-session-id': session } : {}),
      },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, ...(notify ? {} : { id: ++id }) }),
    });
    session ||= res.headers.get('mcp-session-id') ?? undefined;
    if (notify) return;
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 500)}`);
    const body = (res.headers.get('content-type') ?? '').includes('text/event-stream')
      ? text.split('\n').filter((l) => l.startsWith('data:')).map((l) => l.slice(5).trim()).pop()
      : text;
    const msg = JSON.parse(body);
    if (msg.error) throw new Error(JSON.stringify(msg.error));
    return msg.result;
  }
  await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'sandbox', version: '1' } });
  await rpc('notifications/initialized', {}, true);
  return {
    env,
    list: async () => (await rpc('tools/list', {})).tools,
    /** Raw result: { content, isError }. */
    raw: (name, args = {}) => rpc('tools/call', { name, arguments: args }),
    /** Parsed JSON of the first text block; throws with the tool's message on isError. */
    async call(name, args = {}) {
      const result = await rpc('tools/call', { name, arguments: args });
      const text = (result.content ?? []).map((c) => c.text ?? '').join('\n');
      if (result.isError) throw new Error(`${name}: ${text}`);
      try { return JSON.parse(text); } catch { return text; }
    },
  };
}
