"use client";

import { useState, useEffect, useCallback } from "react";
import { useEventWorkflow } from "@/features/eventworkflows/hooks/useEventWorkflows";
import type { WorkflowManagerView } from "../constants/uistate";

export interface UseWorkflowManagerOptions {
  projectId: string;
  isOpen: boolean;
}

export function useWorkflowManager({
  projectId,
  isOpen,
}: UseWorkflowManagerOptions) {
  const [view, setView] = useState<WorkflowManagerView>({ type: "list" });

  const editingWorkflowId = view.type === "edit" ? view.workflowId : "";
  const isEditView = view.type === "edit";

  const workflowQuery = useEventWorkflow(editingWorkflowId, isEditView);

  useEffect(() => {
    if (isOpen) setView({ type: "list" });
  }, [isOpen]);

  const hasInitialData = view.type === "edit" && !!view.initialData;

  useEffect(() => {
    if (view.type !== "edit" || hasInitialData) return;
    if (!workflowQuery.data?.canvasData) return;

    setView((prev) =>
      prev.type === "edit"
        ? { ...prev, initialData: workflowQuery.data!.canvasData }
        : prev,
    );
  }, [workflowQuery.data, view.type, hasInitialData]);

  const goToList = useCallback(() => setView({ type: "list" }), []);

  const goToCreate = useCallback(() => setView({ type: "create" }), []);

  const goToEdit = useCallback((workflowId: string, workflowName: string) => {
    setView({ type: "edit", workflowId, workflowName, initialData: undefined });
  }, []);

  const onWorkflowCreated = useCallback((workflowId: string) => {
    setView({ type: "edit", workflowId, workflowName: "New Workflow" });
  }, []);

  const isLoadingWorkflow = workflowQuery.isLoading;

  const currentWorkflowId = view.type === "edit" ? view.workflowId : undefined;
  const currentWorkflowName =
    view.type === "edit" ? view.workflowName : undefined;
  const initialData = view.type === "edit" ? view.initialData : undefined;

  return {
    view,
    projectId,
    goToList,
    goToCreate,
    goToEdit,
    onWorkflowCreated,
    isLoadingWorkflow,
    currentWorkflowId,
    currentWorkflowName,
    initialData,
  };
}
