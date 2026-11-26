import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Page } from "@/features/pages";
import {
  CreatePageSchema,
  PageTypeSchema,
  type CreatePageInput,
  type JsonRecord,
} from "@/features/pages/schema/page";
import { newEntityId } from "@/lib/entity-id";
import { deletePageInputSchema } from "@/features/projects/schema/page-deletion";
import { getAuthToken } from "@/features/auth/lib/gettoken";
import {
  projectService,
  mapApiPageToPage,
} from "@/features/projects/services/project.service";

export const createPage = createServerFn({ method: "POST" })
  .validator((data: CreatePageInput) => CreatePageSchema.parse(data))
  .handler(async ({ data }): Promise<Page> => {
    const { token } = await getAuthToken();
    const created = await projectService.createPage(
      data.ProjectId,
      {
        id: data.Id ?? newEntityId(),
        name: data.Name,
        ...(data.Slug !== undefined ? { slug: data.Slug } : {}),
        type: data.Type,
        ...(data.ContentTypeId ? { contentTypeId: data.ContentTypeId } : {}),
        ...(data.RequireAuth !== undefined ? { requireAuth: data.RequireAuth } : {}),
        styles: (data.Styles ?? {}) as JsonRecord,
      },
      token,
    );
    return mapApiPageToPage(created);
  });

const updatePageSchema = z.object({
  projectId: z.string().min(1),
  pageId: z.string().min(1),
  name: z.string().trim().min(1).max(255).optional(),
  slug: z.string().trim().max(200).optional(),
  type: PageTypeSchema.exclude(["cp"]).optional(),
  contentTypeId: z.string().max(255).nullable().optional(),
  requireAuth: z.boolean().optional(),
});

export const updateProjectPage = createServerFn({ method: "POST" })
  .validator(
    (data: {
      projectId: string;
      pageId: string;
      name?: string;
      slug?: string;
      type?: "sp" | "dp";
      contentTypeId?: string | null;
      requireAuth?: boolean;
    }) => updatePageSchema.parse(data),
  )
  .handler(async ({ data }): Promise<Page> => {
    const { token } = await getAuthToken();
    const updated = await projectService.updatePage(
      data.projectId,
      data.pageId,
      {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.slug !== undefined ? { slug: data.slug } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.contentTypeId !== undefined
          ? { contentTypeId: data.contentTypeId ?? "" }
          : {}),
        ...(data.requireAuth !== undefined ? { requireAuth: data.requireAuth } : {}),
      },
      token,
    );
    return mapApiPageToPage(updated);
  });

export const deleteProjectPage = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; pageId: string }) =>
    deletePageInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deletePage(data.projectId, data.pageId, token);
  });

const componentNameSchema = z.string().trim().min(1).max(255);

export const renameComponentPage = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; pageId: string; name: string }) => ({
    ...deletePageInputSchema.parse(data),
    name: componentNameSchema.parse(data.name),
  }))
  .handler(async ({ data }): Promise<void> => {
    const { token } = await getAuthToken();
    await projectService.renamePage(data.projectId, data.pageId, data.name, token);
  });
