// $WEB/tests/reveal.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { collectReveals, readReveal, revealCss, REVEAL_NOSCRIPT_CSS } from "@webbuilder/site-runtime/preview/reveal";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

const el = (id: string, settings: unknown, kids: unknown[] = []) => ({ id, type: "Frame", settings, elements: kids }) as unknown as EditorElement;

test("reads a valid reveal and clamps the delay", () => {
  assert.deepEqual(readReveal(el("a", { reveal: "fade-up", revealDelay: 150 })), { id: "a", effect: "fade-up", delay: 150 });
  assert.equal(readReveal(el("a", { reveal: "fade", revealDelay: 99999 }))?.delay, 2000);
  assert.equal(readReveal(el("a", { reveal: "fade", revealDelay: -5 }))?.delay, 0);
  assert.equal(readReveal(el("a", { reveal: "fade", revealDelay: "soon" }))?.delay, 0);
});

test("ignores missing, unknown and unsafe values", () => {
  assert.equal(readReveal(el("a", null)), null);
  assert.equal(readReveal(el("a", {})), null);
  assert.equal(readReveal(el("a", { reveal: "spin-forever" })), null);
  assert.equal(readReveal(el('a"]{x:y}', { reveal: "fade" })), null, "an id that could break out of the selector is never emitted");
});

test("collects reveals from nested elements in order", () => {
  const tree = [el("s", { reveal: "fade" }, [el("c1", { reveal: "zoom", revealDelay: 100 }), el("c2", null, [el("c3", { reveal: "fade-left" })])])];
  assert.deepEqual(collectReveals(tree).map((i) => i.id), ["s", "c1", "c3"]);
});

test("css hides the element until revealed and respects reduced motion", () => {
  const css = revealCss([{ id: "a", effect: "fade-up", delay: 0 }, { id: "b", effect: "fade-up", delay: 200 }, { id: "c", effect: "fade", delay: 0 }]);
  assert.ok(css.startsWith("@media (prefers-reduced-motion:no-preference){") && css.endsWith("}"));
  assert.match(css, /\[data-element-id="a"\]:not\(\.wb-in\),\[data-element-id="b"\]:not\(\.wb-in\)\{opacity:0;transform:translateY\(24px\);\}/);
  assert.match(css, /\[data-element-id="c"\]:not\(\.wb-in\)\{opacity:0;\}/);
  assert.match(css, /\[data-element-id="b"\]\{transition-delay:200ms\}/);
  assert.ok(!/transition-delay:0ms/.test(css));
});

test("no reveals means no css, and the no-script fallback unhides everything", () => {
  assert.equal(revealCss([]), "");
  assert.match(REVEAL_NOSCRIPT_CSS, /opacity:1!important/);
});
