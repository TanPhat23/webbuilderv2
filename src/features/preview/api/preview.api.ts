import { auth } from "@clerk/tanstack-react-start/server";
import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { elementService } from "@/features/editor/services/element.service";
import { projectService } from "@/features/projects/services/project.service";
import { isApiError } from "@/utils/errors/api-error";
import { loadPreviewData } from "../lib/preview-data";

const isId = (value: unknown): value is string =>
  typeof value === "string" && /^[A-Za-z0-9_-]+$/.test(value);

// The API responses are JSON, though the element and logic types allow unknown fields.
export const getPreviewData = createServerFn({ method: "GET", strict: { output: false } })
  .validator((data: { id: string; pageId?: string }) => {
    if (!isId(data?.id) || (data.pageId !== undefined && !isId(data.pageId))) throw notFound();
    return data;
  })
  .handler(async ({ data: { id, pageId } }) => {
    setResponseHeader("Cache-Control", "private, no-store");
    const { userId, getToken } = await auth();
    try {
      return await loadPreviewData(id, {
        draftToken: async () => userId ? getToken() : null,
        project: (id, token) => token
          ? projectService.getProjectById(id, token)
          : projectService.getProjectPublic(id),
        pages: (id, token) => token
          ? projectService.getProjectPagesWithLogic(id, token)
          : projectService.getPagesPublic(id, { previewCache: !userId }),
        elements: (id, token) => token
          ? elementService.getElements(id, token)
          : elementService.getElementsPublic(id, { previewCache: !userId }),
      }, pageId);
    } catch (error) {
      if (isApiError(error) && error.status === 404) throw notFound();
      throw error;
    }
  });
