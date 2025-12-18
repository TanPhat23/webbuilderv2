"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useElementStore } from "@/globalstore/elementstore";
import { useSelectionStore } from "@/globalstore/selectionstore";
import { usePageStore } from "@/globalstore/pagestore";
import { useProjectStore } from "@/globalstore/projectstore";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { customComps } from "@/lib/customcomponents/customComponents";
import { EditorElement, ElementType } from "@/types/global.type";
import { SectionElement } from "@/interfaces/elements.interface";
import type { Project } from "@/interfaces/project.interface";
import { useEditorPermissions } from "./useEditorPermissions";
import { useProject, useProjectPages } from "@/hooks";
import { toast } from "sonner";
import { useYjsCollabV2 } from "../realtime/use-yjs-collab-v2";

export type Viewport = "mobile" | "tablet" | "desktop";

export interface UseEditorOptions {
  enableCollab?: boolean;
  collabWsUrl?: string;
  userId?: string;
  isReadOnly?: boolean;
  isLocked?: boolean;
}

export const useEditor = (
  id: string,
  pageId: string,
  options?: UseEditorOptions,
) => {
  const [currentView, setCurrentView] = useState<Viewport>("desktop");
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const router = useRouter();
  const { userId } = useAuth();

  // Get permissions from the hook
  const permissions = useEditorPermissions(id);

  // Use passed options or fall back to permissions
  const isReadOnly = options?.isReadOnly ?? !permissions.canEditElements;
  const isLocked = options?.isLocked ?? false;

  const { addElement } = useElementStore();
  const { selectedElement } = useSelectionStore();
  const { pages, loadPages, setCurrentPage } = usePageStore();
  const { loadProject } = useProjectStore();

  const { data: projectPages, isLoading: isLoadingPages } = useProjectPages(id);
  const { data: project, isLoading: isLoadingProject } = useProject(id);

  // Use Yjs collaboration
  const yjsCollab = useYjsCollabV2({
    pageId: pageId,
    projectId: id,
    wsUrl:
      options?.collabWsUrl ||
      process.env.NEXT_PUBLIC_COLLAB_WS_URL ||
      "ws://localhost:8082",
    enabled: options?.enableCollab !== false,
    onSync: () => {
      toast.success("Live collaboration connected", {
        duration: 3000,
      });
    },
    onError: (error) => {
      toast.info("Working in offline mode", {
        description:
          "Collaboration server unavailable. Changes will be saved locally.",
        duration: 5000,
      });
    },
  });

  useEffect(() => {
    if (projectPages && projectPages.length > 0) {
      loadPages(projectPages);
      if (pageId) {
        const page = projectPages.find((p) => p.Id === pageId);
        if (page) {
          setCurrentPage(page);
        } else {
          const defaultPage = projectPages.find((p) => p.Name === "");
          if (defaultPage) {
            router.push(`/editor/${id}?page=${defaultPage.Id}`);
          } else {
            router.push(`/editor/${id}`);
          }
        }
      } else {
        // No pageId provided, redirect to default page
        const defaultPage = projectPages.find((p) => p.Name === "");
        if (defaultPage) {
          router.push(`/editor/${id}?page=${defaultPage.Id}`);
        }
      }
    }
  }, [projectPages, loadPages, pageId, setCurrentPage, router, id]);

  useEffect(() => {
    if (project) {
      if (!project || project.deletedAt) {
        router.push("/dashboard");
        return;
      }
      loadProject(project as Project);
    }
  }, [project, loadProject]);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (isReadOnly || isLocked || !permissions.canCreateElements) {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      toast.error("Cannot add elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    const elementType = e.dataTransfer.getData("elementType");
    const customElement = e.dataTransfer.getData("customComponentName");

    let newElement: EditorElement | undefined;

    if (elementType) {
      newElement = elementHelper.createElement.create(
        elementType as ElementType,
        pageId,
        "",
      );
    } else if (customElement) {
      const customComp = customComps[parseInt(customElement)];
      if (customComp) {
        newElement = elementHelper.createElement.createFromTemplate(
          customComp,
          pageId,
        );
      }
    }

    if (!newElement) return;
    addElement(newElement);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    // Prevent drag over if read-only
    if (isReadOnly || isLocked || !permissions.canCreateElements) {
      return;
    }
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const addNewSection = () => {
    if (isReadOnly || isLocked || !permissions.canCreateElements) {
      toast.error("Cannot add elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const newElement = elementHelper.createElement.create<SectionElement>(
      "Section",
      pageId,
      "",
    );
    if (newElement) addElement(newElement);
  };

  const isLoading = isLoadingPages || isLoadingProject;

  return {
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
    permissions: {
      canCreateElements: permissions.canCreateElements,
      canEditElements: permissions.canEditElements,
      canDeleteElements: permissions.canDeleteElements,
      canReorderElements: permissions.canReorderElements,
    },
    collab: {
      isConnected: yjsCollab.isConnected,
      connectionState: yjsCollab.roomState,
      isSynced: yjsCollab.isSynced,
      error: yjsCollab.error,
      ydoc: yjsCollab.ydoc,
      provider: yjsCollab.provider,
      type: "yjs" as const,
    },
    userId,
  };
};
