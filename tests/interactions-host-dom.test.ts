import assert from "node:assert/strict";
import { test } from "node:test";
import {
  collectPageIds,
  extractEventScope,
  resolveImageErrorKey,
} from "@webbuilder/site-runtime/interactions/runtime/hostDom";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

test("extractEventScope returns null for null events and extracts input/key fields", () => {
  assert.equal(extractEventScope(null), null);

  const event = {
    type: "input",
    key: "Enter",
    target: { value: "hello", checked: true },
  } as unknown as Event;

  assert.deepEqual(extractEventScope(event), {
    type: "input",
    value: "hello",
    checked: true,
    key: "Enter",
  });
});

test("collectPageIds recursively gathers all nested element IDs", () => {
  const tree = [
    {
      id: "section-1",
      type: "Section",
      elements: [
        { id: "btn-1", type: "Button" },
        {
          id: "box-1",
          type: "Frame",
          elements: [{ id: "text-1", type: "Text" }],
        },
      ],
    },
  ] as unknown as EditorElement[];

  const ids = collectPageIds(tree);
  assert.deepEqual([...ids], ["section-1", "btn-1", "box-1", "text-1"]);
});

test("resolveImageErrorKey ignores non-IMG elements and resolves src or currentSrc", () => {
  const div = { tagName: "DIV", getAttribute: () => "/a.png" } as unknown as Element;
  assert.equal(resolveImageErrorKey(div), "");

  const broken = {
    tagName: "IMG",
    currentSrc: "",
    getAttribute: (name: string) => (name === "src" ? " /missing.png " : null),
  } as unknown as Element;
  assert.equal(resolveImageErrorKey(broken), "/missing.png");

  const empty = {
    tagName: "IMG",
    currentSrc: "https://example.com/cached.png",
    getAttribute: () => "   ",
  } as unknown as Element;
  assert.equal(resolveImageErrorKey(empty), "");

  const resolvedSrc = {
    tagName: "IMG",
    currentSrc: "https://example.com/a@2x.png",
    getAttribute: (name: string) => (name === "srcset" ? "/a@2x.png 2x" : null),
  } as unknown as Element;
  assert.equal(resolveImageErrorKey(resolvedSrc), "https://example.com/a@2x.png");
});
