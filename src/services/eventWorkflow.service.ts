import apiClient from "./apiclient";
import { API_ENDPOINTS } from "@/constants/endpoints";
import {
  EventWorkflow,
  CreateEventWorkflowInput,
  UpdateEventWorkflowInput,
} from "@/interfaces/eventWorkflow.interface";
import { URLBuilder } from "@/lib/utils/urlbuilder";

interface IEventWorkflowService {
  getEventWorkflows(projectId: string): Promise<EventWorkflow[]>;
  getEventWorkflowById(workflowId: string): Promise<EventWorkflow>;
  createEventWorkflow(
    projectId: string,
    data: CreateEventWorkflowInput,
  ): Promise<EventWorkflow>;
  updateEventWorkflow(
    workflowId: string,
    data: UpdateEventWorkflowInput,
  ): Promise<EventWorkflow>;
  updateEventWorkflowEnabled(
    workflowId: string,
    enabled: boolean,
  ): Promise<EventWorkflow>;
  deleteEventWorkflow(workflowId: string): Promise<boolean>;
}

export const eventWorkflowService: IEventWorkflowService = {
  getEventWorkflows: async (projectId: string): Promise<EventWorkflow[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_PROJECT(projectId))
      .build();
    const response = await apiClient.get<
      { data: EventWorkflow[] } | EventWorkflow[]
    >(url);
    return Array.isArray(response) ? response : response?.data || [];
  },

  getEventWorkflowById: async (workflowId: string): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.GET_BY_ID(workflowId))
      .build();
    return apiClient.get(url);
  },

  createEventWorkflow: async (
    projectId: string,
    data: CreateEventWorkflowInput,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.CREATE)
      .build();
    return apiClient.post(url, {
      ...data,
      projectId,
    });
  },

  updateEventWorkflow: async (
    workflowId: string,
    data: UpdateEventWorkflowInput,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE(workflowId))
      .build();
    return apiClient.patch(url, data as any);
  },

  updateEventWorkflowEnabled: async (
    workflowId: string,
    enabled: boolean,
  ): Promise<EventWorkflow> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.UPDATE_ENABLED(workflowId))
      .build();
    return apiClient.patch(url, { enabled } as any);
  },

  deleteEventWorkflow: async (workflowId: string): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.EVENT_WORKFLOWS.DELETE(workflowId))
      .build();
    return apiClient.delete(url);
  },
};
