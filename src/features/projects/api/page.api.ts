import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";
import type { Page } from "@/features/pages";
import {
  CreatePageSchema,
  type CreatePageInput,
  type JsonRecord,
} from "@/features/projects/schema/page";
import { newEntityId } from "@/lib/entity-id";
import { deletePageInputSchema } from "@/features/projects/schema/page-deletion";
import { getAuthToken } from "@/features/auth/lib/gettoken";
import {
  projectService,
  toPage,
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
        type: data.Type,
        styles: (data.Styles ?? {}) as JsonRecord,
      },
      token,
    );
    return toPage(created);
  });

export const deleteProjectPage = createServerFn({ method: "POST" })
  .validator((data: { projectId: string; pageId: string }) =>
    deletePageInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deleteProjectPage(data.projectId, data.pageId, token);
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
