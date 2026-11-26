import type { ApiPage } from "@/features/projects/services/project.service";
import type { Project } from "@/features/projects";
import type { EditorElement } from "@/types/global.type";
import type { SiteAuthUser } from "@/lib/site-auth";
import { resolveElements } from "@/features/projects/lib/resolve-elements";
import { ApiError, isApiError } from "@/utils/errors/api-error";
import { resolveRoutePage } from "@/lib/site-routing";

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

interface PreviewReads {
  draftToken: () => Promise<string | null | undefined>;
  project: (id: string, token?: string) => Promise<Project>;
  pages: (id: string, token?: string) => Promise<ApiPage[]>;
  elements: (id: string, token?: string) => Promise<EditorElement[]>;
  cmsItem?: (
    contentTypeId: string,
    slug: string,
    token?: string,
  ) => Promise<Record<string, unknown> | null>;
  resolveAuth?: (
    project: Project,
    page: ApiPage,
    matchedPath: string,
  ) => Promise<ResolvedSiteAuthResult>;
}

interface SubdomainSiteReads {
  projectBySubdomain: (subdomain: string) => Promise<Project>;
  pages: (id: string) => Promise<ApiPage[]>;
  elements: (id: string) => Promise<EditorElement[]>;
  cmsItem?: (
    contentTypeId: string,
    slug: string,
  ) => Promise<Record<string, unknown> | null>;
  resolveAuth?: (
    project: Project,
    page: ApiPage,
    matchedPath: string,
  ) => Promise<ResolvedSiteAuthResult>;
}

export interface LoadedSitePageData {
  readonly project: Project;
  readonly page: ApiPage;
  readonly pages: ApiPage[];
  readonly elements: EditorElement[];
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
  allPages: readonly ApiPage[],
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
    // Public page metadata lists routes. Non-route roots can only be reached
    // through a stored component reference with a matching page and root ID.
    for (const element of projectElements) {
      if (!knownPageIds.has(element.pageId)) componentIds.add(element.pageId);
    }
  }
  return componentIds;
}

function resolvePageTree(
  project: Project,
  allPages: ApiPage[],
  projectElements: EditorElement[],
  hasToken: boolean,
  target?: string,
  cmsItem?: Record<string, unknown>,
  user?: SiteAuthUser | null,
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
  return resolvePageTree(
    project,
    allPages,
    projectElements,
    Boolean(token),
    pageTarget,
    cmsItem,
    user,
  );
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
  return resolvePageTree(
    project,
    allPages,
    projectElements,
    false,
    pathname,
    cmsItem,
    user,
  );
}
