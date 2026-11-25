import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PreviewElementLoader from "../src/features/preview/components/PreviewElementLoader";
import { SiteNavigationProvider } from "../src/features/elements/context/SiteNavigationContext";
import { fetchSubdomainSite } from "../src/features/preview/lib/preview-data";
import {
  buildPublicSiteUrl,
  effectivePageSlug,
  extractSubdomain,
  interpolateHref,
  isValidSubdomainLabel,
  resolveRoutePage,
  resolveSiteHref,
  slugifyPageName,
  validatePageSlugPattern,
} from "../src/lib/site-routing";
import type { ApiPage } from "../src/features/projects/services/project.service";
import { ApiError } from "../src/utils/errors/api-error";

const pages: ApiPage[] = [
  { id: "p-home", projectId: "proj-1", name: "Home", slug: "", type: "sp", createdAt: "", updatedAt: "" },
  { id: "p-menu", projectId: "proj-1", name: "Menu", slug: "menu", type: "sp", createdAt: "", updatedAt: "" },
  { id: "p-story", projectId: "proj-1", name: "Our Story", slug: "our-story", type: "sp", createdAt: "", updatedAt: "" },
  { id: "p-blog", projectId: "proj-1", name: "Journal", slug: "journal", type: "dp", createdAt: "", updatedAt: "" },
];

test("extractSubdomain parses localhost subdomains, custom app hosts, and rejects root/reserved/IPs", () => {
  assert.equal(extractSubdomain("glaze.localhost:3000"), "glaze");
  assert.equal(extractSubdomain("Glaze-And-Crumb.localhost:3000"), "glaze-and-crumb");
  assert.equal(extractSubdomain("localhost:3000"), null);
  assert.equal(extractSubdomain("www.localhost:3000"), null);
  assert.equal(extractSubdomain("127.0.0.1:3000"), null);

  const hosts = ["webbuilder.app"];
  assert.equal(extractSubdomain("glaze.webbuilder.app", hosts), "glaze");
  assert.equal(extractSubdomain("webbuilder.app", hosts), null);
  assert.equal(extractSubdomain("www.webbuilder.app", hosts), null);
  assert.equal(extractSubdomain("api.webbuilder.app", hosts), null);
  assert.equal(extractSubdomain("a.b.webbuilder.app", hosts), null);
  assert.equal(extractSubdomain("other-host.vercel.app", hosts), null);
});

test("isValidSubdomainLabel enforces DNS label bounds and reserved list", () => {
  assert.equal(isValidSubdomainLabel("glaze"), true);
  assert.equal(isValidSubdomainLabel("glaze-and-crumb"), true);
  assert.equal(isValidSubdomainLabel("ab"), false);
  assert.equal(isValidSubdomainLabel("-glaze"), false);
  assert.equal(isValidSubdomainLabel("glaze-"), false);
  assert.equal(isValidSubdomainLabel("glaze--crumb"), false);
  assert.equal(isValidSubdomainLabel("preview"), false);
});

test("slugifyPageName and resolveRoutePage resolve root, slugs, page IDs, and dynamic pages", () => {
  assert.equal(slugifyPageName("Home"), "");
  assert.equal(slugifyPageName(""), "");
  assert.equal(slugifyPageName("Our Story!"), "our-story");
  assert.equal(effectivePageSlug({ name: "Our Story", slug: undefined }), "our-story");
  assert.equal(effectivePageSlug({ name: "Our Story", slug: "custom-story" }), "custom-story");

  assert.equal(resolveRoutePage(pages)?.page.id, "p-home");
  assert.equal(resolveRoutePage(pages, "")?.page.id, "p-home");
  assert.equal(resolveRoutePage(pages, "p-menu")?.page.id, "p-menu");
  assert.equal(resolveRoutePage(pages, "/Our-Story/")?.page.id, "p-story");

  const dynamic = resolveRoutePage(pages, "/journal/morning-croissant");
  assert.equal(dynamic?.page.id, "p-blog");
  assert.equal(dynamic?.itemSlug, "morning-croissant");

  assert.equal(resolveRoutePage(pages, "nonexistent-route"), null);
});

test("resolveSiteHref rewrites ?page=<id> and internal paths cleanly for both preview and domain modes", () => {
  const previewCtx = { mode: { kind: "preview" as const, projectId: "proj-1" }, pages };
  const domainCtx = { mode: { kind: "domain" as const, subdomain: "glaze" }, pages };

  assert.equal(resolveSiteHref("?page=p-home", previewCtx)?.href, "/preview/proj-1");
  assert.equal(resolveSiteHref("?page=p-story", previewCtx)?.href, "/preview/proj-1/our-story");
  assert.equal(resolveSiteHref("/preview/proj-1/our-story", previewCtx)?.href, "/preview/proj-1/our-story");
  assert.equal(resolveSiteHref("/menu", previewCtx)?.href, "/preview/proj-1/menu");

  assert.equal(resolveSiteHref("?page=p-home", domainCtx)?.href, "/");
  assert.equal(resolveSiteHref("?page=p-story", domainCtx)?.href, "/our-story");
  assert.equal(resolveSiteHref("/menu#donuts", domainCtx)?.href, "/menu#donuts");
  assert.equal(resolveSiteHref("https://example.com", domainCtx)?.kind, "external");
  assert.equal(resolveSiteHref("#hours", domainCtx)?.kind, "anchor");
});

test("buildPublicSiteUrl constructs local and configured domain URLs", () => {
  assert.equal(
    buildPublicSiteUrl("glaze", "/our-story", { currentOrigin: "http://localhost:3000", siteDomain: "" }),
    "http://glaze.localhost:3000/our-story",
  );
  assert.equal(
    buildPublicSiteUrl("glaze", "/", { siteDomain: "webbuilder.app" }),
    "https://glaze.webbuilder.app",
  );
});

test("PreviewElementLoader rewrites ?page links via SiteNavigationProvider in both preview and domain modes", () => {
  const elements = [
    { id: "lnk", pageId: "p-home", type: "Link" as const, content: "Our Story", href: "?page=p-story" },
  ];
  const html = renderToStaticMarkup(
    createElement(
      SiteNavigationProvider,
      {
        value: {
          mode: { kind: "domain", subdomain: "glaze" },
          pages,
          currentPath: "/",
          navigate: () => {},
        },
      },
      createElement(PreviewElementLoader, { elements }),
    ),
  );
  assert.match(html, /href="\/our-story"/);
});

test("fetchSubdomainSite resolves published subdomain project pages and rejects unknown routes", async () => {
  const project = {
    id: "proj-1",
    name: "Glaze",
    ownerId: "u1",
    published: true,
    subdomain: "glaze",
    createdAt: "2026-11-24T00:00:00Z",
    updatedAt: "2026-11-24T00:00:00Z",
    views: 0,
  };
  const reads = {
    projectBySubdomain: async () => project,
    pages: async () => pages,
    elements: async () => [
      { id: "el-1", pageId: "p-story", type: "Text" as const, content: "Story body" },
    ],
  };

  const story = await fetchSubdomainSite("glaze", reads, "/our-story");
  assert.equal(story.page.id, "p-story");
  assert.deepEqual(story.elements.map((e) => e.id), ["el-1"]);

  await assert.rejects(
    fetchSubdomainSite("glaze", reads, "/does-not-exist"),
    (err: unknown) => err instanceof ApiError && err.status === 404,
  );
});

test("resolveRoutePage supports :param patterns, catch-all * routes, and specificity precedence", () => {
  const dynamicPages: ApiPage[] = [
    { id: "p-home", projectId: "proj-1", name: "Home", slug: "", type: "sp", createdAt: "", updatedAt: "" },
    { id: "p-static-doc", projectId: "proj-1", name: "Intro", slug: "docs/intro", type: "sp", createdAt: "", updatedAt: "" },
    { id: "p-post", projectId: "proj-1", name: "Post", slug: "blog/:slug", type: "dp", contentTypeId: "ct-blog", createdAt: "", updatedAt: "" },
    { id: "p-shop", projectId: "proj-1", name: "Product", slug: "shop/:category/:slug", type: "dp", createdAt: "", updatedAt: "" },
    { id: "p-docs-catch", projectId: "proj-1", name: "Docs", slug: "docs/*path", type: "dp", createdAt: "", updatedAt: "" },
    { id: "p-root-catch", projectId: "proj-1", name: "Fallback", slug: "*", type: "dp", createdAt: "", updatedAt: "" },
  ];

  // Exact static route beats catch-all
  const staticHit = resolveRoutePage(dynamicPages, "/docs/intro");
  assert.equal(staticHit?.page.id, "p-static-doc");
  assert.deepEqual(staticHit?.params, {});

  // Single :param route
  const postHit = resolveRoutePage(dynamicPages, "/blog/hello-world");
  assert.equal(postHit?.page.id, "p-post");
  assert.deepEqual(postHit?.params, { slug: "hello-world" });
  assert.equal(postHit?.itemSlug, "hello-world");

  // Multi-segment :param route
  const shopHit = resolveRoutePage(dynamicPages, "/shop/shoes/air-max");
  assert.equal(shopHit?.page.id, "p-shop");
  assert.deepEqual(shopHit?.params, { category: "shoes", slug: "air-max" });
  assert.equal(shopHit?.itemSlug, "air-max");

  // Prefixed catch-all beats root catch-all
  const docsHit = resolveRoutePage(dynamicPages, "/docs/guides/routing/dynamic");
  assert.equal(docsHit?.page.id, "p-docs-catch");
  assert.deepEqual(docsHit?.params, { path: "guides/routing/dynamic" });
  assert.equal(docsHit?.itemSlug, "guides/routing/dynamic");

  // Root catch-all matches any remaining unknown path
  const fallbackHit = resolveRoutePage(dynamicPages, "/anything/at/all");
  assert.equal(fallbackHit?.page.id, "p-root-catch");
  assert.deepEqual(fallbackHit?.params, { "*": "anything/at/all" });
  assert.equal(fallbackHit?.itemSlug, "anything/at/all");
});

test("validatePageSlugPattern enforces static, :param, and trailing *catchall rules", () => {
  assert.deepEqual(validatePageSlugPattern("/blog/:slug/", true), {
    valid: true,
    normalized: "blog/:slug",
  });
  assert.deepEqual(validatePageSlugPattern("/docs/*path", true), {
    valid: true,
    normalized: "docs/*path",
  });
  assert.deepEqual(validatePageSlugPattern("*", true), {
    valid: true,
    normalized: "*",
  });
  assert.equal(validatePageSlugPattern("blog/:slug", false).valid, false);
  assert.equal(validatePageSlugPattern("*", false).valid, false);
  assert.equal(validatePageSlugPattern("docs/*path/edit", true).valid, false);
  assert.equal(validatePageSlugPattern("blog/:slug/:slug", true).valid, false);
});

test("interpolateHref and PreviewElementLoader resolve dynamic CMS item links", () => {
  assert.equal(
    interpolateHref("/blog/{{slug}}", { slug: "hello-world" }),
    "/blog/hello-world",
  );
  assert.equal(
    interpolateHref("/shop/:category/:slug", { category: "shoes" }, { slug: "air-max" }),
    "/shop/shoes/air-max",
  );

  const elements = [
    { id: "lnk", pageId: "p-home", type: "Link" as const, content: "Read {{title}}", href: "/journal/{{slug}}" },
  ];
  const html = renderToStaticMarkup(
    createElement(
      SiteNavigationProvider,
      {
        value: {
          mode: { kind: "domain", subdomain: "glaze" },
          pages,
          currentPath: "/",
          navigate: () => {},
        },
      },
      createElement(PreviewElementLoader, {
        elements,
        data: { title: "Morning Croissant", slug: "morning-croissant" },
      }),
    ),
  );
  assert.match(html, /href="\/journal\/morning-croissant"/);
  assert.match(html, /Read Morning Croissant/);
});
