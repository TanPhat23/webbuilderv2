import { createServerFn } from "@tanstack/react-start";
import { projectDAL } from "@/features/projects/data/project";
import { Project } from "@/features/projects";
import { auth } from "@clerk/tanstack-react-start/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";

const CreateProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
});

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreateProjectSchema.parse(data))
  .handler(async ({ data }) => {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const project: Partial<Project> = {
      ...data,
      id: data.id ?? uuidv4(),
    };

    await projectDAL.createProject(project as Project, userId);

    return { success: true, projectId: project.id };
  });