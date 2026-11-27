// Client for `sandbox.sh exec`: sends a script to the editor bot's POST /exec and
// prints the JSON response; exits 1 when the run failed.
//   exec-cli.ts [--timeout MS] <file>
//   exec-cli.ts [--timeout MS] -e '<js body>'     (page, context, projectId, baseURL, log in scope)
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { wrapExecBody, type ExecResponse } from './exec-helpers';

const dir = process.env.SANDBOX_DIR;
const port = process.env.SANDBOX_BOT_PORT;
if (!dir || !port) throw new Error('SANDBOX_DIR and SANDBOX_BOT_PORT are required (run via sandbox.sh)');

const usage = "usage: sandbox.sh exec [--timeout MS] <file.ts|.mjs|.js>\n       sandbox.sh exec [--timeout MS] -e '<js body>'";
const args = process.argv.slice(2);
let timeoutMs: number | undefined;
let body: string | undefined;
let file: string | undefined;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--timeout') timeoutMs = Number(args[++i]);
  else if (a === '-e') body = args[++i];
  else if (file === undefined && !a.startsWith('-')) file = a;
  else { console.error(usage); process.exit(2); }
}
if ((body === undefined) === (file === undefined)) { console.error(usage); process.exit(2); }
if (timeoutMs !== undefined && !Number.isFinite(timeoutMs)) { console.error('--timeout needs a number of milliseconds'); process.exit(2); }

const execDir = path.join(dir, 'exec');
let temp: string | undefined;
let target: string;
if (body !== undefined) {
  mkdirSync(execDir, { recursive: true });
  temp = path.join(execDir, `e-${Date.now()}-${randomBytes(4).toString('hex')}.mjs`);
  writeFileSync(temp, wrapExecBody(body));
  target = temp;
} else {
  target = path.resolve(process.env.SANDBOX_CWD ?? process.cwd(), file as string);
}

let response: ExecResponse | { ok: false; error: { message: string } };
try {
  const res = await fetch(`http://127.0.0.1:${port}/exec`, {
    method: 'POST',
    headers: { 'x-sandbox-key': readFileSync(path.join(dir, 'bot.key'), 'utf8').trim(), 'content-type': 'application/json' },
    body: JSON.stringify({ file: target, ...(timeoutMs === undefined ? {} : { timeoutMs }) }),
    signal: AbortSignal.timeout((timeoutMs ?? 60_000) + 30_000),
  });
  response = (await res.json()) as ExecResponse;
} catch (e) {
  response = { ok: false, error: { message: `bot not reachable: ${(e as Error).message}` } };
} finally {
  if (temp) rmSync(temp, { force: true });
}
console.log(JSON.stringify(response, null, 2));
process.exit(response.ok ? 0 : 1);
