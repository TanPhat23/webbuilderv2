import { createServerFn } from "@tanstack/react-start";
import { pageDAL } from "@/features/projects/data/page";
import type { Page } from "@/features/pages";
import {
  CreatePageSchema,
  type CreatePageInput,
  type JsonRecord,
} from "@/features/projects/schema/page";
import { auth } from "@clerk/tanstack-react-start/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { getAuthToken } from "@/features/auth/lib/gettoken";
import { projectService } from "@/features/projects/services/project.service";

export const createPage = createServerFn({ method: "POST" })
  .inputValidator((data: CreatePageInput) => CreatePageSchema.parse(data))
  .handler(async ({ data }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const page: CreatePageInput = {
      ...data,
      Id: data.Id ?? uuidv4(),
      Styles: (data.Styles ?? null) as JsonRecord | null,
    };

    return pageDAL.createPage(page);
  });

export const deleteProjectPage = createServerFn({ method: "POST" })
  .inputValidator((data: { projectId: string; pageId: string }) =>
    z.object({ projectId: z.string().min(1), pageId: z.string().min(1) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deleteProjectPage(data.projectId, data.pageId, token);
  });
