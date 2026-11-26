import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";
import { collectClasses, createTailwindBuilder } from "@webbuilder/site-runtime/projects/tailwind-jit";

const require = createRequire(import.meta.url);
const read = (id: string) => readFileSync(require.resolve(id), "utf8");
const sources = () => ({
  theme: read("tailwindcss/theme.css"),
  utilities: read("tailwindcss/utilities.css"),
});

test("collectClasses walks children, splits on whitespace and dedupes", () => {
  const tree = [
    { tailwindStyles: "flex  gap-4", children: [{ tailwindStyles: "gap-4 text-white" }] },
    { children: [{ tailwindStyles: "bg-slate-950\nmd:grid" }] },
    { tailwindStyles: undefined },
  ];
  assert.deepEqual(collectClasses(tree), ["bg-slate-950", "flex", "gap-4", "md:grid", "text-white"]);
});

test("collectClasses tolerates missing or malformed input", () => {
  assert.deepEqual(collectClasses(undefined), []);
  assert.deepEqual(collectClasses([null, 3, { children: "nope" }]), []);
});

test("compiles Tailwind styles on nested editor and preview elements", async () => {
  const tree = [{
    type: "Section",
    elements: [{
      type: "Frame",
      tailwindStyles: "gap-x-6",
      elements: [{ type: "Link", tailwindStyles: "bg-[#542237]" }],
    }],
  }];

  const build = await createTailwindBuilder(sources());
  const css = build(collectClasses(tree));

  assert.match(css, /\.gap-x-6\s*\{/);
  assert.match(css, /background-color:\s*#542237/);
});

test("builds CSS for classes the app source never mentions", async () => {
  const build = await createTailwindBuilder(sources());
  const css = build([
    "bg-slate-950",
    "text-indigo-400",
    "bg-white/10",
    "gap-14",
    "rounded-3xl",
    "w-[137px]",
    "md:grid-cols-3",
    "hover:bg-indigo-500",
    "bg-gradient-to-r",
    "from-indigo-400",
    "to-fuchsia-400",
  ]);
  for (const needle of [
    ".bg-slate-950",
    ".text-indigo-400",
    ".gap-14",
    ".rounded-3xl",
    ".w-\\[137px\\]",
    ".md\\:grid-cols-3",
    ".hover\\:bg-indigo-500",
    ".from-indigo-400",
  ]) {
    assert.ok(css.includes(needle), `missing rule for ${needle}`);
  }
  assert.match(css, /--color-slate-950:/, "emits the theme variable it uses");
  assert.ok(!css.includes("--color-red-500"), "does not emit unused theme variables");
  assert.ok(!css.includes("box-sizing"), "does not emit preflight");
});

test("ignores strings that are not Tailwind classes", async () => {
  const build = await createTailwindBuilder(sources());
  const css = build(["not-a-class", "<script>alert(1)</script>", "bg-red-500"]);
  assert.ok(css.includes(".bg-red-500"));
  assert.ok(!css.includes("script"));
  assert.ok(!css.includes("not-a-class"));
});

test("the dark variant follows the app's .dark class", async () => {
  const build = await createTailwindBuilder(sources());
  const css = build(["dark:bg-slate-900"]);
  assert.match(css, /\.dark\s/);
});
