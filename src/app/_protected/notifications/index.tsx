import { createFileRoute } from "@tanstack/react-router";
import { NotificationsContent } from "@/features/notifications";

export const Route = createFileRoute("/_protected/notifications/")({
  component: NotificationsContent,
});