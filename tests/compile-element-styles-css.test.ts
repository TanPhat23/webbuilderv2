import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  PreviewElementLoader,
  SitePageView,
  compileElementStylesCss as compileFromIndex,
  type EditorElement,
  type LoadedSitePageData,
} from "@webbuilder/site-runtime";
import { compileElementStylesCss } from "@webbuilder/site-runtime/elements/lib/compileElementStylesCss";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";

function makeElement(
  id: string,
  styles: EditorElement["styles"],
  children?: EditorElement[],
): EditorElement {
  if (children) {
    return {
      id,
      type: "Frame",
      content: "",
      pageId: "p1",
      styles,
      elements: children,
    };
  }
  return {
    id,
    type: "Text",
    content: "Hi",
    pageId: "p1",
    styles,
  };
}

test("emits base and mobile-first min-width media queries in order", () => {
  const css = compileElementStylesCss([
    makeElement("hero-1", {
      default: { width: 320, opacity: 0.8, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
      sm: { width: "600px" },
      md: { paddingTop: 24, zIndex: 10 },
      lg: { width: "960px" },
      xl: { width: "1200px" },
    }),
  ]);

  const defaultIdx = css.indexOf('[data-element-id="hero-1"]{width:320px;opacity:0.8;box-shadow:0 2px 8px rgba(0,0,0,0.12);}');
  const smIdx = css.indexOf('@media (min-width: 640px){[data-element-id="hero-1"]{width:600px;}}');
  const mdIdx = css.indexOf('@media (min-width: 768px){[data-element-id="hero-1"]{padding-top:24px;z-index:10;}}');
  const lgIdx = css.indexOf('@media (min-width: 1024px){[data-element-id="hero-1"]{width:960px;}}');
  const xlIdx = css.indexOf('@media (min-width: 1280px){[data-element-id="hero-1"]{width:1200px;}}');

  assert.ok(defaultIdx >= 0, `missing default rule in: ${css}`);
  assert.ok(defaultIdx < smIdx && smIdx < mdIdx && mdIdx < lgIdx && lgIdx < xlIdx);
});

test("walks nested container children and deduplicates repeated ids", () => {
  const child = makeElement("btn:1", { default: { height: 44 } });
  const duplicateChild = makeElement("btn:1", { default: { height: 99 } });
  const root = makeElement("sec-1", { default: { gap: 16 } }, [child, duplicateChild]);
  const css = compileElementStylesCss([root]);

  assert.ok(css.includes('[data-element-id="sec-1"]{gap:16px;}'));
  assert.ok(css.includes('[data-element-id="btn:1"]{height:44px;}'));
  assert.ok(!css.includes("99px"));
});

test("rejects CSS breakout, style-tag breakout, javascript urls, and prototype keys", () => {
  const protoStyles = Object.create({ injected: "999px" }) as Record<string, unknown>;
  protoStyles.color = "red; } body { display: none } /*";
  protoStyles.backgroundImage = "url(javascript:alert(1))";
  protoStyles.content = "</style><script>alert(1)</script>";
  protoStyles.paddingLeft = "12px";

  const css = compileElementStylesCss([
    makeElement("safe-1", {
      default: protoStyles as NonNullable<EditorElement["styles"]>["default"],
    }),
  ]);

  assert.equal(css, '[data-element-id="safe-1"]{padding-left:12px;}');
  assert.ok(!css.includes("display: none"));
  assert.ok(!css.includes("javascript:"));
  assert.ok(!css.includes("</style"));
  assert.ok(!css.includes("injected"));
});

test("rejects unclosed comments, unbalanced quotes, and trailing backslashes while preserving valid quoted values", () => {
  const css = compileElementStylesCss([
    makeElement("quote-1", {
      default: {
        color: "red /*",
        borderColor: "*/",
        content: '"unclosed',
        backgroundColor: "'unclosed",
        outlineColor: "red\\",
        fontFamily: '"Inter", sans-serif',
        backgroundImage: 'url("https://example.com/bg.jpg")',
      },
    }),
  ]);

  assert.equal(
    css,
    '[data-element-id="quote-1"]{font-family:"Inter", sans-serif;background-image:url("https://example.com/bg.jpg");}',
  );
  assert.ok(!css.includes("/*"));
  assert.ok(!css.includes("*/"));
  assert.ok(!css.includes("unclosed"));
  assert.ok(!css.includes("red\\"));
});

test("handles unitless properties, zero, non-finite numbers, empty input, and runtime exports", () => {
  assert.equal(compileElementStylesCss(undefined), "");
  assert.equal(compileElementStylesCss([]), "");
  assert.equal(compileFromIndex, compileElementStylesCss);
  assert.equal(elementUtils.compileElementStylesCss, compileElementStylesCss);

  const css = compileElementStylesCss([
    makeElement("num-1", {
      default: {
        margin: 0,
        fontWeight: 600,
        lineHeight: 1.5,
        width: Number.NaN,
        height: Number.POSITIVE_INFINITY,
      },
    }),
  ]);

  assert.equal(css, '[data-element-id="num-1"]{margin:0;font-weight:600;line-height:1.5;}');
});

test("getSafeStyles returns {} and PreviewElementLoader omits inline style while SitePageView emits @media CSS", () => {
  const el = makeElement("box-1", {
    default: { width: 300 },
    md: { width: 700 },
  });

  assert.deepEqual(elementUtils.getSafeStyles(el), {});

  const loaderHtml = renderToStaticMarkup(
    createElement(PreviewElementLoader, { elements: [el] }),
  );
  assert.ok(loaderHtml.includes('data-element-id="box-1"'));
  assert.ok(!loaderHtml.includes("style="), `unexpected inline style in: ${loaderHtml}`);

  const page = {
    id: "pg-1",
    projectId: "proj-1",
    name: "Home",
    slug: "",
    type: "sp" as const,
    createdAt: "2026-11-26T00:00:00Z",
    updatedAt: "2026-11-26T00:00:00Z",
  };
  const data: LoadedSitePageData = {
    project: {
      id: "proj-1",
      name: "Demo",
      ownerId: "owner-1",
      published: true,
      createdAt: "2026-11-26T00:00:00Z",
      updatedAt: "2026-11-26T00:00:00Z",
      views: 0,
    },
    page,
    pages: [page],
    elements: [el],
    generatedCss: "",
  };

  const pageHtml = renderToStaticMarkup(
    createElement(SitePageView, {
      data,
      mode: { kind: "domain", subdomain: "demo" },
    }),
  );
  assert.ok(pageHtml.includes('[data-element-id="box-1"]{width:300px;}'));
  assert.ok(pageHtml.includes('@media (min-width: 768px){[data-element-id="box-1"]{width:700px;}}'));
});

test("element id selectors escape only quotes, backslashes and control chars, identically with or without CSS.escape", () => {
  const elements = [
    makeElement('a"b\\c]d e.f:g', { default: { color: "red" } }),
    makeElement("line\nbreak", { default: { color: "blue" } }),
  ];
  const expected = [
    '[data-element-id="a\\"b\\\\c]d e.f:g"]{color:red;}',
    '[data-element-id="line\\a break"]{color:blue;}',
  ].join("");

  const withoutCss = compileElementStylesCss(elements);
  assert.equal(withoutCss, expected);

  const globals = globalThis as { CSS?: unknown };
  const hadCss = Object.hasOwn(globals, "CSS");
  const previous = globals.CSS;
  globals.CSS = { escape: (value: string): string => `ESCAPED(${value})` };
  try {
    assert.equal(compileElementStylesCss(elements), withoutCss, "browser CSS.escape must not change the output");
  } finally {
    if (hadCss) globals.CSS = previous;
    else delete globals.CSS;
  }

  const plain = compileElementStylesCss([makeElement("el-1_ok", { default: { color: "red" } })]);
  assert.equal(plain, '[data-element-id="el-1_ok"]{color:red;}');
});
