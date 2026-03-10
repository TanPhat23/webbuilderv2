import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import { URLBuilder } from "@/utils/urlbuilder";

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

type ElementEventWorkflowListResponse =
  | IElementEventWorkflow[]
  | { data?: IElementEventWorkflow[] };

function normalizeElementEventWorkflowList(
  response: ElementEventWorkflowListResponse,
): IElementEventWorkflow[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(response.data) ? response.data : [];
}

interface IElementEventWorkflowService {
  createElementEventWorkflow(
    data: CreateElementEventWorkflowInput,
    token: string,
  ): Promise<IElementEventWorkflow>;
  getElementEventWorkflows(token: string): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowsByElement(
    elementId: string,
    token: string,
  ): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowsByPage(
    pageId: string,
    token: string,
  ): Promise<IElementEventWorkflow[]>;
  getElementEventWorkflowByID(
    id: string,
    token: string,
  ): Promise<IElementEventWorkflow>;
  updateElementEventWorkflow(
    id: string,
    data: UpdateElementEventWorkflowInput,
    token: string,
  ): Promise<IElementEventWorkflow>;
  deleteElementEventWorkflow(id: string, token: string): Promise<boolean>;
  deleteElementEventWorkflowsByElement(
    elementId: string,
    token: string,
  ): Promise<boolean>;
  deleteElementEventWorkflowsByWorkflow(
    workflowId: string,
    token: string,
  ): Promise<boolean>;
}

export const elementEventWorkflowService: IElementEventWorkflowService = {
  createElementEventWorkflow: async (
    data: CreateElementEventWorkflowInput,
    token: string,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.CREATE)
      .build();

    return apiClient.post<IElementEventWorkflow>(url, data, undefined, token);
  },

  getElementEventWorkflows: async (
    token: string,
  ): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .build();

    const response = await apiClient.get<ElementEventWorkflowListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeElementEventWorkflowList(response);
  },

  getElementEventWorkflowsByElement: async (
    elementId: string,
    token: string,
  ): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("elementId", elementId)
      .build();

    const response = await apiClient.get<ElementEventWorkflowListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeElementEventWorkflowList(response);
  },

  getElementEventWorkflowsByPage: async (
    pageId: string,
    token: string,
  ): Promise<IElementEventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_PAGE(pageId))
      .build();

    const response = await apiClient.get<ElementEventWorkflowListResponse>(
      url,
      undefined,
      token,
    );

    return normalizeElementEventWorkflowList(response);
  },

  getElementEventWorkflowByID: async (
    id: string,
    token: string,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_BY_ID(id))
      .build();

    return apiClient.get<IElementEventWorkflow>(url, undefined, token);
  },

  updateElementEventWorkflow: async (
    id: string,
    data: UpdateElementEventWorkflowInput,
    token: string,
  ): Promise<IElementEventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.UPDATE(id))
      .build();

    return apiClient.patch<IElementEventWorkflow>(url, data, undefined, token);
  },

  deleteElementEventWorkflow: async (
    id: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.DELETE(id))
      .build();

    return apiClient.delete(url, undefined, token);
  },

  deleteElementEventWorkflowsByElement: async (
    elementId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("elementId", elementId)
      .build();

    return apiClient.delete(url, undefined, token);
  },

  deleteElementEventWorkflowsByWorkflow: async (
    workflowId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.ELEMENT_EVENT_WORKFLOWS.GET_ALL)
      .addQueryParam("workflowId", workflowId)
      .build();

    return apiClient.delete(url, undefined, token);
  },
};

export type ElementEventWorkflowService = typeof elementEventWorkflowService;
