import { createFileRoute } from "@tanstack/react-router";
import { auth } from "@clerk/tanstack-react-start/server";
import prisma from "@/lib/prisma";

export const Route = createFileRoute("/api/analytics")({
  server: {
    handlers: {
      GET: async () => {
        const { userId } = await auth();

        if (!userId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
          const marketplaceItems = await prisma.marketplaceItem.findMany({
            where: { AuthorId: userId, DeletedAt: null },
            include: {
              Project: true,
              Categories: { include: { Category: true } },
              Tags: { include: { Tag: true } },
            },
            orderBy: { CreatedAt: "desc" },
          });

          const totalViews = marketplaceItems.reduce(
            (sum, item) => sum + (item.Views || 0),
            0,
          );
          const totalDownloads = marketplaceItems.reduce(
            (sum, item) => sum + (item.Downloads || 0),
            0,
          );
          const totalLikes = marketplaceItems.reduce(
            (sum, item) => sum + (item.Likes || 0),
            0,
          );
          const conversionRate =
            totalViews > 0
              ? ((totalDownloads / totalViews) * 100).toFixed(1)
              : "0";

          const chartData = generateChartData(marketplaceItems);

          const recentItems = marketplaceItems.slice(0, 5).map((item) => ({
            id: item.Id,
            template: item.Title,
            category:
              item.Categories[0]?.Category?.Name || "Uncategorized",
            views: item.Views || 0,
            downloads: item.Downloads || 0,
            likes: item.Likes || 0,
            time: formatTimeAgo(item.CreatedAt),
            avatar: item.Title.substring(0, 2).toUpperCase(),
            trend: "+" + Math.floor(Math.random() * 20) + "%",
          }));

          const topTemplates = marketplaceItems
            .sort((a, b) => (b.Downloads || 0) - (a.Downloads || 0))
            .slice(0, 6)
            .map((item) => ({
              id: item.Id,
              template: item.Title,
              views: item.Views || 0,
              downloads: item.Downloads || 0,
            }));

          return Response.json({
            stats: {
              totalViews,
              totalDownloads,
              totalLikes,
              conversionRate: parseFloat(conversionRate),
            },
            chartData,
            recentItems,
            topTemplates,
            marketplaceItems: marketplaceItems.map((item) => ({
              id: item.Id,
              title: item.Title,
              description: item.Description,
              downloads: item.Downloads,
              likes: item.Likes,
              views: item.Views,
              createdAt: item.CreatedAt,
            })),
          });
        } catch (error) {
          console.error("Analytics API error:", error);
          return Response.json(
            { error: "Internal server error" },
            { status: 500 },
          );
        }
      },
    },
  },
});

function generateChartData(
  items: Array<{
    Downloads: number | null;
    Likes: number | null;
    Views: number | null;
    CreatedAt: Date;
  }>,
) {
  const today = new Date();
  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const totalDownloads = items.reduce(
      (sum, item) => sum + (item.Downloads || 0),
      0,
    );
    const totalLikes = items.reduce(
      (sum, item) => sum + (item.Likes || 0),
      0,
    );
    const totalViews = items.reduce(
      (sum, item) => sum + (item.Views || 0),
      0,
    );

    chartData.push({
      date: dateStr,
      views: Math.floor(Math.random() * (totalViews || 1000)) + 500,
      downloads: Math.floor(Math.random() * (totalDownloads || 1000)) + 100,
      likes: Math.floor(Math.random() * (totalLikes || 500)) + 50,
    });
  }

  return chartData;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}