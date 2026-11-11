import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { notificationsServer } from "@/features/notifications/server/notifications.server";

/** The caller's Clerk session token, or null when signed out. */
async function sessionToken(): Promise<string | null> {
  const { userId, getToken } = await auth();
  if (!userId) return null;
  return getToken();
}

const unauthorized = () =>
  Response.json({ error: "Unauthorized" }, { status: 401 });

/** apiClient errors read "<METHOD> <url> failed (<status>)". */
function isNotFound(error: unknown): boolean {
  return error instanceof Error && error.message.endsWith("(404)");
}

export const Route = createFileRoute("/api/notifications/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const token = await sessionToken();
        if (!token) return unauthorized();

        try {
          const url = new URL(request.url);
          return Response.json(
            await notificationsServer.list(
              token,
              url.searchParams.get("filter") || "all",
              url.searchParams.get("search") || "",
            ),
          );
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return Response.json(
            { error: "Failed to fetch notifications" },
            { status: 500 },
          );
        }
      },

      PATCH: async ({ request }) => {
        const token = await sessionToken();
        if (!token) return unauthorized();

        try {
          const { notificationId, read } = await request.json();
          if (!notificationId) {
            return Response.json(
              { error: "Notification ID required" },
              { status: 400 },
            );
          }
          return Response.json(
            await notificationsServer.setRead(token, notificationId, read ?? true),
          );
        } catch (error) {
          if (isNotFound(error)) {
            return Response.json(
              { error: "Notification not found" },
              { status: 404 },
            );
          }
          console.error("Error updating notification:", error);
          return Response.json(
            { error: "Failed to update notification" },
            { status: 500 },
          );
        }
      },

      POST: async () => {
        const token = await sessionToken();
        if (!token) return unauthorized();

        try {
          await notificationsServer.markAllRead(token);
          return Response.json({ success: true });
        } catch (error) {
          console.error("Error marking all as read:", error);
          return Response.json(
            { error: "Failed to mark all as read" },
            { status: 500 },
          );
        }
      },
    },
  },
});
