import assert from "node:assert/strict";
import { test } from "node:test";
import type { LinkElement } from "../src/types/elements";
import type { EditorElement } from "../src/types/global.type";
import { previewLinkProps } from "../src/features/elements/lib/link-props";
import { replacePlaceholders } from "../src/features/elements/lib/replacePlaceholders";
import {
  projectCssToStyleTag,
  sanitizeProjectCss,
} from "../src/features/projects/lib/project-css";
import {
  isShareableSection,
  resolveSharedSections,
  sharedSectionSetting,
  sharedSectionSources,
} from "../src/features/projects/lib/shared-sections";

test("sanitizeProjectCss and projectCssToStyleTag strip unsafe markup while preserving valid styles", () => {
  assert.equal(sanitizeProjectCss(null), "");
  assert.equal(sanitizeProjectCss("   "), "");
  assert.equal(projectCssToStyleTag("   "), "");

  const legacy = [
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">',
    '<link rel="stylesheet" href="http://insecure.example.com/font.css">',
    "<script>alert(1)</script>",
    "<style>.hero { color: red; background: expression(1); }</style>",
    "<style>@import url('http://bad.example.com/x.css'); .safe { background: javascript:alert(1); }</style>",
  ].join("\n");

  const cleaned = sanitizeProjectCss(legacy);
  assert.match(cleaned, /@import url\("https:\/\/fonts\.googleapis\.com\/css2\?family=Inter"\);/);
  assert.match(cleaned, /\.hero \{ color: red; background: \(1\); \}/);
  assert.doesNotMatch(cleaned, /http:\/\/|<script|<\/style|expression\(|javascript:/i);

  assert.equal(projectCssToStyleTag("body { color: #111; }"), "<style>body { color: #111; }</style>");
  assert.equal(sanitizeProjectCss('<div class="x">.a { color: blue; }</div>'), ".a { color: blue; }");
});

test("previewLinkProps validates protocols, allowed targets, and rel attributes", () => {
  const link = (href: string | undefined, settings?: LinkElement["settings"]): LinkElement => ({
    id: "lnk-1",
    pageId: "p1",
    type: "Link",
    content: "Go",
    href,
    settings: settings ?? null,
  });

  assert.equal(previewLinkProps(link(undefined)), undefined);
  assert.equal(previewLinkProps(link("   ")), undefined);
  assert.equal(previewLinkProps(link("javascript:alert(1)")), undefined);
  assert.equal(previewLinkProps(link("data:text/html,hi")), undefined);

  assert.deepEqual(
    previewLinkProps(link("https://example.com/docs", { target: "_blank", rel: "opener sponsored", nofollow: true, noreferrer: true })),
    {
      href: "https://example.com/docs",
      target: "_blank",
      rel: "sponsored nofollow noreferrer noopener",
    },
  );
  assert.deepEqual(
    previewLinkProps(link("mailto:team@example.com")),
    { href: "mailto:team@example.com", target: undefined, rel: undefined },
  );
  assert.equal(
    previewLinkProps(link("/pricing", { target: "_invalid" as NonNullable<LinkElement["settings"]>["target"] }))?.target,
    undefined,
  );
});

test("replacePlaceholders resolves nested paths, date filters, and missing fields", () => {
  assert.equal(replacePlaceholders("Hello {{user.name}}", null), "Hello {{user.name}}");
  const data = { user: { name: "Ada", created: "2026-01-15T00:00:00Z" }, count: 3 };
  assert.equal(
    replacePlaceholders("Hi {{user.name}} ({{count}}), {{missing.key}}", data),
    "Hi Ada (3), {{missing.key}}",
  );
  const formatted = replacePlaceholders("Joined {{user.created|date}}", data);
  assert.ok(formatted.startsWith("Joined ") && !formatted.includes("{{"));
});

test("shared section helpers identify sources and resolve cross-page links once per source", () => {
  const sourceHeader: EditorElement = {
    id: "hdr-src",
    pageId: "home",
    type: "Header",
    content: "",
    settings: { sharedSection: { slot: "header" } },
    elements: [{ id: "nav", pageId: "home", type: "Text", content: "Nav" }],
  };
  const orphan: EditorElement = {
    id: "txt-1",
    pageId: "home",
    type: "Text",
    content: "Plain",
    settings: { sharedSection: { slot: "header" } },
  };
  const linkedAbout: EditorElement = {
    id: "about-hdr",
    pageId: "about",
    type: "Section",
    content: "",
    elements: [],
    settings: { sharedSection: { slot: "header", sourcePageId: "home", sourceId: "hdr-src" } },
  };
  const duplicateLink: EditorElement = {
    id: "about-hdr-2",
    pageId: "about",
    type: "Section",
    content: "Fallback",
    elements: [],
    settings: { sharedSection: { slot: "header", sourcePageId: "home", sourceId: "hdr-src" } },
  };
  const badSlot: EditorElement = {
    id: "about-ftr",
    pageId: "about",
    type: "Footer",
    content: "Footer",
    elements: [],
    settings: { sharedSection: { slot: "footer", sourcePageId: "home", sourceId: "hdr-src" } },
  };

  assert.equal(isShareableSection(sourceHeader), true);
  assert.equal(isShareableSection(orphan), false);
  assert.deepEqual(sharedSectionSetting(sourceHeader), { slot: "header" });
  assert.equal(sharedSectionSetting(orphan), undefined);

  const pageIds = new Set(["home", "about"]);
  const sources = sharedSectionSources([sourceHeader, linkedAbout, orphan], pageIds);
  assert.equal(sources.length, 1);
  assert.equal(sources[0].element.id, "hdr-src");

  const resolved = resolveSharedSections(
    [linkedAbout, duplicateLink, badSlot],
    [sourceHeader],
    pageIds,
  );
  assert.equal(resolved[0].type, "Header");
  assert.equal(resolved[0].id, "about-hdr");
  assert.equal(resolved[0].pageId, "about");
  assert.equal(resolved[1].content, "Fallback");
  assert.equal(resolved[2].type, "Footer");
});
