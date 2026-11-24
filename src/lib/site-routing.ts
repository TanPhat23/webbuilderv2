const VALID_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "ws",
  "mcp",
  "preview",
  "editor",
  "dashboard",
  "sign-in",
  "sign-up",
  "help",
  "helppage",
  "static",
  "assets",
  "cdn",
  "mail",
  "webhook",
]);

export type SiteRoutingMode =
  | { readonly kind: "preview"; readonly projectId: string }
  | { readonly kind: "domain"; readonly subdomain: string };

export interface RoutePageSummary {
  readonly id: string;
  readonly name: string;
  readonly slug?: string;
  readonly type: string;
}

export interface SiteRoutingContext {
  readonly mode: SiteRoutingMode;
  readonly pages: ReadonlyArray<RoutePageSummary>;
}

export type ResolvedSiteHref =
  | { readonly kind: "external"; readonly href: string }
  | { readonly kind: "anchor"; readonly href: string }
  | { readonly kind: "internal"; readonly href: string; readonly pageId?: string };

export function slugifyPageName(name: string): string {
  const trimmed = name.trim().toLowerCase();
  if (!trimmed || trimmed === "home" || trimmed === "index") {
    return "";
  }
  return trimmed.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function effectivePageSlug(
  page: Pick<RoutePageSummary, "name" | "slug">,
): string {
  if (typeof page.slug === "string") {
    return normalizeRoutePath(page.slug);
  }
  return slugifyPageName(page.name);
}

export function normalizeRoutePath(rawPath: string | undefined): string {
  if (!rawPath) return "";
  const withoutHash = rawPath.split("#")[0] ?? "";
  const withoutQuery = withoutHash.split("?")[0] ?? "";
  return withoutQuery.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
}

export function pageRoutePath(
  page: Pick<RoutePageSummary, "name" | "slug">,
): string {
  const slug = effectivePageSlug(page);
  return slug ? `/${slug}` : "/";
}

export function resolveRoutePage<T extends RoutePageSummary>(
  pages: readonly T[],
  target?: string,
): { readonly page: T; readonly itemSlug?: string } | null {
  if (pages.length === 0) return null;

  if (target === undefined) {
    const home =
      pages.find((page) => effectivePageSlug(page) === "" || page.name === "") ??
      pages[0];
    return home ? { page: home } : null;
  }

  const byId = pages.find((page) => page.id === target);
  if (byId) return { page: byId };

  const clean = normalizeRoutePath(target);
  if (clean === "") {
    const home =
      pages.find((page) => effectivePageSlug(page) === "" || page.name === "") ??
      pages[0];
    return home ? { page: home } : null;
  }

  const exact = pages.find((page) => effectivePageSlug(page) === clean);
  if (exact) return { page: exact };

  for (const page of pages) {
    if (page.type !== "dp") continue;
    const prefix = effectivePageSlug(page);
    if (prefix && clean.startsWith(`${prefix}/`)) {
      const rest = clean.slice(prefix.length + 1);
      if (rest) return { page, itemSlug: rest };
    }
  }

  return null;
}

function stripPort(host: string): string {
  const trimmed = host.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.startsWith("[")) {
    const end = trimmed.indexOf("]");
    return end >= 0 ? trimmed.slice(0, end + 1) : trimmed;
  }
  const colon = trimmed.lastIndexOf(":");
  if (colon > 0 && /^\d+$/.test(trimmed.slice(colon + 1))) {
    return trimmed.slice(0, colon);
  }
  return trimmed;
}

function isIpLiteral(hostname: string): boolean {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");
}

export function configuredAppHosts(): readonly string[] {
  const hosts = new Set<string>(["localhost", "127.0.0.1"]);
  const envVars: ReadonlyArray<string | undefined> = [
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_SITE_DOMAIN : undefined,
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_APP_DOMAIN : undefined,
    typeof import.meta !== "undefined" ? import.meta.env?.VITE_BASE_URL : undefined,
    typeof process !== "undefined" ? process.env?.VITE_SITE_DOMAIN : undefined,
    typeof process !== "undefined" ? process.env?.VITE_APP_DOMAIN : undefined,
    typeof process !== "undefined" ? process.env?.VITE_BASE_URL : undefined,
  ];
  for (const raw of envVars) {
    if (!raw) continue;
    try {
      const parsed = raw.includes("://")
        ? new URL(raw).hostname
        : stripPort(raw);
      const clean = parsed.toLowerCase().replace(/^\*\./, "");
      if (clean) hosts.add(clean);
    } catch {
      // Ignore malformed env values.
    }
  }
  return [...hosts];
}

export function extractSubdomain(
  hostHeader: string | undefined,
  appHosts: readonly string[] = configuredAppHosts(),
): string | null {
  if (!hostHeader) return null;
  const hostname = stripPort(hostHeader.split(",")[0] ?? "");
  if (!hostname || isIpLiteral(hostname)) return null;

  if (hostname === "localhost") return null;
  if (hostname.endsWith(".localhost")) {
    const label = hostname.slice(0, -".localhost".length);
    return isValidSubdomainLabel(label) ? label : null;
  }

  for (const rawRoot of appHosts) {
    const root = stripPort(rawRoot);
    if (!root || root === "localhost" || isIpLiteral(root)) continue;
    if (hostname === root || hostname === `www.${root}`) return null;
    if (hostname.endsWith(`.${root}`)) {
      const label = hostname.slice(0, -(root.length + 1));
      return isValidSubdomainLabel(label) ? label : null;
    }
  }

  return null;
}

export function isValidSubdomainLabel(label: string): boolean {
  if (!label || RESERVED_SUBDOMAINS.has(label) || label.includes(".")) {
    return false;
  }
  if (!/^[a-z0-9](?:[a-z0-9-]{1,61}[a-z0-9])$/.test(label)) {
    return false;
  }
  return !label.includes("--");
}

export function buildPublicSiteUrl(
  subdomain: string,
  pagePath = "/",
  options?: { readonly currentOrigin?: string; readonly siteDomain?: string },
): string {
  const cleanSub = subdomain.trim().toLowerCase();
  const cleanPath = pagePath.startsWith("/") ? pagePath : `/${pagePath}`;
  const envDomain =
    options?.siteDomain ??
    (typeof import.meta !== "undefined" ? import.meta.env?.VITE_SITE_DOMAIN : undefined);
  if (envDomain) {
    const root = stripPort(envDomain).replace(/^\*\./, "");
    const protocol = root === "localhost" || root.endsWith(".localhost") ? "http" : "https";
    return `${protocol}://${cleanSub}.${root}${cleanPath === "/" ? "" : cleanPath}`;
  }

  const origin =
    options?.currentOrigin ??
    (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
  try {
    const url = new URL(origin);
    const existingSub = extractSubdomain(url.host);
    const baseHost = existingSub
      ? url.host.slice(existingSub.length + 1)
      : url.host.startsWith("www.")
        ? url.host.slice(4)
        : url.host;
    return `${url.protocol}//${cleanSub}.${baseHost}${cleanPath === "/" ? "" : cleanPath}`;
  } catch {
    return `https://${cleanSub}.localhost:3000${cleanPath === "/" ? "" : cleanPath}`;
  }
}

export function buildSiteHref(
  mode: SiteRoutingMode,
  cleanPagePath: string,
): string {
  const normalized =
    cleanPagePath === "/" || cleanPagePath === ""
      ? "/"
      : `/${cleanPagePath.replace(/^\/+|\/+$/g, "")}`;
  if (mode.kind === "domain") {
    return normalized;
  }
  const base = `/preview/${encodeURIComponent(mode.projectId)}`;
  return normalized === "/" ? base : `${base}${normalized}`;
}

export function resolveSiteHref(
  rawHref: string | undefined,
  ctx?: SiteRoutingContext,
): ResolvedSiteHref | null {
  const trimmed = typeof rawHref === "string" ? rawHref.trim() : "";
  if (!trimmed) return null;

  if (trimmed.startsWith("#")) {
    return { kind: "anchor", href: trimmed };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed, "https://site.invalid/");
  } catch {
    return null;
  }

  if (!VALID_PROTOCOLS.has(parsed.protocol)) {
    return null;
  }

  const isSameDummyOrigin =
    parsed.origin === "https://site.invalid" &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("http:") &&
    !trimmed.startsWith("https:");

  if (!isSameDummyOrigin) {
    return { kind: "external", href: trimmed };
  }

  if (!ctx) {
    return { kind: "internal", href: trimmed };
  }

  const pageParam = parsed.searchParams.get("page");
  if (pageParam !== null) {
    const matched = ctx.pages.find((page) => page.id === pageParam);
    if (matched) {
      const targetPath = pageRoutePath(matched);
      const hash = parsed.hash || "";
      return {
        kind: "internal",
        href: `${buildSiteHref(ctx.mode, targetPath)}${hash}`,
        pageId: matched.id,
      };
    }
  }

  let cleanPath = normalizeRoutePath(parsed.pathname);
  if (ctx.mode.kind === "preview") {
    const previewPrefix = normalizeRoutePath(
      `/preview/${encodeURIComponent(ctx.mode.projectId)}`,
    );
    if (cleanPath === previewPrefix) {
      cleanPath = "";
    } else if (cleanPath.startsWith(`${previewPrefix}/`)) {
      cleanPath = cleanPath.slice(previewPrefix.length + 1);
    }
  }
  const matched = resolveRoutePage(ctx.pages, cleanPath);
  const resolvedPath =
    matched && !matched.itemSlug
      ? pageRoutePath(matched.page)
      : cleanPath
        ? `/${cleanPath}`
        : "/";
  const hash = parsed.hash || "";

  return {
    kind: "internal",
    href: `${buildSiteHref(ctx.mode, resolvedPath)}${hash}`,
    ...(matched ? { pageId: matched.page.id } : {}),
  };
}
