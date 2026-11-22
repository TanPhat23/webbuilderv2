import { useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { readDropPayload } from "@/features/editor/utils/element/dragPayload";
import { componentFromDrop } from "@/features/editor/lib/componentDrop";
import { toast } from "sonner";
import { useAuth } from "@clerk/tanstack-react-start";
import { useAddElement } from "@/features/editor";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectedElement } from "@/features/editor";
import { ElementFactory } from "@/features/editor/lib/ElementFactory";
import { customComps } from "@/features/editor/lib/customcomponents/customComponents";
import { EditorElement } from "@/types/global.type";
import { useEditorPermissions } from "./useEditorPermissions";
import { useProject, useProjectPages } from "@/features/projects/hooks/useProjects";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import { Page } from "@/features/pages";

export type Viewport = "mobile" | "tablet" | "desktop";

export interface UseEditorOptions {
  isReadOnly?: boolean;
  isLocked?: boolean;
}

export interface UseEditorReturn {
  currentView: Viewport;
  setCurrentView: Dispatch<SetStateAction<Viewport>>;
  isDraggingOver: boolean;
  isLoading: boolean;
  selectedElement: EditorElement | undefined;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  addNewSection: () => void;
  isReadOnly: boolean;
  isLocked: boolean;
  permissions: {
    canCreateElements: boolean;
    canEditElements: boolean;
    canDeleteElements: boolean;
    canReorderElements: boolean;
  };
  userId?: string;
}

export const useEditor = (
  id: string,
  pageId: string,
  options?: UseEditorOptions,
): UseEditorReturn => {
  const [currentView, setCurrentView] = useState<Viewport>("desktop");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
  const isComponentPage = projectPages?.some((page) => page.Id === pageId && page.Type === "cp") ?? false;
  useLayoutEffect(() => { beginPage(id, pageId, isComponentPage); }, [beginPage, id, pageId, isComponentPage]);

  // Helper: check if a DOM event target is within an existing canvas element
  const isEventOverElement = useCallback((target: HTMLElement | null) => {
    return !!(
      target &&
      typeof target.closest === "function" &&
      target.closest("[data-element-id]")
    );
  }, []);

  // Navigate to a default page within a project or choose provided page
  const redirectToDefaultOrRequestedPage = useCallback(
    (pagesList: Page[] | undefined) => {
      if (!pagesList || pagesList.length === 0) return;
      if (pageId) {
        const found = pagesList.find((p) => p.Id === pageId && !p.DeletedAt);
        if (found) {
          return;
        }
      }

      // The collaboration socket only connects once `?page=` is set, so always
      // resolve a page: the unnamed default page, else the first one.
      const routes = pagesList.filter((p) => p.Type !== "cp" && !p.DeletedAt);
      const defaultPage = routes.find((p) => p.Name === "") ?? routes[0];
      if (!defaultPage) return;
      navigate({ to: `/editor/${id}?page=${defaultPage.Id}`, replace: true });
    },
    [pageId, navigate, id],
  );

  useEffect(() => {
    const pages = projectPages as Page[] | undefined;
    if (!pages || pages.length === 0) return;
    redirectToDefaultOrRequestedPage(pages);
  }, [projectPages, pageId, navigate, id]);

  useEffect(() => {
    if (!project) return;
    if (project.deletedAt) {
      navigate({ to: "/dashboard" });
      return;
    }
  }, [project, navigate]);

  const showReadOnlyError = useCallback(() => {
    showErrorToast(PERMISSION_ERRORS.cannotAdd);
  }, []);

  const canCreate = !isReadOnly && !isLocked && permissions.canCreateElements;

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (isEventOverElement(target)) return;

      if (!canCreate) {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        showReadOnlyError();
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      const payload = readDropPayload(e.dataTransfer);
      if (!payload || payload.kind === "move") return;
      let newElement: EditorElement | undefined | null;
      if (payload.kind === "create") {
        newElement = ElementFactory.getInstance().createElement({ type: payload.elementType, pageId });
      } else if (payload.kind === "template") {
        const template = customComps[payload.index];
        if (template) newElement = ElementFactory.getInstance().createElementFromTemplate({ element: template, pageId });
      } else {
        newElement = componentFromDrop(payload, queryClient, id, pageId, userId ?? null);
        if (!newElement) toast.error("This component cannot be inserted here.");
      }

      if (!newElement) return;
      if (isComponentPage && useElementStore.getState().elements.length) {
        toast.error("Drop the element inside the master’s root.");
        return;
      }
      addElement(newElement);
    },
    [isEventOverElement, canCreate, pageId, addElement, showReadOnlyError, queryClient, id, userId, isComponentPage],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement | null;
      if (isEventOverElement(target)) return;

      if (!canCreate) return;

      e.preventDefault();
      setIsDraggingOver(true);
    },
    [isEventOverElement, canCreate],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const addNewSection = useCallback(() => {
    if (!canCreate) {
      showReadOnlyError();
      return;
    }

    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId,
    });
    if (newElement) addElement(newElement);
  }, [canCreate, showReadOnlyError, pageId, addElement]);

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
      permissionsSummary,
      effectiveUserId,
    ],
  );
};
