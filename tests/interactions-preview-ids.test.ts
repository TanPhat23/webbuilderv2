import { strict as assert } from "node:assert";
import { test } from "node:test";
import { createElement } from "react";
import { prerenderToNodeStream } from "react-dom/static";
import { ALL_ELEMENT_TYPES } from "../apps/editor/src/features/editor/constants/elements";
import PreviewElementLoader from "@webbuilder/site-runtime/preview/PreviewElementLoader";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

test("the preview loader puts interaction ids on rendered element roots", async () => {
  for (const type of ALL_ELEMENT_TYPES) {
    const element = { id: "instance~child", pageId: "page", type, content: "Example", elements: [] } as EditorElement;
    const { prelude } = await prerenderToNodeStream(createElement(PreviewElementLoader, { elements: [element] }));
    let markup = "";
    for await (const chunk of prelude) markup += chunk;
    assert.match(markup.replace(/^<!--\$-->/, ""), /^<[^<>]+\sid="instance~child"(?=[\s/>])[^<>]*\sdata-element-id="instance~child"(?=[\s/>])/, type);
  }
});
