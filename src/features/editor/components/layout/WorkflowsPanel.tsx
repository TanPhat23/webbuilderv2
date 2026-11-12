import React, { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/providers/editorprovider";
import PanelIntro from "./PanelIntro";

const EventWorkflowManagerDialog = React.lazy(() =>
  import(
    "@/features/eventworkflows/components/EventWorkflowManagerDialog"
  ).then((m) => ({ default: m.EventWorkflowManagerDialog })),
);

export default function WorkflowsPanel() {
  const { projectId } = useEditorContext();
  const [open, setOpen] = useState(false);

  return (
    <PanelIntro
      icon={Zap}
      title="Workflows"
      description="Wire element events to actions such as navigation, toggles and API calls."
    >
      <Button
        size="sm"
        className="h-8 w-full gap-2 text-xs"
        disabled={!projectId}
        onClick={() => setOpen(true)}
      >
        <Zap className="h-3.5 w-3.5" />
        Open workflow editor
      </Button>
      {open && projectId && (
        <EventWorkflowManagerDialog
          projectId={projectId}
          isOpen={open}
          onOpenChange={setOpen}
        />
      )}
    </PanelIntro>
  );
}
