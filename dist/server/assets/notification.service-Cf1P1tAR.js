import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import "react/jsx-runtime";
import "react";
import "clsx";
import { O as onMutationError, Q as QUERY_CONFIG } from "./prisma-BUnO9f9X.js";
import "sonner";
import { U as URLBuilder } from "./project.service-Bci2lGYe.js";
const notificationKeys = {
  all: ["notifications"],
  lists: () => [...notificationKeys.all, "list"],
  list: (filters) => [...notificationKeys.lists(), filters]
};
function useNotifications(filters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    ...QUERY_CONFIG.SHORT
  });
}
function useUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => notificationService.updateNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: onMutationError("Failed to update notification", { log: true })
  });
}
function useCreateProfileUpdateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const response = await fetch("/api/notifications/profile-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error("Failed to create notification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: onMutationError("Failed to create profile update notification", {
      log: true
    })
  });
}
const API_BASE = "/api/notifications";
const notificationService = {
  getNotifications: async (filters) => {
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
  updateNotification: async (payload) => {
    const url = new URLBuilder("next").setPath(API_BASE).build();
    const response = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error("Failed to update notification");
    }
    return response.json();
  },
  markAllAsRead: async () => {
    const url = new URLBuilder("next").setPath(API_BASE).build();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }
    });
    if (!response.ok) {
      throw new Error("Failed to mark all as read");
    }
    return response.json();
  }
};
export {
  useNotifications as a,
  useUpdateNotification as b,
  useCreateProfileUpdateNotification as u
};
