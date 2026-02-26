"use client";
import { useAddElement } from "@/features/editor";
import {
  useSetSelectedElement,
  useSetDraggedOverElement,
} from "@/features/editor";
import { EditorElement, ElementType } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import {
  showErrorToast,
  PERMISSION_ERRORS,
} from "@/utils/errors/errorToast";
import { useParams, useSearchParams } from "next/navigation";

/** Shape of the JSON payload received when an image is dropped onto the canvas. */
interface ImageDropPayload {
  type: "image";
  imageLink: string;
  imageName?: string;
}

export function useElementCreator() {
  const addElement = useAddElement();
  const setSelectedElement = useSetSelectedElement();
  const setDraggedOverElement = useSetDraggedOverElement();

  const params = useParams();
  const pageId = useSearchParams().get("page") as string;
  const projectId = params?.id as string;
  const permissions = useEditorPermissions(projectId ?? null);

  const canCreate = permissions.canCreateElements;

  const createElementFromType = (
    type: ElementType,
    parentId: string,
  ): EditorElement | undefined => {
    return ElementFactory.getInstance().createElement({
      type,
      pageId,
      parentId,
    });
  };

  const handleImageDrop = (
    parsed: ImageDropPayload,
    parentElement: EditorElement,
  ): EditorElement | null => {
    const isContainer = elementHelper.isContainerElement(parentElement);
    if (!isContainer) {
      return null;
    }

    const newElement = createElementFromType("Image", parentElement.id);
    if (newElement) {
      newElement.src = parsed.imageLink;
      newElement.name = parsed.imageName || "Image";
    }

    return newElement || null;
  };

  const createElementFromDrop = (
    e: React.DragEvent,
    parentElement: EditorElement,
  ): EditorElement | null => {
    const data = e.dataTransfer.getData("elementType");

    if (data) {
      if (!permissions.canCreateElements) {
        showErrorToast(PERMISSION_ERRORS.cannotAdd);
        return null;
      }

      const isContainer = elementHelper.isContainerElement(parentElement);
      if (!isContainer) {
        return null;
      }

      const newElement = createElementFromType(
        data as ElementType,
        parentElement.id,
      );
      return newElement || null;
    }
    // Handling image drop
    const imageData = e.dataTransfer.getData("application/json");
    if (imageData) {
      try {
        const parsed: unknown = JSON.parse(imageData);
        if (
          typeof parsed === "object" &&
          parsed !== null &&
          "type" in parsed &&
          (parsed as Record<string, unknown>).type === "image"
        ) {
          if (!permissions.canCreateElements) {
            showErrorToast(PERMISSION_ERRORS.cannotAdd);
            return null;
          }

          return handleImageDrop(parsed as ImageDropPayload, parentElement);
        }
      } catch {
        // Ignore parsing errors
      }
    }

    return null;
  };

  const completeElementCreation = (newElement: EditorElement) => {
    addElement(newElement);
    setSelectedElement(newElement);
    setDraggedOverElement(undefined);
  };

  return {
    createElementFromType,
    handleImageDrop,
    createElementFromDrop,
    completeElementCreation,
    canCreate,
  };
}
