import { URLBuilder } from "@/lib/utils/urlbuilder";
import { Page } from "@/interfaces/page.interface";
import { Project } from "@/interfaces/project.interface";
import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface IProjectService {
  getProjects: () => Promise<Project[]>;
  getUserProjects: () => Promise<Project[]>;
  getProjectById: (id: string) => Promise<Project>;
  createProject: (project: Project) => Promise<Project>;
  updateProject: (project: Project) => Promise<Project>;
  updateProjectPartial: (
    projectId: string,
    project: Partial<Project>,
  ) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  getProjectPages: (id: string) => Promise<Page[]>;
  deleteProjectPage: (projectId: string, pageId: string) => Promise<boolean>;
  getProjectPublic: (id: string) => Promise<Project>;
  getFonts: () => Promise<string[]>;
}

export const projectService: IProjectService = {
  getProjects: async (): Promise<Project[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC)
      .build();
    return apiClient.getPublic<Project[]>(url);
  },

  getUserProjects: async (): Promise<Project[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_USER)
      .build();
    return apiClient.get<Project[]>(url);
  },

  getProjectById: async (id: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_BY_ID(id))
      .build();
    return apiClient.get<Project>(url);
  },

  deleteProject: async (id: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.DELETE(id))
      .build();
    return apiClient.delete(url);
  },

  createProject: async (project: Project) => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.CREATE)
      .build();
    return await apiClient.post<Project>(url, project);
  },

  updateProject: async (project: Project) => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.UPDATE(project.id))
      .build();
    return await apiClient.put<Project>(url, project);
  },

  getProjectPages: async (id: string): Promise<Page[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PAGES(id))
      .build();
    return apiClient.get<Page[]>(url);
  },

  updateProjectPartial: async (
    projectId: string,
    project: Partial<Project>,
  ): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.UPDATE(projectId))
      .build();
    return apiClient.patch<Project>(url, project);
  },

  deleteProjectPage: async (
    projectId: string,
    pageId: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.DELETE_PAGE(projectId, pageId))
      .build();
    return apiClient.delete(url);
  },

  getFonts: async (): Promise<string[]> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
    if (!response.ok) {
      throw new Error("Failed to fetch fonts");
    }
    const data = await response.json();
    return data.items.map((font: { family: string }) => font.family);
  },

  getProjectPublic: async (id: string): Promise<Project> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC_BY_ID(id))
      .build();
    return apiClient.getPublic<Project>(url);
  },
};
