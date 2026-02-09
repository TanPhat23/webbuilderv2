import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import { EditorElement, ElementType } from "@/types/global.type";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorPermissions } from "./useEditorPermissions";
import { toast } from "sonner";
import { useParams, useSearchParams } from "next/navigation";

export function useElementCreator() {
  const { addElement } = useElementStore();
  const { setSelectedElement, setDraggedOverElement } = useSelectionStore();

  const params = useParams();
  const pageId = useSearchParams().get("page") as string;
  const projectId = params?.id as string;
  const permissions = useEditorPermissions(projectId ?? null);

  const canCreate = permissions.canCreateElements;

  const createElementFromType = (
    type: ElementType,
    parentId: string,
  ): EditorElement | undefined => {
    return elementHelper.createElement.create(type, pageId, parentId);
  };

  const handleImageDrop = (
    parsed: any,
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
        toast.error("Cannot add elements - editor is in read-only mode", {
          duration: 2000,
        });
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
        const parsed = JSON.parse(imageData);
        if (parsed.type === "image") {
          if (!permissions.canCreateElements) {
            toast.error("Cannot add elements - editor is in read-only mode", {
              duration: 2000,
            });
            return null;
          }

          return handleImageDrop(parsed, parentElement);
        }
      } catch (error) {
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
