import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  clearTailwindSsrCache,
  compileProjectTailwindCss,
  getTailwindSsrCacheSize,
} from "@webbuilder/site-runtime/tailwind-ssr";
import {
  buildPreviewSessionCookie,
  readCookieFromHeader,
  resolveProjectAuthConfig,
  safePreviewCookieName,
} from "@webbuilder/site-runtime/supabase-auth";
import {
  SitePageView,
  type EditorElement,
  type LoadedSitePageData,
} from "@webbuilder/site-runtime";
import {
  buildDirectPreviewUrl,
  buildPreviewEnterUrl,
} from "../apps/editor/src/features/preview/api/preview-ticket.api";

test("compileProjectTailwindCss compiles utility classes during SSR and caches by class set", async () => {
  clearTailwindSsrCache();
  assert.equal(getTailwindSsrCacheSize(), 0);

  const emptyCss = await compileProjectTailwindCss([]);
  assert.equal(emptyCss, "");
  assert.equal(getTailwindSsrCacheSize(), 0);

  const elements: EditorElement[] = [
    {
      id: "hero",
      pageId: "p1",
      type: "Section",
      content: "",
      tailwindStyles: "bg-slate-900 text-white px-6 py-12",
      elements: [
        {
          id: "title",
          pageId: "p1",
          type: "Heading",
          content: "Hello SSR",
          tailwindStyles: "text-3xl font-bold tracking-tight",
        },
      ],
    },
  ];

  const css1 = await compileProjectTailwindCss(elements);
  assert.match(css1, /\.bg-slate-900\b/);
  assert.match(css1, /\.text-3xl\b/);
  assert.match(css1, /\.px-6\b/);
  assert.equal(getTailwindSsrCacheSize(), 1);

  const css2 = await compileProjectTailwindCss(elements);
  assert.equal(css2, css1);
  assert.equal(getTailwindSsrCacheSize(), 1);
});

test("SitePageView renders precompiled SSR Tailwind CSS inline without client compiler", () => {
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
    page: {
      id: "pg-1",
      projectId: "proj-1",
      name: "Home",
      slug: "",
      type: "sp",
      createdAt: "2026-11-26T00:00:00Z",
      updatedAt: "2026-11-26T00:00:00Z",
    },
    pages: [
      {
        id: "pg-1",
        projectId: "proj-1",
        name: "Home",
        slug: "",
        type: "sp",
        createdAt: "2026-11-26T00:00:00Z",
        updatedAt: "2026-11-26T00:00:00Z",
      },
    ],
    elements: [
      {
        id: "t1",
        pageId: "pg-1",
        type: "Text",
        content: "Zero FOUC",
        tailwindStyles: "text-emerald-600",
      },
    ],
    generatedCss: ".text-emerald-600{color:#059669}",
  };

  const html = renderToStaticMarkup(
    createElement(SitePageView, {
      data,
      mode: { kind: "domain", subdomain: "demo" },
    }),
  );
  assert.match(html, /\.text-emerald-600\{color:#059669\}/);
  assert.match(html, /Zero FOUC/);
});

test("preview session cookies and launch URLs enforce HttpOnly, scoping, and open-redirect sanitization", () => {
  const cookie = buildPreviewSessionCookie("proj_42", "tok-secret", 900, true);
  assert.match(cookie, /^wb_preview_proj_42=tok-secret;/);
  assert.match(cookie, /\bHttpOnly\b/);
  assert.match(cookie, /\bSameSite=Lax\b/);
  assert.match(cookie, /\bSecure\b/);
  assert.match(cookie, /\bMax-Age=900\b/);

  const parsed = readCookieFromHeader(
    `other=1; ${safePreviewCookieName("proj_42")}=tok-secret; third=3`,
    safePreviewCookieName("proj_42"),
  );
  assert.equal(parsed, "tok-secret");

  assert.equal(
    buildPreviewEnterUrl("https://preview.example.com/", "proj_42", "tkt-1", "/docs/intro"),
    "https://preview.example.com/api/preview/enter?ticket=tkt-1&projectId=proj_42&next=%2Fdocs%2Fintro",
  );
  assert.equal(
    buildPreviewEnterUrl("https://preview.example.com", "proj_42", "tkt-1", "//evil.com/steal"),
    "https://preview.example.com/api/preview/enter?ticket=tkt-1&projectId=proj_42&next=%2F",
  );
  assert.equal(
    buildDirectPreviewUrl("https://preview.example.com/", "proj_42", "/about"),
    "https://preview.example.com/preview/proj_42/about",
  );
});

test("resolveProjectAuthConfig prefers draft preview project over public read and handles missing configs", async () => {
  const draftCfg = {
    provider: "supabase",
    supabaseUrl: "https://draft-app.supabase.co",
    supabaseAnonKey: "sb_publishable_draft",
  };
  const publicCfg = {
    provider: "supabase",
    supabaseUrl: "https://live-app.supabase.co",
    supabaseAnonKey: "sb_publishable_live",
  };

  const fromDraft = await resolveProjectAuthConfig(
    async () => ({ authConfig: publicCfg }),
    async () => ({ authConfig: draftCfg }),
  );
  assert.equal(fromDraft?.supabaseUrl, "https://draft-app.supabase.co");

  const fallbackPublic = await resolveProjectAuthConfig(
    async () => ({ authConfig: publicCfg }),
    async () => {
      throw new Error("expired preview token");
    },
  );
  assert.equal(fallbackPublic?.supabaseUrl, "https://live-app.supabase.co");

  const missing = await resolveProjectAuthConfig(async () => {
    throw new Error("not found");
  });
  assert.equal(missing, null);
});
