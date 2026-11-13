import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';

test('configured preview input is submitted and all animation presets run for the requested duration', async () => {
  const server = await createServer({ configFile: false, esbuild: { jsx: 'automatic' }, resolve: { alias: { '@': resolve('src') } }, server: { port: 0 } });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(`${server.resolvedUrls!.local[0]}tests/fixtures/interactions-final.html`);
    await page.locator('#email').fill('ada@example.com');
    await page.locator('#submit').click();
    await page.waitForFunction(() => (window as any).requestBody !== undefined);
    assert.deepEqual(await page.evaluate(() => (window as any).requestBody), { email: 'ada@example.com', message: 'Hello', topic: 'billing' });
    for (const preset of ['fadeIn', 'slideIn', 'bounce', 'pulse', 'shake', 'spin']) {
      const animation = await page.evaluate((name) => (window as any).runAnimation(name), preset);
      assert.notEqual(animation.name, 'none', `${preset} has animation`);
      assert.equal(animation.duration, '2s', `${preset} honors duration`);
    }
  } finally { await browser.close(); await server.close(); }
});
