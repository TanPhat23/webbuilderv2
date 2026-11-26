/**
 * Server-side access to the Go API's notification endpoints, mapped to the
 * app's `Notification` shape. Used by the /api/notifications route handlers.
 */
import { URLBuilder } from "@/utils/urlbuilder";
import { API_ENDPOINTS } from "@/utils/shared/constants/endpoints";
import apiClient from "@/services/apiclient";
import type {
  Notification,
  NotificationResponse,
  NotificationType,
} from "@/features/notifications/interfaces/notification.interface";

interface ApiNotification {
  id: string;
  userId: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

type ApiNotificationList = Omit<NotificationResponse, "notifications"> & {
  notifications: ApiNotification[];
};

function toNotification(n: ApiNotification): Notification {
  return {
    Id: n.id,
    UserId: n.userId,
    Type: n.type as NotificationType,
    Title: n.title,
    Description: n.description,
    Read: n.read,
    CreatedAt: n.createdAt,
    UpdatedAt: n.updatedAt,
  };
}

export const notificationsServer = {
  async list(
    token: string,
    filter: string,
    search: string,
  ): Promise<NotificationResponse> {
    const builder = new URLBuilder("api").setPath(API_ENDPOINTS.NOTIFICATIONS.LIST);
    builder.addQueryParam("filter", filter);
    if (search) builder.addQueryParam("search", search);
    const list = await apiClient.get<ApiNotificationList>(builder.build(), undefined, token);
    return { ...list, notifications: list.notifications.map(toNotification) };
  },

  async setRead(token: string, id: string, read: boolean): Promise<Notification> {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.NOTIFICATIONS.SET_READ(id))
      .build();
    return toNotification(
      await apiClient.patch<ApiNotification>(url, { read }, undefined, token),
    );
  },

  async markAllRead(token: string): Promise<void> {
    const url = new URLBuilder("api").setPath(API_ENDPOINTS.NOTIFICATIONS.READ_ALL).build();
    await apiClient.post(url, {}, undefined, token);
  },

  async createProfileUpdate(token: string, description?: string): Promise<void> {
    const url = new URLBuilder("api")
      .setPath(API_ENDPOINTS.NOTIFICATIONS.PROFILE_UPDATE)
      .build();
    await apiClient.post(url, description ? { description } : {}, undefined, token);
  },
};
