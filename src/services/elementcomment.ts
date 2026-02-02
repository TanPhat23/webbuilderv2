import { URLBuilder } from "@/lib/utils/urlbuilder";
import {
  ElementComment,
  ElementCommentResponse,
  CreateElementCommentRequest,
  UpdateElementCommentRequest,
} from "@/interfaces/elementcomment.interface";
import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";

interface IElementCommentService {
  // Element comment operations
  createElementComment: (
    data: CreateElementCommentRequest,
  ) => Promise<ElementComment>;
  getElementCommentById: (commentId: string) => Promise<ElementComment>;
  getElementComments: (elementId: string) => Promise<ElementCommentResponse>;
  getProjectComments: (projectId: string) => Promise<ElementCommentResponse>;
  getCommentsByAuthorId: (authorId: string) => Promise<ElementCommentResponse>;
  updateElementComment: (
    commentId: string,
    data: UpdateElementCommentRequest,
  ) => Promise<ElementComment>;
  deleteElementComment: (commentId: string) => Promise<boolean>;
  toggleResolvedStatus: (commentId: string) => Promise<ElementComment>;
}

export const elementCommentService: IElementCommentService = {
  // Create a new element comment
  createElementComment: async (
    data: CreateElementCommentRequest,
  ): Promise<ElementComment> => {
    return apiClient.post<ElementComment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.CREATE)
        .build(),
      data,
    );
  },

  // Get element comment by ID
  getElementCommentById: async (commentId: string): Promise<ElementComment> => {
    return apiClient.get<ElementComment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_ID(commentId))
        .build(),
    );
  },

  // Get all comments for a specific element
  getElementComments: async (
    elementId: string,
  ): Promise<ElementCommentResponse> => {
    return apiClient.get<ElementCommentResponse>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_ELEMENT(elementId))
        .build(),
    );
  },

  // Get all comments for a project
  getProjectComments: async (
    projectId: string,
  ): Promise<ElementCommentResponse> => {
    return apiClient.get<ElementCommentResponse>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_PROJECT(projectId))
        .build(),
    );
  },

  // Get all comments by a specific author
  getCommentsByAuthorId: async (
    authorId: string,
  ): Promise<ElementCommentResponse> => {
    return apiClient.get<ElementCommentResponse>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.GET_BY_AUTHOR(authorId))
        .build(),
    );
  },

  // Update an element comment
  updateElementComment: async (
    commentId: string,
    data: UpdateElementCommentRequest,
  ): Promise<ElementComment> => {
    return apiClient.patch<ElementComment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.UPDATE(commentId))
        .build(),
      data,
    );
  },

  // Delete an element comment
  deleteElementComment: async (commentId: string): Promise<boolean> => {
    return apiClient.delete(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.DELETE(commentId))
        .build(),
    );
  },

  // Toggle resolved status of an element comment
  toggleResolvedStatus: async (commentId: string): Promise<ElementComment> => {
    return apiClient.patch<ElementComment>(
      new URLBuilder("api")
        .setPath(API_ENDPOINTS.ELEMENT_COMMENTS.TOGGLE_RESOLVED(commentId))
        .build(),
      {},
    );
  },
};
