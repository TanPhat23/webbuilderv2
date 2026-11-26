import { createFileRoute } from "@tanstack/react-router";
import { HelpAndSupport } from "@/features/help";

export const Route = createFileRoute("/_protected/help")({
  component: HelpAndSupport,
});