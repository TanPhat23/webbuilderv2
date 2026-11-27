import assert from "node:assert/strict";
import { test } from "node:test";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { buildComponentCatalog } from "../apps/editor/src/features/editor/lib/code/catalog";
import { codeGenerator } from "../apps/editor/src/features/editor/lib/code/generator";
import {
  bindExtractedComponentInstances,
  parseCode,
} from "../apps/editor/src/features/editor/lib/code/parseCode";

const PAGE = "page_main";

function makeMaster(): EditorElement {
  return {
    id: "m_root",
    type: "Article",
    pageId: "cp_card",
    content: "",
    tailwindStyles: "rounded-xl border p-6",
    styles: {},
    settings: null,
    elements: [
      {
        id: "m_title",
        type: "Heading",
        pageId: "cp_card",
        parentId: "m_root",
        name: "Title",
        content: "Default Title",
        styles: {},
        settings: { level: 3 },
      },
      {
        id: "m_cta",
        type: "Link",
        pageId: "cp_card",
        parentId: "m_root",
        name: "CTA",
        content: "Learn more",
        href: "/learn",
        styles: {},
        settings: null,
        elements: [],
      },
    ],
  } as unknown as EditorElement;
}

test("project component instances generate clean imports/props and parse back into overrides", async () => {
  const master = makeMaster();
  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "Feature Card", root: master }]);
  const instance: EditorElement = {
    id: "inst_1",
    type: "Article",
    pageId: PAGE,
    content: "",
    tailwindStyles: "mt-4",
    styles: {},
    settings: {
      component: {
        pageId: "cp_card",
        rootId: "m_root",
        overrides: {
          m_title: { text: "Custom Title" },
          m_cta: { href: "/signup" },
        },
      },
    },
  } as unknown as EditorElement;

  const code = await codeGenerator.generateToJSX([instance], undefined, { tagIds: true, catalog });
  assert.match(code, /import \{ FeatureCard \} from '@\/components\/FeatureCard';/);
  assert.match(code, /<FeatureCard[^>]*title="Custom Title"[^>]*ctaHref="\/signup"/);
  assert.doesNotMatch(code, /ctaText=/, "default prop values are omitted");

  const edited = code.replace('title="Custom Title"', 'title="Updated Title"');
  const parsed = parseCode(edited, [instance], PAGE, { catalog });
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  const setting = componentSetting(parsed.elements[0]!);
  assert.deepEqual(setting, {
    pageId: "cp_card",
    rootId: "m_root",
    overrides: {
      m_title: { text: "Updated Title" },
      m_cta: { href: "/signup" },
    },
  });
  assert.equal(parsed.elements[0]?.tailwindStyles, "mt-4");
});

test("project component named Button imported from @/components/Button is not lowered as shadcn", () => {
  const btnMaster: EditorElement = {
    id: "bm_root",
    type: "Button",
    pageId: "cp_btn",
    name: "Label",
    content: "Click",
    styles: {},
    settings: null,
  } as unknown as EditorElement;
  const catalog = buildComponentCatalog([{ pageId: "cp_btn", name: "Button", root: btnMaster }]);
  const src = `
    import { Button } from '@/components/Button';
    export default function Page() {
      return <section><Button labelText="Launch" /></section>;
    }
  `;
  const res = parseCode(src, [], PAGE, { catalog });
  assert.ok(res.ok, res.ok ? "" : res.diagnostic.message);
  if (!res.ok) return;
  const child = (res.elements[0] as unknown as { elements: EditorElement[] }).elements[0]!;
  assert.equal(componentSetting(child)?.pageId, "cp_btn");
  assert.equal(componentSetting(child)?.overrides?.bm_root?.text, "Launch");
});

test("component instances forbid JSX children and unknown unbound props", () => {
  const master = makeMaster();
  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "Feature Card", root: master }]);
  const withChildren = parseCode(
    `import { FeatureCard } from '@/components/FeatureCard';\nexport default () => <FeatureCard><span>Bad</span></FeatureCard>;`,
    [],
    PAGE,
    { catalog },
  );
  assert.equal(withChildren.ok, false);
  if (!withChildren.ok) assert.match(withChildren.diagnostic.message, /Edit the FeatureCard component/i);

  const unknownUnbound = parseCode(
    `import { FeatureCard } from '@/components/FeatureCard';\nexport default () => <FeatureCard extra={nope} />;`,
    [],
    PAGE,
    { catalog },
  );
  assert.equal(unknownUnbound.ok, false);
  if (!unknownUnbound.ok) assert.match(unknownUnbound.diagnostic.message, /nope/);
});

test("local PascalCase component previews inline and ports to ExtractedComponentSpec on commit", async () => {
  const src = `
    import React from 'react';

    function PricingTier({ plan = 'Starter', price = '$0' }: { plan?: string; price?: string }) {
      return (
        <article className="rounded-xl border p-6">
          <h3 className="font-bold">{plan}</h3>
          <p className="text-2xl">{price}</p>
        </article>
      );
    }

    export default function PricingPage() {
      return (
        <section className="grid grid-cols-2 gap-6">
          <PricingTier plan="Pro" price="$29" />
          <PricingTier plan="Enterprise" price="$99" />
        </section>
      );
    }
  `;

  const preview = parseCode(src, [], PAGE, { mode: "preview" });
  assert.ok(preview.ok, preview.ok ? "" : preview.diagnostic.message);
  if (!preview.ok) return;
  assert.deepEqual(preview.pendingComponentNames, ["PricingTier"]);
  assert.equal(preview.extractedComponents.length, 0);
  const previewCards = (preview.elements[0] as unknown as { elements: EditorElement[] }).elements;
  assert.equal(previewCards.length, 2);
  assert.equal(componentSetting(previewCards[0]!), undefined, "preview inlines without component setting");
  assert.equal((previewCards[0] as unknown as { elements: EditorElement[] }).elements[0]?.content, "Pro");

  const committed = parseCode(src, [], PAGE, { mode: "commit" });
  assert.ok(committed.ok, committed.ok ? "" : committed.diagnostic.message);
  if (!committed.ok) return;
  assert.equal(committed.extractedComponents.length, 1);
  const spec = committed.extractedComponents[0]!;
  assert.equal(spec.name, "PricingTier");
  assert.equal(spec.pascalName, "PricingTier");
  assert.ok(spec.propBindings.plan);
  assert.ok(spec.propBindings.price);
  assert.doesNotMatch(committed.preamble.top, /function PricingTier/);

  const bound = bindExtractedComponentInstances(
    committed.elements,
    committed.pendingInstances,
    new Map([["PricingTier", { pageId: "cp_new", rootId: spec.root.id }]]),
  );
  const instances = (bound[0] as unknown as { elements: EditorElement[] }).elements;
  assert.equal(componentSetting(instances[0]!)?.pageId, "cp_new");
  assert.equal(componentSetting(instances[0]!)?.overrides?.[spec.propBindings.plan.nodeId]?.text, "Pro");
  assert.equal(componentSetting(instances[1]!)?.overrides?.[spec.propBindings.price.nodeId]?.text, "$99");
});

test("recursive local components, fragment roots, stateful local helpers, and existing 'cp' name collisions fail with diagnostics", () => {
  const recursive = parseCode(
    `function Loop() { return <div><Loop /></div>; }\nexport default () => <section><Loop /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(recursive.ok, false);

  const mutual = parseCode(
    `function A() { return <div><B /></div>; }\nfunction B() { return <div><A /></div>; }\nexport default () => <section><A /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(mutual.ok, false);

  const fragmentHelper = parseCode(
    `function Bad() { return <><div /></>; }\nexport default () => <section><Bad /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(fragmentHelper.ok, false);

  const statefulHelper = parseCode(
    `import { useState } from 'react';\nfunction CounterCard() { const [n] = useState(0); return <div>{n}</div>; }\nexport default () => <section><CounterCard /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.equal(statefulHelper.ok, false);
  if (!statefulHelper.ok) assert.match(statefulHelper.diagnostic.message, /hooks/i);

  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "FeatureCard", root: makeMaster() }]);
  const colliding = parseCode(
    `function FeatureCard() { return <div>Different</div>; }\nexport default () => <section><FeatureCard /></section>;`,
    [],
    PAGE,
    { catalog, mode: "commit" },
  );
  assert.equal(colliding.ok, false);
  if (!colliding.ok) assert.match(colliding.diagnostic.message, /already exists/);
});

test("editing a 'cp' master page directly generates and parses typed component props", async () => {
  const master = makeMaster();
  const code = await codeGenerator.generateToJSX([master], undefined, {
    tagIds: true,
    pageMeta: { isComponentPage: true, componentName: "Feature Card" },
  });
  assert.match(code, /export interface FeatureCardProps/);
  assert.match(code, /export function FeatureCard\(/);
  assert.match(code, /\{title\}/);
  assert.match(code, /href=\{ctaHref\}/);

  const parsed = parseCode(code.replace("Default Title", "Updated Default"), [master], "cp_card", {
    isComponentPage: true,
    componentName: "Feature Card",
  });
  assert.ok(parsed.ok, parsed.ok ? "" : parsed.diagnostic.message);
  if (!parsed.ok) return;
  const root = parsed.elements[0]!;
  const titleEl = (root as unknown as { elements: EditorElement[] }).elements[0]!;
  assert.equal(titleEl.content, "Updated Default");
  const storedProps = (root.settings as { componentProps?: Record<string, { defaultValue: string }> })?.componentProps;
  assert.equal(storedProps?.title?.defaultValue, "Updated Default");
  assert.equal(Object.getPrototypeOf(storedProps), null);
  assert.doesNotMatch(parsed.preamble.top, /FeatureCardProps/);
});

test("committed local helper round-trips through bindExtractedComponentInstances and generateToJSX", async () => {
  const src = `
    import { Badge } from '@/components/ui/badge';

    function StatusCard({ label = 'Active', note = 'OK' }) {
      return (
        <div className="p-4">
          <Badge variant="secondary">{label}</Badge>
          <p>{note}</p>
        </div>
      );
    }

    export default function Page() {
      return (
        <section>
          <StatusCard label="Ready" note="All systems go" />
        </section>
      );
    }
  `;

  const committed = parseCode(src, [], PAGE, { mode: "commit" });
  assert.ok(committed.ok, committed.ok ? "" : committed.diagnostic.message);
  if (!committed.ok) return;

  assert.equal(committed.extractedComponents.length, 1);
  const spec = committed.extractedComponents[0]!;
  assert.equal(committed.preamble.imports, "");
  assert.equal(committed.preamble.top, "");

  const bound = bindExtractedComponentInstances(
    committed.elements,
    committed.pendingInstances,
    new Map([["StatusCard", { pageId: "cp_status", rootId: spec.root.id }]]),
  );
  const nextCatalog = buildComponentCatalog([
    { pageId: "cp_status", name: "StatusCard", root: spec.root },
  ]);
  const regenerated = await codeGenerator.generateToJSX(bound, undefined, {
    tagIds: true,
    catalog: nextCatalog,
    preamble: committed.preamble,
  });
  assert.match(regenerated, /import \{ StatusCard \} from '@\/components\/StatusCard';/);
  assert.match(regenerated, /<StatusCard[^>]*label="Ready"[^>]*note="All systems go"/);
  assert.doesNotMatch(regenerated, /function StatusCard/);
});

test("'cp' master page supports Image src/alt, Button data-href, and rejects fragment roots", async () => {
  const mediaMaster = {
    id: "mm_root",
    type: "Section",
    pageId: "cp_banner",
    content: "",
    styles: {},
    settings: null,
    elements: [
      {
        id: "mm_img",
        type: "Image",
        pageId: "cp_banner",
        parentId: "mm_root",
        name: "Banner",
        content: "Hero image",
        src: "/hero.png",
        styles: {},
        settings: null,
      },
      {
        id: "mm_btn",
        type: "Button",
        pageId: "cp_banner",
        parentId: "mm_root",
        name: "Action",
        content: "Go",
        href: "/go",
        styles: {},
        settings: null,
      },
    ],
  } as unknown as EditorElement;

  const code = await codeGenerator.generateToJSX([mediaMaster], undefined, {
    tagIds: true,
    pageMeta: { isComponentPage: true, componentName: "HeroBanner" },
  });
  assert.match(code, /src=\{bannerSrc\}/);
  assert.match(code, /alt=\{bannerAlt\}/);
  assert.match(code, /data-href=\{actionHref\}/);

  const reparsed = parseCode(code.replace("/hero.png", "/next.png"), [mediaMaster], "cp_banner", {
    isComponentPage: true,
    componentName: "HeroBanner",
  });
  assert.ok(reparsed.ok, reparsed.ok ? "" : reparsed.diagnostic.message);
  if (!reparsed.ok) return;
  const kids = (reparsed.elements[0] as unknown as { elements: EditorElement[] }).elements;
  assert.equal(kids[0]?.src, "/next.png");
  assert.equal(kids[0]?.content, "Hero image");
  assert.equal(kids[1]?.href, "/go");
  assert.equal(kids[1]?.content, "Go");

  const fragmentMaster = parseCode(
    `export function Bad() { return <><div /></>; }\nexport default Bad;`,
    [],
    "cp_bad",
    { isComponentPage: true, componentName: "Bad" },
  );
  assert.equal(fragmentMaster.ok, false);
});

test("aliased project component import and props-object local helper parse cleanly", () => {
  const master = makeMaster();
  const catalog = buildComponentCatalog([{ pageId: "cp_card", name: "FeatureCard", root: master }]);
  const aliased = parseCode(
    `import { FeatureCard as CardBox } from '@/components/FeatureCard';\nexport default () => <CardBox title="Aliased" />;`,
    [],
    PAGE,
    { catalog },
  );
  assert.ok(aliased.ok, aliased.ok ? "" : aliased.diagnostic.message);
  if (aliased.ok) {
    assert.equal(componentSetting(aliased.elements[0]!)?.overrides?.m_title?.text, "Aliased");
  }

  const propsHelper = parseCode(
    `function TagPill(props: { label?: string }) { return <span>{props.label}</span>; }\nexport default () => <section><TagPill label="Beta" /></section>;`,
    [],
    PAGE,
    { mode: "commit" },
  );
  assert.ok(propsHelper.ok, propsHelper.ok ? "" : propsHelper.diagnostic.message);
  if (propsHelper.ok) {
    assert.ok(propsHelper.extractedComponents[0]?.propBindings.label);
  }
});
