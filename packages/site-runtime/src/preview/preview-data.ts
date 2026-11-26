import type { SiteApiPage } from "../types/site";
import type { Project } from "../projects/project.interface";
import type { EditorElement } from "../types/global.type";
import type { SiteAuthUser } from "../lib/site-auth";
import { resolveElements } from "../projects/resolve-elements";
import { ApiError, isApiError } from "../lib/api-error";
import { resolveRoutePage } from "../lib/site-routing";

export type { SiteApiPage, Project };

export class AuthRedirectError extends Error {
  readonly location: string;

  constructor(location: string) {
    super("Authentication required");
    this.name = "AuthRedirectError";
    this.location = location;
  }
}

export interface ResolvedSiteAuthResult {
  readonly user: SiteAuthUser | null;
  readonly redirectTo?: string;
}

export interface PreviewReads {
  preferDraft?: boolean;
  draftToken: () => Promise<string | null | undefined>;
  project: (id: string, token?: string) => Promise<Project>;
  pages: (id: string, token?: string) => Promise<SiteApiPage[]>;
  elements: (id: string, token?: string) => Promise<EditorElement[]>;
  cmsItem?: (
    contentTypeId: string,
    slug: string,
    token?: string,
  ) => Promise<Record<string, unknown> | null>;
  resolveAuth?: (
    project: Project,
    page: SiteApiPage,
    matchedPath: string,
  ) => Promise<ResolvedSiteAuthResult>;
  compileCss?: (elements: readonly EditorElement[]) => Promise<string>;
}

export interface SubdomainSiteReads {
  projectBySubdomain: (subdomain: string) => Promise<Project>;
  pages: (id: string) => Promise<SiteApiPage[]>;
  elements: (id: string) => Promise<EditorElement[]>;
  cmsItem?: (
    contentTypeId: string,
    slug: string,
  ) => Promise<Record<string, unknown> | null>;
  resolveAuth?: (
    project: Project,
    page: SiteApiPage,
    matchedPath: string,
  ) => Promise<ResolvedSiteAuthResult>;
  compileCss?: (elements: readonly EditorElement[]) => Promise<string>;
}

export interface LoadedSitePageData {
  readonly project: Project;
  readonly page: SiteApiPage;
  readonly pages: SiteApiPage[];
  readonly elements: EditorElement[];
  readonly generatedCss?: string;
  readonly params?: Readonly<Record<string, string>>;
  readonly itemSlug?: string;
  readonly matchedPath?: string;
  readonly cmsItem?: Record<string, unknown>;
  readonly user?: SiteAuthUser | null;
}

async function readProjectWithDraftFallback(
  id: string,
  reads: PreviewReads,
): Promise<{ project: Project; token?: string }> {
  if (reads.preferDraft) {
    const prefetchedToken = (await reads.draftToken()) ?? undefined;
    if (prefetchedToken) {
      try {
        return { project: await reads.project(id, prefetchedToken), token: prefetchedToken };
      } catch (draftError) {
        if (!isApiError(draftError) || ![401, 403, 404].includes(draftError.status)) {
          throw draftError;
        }
        // Fall through to public read if preview session expired or was revoked.
      }
    }
    return { project: await reads.project(id) };
  }

  try {
    return { project: await reads.project(id) };
  } catch (error) {
    if (!isApiError(error) || error.status !== 404) throw error;
    const token = (await reads.draftToken()) ?? undefined;
    if (!token) throw error;

    try {
      return { project: await reads.project(id, token), token };
    } catch (draftError) {
      if (isApiError(draftError) && [401, 403, 404].includes(draftError.status)) throw error;
      throw draftError;
    }
  }
}

function collectComponentIds(
  allPages: readonly SiteApiPage[],
  projectElements: readonly EditorElement[],
  hasToken: boolean,
): Set<string> {
  const knownPageIds = new Set(allPages.map(({ id }) => id));
  const componentIds = new Set(
    allPages
      .filter((page) => !page.deletedAt && page.type === "cp")
      .map(({ id }) => id),
  );
  if (!hasToken) {
    for (const element of projectElements) {
      if (!knownPageIds.has(element.pageId)) componentIds.add(element.pageId);
    }
  }
  return componentIds;
}

function resolvePageTree(
  project: Project,
  allPages: SiteApiPage[],
  projectElements: EditorElement[],
  hasToken: boolean,
  target?: string,
  cmsItem?: Record<string, unknown>,
  user?: SiteAuthUser | null,
  generatedCss?: string,
): LoadedSitePageData {
  const pages = allPages.filter((page) => !page.deletedAt && page.type !== "cp");
  const matched = resolveRoutePage(pages, target);
  if (!matched) throw new ApiError("Page not found", 404, "not_found");

  const { page, params, itemSlug, matchedPath } = matched;
  const pageElements = projectElements.filter((element) => element.pageId === page.id);
  const routeIds = new Set(pages.map(({ id: routeId }) => routeId));
  const componentIds = collectComponentIds(allPages, projectElements, hasToken);
  const elements = resolveElements({
    page: pageElements,
    project: projectElements,
    pageIds: routeIds,
    componentIds,
  });
  return {
    project,
    page,
    pages,
    elements,
    ...(generatedCss !== undefined ? { generatedCss } : {}),
    ...(Object.keys(params).length > 0 ? { params } : {}),
    ...(itemSlug ? { itemSlug } : {}),
    matchedPath,
    ...(cmsItem ? { cmsItem } : {}),
    ...(user !== undefined ? { user } : {}),
  };
}

export async function fetchPreviewSite(
  id: string,
  reads: PreviewReads,
  pageTarget?: string,
): Promise<LoadedSitePageData> {
  const { project, token } = await readProjectWithDraftFallback(id, reads);
  const allPages = await reads.pages(id, token);
  const pages = allPages.filter((page) => !page.deletedAt && page.type !== "cp");
  const matched = resolveRoutePage(pages, pageTarget);
  if (!matched) throw new ApiError("Page not found", 404, "not_found");

  let user: SiteAuthUser | null | undefined;
  if (reads.resolveAuth) {
    const authOutcome = await reads.resolveAuth(
      project,
      matched.page,
      matched.matchedPath,
    );
    if (authOutcome.redirectTo) {
      throw new AuthRedirectError(authOutcome.redirectTo);
    }
    user = authOutcome.user;
  }

  let cmsItem: Record<string, unknown> | undefined;
  if (
    matched.page.type === "dp" &&
    matched.page.contentTypeId &&
    matched.itemSlug &&
    reads.cmsItem
  ) {
    const loaded = await reads.cmsItem(
      matched.page.contentTypeId,
      matched.itemSlug,
      token,
    );
    if (!loaded) throw new ApiError("Content item not found", 404, "not_found");
    cmsItem = loaded;
  }

  const projectElements = await reads.elements(id, token);
  const resolved = resolvePageTree(
    project,
    allPages,
    projectElements,
    Boolean(token),
    pageTarget,
    cmsItem,
    user,
  );
  if (!reads.compileCss) return resolved;

  const generatedCss = await reads.compileCss(resolved.elements);
  return { ...resolved, generatedCss };
}

export async function fetchSubdomainSite(
  subdomain: string,
  reads: SubdomainSiteReads,
  pathname?: string,
): Promise<LoadedSitePageData> {
  const project = await reads.projectBySubdomain(subdomain);
  const projectId = project.id;
  if (!projectId) throw new ApiError("Project not found", 404, "not_found");

  const allPages = await reads.pages(projectId);
  const pages = allPages.filter((page) => !page.deletedAt && page.type !== "cp");
  const matched = resolveRoutePage(pages, pathname);
  if (!matched) throw new ApiError("Page not found", 404, "not_found");

  let user: SiteAuthUser | null | undefined;
  if (reads.resolveAuth) {
    const authOutcome = await reads.resolveAuth(
      project,
      matched.page,
      matched.matchedPath,
    );
    if (authOutcome.redirectTo) {
      throw new AuthRedirectError(authOutcome.redirectTo);
    }
    user = authOutcome.user;
  }

  let cmsItem: Record<string, unknown> | undefined;
  if (
    matched.page.type === "dp" &&
    matched.page.contentTypeId &&
    matched.itemSlug &&
    reads.cmsItem
  ) {
    const loaded = await reads.cmsItem(
      matched.page.contentTypeId,
      matched.itemSlug,
    );
    if (!loaded) throw new ApiError("Content item not found", 404, "not_found");
    cmsItem = loaded;
  }

  const projectElements = await reads.elements(projectId);
  const resolved = resolvePageTree(
    project,
    allPages,
    projectElements,
    false,
    pathname,
    cmsItem,
    user,
  );
  if (!reads.compileCss) return resolved;

  const generatedCss = await reads.compileCss(resolved.elements);
  return { ...resolved, generatedCss };
}
