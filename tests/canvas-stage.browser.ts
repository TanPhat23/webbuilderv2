import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type ViteDevServer } from 'vite';
import { chromium, type Browser, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';

const fixture = (name: string): string => resolve('tests/fixtures', name);
const stubs: ReadonlyArray<readonly [RegExp, string]> = [
  [/^@tanstack\/react-start$/, resolve('tests/support/test-start-stub.ts')],
  [/^@clerk\/tanstack-react-start$/, resolve('tests/support/test-clerk-stub.ts')],
  [/^@clerk\/tanstack-react-start\/server$/, resolve('tests/support/test-clerk-server-stub.ts')],
  [/^@\/features\/auth\/lib\/gettoken$/, fixture('interactions-pick-auth-stub.ts')],
  [/^@\/features\/editor\/lib\/dropElement$/, fixture('interactions-pick-drop-stub.ts')],
  [/^@\/features\/editor\/components\/EditorContextMenu$/, fixture('interactions-pick-context-stub.tsx')],
  [/^@\/features\/editor\/utils\/element\/create\/ElementFactory$/, fixture('interactions-pick-factory-stub.ts')],
  [/^@\/features\/editor\/hooks\/useEditorPermissions$/, fixture('canvas-stage-permissions-stub.ts')],
  [/^@\/features\/projects\/api\/project\.api$/, fixture('canvas-stage-api-stub.ts')],
  [/^@\/features\/elements\/services\/element\.service$/, fixture('canvas-stage-api-stub.ts')],
  [/^@\/features\/collaboration$/, resolve('apps/editor/src/features/collaboration/interfaces/collaboration.interface.ts')],
];

let server: ViteDevServer;
let browser: Browser;
let baseUrl: string;
const errors: string[] = [];

before(async () => {
  server = await createServer({
    configFile: false,
    optimizeDeps: { entries: ['tests/fixtures/canvas-stage.html'] },
    define: { 'process.env': '{}' },
    plugins: [tailwindcss()],
    esbuild: { jsx: 'automatic' },
    resolve: { alias: [...stubs.map(([find, replacement]) => ({ find, replacement })), { find: '@', replacement: resolve('apps/editor/src') }] },
    server: { port: 0 },
  });
  await server.listen();
  baseUrl = server.resolvedUrls!.local[0]!;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  await server?.close();
});

interface OpenOptions { readonly width?: number; readonly height?: number }

async function openStage(options: OpenOptions = {}): Promise<Page> {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  page.on('pageerror', (error) => { errors.push(String(error)); console.error('PAGE ERROR', error); });
  page.on('console', (msg) => { if (msg.type() === 'error') console.error('CONSOLE ERROR', msg.text()); });
  page.setDefaultTimeout(8000);
  const query = new URLSearchParams({ w: String(options.width ?? 800), h: String(options.height ?? 700) });
  await page.goto(`${baseUrl}tests/fixtures/canvas-stage.html?${query}`);
  await page.locator('#preview-iframe').waitFor();
  await page.frameLocator('#preview-iframe').locator('[data-element-id="text-1"]').waitFor();
  return page;
}



interface CanvasHandles {
  readonly viewport: { getState(): { setPreset(p: string): void; frameWidthPx: number; preset: string; zoomMode: string } };
  readonly selection: { getState(): { selectedElementId?: string; editingElementId?: string } };
  readonly elementStore: { getState(): { elements: ReadonlyArray<{ id: string; elements?: unknown[]; content?: string }> } };
}

const setPreset = (page: Page, preset: 'mobile' | 'tablet' | 'desktop'): Promise<void> =>
  page.evaluate((p) => (window as unknown as { __canvas: CanvasHandles }).__canvas.viewport.getState().setPreset(p), preset);
const viewportState = (page: Page) =>
  page.evaluate(() => {
    const { frameWidthPx, preset, zoomMode } = (window as unknown as { __canvas: CanvasHandles }).__canvas.viewport.getState();
    return { frameWidthPx, preset, zoomMode };
  });
const selectedId = (page: Page): Promise<string | undefined> =>
  page.evaluate(() => (window as unknown as { __canvas: CanvasHandles }).__canvas.selection.getState().selectedElementId);
const editingId = (page: Page): Promise<string | undefined> =>
  page.evaluate(() => (window as unknown as { __canvas: CanvasHandles }).__canvas.selection.getState().editingElementId);
const textColor = (page: Page, id: string): Promise<string> =>
  text(page, id).evaluate((el) => getComputedStyle(el).color);
const text = (page: Page, id: string) => page.frameLocator('#preview-iframe').locator(`[data-element-id="${id}"]`);
const frameWidth = (page: Page): Promise<number> =>
  page.locator('#preview-iframe').evaluate((el) => (el as HTMLIFrameElement).contentWindow!.innerWidth);

const STAGE_GUTTER_PX = 64;
const fitZoom = (frame: number, stage: number): number => Math.min(1, (stage - STAGE_GUTTER_PX) / frame);

test('1. iframe hosts #wb-site-root with portaled elements and its own style elements, no host stylesheets', async () => {
  const page = await openStage();
  const report = await page.locator('#preview-iframe').evaluate((el) => {
    const doc = (el as HTMLIFrameElement).contentDocument!;
    const head = doc.head;
    return {
      root: !!doc.getElementById('wb-site-root'),
      portaled: ['section', 'frame', 'text-1', 'text-2'].map((id) => !!doc.getElementById('wb-site-root')!.querySelector(`[data-element-id="${id}"]`)),
      styleIds: Array.from(head.querySelectorAll('style')).map((s) => s.id),
      links: head.querySelectorAll('link').length,
      hostMarkedStyles: head.querySelectorAll('style[data-vite-dev-id]').length,
      elementCss: doc.getElementById('wb-element-styles')!.textContent ?? '',
      projectCss: doc.getElementById('wb-project-css')!.textContent ?? '',
    };
  });
  assert.equal(report.root, true);
  assert.deepEqual(report.portaled, [true, true, true, true]);
  for (const id of ['wb-tailwind-css', 'wb-element-styles', 'wb-project-css']) assert.ok(report.styleIds.includes(id), `#${id} present`);
  assert.equal(report.styleIds.length, 4, 'only the inline reset plus the three managed style elements');
  assert.equal(report.links, 0, 'no <link> stylesheets copied');
  assert.equal(report.hostMarkedStyles, 0, 'no host (vite-injected) styles copied');
  assert.match(report.elementCss, /@media \(min-width: 768px\)/);
  assert.match(report.projectCss, /frame-marker/);
  assert.equal(await page.evaluate(() => document.querySelector('[data-element-id="text-1"]') === null), true, 'site elements are not in the parent DOM');
  await page.close();
});

test('2. presets keep one iframe element and the md @media rule follows the iframe width', async () => {
  const page = await openStage();
  await page.locator('#preview-iframe').evaluate((el) => { (el as unknown as Record<string, unknown>).__mark = 'same-iframe'; });
  const sameIframe = (): Promise<unknown> => page.locator('#preview-iframe').evaluate((el) => (el as unknown as Record<string, unknown>).__mark);
  const observed: Record<string, { width: number; color: string; columns: number }> = {};
  for (const preset of ['desktop', 'mobile', 'tablet'] as const) {
    await setPreset(page, preset);
    await page.waitForFunction((expected) => document.querySelector<HTMLIFrameElement>('#preview-iframe')!.contentWindow!.innerWidth === expected, { mobile: 375, tablet: 768, desktop: 1440 }[preset]);
    assert.equal(await sameIframe(), 'same-iframe', `iframe survives the ${preset} preset`);
    assert.equal(await page.locator('iframe').count(), 1);
    const columns = await page.frameLocator('#preview-iframe').locator('[data-element-id="frame"]').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    observed[preset] = { width: await frameWidth(page), color: await textColor(page, 'text-1'), columns };
  }
  // Responsive styles are mobile-first (min-width), so md applies from 768px up.
  assert.equal(observed.mobile!.color, 'rgb(255, 0, 0)');
  assert.equal(observed.mobile!.columns, 1);
  assert.equal(observed.tablet!.color, 'rgb(0, 0, 255)');
  assert.equal(observed.tablet!.columns, 2);
  assert.equal(observed.desktop!.color, 'rgb(0, 0, 255)', 'min-width rules also apply above tablet');
  assert.equal(await sameIframe(), 'same-iframe');
  await page.close();
});

test('3. fit zoom scales the 1440 frame into a narrower stage', async (t) => {
  const page = await openStage({ width: 800 });
  const expectedZoom = fitZoom(1440, 800);
  assert.ok(expectedZoom < 1);
  const box = await page.locator('#preview-iframe').boundingBox();
  assert.ok(box);
  assert.ok(Math.abs(box.width - 1440 * expectedZoom) <= 1, `iframe width ${box.width} vs ${1440 * expectedZoom}`);
  t.diagnostic(`zoom ${expectedZoom.toFixed(4)} iframe width ${box.width.toFixed(2)}`);
  assert.equal(await frameWidth(page), 1440, 'inner viewport stays at the preset width');
  await page.close();
});

test('4. click selects, double click edits, Escape leaves editing, Backspace never deletes the element', async () => {
  const page = await openStage();
  const target = text(page, 'text-1');
  await target.click();
  assert.equal(await selectedId(page), 'text-1');
  assert.equal(await page.locator('[data-selection-outline]').count(), 1, 'selection box is drawn in the parent DOM');
  assert.equal(await page.locator('#preview-iframe').evaluate((el) => (el as HTMLIFrameElement).contentDocument!.querySelectorAll('[data-selection-outline]').length), 0, 'and not inside the iframe');
  assert.equal(await editingId(page), undefined);

  await target.dblclick();
  assert.equal(await editingId(page), 'text-1');
  await page.waitForFunction(() => document.querySelector<HTMLIFrameElement>('#preview-iframe')!.contentDocument!.querySelector('[data-element-id="text-1"]')!.getAttribute('contenteditable') === 'true');

  await page.keyboard.press('Escape');
  assert.equal(await editingId(page), undefined, 'Escape leaves editing');
  assert.equal(await selectedId(page), 'text-1', 'the element stays selected');
  assert.notEqual(await target.getAttribute('contenteditable'), 'true');

  await target.dblclick();
  assert.equal(await editingId(page), 'text-1');
  for (let i = 0; i < 3; i += 1) await page.keyboard.press('Backspace');
  assert.equal(await text(page, 'text-1').count(), 1, 'element is still rendered');
  const stillStored = await page.evaluate(() => {
    const ids: string[] = [];
    const queue = [...(window as unknown as { __canvas: CanvasHandles }).__canvas.elementStore.getState().elements] as Array<{ id: string; elements?: unknown[] }>;
    for (let node = queue.shift(); node; node = queue.shift()) {
      ids.push(node.id);
      queue.push(...((node.elements ?? []) as typeof queue));
    }
    return ids;
  });
  assert.ok(stillStored.includes('text-1'), 'element is still in the store');
  assert.equal(await editingId(page), 'text-1', 'still editing after Backspace');
  await page.close();
});

test('5. the parent-DOM selection box matches the projected element rect at the fit zoom', async (t) => {
  const page = await openStage({ width: 800 });
  await text(page, 'text-2').click();
  assert.equal(await selectedId(page), 'text-2');
  const outline = page.locator('[data-selection-outline]');
  await outline.waitFor();
  const projected = await page.locator('#preview-iframe').evaluate((el, id) => {
    const iframe = el as HTMLIFrameElement;
    const frameBox = iframe.getBoundingClientRect();
    const zoom = frameBox.width / iframe.contentWindow!.innerWidth;
    const r = iframe.contentDocument!.querySelector(`[data-element-id="${id}"]`)!.getBoundingClientRect();
    return { left: frameBox.left + r.left * zoom, top: frameBox.top + r.top * zoom, width: r.width * zoom, height: r.height * zoom };
  }, 'text-2');
  const box = await outline.boundingBox();
  assert.ok(box);
  t.diagnostic(`outline ${JSON.stringify(box)} projected ${JSON.stringify(projected)}`);
  for (const key of ['left', 'top', 'width', 'height'] as const) {
    const actual = key === 'left' ? box.x : key === 'top' ? box.y : box[key];
    assert.ok(Math.abs(actual - projected[key]) <= 2, `${key}: outline ${actual} vs projected ${projected[key]}`);
  }
  await page.close();
});

test('6. dragging a width scrub handle changes the frame width', async (t) => {
  const page = await openStage({ width: 800 });
  const before = (await viewportState(page)).frameWidthPx;
  const handle = page.locator('[data-width-handle="right"]');
  const box = await handle.boundingBox();
  assert.ok(box);
  const startX = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  const zoom = fitZoom(1440, 800);
  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX - 60, y, { steps: 6 });
  await page.mouse.up();
  const after = await viewportState(page);
  t.diagnostic(`frame width ${before} -> ${after.frameWidthPx}`);
  assert.ok(after.frameWidthPx < before, `width shrank: ${before} -> ${after.frameWidthPx}`);
  assert.ok(Math.abs(after.frameWidthPx - (before - Math.round((60 * 2) / zoom))) <= 4, `width ${after.frameWidthPx} tracks the pointer`);
  assert.equal(after.preset, 'custom');
  assert.equal(await frameWidth(page), after.frameWidthPx, 'iframe viewport follows');
  await page.close();
});
