"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { WorkflowList } from "./WorkflowList";
import { WorkflowCreator } from "./WorkflowCreator";
import { WorkflowConnector } from "./WorkflowConnector";
import { WorkflowEditor } from "./WorkflowEditor";
import { WorkflowData } from "./types/workflow.types";
import { useEventWorkflowStore } from "@/globalstore/event-workflow-store";
import { useEventWorkflow } from "@/hooks/editor/eventworkflow/useEventWorkflows";
import { useUpdateEventWorkflow } from "@/hooks/editor/eventworkflow/useEventWorkflowMutations";
import { toast } from "sonner";
import type { ZodIssue } from "zod";
import { WorkflowCanvasSchema } from "@/schema/zod/workflowCanvas";

interface EventWorkflowManagerDialogProps {
  projectId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type ViewState =
  | { type: "list" }
  | { type: "create" }
  | {
      type: "edit";
      workflowId: string;
      workflowName: string;
      initialData?: WorkflowData;
    }
  | { type: "connect"; workflowId?: string };

export const EventWorkflowManagerDialog = ({
  projectId,
  isOpen,
  onOpenChange,
}: EventWorkflowManagerDialogProps) => {
  const [viewState, setViewState] = useState<ViewState>({ type: "list" });
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    nodes: [],
    connections: [],
  });

  const updateWorkflowMutation = useUpdateEventWorkflow();

  const editingWorkflowId =
    viewState.type === "edit" ? viewState.workflowId : "";
  const isEditView = viewState.type === "edit";

  // React Query hook for fetching single workflow (enabled only in edit mode)
  const workflowQuery = useEventWorkflow(editingWorkflowId, isEditView);

  // Reset to list view when dialog opens
  useEffect(() => {
    if (isOpen) {
      setViewState({ type: "list" });
    }
  }, [isOpen]);

  // Load canvas data when workflow query resolves
  useEffect(() => {
    if (
      viewState.type === "edit" &&
      workflowQuery.data?.canvasData &&
      !viewState.initialData
    ) {
      setViewState((prev) =>
        prev.type === "edit"
          ? { ...prev, initialData: workflowQuery.data!.canvasData }
          : prev,
      );
      setWorkflowData(workflowQuery.data.canvasData);
    }
  }, [workflowQuery.data, viewState]);

  const handleCreateWorkflow = () => {
    setViewState({ type: "create" });
  };

  const handleWorkflowCreated = (workflowId: string) => {
    setViewState({
      type: "edit",
      workflowId,
      workflowName: "New Workflow",
    });
  };

  const handleEditWorkflow = (workflowId: string, workflowName: string) => {
    console.log("Opening workflow for edit:", { workflowId, workflowName });
    setViewState({
      type: "edit",
      workflowId,
      workflowName,
      initialData: undefined,
    });
  };

  const handleConnectWorkflow = (workflowId?: string) => {
    setViewState({ type: "connect", workflowId });
  };

  const handleSaveWorkflow = async (workflow: WorkflowData) => {
    if (viewState.type !== "edit") return;

    // Validate using Zod schema (call .safeParse directly to avoid import name issues)
    const validation = WorkflowCanvasSchema.safeParse(workflow);
    if (!validation.success) {
      const errors =
        validation.error?.issues.map((issue: ZodIssue) => issue.message) ?? [];
      const errorMsg = errors.join("\n• ");
      toast.error(`Workflow validation failed:\n• ${errorMsg}`);
      console.error("Validation errors:", validation.error);
      return;
    }

    console.log("Validation successful:", {
      nodeCount: workflow.nodes.length,
    });

    // Save canvas data only
    try {
      const result = await updateWorkflowMutation.mutateAsync({
        workflowId: viewState.workflowId,
        input: {
          name: workflow.metadata?.name,
          description: workflow.metadata?.description,
          canvasData: workflow, // Save the complete canvas state
          enabled: true,
        },
      });

      if (result) {
        toast.success("Workflow saved successfully!");
        console.log("Workflow saved with canvas data");
      } else {
        const errorMessage =
          useEventWorkflowStore.getState().mutationError ||
          "Failed to save workflow";
        toast.error(`Error saving workflow:\n${errorMessage}`);
      }
    } catch (error) {
      const errorMessage =
        useEventWorkflowStore.getState().mutationError ||
        "Failed to save workflow";
      console.error("Failed to save workflow:", error);
      toast.error(`Error saving workflow:\n${errorMessage}`);
    }
  };

  const handleBackToList = () => {
    setViewState({ type: "list" });
  };

  const handleClose = () => {
    setViewState({ type: "list" });
    onOpenChange(false);
  };

  const handleNameChange = (name: string) => {
    setWorkflowData((prev) => ({
      ...prev,
      metadata: { ...prev.metadata, name },
    }));
  };

  const isFullScreenView = viewState.type === "edit";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={
          isFullScreenView
            ? "max-w-[95vw]! h-[95vh] p-0"
            : "max-w-4xl! max-h-[90vh]"
        }
      >
        <VisuallyHidden>
          <DialogTitle>Workflow Manager</DialogTitle>
        </VisuallyHidden>
        <div
          className={
            isFullScreenView
              ? "h-full"
              : "max-h-[calc(90vh-2rem)] overflow-y-auto p-6"
          }
        >
          {viewState.type === "list" && (
            <WorkflowList
              projectId={projectId}
              onEdit={handleEditWorkflow}
              onConnect={handleConnectWorkflow}
              onCreate={handleCreateWorkflow}
            />
          )}

          {viewState.type === "create" && (
            <WorkflowCreator
              projectId={projectId}
              onSuccess={handleWorkflowCreated}
              onCancel={handleBackToList}
            />
          )}

          {viewState.type === "edit" && (
            <div className="h-full">
              {workflowQuery.isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading workflow...</p>
                  </div>
                </div>
              ) : (
                <WorkflowEditor
                  workflowName={viewState.workflowName}
                  initialWorkflow={viewState.initialData || workflowData}
                  onSave={handleSaveWorkflow}
                  onNameChange={handleNameChange}
                  onBack={handleBackToList}
                  className="h-full"
                />
              )}
            </div>
          )}

          {viewState.type === "connect" && (
            <WorkflowConnector
              projectId={projectId}
              workflowId={viewState.workflowId}
              onBack={handleBackToList}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventWorkflowManagerDialog;
