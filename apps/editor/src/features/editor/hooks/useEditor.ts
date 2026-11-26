import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/tanstack-react-start";
import type { Page } from "@/features/pages";
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

export function isComponentPageId(
  projectPages: readonly Pick<Page, "Id" | "Type">[] | undefined,
  pageId: string,
): boolean {
  return (
    projectPages?.some((page) => page.Id === pageId && page.Type === "cp") ??
    false
  );
}

export function resolveFallbackRoute(
  projectId: string,
  projectPages: readonly Page[] | undefined,
  pageId: string,
): string | null {
  const fallback = resolveFallbackPage(projectPages, pageId);
  return fallback ? `/editor/${projectId}?page=${fallback.Id}` : null;
}

export function shouldRedirectDeletedProject(
  project: { deletedAt?: unknown } | undefined,
): boolean {
  return Boolean(project?.deletedAt);
}

export function resolveEditorAccess(
  options: UseEditorOptions | undefined,
  permissions: UseEditorReturn["permissions"],
): {
  isReadOnly: boolean;
  isLocked: boolean;
  canCreate: boolean;
  permissionsSummary: UseEditorReturn["permissions"];
} {
  const isReadOnly = options?.isReadOnly ?? !permissions.canEditElements;
  const isLocked = options?.isLocked ?? false;
  return {
    isReadOnly,
    isLocked,
    canCreate: !isReadOnly && !isLocked && permissions.canCreateElements,
    permissionsSummary: {
      canCreateElements: permissions.canCreateElements,
      canEditElements: permissions.canEditElements,
      canDeleteElements: permissions.canDeleteElements,
      canReorderElements: permissions.canReorderElements,
    },
  };
}

function useEditorLifecycleEffects({
  id,
  pageId,
  projectPages,
  project,
  isComponentPage,
  beginPage,
  navigate,
}: {
  id: string;
  pageId: string;
  projectPages: readonly Page[] | undefined;
  project: { deletedAt?: unknown } | undefined;
  isComponentPage: boolean;
  beginPage: (projectId: string, pageId: string, isComponentPage: boolean) => void;
  navigate: ReturnType<typeof useNavigate>;
}): void {
  useLayoutEffect(() => {
    beginPage(id, pageId, isComponentPage);
  }, [beginPage, id, pageId, isComponentPage]);

  useEffect(() => {
    const route = resolveFallbackRoute(id, projectPages, pageId);
    if (route) navigate({ to: route, replace: true });
  }, [projectPages, pageId, navigate, id]);

  useEffect(() => {
    if (shouldRedirectDeletedProject(project)) {
      navigate({ to: "/dashboard" });
    }
  }, [project, navigate]);
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
  const { isReadOnly, isLocked, canCreate } = resolveEditorAccess(
    options,
    permissions,
  );
  const {
    canCreateElements,
    canEditElements,
    canDeleteElements,
    canReorderElements,
  } = permissions;

  const addElement = useAddElement();
  const beginPage = useElementStore((state) => state.beginPage);
  const selectedElement = useSelectedElement();
  const { data: projectPages, isLoading: isLoadingPages } = useProjectPages(id);
  const { data: project, isLoading: isLoadingProject } = useProject(id);
  const isComponentPage = isComponentPageId(projectPages, pageId);

  useEditorLifecycleEffects({
    id,
    pageId,
    projectPages,
    project,
    isComponentPage,
    beginPage,
    navigate,
  });

  const dropState = useCanvasRootDrop({
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
      canCreateElements,
      canEditElements,
      canDeleteElements,
      canReorderElements,
    }),
    [canCreateElements, canEditElements, canDeleteElements, canReorderElements],
  );

  return useMemo(
    () => ({
      currentView,
      setCurrentView,
      isDraggingOver: dropState.isDraggingOver,
      isLoading,
      selectedElement,
      handleDrop: dropState.handleDrop,
      handleDragOver: dropState.handleDragOver,
      handleDragLeave: dropState.handleDragLeave,
      addNewSection: dropState.addNewSection,
      isReadOnly,
      isLocked,
      permissions: permissionsSummary,
      userId: effectiveUserId,
    }),
    [
      currentView,
      dropState.isDraggingOver,
      isLoading,
      selectedElement,
      dropState.handleDrop,
      dropState.handleDragOver,
      dropState.handleDragLeave,
      dropState.addNewSection,
      isReadOnly,
      isLocked,
      permissionsSummary,
      effectiveUserId,
    ],
  );
};
