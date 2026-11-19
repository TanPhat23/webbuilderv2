// Headless, signed-in editor tab for the sandbox (see sandbox.sh). It signs the
// Clerk test user in, creates (or reuses) a project through the API, opens the
// editor on it and keeps the tab open so MCP tools have an editor to talk to.
// A tiny control server on 127.0.0.1 lets the sandbox take screenshots, reload,
// navigate and read console output. Every request needs the random key written
// to <sandbox>/bot.key; there is deliberately no way to evaluate script.
import { clerk, clerkSetup } from '@clerk/testing/playwright';
import { chromium, firefox, type ConsoleMessage } from '@playwright/test';
import { config } from 'dotenv';
import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { clerkTestConfig, withClerkKeyFallback } from '../../e2e/clerk-test-config';

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
const page = await context.newPage();
const consoleLog: string[] = [];
const keep = (line: string) => { consoleLog.push(line.slice(0, 500)); if (consoleLog.length > 300) consoleLog.shift(); };
page.on('console', (m: ConsoleMessage) => keep(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => keep(`[pageerror] ${e.message}`));

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

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://127.0.0.1');
  const send = (code: number, body: unknown) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
  if (req.headers['x-sandbox-key'] !== key) return send(401, { error: 'unauthorized' });
  try {
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
