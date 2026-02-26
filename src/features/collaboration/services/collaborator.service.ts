import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import apiClient from "@/services/apiclient";
import {
  Collaborator,
  UpdateCollaboratorRoleRequest,
  CollaboratorListResponse,
} from "@/features/collaboration";

interface ICollaboratorService {
  getProjectCollaborators: (projectId: string) => Promise<Collaborator[]>;
  updateCollaboratorRole: (
    collaboratorId: string,
    data: UpdateCollaboratorRoleRequest,
  ) => Promise<Collaborator>;
  removeCollaborator: (collaboratorId: string) => Promise<boolean>;
  leaveProject: (projectId: string) => Promise<boolean>;
}

export const collaboratorService: ICollaboratorService = {
  getProjectCollaborators: async (
    projectId: string,
  ): Promise<Collaborator[]> => {
    try {
      const url = new URLBuilder("api")
        .setPath(API_ENDPOINTS.COLLABORATORS.GET_BY_PROJECT(projectId))
        .build();
      const response = await apiClient.get<CollaboratorListResponse>(url);
      return Array.isArray(response?.collaborators)
        ? response.collaborators
        : [];
    } catch (error) {
      console.warn(
        `Failed to fetch collaborators for project ${projectId}:`,
        error,
      );
      return [];
    }
  },

  updateCollaboratorRole: async (
    collaboratorId: string,
    data: UpdateCollaboratorRoleRequest,
  ): Promise<Collaborator> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.COLLABORATORS.UPDATE_ROLE(collaboratorId))
      .build();
    return apiClient.patch<Collaborator>(url, data);
  },

  removeCollaborator: async (collaboratorId: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.COLLABORATORS.REMOVE(collaboratorId))
      .build();
    return apiClient.delete(url);
  },

  leaveProject: async (projectId: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.COLLABORATORS.REMOVE_SELF(projectId))
      .build();
    return apiClient.delete(url);
  },
};
