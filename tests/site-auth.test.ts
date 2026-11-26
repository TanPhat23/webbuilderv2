import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import PreviewElementLoader from "../src/features/preview/components/PreviewElementLoader";
import { SiteNavigationProvider } from "../src/features/elements/context/SiteNavigationContext";
import {
  AuthRedirectError,
  fetchPreviewSite,
  fetchSubdomainSite,
} from "../src/features/preview/lib/preview-data";
import {
  buildLoginRedirectHref,
  parseProjectAuthConfig,
  sanitizeRedirectPath,
  shouldRenderForAuthVisibility,
  validateSupabaseAnonKey,
  validateSupabaseUrl,
} from "../src/lib/site-auth";
import type { ApiPage } from "../src/features/projects/services/project.service";
import type { EditorElement } from "../src/types/global.type";

function makeJwt(role: string): string {
  const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const p = Buffer.from(JSON.stringify({ role, iss: "supabase" })).toString("base64url");
  return `${h}.${p}.signature`;
}

test("validateSupabaseUrl enforces strict HTTPS *.supabase.co/.in whitelist", () => {
  assert.deepEqual(validateSupabaseUrl("https://MyApp123.supabase.co/"), {
    valid: true,
    normalized: "https://myapp123.supabase.co",
  });
  assert.deepEqual(validateSupabaseUrl("https://demo.supabase.in"), {
    valid: true,
    normalized: "https://demo.supabase.in",
  });
  for (const bad of [
    "",
    "http://demo.supabase.co",
    "https://localhost",
    "https://169.254.169.254",
    "https://evil.example.com",
    "https://demo.supabase.co:8443",
    "https://demo.supabase.co/auth/v1",
    "https://user:pass@demo.supabase.co",
  ]) {
    assert.equal(validateSupabaseUrl(bad).valid, false, `must reject ${bad}`);
  }
});

test("validateSupabaseAnonKey accepts publishable/anon keys and rejects secret/service_role keys", () => {
  assert.equal(validateSupabaseAnonKey("sb_publishable_abc123").valid, true);
  assert.equal(validateSupabaseAnonKey(makeJwt("anon")).valid, true);

  assert.equal(validateSupabaseAnonKey("sb_secret_xyz").valid, false);
  assert.equal(validateSupabaseAnonKey(makeJwt("service_role")).valid, false);
  assert.equal(validateSupabaseAnonKey("has space").valid, false);
  assert.equal(validateSupabaseAnonKey("").valid, false);
});

test("sanitizeRedirectPath and buildLoginRedirectHref block open redirects and loops", () => {
  assert.equal(sanitizeRedirectPath("/dashboard?tab=1"), "/dashboard?tab=1");
  assert.equal(sanitizeRedirectPath("//evil.com/phish", "/"), "/");
  assert.equal(sanitizeRedirectPath("https://evil.com", "/"), "/");
  assert.equal(sanitizeRedirectPath("/bad\\path", "/"), "/");

  assert.equal(
    buildLoginRedirectHref({ kind: "domain", subdomain: "acme" }, "/login", "/dashboard"),
    "/login?next=%2Fdashboard",
  );
  assert.equal(
    buildLoginRedirectHref({ kind: "preview", projectId: "p1" }, "/login", "/dashboard"),
    "/preview/p1/login?next=%2Fpreview%2Fp1%2Fdashboard",
  );
  // No redirect loop when already on /login
  assert.equal(
    buildLoginRedirectHref({ kind: "domain", subdomain: "acme" }, "/login", "/login"),
    "/login",
  );

  const parsed = parseProjectAuthConfig({
    provider: "supabase",
    supabaseUrl: "https://demo.supabase.co",
    supabaseAnonKey: "sb_publishable_123",
  });
  assert.deepEqual(parsed, {
    provider: "supabase",
    supabaseUrl: "https://demo.supabase.co",
    supabaseAnonKey: "sb_publishable_123",
    loginPath: "/login",
    afterLoginPath: "/",
  });
});

test("PreviewElementLoader enforces authVisibility and interpolates {{user.*}} + submit button types", () => {
  assert.equal(shouldRenderForAuthVisibility("authenticated", true), true);
  assert.equal(shouldRenderForAuthVisibility("authenticated", false), false);
  assert.equal(shouldRenderForAuthVisibility("guest", false), true);
  assert.equal(shouldRenderForAuthVisibility("guest", true), false);

  const elements: EditorElement[] = [
    { id: "guest-link", pageId: "p1", type: "Link", content: "Sign In", href: "/login", settings: { authVisibility: "guest" } },
    { id: "member-greeting", pageId: "p1", type: "Text", content: "Welcome, {{user.name}} ({{user.email}})", settings: { authVisibility: "authenticated" } },
    { id: "submit-btn", pageId: "p1", type: "Button", content: "Submit", settings: { buttonType: "submit" } },
  ];

  const guestHtml = renderToStaticMarkup(
    createElement(
      SiteNavigationProvider,
      {
        value: {
          mode: { kind: "domain", subdomain: "acme" },
          projectId: "proj-1",
          pages: [],
          currentPath: "/",
          user: null,
          authEnabled: true,
          navigate: () => {},
        },
      },
      createElement(PreviewElementLoader, { elements }),
    ),
  );
  assert.match(guestHtml, /Sign In/);
  assert.doesNotMatch(guestHtml, /Welcome,/);
  assert.match(guestHtml, /type="submit"/);

  const user = { id: "u-1", email: "ada@example.com", name: "Ada" };
  const authedHtml = renderToStaticMarkup(
    createElement(
      SiteNavigationProvider,
      {
        value: {
          mode: { kind: "domain", subdomain: "acme" },
          projectId: "proj-1",
          pages: [],
          currentPath: "/",
          user,
          authEnabled: true,
          navigate: () => {},
        },
      },
      createElement(PreviewElementLoader, { elements, data: { user } }),
    ),
  );
  assert.doesNotMatch(authedHtml, /Sign In/);
  assert.match(authedHtml, /Welcome, Ada \(ada@example\.com\)/);
});

test("fetchSubdomainSite and fetchPreviewSite block protected pages before reading elements or CMS items", async () => {
  const project = {
    id: "proj-1",
    name: "Portal",
    ownerId: "u1",
    published: true,
    subdomain: "portal",
    authConfig: {
      provider: "supabase" as const,
      supabaseUrl: "https://demo.supabase.co",
      supabaseAnonKey: "sb_publishable_123",
      loginPath: "/login",
      afterLoginPath: "/dashboard",
    },
    createdAt: "2026-11-26T00:00:00Z",
    updatedAt: "2026-11-26T00:00:00Z",
    views: 0,
  };
  const pages: ApiPage[] = [
    { id: "p-login", projectId: "proj-1", name: "Login", slug: "login", type: "sp", requireAuth: false, createdAt: "", updatedAt: "" },
    { id: "p-dash", projectId: "proj-1", name: "Dashboard", slug: "dashboard", type: "sp", requireAuth: true, createdAt: "", updatedAt: "" },
  ];

  let elementsCalled = false;
  await assert.rejects(
    fetchSubdomainSite(
      "portal",
      {
        projectBySubdomain: async () => project,
        pages: async () => pages,
        elements: async () => {
          elementsCalled = true;
          return [{ id: "secret", pageId: "p-dash", type: "Text", content: "Top secret" }];
        },
        resolveAuth: async (_proj, page, path) =>
          page.requireAuth
            ? { user: null, redirectTo: `/login?next=${encodeURIComponent(path)}` }
            : { user: null },
      },
      "/dashboard",
    ),
    (err: unknown) =>
      err instanceof AuthRedirectError && err.location === "/login?next=%2Fdashboard",
  );
  assert.equal(elementsCalled, false, "protected elements must never be fetched before auth succeeds");

  const authed = await fetchPreviewSite(
    "proj-1",
    {
      draftToken: async () => undefined,
      project: async () => project,
      pages: async () => pages,
      elements: async () => [{ id: "secret", pageId: "p-dash", type: "Text", content: "Hello {{user.name}}" }],
      resolveAuth: async () => ({
        user: { id: "u-1", email: "ada@example.com", name: "Ada" },
      }),
    },
    "/dashboard",
  );
  assert.equal(authed.user?.email, "ada@example.com");
  assert.equal(authed.elements.length, 1);
});
