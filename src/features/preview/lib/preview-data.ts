import type { ApiPage } from "@/features/projects/services/project.service";
import type { Project } from "@/features/projects";
import type { EditorElement } from "@/types/global.type";
import { resolveElements } from "@/features/projects/lib/resolve-elements";
import { ApiError, isApiError } from "@/services/api-error";

interface PreviewReads {
  draftToken: () => Promise<string | null | undefined>;
  project: (id: string, token?: string) => Promise<Project>;
  pages: (id: string, token?: string) => Promise<ApiPage[]>;
  elements: (id: string, token?: string) => Promise<EditorElement[]>;
}

export async function loadPreviewData(id: string, reads: PreviewReads, pageId?: string) {
  let project: Project;
  let token: string | undefined;
  try {
    project = await reads.project(id);
  } catch (error) {
    if (!isApiError(error) || error.status !== 404) throw error;
    token = (await reads.draftToken()) ?? undefined;
    if (!token) throw error;

    try {
      project = await reads.project(id, token);
    } catch (draftError) {
      if (isApiError(draftError) && [401, 403, 404].includes(draftError.status)) throw error;
      throw draftError;
    }
  }

  const allPages = await reads.pages(id, token);
  const pages = allPages.filter((page) => !page.deletedAt && page.type !== "cp");
  const page = pageId === undefined
    ? pages.find((page) => page.name === "") ?? pages[0]
    : pages.find((page) => page.id === pageId);
  if (!page) throw new ApiError("Page not found", 404, "not_found");

  const projectElements = await reads.elements(id, token);
  const pageElements = projectElements.filter((element) => element.pageId === page.id);
  const routeIds = new Set(pages.map(({ id }) => id));
  const knownPageIds = new Set(allPages.map(({ id }) => id));
  const componentIds = new Set(allPages.filter((page) => !page.deletedAt && page.type === "cp").map(({ id }) => id));
  if (!token) {
    // Public page metadata lists routes. Non-route roots can only be reached
    // through a stored component reference with a matching page and root ID.
    for (const element of projectElements) {
      if (!knownPageIds.has(element.pageId)) componentIds.add(element.pageId);
    }
  }
  const elements = resolveElements({ page: pageElements, project: projectElements, pageIds: routeIds, componentIds });
  return { project, page, elements };
}
