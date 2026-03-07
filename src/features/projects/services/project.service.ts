import { URLBuilder } from "@/utils/urlbuilder";
import { Page } from "@/features/pages";
import { Project } from "@/features/projects";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import apiClient from "@/services/apiclient";

export const projectService = {
  getUserProjects: (token: string): Promise<Project[]> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_USER).build();
    return apiClient.get<Project[]>(url, undefined, token);
  },

  getProjectById: (id: string, token: string): Promise<Project> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_BY_ID(id)).build();
    return apiClient.get<Project>(url, undefined, token);
  },

  getProjectPages: (id: string, token: string): Promise<Page[]> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PAGES(id)).build();
    return apiClient.get<Page[]>(url, undefined, token);
  },

  getProjectPublic: (id: string): Promise<Project> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC_BY_ID(id)).build();
    return apiClient.getPublic<Project>(url);
  },

  getProjects: (): Promise<Project[]> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.GET_PUBLIC).build();
    return apiClient.getPublic<Project[]>(url);
  },

  createProject: (project: Project, token: string): Promise<Project> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.CREATE).build();
    return apiClient.post<Project>(url, project, undefined, token);
  },

  updateProject: (project: Project, token: string): Promise<Project> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.UPDATE(project.id)).build();
    return apiClient.put<Project>(url, project, undefined, token);
  },

  updateProjectPartial: (projectId: string, updates: Partial<Project>, token: string): Promise<Project> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.UPDATE(projectId)).build();
    return apiClient.patch<Project>(url, updates, undefined, token);
  },

  deleteProject: (id: string, token: string): Promise<boolean> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.DELETE(id)).build();
    return apiClient.delete(url, undefined, token);
  },

  deleteProjectPage: (projectId: string, pageId: string, token: string): Promise<boolean> => {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.PROJECTS.DELETE_PAGE(projectId, pageId)).build();
    return apiClient.delete(url, undefined, token);
  },
};