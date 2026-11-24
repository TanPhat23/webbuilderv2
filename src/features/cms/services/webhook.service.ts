import { URLBuilder } from "@/utils/urlbuilder";
import apiClient from "@/services/apiclient";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import type {
  CreateWebhookInput,
  ProjectWebhook,
  UpdateWebhookInput,
  WebhookDelivery,
} from "../interfaces/webhook.interface";

export function buildPublicCollectionEndpoint(
  apiBaseUrl: string,
  projectId: string,
  slugOrId: string,
): string {
  const base = apiBaseUrl.replace(/\/+$/, "");
  return `${base}/api/v1/public/projects/${encodeURIComponent(projectId)}/collections/${encodeURIComponent(slugOrId)}/items`;
}

export const webhookService = {
  listByProject: async (
    projectId: string,
    token: string,
  ): Promise<ProjectWebhook[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.LIST(projectId))
      .build();
    const res = await apiClient.get<ProjectWebhook[]>(url, undefined, token);
    return Array.isArray(res) ? res : [];
  },

  create: (
    projectId: string,
    input: CreateWebhookInput,
    token: string,
  ): Promise<ProjectWebhook> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.CREATE(projectId))
      .build();
    return apiClient.post<ProjectWebhook, CreateWebhookInput>(
      url,
      input,
      undefined,
      token,
    );
  },

  update: (
    projectId: string,
    webhookId: string,
    input: UpdateWebhookInput,
    token: string,
  ): Promise<ProjectWebhook> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.UPDATE(projectId, webhookId))
      .build();
    return apiClient.patch<ProjectWebhook, UpdateWebhookInput>(
      url,
      input,
      undefined,
      token,
    );
  },

  remove: (
    projectId: string,
    webhookId: string,
    token: string,
  ): Promise<boolean> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.DELETE(projectId, webhookId))
      .build();
    return apiClient.delete(url, undefined, token);
  },

  listDeliveries: async (
    projectId: string,
    webhookId: string,
    token: string,
    limit = 25,
  ): Promise<WebhookDelivery[]> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.DELIVERIES(projectId, webhookId))
      .addQueryParam("limit", String(limit))
      .build();
    const res = await apiClient.get<WebhookDelivery[]>(url, undefined, token);
    return Array.isArray(res) ? res : [];
  },

  sendTest: (
    projectId: string,
    webhookId: string,
    token: string,
  ): Promise<WebhookDelivery> => {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.WEBHOOKS.TEST(projectId, webhookId))
      .build();
    return apiClient.post<WebhookDelivery>(url, {}, undefined, token);
  },
};
