import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useCurrentProject,
  usePublishProject,
} from "@/features/projects/hooks/useProjects";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";

/** Publish / Unpublish; hidden for users without the publish permission. */
export default function PublishButton({ projectId }: { projectId: string }) {
  const { data: project } = useCurrentProject();
  const { canPublishProject } = useEditorPermissions(projectId);
  const publish = usePublishProject();

  if (!project || !canPublishProject) return null;

  const published = project.published;

  return (
    <Button
      size="sm"
      variant={published ? "outline" : "default"}
      disabled={publish.isPending}
      onClick={() => publish.mutate({ projectId, publish: !published })}
      className="h-7 px-3 text-xs font-semibold"
    >
      {publish.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {published ? "Unpublish" : "Publish"}
    </Button>
  );
}
