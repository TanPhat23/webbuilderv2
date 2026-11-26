import { auth } from "@clerk/tanstack-react-start/server";
import { projectService } from "@/features/projects/services/project.service";
import {
  parseProjectAuthConfig,
  sanitizeRedirectPath,
  type ProjectAuthConfig,
  type SiteAuthUser,
} from "@/lib/site-auth";
import { isApiError } from "@/utils/errors/api-error";

interface StoredSupabaseSession {
  readonly a: string;
  readonly r?: string;
  readonly e?: number;
}

export interface SupabaseAuthTokens {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresIn?: number;
  readonly user: SiteAuthUser | null;
}

const COOKIE_PREFIX = "wb_sb_";
const MAX_COOKIE_AGE_SEC = 60 * 60 * 24 * 30;
const SUPABASE_TIMEOUT_MS = 10_000;

interface RateBucket {
  count: number;
  resetAt: number;
}

const RATE_WINDOW_MS = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 25;
const rateBuckets = new Map<string, RateBucket>();

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function safeCookieName(projectId: string): string {
  const clean = projectId.replace(/[^A-Za-z0-9_-]/g, "").slice(0, 48);
  return `${COOKIE_PREFIX}${clean}`;
}

export function isSecureRequest(request: Request): boolean {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim().toLowerCase() === "https";
  }
  try {
    const parsed = new URL(request.url);
    return parsed.protocol === "https:";
  } catch {
    return true;
  }
}

export function requestOriginOf(request: Request): string {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const forwardedHost = request.headers
    .get("x-forwarded-host")
    ?.split(",")[0]
    ?.trim();
  const host = forwardedHost || request.headers.get("host");
  if (host) {
    const proto = forwardedProto || (isSecureRequest(request) ? "https" : "http");
    return `${proto}://${host}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

export function verifySameOriginRequest(request: Request): boolean {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  if (fetchSite === "cross-site") return false;

  const originHeader = request.headers.get("origin");
  if (!originHeader) return true;

  try {
    const originUrl = new URL(originHeader);
    const expectedOrigin = new URL(requestOriginOf(request));
    return originUrl.host.toLowerCase() === expectedOrigin.host.toLowerCase();
  } catch {
    return false;
  }
}

export function checkAuthRateLimit(
  request: Request,
  projectId: string,
  action: string,
): boolean {
  const now = Date.now();
  if (rateBuckets.size > 2000) {
    for (const [key, bucket] of rateBuckets.entries()) {
      if (now >= bucket.resetAt) rateBuckets.delete(key);
    }
  }
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("cf-connecting-ip")?.trim() ||
    "unknown";
  const key = `${action}:${projectId}:${ip}`;
  const current = rateBuckets.get(key);
  if (!current || now >= current.resetAt) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }
  current.count += 1;
  return true;
}

function encodeCookieValue(session: StoredSupabaseSession): string {
  return Buffer.from(JSON.stringify(session), "utf8").toString("base64url");
}

function decodeCookieValue(raw: string): StoredSupabaseSession | null {
  if (!raw || raw.length > 8192) return null;
  try {
    const decoded = Buffer.from(raw, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    if (!isRecord(parsed) || typeof parsed.a !== "string" || !parsed.a) {
      return null;
    }
    return {
      a: parsed.a,
      ...(typeof parsed.r === "string" && parsed.r ? { r: parsed.r } : {}),
      ...(typeof parsed.e === "number" ? { e: parsed.e } : {}),
    };
  } catch {
    return null;
  }
}

export function readCookieFromHeader(
  cookieHeader: string | undefined | null,
  name: string,
): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const idx = part.indexOf("=");
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    if (key === name) {
      return part.slice(idx + 1).trim();
    }
  }
  return null;
}

export function buildSessionSetCookie(
  projectId: string,
  tokens: { readonly accessToken: string; readonly refreshToken?: string; readonly expiresIn?: number },
  secure: boolean,
): string {
  const expiresAt = tokens.expiresIn
    ? Date.now() + tokens.expiresIn * 1000
    : undefined;
  const val = encodeCookieValue({
    a: tokens.accessToken,
    ...(tokens.refreshToken ? { r: tokens.refreshToken } : {}),
    ...(expiresAt ? { e: expiresAt } : {}),
  });
  const attrs = [
    `${safeCookieName(projectId)}=${val}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${MAX_COOKIE_AGE_SEC}`,
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

export function buildClearSessionCookie(
  projectId: string,
  secure: boolean,
): string {
  const attrs = [
    `${safeCookieName(projectId)}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];
  if (secure) attrs.push("Secure");
  return attrs.join("; ");
}

function parseSupabaseUser(raw: unknown): SiteAuthUser | null {
  if (!isRecord(raw) || typeof raw.id !== "string" || !raw.id) return null;
  const email = typeof raw.email === "string" ? raw.email : "";
  const userMeta = isRecord(raw.user_metadata) ? raw.user_metadata : undefined;
  const appMeta = isRecord(raw.app_metadata) ? raw.app_metadata : undefined;
  const nameCandidates: readonly unknown[] = [
    userMeta?.full_name,
    userMeta?.name,
    userMeta?.display_name,
  ];
  const name = nameCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );
  const avatarCandidates: readonly unknown[] = [
    userMeta?.avatar_url,
    userMeta?.picture,
  ];
  const avatarUrl = avatarCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === "string" && candidate.trim().length > 0,
  );
  const role =
    typeof appMeta?.role === "string"
      ? appMeta.role
      : typeof raw.role === "string"
        ? raw.role
        : undefined;

  return {
    id: raw.id,
    email,
    ...(name ? { name: name.trim() } : {}),
    ...(avatarUrl ? { avatarUrl: avatarUrl.trim() } : {}),
    ...(role ? { role } : {}),
    ...(userMeta ? { metadata: userMeta } : {}),
  };
}

function extractSupabaseErrorMessage(body: unknown, fallback: string): string {
  if (!isRecord(body)) return fallback;
  const candidates: readonly unknown[] = [
    body.error_description,
    body.msg,
    body.message,
    body.error,
  ];
  const msg = candidates.find(
    (entry): entry is string =>
      typeof entry === "string" && entry.trim().length > 0,
  );
  return msg ? msg.trim() : fallback;
}

async function supabaseAuthRequest(
  cfg: ProjectAuthConfig,
  path: string,
  init: {
    readonly method: "GET" | "POST";
    readonly accessToken?: string;
    readonly body?: Record<string, unknown>;
  },
): Promise<{ readonly ok: boolean; readonly status: number; readonly data: unknown }> {
  const headers: Record<string, string> = {
    apikey: cfg.supabaseAnonKey,
    Accept: "application/json",
  };
  if (init.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }
  if (init.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${cfg.supabaseUrl}${path}`, {
    method: init.method,
    headers,
    ...(init.body ? { body: JSON.stringify(init.body) } : {}),
    signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS),
  });

  let data: unknown = null;
  try {
    const text = await response.text();
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

function parseTokensFromResponse(data: unknown): SupabaseAuthTokens | null {
  if (!isRecord(data) || typeof data.access_token !== "string" || !data.access_token) {
    return null;
  }
  return {
    accessToken: data.access_token,
    ...(typeof data.refresh_token === "string" && data.refresh_token
      ? { refreshToken: data.refresh_token }
      : {}),
    ...(typeof data.expires_in === "number" ? { expiresIn: data.expires_in } : {}),
    user: parseSupabaseUser(data.user),
  };
}

export async function supabaseSignInWithPassword(
  cfg: ProjectAuthConfig,
  email: string,
  password: string,
): Promise<
  | { readonly ok: true; readonly session: SupabaseAuthTokens }
  | { readonly ok: false; readonly status: number; readonly message: string }
> {
  const res = await supabaseAuthRequest(cfg, "/auth/v1/token?grant_type=password", {
    method: "POST",
    body: { email, password },
  });
  if (!res.ok) {
    return {
      ok: false,
      status: res.status === 400 ? 401 : res.status,
      message: extractSupabaseErrorMessage(res.data, "Invalid email or password"),
    };
  }
  const session = parseTokensFromResponse(res.data);
  if (!session) {
    return { ok: false, status: 502, message: "Authentication failed" };
  }
  return { ok: true, session };
}

export async function supabaseSignUp(
  cfg: ProjectAuthConfig,
  email: string,
  password: string,
  name?: string,
  emailRedirectTo?: string,
): Promise<
  | {
      readonly ok: true;
      readonly session: SupabaseAuthTokens | null;
      readonly confirmationRequired: boolean;
    }
  | { readonly ok: false; readonly status: number; readonly message: string }
> {
  const query = emailRedirectTo
    ? `?redirect_to=${encodeURIComponent(emailRedirectTo)}`
    : "";
  const body: Record<string, unknown> = { email, password };
  if (name && name.trim().length > 0) {
    body.data = { full_name: name.trim(), name: name.trim() };
  }
  const res = await supabaseAuthRequest(cfg, `/auth/v1/signup${query}`, {
    method: "POST",
    body,
  });
  if (!res.ok) {
    return {
      ok: false,
      status: res.status >= 400 && res.status < 500 ? res.status : 400,
      message: extractSupabaseErrorMessage(res.data, "Unable to create account"),
    };
  }
  const session = parseTokensFromResponse(res.data);
  return {
    ok: true,
    session,
    confirmationRequired: session === null,
  };
}

export async function supabaseSendMagicLink(
  cfg: ProjectAuthConfig,
  email: string,
  emailRedirectTo?: string,
): Promise<
  | { readonly ok: true }
  | { readonly ok: false; readonly status: number; readonly message: string }
> {
  const query = emailRedirectTo
    ? `?redirect_to=${encodeURIComponent(emailRedirectTo)}`
    : "";
  const res = await supabaseAuthRequest(cfg, `/auth/v1/otp${query}`, {
    method: "POST",
    body: { email, create_user: true },
  });
  if (!res.ok) {
    return {
      ok: false,
      status: res.status >= 400 && res.status < 500 ? res.status : 400,
      message: extractSupabaseErrorMessage(res.data, "Unable to send magic link"),
    };
  }
  return { ok: true };
}

export async function supabaseVerifyOtp(
  cfg: ProjectAuthConfig,
  tokenHash: string,
  type: string,
): Promise<
  | { readonly ok: true; readonly session: SupabaseAuthTokens }
  | { readonly ok: false; readonly status: number; readonly message: string }
> {
  const res = await supabaseAuthRequest(cfg, "/auth/v1/verify", {
    method: "POST",
    body: { token_hash: tokenHash, type },
  });
  if (!res.ok) {
    return {
      ok: false,
      status: 401,
      message: extractSupabaseErrorMessage(res.data, "Invalid or expired link"),
    };
  }
  const session = parseTokensFromResponse(res.data);
  if (!session) {
    return { ok: false, status: 401, message: "Invalid or expired link" };
  }
  return { ok: true, session };
}

export async function supabaseGetUser(
  cfg: ProjectAuthConfig,
  accessToken: string,
): Promise<SiteAuthUser | null> {
  const res = await supabaseAuthRequest(cfg, "/auth/v1/user", {
    method: "GET",
    accessToken,
  });
  if (!res.ok) return null;
  return parseSupabaseUser(res.data);
}

export async function supabaseRefreshSession(
  cfg: ProjectAuthConfig,
  refreshToken: string,
): Promise<SupabaseAuthTokens | null> {
  const res = await supabaseAuthRequest(
    cfg,
    "/auth/v1/token?grant_type=refresh_token",
    {
      method: "POST",
      body: { refresh_token: refreshToken },
    },
  );
  if (!res.ok) return null;
  return parseTokensFromResponse(res.data);
}

export async function supabaseSignOut(
  cfg: ProjectAuthConfig,
  accessToken: string,
): Promise<void> {
  try {
    await supabaseAuthRequest(cfg, "/auth/v1/logout", {
      method: "POST",
      accessToken,
    });
  } catch {
    // Clearing the HttpOnly cookie still signs the visitor out locally.
  }
}

export async function supabaseTestConnection(
  cfg: ProjectAuthConfig,
): Promise<
  | {
      readonly ok: true;
      readonly emailEnabled: boolean;
      readonly signupEnabled: boolean;
    }
  | { readonly ok: false; readonly message: string }
> {
  try {
    const res = await supabaseAuthRequest(cfg, "/auth/v1/settings", {
      method: "GET",
    });
    if (!res.ok) {
      return {
        ok: false,
        message: extractSupabaseErrorMessage(
          res.data,
          `Supabase responded with HTTP ${res.status}`,
        ),
      };
    }
    const external =
      isRecord(res.data) && isRecord(res.data.external)
        ? res.data.external
        : undefined;
    const disableSignup =
      isRecord(res.data) && res.data.disable_signup === true;
    return {
      ok: true,
      emailEnabled: external?.email !== false,
      signupEnabled: !disableSignup,
    };
  } catch {
    return {
      ok: false,
      message: "Could not reach Supabase Auth endpoint",
    };
  }
}

export async function resolveSiteSessionFromCookie(
  cfg: ProjectAuthConfig,
  projectId: string,
  cookieHeader: string | undefined | null,
  secure: boolean,
): Promise<{
  readonly user: SiteAuthUser | null;
  readonly setCookieHeader?: string;
}> {
  const rawCookie = readCookieFromHeader(cookieHeader, safeCookieName(projectId));
  if (!rawCookie) return { user: null };

  const stored = decodeCookieValue(rawCookie);
  if (!stored) {
    return {
      user: null,
      setCookieHeader: buildClearSessionCookie(projectId, secure),
    };
  }

  const user = await supabaseGetUser(cfg, stored.a);
  if (user) {
    return { user };
  }

  if (stored.r) {
    const refreshed = await supabaseRefreshSession(cfg, stored.r);
    if (refreshed) {
      const verifiedUser =
        refreshed.user ?? (await supabaseGetUser(cfg, refreshed.accessToken));
      if (verifiedUser) {
        return {
          user: verifiedUser,
          setCookieHeader: buildSessionSetCookie(projectId, refreshed, secure),
        };
      }
    }
  }

  return {
    user: null,
    setCookieHeader: buildClearSessionCookie(projectId, secure),
  };
}

export async function loadProjectAuthConfigForSite(
  projectId: string,
): Promise<ProjectAuthConfig | null> {
  try {
    const project = await projectService.getPublicProject(projectId);
    return parseProjectAuthConfig(project.authConfig);
  } catch (error) {
    if (!isApiError(error) || error.status !== 404) {
      return null;
    }
    try {
      const { userId, getToken } = await auth();
      const token = userId ? await getToken() : null;
      if (!token) return null;
      const project = await projectService.getProjectById(projectId, token);
      return parseProjectAuthConfig(project.authConfig);
    } catch {
      return null;
    }
  }
}

export function buildMagicLinkCallbackUrl(
  request: Request,
  projectId: string,
  nextPath: string,
): string {
  const origin = requestOriginOf(request);
  const safeNext = sanitizeRedirectPath(nextPath, "/");
  return `${origin}/api/site-auth/callback?projectId=${encodeURIComponent(projectId)}&next=${encodeURIComponent(safeNext)}`;
}
