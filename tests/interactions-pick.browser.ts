import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { chromium } from '@playwright/test';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

test('picking a canvas target suppresses canvas actions, Escape cancels, and the label reflects interactions', async () => {
  const server = await createServer({ configFile:false, optimizeDeps:{entries:['tests/fixtures/interactions-pick.html']}, define:{ 'process.env': '{}' }, plugins:[{name:'fixture-overlay', enforce:'pre', resolveId(source) { if (source === '@/features/auth/lib/gettoken') return resolve('tests/fixtures/interactions-pick-auth-stub.ts'); if (source === '@/features/editor/utils/element/create/ElementFactory') return resolve('tests/fixtures/interactions-pick-factory-stub.ts'); if (source === './CanvasOverlay') return resolve('tests/fixtures/interactions-pick-overlay-stub.tsx'); if (source === '@/features/editor/components/EditorContextMenu') return resolve('tests/fixtures/interactions-pick-context-stub.tsx'); if (source === '@/features/editor') return resolve('tests/fixtures/interactions-pick-editor-stub.ts'); if (source === '@/features/collaboration' || source === '../../src/features/collaboration') return resolve('src/features/collaboration/interfaces/collaboration.interface.ts'); }},tailwindcss()], esbuild:{jsx:'automatic'}, resolve:{alias:[{find:/^@\/features\/auth\/lib\/gettoken$/,replacement:resolve('tests/fixtures/interactions-pick-auth-stub.ts')},{find:/^@\/features\/editor\/components\/EditorContextMenu$/,replacement:resolve('tests/fixtures/interactions-pick-context-stub.tsx')},{find:/^@\/features\/editor\/utils\/element\/create\/ElementFactory$/,replacement:resolve('tests/fixtures/interactions-pick-factory-stub.ts')},{find:/^@\/features\/editor$/,replacement:resolve('tests/fixtures/interactions-pick-editor-stub.ts')},{find:/^@\/features\/collaboration$/,replacement:resolve('src/features/collaboration/interfaces/collaboration.interface.ts')},{find:'@',replacement:resolve('src')}]}, server:{port:0} });
  await server.listen();
  const browser = await chromium.launch({headless:true});
  try {
    const page = await browser.newPage();
    page.on('pageerror', error => console.error('PAGE ERROR', error));
    page.on('console', msg => { if (msg.type() === 'error') console.error('CONSOLE ERROR', msg.text()); });
    page.setDefaultTimeout(5000);
    await page.goto(`${server.resolvedUrls!.local[0]}tests/fixtures/interactions-pick.html`);
    await page.getByRole('button',{name:'Pick on canvas'}).click();
    assert.equal(await page.locator('[data-element-id="target"]').evaluate(el => getComputedStyle(el).cursor), 'crosshair');
    await page.getByText('Target element').click();
    assert.equal(await page.getByTestId('picked').textContent(), 'target');
    assert.equal(await page.getByTestId('selected').textContent(), 'source');
    assert.deepEqual(await page.evaluate(() => [(window as any).downs,(window as any).clicks]), [0,0]);
    await page.getByRole('button',{name:'Pick on canvas'}).click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('button',{name:'Pick on canvas'}).count(), 1);
    assert.equal(await page.getByTestId('selected').textContent(), 'source');
    assert.equal(await page.getByLabel('Has interactions').count(),1);
    await page.getByRole('button',{name:'Toggle marker'}).click();
    assert.equal(await page.getByLabel('Has interactions').count(),0);
  } finally { await browser.close(); await server.close(); }
});
