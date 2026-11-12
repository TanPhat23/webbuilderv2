import React, { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEditorContext } from "@/providers/editorprovider";

const EventWorkflowManagerDialog = React.lazy(() =>
  import(
    "@/features/eventworkflows/components/EventWorkflowManagerDialog"
  ).then((m) => ({ default: m.EventWorkflowManagerDialog })),
);

export default function WorkflowsPanel() {
  const { projectId } = useEditorContext();
  const [open, setOpen] = useState(false);

  if (!projectId) {
    return <p className="text-xs text-muted-foreground">Project not loaded</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground">
        Wire element events to actions such as navigation, toggles and API
        calls.
      </p>
      <Button size="sm" className="w-full gap-2 text-xs" onClick={() => setOpen(true)}>
        <Zap className="h-3.5 w-3.5" />
        Open workflow editor
      </Button>
      {open && (
        <EventWorkflowManagerDialog
          projectId={projectId}
          isOpen={open}
          onOpenChange={setOpen}
        />
      )}
    </div>
  );
}
