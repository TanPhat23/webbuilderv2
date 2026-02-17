import { useQuery } from "@tanstack/react-query";
import { QUERY_CONFIG } from "@/lib/utils/query/queryConfig";

export interface AnalyticsStats {
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
  conversionRate: number;
}

export interface ChartDataPoint {
  date: string;
  views: number;
  downloads: number;
  likes: number;
}

export interface RecentItem {
  id: string;
  template: string;
  category: string;
  views: number;
  downloads: number;
  likes: number;
  time: string;
  avatar: string;
  trend: string;
}

export interface TopTemplate {
  id: string;
  template: string;
  views: number;
  downloads: number;
}

export interface AnalyticsData {
  stats: AnalyticsStats;
  chartData: ChartDataPoint[];
  recentItems: RecentItem[];
  topTemplates: TopTemplate[];
  marketplaceItems: Array<{
    id: string;
    title: string;
    description: string;
    downloads: number;
    likes: number;
    views: number;
    createdAt: string;
  }>;
}

/**
 * Hook to fetch analytics data for the current user's marketplace items.
 *
 * Uses the `DEFAULT` query config preset (5 min stale, 30 min gc) and
 * retries up to 2 times with exponential back-off.
 */
export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await fetch("/api/analytics", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch analytics");
      }

      return response.json() as Promise<AnalyticsData>;
    },
    ...QUERY_CONFIG.DEFAULT,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
