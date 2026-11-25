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
  readonly contentTypeId?: string | null;
}

export interface ResolvedRouteMatch<T extends RoutePageSummary> {
  readonly page: T;
  readonly params: Readonly<Record<string, string>>;
  readonly itemSlug?: string;
}

const VALID_STATIC_SEG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VALID_PARAM_SEG = /^:[a-z][a-z0-9_]*$/;
const VALID_CATCHALL_SEG = /^\*(?:[a-z][a-z0-9_]*)?$/;

export function hasDynamicSegments(slug: string): boolean {
  if (!slug) return false;
  return slug
    .split("/")
    .some((part) => part.startsWith(":") || part.startsWith("*"));
}

export function extractRouteParamNames(slug: string): readonly string[] {
  if (!slug) return [];
  const names: string[] = [];
  for (const part of slug.split("/")) {
    if (part.startsWith(":") && part.length > 1) {
      names.push(part.slice(1));
    } else if (part.startsWith("*")) {
      names.push(part.length > 1 ? part.slice(1) : "*");
    }
  }
  return names;
}

export function validatePageSlugPattern(
  raw: string,
  isDynamic: boolean,
):
  | { readonly valid: true; readonly normalized: string }
  | { readonly valid: false; readonly error: string } {
  const cleaned = normalizeRoutePath(raw);
  if (!cleaned) return { valid: true, normalized: "" };
  if (cleaned.length > 200) {
    return { valid: false, error: "Page URL path must be 200 characters or fewer" };
  }
  const parts = cleaned.split("/");
  const seen = new Set<string>();
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i] ?? "";
    if (VALID_STATIC_SEG.test(part)) continue;
    if (VALID_PARAM_SEG.test(part)) {
      if (!isDynamic) {
        return {
          valid: false,
          error: "Dynamic :param segments are only allowed on Dynamic Pages",
        };
      }
      const name = part.slice(1);
      if (seen.has(name)) {
        return { valid: false, error: `Duplicate route parameter :${name}` };
      }
      seen.add(name);
      continue;
    }
    if (VALID_CATCHALL_SEG.test(part)) {
      if (!isDynamic) {
        return {
          valid: false,
          error: "Catch-all * segments are only allowed on Dynamic Pages",
        };
      }
      if (i !== parts.length - 1) {
        return {
          valid: false,
          error: "Catch-all * segment must be the last segment of the route",
        };
      }
      if (part.length > 1) {
        const name = part.slice(1);
        if (seen.has(name)) {
          return { valid: false, error: `Duplicate route parameter *${name}` };
        }
        seen.add(name);
      }
      continue;
    }
    return {
      valid: false,
      error: isDynamic
        ? "Segments must use lowercase letters/numbers/hyphens, :param, or a trailing *catchall"
        : "Segments must use lowercase letters, numbers, and hyphens",
    };
  }
  return { valid: true, normalized: cleaned };
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

function firstItemSlug(params: Readonly<Record<string, string>>): string | undefined {
  if (typeof params.slug === "string" && params.slug.length > 0) return params.slug;
  for (const val of Object.values(params)) {
    if (val.length > 0) return val;
  }
  return undefined;
}

function safeDecodeSegment(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

interface PatternCandidate<T extends RoutePageSummary> {
  readonly page: T;
  readonly params: Record<string, string>;
  readonly isCatchAll: boolean;
  readonly staticCount: number;
  readonly prefixLen: number;
  readonly staticMask: number;
}

function matchDynamicPattern<T extends RoutePageSummary>(
  page: T,
  patternSlug: string,
  pathSegments: readonly string[],
): PatternCandidate<T> | null {
  const patternSegments = patternSlug.split("/");
  const lastSegment = patternSegments[patternSegments.length - 1] ?? "";
  const isCatchAll = lastSegment.startsWith("*");

  if (!isCatchAll && patternSegments.length !== pathSegments.length) {
    return null;
  }
  if (isCatchAll && pathSegments.length < patternSegments.length) {
    return null;
  }

  const params: Record<string, string> = {};
  let staticCount = 0;
  let staticMask = 0;
  const fixedLen = isCatchAll ? patternSegments.length - 1 : patternSegments.length;

  for (let i = 0; i < fixedLen; i++) {
    const pat = patternSegments[i] ?? "";
    const seg = pathSegments[i] ?? "";
    if (pat.startsWith(":")) {
      const name = pat.slice(1);
      if (!name || !seg) return null;
      params[name] = safeDecodeSegment(seg);
    } else {
      if (pat !== seg) return null;
      staticCount += 1;
      staticMask += 1 << Math.max(0, 20 - i);
    }
  }

  if (isCatchAll) {
    const rest = pathSegments
      .slice(fixedLen)
      .map(safeDecodeSegment)
      .join("/");
    if (!rest) return null;
    const catchName = lastSegment.length > 1 ? lastSegment.slice(1) : "*";
    params[catchName] = rest;
  }

  return {
    page,
    params,
    isCatchAll,
    staticCount,
    prefixLen: fixedLen,
    staticMask,
  };
}

export function resolveRoutePage<T extends RoutePageSummary>(
  pages: readonly T[],
  target?: string,
): ResolvedRouteMatch<T> | null {
  if (pages.length === 0) return null;

  if (target === undefined) {
    const home =
      pages.find((page) => effectivePageSlug(page) === "" || page.name === "") ??
      pages[0];
    return home ? { page: home, params: {} } : null;
  }

  const byId = pages.find((page) => page.id === target);
  if (byId) return { page: byId, params: {} };

  const clean = normalizeRoutePath(target);
  if (clean === "") {
    const home =
      pages.find((page) => effectivePageSlug(page) === "" || page.name === "") ??
      pages[0];
    return home ? { page: home, params: {} } : null;
  }

  const exact = pages.find((page) => {
    const slug = effectivePageSlug(page);
    return slug === clean && !hasDynamicSegments(slug);
  });
  if (exact) return { page: exact, params: {} };

  const pathSegments = clean.split("/");
  const paramMatches: PatternCandidate<T>[] = [];
  const catchAllMatches: PatternCandidate<T>[] = [];

  for (const page of pages) {
    if (page.type !== "dp") continue;
    const slug = effectivePageSlug(page);
    if (!slug || !hasDynamicSegments(slug)) continue;
    const candidate = matchDynamicPattern(page, slug, pathSegments);
    if (!candidate) continue;
    if (candidate.isCatchAll) {
      catchAllMatches.push(candidate);
    } else {
      paramMatches.push(candidate);
    }
  }

  if (paramMatches.length > 0) {
    paramMatches.sort(
      (a, b) => b.staticCount - a.staticCount || b.staticMask - a.staticMask,
    );
    const best = paramMatches[0]!;
    const itemSlug = firstItemSlug(best.params);
    return {
      page: best.page,
      params: best.params,
      ...(itemSlug ? { itemSlug } : {}),
    };
  }

  if (catchAllMatches.length > 0) {
    catchAllMatches.sort(
      (a, b) =>
        b.prefixLen - a.prefixLen ||
        b.staticCount - a.staticCount ||
        b.staticMask - a.staticMask,
    );
    const best = catchAllMatches[0]!;
    const itemSlug = firstItemSlug(best.params);
    return {
      page: best.page,
      params: best.params,
      ...(itemSlug ? { itemSlug } : {}),
    };
  }

  // Legacy fallback: a `dp` page with a static prefix (e.g. "journal")
  // matches "/journal/<itemSlug>".
  for (const page of pages) {
    if (page.type !== "dp") continue;
    const prefix = effectivePageSlug(page);
    if (prefix && !hasDynamicSegments(prefix) && clean.startsWith(`${prefix}/`)) {
      const rest = clean.slice(prefix.length + 1);
      if (rest) {
        return { page, params: { slug: rest }, itemSlug: rest };
      }
    }
  }

  return null;
}

function lookupBindingValue(
  key: string,
  data?: Record<string, unknown>,
  routeParams?: Readonly<Record<string, string>>,
): string | undefined {
  if (data) {
    let cur: unknown = data;
    for (const part of key.split(".")) {
      if (cur !== null && typeof cur === "object" && part in cur) {
        cur = (cur as Record<string, unknown>)[part];
      } else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" || typeof cur === "number") {
      return String(cur);
    }
    if (
      data.fieldValues !== null &&
      typeof data.fieldValues === "object" &&
      key in (data.fieldValues as Record<string, unknown>)
    ) {
      const fv = (data.fieldValues as Record<string, unknown>)[key];
      if (typeof fv === "string" || typeof fv === "number") {
        return String(fv);
      }
    }
  }
  if (routeParams && key in routeParams) {
    return routeParams[key];
  }
  return undefined;
}

/**
 * Interpolates `{{field}}` placeholders (and `:param` path tokens when
 * non-external) in an element href using CMS item data and/or route params.
 */
export function interpolateHref(
  rawHref: string,
  data?: Record<string, unknown>,
  routeParams?: Readonly<Record<string, string>>,
): string {
  if (!data && !routeParams) return rawHref;
  let next = rawHref.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (match, key: string) => {
    const val = lookupBindingValue(key, data, routeParams);
    return val !== undefined ? encodeURIComponent(val) : match;
  });

  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(next)) {
    next = next.replace(/\/:([a-z][a-z0-9_]*)/g, (match, key: string) => {
      const val = lookupBindingValue(key, data, routeParams);
      return val !== undefined ? `/${encodeURIComponent(val)}` : match;
    });
  }
  return next;
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
