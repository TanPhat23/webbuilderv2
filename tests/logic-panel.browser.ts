import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

test('logic deletion warns before removal and supports cancel and undo', async () => {
  const server = await createServer({ configFile: false, define: { 'process.env': '{}' }, optimizeDeps: { entries: ['tests/fixtures/logic-panel.html'] }, plugins: [tailwindcss()], esbuild: { jsx: 'automatic' }, resolve: { alias: [{ find: /^@\/features\/editor$/, replacement: resolve('tests/fixtures/logic-editor-shim.ts') }, { find: '@', replacement: resolve('src') }] }, server: { port: 0 } });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.stack || error.message));
    await page.goto(`${server.resolvedUrls!.local[0]}tests/fixtures/logic-panel.html`);
    await page.getByRole('button', { name: 'Delete variable count' }).waitFor({ timeout: 10000 }).catch(async (error) => { throw new Error(`${error.message}\nBrowser errors: ${errors.join('; ')}\nBody: ${await page.locator('body').innerText()}`); });
    await page.getByRole('button', { name: 'Delete variable count' }).click();
    const dialog = page.getByRole('alertdialog');
    assert.match(await dialog.innerText(), /Element: Signup/);
    assert.match(await dialog.innerText(), /Project flow: welcome/);
    assert.match(await dialog.innerText(), /other pages/);
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    assert.equal(await page.getByRole('button', { name: 'Delete variable count' }).count(), 1);
    await page.getByRole('button', { name: 'Delete variable count' }).click();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: 'Delete variable count' }).count(), 0);
    await page.getByRole('button', { name: 'Undo logic change' }).click();
    assert.equal(await page.getByRole('button', { name: 'Delete variable count' }).count(), 1);
    assert.deepEqual(errors, []);
  } finally { await browser.close(); await server.close(); }
});
