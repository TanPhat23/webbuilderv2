import { createServerFn } from "@tanstack/react-start";
import { projectService } from "@/features/projects/services/project.service";
import { auth } from "@clerk/tanstack-react-start/server";
import { v4 as uuidv4 } from "uuid";
import type { Page } from "@/features/pages";
import type { Project } from "@/features/projects";
import {
  CreateProjectInput,
  CreateProjectSchema,
  ProjectIdInput,
  ProjectIdSchema,
  ProjectUpdateFields,
  UpdateProjectInput,
  UpdateProjectSchema,
} from "../schema/project";
import { getAuthToken } from "@/features/auth/lib/gettoken";
import { projectDAL } from "../data/project";
import { mapPrismaProjectToProject } from "../lib/mappers";

export const getUserProjects = createServerFn({ method: "GET" }).handler(
  async (): Promise<Project[]> => {
    const { token } = await getAuthToken();
    return projectService.getUserProjects(token);
  },
);

export const getProjectById = createServerFn({ method: "GET" })
  .inputValidator((data: ProjectIdInput) => ProjectIdSchema.parse(data))
  .handler(async ({ data }): Promise<Project> => {
    const { token } = await getAuthToken();
    return projectService.getProjectById(data.projectId, token);
  });

export const createProject = createServerFn({ method: "POST" })
  .inputValidator((data: CreateProjectInput) => CreateProjectSchema.parse(data))
  .handler(async ({ data }): Promise<Project> => {
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

    const newProject = await projectDAL.createProject(project, userId);
    return mapPrismaProjectToProject(newProject);
  });

export const updateProject = createServerFn({ method: "POST" })
  .inputValidator((data: UpdateProjectInput) => UpdateProjectSchema.parse(data))
  .handler(async ({ data }): Promise<Project> => {
    const { token } = await getAuthToken();
    const updates: ProjectUpdateFields = data.updates;
    return projectService.updateProjectPartial(
      data.projectId,
      updates as Partial<Project>,
      token,
    );
  });

export const deleteProject = createServerFn({ method: "POST" })
  .inputValidator((data: ProjectIdInput) => ProjectIdSchema.parse(data))
  .handler(async ({ data }) => {
    const { token } = await getAuthToken();
    await projectService.deleteProject(data.projectId, token);
    return { success: true };
  });

export const getProjectPages = createServerFn({ method: "GET" })
  .inputValidator((data: ProjectIdInput) => ProjectIdSchema.parse(data))
  .handler(async ({ data }): Promise<Page[]> => {
    const { token } = await getAuthToken();
    return projectService.getProjectPages(data.projectId, token);
  });
