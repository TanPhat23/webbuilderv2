import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  buildComponentCatalog,
  lucideKebabToPascal,
  lucidePascalToKebab,
  synthesizeComponentProps,
  toComponentPascalName,
} from "../apps/editor/src/features/editor/lib/code/catalog";
import {
  readCodeText,
  readCodeVisible,
  renderCodeTextPlaceholder,
} from "../apps/editor/src/features/editor/lib/code/customCode";

function makeEl(id: string, type: EditorElement["type"], extra: Record<string, unknown> = {}): EditorElement {
  return {
    id,
    type,
    pageId: "cp_1",
    content: "",
    styles: {},
    settings: null,
    ...extra,
  } as unknown as EditorElement;
}

test("toComponentPascalName sanitizes digits, punctuation, and reserved React/shadcn names", () => {
  const used = new Set<string>();
  assert.equal(toComponentPascalName("feature card", used), "FeatureCard");
  assert.equal(toComponentPascalName("feature-card", used), "FeatureCard2");
  assert.equal(toComponentPascalName("123 pricing!", used), "Component123Pricing");
  assert.equal(toComponentPascalName("React", used), "ReactComponent");
  assert.equal(toComponentPascalName("Carousel", used), "CarouselComponent");
  assert.equal(toComponentPascalName("   ", used), "Component");
});

test("synthesizeComponentProps honors explicit settings.componentProps and strips prototype/reserved keys", () => {
  const root = makeEl("root", "Section", {
    settings: {
      componentProps: {
        title: { nodeId: "h1", field: "text", defaultValue: "Fast" },
        __proto__: { nodeId: "h1", field: "text", defaultValue: "bad" },
        constructor: { nodeId: "h1", field: "text", defaultValue: "bad" },
        className: { nodeId: "h1", field: "text", defaultValue: "bad" },
        key: { nodeId: "h1", field: "text", defaultValue: "bad" },
      },
    },
    elements: [makeEl("h1", "Heading", { content: "Fast", settings: { level: 2 } })],
  });
  const props = synthesizeComponentProps(root);
  assert.equal(Object.getPrototypeOf(props), null);
  assert.equal(props.constructor, undefined);
  assert.deepEqual(Object.keys(props), ["title"]);
  assert.deepEqual(props.title, { nodeId: "h1", field: "text", defaultValue: "Fast" });
});

test("synthesizeComponentProps derives deterministic camelCase names for Canvas-built masters", () => {
  const root = makeEl("root", "Section", {
    elements: [
      makeEl("n1", "Heading", { name: "Card Title", content: "Starter", settings: { level: 3 } }),
      makeEl("n2", "Heading", { name: "Card Title", content: "Sub", settings: { level: 4 } }),
      makeEl("n3", "Link", { name: "CTA", content: "Sign up", href: "/signup" }),
      makeEl("n4", "Image", { name: "Hero Banner", content: "Hero alt", src: "/hero.png" }),
      makeEl("n5", "Text", { name: "__proto__", content: "Safe" }),
    ],
  });
  const props = synthesizeComponentProps(root);
  assert.equal(Object.getPrototypeOf(props), null);
  assert.equal(props.constructor, undefined);
  assert.deepEqual(props.cardTitle, { nodeId: "n1", field: "text", defaultValue: "Starter" });
  assert.deepEqual(props.cardTitle2, { nodeId: "n2", field: "text", defaultValue: "Sub" });
  assert.deepEqual(props.ctaText, { nodeId: "n3", field: "text", defaultValue: "Sign up" });
  assert.deepEqual(props.ctaHref, { nodeId: "n3", field: "href", defaultValue: "/signup" });
  assert.deepEqual(props.heroBannerSrc, { nodeId: "n4", field: "src", defaultValue: "/hero.png" });
  assert.deepEqual(props.heroBannerAlt, { nodeId: "n4", field: "alt", defaultValue: "Hero alt" });
  assert.equal(Object.hasOwn(props, "__proto__"), false);
  assert.ok(props.text);
});

test("buildComponentCatalog indexes by pageId and deduplicated pascalName", () => {
  const r1 = makeEl("r1", "Section", { elements: [makeEl("t1", "Text", { name: "Title", content: "A" })] });
  const r2 = makeEl("r2", "Section", { elements: [makeEl("t2", "Text", { name: "Title", content: "B" })] });
  const catalog = buildComponentCatalog([
    { pageId: "cp_1", name: "Pricing Card", root: r1 },
    { pageId: "cp_2", name: "Pricing-Card", root: r2 },
  ]);
  assert.equal(catalog.byPageId.get("cp_1")?.pascalName, "PricingCard");
  assert.equal(catalog.byPageId.get("cp_2")?.pascalName, "PricingCard2");
  assert.equal(catalog.byPascalName.get("PricingCard")?.pageId, "cp_1");
});

test("Lucide PascalCase and kebab-case round-trip including numeric suffixes", () => {
  assert.equal(lucideKebabToPascal("arrow-up-right"), "ArrowUpRight");
  assert.equal(lucideKebabToPascal("check-circle-2"), "CheckCircle2");
  assert.equal(lucidePascalToKebab("ArrowUpRight"), "arrow-up-right");
  assert.equal(lucidePascalToKebab("CheckCircle2"), "check-circle-2");
});

test("customCode helpers validate codeText and codeVisible safely", () => {
  const segs = ["Clicked ", { expr: "count" }, " times"] as const;
  assert.equal(renderCodeTextPlaceholder(segs), "Clicked {count} times");
  assert.deepEqual(readCodeText({ codeText: segs }), segs);
  assert.equal(readCodeText({ codeText: [{ bad: 1 }] }), undefined);
  assert.equal(readCodeVisible({ codeVisible: "isOpen" }), "isOpen");
  assert.equal(readCodeVisible({ codeVisible: "" }), undefined);
});
