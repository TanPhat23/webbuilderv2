import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import prisma from "@/lib/prisma";

export const Route = createFileRoute("/api/notifications/profile-update")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { userId } = await auth();

        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const body = await request.json();
          const { description } = body;

          await prisma.notification.create({
            data: {
              UserId: userId,
              Type: "settings",
              Title: "Profile Updated",
              Description:
                description || "You updated your profile information.",
            },
          });

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