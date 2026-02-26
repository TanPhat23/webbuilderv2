"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Overview } from "./Overview";
import { RecentVisits } from "./RecentVisits";
import { CalendarDateRangePicker } from "./DateRangePicker";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";
import { useAnalytics } from "@/hooks";
import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsContent() {
  const { data, isLoading, error, refetch } = useAnalytics();

  const handleDownload = () => {
    if (!data) return;

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Overview Statistics
    const statsSheet = XLSX.utils.json_to_sheet([data.stats]);
    statsSheet["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Overview Stats");

    // Sheet 2: Daily Metrics
    const trafficSheet = XLSX.utils.json_to_sheet(data.chartData);
    trafficSheet["!cols"] = [
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, trafficSheet, "Daily Metrics");

    // Sheet 3: Recent Template Views
    const visitsSheet = XLSX.utils.json_to_sheet(data.recentItems);
    visitsSheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(
      workbook,
      visitsSheet,
      "Recent Template Views"
    );

    // Sheet 4: Top Templates
    const topSheet = XLSX.utils.json_to_sheet(data.topTemplates);
    topSheet["!cols"] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, topSheet, "Top Templates");

    // Download file
    const fileName = `marketplace_analytics_${
      new Date().toISOString().split("T")[0]
    }.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="text-center py-12">
          <p className="text-red-500">Error loading analytics: {error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Marketplace Analytics</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Track template performance and engagement metrics
            </p>
          </div>
          <Button
            onClick={handleDownload}
            className="gap-2 w-full sm:w-auto"
            disabled={!data || isLoading}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </>
          ) : data ? (
            <>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Views
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-blue-500"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.stats.totalViews / 1000).toFixed(1)}K
                  </div>
                  <p className="text-xs text-green-500 font-medium">
                    Real-time data
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Downloads
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-green-500"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" x2="12" y1="15" y2="3" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.stats.totalDownloads / 1000).toFixed(1)}K
                  </div>
                  <p className="text-xs text-green-500 font-medium">
                    Real-time data
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Likes
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-pink-500"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(data.stats.totalLikes / 1000).toFixed(1)}K
                  </div>
                  <p className="text-xs text-green-500 font-medium">
                    Real-time data
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-purple-500"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.stats.conversionRate.toFixed(1)}%
                  </div>
                  <p className="text-xs text-green-500 font-medium">
                    Real-time data
                  </p>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <Overview chartData={data?.chartData} />
            )}
          </div>
          <div className="lg:col-span-1">
            {isLoading ? (
              <Skeleton className="h-96 w-full rounded-lg" />
            ) : (
              <CalendarDateRangePicker topTemplates={data?.topTemplates} />
            )}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="w-full">
          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-lg" />
          ) : (
            <RecentVisits recentItems={data?.recentItems} />
          )}
        </div>

        {/* Back Button */}
        <div className="flex justify-end pt-4">
          <Link href="/dashboard">
            <Button variant="outline" className="gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="m12 19-7-7 7-7" />
                <path d="M19 12H5" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
}
