import { createFileRoute } from "@tanstack/react-router";
import { DashboardFeatureLayout } from "@/features/dashboard/components/DashboardFeatureLayout";

export const Route = createFileRoute("/_protected/analytics")({
  component: () => <DashboardFeatureLayout title="Analytics" />,
});
