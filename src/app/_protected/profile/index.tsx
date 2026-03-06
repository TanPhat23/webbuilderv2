import { createFileRoute } from "@tanstack/react-router";
import { ProfileContent } from "@/features/profile";

export const Route = createFileRoute("/_protected/profile/")({
  component: ProfileContent,
});