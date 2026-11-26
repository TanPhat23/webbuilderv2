import type { EditorElement, Project, SiteApiPage } from "@webbuilder/site-runtime";
import {
  networkError,
  parseErrorResponse,
} from "@webbuilder/site-runtime/api-error";
import type { ProjectAuthConfig } from "@webbuilder/site-runtime/auth";
import {
  readCookieFromHeader,
  resolveProjectAuthConfig,
  safePreviewCookieName,
} from "@webbuilder/site-runtime/supabase-auth";

const REQUEST_TIMEOUT_MS = 15_000;

function goServerBaseUrl(): string {
  const raw =
    process.env.GO_SERVER_URL ||
    (typeof import.meta !== "undefined" ? import.meta.env?.VITE_GO_SERVER_URL : undefined) ||
    "http://localhost:8080";
  return raw.replace(/\/+$/, "");
}

function encodeSlugPath(slug: string): string {
  return slug
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(encodeURIComponent)
    .join("/");
}

async function fetchGoJson<T>(
  path: string,
  init: {
    readonly method?: "GET" | "POST";
    readonly headers?: Readonly<Record<string, string>>;
    readonly body?: unknown;
  } = {},
): Promise<T> {
  const method = init.method ?? "GET";
  const url = `${goServerBaseUrl()}${path}`;
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(init.headers ?? {}),
  };

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      ...(init.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause: unknown) {
    throw networkError(cause, { method, url });
  }

  const text = await response.text().catch(() => "");
  if (!response.ok) {
    throw parseErrorResponse(response.status, text, { method, url });
  }
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

export interface PreviewExchangeResult {
  readonly token: string;
  readonly projectId: string;
  readonly expiresIn: number;
}

function isPreviewExchangeResult(value: unknown): value is PreviewExchangeResult {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.token === "string" &&
    obj.token.length > 0 &&
    typeof obj.projectId === "string" &&
    obj.projectId.length > 0 &&
    typeof obj.expiresIn === "number" &&
    obj.expiresIn > 0
  );
}

export async function exchangePreviewTicket(
  ticket: string,
): Promise<PreviewExchangeResult> {
  const secret = process.env.PREVIEW_INTERNAL_SECRET?.trim() ?? "";
  if (!secret) {
    throw parseErrorResponse(
      503,
      JSON.stringify({ error: "Preview exchange secret is not configured" }),
      { method: "POST", url: "/api/v1/preview/exchange" },
    );
  }
  const raw = await fetchGoJson<unknown>("/api/v1/preview/exchange", {
    method: "POST",
    headers: { "X-Preview-Internal-Secret": secret },
    body: { ticket },
  });
  if (!isPreviewExchangeResult(raw)) {
    throw parseErrorResponse(
      502,
      JSON.stringify({ error: "Invalid preview exchange response" }),
      { method: "POST", url: "/api/v1/preview/exchange" },
    );
  }
  return raw;
}

export function fetchPublicProject(projectId: string): Promise<Project> {
  return fetchGoJson<Project>(
    `/api/v1/projects/public/${encodeURIComponent(projectId)}`,
  );
}

export function fetchPublicProjectBySubdomain(
  subdomain: string,
): Promise<Project> {
  return fetchGoJson<Project>(
    `/api/v1/projects/public/by-subdomain/${encodeURIComponent(subdomain)}`,
  );
}

export function fetchPublicPages(
  projectId: string,
  previewCache = false,
): Promise<SiteApiPage[]> {
  const query = previewCache ? "?previewCache=1" : "";
  return fetchGoJson<SiteApiPage[]>(
    `/api/v1/pages/public/${encodeURIComponent(projectId)}${query}`,
  );
}

export function fetchPublicElements(
  projectId: string,
  previewCache = false,
): Promise<EditorElement[]> {
  const query = previewCache ? "?previewCache=1" : "";
  return fetchGoJson<EditorElement[]>(
    `/api/v1/elements/public/${encodeURIComponent(projectId)}${query}`,
  );
}

export interface CmsListOptions {
  readonly limit?: number;
  readonly sortBy?: "title" | "createdAt" | "updatedAt";
  readonly sortOrder?: "asc" | "desc";
}

export function fetchPublicCmsList(
  contentTypeId: string,
  options: CmsListOptions = {},
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams({ contentTypeId });
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.sortBy) params.set("sortBy", options.sortBy);
  if (options.sortOrder) params.set("sortOrder", options.sortOrder);
  return fetchGoJson<Record<string, unknown>[]>(
    `/api/v1/public/content?${params.toString()}`,
  );
}

export function fetchPublicCmsItem(
  contentTypeId: string,
  slug: string,
): Promise<Record<string, unknown>> {
  return fetchGoJson<Record<string, unknown>>(
    `/api/v1/public/content/${encodeURIComponent(contentTypeId)}/${encodeSlugPath(slug)}`,
  );
}

export function fetchPreviewProject(
  projectId: string,
  previewToken: string,
): Promise<Project> {
  return fetchGoJson<Project>(
    `/api/v1/preview/${encodeURIComponent(projectId)}/project`,
    { headers: { "X-Preview-Token": previewToken } },
  );
}

export function fetchPreviewPages(
  projectId: string,
  previewToken: string,
): Promise<SiteApiPage[]> {
  return fetchGoJson<SiteApiPage[]>(
    `/api/v1/preview/${encodeURIComponent(projectId)}/pages`,
    { headers: { "X-Preview-Token": previewToken } },
  );
}

export function fetchPreviewElements(
  projectId: string,
  previewToken: string,
): Promise<EditorElement[]> {
  return fetchGoJson<EditorElement[]>(
    `/api/v1/preview/${encodeURIComponent(projectId)}/elements`,
    { headers: { "X-Preview-Token": previewToken } },
  );
}

export function fetchPreviewCmsList(
  projectId: string,
  contentTypeId: string,
  previewToken: string,
  options: CmsListOptions = {},
): Promise<Record<string, unknown>[]> {
  const params = new URLSearchParams();
  if (options.limit !== undefined) params.set("limit", String(options.limit));
  if (options.sortBy) params.set("sortBy", options.sortBy);
  if (options.sortOrder) params.set("sortOrder", options.sortOrder);
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return fetchGoJson<Record<string, unknown>[]>(
    `/api/v1/preview/${encodeURIComponent(projectId)}/cms/${encodeURIComponent(contentTypeId)}${query}`,
    { headers: { "X-Preview-Token": previewToken } },
  );
}

export function fetchPreviewCmsItem(
  projectId: string,
  contentTypeId: string,
  slug: string,
  previewToken: string,
): Promise<Record<string, unknown>> {
  return fetchGoJson<Record<string, unknown>>(
    `/api/v1/preview/${encodeURIComponent(projectId)}/cms/${encodeURIComponent(contentTypeId)}/item/${encodeSlugPath(slug)}`,
    { headers: { "X-Preview-Token": previewToken } },
  );
}

export function readPreviewTokenFromCookieHeader(
  cookieHeader: string | null | undefined,
  projectId: string,
): string | null {
  return readCookieFromHeader(cookieHeader, safePreviewCookieName(projectId));
}

export async function loadProjectAuthConfigForRequest(
  projectId: string,
  request: Request,
): Promise<ProjectAuthConfig | null> {
  const previewToken = readPreviewTokenFromCookieHeader(
    request.headers.get("cookie"),
    projectId,
  );
  return resolveProjectAuthConfig(
    () => fetchPublicProject(projectId),
    previewToken ? () => fetchPreviewProject(projectId, previewToken) : undefined,
  );
}
