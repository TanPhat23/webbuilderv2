import { createFileRoute } from "@tanstack/react-router";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { getUserProjects } from "@/features/projects/api/project.api";
import { getQueryClient } from "@/client/queryclient";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Suspense } from "react";
import DashboardContent from "./-dashboard";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_protected/dashboard/")({
  component: Dashboard,
  loader: () =>
    getQueryClient().ensureQueryData({
      queryKey: projectKeys.userProjects(),
      queryFn: () => getUserProjects(),
    }),
});

export default function Dashboard() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Projects</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <Suspense fallback={<DashboardLoader />}>
        <DashboardContent />
      </Suspense>
    </>
  );
}

function DashboardLoader() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
