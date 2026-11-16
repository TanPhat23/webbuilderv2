import assert from "node:assert/strict";
import { test } from "node:test";
import { codeGenerator } from "../src/features/editor/lib/code/generator";

const el = (type: string, extra: Record<string, unknown> = {}) => ({
  id: `el_${Math.random().toString(36).slice(2)}`,
  type,
  name: type,
  content: "",
  tailwindStyles: "",
  ...extra,
});

const navbar = () =>
  el("Section", {
    elements: [
      el("Frame", {
        elements: [el("Image", { src: "", alt: "Logo" }), el("Text", { content: "WebBuilder" })],
      }),
      el("Frame", {
        elements: [el("Link", { content: "Features", href: "#features" }), el("Button", { content: "Sign in" })],
      }),
    ],
  });

test("generated JSX is laid out over multiple lines", async () => {
  const code = await codeGenerator.generateToJSX([navbar()] as never);
  const longest = Math.max(...code.split("\n").map((line) => line.length));
  assert.ok(longest <= 100, `a line is ${longest} characters wide:\n${code}`);
  assert.ok(code.split("\n").length > 15, code);
  assert.doesNotMatch(code, /\n\s*\n\s*<\/>/, "no blank line before the closing fragment");
});

test("imports only the components the output renders", async () => {
  const code = await codeGenerator.generateToJSX([navbar()] as never);
  assert.match(code, /<button/);
  assert.doesNotMatch(code, /components\/ui\/button/);
});

test("imports a component when the output renders it", async () => {
  const code = await codeGenerator.generateToJSX([el("Carousel", { elements: [] })] as never);
  assert.match(code, /import \{ Carousel \} from '@\/components\/ui\/carousel'/);
});
