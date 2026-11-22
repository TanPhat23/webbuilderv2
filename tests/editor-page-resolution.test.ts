import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page } from "../src/features/pages";
import {
  isEventOverElement,
  resolveFallbackPage,
} from "../src/features/editor/lib/editorPage";

function makePage(overrides: Partial<Page> & Pick<Page, "Id" | "Name" | "Type">): Page {
  return {
    Styles: null,
    ProjectId: "proj-1",
    CreatedAt: new Date(0),
    UpdatedAt: new Date(0),
    DeletedAt: null,
    ...overrides,
  };
}

test("resolveFallbackPage returns undefined when list is empty or requested page is active", () => {
  assert.equal(resolveFallbackPage(undefined, ""), undefined);
  assert.equal(resolveFallbackPage([], "p1"), undefined);

  const pages = [
    makePage({ Id: "p1", Name: "", Type: "sp" }),
    makePage({ Id: "cp1", Name: "Card", Type: "cp" }),
  ];
  assert.equal(resolveFallbackPage(pages, "p1"), undefined);
  assert.equal(resolveFallbackPage(pages, "cp1"), undefined);
});

test("resolveFallbackPage skips deleted or component pages and prefers unnamed root page", () => {
  const pages = [
    makePage({ Id: "deleted-home", Name: "", Type: "sp", DeletedAt: new Date(1) }),
    makePage({ Id: "cp1", Name: "", Type: "cp" }),
    makePage({ Id: "about", Name: "About", Type: "sp" }),
    makePage({ Id: "home", Name: "", Type: "sp" }),
  ];

  assert.equal(resolveFallbackPage(pages, "deleted-home")?.Id, "home");
  assert.equal(resolveFallbackPage(pages, "")?.Id, "home");

  const namedOnly = [
    makePage({ Id: "cp1", Name: "", Type: "cp" }),
    makePage({ Id: "about", Name: "About", Type: "sp" }),
    makePage({ Id: "pricing", Name: "Pricing", Type: "sp" }),
  ];
  assert.equal(resolveFallbackPage(namedOnly, "missing")?.Id, "about");
});

test("isEventOverElement checks closest('[data-element-id]') safely across realms", () => {
  const insideElement = {
    closest: (selector: string) => (selector === "[data-element-id]" ? {} : null),
  } as unknown as EventTarget;
  const outsideElement = {
    closest: () => null,
  } as unknown as EventTarget;

  assert.equal(isEventOverElement(null), false);
  assert.equal(isEventOverElement(outsideElement), false);
  assert.equal(isEventOverElement(insideElement), true);
});
