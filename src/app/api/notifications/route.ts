import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// GET /api/notifications - Lấy danh sách notifications
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    // Build where clause based on filters
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

    // Get stats
    const stats = {
      total: await prisma.notification.count({ where: { UserId: userId } }),
      unread: await prisma.notification.count({
        where: { UserId: userId, Read: false },
      }),
      readToday: await prisma.notification.count({
        where: {
          UserId: userId,
          Read: true,
          UpdatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    };

    // Get filter counts
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

    return NextResponse.json({
      notifications,
      stats,
      filterCounts,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 },
    );
  }
}

// PATCH /api/notifications/:id - Đánh dấu notification đã đọc
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, read } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID required" },
        { status: 400 },
      );
    }

    // Verify notification belongs to user
    const notification = await prisma.notification.findUnique({
      where: { Id: notificationId },
    });

    if (!notification || notification.UserId !== userId) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 },
      );
    }

    // Update notification
    const updated = await prisma.notification.update({
      where: { Id: notificationId },
      data: { Read: read ?? true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 },
    );
  }
}

// POST /api/notifications/mark-all-read - Đánh dấu tất cả đã đọc
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.notification.updateMany({
      where: { UserId: userId, Read: false },
      data: { Read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking all as read:", error);
    return NextResponse.json(
      { error: "Failed to mark all as read" },
      { status: 500 },
    );
  }
}
