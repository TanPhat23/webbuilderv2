import { Layers } from "lucide-react";
import { CollaboratorRole } from "@/features/collaboration";
import { useElements } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useEditorContext } from "@/providers/editorprovider";
import EditorContextMenu from "../EditorContextMenu";
import ElementTreeItem from "../sidebar/ElementTreeItem";
import PanelIntro from "@/components/PanelIntro";

export default function LayersPanel() {
  const elements = useElements();
  const { editor, projectId } = useEditorContext();
  const { role } = useEditorPermissions(projectId);

  if (elements.length === 0) {
    return (
      <PanelIntro
        icon={Layers}
        title="No layers yet"
        description="Elements you add to the page show up here as a tree."
      />
    );
  }

  const tree = (
    <div
      role="tree"
      aria-label="Page layers"
      className="py-1.5"
      onContextMenu={(event) => {
        if (!(event.target as Element).closest?.("[data-layer-row]")) event.preventDefault();
      }}
    >
      {elements.map((element) => (
        <ElementTreeItem key={element.id} element={element} />
      ))}
    </div>
  );

  if (role === CollaboratorRole.VIEWER) return tree;
  return (
    <EditorContextMenu isReadOnly={editor.isReadOnly} isLocked={editor.isLocked}>
      {tree}
    </EditorContextMenu>
  );
}
