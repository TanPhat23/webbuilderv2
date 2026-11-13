import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {chromium} from '@playwright/test';
import {resolve} from 'node:path';
import tailwindcss from '@tailwindcss/vite';
test('interaction editor preserves drafts and supports scroll targets', async()=>{
 const server=await createServer({configFile:false,plugins:[tailwindcss()],esbuild:{jsx:'automatic'},resolve:{alias:{'@':resolve('src')}},server:{port:0}}); await server.listen();
 const browser=await chromium.launch({headless:true});
 try {const page=await browser.newPage(); await page.goto(`${server.resolvedUrls!.local[0]}tests/fixtures/interactions-editor.html`);
 await page.getByLabel('Smooth').click(); assert.equal(await page.evaluate(()=>(window as any).steps[0].smooth),false);
 const headers=page.getByLabel('Headers'); await headers.fill('Authorization'); assert.equal(await headers.inputValue(),'Authorization'); await headers.fill('Authorization: Bearer token'); assert.equal(await page.evaluate(()=>(window as any).steps[1].headers.Authorization),'Bearer token');
 await page.getByLabel('Scroll position').fill('420'); assert.equal(await page.evaluate(()=>(window as any).steps[0].scroll),420);
 await page.getByLabel('Element or expression').fill('{{ event.value }}'); assert.equal(await page.evaluate(()=>(window as any).steps[0].scroll),'{{ event.value }}');
 await page.getByLabel('Move step down').first().click(); assert.equal(await page.evaluate(()=>(window as any).list[0].toast),'Second');
 for (const width of [320,390,768,1280]) { await page.setViewportSize({width,height:800}); await page.evaluate(() => document.documentElement.classList.add('dark')); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,`overflow at ${width}`); await page.screenshot({path:`/tmp/interactions-editor-${width}.png`}); }
 await page.evaluate(() => { document.documentElement.classList.remove('dark'); document.body.style.zoom='2'; }); await page.setViewportSize({width:1280,height:800}); assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true);
 } finally {await browser.close();await server.close();}
});
