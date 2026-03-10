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
