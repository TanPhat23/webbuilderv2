import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard";
import { RealtimeChat } from "@/features/chat";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      <RealtimeChat />
    </SidebarProvider>
  );
}