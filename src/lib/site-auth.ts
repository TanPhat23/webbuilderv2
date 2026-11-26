import { buildSiteHref, type SiteRoutingMode } from "./site-routing";

export type AuthVisibility = "always" | "authenticated" | "guest";
export type FormAuthAction = "login" | "signup" | "magic-link" | "logout";

export interface ProjectAuthConfig {
  readonly provider: "supabase";
  readonly supabaseUrl: string;
  readonly supabaseAnonKey: string;
  readonly loginPath?: string;
  readonly afterLoginPath?: string;
}

export interface SiteAuthUser {
  readonly id: string;
  readonly email: string;
  readonly name?: string;
  readonly avatarUrl?: string;
  readonly role?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

const VALID_SUPABASE_HOST = /^[a-z0-9][a-z0-9-]{0,62}\.supabase\.(?:co|in)$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function decodeBase64UrlToString(segment: string): string | null {
  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    if (typeof atob === "function") {
      return atob(padded);
    }
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function isSupabaseServiceRoleKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.startsWith("sb_secret_")) return true;
  const parts = trimmed.split(".");
  if (parts.length !== 3) return false;
  const decoded = decodeBase64UrlToString(parts[1] ?? "");
  if (!decoded) return false;
  try {
    const parsed: unknown = JSON.parse(decoded);
    if (!isRecord(parsed)) return false;
    return (
      typeof parsed.role === "string" &&
      parsed.role.toLowerCase() === "service_role"
    );
  } catch {
    return false;
  }
}

export function validateSupabaseUrl(
  raw: string,
):
  | { readonly valid: true; readonly normalized: string }
  | { readonly valid: false; readonly error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Supabase Project URL is required" };
  }
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      valid: false,
      error: "Supabase URL must be a valid https://<project>.supabase.co URL",
    };
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.port !== "" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    (parsed.pathname !== "" && parsed.pathname !== "/")
  ) {
    return {
      valid: false,
      error:
        "Supabase URL must be https://<project>.supabase.co with no path, port, or query",
    };
  }
  const host = parsed.hostname.toLowerCase();
  if (!VALID_SUPABASE_HOST.test(host)) {
    return {
      valid: false,
      error: "Supabase URL must point to a *.supabase.co or *.supabase.in host",
    };
  }
  return { valid: true, normalized: `https://${host}` };
}

export function validateSupabaseAnonKey(
  raw: string,
):
  | { readonly valid: true; readonly normalized: string }
  | { readonly valid: false; readonly error: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { valid: false, error: "Supabase Publishable / Anon Key is required" };
  }
  if (trimmed.length > 1024 || /\s/.test(trimmed)) {
    return {
      valid: false,
      error: "Supabase key must be 1024 characters or fewer with no whitespace",
    };
  }
  if (isSupabaseServiceRoleKey(trimmed)) {
    return {
      valid: false,
      error:
        "Never use a Supabase secret or service_role key here — use the public anon or publishable key",
    };
  }
  return { valid: true, normalized: trimmed };
}

export function sanitizeRedirectPath(
  raw: string | null | undefined,
  fallback = "/",
): string {
  const safeFallback =
    fallback.startsWith("/") && !fallback.startsWith("//") ? fallback : "/";
  if (typeof raw !== "string") return safeFallback;
  const trimmed = raw.trim();
  if (
    !trimmed ||
    trimmed.length > 512 ||
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    /[\\\r\n\t]/.test(trimmed)
  ) {
    return safeFallback;
  }
  return trimmed;
}

export function parseProjectAuthConfig(raw: unknown): ProjectAuthConfig | null {
  if (!isRecord(raw)) return null;
  if (raw.provider !== "supabase") return null;
  if (typeof raw.supabaseUrl !== "string" || typeof raw.supabaseAnonKey !== "string") {
    return null;
  }
  const checkedUrl = validateSupabaseUrl(raw.supabaseUrl);
  const checkedKey = validateSupabaseAnonKey(raw.supabaseAnonKey);
  if (!checkedUrl.valid || !checkedKey.valid) return null;

  const loginPath = sanitizeRedirectPath(
    typeof raw.loginPath === "string" ? raw.loginPath : "/login",
    "/login",
  );
  const afterLoginPath = sanitizeRedirectPath(
    typeof raw.afterLoginPath === "string" ? raw.afterLoginPath : "/",
    "/",
  );

  return {
    provider: "supabase",
    supabaseUrl: checkedUrl.normalized,
    supabaseAnonKey: checkedKey.normalized,
    loginPath,
    afterLoginPath,
  };
}

export function buildLoginRedirectHref(
  mode: SiteRoutingMode,
  loginPath: string | undefined,
  requestedPath: string,
): string {
  const safeLogin = sanitizeRedirectPath(loginPath, "/login");
  const targetLoginHref = buildSiteHref(mode, safeLogin);
  const safeNext = sanitizeRedirectPath(requestedPath, "/");
  const nextHref = buildSiteHref(mode, safeNext);

  if (targetLoginHref === nextHref) {
    return targetLoginHref;
  }
  return `${targetLoginHref}?next=${encodeURIComponent(nextHref)}`;
}

export function shouldRenderForAuthVisibility(
  visibility: unknown,
  isAuthenticated: boolean,
): boolean {
  if (visibility === "authenticated") return isAuthenticated;
  if (visibility === "guest") return !isAuthenticated;
  return true;
}

export function readElementAuthVisibility(
  settings: unknown,
): AuthVisibility | undefined {
  if (!isRecord(settings)) return undefined;
  const raw = settings.authVisibility;
  if (raw === "always" || raw === "authenticated" || raw === "guest") {
    return raw;
  }
  return undefined;
}
