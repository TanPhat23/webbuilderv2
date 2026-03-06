import { createFileRoute } from "@tanstack/react-router";
import { AnalyticsContent } from "@/features/analytics/components/AnalyticsContent";

export const Route = createFileRoute("/_protected/analytics/")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return <AnalyticsContent />;
}