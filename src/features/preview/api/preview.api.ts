import { auth } from "@clerk/tanstack-react-start/server";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { elementService } from "@/features/elements/services/element.service";
import { projectService } from "@/features/projects/services/project.service";
import {
  cmsService,
  flattenContentItemRecord,
} from "@/features/cms/services/cms.service";
import { isApiError } from "@/utils/errors/api-error";
import { fetchPreviewSite, fetchSubdomainSite } from "../lib/preview-data";
import { isValidSubdomainLabel } from "@/lib/site-routing";

const isId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value);

const isOptionalTarget = (value: unknown): value is string | undefined =>
  value === undefined || (typeof value === "string" && value.length <= 255 && !value.includes(".."));

// The API responses are JSON, though the element and logic types allow unknown fields.
export const getPreviewSite = createServerFn({ method: "GET", strict: { output: false } })
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
    const { userId, getToken } = await auth();
    try {
      return await fetchPreviewSite(id, {
        draftToken: async () => userId ? getToken() : null,
        project: (id, token) => token
          ? projectService.getProjectById(id, token)
          : projectService.getPublicProject(id),
        pages: (id, token) => token
          ? projectService.listProjectPagesWithLogic(id, token)
          : projectService.listPublicPages(id, { previewCache: !userId }),
        elements: (id, token) => token
          ? elementService.listProjectElements(id, token)
          : elementService.listPublicElements(id, { previewCache: !userId }),
        cmsItem: async (contentTypeId, slug, token) => {
          try {
            return await cmsService.fetchPublicContentItem(contentTypeId, slug);
          } catch (error) {
            if (!isApiError(error) || error.status !== 404) throw error;
            const authToken = token ?? (userId ? ((await getToken()) ?? undefined) : undefined);
            if (!authToken) return null;
            try {
              const item = await cmsService.getPublicContentItem(
                contentTypeId,
                slug,
                authToken,
              );
              return flattenContentItemRecord(item);
            } catch {
              return null;
            }
          }
        },
      }, pageTarget ?? pageId);
    } catch (error) {
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  });

export const getSubdomainSite = createServerFn({ method: "GET", strict: { output: false } })
  .validator((data: { subdomain: string; pathname?: string }) => {
    const clean = typeof data?.subdomain === "string" ? data.subdomain.trim().toLowerCase() : "";
    if (!isValidSubdomainLabel(clean) || !isOptionalTarget(data?.pathname)) {
      throw notFound();
    }
    return { subdomain: clean, pathname: data?.pathname };
  })
  .handler(async ({ data: { subdomain, pathname } }) => {
    setResponseHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    try {
      return await fetchSubdomainSite(subdomain, {
        projectBySubdomain: (sub) => projectService.getPublicProjectBySubdomain(sub),
        pages: (projectId) => projectService.listPublicPages(projectId, { previewCache: true }),
        elements: (projectId) => elementService.listPublicElements(projectId, { previewCache: true }),
        cmsItem: async (contentTypeId, slug) => {
          try {
            return await cmsService.fetchPublicContentItem(contentTypeId, slug);
          } catch (error) {
            if (isApiError(error) && error.status === 404) return null;
            throw error;
          }
        },
      }, pathname);
    } catch (error) {
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  });
