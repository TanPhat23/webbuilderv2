import { URLBuilder } from "@/lib/utils/urlbuilder";
import type {
  NotificationResponse,
  UpdateNotificationPayload,
  NotificationFilters,
} from "@/interfaces/notification.interface";

const API_BASE = "/api/notifications";

export const notificationService = {
  getNotifications: async (
    filters?: NotificationFilters,
  ): Promise<NotificationResponse> => {
    const builder = new URLBuilder("next").setPath(API_BASE);

    if (filters?.filter) {
      builder.addQueryParam("filter", filters.filter);
    }

    if (filters?.search) {
      builder.addQueryParam("search", filters.search);
    }

    const response = await fetch(builder.build());

    if (!response.ok) {
      throw new Error("Failed to fetch notifications");
    }

    return response.json();
  },

  updateNotification: async (
    payload: UpdateNotificationPayload,
  ): Promise<void> => {
    const url = new URLBuilder("next").setPath(API_BASE).build();
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update notification");
    }

    return response.json();
  },

  markAllAsRead: async (): Promise<void> => {
    const url = new URLBuilder("next").setPath(API_BASE).build();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to mark all as read");
    }

    return response.json();
  },
};
