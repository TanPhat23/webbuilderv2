"use server";
import { projectDAL } from "@/features/projects/data/project";
import { Project } from "@/features/projects";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

export default async function createProject(project: Partial<Project>) {
  const { userId } = await auth();

  if (!project) {
    throw new Error("Project data is required");
  }

  if (!userId) {
    throw new Error("User not authenticated");
  }

  project.id ??= uuidv4();

  await projectDAL.createProject(project as Project, userId);

  revalidatePath("/dashboard");
}
