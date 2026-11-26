import type React from "react";
import { useCallback, useState } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { showErrorToast, PERMISSION_ERRORS } from "@/utils/errors/errorToast";
import { readDropPayload } from "../utils/element/dragPayload";
import { ElementFactory } from "../lib/ElementFactory";
import { resolveInsertedElement } from "../lib/dropElement";
import { isEventOverElement } from "../lib/editorPage";
import { useElementStore } from "../store/element-store";

interface UseCanvasRootDropOptions {
  projectId: string;
  pageId: string;
  userId: string | null;
  canCreate: boolean;
  isComponentPage: boolean;
  queryClient: QueryClient;
  addElement: (element: EditorElement) => void;
}

export function useCanvasRootDrop({
  projectId,
  pageId,
  userId,
  canCreate,
  isComponentPage,
  queryClient,
  addElement,
}: UseCanvasRootDropOptions): {
  isDraggingOver: boolean;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  addNewSection: () => void;
} {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isEventOverElement(e.target)) return;

      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (!canCreate) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return;
      }

      const payload = readDropPayload(e.dataTransfer);
      if (!payload || payload.kind === "move") return;

      const newElement = resolveInsertedElement(
        payload,
        pageId,
        queryClient,
        projectId,
        userId,
      );
      if (!newElement) return;

      if (isComponentPage && useElementStore.getState().elements.length > 0) {
        toast.error("Drop the element inside the master’s root.");
        return;
      }
      addElement(newElement);
    },
    [canCreate, pageId, queryClient, projectId, userId, isComponentPage, addElement],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (isEventOverElement(e.target) || !canCreate) return;
      e.preventDefault();
      setIsDraggingOver(true);
    },
    [canCreate],
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const addNewSection = useCallback(() => {
    if (!canCreate) {
      showErrorToast(PERMISSION_ERRORS.cannotAdd);
      return;
    }

    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId,
    });
    if (newElement) addElement(newElement);
  }, [canCreate, pageId, addElement]);

  return {
    isDraggingOver,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    addNewSection,
  };
}
