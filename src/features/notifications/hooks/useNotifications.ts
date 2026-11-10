
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/features/notifications";
import type {
  NotificationFilters,
  UpdateNotificationPayload,
} from "@/features/notifications";
import { QUERY_CONFIG } from "@/utils/query/queryConfig";
import { onMutationError } from "@/hooks/utils/mutationUtils";

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filters?: NotificationFilters) =>
    [...notificationKeys.lists(), filters] as const,
};

/** Hook to get notifications with optional filters. */
export function useNotifications(filters?: NotificationFilters) {
  return useQuery({
    queryKey: notificationKeys.list(filters),
    queryFn: () => notificationService.getNotifications(filters),
    ...QUERY_CONFIG.SHORT,
  });
}

/** Hook to update a single notification (e.g. mark as read). */
export function useUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateNotificationPayload) =>
      notificationService.updateNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: onMutationError("Failed to update notification", { log: true }),
  });
}

/** Hook to create a profile-update notification. */
export function useCreateProfileUpdateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { description: string }) => {
      const response = await fetch("/api/notifications/profile-update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
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
      log: true,
    }),
  });
}
