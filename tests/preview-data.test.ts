import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement, type ComponentProps } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PreviewElementLoader from "../src/features/preview/components/PreviewElementLoader";
import { ApiError } from "../src/services/api-error";
import { loadPreviewData } from "../src/features/preview/lib/preview-data";
import type { ApiPage } from "../src/features/projects/services/project.service";
import type { EditorElement } from "../src/types/global.type";

const missing = new ApiError("Project not found", 404, "not_found");
const denied = new ApiError("Access denied", 403, "forbidden");
const project = { id: "example", name: "Example", published: false } as Awaited<
  ReturnType<Parameters<typeof loadPreviewData>[1]["project"]>
>;

const pages = [
  { id: "pricing", name: "Pricing" },
  { id: "home", name: "" },
  { id: "empty", name: "Empty" },
].map((page): ApiPage => ({
  projectId: "example", type: "sp", createdAt: "", updatedAt: "", ...page,
}));
const elements: EditorElement[] = [
  { id: "home-content", pageId: "home", type: "Text", content: "Home content" },
  { id: "pricing-content", pageId: "pricing", type: "Text", content: "Pricing content" },
];

function source({ draft = false, token, privateError }: {
  draft?: boolean;
  token?: string;
  privateError?: ApiError;
} = {}) {
  const calls: string[] = [];
  const reads: Parameters<typeof loadPreviewData>[1] = {
    draftToken: async () => { calls.push("session"); return token; },
    project: async (_id, token) => {
      calls.push(token ? "private project" : "public project");
      if (!token && draft) throw missing;
      if (token && privateError) throw privateError;
      return project;
    },
    pages: async (_id, token) => {
      calls.push(token ? "private pages" : "public pages");
      return pages;
    },
    elements: async (_id, token) => {
      calls.push(token ? "private elements" : "public elements");
      return elements;
    },
  };
  return { calls, reads };
}

test("authorized users can preview a draft after the public lookup returns 404", async () => {
  const { calls, reads } = source({ draft: true, token: "test-session" });
  assert.equal((await loadPreviewData("example", reads)).project, project);
  assert.deepEqual(calls, ["public project", "session", "private project", "private pages", "private elements"]);
});

test("unauthorized users receive no draft preview data", async () => {
  for (const token of [undefined, "test-session"]) {
    const { calls, reads } = source({ draft: true, token, privateError: denied });
    await assert.rejects(loadPreviewData("example", reads), missing);
    assert.deepEqual(calls, token ? ["public project", "session", "private project"] : ["public project", "session"]);
  }
});

test("published previews load without a session", async () => {
  const { calls, reads } = source();
  assert.equal((await loadPreviewData("example", reads)).project, project);
  assert.deepEqual(calls, ["public project", "public pages", "public elements"]);
});

test("the project preview defaults to the home page and renders only its elements", async () => {
  const { reads } = source();
  const data = await loadPreviewData("example", reads);
  assert.equal(data.page.id, "home");
  assert.deepEqual(data.elements.map((element) => element.id), ["home-content"]);
});

test("a page-specific preview renders only that page, even if it is empty", async () => {
  const { reads } = source();
  const pricing = await loadPreviewData("example", reads, "pricing");
  assert.equal(pricing.page.id, "pricing");
  assert.deepEqual(pricing.elements.map((element) => element.id), ["pricing-content"]);
  const empty = await loadPreviewData("example", reads, "empty");
  assert.deepEqual(empty.elements, []);
});

test("an unknown page ID does not fall back to another page", async () => {
  const { calls, reads } = source();
  await assert.rejects(loadPreviewData("example", reads, "another-project-page"), { status: 404 });
  assert.deepEqual(calls, ["public project", "public pages"]);
});

test("linked headers and footers render current source content on other pages", async () => {
  const navigation = {
    type: "Link", id: "shop-nav", pageId: "home", content: "Shop menu", href: "?page=pricing",
  } as const;
  const header: EditorElement = {
    type: "Header", id: "shop-header", pageId: "home", content: "",
    settings: { sharedSection: { slot: "header" } }, elements: [navigation],
  };
  const footer: EditorElement = {
    type: "Footer", id: "shop-footer", pageId: "home", content: "",
    settings: { sharedSection: { slot: "footer" } },
    elements: [{ type: "Text", id: "footer-copy", pageId: "home", content: "Open daily" }],
  };
  const linked = (pageId: string, sourceId: string, slot: string): EditorElement => ({
    type: "Section", id: `${pageId}-${slot}`, pageId, content: "",
    settings: { sharedSection: { slot, sourceId, sourcePageId: "home" } },
    elements: [{ type: "Text", id: `${pageId}-old-${slot}`, pageId, content: "Local fallback" }],
  });
  const saved = [
    header, footer, linked("pricing", header.id, "header"), elements[1],
    linked("pricing", footer.id, "footer"), linked("empty", header.id, "header"),
  ];
  const { reads } = source();
  reads.elements = async () => saved;
  const pricing = await loadPreviewData("example", reads, "pricing");
  const visit = await loadPreviewData("example", reads, "empty");
  assert.deepEqual(pricing.elements.map((element) => element.id), [
    "pricing-header", "pricing-content", "pricing-footer",
  ]);
  for (const page of [pricing, visit]) {
    const shared = page.elements[0];
    assert.equal(shared.type, "Header");
    assert.equal(shared.elements[0].content, "Shop menu");
    assert.equal(shared.elements[0].href, "?page=pricing");
  }
  const sharedFooter = pricing.elements[2];
  assert.equal(sharedFooter.type, "Footer");
  assert.equal(sharedFooter.elements[0].content, "Open daily");
  assert.equal((await loadPreviewData("example", reads, "home")).elements[0], header);

  saved[0] = { ...header, elements: [{ ...navigation, content: "Updated menu" }] };
  for (const pageId of ["pricing", "empty"]) {
    const shared = (await loadPreviewData("example", reads, pageId)).elements[0];
    assert.equal(shared.type, "Header");
    assert.equal(shared.elements[0].content, "Updated menu");
  }

  saved.splice(0, 1);
  const fallback = (await loadPreviewData("example", reads, "pricing")).elements[0];
  assert.equal(fallback.type, "Section");
  assert.equal(fallback.elements[0].content, "Local fallback");
});

test("published preview resolves linked masters without exposing a component route", async () => {
  const { reads } = source();
  reads.elements = async () => [
    { id: "instance", pageId: "home", type: "Text", content: "", settings: { component: { pageId: "master", rootId: "root" } } },
    { id: "root", pageId: "master", type: "Text", content: "Master text" },
  ];
  assert.equal((await loadPreviewData("example", reads)).elements[0]?.content, "Master text");
  await assert.rejects(loadPreviewData("example", reads, "master"), { status: 404 });
  reads.pages = async () => [{ ...pages[0], id: "master", name: "", type: "cp" }, ...pages];
  assert.equal((await loadPreviewData("example", reads)).page.id, "home");
  await assert.rejects(loadPreviewData("example", reads, "master"), { status: 404 });
});

test("preview cannot expand a link to a regular page or deleted master", async () => {
  const { reads } = source();
  reads.pages = async () => [...pages, { ...pages[0], id: "deleted-master", type: "cp", deletedAt: "2026-11-18" }];
  reads.elements = async () => [
    { id: "wrong", pageId: "home", type: "Text", content: "", settings: { component: { pageId: "pricing", rootId: "pricing-content" } } },
    { id: "missing", pageId: "home", type: "Text", content: "", settings: { component: { pageId: "deleted-master", rootId: "deleted-root" } } },
    { id: "deleted-root", pageId: "deleted-master", type: "Text", content: "Deleted component" },
    ...elements,
  ];
  assert.deepEqual((await loadPreviewData("example", reads)).elements.map(({ id }) => id), ["home-content"]);
});

test("published component markup renders scoped heading IDs and sanitized overrides", async () => {
  const master: EditorElement = { id: "root", pageId: "master", type: "Section", content: "", elements: [
    { id: "heading", pageId: "master", type: "Heading", content: "Original", settings: { level: 3 } },
  ] };
  const linked: EditorElement = {
    id: "instance", pageId: "home", type: "Section", content: "", elements: [],
    settings: { component: { pageId: "master", rootId: "root", overrides: {
      heading: { text: "<strong>Updated</strong><script>bad()</script>" },
    } } },
  };
  const { reads } = source();
  reads.elements = async () => [master, linked];
  const { elements: rendered } = await loadPreviewData("example", reads);
  const markup = renderToStaticMarkup(createElement<NonNullable<ComponentProps<typeof PreviewElementLoader>>>(PreviewElementLoader, { elements: rendered }));
  assert.match(markup, /<h3 id="instance~heading" data-element-id="instance~heading"><strong>Updated<\/strong><\/h3>/);
  assert.doesNotMatch(markup, /<script|Original/);
});
