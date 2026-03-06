import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const Route = createFileRoute("/api/notifications/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { userId } = await auth();

        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const url = new URL(request.url);
          const filter = url.searchParams.get("filter") || "all";
          const search = url.searchParams.get("search") || "";

          let whereClause: any = { UserId: userId };

          if (filter === "unread") {
            whereClause.Read = false;
          } else if (filter !== "all") {
            whereClause.Type = filter;
          }

          if (search) {
            whereClause.OR = [
              { Title: { contains: search, mode: "insensitive" } },
              { Description: { contains: search, mode: "insensitive" } },
            ];
          }

          const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { CreatedAt: "desc" },
            take: 50,
          });

          const stats = {
            total: await prisma.notification.count({ where: { UserId: userId } }),
            unread: await prisma.notification.count({
              where: { UserId: userId, Read: false },
            }),
            readToday: await prisma.notification.count({
              where: {
                UserId: userId,
                Read: true,
                UpdatedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
              },
            }),
          };

          const filterCounts = {
            all: stats.total,
            unread: stats.unread,
            messages: await prisma.notification.count({
              where: { UserId: userId, Type: "message" },
            }),
            followers: await prisma.notification.count({
              where: { UserId: userId, Type: "user" },
            }),
            alerts: await prisma.notification.count({
              where: { UserId: userId, Type: "alert" },
            }),
            updates: await prisma.notification.count({
              where: { UserId: userId, Type: "settings" },
            }),
          };

          return Response.json({ notifications, stats, filterCounts });
        } catch (error) {
          console.error("Error fetching notifications:", error);
          return Response.json(
            { error: "Failed to fetch notifications" },
            { status: 500 },
          );
        }
      },

      PATCH: async ({ request }) => {
        const { userId } = await auth();

        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const body = await request.json();
          const { notificationId, read } = body;

          if (!notificationId) {
            return Response.json(
              { error: "Notification ID required" },
              { status: 400 },
            );
          }

          const notification = await prisma.notification.findUnique({
            where: { Id: notificationId },
          });

          if (!notification || notification.UserId !== userId) {
            return Response.json(
              { error: "Notification not found" },
              { status: 404 },
            );
          }

          const updated = await prisma.notification.update({
            where: { Id: notificationId },
            data: { Read: read ?? true },
          });

          return Response.json(updated);
        } catch (error) {
          console.error("Error updating notification:", error);
          return Response.json(
            { error: "Failed to update notification" },
            { status: 500 },
          );
        }
      },

      POST: async () => {
        const { userId } = await auth();

        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          await prisma.notification.updateMany({
            where: { UserId: userId, Read: false },
            data: { Read: true },
          });

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