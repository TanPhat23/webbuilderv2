import { createFileRoute } from "@tanstack/react-router";
import { ProjectSettings } from "@/features/projectsettings";

export const Route = createFileRoute("/_protected/projectsettings/$id")({
  component: ProjectSettingsPage,
});

function ProjectSettingsPage() {
  return <ProjectSettings />;
}