import React, { useContext } from "react";
import { Database } from "lucide-react";
import PanelIntro from "@/components/PanelIntro";
import { EditorContext } from "@/features/editor/context/EditorContext";

const CMSManagerDialog = React.lazy(
  () => import("@/features/cms/components/CMSManagerDialog"),
);

export default function CmsPanel() {
  const editorContext = useContext(EditorContext);
  const projectId = editorContext?.projectId ?? undefined;
  const mcpConnectPanel = editorContext?.renderMcpConnectPanel?.();

  return (
    <PanelIntro
      icon={Database}
      title="Content collections"
      description="Define content types and items, then bind them to CMS lists and dynamic pages."
    >
      <CMSManagerDialog
        projectId={projectId}
        mcpConnectPanel={mcpConnectPanel}
      />
    </PanelIntro>
  );
}
