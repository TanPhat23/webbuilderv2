import { useNavigate, useLocation, ScriptOnce, createRootRoute, HeadContent, Outlet, Scripts, createFileRoute, lazyRouteComponent, createRouter } from "@tanstack/react-router";
import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import React__default, { useTransition, useEffect, useRef } from "react";
import { isServer, QueryClient, QueryClientProvider, dehydrate } from "@tanstack/react-query";
import { ThemeProvider as ThemeProvider$1, useTheme } from "next-themes";
import { a as apiClient, U as URLBuilder, A as API_ENDPOINTS, S as SidebarProvider, c as createSsrRpc, p as projectService, b as computeTailwindFromStyles, d as prisma$1, P as PrismaClient } from "./prisma-Cq49YOYM.js";
import { InternalClerkProvider } from "@clerk/react/internal";
import { i as isClient } from "./index-CSLGDVeV.js";
import { g as getPublicEnvVariables } from "./env-VSwWZfm9.js";
import "@clerk/react";
import { g as getGlobalStartContext, a as auth } from "./auth-BkVoR3zB.js";
import { Loader2Icon, OctagonXIcon, TriangleAlertIcon, InfoIcon, CircleCheckIcon } from "lucide-react";
import { Toaster as Toaster$1 } from "sonner";
import { c as createServerFn } from "../server.js";
import "clsx";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { createClerkClient } from "@clerk/backend";
import { generate } from "@babel/generator";
import * as t from "@babel/types";
import { PrismaPg } from "@prisma/adapter-pg";
var ClerkOptionsCtx = React__default.createContext(void 0);
ClerkOptionsCtx.displayName = "ClerkOptionsCtx";
var ClerkOptionsProvider = (props) => {
  const { children, options: options2 } = props;
  return /* @__PURE__ */ jsx(ClerkOptionsCtx.Provider, { value: { value: options2 }, children });
};
var useAwaitableNavigate = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resolveFunctionsRef = React__default.useRef([]);
  const resolveAll = () => {
    resolveFunctionsRef.current.forEach((resolve) => resolve());
    resolveFunctionsRef.current.splice(0, resolveFunctionsRef.current.length);
  };
  const [_, startTransition] = useTransition();
  React__default.useEffect(() => {
    resolveAll();
  }, [location]);
  return (options2) => {
    return new Promise((res) => {
      startTransition(() => {
        resolveFunctionsRef.current.push(res);
        res(navigate(options2));
      });
    });
  };
};
var pickFromClerkInitState = (clerkInitState) => {
  const {
    __clerk_ssr_state,
    __publishableKey,
    __proxyUrl,
    __domain,
    __isSatellite,
    __signInUrl,
    __signUpUrl,
    __clerkJSUrl,
    __clerkJSVersion,
    __clerkUIUrl,
    __clerkUIVersion,
    __telemetryDisabled,
    __telemetryDebug,
    __signInForceRedirectUrl,
    __signUpForceRedirectUrl,
    __signInFallbackRedirectUrl,
    __signUpFallbackRedirectUrl,
    __keylessClaimUrl,
    __keylessApiKeysUrl,
    __prefetchUI
  } = clerkInitState || {};
  return {
    clerkSsrState: __clerk_ssr_state,
    publishableKey: __publishableKey,
    proxyUrl: __proxyUrl,
    domain: __domain,
    isSatellite: !!__isSatellite,
    signInUrl: __signInUrl,
    signUpUrl: __signUpUrl,
    __internal_clerkJSUrl: __clerkJSUrl,
    __internal_clerkJSVersion: __clerkJSVersion,
    __internal_clerkUIUrl: __clerkUIUrl,
    __internal_clerkUIVersion: __clerkUIVersion,
    prefetchUI: __prefetchUI,
    telemetry: {
      disabled: __telemetryDisabled,
      debug: __telemetryDebug
    },
    signInForceRedirectUrl: __signInForceRedirectUrl,
    signUpForceRedirectUrl: __signUpForceRedirectUrl,
    signInFallbackRedirectUrl: __signInFallbackRedirectUrl,
    signUpFallbackRedirectUrl: __signUpFallbackRedirectUrl,
    __keylessClaimUrl,
    __keylessApiKeysUrl
  };
};
var mergeWithPublicEnvs = (restInitState) => {
  const envVars = getPublicEnvVariables();
  return {
    ...restInitState,
    publishableKey: restInitState.publishableKey || envVars.publishableKey,
    domain: restInitState.domain || envVars.domain,
    isSatellite: restInitState.isSatellite || envVars.isSatellite,
    signInUrl: restInitState.signInUrl || envVars.signInUrl,
    signUpUrl: restInitState.signUpUrl || envVars.signUpUrl,
    __internal_clerkJSUrl: restInitState.__internal_clerkJSUrl || envVars.clerkJsUrl,
    __internal_clerkJSVersion: restInitState.__internal_clerkJSVersion || envVars.clerkJsVersion,
    __internal_clerkUIUrl: restInitState.__internal_clerkUIUrl || envVars.clerkUIUrl,
    __internal_clerkUIVersion: restInitState.__internal_clerkUIVersion || envVars.clerkUIVersion,
    signInForceRedirectUrl: restInitState.signInForceRedirectUrl,
    prefetchUI: restInitState.prefetchUI ?? envVars.prefetchUI
  };
};
function parseUrlForNavigation(to, baseUrl) {
  const url = new URL(to, baseUrl);
  const searchParams = Object.fromEntries(url.searchParams);
  return {
    to: url.pathname,
    search: Object.keys(searchParams).length > 0 ? searchParams : void 0,
    hash: url.hash ? url.hash.slice(1) : void 0
  };
}
var SDK_METADATA = {
  name: "@clerk/tanstack-react-start",
  version: "1.0.1"
};
var awaitableNavigateRef = { current: void 0 };
function ClerkProvider({
  children,
  ...providerProps
}) {
  const awaitableNavigate = useAwaitableNavigate();
  const clerkInitialState = getGlobalStartContext()?.clerkInitialState ?? {};
  useEffect(() => {
    awaitableNavigateRef.current = awaitableNavigate;
  }, [awaitableNavigate]);
  const clerkInitState = isClient() ? window.__clerk_init_state : clerkInitialState;
  const { clerkSsrState, __keylessClaimUrl, __keylessApiKeysUrl, ...restInitState } = pickFromClerkInitState(
    clerkInitState?.__internal_clerk_state
  );
  const mergedProps = {
    ...mergeWithPublicEnvs(restInitState),
    ...providerProps
  };
  const keylessProps = __keylessClaimUrl ? {
    __internal_keyless_claimKeylessApplicationUrl: __keylessClaimUrl,
    __internal_keyless_copyInstanceKeysUrl: __keylessApiKeysUrl
  } : {};
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(ScriptOnce, { children: `window.__clerk_init_state = ${JSON.stringify(clerkInitialState)};` }),
    /* @__PURE__ */ jsx(ClerkOptionsProvider, { options: mergedProps, children: /* @__PURE__ */ jsx(
      InternalClerkProvider,
      {
        initialState: clerkSsrState,
        sdkMetadata: SDK_METADATA,
        routerPush: (to) => {
          const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
          return awaitableNavigateRef.current?.({
            ...rest,
            search,
            hash,
            replace: false
          });
        },
        routerReplace: (to) => {
          const { search, hash, ...rest } = parseUrlForNavigation(to, window.location.origin);
          return awaitableNavigateRef.current?.({
            ...rest,
            search,
            hash,
            replace: true
          });
        },
        ...mergedProps,
        ...keylessProps,
        children
      }
    ) })
  ] });
}
ClerkProvider.displayName = "ClerkProvider";
const elementService = {
  getElements: async (projectId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENTS.GET(projectId)).build()
    );
  },
  getElementsPublic: async (projectId) => {
    return apiClient.getPublic(
      new URLBuilder("api").setPath(API_ENDPOINTS.ELEMENTS.GET_PUBLIC(projectId)).build()
    );
  },
  saveSnapshot: async (projectId, snapshot) => {
    try {
      await apiClient.post(
        new URLBuilder("api").setPath(API_ENDPOINTS.SNAPSHOTS.SAVE(projectId)).build(),
        snapshot
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`saveSnapshot failed: ${message}`);
    }
  },
  getSnapshots: async (projectId) => {
    return apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.SNAPSHOTS.GET(projectId)).build()
    );
  },
  loadSnapshot: async (projectId, snapshotId) => {
    const snapshot = await apiClient.get(
      new URLBuilder("api").setPath(API_ENDPOINTS.SNAPSHOTS.LOAD(projectId, snapshotId)).build()
    );
    return snapshot.elements;
  },
  generateCode: async (elements, options2 = {}) => {
    return apiClient.post(
      new URLBuilder("next").setPath("/api/generate-code").build(),
      { elements },
      options2
    );
  }
};
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1e3 * 60 * 5,
        gcTime: 1e3 * 60 * 10
      }
    }
  });
}
let browserQueryClient = void 0;
let serverQueryClient = void 0;
function getQueryClient() {
  if (isServer) {
    if (!serverQueryClient) serverQueryClient = makeQueryClient();
    return serverQueryClient;
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
function QueryProvider({
  children
}) {
  const clientRef = useRef(getQueryClient());
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: clientRef.current, children });
}
function ThemeProvider({
  children,
  ...props
}) {
  return /* @__PURE__ */ jsx(ThemeProvider$1, { ...props, children });
}
function RootProviders({
  children
}) {
  return /* @__PURE__ */ jsx(ClerkProvider, { children: /* @__PURE__ */ jsx(QueryProvider, { children: /* @__PURE__ */ jsx(SidebarProvider, { children: /* @__PURE__ */ jsx(
    ThemeProvider,
    {
      attribute: "class",
      defaultTheme: "system",
      enableSystem: true,
      disableTransitionOnChange: true,
      children
    }
  ) }) }) });
}
const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      theme,
      className: "toaster group",
      icons: {
        success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
        info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
        warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
        error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
        loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
      },
      style: {
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
        "--border-radius": "var(--radius)"
      },
      ...props
    }
  );
};
const appCss = "/assets/globals-0QWL0c3h.css";
const Route$s = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "WebBuilder" },
      { name: "description", content: "WebBuilder - Visual website builder" }
    ],
    links: [{ rel: "stylesheet", href: appCss }]
  }),
  component: RootLayout
});
function RootLayout() {
  return /* @__PURE__ */ jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      /* @__PURE__ */ jsx(RootProviders, { children: /* @__PURE__ */ jsx(Outlet, {}) }),
      /* @__PURE__ */ jsx(Toaster, {}),
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
const $$splitComponentImporter$m = () => import("./helppage-CVqyJdy3.js");
const Route$r = createFileRoute("/helppage")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component")
});
const authStateFn = createServerFn().handler(createSsrRpc("88d5d58f001fd825f4c5fcff598166a8d2276446ffd1cacf558ba926f8fce389"));
const $$splitComponentImporter$l = () => import("./_protected-DgCOtRp4.js");
const Route$q = createFileRoute("/_protected")({
  beforeLoad: async () => await authStateFn(),
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("./_auth-6k3L6XRD.js");
const Route$p = createFileRoute("/_auth")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./index-B51AssKR.js");
const Route$o = createFileRoute("/")({
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./_id-Dp6L-xBf.js");
const Route$n = createFileRoute("/preview/$id")({
  loader: async ({
    params
  }) => {
    const queryClient = getQueryClient();
    await Promise.all([queryClient.prefetchQuery({
      queryKey: ["project", params.id],
      queryFn: () => projectService.getProjectPublic(params.id)
    }), queryClient.prefetchQuery({
      queryKey: ["elements", params.id],
      queryFn: () => elementService.getElementsPublic(params.id)
    })]);
    return {
      dehydratedState: dehydrate(queryClient)
    };
  },
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY
});
const tokenCache = /* @__PURE__ */ new Map();
const CACHE_TTL_MS = 45 * 1e3;
function getCachedToken(sessionId) {
  const cached = tokenCache.get(sessionId);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    tokenCache.delete(sessionId);
    return null;
  }
  return cached.jwt;
}
function setCachedToken(sessionId, jwt) {
  tokenCache.set(sessionId, { jwt, expiresAt: Date.now() + CACHE_TTL_MS });
}
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, cached] of tokenCache.entries()) {
    if (now > cached.expiresAt) tokenCache.delete(sessionId);
  }
}, 2 * 60 * 1e3);
const Route$m = createFileRoute("/api/gettoken")({
  server: {
    handlers: {
      GET: async () => {
        const { sessionId } = await auth();
        if (!sessionId) {
          return new Response("Unauthorized", { status: 401 });
        }
        const cachedJWT = getCachedToken(sessionId);
        if (cachedJWT) {
          return Response.json(
            { tokenJWT: cachedJWT },
            { headers: { "Cache-Control": "private, no-cache", "X-Cache": "HIT" } }
          );
        }
        try {
          const token = await clerkClient.sessions.getToken(sessionId, "usertemp");
          if (!token?.jwt) {
            return new Response("Failed to get token", { status: 500 });
          }
          setCachedToken(sessionId, token.jwt);
          return Response.json(
            { tokenJWT: token.jwt },
            { headers: { "Cache-Control": "private, no-cache", "X-Cache": "MISS" } }
          );
        } catch (error) {
          console.error("Token retrieval error:", error);
          return new Response("Failed to get token", { status: 500 });
        }
      }
    }
  }
});
const handleChildren = (element) => {
  const children = [];
  if (element.content) {
    children.push(t.jsxText(element.content));
  }
  const elems = element.elements;
  if (Array.isArray(elems) && elems.length > 0) {
    elems.forEach((child) => {
      const childStrategy = generateStrategies[child.type];
      if (!childStrategy) return;
      const childJSX = childStrategy.generate(child);
      if (childJSX) {
        children.push(childJSX);
      }
    });
  }
  return children;
};
const handleAttributes = (element) => {
  const attributes = [];
  attributes.push(
    t.jsxAttribute(
      t.jsxIdentifier("className"),
      t.stringLiteral(computeTailwindFromStyles(element.styles) || "")
    )
  );
  return attributes;
};
const settingsToAttributes = (settings) => {
  const attrs = [];
  if (!settings || typeof settings !== "object") return attrs;
  for (const [key, value] of Object.entries(settings)) {
    if (value === void 0) continue;
    if (typeof value === "string") {
      attrs.push(t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(value)));
    } else {
      try {
        const node = t.valueToNode(value);
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(key), t.jsxExpressionContainer(node))
        );
      } catch {
        attrs.push(
          t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(String(value)))
        );
      }
    }
  }
  return attrs;
};
class SectionGenerateStrategy {
  generate(element) {
    if (element.type !== "Section") return null;
    const children = handleChildren(element);
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("section"),
      handleAttributes(element),
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("section"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class ButtonGenerateStrategy {
  generate(element) {
    if (element.type !== "Button") return null;
    const children = [];
    if (element.content) {
      children.push(t.jsxText(element.content));
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("button"),
      handleAttributes(element),
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("button"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class TextGenerateStrategy {
  generate(element) {
    if (element.type !== "Text") return null;
    const children = [];
    if (element.content) children.push(t.jsxText(element.content));
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      handleAttributes(element),
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class ImageGenerateStrategy {
  generate(element) {
    if (element.type !== "Image") return null;
    const attrs = handleAttributes(element);
    if (element.src) {
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("src"), t.stringLiteral(element.src))
      );
    }
    attrs.push(
      t.jsxAttribute(
        t.jsxIdentifier("alt"),
        t.stringLiteral(element.content || "")
      )
    );
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("img"),
      attrs,
      true
    );
    return t.jsxElement(openingElement, null, [], true);
  }
}
class LinkGenerateStrategy {
  generate(element) {
    if (element.type !== "Link") return null;
    const children = handleChildren(element);
    if (children.length === 0 && element.content)
      children.push(t.jsxText(element.content));
    const attrs = handleAttributes(element);
    if (element.href)
      attrs.push(
        t.jsxAttribute(t.jsxIdentifier("href"), t.stringLiteral(element.href))
      );
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("a"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("a"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class InputGenerateStrategy {
  generate(element) {
    if (element.type !== "Input") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("input"),
      attrs,
      true
    );
    return t.jsxElement(openingElement, null, [], true);
  }
}
class SelectGenerateStrategy {
  generate(element) {
    if (element.type !== "Select") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const options2 = [];
    const elems = element.elements;
    if (Array.isArray(elems)) {
      elems.forEach((opt) => {
        const value = opt.content || "";
        const optionAttrs = [
          t.jsxAttribute(t.jsxIdentifier("value"), t.stringLiteral(value))
        ];
        const optOpening = t.jsxOpeningElement(
          t.jsxIdentifier("option"),
          optionAttrs,
          false
        );
        const optClosing = t.jsxClosingElement(t.jsxIdentifier("option"));
        options2.push(
          t.jsxElement(
            optOpening,
            optClosing,
            [t.jsxText(value)],
            false
          )
        );
      });
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("select"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("select"));
    return t.jsxElement(openingElement, closingElement, options2, false);
  }
}
class ListGenerateStrategy {
  generate(element) {
    if (element.type !== "List") return null;
    const ordered = !!(element.settings && element.settings.ordered);
    const tag = ordered ? "ol" : "ul";
    const children = [];
    const elems = element.elements;
    if (Array.isArray(elems)) {
      elems.forEach((child) => {
        const childStrategy = generateStrategies[child.type];
        if (!childStrategy) return;
        const childJSX = childStrategy.generate(child);
        if (childJSX) {
          const liOpening = t.jsxOpeningElement(
            t.jsxIdentifier("li"),
            [],
            false
          );
          const liClosing = t.jsxClosingElement(t.jsxIdentifier("li"));
          children.push(
            t.jsxElement(liOpening, liClosing, [childJSX], false)
          );
        }
      });
    }
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier(tag),
      handleAttributes(element),
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier(tag));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class FrameGenerateStrategy {
  generate(element) {
    if (element.type !== "Frame") return null;
    const children = handleChildren(element);
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      handleAttributes(element),
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class FormGenerateStrategy {
  generate(element) {
    if (element.type !== "Form") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const children = handleChildren(element);
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("form"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("form"));
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class CarouselGenerateStrategy {
  generate(element) {
    if (element.type !== "Carousel") return null;
    const slides = [];
    const elems = element.elements;
    if (Array.isArray(elems) && elems.length > 0) {
      elems.forEach((child) => {
        const childStrategy = generateStrategies[child.type];
        if (!childStrategy) return;
        const childJSX = childStrategy.generate(child);
        if (childJSX) {
          const slideOpening = t.jsxOpeningElement(
            t.jsxIdentifier("div"),
            [
              t.jsxAttribute(
                t.jsxIdentifier("className"),
                t.stringLiteral("embla__slide")
              )
            ],
            false
          );
          const slideClosing = t.jsxClosingElement(t.jsxIdentifier("div"));
          const slide = t.jsxElement(
            slideOpening,
            slideClosing,
            [childJSX],
            false
          );
          slides.push(slide);
        }
      });
    }
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("Carousel"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("Carousel"));
    return t.jsxElement(openingElement, closingElement, slides, false);
  }
}
class CMSContentListGenerateStrategy {
  generate(element) {
    if (element.type !== "CMSContentList") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class CMSContentItemGenerateStrategy {
  generate(element) {
    if (element.type !== "CMSContentItem") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
class CMSContentGridGenerateStrategy {
  generate(element) {
    if (element.type !== "CMSContentGrid") return null;
    const attrs = [
      ...handleAttributes(element),
      ...settingsToAttributes(element.settings)
    ];
    const openingElement = t.jsxOpeningElement(
      t.jsxIdentifier("div"),
      attrs,
      false
    );
    const closingElement = t.jsxClosingElement(t.jsxIdentifier("div"));
    const children = handleChildren(element);
    return t.jsxElement(openingElement, closingElement, children, false);
  }
}
const generateStrategies = {
  Section: new SectionGenerateStrategy(),
  Button: new ButtonGenerateStrategy(),
  Text: new TextGenerateStrategy(),
  Image: new ImageGenerateStrategy(),
  Link: new LinkGenerateStrategy(),
  Input: new InputGenerateStrategy(),
  Select: new SelectGenerateStrategy(),
  List: new ListGenerateStrategy(),
  Frame: new FrameGenerateStrategy(),
  Form: new FormGenerateStrategy(),
  Carousel: new CarouselGenerateStrategy(),
  CMSContentList: new CMSContentListGenerateStrategy(),
  CMSContentItem: new CMSContentItemGenerateStrategy(),
  CMSContentGrid: new CMSContentGridGenerateStrategy()
};
const COMPONENT_IMPORTS = {
  Carousel: "import { Carousel } from '@/components/ui/carousel';",
  Button: "import { Button } from '@/components/ui/button';",
  Card: "import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';",
  Input: "import { Input } from '@/components/ui/input';",
  Select: "import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';",
  Dialog: "import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';",
  Checkbox: "import { Checkbox } from '@/components/ui/checkbox';",
  RadioGroup: "import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';",
  Tabs: "import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';",
  Badge: "import { Badge } from '@/components/ui/badge';",
  Alert: "import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';",
  Tooltip: "import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';",
  Popover: "import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';",
  Accordion: "import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';",
  Sheet: "import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';",
  Slider: "import { Slider } from '@/components/ui/slider';",
  Switch: "import { Switch } from '@/components/ui/switch';",
  Table: "import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';"
};
function findUsedComponents(elements) {
  const used = /* @__PURE__ */ new Set();
  const traverse = (el) => {
    used.add(el.type);
    const containerEl = el;
    if (Array.isArray(containerEl.elements)) {
      containerEl.elements.forEach((child) => traverse(child));
    }
  };
  elements.forEach((el) => traverse(el));
  return used;
}
function generateImports(elements) {
  const imports = ["import React from 'react';"];
  const usedComponents = findUsedComponents(elements);
  for (const component of usedComponents) {
    if (COMPONENT_IMPORTS[component]) {
      imports.push(COMPONENT_IMPORTS[component]);
    }
  }
  return imports.join("\n");
}
const options = {
  componentName: "Generated"
};
class CodeGenerator {
  constructor() {
  }
  static getInstance() {
    if (!CodeGenerator.instance) {
      CodeGenerator.instance = new CodeGenerator();
    }
    return CodeGenerator.instance;
  }
  elementToJSX(element) {
    const strategy = generateStrategies[element.type];
    if (!strategy) {
      console.warn(`No generate strategy for element type: ${element.type}`);
      return null;
    }
    try {
      return strategy.generate(element);
    } catch (err) {
      console.error(
        `Error generating JSX for element type ${element.type}:`,
        err
      );
      return null;
    }
  }
  async generateToJSX(elements) {
    const nodes = elements.map((el) => this.elementToJSX(el)).filter((el) => el !== null);
    const inner = nodes.length > 0 ? nodes.map((n) => generate(n).code).join("\n") : "";
    let result = inner;
    {
      const imports = generateImports(elements);
      const indentedInner = inner ? inner.split("\n").map((line) => "      " + line).join("\n") : "";
      result = `/**
 * Generated component
 * Note: TypeScript errors in Monaco editor are expected - the editor doesn't have full project context
 * This code will work correctly when used in your actual Next.js project
 */
${imports}

const ${options.componentName} = () => {
  return (
    <>
${indentedInner ? indentedInner + "\n" : ""}
    </>
  );
};

export default ${options.componentName};
`;
    }
    return result;
  }
}
const codeGenerator = CodeGenerator.getInstance();
const Route$l = createFileRoute("/api/generate-code")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const elements = body?.elements;
          if (!Array.isArray(elements)) {
            return Response.json(
              { error: "Invalid payload: `elements` must be an array." },
              { status: 400 }
            );
          }
          if (elements.length > 5e3) {
            return Response.json(
              { error: "Payload too large" },
              { status: 413 }
            );
          }
          const code = await codeGenerator.generateToJSX(elements);
          return Response.json({ code }, { status: 200 });
        } catch (err) {
          console.error("Server code generation failed:", err);
          return Response.json(
            { error: "Code generation failed on the server." },
            { status: 500 }
          );
        }
      }
    }
  }
});
const Route$k = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      GET: async () => {
        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const marketplaceItems = await prisma$1.marketplaceItem.findMany({
            where: { AuthorId: userId, DeletedAt: null },
            include: {
              Project: true,
              Categories: { include: { Category: true } },
              Tags: { include: { Tag: true } }
            },
            orderBy: { CreatedAt: "desc" }
          });
          const totalViews = marketplaceItems.reduce(
            (sum, item) => sum + (item.Views || 0),
            0
          );
          const totalDownloads = marketplaceItems.reduce(
            (sum, item) => sum + (item.Downloads || 0),
            0
          );
          const totalLikes = marketplaceItems.reduce(
            (sum, item) => sum + (item.Likes || 0),
            0
          );
          const conversionRate = totalViews > 0 ? (totalDownloads / totalViews * 100).toFixed(1) : "0";
          const chartData = generateChartData(marketplaceItems);
          const recentItems = marketplaceItems.slice(0, 5).map((item) => ({
            id: item.Id,
            template: item.Title,
            category: item.Categories[0]?.Category?.Name || "Uncategorized",
            views: item.Views || 0,
            downloads: item.Downloads || 0,
            likes: item.Likes || 0,
            time: formatTimeAgo(item.CreatedAt),
            avatar: item.Title.substring(0, 2).toUpperCase(),
            trend: "+" + Math.floor(Math.random() * 20) + "%"
          }));
          const topTemplates = marketplaceItems.sort((a, b) => (b.Downloads || 0) - (a.Downloads || 0)).slice(0, 6).map((item) => ({
            id: item.Id,
            template: item.Title,
            views: item.Views || 0,
            downloads: item.Downloads || 0
          }));
          return Response.json({
            stats: {
              totalViews,
              totalDownloads,
              totalLikes,
              conversionRate: parseFloat(conversionRate)
            },
            chartData,
            recentItems,
            topTemplates,
            marketplaceItems: marketplaceItems.map((item) => ({
              id: item.Id,
              title: item.Title,
              description: item.Description,
              downloads: item.Downloads,
              likes: item.Likes,
              views: item.Views,
              createdAt: item.CreatedAt
            }))
          });
        } catch (error) {
          console.error("Analytics API error:", error);
          return Response.json(
            { error: "Internal server error" },
            { status: 500 }
          );
        }
      }
    }
  }
});
function generateChartData(items) {
  const today = /* @__PURE__ */ new Date();
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
    const totalDownloads = items.reduce(
      (sum, item) => sum + (item.Downloads || 0),
      0
    );
    const totalLikes = items.reduce(
      (sum, item) => sum + (item.Likes || 0),
      0
    );
    const totalViews = items.reduce(
      (sum, item) => sum + (item.Views || 0),
      0
    );
    chartData.push({
      date: dateStr,
      views: Math.floor(Math.random() * (totalViews || 1e3)) + 500,
      downloads: Math.floor(Math.random() * (totalDownloads || 1e3)) + 100,
      likes: Math.floor(Math.random() * (totalLikes || 500)) + 50
    });
  }
  return chartData;
}
function formatTimeAgo(date) {
  const now = /* @__PURE__ */ new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1e3 * 60));
  const hours = Math.floor(diff / (1e3 * 60 * 60));
  const days = Math.floor(diff / (1e3 * 60 * 60 * 24));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}
const $$splitComponentImporter$h = () => import("./profile-CKvr6azN.js");
const Route$j = createFileRoute("/_protected/profile")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./notifications-CkJedwax.js");
const Route$i = createFileRoute("/_protected/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./marketplace-IbuszqvM.js");
const Route$h = createFileRoute("/_protected/marketplace")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./help-BI1zrqKb.js");
const Route$g = createFileRoute("/_protected/help")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./dashboard-BTb_6QQq.js");
const Route$f = createFileRoute("/_protected/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./analytics-BIGyneXr.js");
const Route$e = createFileRoute("/_protected/analytics")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./accept-invitation-CsvVjM_9.js");
const Route$d = createFileRoute("/_protected/accept-invitation")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./sign-up-CIfJIuvV.js");
const Route$c = createFileRoute("/_auth/sign-up")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./sign-in-BN87xWE_.js");
const Route$b = createFileRoute("/_auth/sign-in")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const Route$a = createFileRoute("/api/notifications/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const url = new URL(request.url);
          const filter = url.searchParams.get("filter") || "all";
          const search = url.searchParams.get("search") || "";
          let whereClause = { UserId: userId };
          if (filter === "unread") {
            whereClause.Read = false;
          } else if (filter !== "all") {
            whereClause.Type = filter;
          }
          if (search) {
            whereClause.OR = [
              { Title: { contains: search, mode: "insensitive" } },
              { Description: { contains: search, mode: "insensitive" } }
            ];
          }
          const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { CreatedAt: "desc" },
            take: 50
          });
          const stats = {
            total: await prisma.notification.count({ where: { UserId: userId } }),
            unread: await prisma.notification.count({
              where: { UserId: userId, Read: false }
            }),
            readToday: await prisma.notification.count({
              where: {
                UserId: userId,
                Read: true,
                UpdatedAt: { gte: new Date((/* @__PURE__ */ new Date()).setHours(0, 0, 0, 0)) }
              }
            })
          };
          const filterCounts = {
            all: stats.total,
            unread: stats.unread,
            messages: await prisma.notification.count({
              where: { UserId: userId, Type: "message" }
            }),
            followers: await prisma.notification.count({
              where: { UserId: userId, Type: "user" }
            }),
            alerts: await prisma.notification.count({
              where: { UserId: userId, Type: "alert" }
            }),
            updates: await prisma.notification.count({
              where: { UserId: userId, Type: "settings" }
            })
          };
          return Response.json({ notifications, stats, filterCounts });
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return Response.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
          );
        }
      },
      PATCH: async ({ request }) => {
        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const body = await request.json();
          const { notificationId, read } = body;
          if (!notificationId) {
            return Response.json(
              { error: "Notification ID required" },
              { status: 400 }
            );
          }
          const notification = await prisma.notification.findUnique({
            where: { Id: notificationId }
          });
          if (!notification || notification.UserId !== userId) {
            return Response.json(
              { error: "Notification not found" },
              { status: 404 }
            );
          }
          const updated = await prisma.notification.update({
            where: { Id: notificationId },
            data: { Read: read ?? true }
          });
          return Response.json(updated);
        } catch (error) {
          console.error("Error updating notification:", error);
          return Response.json(
            { error: "Failed to update notification" },
            { status: 500 }
          );
        }
      },
      POST: async () => {
        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          await prisma.notification.updateMany({
            where: { UserId: userId, Read: false },
            data: { Read: true }
          });
          return Response.json({ success: true });
        } catch (error) {
          console.error("Error marking all as read:", error);
          return Response.json(
            { error: "Failed to mark all as read" },
            { status: 500 }
          );
        }
      }
    }
  }
});
const $$splitComponentImporter$8 = () => import("./index-DWRxh4US.js");
const Route$9 = createFileRoute("/_protected/profile/")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./index-C4z2STcT.js");
const Route$8 = createFileRoute("/_protected/notifications/")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./index-DHF_sEif.js");
const Route$7 = createFileRoute("/_protected/marketplace/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./index-HgrnireO.js");
const Route$6 = createFileRoute("/_protected/dashboard/")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./index-6SoLo_TW.js");
const Route$5 = createFileRoute("/_protected/analytics/")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const Route$4 = createFileRoute("/api/notifications/profile-update")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { userId } = await auth();
        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
          const body = await request.json();
          const { description } = body;
          await prisma$1.notification.create({
            data: {
              UserId: userId,
              Type: "settings",
              Title: "Profile Updated",
              Description: description || "You updated your profile information."
            }
          });
          return Response.json({ success: true });
        } catch (error) {
          console.error("Error creating profile update notification:", error);
          return Response.json(
            { error: "Failed to create notification" },
            { status: 500 }
          );
        }
      }
    }
  }
});
const $$splitComponentImporter$3 = () => import("./projectsettings._id-BV60UHQb.js");
const Route$3 = createFileRoute("/_protected/projectsettings/$id")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./_id-BXxDS7Xz.js");
const Route$2 = createFileRoute("/_protected/marketplace/$id")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./editor._id-ColoV6wH.js");
const checkEditorAccess = createServerFn({
  method: "GET"
}).inputValidator((projectId) => projectId).handler(createSsrRpc("4e76fa5d97766bcab4dfbf483338c1327081ed3b31aa33ecf57450aab56d8514"));
const Route$1 = createFileRoute("/_protected/editor/$id")({
  beforeLoad: async ({
    params
  }) => {
    return await checkEditorAccess({
      data: params.id
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./index-7WcrU_UZ.js");
const Route = createFileRoute("/_protected/editor/$id/")({
  loader: async ({
    params
  }) => {
    const queryClient = getQueryClient();
    await queryClient.prefetchQuery({
      queryKey: ["fonts"],
      queryFn: () => projectService.getFonts()
    });
    return {
      dehydratedState: dehydrate(queryClient)
    };
  },
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const HelppageRoute = Route$r.update({
  id: "/helppage",
  path: "/helppage",
  getParentRoute: () => Route$s
});
const ProtectedRoute = Route$q.update({
  id: "/_protected",
  getParentRoute: () => Route$s
});
const AuthRoute = Route$p.update({
  id: "/_auth",
  getParentRoute: () => Route$s
});
const IndexRoute = Route$o.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$s
});
const PreviewIdRoute = Route$n.update({
  id: "/preview/$id",
  path: "/preview/$id",
  getParentRoute: () => Route$s
});
const ApiGettokenRoute = Route$m.update({
  id: "/api/gettoken",
  path: "/api/gettoken",
  getParentRoute: () => Route$s
});
const ApiGenerateCodeRoute = Route$l.update({
  id: "/api/generate-code",
  path: "/api/generate-code",
  getParentRoute: () => Route$s
});
const ApiAnalyticsRoute = Route$k.update({
  id: "/api/analytics",
  path: "/api/analytics",
  getParentRoute: () => Route$s
});
const ProtectedProfileRoute = Route$j.update({
  id: "/profile",
  path: "/profile",
  getParentRoute: () => ProtectedRoute
});
const ProtectedNotificationsRoute = Route$i.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => ProtectedRoute
});
const ProtectedMarketplaceRoute = Route$h.update({
  id: "/marketplace",
  path: "/marketplace",
  getParentRoute: () => ProtectedRoute
});
const ProtectedHelpRoute = Route$g.update({
  id: "/help",
  path: "/help",
  getParentRoute: () => ProtectedRoute
});
const ProtectedDashboardRoute = Route$f.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => ProtectedRoute
});
const ProtectedAnalyticsRoute = Route$e.update({
  id: "/analytics",
  path: "/analytics",
  getParentRoute: () => ProtectedRoute
});
const ProtectedAcceptInvitationRoute = Route$d.update({
  id: "/accept-invitation",
  path: "/accept-invitation",
  getParentRoute: () => ProtectedRoute
});
const AuthSignUpRoute = Route$c.update({
  id: "/sign-up",
  path: "/sign-up",
  getParentRoute: () => AuthRoute
});
const AuthSignInRoute = Route$b.update({
  id: "/sign-in",
  path: "/sign-in",
  getParentRoute: () => AuthRoute
});
const ApiNotificationsIndexRoute = Route$a.update({
  id: "/api/notifications/",
  path: "/api/notifications/",
  getParentRoute: () => Route$s
});
const ProtectedProfileIndexRoute = Route$9.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedProfileRoute
});
const ProtectedNotificationsIndexRoute = Route$8.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedNotificationsRoute
});
const ProtectedMarketplaceIndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedMarketplaceRoute
});
const ProtectedDashboardIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedDashboardRoute
});
const ProtectedAnalyticsIndexRoute = Route$5.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedAnalyticsRoute
});
const ApiNotificationsProfileUpdateRoute = Route$4.update({
  id: "/api/notifications/profile-update",
  path: "/api/notifications/profile-update",
  getParentRoute: () => Route$s
});
const ProtectedProjectsettingsIdRoute = Route$3.update({
  id: "/projectsettings/$id",
  path: "/projectsettings/$id",
  getParentRoute: () => ProtectedRoute
});
const ProtectedMarketplaceIdRoute = Route$2.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => ProtectedMarketplaceRoute
});
const ProtectedEditorIdRoute = Route$1.update({
  id: "/editor/$id",
  path: "/editor/$id",
  getParentRoute: () => ProtectedRoute
});
const ProtectedEditorIdIndexRoute = Route.update({
  id: "/",
  path: "/",
  getParentRoute: () => ProtectedEditorIdRoute
});
const AuthRouteChildren = {
  AuthSignInRoute,
  AuthSignUpRoute
};
const AuthRouteWithChildren = AuthRoute._addFileChildren(AuthRouteChildren);
const ProtectedAnalyticsRouteChildren = {
  ProtectedAnalyticsIndexRoute
};
const ProtectedAnalyticsRouteWithChildren = ProtectedAnalyticsRoute._addFileChildren(ProtectedAnalyticsRouteChildren);
const ProtectedDashboardRouteChildren = {
  ProtectedDashboardIndexRoute
};
const ProtectedDashboardRouteWithChildren = ProtectedDashboardRoute._addFileChildren(ProtectedDashboardRouteChildren);
const ProtectedMarketplaceRouteChildren = {
  ProtectedMarketplaceIdRoute,
  ProtectedMarketplaceIndexRoute
};
const ProtectedMarketplaceRouteWithChildren = ProtectedMarketplaceRoute._addFileChildren(ProtectedMarketplaceRouteChildren);
const ProtectedNotificationsRouteChildren = {
  ProtectedNotificationsIndexRoute
};
const ProtectedNotificationsRouteWithChildren = ProtectedNotificationsRoute._addFileChildren(
  ProtectedNotificationsRouteChildren
);
const ProtectedProfileRouteChildren = {
  ProtectedProfileIndexRoute
};
const ProtectedProfileRouteWithChildren = ProtectedProfileRoute._addFileChildren(ProtectedProfileRouteChildren);
const ProtectedEditorIdRouteChildren = {
  ProtectedEditorIdIndexRoute
};
const ProtectedEditorIdRouteWithChildren = ProtectedEditorIdRoute._addFileChildren(ProtectedEditorIdRouteChildren);
const ProtectedRouteChildren = {
  ProtectedAcceptInvitationRoute,
  ProtectedAnalyticsRoute: ProtectedAnalyticsRouteWithChildren,
  ProtectedDashboardRoute: ProtectedDashboardRouteWithChildren,
  ProtectedHelpRoute,
  ProtectedMarketplaceRoute: ProtectedMarketplaceRouteWithChildren,
  ProtectedNotificationsRoute: ProtectedNotificationsRouteWithChildren,
  ProtectedProfileRoute: ProtectedProfileRouteWithChildren,
  ProtectedEditorIdRoute: ProtectedEditorIdRouteWithChildren,
  ProtectedProjectsettingsIdRoute
};
const ProtectedRouteWithChildren = ProtectedRoute._addFileChildren(
  ProtectedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthRoute: AuthRouteWithChildren,
  ProtectedRoute: ProtectedRouteWithChildren,
  HelppageRoute,
  ApiAnalyticsRoute,
  ApiGenerateCodeRoute,
  ApiGettokenRoute,
  PreviewIdRoute,
  ApiNotificationsProfileUpdateRoute,
  ApiNotificationsIndexRoute
};
const routeTree = Route$s._addFileChildren(rootRouteChildren)._addFileTypes();
function getRouter() {
  const router2 = createRouter({
    routeTree,
    scrollRestoration: true
  });
  return router2;
}
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$n as R,
  Route$2 as a,
  Route$1 as b,
  Route as c,
  elementService as e,
  router as r
};
