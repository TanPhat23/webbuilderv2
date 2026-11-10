import { createFileRoute } from "@tanstack/react-router";
import { DashboardFeatureLayout } from "@/features/dashboard/components/DashboardFeatureLayout";

export const Route = createFileRoute("/_protected/profile")({
  component: () => <DashboardFeatureLayout title="Profile" />,
});
