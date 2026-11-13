import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";

test("host prevents submit reload, limits self events and stops native propagation", async () => {
  const server = await createServer({
    configFile: false,
    esbuild: { jsx: "automatic" },
    resolve: { alias: { "@": resolve("src") } },
    server: { port: 0 },
  });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(
      `${server.resolvedUrls!.local[0]}tests/fixtures/interactions-host.html`,
    );
    await page.locator("#form").waitFor({ timeout: 5000 });
    await page.locator("#unmarked").focus();
    await page.waitForTimeout(30);
    await page.waitForFunction(
      () => (window as any).events.includes("broken"),
      null,
      { timeout: 2000 },
    );
    await page
      .locator("#broken")
      .evaluate((el) => el.dispatchEvent(new Event("error")));
    const initialEvents = await page.evaluate(
      () => (window as any).events as string[],
    );
    assert.equal(initialEvents.filter((x) => x === "broken").length, 1);
    assert.equal(initialEvents.includes("empty"), false);
    assert.equal(initialEvents.includes("pending"), false);
    assert.equal(initialEvents.includes("outer focus"), false);
    const prevented = await page
      .locator("#form")
      .evaluate(
        (el) =>
          !el.dispatchEvent(
            new Event("submit", { bubbles: true, cancelable: true }),
          ),
      );
    assert.equal(prevented, true);
    await page.waitForFunction(() =>
      (window as any).events.includes("submitted"),
    );
    const propagated = await page.evaluate(() => {
      let seen = false;
      document.addEventListener(
        "click",
        () => {
          seen = true;
        },
        { once: true },
      );
      document.getElementById("inner")!.click();
      return seen;
    });
    assert.equal(propagated, false);
    await page.waitForFunction(() =>
      (window as any).events.includes("inner click"),
    );
    assert.equal(
      (await page.evaluate(() => (window as any).events)).includes(
        "outer click",
      ),
      false,
    );
    await page.locator("#snapshot").click();
    assert.equal(
      (await page.evaluate(() => (window as any).events)).includes("late load"),
      false,
    );
    await page.locator("#load-dom").click();
    await page.waitForFunction(
      () => (window as any).events.includes("late load"),
      null,
      { timeout: 2000 },
    );
    await page.locator("#rerender").click();
    assert.equal(
      (await page.evaluate(() => (window as any).events as string[])).filter(
        (x) => x === "late load",
      ).length,
      1,
    );
    await page.locator("#show").click();
    await page.waitForFunction(
      () => (window as any).observer.targets.size === 1,
    );
    await page.evaluate(() => (window as any).observer.fire());
    await page.waitForFunction(
      () =>
        (window as any).events.includes("once") &&
        (window as any).events.includes("repeat"),
    );
    await page.locator("#rerender").click();
    await page.waitForFunction(
      () => (window as any).observer.targets.size === 1,
    );
    await page.evaluate(() => (window as any).observer.fire());
    await page.waitForFunction(
      () =>
        (window as any).events.filter((x: string) => x === "repeat").length ===
        2,
    );
    const events = await page.evaluate(
      () => (window as any).events as string[],
    );
    assert.equal(events.filter((x) => x === "once").length, 1);
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
    await server.close();
  }
});
