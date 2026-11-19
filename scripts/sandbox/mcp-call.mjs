// `mcp-call.mjs TOOL '{"args":1}'` or `--list`. projectId defaults to the sandbox project.
import { connect } from './mcp-client.mjs';

const client = await connect();
const [first, raw] = process.argv.slice(2);
if (first === '--list') {
  for (const t of await client.list()) console.log(`${t.name}\t${(t.description ?? '').split('\n')[0].slice(0, 110)}`);
} else {
  const args = raw ? JSON.parse(raw) : {};
  const tool = (await client.list()).find((t) => t.name === first);
  if (tool?.inputSchema?.properties?.projectId && args.projectId === undefined) args.projectId = client.env.projectId;
  const result = await client.raw(first, args);
  for (const c of result.content ?? []) console.log(c.text ?? JSON.stringify(c));
  if (result.isError) process.exitCode = 1;
}
