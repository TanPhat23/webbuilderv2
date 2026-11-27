import assert from "node:assert/strict";
import { test } from "node:test";
import { ALL_ELEMENT_TYPES, type ElementType } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { ELEMENT_CODECS } from "../apps/editor/src/features/editor/lib/code/codecs/registry";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import { parseCode } from "../apps/editor/src/features/editor/lib/code/parseCode";
import { diffTrees } from "../apps/editor/src/features/editor/utils/element/treeDiff";

const PAGE = "page_codecs";

function sampleFor(type: ElementType): EditorElement {
  const base = { id: `el_${type}`, type, pageId: PAGE, content: "", styles: {}, settings: null, tailwindStyles: "p-2" };
  switch (type) {
    case "Heading":
      return { ...base, content: "Main Heading", settings: { level: 3 } } as unknown as EditorElement;
    case "Text":
    case "Span":
    case "Button":
      return { ...base, content: `${type} copy` } as unknown as EditorElement;
    case "Label":
      return { ...base, content: "Email", settings: { htmlFor: "email-input" } } as unknown as EditorElement;
    case "Blockquote":
      return { ...base, content: "Quote text", settings: { cite: "https://example.com" } } as unknown as EditorElement;
    case "Code":
      return { ...base, content: "const x = 1;", settings: { preformatted: true } } as unknown as EditorElement;
    case "Separator":
      return { ...base } as unknown as EditorElement;
    case "Icon":
      return { ...base, settings: { iconName: "arrow-up-right", size: 20, strokeWidth: 1.5 } } as unknown as EditorElement;
    case "Image":
      return { ...base, content: "Alt text", src: "/pic.png", settings: { loading: "lazy" } } as unknown as EditorElement;
    case "Video":
      return { ...base, src: "/clip.mp4", settings: { controls: true, loop: true, poster: "/p.jpg" } } as unknown as EditorElement;
    case "Audio":
      return { ...base, src: "/track.mp3", settings: { controls: true, muted: true } } as unknown as EditorElement;
    case "IFrame":
      return { ...base, src: "https://example.com/embed", settings: { loading: "lazy", allow: "fullscreen" } } as unknown as EditorElement;
    case "Link":
      return { ...base, content: "Read more", href: "/docs", elements: [] } as unknown as EditorElement;
    case "Input":
      return { ...base, settings: { type: "email", placeholder: "you@example.com", required: true } } as unknown as EditorElement;
    case "Textarea":
      return { ...base, settings: { name: "bio", rows: 4, placeholder: "Bio" } } as unknown as EditorElement;
    case "Checkbox":
      return { ...base, settings: { name: "agree", value: "yes", defaultChecked: true } } as unknown as EditorElement;
    case "Radio":
      return { ...base, settings: { name: "plan", value: "pro", required: true } } as unknown as EditorElement;
    case "Progress":
      return { ...base, settings: { value: 65, max: 100 } } as unknown as EditorElement;
    case "Select":
      return {
        ...base,
        settings: { name: "tier" },
        elements: [{ id: "opt_1", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Starter", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "List":
      return {
        ...base,
        settings: { ordered: false },
        elements: [{ id: "li_1", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Bullet", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "Table":
      return {
        ...base,
        settings: {
          caption: "Plans",
          bordered: true,
          columns: [
            { id: "c1", header: "Plan", align: "left" },
            { id: "c2", header: "Price", align: "right" },
          ],
        },
        elements: [{ id: "tb_child", type: "Text", pageId: PAGE, parentId: `el_${type}`, content: "Row body", styles: {}, settings: null }],
      } as unknown as EditorElement;
    case "Carousel":
    case "Form":
    case "Frame":
    case "Section":
    case "Nav":
    case "Header":
    case "Footer":
    case "Article":
    case "Aside":
    case "CMSContentList":
    case "CMSContentGrid":
    case "CMSContentItem":
      return {
        ...base,
        ...(type.startsWith("CMS") ? { settings: { contentTypeId: "posts", limit: 6 } } : {}),
        elements: [{ id: `child_${type}`, type: "Span", pageId: PAGE, parentId: `el_${type}`, content: "Inner", styles: {}, settings: null }],
      } as unknown as EditorElement;
  }
}

test("every ElementType in ALL_ELEMENT_TYPES has a codec and round-trips with zero diff", async () => {
  assert.equal(ALL_ELEMENT_TYPES.length, 34);
  for (const type of ALL_ELEMENT_TYPES) {
    assert.ok(ELEMENT_CODECS[type], `missing codec for ${type}`);
    const tree = [sampleFor(type)];
    const code = await codeGenerator.generateToJSX(tree, undefined, { tagIds: true });
    const parsed = parseCode(code, tree, PAGE);
    assert.ok(parsed.ok, `${type} failed to parse: ${parsed.ok ? "" : parsed.diagnostic.message}\n${code}`);
    if (parsed.ok) {
      assert.deepEqual(diffTrees(tree, parsed.elements), [], `diff mismatch for ${type}\n${code}`);
    }
  }
});

test("<p>, <main>, multi-row HTML <table>, and aliased lucide-react icons compile into native elements", () => {
  const src = `
    import React from 'react';
    import { Sparkles as MagicIcon } from 'lucide-react';

    export default function Page() {
      return (
        <main className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold">Welcome</h1>
          <p className="text-zinc-600">Paragraph body</p>
          <MagicIcon size={18} className="text-amber-500" />
          <table>
            <caption>Comparison</caption>
            <thead><tr><th>Tier</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td>Free</td><td>$0</td></tr>
              <tr><td>Pro</td><td>$29</td></tr>
            </tbody>
          </table>
        </main>
      );
    }
  `;
  const res = parseCode(src, [], PAGE);
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  const main = res.elements[0]!;
  assert.equal(main.type, "Section");
  const children = (main as unknown as { elements: EditorElement[] }).elements;
  assert.deepEqual(children.map((c) => c.type), ["Heading", "Text", "Icon", "Table"]);
  assert.equal((children[0]?.settings as { level?: number })?.level, 1);
  assert.equal(children[1]?.content, "Paragraph body");
  assert.equal((children[2]?.settings as { iconName?: string })?.iconName, "sparkles");
  const table = children[3] as unknown as { settings: { caption?: string; columns?: { header: string }[] }; elements: EditorElement[] };
  assert.equal(table.settings.caption, "Comparison");
  assert.deepEqual(table.settings.columns?.map((c) => c.header), ["Tier", "Cost"]);
  assert.equal(table.elements.length, 2);
});
