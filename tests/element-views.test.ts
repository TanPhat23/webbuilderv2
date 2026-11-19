import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { prerenderToNodeStream } from "react-dom/static";
import { ALL_ELEMENT_TYPES } from "../src/features/editor/constants/elements";
import { getView } from "../src/features/elements/registry";
import type { EditorElement } from "../src/types/global.type";

for (const type of ALL_ELEMENT_TYPES) {
  test(`${type} shares markup across edit and preview`, async () => {
    const element = {
      type, id: "sample", pageId: "page",
      content: "<b>Example</b>", href: "/target", src: "https://example.test/image.png", elements: [],
    } as EditorElement;
    const View = getView(type);
    assert.ok(View, type);
    const rootProps = { id: element.id, "data-element-id": element.id, className: "sample", style: { color: "red" } };
    const children = ["Section", "Header", "Footer", "Nav", "Frame", "Link", "Form", "List", "Carousel",
      "Article", "Aside", "Table", "CMSContentList", "CMSContentGrid", "CMSContentItem"].includes(type)
      ? createElement("span", { key: "child" }, "Child")
      : undefined;
    const previewProps = { element, rootProps, children, mode: "preview" as const };
    const previewView = createElement(View, previewProps);
    // Warm lazy views through the static streaming API before synchronous SSR.
    if (type === "Carousel" || type === "Code" || type === "Table") {
      const { prelude } = await prerenderToNodeStream(previewView);
      for await (const chunk of prelude) void chunk;
    }
    const preview = renderToStaticMarkup(previewView);
    const edit = renderToStaticMarkup(createElement(View, {
      ...previewProps, mode: "edit",
      rootProps: {
        ...rootProps, draggable: true, contentEditable: true, "data-element-type": type,
        suppressContentEditableWarning: true,
        style: { ...rootProps.style, cursor: "inherit", userSelect: "auto" },
      },
    }));
    assert.ok(preview.includes('id="sample"'));
    assert.equal(edit.replace(/ (?:draggable|contentEditable|data-element-type)="[^"]*"/gi, "")
      .replace(/;cursor:inherit;user-select:auto/g, ""), preview);
  });
}
