import { createFileRoute } from "@tanstack/react-router";
import { HelpAndSupport } from "@/features/dashboard";

export const Route = createFileRoute("/_protected/help")({
  component: HelpAndSupport,
});