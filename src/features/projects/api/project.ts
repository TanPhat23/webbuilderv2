import { createServerFn } from "@tanstack/react-start";
import { projectService } from "@/features/projects/services/project.service";
import { auth } from "@clerk/tanstack-react-start/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import type { Project } from "@/features/projects";

const ProjectIdSchema = z.object({
  projectId: z.string(),
});

const CreateProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
});

const UpdateProjectSchema = z.object({
  projectId: z.string(),
  updates: z.object({
    name: z.string().min(1).optional(),
    description: z.string().nullable().optional(),
    published: z.boolean().optional(),
    subdomain: z.string().nullable().optional(),
    styles: z.record(z.string(), z.unknown()).nullable().optional(),
  }),
});

async function getAuthToken(): Promise<{ userId: string; token: string }> {
  const { userId, getToken } = await auth();
  if (!userId) throw new Error("User not authenticated");
  const token = await getToken();
  if (!token) throw new Error("Failed to retrieve auth token");
  return { userId, token };
}

export const getUserProjects = createServerFn({ method: "GET" }).handler(
  async () => {
    const { token } = await getAuthToken();
    return projectService.getUserProjects(token) as any;
  },
);

export const getProjectById = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ProjectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return projectService.getProjectById(data.projectId, token) as any;
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => CreateProjectSchema.parse(data))
  .handler(async ({ data }) => {
    const { userId, token } = await getAuthToken();

    const project: Project = {
      id: data.id ?? uuidv4(),
      name: data.name,
      description: data.description ?? null,
      subdomain: null,
      published: false,
      ownerId: userId,
      styles: null,
      header: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      views: 0,
    };

    return projectService.createProject(project, token) as any;
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => UpdateProjectSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return projectService.updateProjectPartial(data.projectId, data.updates, token) as any;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ProjectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deleteProject(data.projectId, token);
    return { success: true };
  });

export const getProjectPages = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => ProjectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    return projectService.getProjectPages(data.projectId, token) as any;
  });