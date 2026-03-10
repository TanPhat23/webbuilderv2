import { useState, useEffect, useCallback, useMemo } from "react";
import { useEventWorkflow } from "@/features/eventworkflows/hooks/useEventWorkflows";
import type { WorkflowManagerView } from "../constants/uistate";

export interface UseWorkflowManagerOptions {
  projectId: string;
  isOpen: boolean;
}

const DEFAULT_WORKFLOW_NAME = "New Workflow";

export function useWorkflowManager({
  projectId,
  isOpen,
}: UseWorkflowManagerOptions) {
  const [view, setView] = useState<WorkflowManagerView>({ type: "list" });

  const editingWorkflowId = view.type === "edit" ? view.workflowId : "";
  const isEditView = view.type === "edit";
  const hasInitialData = view.type === "edit" && view.initialData !== undefined;

  const workflowQuery = useEventWorkflow(editingWorkflowId, isEditView);

  useEffect(() => {
    if (isOpen) {
      setView({ type: "list" });
    }
  }, [isOpen]);

  useEffect(() => {
    if (view.type !== "edit" || hasInitialData) {
      return;
    }

    const canvasData = workflowQuery.data?.canvasData;

    if (!canvasData) {
      return;
    }

    setView((currentView) =>
      currentView.type === "edit" &&
      currentView.workflowId === editingWorkflowId
        ? { ...currentView, initialData: canvasData }
        : currentView,
    );
  }, [editingWorkflowId, hasInitialData, view.type, workflowQuery.data]);

  const goToList = useCallback(() => {
    setView({ type: "list" });
  }, []);

  const goToCreate = useCallback(() => {
    setView({ type: "create" });
  }, []);

  const goToEdit = useCallback((workflowId: string, workflowName: string) => {
    setView({
      type: "edit",
      workflowId,
      workflowName,
      initialData: undefined,
    });
  }, []);

  const onWorkflowCreated = useCallback((workflowId: string) => {
    setView({
      type: "edit",
      workflowId,
      workflowName: DEFAULT_WORKFLOW_NAME,
      initialData: undefined,
    });
  }, []);

  const currentWorkflow = useMemo(
    () =>
      view.type === "edit"
        ? {
            id: view.workflowId,
            name: view.workflowName,
            initialData: view.initialData,
          }
        : null,
    [view],
  );

  return {
    view,
    projectId,
    goToList,
    goToCreate,
    goToEdit,
    onWorkflowCreated,
    isLoadingWorkflow: workflowQuery.isLoading,
    currentWorkflowId: currentWorkflow?.id,
    currentWorkflowName: currentWorkflow?.name,
    initialData: currentWorkflow?.initialData,
  };
}
