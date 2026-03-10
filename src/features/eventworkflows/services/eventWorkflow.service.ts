import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/features/eventworkflows";
import { URLBuilder } from "@/utils/urlbuilder";

type EventWorkflowListResponse = { data: EventWorkflow[] } | EventWorkflow[];
type CreateEventWorkflowRequest = CreateEventWorkflowInput & {
  projectId: string;
};
type UpdateEventWorkflowEnabledRequest = {
  enabled: boolean;
};

interface IEventWorkflowService {
  getEventWorkflows(projectId: string, token: string): Promise<EventWorkflow[]>;
  getEventWorkflowById(
    workflowId: string,
    token: string,
  ): Promise<EventWorkflow>;
  createEventWorkflow(
    projectId: string,
    data: CreateEventWorkflowInput,
    token: string,
  ): Promise<EventWorkflow>;
  updateEventWorkflow(
    workflowId: string,
    data: UpdateEventWorkflowInput,
    token: string,
  ): Promise<EventWorkflow>;
  updateEventWorkflowEnabled(
    workflowId: string,
    enabled: boolean,
    token: string,
  ): Promise<EventWorkflow>;
  deleteEventWorkflow(workflowId: string, token: string): Promise<boolean>;
}

export const eventWorkflowService: IEventWorkflowService = {
  getEventWorkflows: async (
    projectId: string,
    token: string,
  ): Promise<EventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_PROJECT(projectId))
      .build();

    const response = await apiClient.get<EventWorkflowListResponse>(
      url,
      undefined,
      token,
    );

    return Array.isArray(response) ? response : response?.data || [];
  },

  getEventWorkflowById: (
    workflowId: string,
    token: string,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_ID(workflowId))
      .build();

    return apiClient.get<EventWorkflow>(url, undefined, token);
  },

  createEventWorkflow: (
    projectId: string,
    data: CreateEventWorkflowInput,
    token: string,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.CREATE)
      .build();

    const payload: CreateEventWorkflowRequest = {
      ...data,
      projectId,
    };

    return apiClient.post<EventWorkflow>(url, payload, undefined, token);
  },

  updateEventWorkflow: (
    workflowId: string,
    data: UpdateEventWorkflowInput,
    token: string,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE(workflowId))
      .build();

    return apiClient.patch<EventWorkflow>(url, data, undefined, token);
  },

  updateEventWorkflowEnabled: (
    workflowId: string,
    enabled: boolean,
    token: string,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE_ENABLED(workflowId))
      .build();

    const payload: UpdateEventWorkflowEnabledRequest = { enabled };

    return apiClient.patch<EventWorkflow>(url, payload, undefined, token);
  },

  deleteEventWorkflow: (
    workflowId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.DELETE(workflowId))
      .build();

    return apiClient.delete(url, undefined, token);
  },
};
