import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { sanitizeRedirectPath } from "@webbuilder/site-runtime/auth";
import apiClient from "@/services/apiclient";
import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";

const SAFE_PROJECT_ID = /^[A-Za-z0-9_-]{1,128}$/;

interface PreviewTicketResponse {
  readonly ticket: string;
  readonly expiresIn: number;
}

function isPreviewTicketResponse(value: unknown): value is PreviewTicketResponse {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.ticket === "string" &&
    obj.ticket.length > 0 &&
    typeof obj.expiresIn === "number"
  );
}

export function resolvePreviewOrigin(): string {
  const raw =
    process.env.PREVIEW_ORIGIN ||
    process.env.VITE_PREVIEW_ORIGIN ||
    (typeof import.meta !== "undefined" ? import.meta.env?.VITE_PREVIEW_ORIGIN : undefined) ||
    "http://localhost:3001";
  return raw.trim().replace(/\/+$/, "");
}

export function buildPreviewEnterUrl(
  previewOrigin: string,
  projectId: string,
  ticket: string,
  path?: string,
): string {
  const origin = previewOrigin.trim().replace(/\/+$/, "");
  const safeNext = sanitizeRedirectPath(path, "/");
  const params = new URLSearchParams({
    ticket,
    projectId,
    next: safeNext,
  });
  return `${origin}/api/preview/enter?${params.toString()}`;
}

export function buildDirectPreviewUrl(
  previewOrigin: string,
  projectId: string,
  path?: string,
): string {
  const origin = previewOrigin.trim().replace(/\/+$/, "");
  const safeNext = sanitizeRedirectPath(path, "/");
  const base = `${origin}/preview/${encodeURIComponent(projectId)}`;
  return safeNext === "/" ? base : `${base}${safeNext}`;
}

export async function mintPreviewLaunchUrl(
  projectId: string,
  path?: string,
): Promise<{ readonly url: string; readonly authenticated: boolean }> {
  const origin = resolvePreviewOrigin();
  const safeNext = sanitizeRedirectPath(path, "/");
  const { userId, getToken } = await auth();
  const token = userId ? await getToken() : null;
  if (!token) {
    return {
      url: buildDirectPreviewUrl(origin, projectId, safeNext),
      authenticated: false,
    };
  }

  const endpoint = new URLBuilder("api")
    .setPath(API_ENDPOINTS.PROJECTS.PREVIEW_TICKET(projectId))
    .build();
  const raw = await apiClient.post<unknown>(endpoint, {}, undefined, token);
  if (!isPreviewTicketResponse(raw)) {
    throw new Error("Invalid preview ticket response from server");
  }

  return {
    url: buildPreviewEnterUrl(origin, projectId, raw.ticket, safeNext),
    authenticated: true,
  };
}

export const createPreviewLaunchUrl = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; path?: string }) => {
    const projectId =
      typeof data?.projectId === "string" ? data.projectId.trim() : "";
    if (!SAFE_PROJECT_ID.test(projectId)) {
      throw new Error("Invalid projectId");
    }
    const rawPath =
      typeof data?.path === "string" ? data.path.trim() : undefined;
    return {
      projectId,
      path: rawPath ? sanitizeRedirectPath(rawPath, "/") : "/",
    };
  })
  .handler(async ({ data: { projectId, path } }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    return mintPreviewLaunchUrl(projectId, path);
  });
