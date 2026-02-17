"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useAddElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { usePageStore } from "@/globalstore/page-store";
import { useProjectStore } from "@/globalstore/project-store";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { ElementFactory } from "@/lib/utils/element/create/ElementFactory";
import { customComps } from "@/lib/customcomponents/customComponents";
import { EditorElement, ElementType } from "@/types/global.type";
import { SectionElement } from "@/interfaces/elements.interface";
import type { Project } from "@/interfaces/project.interface";
import { useEditorPermissions } from "./useEditorPermissions";
import { useProject, useProjectPages } from "@/hooks";
import {
  showErrorToast,
  PERMISSION_ERRORS,
} from "@/lib/utils/errors/errorToast";
import { Page } from "@/interfaces/page.interface";

export type Viewport = "mobile" | "tablet" | "desktop";

export interface UseEditorOptions {
  enableCollab?: boolean;
  collabWsUrl?: string;
  userId?: string;
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
  const router = useRouter();
  const { userId } = useAuth();
  const effectiveUserId = userId ?? undefined;

  const permissions = useEditorPermissions(id);

  const isReadOnly = options?.isReadOnly ?? !permissions.canEditElements;
  const isLocked = options?.isLocked ?? false;

  const addElement = useAddElement();
  const selectedElement = useSelectedElement();
  const { loadPages, setCurrentPage } = usePageStore();
  const { loadProject } = useProjectStore();

  const { data: projectPages, isLoading: isLoadingPages } = useProjectPages(id);
  const { data: project, isLoading: isLoadingProject } = useProject(id);

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
      loadPages(pagesList);

      if (pageId) {
        const found = pagesList.find((p) => p.Id === pageId);
        if (found) {
          setCurrentPage(found);
          return;
        }
      }

      const defaultPage = pagesList.find((p) => p.Name === "");
      if (defaultPage) {
        router.push(`/editor/${id}?page=${defaultPage.Id}`);
      } else if (!pageId) {
        router.push(`/editor/${id}`);
      }
    },
    [loadPages, pageId, setCurrentPage, router, id],
  );

  useEffect(() => {
    if (!projectPages || projectPages.length === 0) return;
    redirectToDefaultOrRequestedPage(projectPages);
  }, [projectPages, loadPages, pageId, setCurrentPage, router, id]);

  useEffect(() => {
    if (!project) return;
    if (project.deletedAt) {
      router.push("/dashboard");
      return;
    }
    loadProject(project as Project);
  }, [project, loadProject, router]);

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

      const elementType = e.dataTransfer.getData("elementType");
      const customElement = e.dataTransfer.getData("customComponentName");

      let newElement: EditorElement | undefined;

      if (elementType) {
        newElement = ElementFactory.getInstance().createElement({
          type: elementType as ElementType,
          pageId,
        });
      } else if (customElement) {
        const customComp = customComps[parseInt(customElement, 10)];
        if (customComp) {
          newElement = ElementFactory.getInstance().createElementFromTemplate({
            element: customComp,
            pageId,
          });
        }
      }

      if (!newElement) return;
      addElement(newElement);
    },
    [isEventOverElement, canCreate, pageId, addElement, showReadOnlyError],
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
