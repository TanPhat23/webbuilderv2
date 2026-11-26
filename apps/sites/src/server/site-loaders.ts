import { notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  appendResponseHeader,
  getRequestHeader,
  getRequestProtocol,
  setResponseHeader,
} from "@tanstack/react-start/server";
import {
  AuthRedirectError,
  fetchPreviewSite,
  fetchSubdomainSite,
  type Project,
  type ResolvedSiteAuthResult,
  type SiteApiPage,
} from "@webbuilder/site-runtime/data";
import {
  buildSiteHref,
  isValidSubdomainLabel,
  type SiteRoutingMode,
} from "@webbuilder/site-runtime/routing";
import {
  buildLoginRedirectHref,
  parseProjectAuthConfig,
} from "@webbuilder/site-runtime/auth";
import { resolveSiteSessionFromCookie } from "@webbuilder/site-runtime/supabase-auth";
import { compileProjectTailwindCss } from "@webbuilder/site-runtime/tailwind-ssr";
import { isApiError } from "@webbuilder/site-runtime/api-error";
import {
  fetchPreviewCmsItem,
  fetchPreviewElements,
  fetchPreviewPages,
  fetchPreviewProject,
  fetchPublicCmsItem,
  fetchPublicElements,
  fetchPublicPages,
  fetchPublicProject,
  fetchPublicProjectBySubdomain,
  readPreviewTokenFromCookieHeader,
} from "./go-api";

async function resolveSiteAuthForRequest(
  project: Project,
  page: SiteApiPage,
  matchedPath: string,
  mode: SiteRoutingMode,
): Promise<ResolvedSiteAuthResult> {
  const cfg = parseProjectAuthConfig(project.authConfig);
  if (!cfg || !project.id) {
    return { user: null };
  }

  setResponseHeader("Cache-Control", "private, no-store");
  const cookieHeader = getRequestHeader("cookie");
  const forwardedProto = getRequestHeader("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  const secure =
    forwardedProto === "https" ||
    (!forwardedProto && getRequestProtocol() === "https");

  const session = await resolveSiteSessionFromCookie(
    cfg,
    project.id,
    cookieHeader,
    secure,
  );
  if (session.setCookieHeader) {
    appendResponseHeader("Set-Cookie", session.setCookieHeader);
  }

  if (page.requireAuth && !session.user) {
    const loginHref = buildLoginRedirectHref(mode, cfg.loginPath, matchedPath);
    const currentHref = buildSiteHref(mode, matchedPath);
    if (loginHref !== currentHref) {
      return { user: null, redirectTo: loginHref };
    }
  }

  return { user: session.user };
}

const isId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]{1,128}$/.test(value);

const isOptionalTarget = (value: unknown): value is string | undefined =>
  value === undefined ||
  (typeof value === "string" && value.length <= 255 && !value.includes(".."));

export const getPreviewSite = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((data: { id: string; pageId?: string; pageTarget?: string }) => {
    if (
      !isId(data?.id) ||
      (data.pageId !== undefined && !isId(data.pageId)) ||
      !isOptionalTarget(data?.pageTarget)
    ) {
      throw notFound();
    }
    return data;
  })
  .handler(async ({ data: { id, pageId, pageTarget } }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const cookieHeader = getRequestHeader("cookie");
    const previewToken = readPreviewTokenFromCookieHeader(cookieHeader, id);

    try {
      return await fetchPreviewSite(
        id,
        {
          preferDraft: Boolean(previewToken),
          draftToken: async () => previewToken,
          project: (projectId, token) =>
            token
              ? fetchPreviewProject(projectId, token)
              : fetchPublicProject(projectId),
          pages: (projectId, token) =>
            token
              ? fetchPreviewPages(projectId, token)
              : fetchPublicPages(projectId, !previewToken),
          elements: (projectId, token) =>
            token
              ? fetchPreviewElements(projectId, token)
              : fetchPublicElements(projectId, !previewToken),
          cmsItem: async (contentTypeId, slug, token) => {
            if (token) {
              try {
                return await fetchPreviewCmsItem(id, contentTypeId, slug, token);
              } catch (error) {
                if (isApiError(error) && error.status === 404) return null;
                throw error;
              }
            }
            try {
              return await fetchPublicCmsItem(contentTypeId, slug);
            } catch (error) {
              if (isApiError(error) && error.status === 404) return null;
              throw error;
            }
          },
          resolveAuth: (project, page, matchedPath) =>
            resolveSiteAuthForRequest(project, page, matchedPath, {
              kind: "preview",
              projectId: id,
            }),
          compileCss: (elements) => compileProjectTailwindCss(elements),
        },
        pageTarget ?? pageId,
      );
    } catch (error) {
      if (error instanceof AuthRedirectError) {
        throw redirect({ href: error.location });
      }
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  });

export const getSubdomainSite = createServerFn({
  method: "GET",
  strict: { output: false },
})
  .validator((data: { subdomain: string; pathname?: string }) => {
    const clean =
      typeof data?.subdomain === "string"
        ? data.subdomain.trim().toLowerCase()
        : "";
    if (!isValidSubdomainLabel(clean) || !isOptionalTarget(data?.pathname)) {
      throw notFound();
    }
    return { subdomain: clean, pathname: data?.pathname };
  })
  .handler(async ({ data: { subdomain, pathname } }) => {
    setResponseHeader(
      "Cache-Control",
      "public, max-age=30, stale-while-revalidate=60",
    );
    try {
      return await fetchSubdomainSite(
        subdomain,
        {
          projectBySubdomain: (sub) => fetchPublicProjectBySubdomain(sub),
          pages: (projectId) => fetchPublicPages(projectId, true),
          elements: (projectId) => fetchPublicElements(projectId, true),
          cmsItem: async (contentTypeId, slug) => {
            try {
              return await fetchPublicCmsItem(contentTypeId, slug);
            } catch (error) {
              if (isApiError(error) && error.status === 404) return null;
              throw error;
            }
          },
          resolveAuth: (project, page, matchedPath) =>
            resolveSiteAuthForRequest(project, page, matchedPath, {
              kind: "domain",
              subdomain,
            }),
          compileCss: (elements) => compileProjectTailwindCss(elements),
        },
        pathname,
      );
    } catch (error) {
      if (error instanceof AuthRedirectError) {
        throw redirect({ href: error.location });
      }
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  });
