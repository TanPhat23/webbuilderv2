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
  type ApiPage,
} from "@/features/projects/services/project.service";

export const createPage = createServerFn({ method: "POST" })
  .inputValidator((data: CreatePageInput) => CreatePageSchema.parse(data))
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

/** Map the Go API's camelCase page to the app's `Page` shape. */
function toPage(page: ApiPage): Page {
  return {
    Id: page.id,
    Name: page.name,
    Type: page.type,
    Styles: page.styles ?? null,
    ProjectId: page.projectId,
    CreatedAt: new Date(page.createdAt),
    UpdatedAt: new Date(page.updatedAt),
    DeletedAt: page.deletedAt ? new Date(page.deletedAt) : null,
  };
}

export const deleteProjectPage = createServerFn({ method: "POST" })
  .inputValidator((data: { projectId: string; pageId: string }) =>
    deletePageInputSchema.parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deleteProjectPage(data.projectId, data.pageId, token);
  });
