import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { notificationsServer } from "@/features/notifications/server/notifications.server";

export const Route = createFileRoute("/api/notifications/profile-update")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { userId, getToken } = await auth();
        const token = userId ? await getToken() : null;

        if (!token) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const body = await request.json();
          const { description } = body;

          await notificationsServer.createProfileUpdate(token, description);

          return Response.json({ success: true });
        } catch (error) {
          console.error("Error creating profile update notification:", error);
          return Response.json(
            { error: "Failed to create notification" },
            { status: 500 },
          );
        }
      },
    },
  },
});