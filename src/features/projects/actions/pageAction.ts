import { createServerFn } from "@tanstack/react-start";
import { pageDAL } from "@/features/projects/data/page";
import { Page } from "@/features/pages";
import { PageSchema } from "@/features/projects/schema/page";
import { auth } from "@clerk/tanstack-react-start/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const CreatePageSchema = z.object({
  Id: z.string().optional(),
  Name: z.string().min(1),
  ProjectId: z.string(),
  Order: z.number().optional(),
  Slug: z.string().optional(),
});


export const createPage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreatePageSchema.parse(data))
  .handler(async ({ data }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const page: Partial<Page> = {
      ...data,
      Id: data.Id ?? uuidv4(),
    };

    const result = PageSchema.safeParse(page);
    if (result.error) throw new Error(JSON.stringify(result.error));

    const response = await pageDAL.createPage(page as Page);
    return response as any;
  });