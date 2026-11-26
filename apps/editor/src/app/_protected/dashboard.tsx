import * as React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard";
import { getUserProjects } from "@/features/projects/api/project.api";

export const Route = createFileRoute("/_protected/dashboard")({
  loader: async () => {
    const projects = await getUserProjects();

    return {
      projects,
    };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { projects } = Route.useLoaderData();

  return (
    <SidebarProvider>
      <DashboardSidebar projects={projects} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
