import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { applyEdits } from "../apps/editor/src/features/agent/editOps";
import PreviewElementLoader from "@webbuilder/site-runtime/preview/PreviewElementLoader";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

const pageId = "home";
const preview = (elements: EditorElement[]) =>
  renderToStaticMarkup(createElement<{ elements: EditorElement[] }>(PreviewElementLoader, { elements }));

test("a Link created through apply_edits renders an external anchor in preview", () => {
  const result = applyEdits([], [{
    op: "create",
    element: {
      type: "Link",
      content: "Visit example",
      href: "https://example.com/docs",
      settings: { target: "_blank" },
    },
  }], pageId);
  assert.ok(result.ok);
  const html = preview(result.elements);
  assert.match(html, /<a\b[^>]*href="https:\/\/example\.com\/docs"[^>]*target="_blank"[^>]*rel="noopener"[^>]*>Visit example<\/a>/);
});

test("adding href to an existing button makes it a navigable anchor", () => {
  const button: EditorElement = { id: "cta", pageId, type: "Button", content: "See pricing" };
  const result = applyEdits([button], [{
    op: "update", id: "cta", set: { href: "?page=pricing" },
  }], pageId);

  assert.ok(result.ok);
  assert.match(preview(result.elements), /<a\b[^>]*href="\?page=pricing"[^>]*>See pricing<\/a>/);
  assert.match(preview([button]), /<button\b[^>]*>See pricing<\/button>/);
});

test("a saved link with a disallowed protocol renders no actionable URL", () => {
  const html = preview([{
    id: "old-link", pageId, type: "Link", content: "Old link", href: "java\tscript:alert(1)",
  }]);
  assert.doesNotMatch(html, /\bhref=/);
});
