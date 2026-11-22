import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-react-start";
import { useProject, useProjectPages } from "@/features/projects/hooks/useProjects";
import type { Viewport, UseEditorReturn } from "../context/EditorContext";
import { resolveFallbackPage } from "../lib/editorPage";
import { useElementStore } from "../store/element-store";
import { useAddElement } from "../store/selectors/element-selectors";
import { useSelectedElement } from "../store/selectors/selection-selectors";
import { useCanvasRootDrop } from "./useCanvasRootDrop";
import { useEditorPermissions } from "./useEditorPermissions";

export type { Viewport, UseEditorReturn };

export interface UseEditorOptions {
  isReadOnly?: boolean;
  isLocked?: boolean;
}

export const useEditor = (
  id: string,
  pageId: string,
  options?: UseEditorOptions,
): UseEditorReturn => {
  const [currentView, setCurrentView] = useState<Viewport>("desktop");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const effectiveUserId = userId ?? undefined;

  const permissions = useEditorPermissions(id);
  const isReadOnly = options?.isReadOnly ?? !permissions.canEditElements;
  const isLocked = options?.isLocked ?? false;

  const addElement = useAddElement();
  const beginPage = useElementStore((state) => state.beginPage);
  const selectedElement = useSelectedElement();

  const { data: projectPages, isLoading: isLoadingPages } = useProjectPages(id);
  const { data: project, isLoading: isLoadingProject } = useProject(id);
  const isComponentPage =
    projectPages?.some((page) => page.Id === pageId && page.Type === "cp") ?? false;

  useLayoutEffect(() => {
    beginPage(id, pageId, isComponentPage);
  }, [beginPage, id, pageId, isComponentPage]);

  useEffect(() => {
    const fallback = resolveFallbackPage(projectPages, pageId);
    if (fallback) {
      navigate({ to: `/editor/${id}?page=${fallback.Id}`, replace: true });
    }
  }, [projectPages, pageId, navigate, id]);

  useEffect(() => {
    if (project?.deletedAt) {
      navigate({ to: "/dashboard" });
    }
  }, [project, navigate]);

  const canCreate = !isReadOnly && !isLocked && permissions.canCreateElements;
  const {
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    addNewSection,
  } = useCanvasRootDrop({
    projectId: id,
    pageId,
    userId: userId ?? null,
    canCreate,
    isComponentPage,
    queryClient,
    addElement,
  });

  const isLoading = isLoadingPages || isLoadingProject;

  const permissionsSummary = useMemo(
    () => ({
      canCreateElements: permissions.canCreateElements,
      canEditElements: permissions.canEditElements,
      canDeleteElements: permissions.canDeleteElements,
      canReorderElements: permissions.canReorderElements,
    }),
    [
      permissions.canCreateElements,
      permissions.canEditElements,
      permissions.canDeleteElements,
      permissions.canReorderElements,
    ],
  );

  return useMemo(
    () => ({
      currentView,
      setCurrentView,
      isDraggingOver,
      isLoading,
      selectedElement,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      addNewSection,
      isReadOnly,
      isLocked,
      permissions: permissionsSummary,
      userId: effectiveUserId,
    }),
    [
      currentView,
      isDraggingOver,
      isLoading,
      selectedElement,
      handleDrop,
      handleDragOver,
      handleDragLeave,
      addNewSection,
      isReadOnly,
      isLocked,
      permissionsSummary,
      effectiveUserId,
    ],
  );
};
