import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { chromium } from "@playwright/test";
import { resolve } from "node:path";

test("compact style controls preserve edits, overrides, optional sections and locked state", async () => {
  const server = await createServer({
    configFile: false,
    esbuild: { jsx: "automatic" },
    plugins: [tailwindcss()],
    resolve: { alias: { "@": resolve("src") } },
    server: { port: 0 },
  });
  await server.listen();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(5000);
    page.on("pageerror", (e) => console.error(e));
    await page.goto(
      `${server.resolvedUrls!.local[0]}tests/fixtures/style-controls.html`,
    );
    const visual = await browser.newPage({
      viewport: { width: 320, height: 1100 },
      deviceScaleFactor: 2,
    });
    await visual.goto(
      `${server.resolvedUrls!.local[0]}tests/fixtures/style-controls.html?visual`,
    );
    await visual
      .getByRole("heading", { name: "Layout", exact: true })
      .waitFor();
    await visual
      .locator("aside")
      .screenshot({ path: "/tmp/inspector-refined-light.png", animations:"disabled" });
    await visual.evaluate(() => document.documentElement.classList.add("dark"));
    await visual
      .locator("aside")
      .screenshot({ path: "/tmp/inspector-refined-dark.png", animations:"disabled" });
    await visual.close();
    await page
      .getByRole("radio", { name: "Reverse horizontal", exact: true })
      .click();
    assert.equal(
      JSON.parse(await page.locator("output").innerText()).flexDirection,
      "row-reverse",
    );
    assert.ok(
      (await page
        .getByRole("group", { name: "Child alignment" })
        .boundingBox())!.width <= 80,
      "alignment must be a compact control",
    );
    const width = page.getByRole("textbox", { name: "Width", exact: true });
    await width.waitFor();
    const values = async () =>
      JSON.parse(await page.locator("output").innerText());
    await width.focus();
    await width.fill("40px");
    await width.press("Escape");
    assert.equal(
      (await values()).width,
      "1.5rem",
      "Escape must discard the draft",
    );
    await width.focus();
    await width.fill("2rem");
    await width.press("Enter");
    await page.getByRole("heading", { name: "Layout", exact: true }).click();
    assert.equal(
      (await values()).width,
      "2rem",
      "blur after Enter must preserve units",
    );
    await width.focus();
    await width.fill("12qx");
    await width.press("Enter");
    assert.equal(await width.getAttribute("aria-invalid"), "true");
    await page.getByRole("heading", { name: "Layout", exact: true }).click();
    assert.equal((await values()).width, "2rem");
    await page
      .getByRole("textbox", { name: "Keyword", exact: true })
      .press("ArrowUp");
    assert.equal((await values()).keyword, "1px");
    await page
      .getByRole("textbox", { name: "Padding left and right", exact: true })
      .focus();
    await page
      .getByRole("textbox", { name: "Padding left and right", exact: true })
      .fill("4");
    await page
      .getByRole("textbox", { name: "Padding left and right", exact: true })
      .press("Enter");
    assert.equal((await values()).paddingTop, "8px");
    assert.equal((await values()).paddingLeft, "4px");
    assert.equal((await values()).padding, undefined);
    await page.getByRole("button", { name: "Add border", exact: true }).click();
    assert.equal((await values()).borderWidth, "1px");
    await page
      .getByRole("button", { name: "Remove border", exact: true })
      .click();
    assert.equal((await values()).borderWidth, undefined);
    await page
      .getByRole("button", { name: "Clear Width override", exact: true })
      .click();
    assert.equal((await values()).width, undefined);
    await page
      .getByRole("button", { name: "Add background image", exact: true })
      .click();
    assert.equal(
      await page
        .getByRole("textbox", { name: "Background image", exact: true })
        .evaluate((el) => el === document.activeElement),
      true,
    );
    await page
      .getByRole("button", { name: "Remove background image", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Background colour", exact: true })
      .fill("var(--primary)");
    await page
      .getByRole("textbox", { name: "Background colour", exact: true })
      .press("Tab");
    assert.equal((await values()).backgroundColor, "var(--primary)");
    assert.equal(
      await page
        .getByRole("textbox", {
          name: "Background colour opacity",
          exact: true,
        })
        .isDisabled(),
      true,
    );
    await page.getByRole("button", { name: "Add shadow", exact: true }).click();
    assert.match((await values()).boxShadow, /0 1px 2px/);
    await page
      .getByRole("button", { name: "Remove shadow", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Add effects", exact: true })
      .click();
    assert.equal((await values()).opacity, 1);
    await page
      .getByRole("button", { name: "Remove effects", exact: true })
      .click();
    const overflowing = await page
      .locator("aside")
      .evaluate((el) =>
        [...el.querySelectorAll("*")]
          .filter(
            (n) =>
              n.getBoundingClientRect().right >
              el.getBoundingClientRect().right + 1,
          )
          .map((n) => n.tagName),
      );
    assert.deepEqual(overflowing, [], "controls must fit 280px");
    await page.getByRole("button", { name: "Toggle lock" }).click();
    assert.equal(await width.isDisabled(), true);
    assert.equal(
      await page
        .getByRole("button", { name: "Add border", exact: true })
        .count(),
      0,
    );
    assert.equal(
      await page
        .getByRole("button", { name: "Add background image", exact: true })
        .count(),
      0,
    );
  } finally {
    await browser.close();
    await server.close();
  }
});
