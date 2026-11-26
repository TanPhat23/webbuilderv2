import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildCode,
  highlight,
} from "../apps/editor/src/features/landing/components/LiveEditorDemo";

test("buildCode reflects state options for size, alignment, and button fill", () => {
  const filledLines = buildCode({
    heading: "Spring menu",
    body: "Twelve seats",
    button: "Reserve",
    size: "m",
    align: "center",
    filled: true,
  });
  assert.ok(filledLines.some((l) => l.text.includes("items-center text-center")));
  assert.ok(filledLines.some((l) => l.owner === "heading" && l.text.includes("text-3xl")));
  assert.ok(filledLines.some((l) => l.owner === "button" && l.text.includes("bg-black")));

  const outlineLines = buildCode({
    heading: "Fall menu",
    body: "Book early",
    button: "Join",
    size: "xl",
    align: "left",
    filled: false,
  });
  assert.ok(outlineLines.some((l) => l.text.includes("items-start text-left")));
  assert.ok(outlineLines.some((l) => l.owner === "heading" && l.text.includes("text-5xl")));
  assert.ok(outlineLines.some((l) => l.owner === "button" && l.text.includes("border border-black")));
});

test("highlight leaves plain copy untouched and highlights JSX tags, strings, attributes, and keywords", () => {
  assert.deepEqual(highlight("  Spring menu is live"), ["  Spring menu is live"]);

  const jsxHtml = renderToStaticMarkup(
    createElement("code", null, ...highlight('        <a href="/book" className="px-4">')),
  );
  assert.match(jsxHtml, /text-\[var\(--landing-signal\)\].*&lt;a/);
  assert.match(jsxHtml, /text-foreground\/70.* href=/);
  assert.match(jsxHtml, /text-emerald-700.*&quot;\/book&quot;/);

  const exportHtml = renderToStaticMarkup(
    createElement("code", null, ...highlight("export default Hero;")),
  );
  assert.match(exportHtml, /text-muted-foreground italic.*export/);
  assert.match(exportHtml, /text-muted-foreground italic.*default/);
});
