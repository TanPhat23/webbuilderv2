import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";
import { URLBuilder } from "@/lib/utils/urlbuilder";

export interface IElementEventWorkflow {
  id: string;
  elementId: string;
  workflowId: string;
  eventName: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateElementEventWorkflowInput {
  elementId: string;
  workflowId: string;
  eventName: string;
}

export interface UpdateElementEventWorkflowInput {
  eventName?: string;
  workflowId?: string;
}

interface IElementEventWorkflowService {
  createElementEventWorkflow(
    data: CreateElementEventWorkflowInput,
  ): Promise<IElementEventWorkflow>;
  getElementEventWorkflows(): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowsByElement(
    elementId: string,
  ): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowsByPage(
    pageId: string,
  ): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowByID(id: string): Promise<IElementEventWorkflow>;
  updateElementEventWorkflow(
    id: string,
    data: UpdateElementEventWorkflowInput,
  ): Promise<IElementEventWorkflow>;
  deleteElementEventWorkflow(id: string): Promise<boolean>;
  deleteElementEventWorkflowsByElement(elementId: string): Promise<boolean>;
  deleteElementEventWorkflowsByWorkflow(workflowId: string): Promise<boolean>;
}

export const elementEventWorkflowService: IElementEventWorkflowService = {
  createElementEventWorkflow: async (
    data: CreateElementEventWorkflowInput,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.CREATE)
      .build();
    return apiClient.post(url, data);
  },

  getElementEventWorkflows: async (): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .build();
    return apiClient.get(url);
  },

  getElementEventWorkflowsByElement: async (
    elementId: string,
  ): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("elementId", elementId)
      .build();
    const response = await apiClient.get(url);

    // Handle response format with data property
    if (response && typeof response === "object" && "data" in response) {
      return Array.isArray(response.data)
        ? (response.data as IElementEventWorkflow[])
        : [];
    }

    return Array.isArray(response) ? (response as IElementEventWorkflow[]) : [];
  },

  getElementEventWorkflowsByPage: async (
    pageId: string,
  ): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_PAGE(pageId))
      .build();
    const response = await apiClient.get(url);

    // Handle response format with data property
    if (response && typeof response === "object" && "data" in response) {
      return Array.isArray(response.data)
        ? (response.data as IElementEventWorkflow[])
        : [];
    }

    return Array.isArray(response) ? (response as IElementEventWorkflow[]) : [];
  },

  getElementEventWorkflowByID: async (
    id: string,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_ID(id))
      .build();
    return apiClient.get(url);
  },

  updateElementEventWorkflow: async (
    id: string,
    data: UpdateElementEventWorkflowInput,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.UPDATE(id))
      .build();
    return apiClient.patch(url, data as any);
  },

  deleteElementEventWorkflow: async (id: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.DELETE(id))
      .build();
    return apiClient.delete(url);
  },

  deleteElementEventWorkflowsByElement: async (
    elementId: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("elementId", elementId)
      .build();
    return apiClient.delete(url);
  },

  deleteElementEventWorkflowsByWorkflow: async (
    workflowId: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("workflowId", workflowId)
      .build();
    return apiClient.delete(url);
  },
};
