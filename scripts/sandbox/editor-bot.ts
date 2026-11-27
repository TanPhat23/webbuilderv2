// Headless, signed-in editor tab for the sandbox (see sandbox.sh). It signs the
// Clerk test user in, creates (or reuses) a project through the API, opens the
// editor on it and keeps the tab open so MCP tools have an editor to talk to.
// A tiny control server on 127.0.0.1 lets the sandbox take screenshots, reload,
// navigate and read console output. Every request needs the random key written
// to <sandbox>/bot.key. POST /exec runs a repo-local script against the signed-in
// page (see runExec); it only imports files inside the repo, never request text.
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { chromium, firefox, type ConsoleMessage, type Page } from '@playwright/test';
import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage } from 'node:http';
import { format } from 'node:util';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { clerkTestConfig, withClerkKeyFallback } from '../../e2e/clerk-test-config';
import {
  ExecInputError, describeError, isInside, resolveExecFile, resolveExecTimeout, toJsonSafe,
  type ExecContext, type ExecFn, type ExecResponse,
} from './exec-helpers';

config({ path: '.env.test', quiet: true });
withClerkKeyFallback(process.env, config({ path: '.env', processEnv: {}, quiet: true }).parsed ?? {});

const need = (k: string) => process.env[k] || (() => { throw new Error(`${k} is required`); })();
const dir = need('SANDBOX_DIR'), web = need('SANDBOX_WEB'), api = need('SANDBOX_API');
const mcp = need('SANDBOX_MCP'), port = Number(need('SANDBOX_BOT_PORT'));
const { email } = clerkTestConfig(process.env);
mkdirSync(path.join(dir, 'shots'), { recursive: true });

const key = randomBytes(24).toString('hex');
writeFileSync(path.join(dir, 'bot.key'), key, { mode: 0o600 });

await clerkSetup();
// Installed Google Chrome by default (no download); SANDBOX_BROWSER=firefox uses Playwright's Firefox.
const browser = process.env.SANDBOX_BROWSER === 'firefox'
  ? await firefox.launch({ headless: true })
  : await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({ baseURL: web, viewport: { width: 1440, height: 900 } });
let page = await context.newPage();
const consoleLog: string[] = [];
const keep = (line: string) => { consoleLog.push(line.slice(0, 500)); if (consoleLog.length > 300) consoleLog.shift(); };
const watchPage = (p: Page) => {
  p.on('console', (m: ConsoleMessage) => keep(`[${m.type()}] ${m.text()}`));
  p.on('pageerror', (e) => keep(`[pageerror] ${e.message}`));
};
watchPage(page);
const VIEWPORT = { width: 1440, height: 900 };
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
// A script that leaves a promise rejecting or throws from a timer must not take the bot down.
let execLogs: string[] | null = null;
const survive = (kind: string) => (e: unknown) => {
  const line = `[bot] ${kind}: ${describeError(e).message}`;
  keep(line); execLogs?.push(line);
};
process.on('unhandledRejection', survive('unhandledRejection'));
process.on('uncaughtException', survive('uncaughtException'));

await page.goto('/');
await clerk.signIn({ page, emailAddress: email });
await page.goto('/dashboard');
await page.getByRole('heading', { name: /my projects/i }).waitFor({ timeout: 30_000 });

const envFile = path.join(dir, 'env.json');
const stored = existsSync(path.join(dir, 'project.json')) ? JSON.parse(readFileSync(path.join(dir, 'project.json'), 'utf8')) : null;
let projectId: string = stored?.id;
if (!projectId) {
  await page.waitForFunction(() => (window as any).Clerk?.session, undefined, { timeout: 20_000 });
  const token = await page.evaluate(() => (window as any).Clerk.session.getToken());
  const res = await fetch(`${api}/api/v1/projects`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Sandbox project', description: null }),
  });
  if (!res.ok) throw new Error(`create project failed: ${res.status} ${await res.text()}`);
  const body: any = await res.json();
  projectId = body.id ?? body.data?.id ?? body.project?.id;
  if (!projectId) throw new Error(`no project id in response: ${JSON.stringify(body).slice(0, 300)}`);
  writeFileSync(path.join(dir, 'project.json'), JSON.stringify({ id: projectId }));
}

async function openEditor(target = `/editor/${projectId}`) {
  await page.goto(target);
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    for (const f of page.frames()) if (await f.locator('[data-canvas-root]').count().catch(() => 0)) return true;
    await page.waitForTimeout(500);
  }
  keep('[bot] editor canvas did not appear within 60s');
  return false;
}
const ready = await openEditor();

writeFileSync(envFile, JSON.stringify({
  web, api, mcp, projectId, editorUrl: `${web}/editor/${projectId}`, editorCanvasReady: ready,
  mcpToken: readFileSync(path.join(dir, 'token'), 'utf8').trim(), shots: path.join(dir, 'shots'),
}, null, 2));

// ---- POST /exec -----------------------------------------------------------
// Runs one repo-local script at a time against the signed-in page. A second
// request while one runs is rejected with 409 rather than queued, so an agent
// never waits on someone else's script without knowing it.
let execBusy: { file: string; startedAt: number } | null = null;
let execSeq = 0;

class ExecTimeoutError extends Error {
  override readonly name = 'ExecTimeoutError';
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > 64 * 1024) throw new ExecInputError('request body too large');
    chunks.push(chunk as Buffer);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new ExecInputError('body must be JSON'); }
}

/** Put the shared tab back in a usable state after a script, however it ended. */
async function restoreAfterExec() {
  try {
    for (const p of context.pages()) if (p !== page && !p.isClosed()) await p.close().catch(() => {});
    await context.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {});
    if (page.isClosed()) {
      page = await context.newPage();
      watchPage(page);
      await openEditor();
      return;
    }
    await page.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => {});
    const size = page.viewportSize();
    if (!size || size.width !== VIEWPORT.width || size.height !== VIEWPORT.height) await page.setViewportSize(VIEWPORT);
  } catch (e) { keep(`[bot] restore after exec failed: ${describeError(e).message}`); }
}

async function runExec(rawBody: unknown): Promise<{ status: number; body: ExecResponse }> {
  const fail = (status: number, message: string, name = 'ExecInputError'): { status: number; body: ExecResponse } =>
    ({ status, body: { ok: false, result: null, logs: [], error: { name, message }, consoleErrors: [], durationMs: 0 } });
  let file: string;
  let timeoutMs: number;
  try {
    if (typeof rawBody !== 'object' || rawBody === null) throw new ExecInputError('body must be a JSON object');
    const input = rawBody as { file?: unknown; timeoutMs?: unknown };
    file = resolveExecFile(repoRoot, input.file);
    timeoutMs = resolveExecTimeout(input.timeoutMs);
    // Symlinks: the real path must still be inside the repo and keep an allowed extension.
    const real = realpathSync(file);
    if (!isInside(realpathSync(repoRoot), real)) throw new ExecInputError('file must resolve inside the repo root');
    resolveExecFile(repoRoot, real);
  } catch (e) {
    const code = (e as NodeJS.ErrnoException).code;
    return fail(400, code === 'ENOENT' ? 'file not found' : describeError(e).message);
  }
  if (execBusy) {
    const s = Math.round((Date.now() - execBusy.startedAt) / 1000);
    return fail(409, `busy: another exec (${path.relative(repoRoot, execBusy.file)}) has been running for ${s}s; retry when it finishes`, 'ExecBusy');
  }
  execBusy = { file, startedAt: Date.now() };
  const started = performance.now();
  const logs: string[] = [];
  const consoleErrors: string[] = [];
  const onConsole = (m: ConsoleMessage) => { if (m.type() === 'error' && consoleErrors.length < 100) consoleErrors.push(m.text().slice(0, 500)); };
  const onWebError = (w: { error(): Error }) => { if (consoleErrors.length < 100) consoleErrors.push(`[pageerror] ${w.error().message.slice(0, 500)}`); };
  context.on('console', onConsole);
  context.on('weberror', onWebError);
  execLogs = logs;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const log = (...args: unknown[]) => { if (logs.length < 500) logs.push(format(...args).slice(0, 2000)); };
    const run = (async () => {
      const mod: { default?: unknown } = await import(`${pathToFileURL(file).href}?v=${++execSeq}-${Date.now()}`);
      if (typeof mod.default !== 'function') throw new ExecInputError('the script must have a default export function');
      const ctx: ExecContext = { page, context, projectId, baseURL: web, log };
      return await (mod.default as ExecFn)(ctx);
    })();
    run.catch(() => {}); // after a timeout the script may still settle; never an unhandled rejection
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new ExecTimeoutError(`exec timed out after ${timeoutMs}ms; the script may still be running in the background`)), timeoutMs);
    });
    const result = toJsonSafe(await Promise.race([run, timeout]));
    return { status: 200, body: { ok: true, result, logs, consoleErrors, durationMs: Math.round(performance.now() - started) } };
  } catch (e) {
    return { status: 200, body: { ok: false, result: null, logs, error: describeError(e), consoleErrors, durationMs: Math.round(performance.now() - started) } };
  } finally {
    clearTimeout(timer);
    context.off('console', onConsole);
    context.off('weberror', onWebError);
    execLogs = null;
    await restoreAfterExec();
    execBusy = null;
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const send = (code: number, body: unknown) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
  if (req.headers['x-sandbox-key'] !== key) return send(401, { error: 'unauthorized' });
  try {
    if (url.pathname === '/exec') {
      if (req.method !== 'POST') return send(405, { error: 'POST a JSON body {file, timeoutMs?}' });
      let body: unknown;
      try { body = await readJson(req); } catch (e) { return send(400, { ok: false, error: describeError(e) }); }
      const out = await runExec(body);
      return send(out.status, out.body);
    }
    if (url.pathname === '/shot') {
      const name = (url.searchParams.get('name') ?? 'editor').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60) || 'editor';
      const file = path.join(dir, 'shots', `${name}.png`);
      await page.screenshot({ path: file });
      return send(200, { file, url: page.url() });
    }
    if (url.pathname === '/reload') { await page.reload(); return send(200, { url: page.url() }); }
    if (url.pathname === '/goto') {
      const target = url.searchParams.get('path') ?? '';
      if (!target.startsWith('/')) return send(400, { error: 'path must start with /' });
      return send(200, { canvas: await openEditor(target), url: page.url() });
    }
    if (url.pathname === '/canvas') {
      // Rendered text of the editor canvas, so tests can assert on what a user sees.
      for (const f of page.frames()) {
        if (!(await f.locator('[data-canvas-root]').count().catch(() => 0))) continue;
        const text = await f.locator('[data-canvas-root]').first().innerText();
        return send(200, { url: page.url(), missing: (text.match(/Missing component/g) ?? []).length, text });
      }
      return send(200, { url: page.url(), missing: 0, text: '', canvas: false });
    }
    if (url.pathname === '/peek') {
      // Open a path in a throwaway tab (e.g. /preview/<id>), return what a visitor sees, close it.
      // ?anon=1 uses a fresh, signed-out context (the public view).
      const target = url.searchParams.get('path') ?? '';
      if (!target.startsWith('/')) return send(400, { error: 'path must start with /' });
      const ctx = url.searchParams.get('anon') === '1' ? await browser.newContext({ baseURL: web, viewport: { width: 1440, height: 900 } }) : context;
      const tab = await ctx.newPage();
      try {
        const response = await tab.goto(target, { waitUntil: 'networkidle', timeout: 45_000 }).catch(() => null);
        await tab.waitForTimeout(1500);
        const text = await tab.locator('body').innerText();
        const name = (url.searchParams.get('name') ?? 'peek').replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 60) || 'peek';
        const file = path.join(dir, 'shots', `${name}.png`);
        await tab.screenshot({ path: file, fullPage: true });
        return send(200, { status: response?.status() ?? null, url: tab.url(), missing: (text.match(/Missing component/g) ?? []).length, file, text });
      } finally { await tab.close(); if (ctx !== context) await ctx.close(); }
    }
    if (url.pathname === '/api') {
      // GET an API path as the signed-in sandbox user; reports status, time and size (not the body).
      const target = url.searchParams.get('path') ?? '';
      if (!target.startsWith('/api/')) return send(400, { error: 'path must start with /api/' });
      const token = await page.evaluate(() => (window as any).Clerk.session.getToken());
      const started = performance.now();
      const res = await fetch(`${api}${target}`, { headers: { authorization: `Bearer ${token}` } });
      const bytes = (await res.arrayBuffer()).byteLength;
      return send(200, { status: res.status, ms: Math.round(performance.now() - started), bytes });
    }
    if (url.pathname === '/console') {
      const messages = consoleLog.slice(-100);
      if (url.searchParams.get('clear') === '1') consoleLog.length = 0;
      return send(200, { url: page.url(), messages });
    }
    return send(404, { error: 'not found' });
  } catch (e) { return send(500, { error: (e as Error).message }); }
}).listen(port, '127.0.0.1', () => console.log(`editor bot ready: ${page.url()} control :${port} (mcp ${mcp})`));

const stop = async () => { await browser.close().catch(() => {}); process.exit(0); };
process.on('SIGTERM', stop); process.on('SIGINT', stop);
