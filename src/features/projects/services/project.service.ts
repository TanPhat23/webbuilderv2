import { URLBuilder } from "@/utils/urlbuilder";
import { Page } from "@/features/pages";
import { Project } from "@/features/projects";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import apiClient from "@/services/apiclient";

export interface ProjectAccessResponse {
  userId: string;
  projectId: string;
  role: string;
  isOwner: boolean;
  isCollaborator: boolean;
}

/** Page as the Go API serializes it (camelCase). */
export interface ApiPage {
  id: string;
  projectId: string;
  name: string;
  type: string;
  styles?: Page["Styles"];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

/** Map the Go API's camelCase page to the app's `Page` shape. */
export function toPage(page: ApiPage): Page {
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

const PROJECT_FONTS = ["Inter", "Lora", "JetBrains Mono"] as const;

export const projectService = {
  getUserProjects: (token: string): Promise<Project[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_USER)
      .build();
    return apiClient.get<Project[]>(url, undefined, token);
  },

  getProjectById: (id: string, token: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_BY_ID(id))
      .build();
    return apiClient.get<Project>(url, undefined, token);
  },

  getProjectPages: (id: string, token: string): Promise<Page[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PAGES(id))
      .build();
    return apiClient
      .get<ApiPage[]>(url, undefined, token)
      .then((pages) => pages.map(toPage));
  },

  getProjectPublic: (id: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC_BY_ID(id))
      .build();
    return apiClient.getPublic<Project>(url);
  },

  getProjects: (): Promise<Project[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC)
      .build();
    return apiClient.getPublic<Project[]>(url);
  },

  getFonts: async (): Promise<string[]> => {
    return [...PROJECT_FONTS];
  },

  createProject: (project: Project, token: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.CREATE)
      .build();
    return apiClient.post<Project>(url, project, undefined, token);
  },

  updateProject: (project: Project, token: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.UPDATE(project.id))
      .build();
    return apiClient.put<Project>(url, project, undefined, token);
  },

  updateProjectPartial: (
    projectId: string,
    updates: Partial<Project>,
    token: string,
  ): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.UPDATE(projectId))
      .build();
    return apiClient.patch<Project>(url, updates, undefined, token);
  },

  deleteProject: (id: string, token: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.DELETE(id))
      .build();
    return apiClient.delete(url, undefined, token);
  },

  /** Create a project (with its first page) owned by the caller. */
  createProjectWithPage: (
    project: { id?: string; name: string; description?: string | null },
    token: string,
  ): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.CREATE)
      .build();
    return apiClient.post<Project>(url, project, undefined, token);
  },

  /** The caller's role on a project; rejects with 404 when they have none. */
  getProjectAccess: (projectId: string, token: string): Promise<ProjectAccessResponse> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.ACCESS(projectId))
      .build();
    return apiClient.get<ProjectAccessResponse>(url, undefined, token);
  },

  /** Create a page; the API requires owner or editor role on the project. */
  createPage: (
    projectId: string,
    page: { id?: string; name: string; type: string; styles?: unknown },
    token: string,
  ): Promise<ApiPage> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PAGES.CREATE(projectId))
      .build();
    return apiClient.post<ApiPage>(url, page, undefined, token);
  },

  deleteProjectPage: (
    projectId: string,
    pageId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.DELETE_PAGE(projectId, pageId))
      .build();
    return apiClient.delete(url, undefined, token);
  },
};
