import { EditorElement, ElementType } from "@/types/global.type";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { getComponentMap } from "@/constants/elements";
import ResizeHandler from "./resizehandler/ResizeHandler";
import EditorContextMenu from "./EditorContextMenu";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { useSelectionStore } from "@/globalstore/selection-store";
import { useElementStore } from "@/globalstore/element-store";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { motion, Reorder } from "framer-motion";
import { customComps } from "@/lib/customcomponents/customComponents";
import { useEditorPermissions } from "@/hooks/editor/useEditorPermissions";
import { CollaboratorRole } from "@/interfaces/collaboration.interface";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ArrowRightLeft } from "lucide-react";

interface ElementLoaderProps {
  elements?: EditorElement[];
  data?: any;
  isReadOnly?: boolean;
  isLocked?: boolean;
  enableReorder?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

export default function ElementLoader({
  elements,
  data,
  isReadOnly = false,
  isLocked = false,
  enableReorder = false,
  iframeRef,
}: ElementLoaderProps = {}) {
  const { id } = useParams();
  const {
    draggedOverElement,
    draggingElement,
    setDraggingElement,
    setDraggedOverElement,
  } = useSelectionStore();
  const {
    elements: allElements,
    insertElement,
    swapElement,
  } = useElementStore();
  elements = elements ? elements : allElements;
  const [isDraggingLocal, setIsDraggingLocal] = useState<string | null>(null);

  const permissions = useEditorPermissions((id as string) || null);

  const canDrag = !isReadOnly && !isLocked && permissions.canEditElements;
  const canCreate = !isReadOnly && !isLocked && permissions.canCreateElements;

  const renderElement = (element: EditorElement) => {
    const commonProps: EditorComponentProps = {
      element,
      data,
    };

    const Component = getComponentMap(commonProps);
    return Component ? <Component {...commonProps} /> : null;
  };

  const handleHover = (e: React.DragEvent, element: EditorElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDrag) {
      return;
    }

    if (draggedOverElement?.id !== element.id) {
      setDraggedOverElement(element);
    }
  };

  const handleDragStart = (e: React.DragEvent, element: EditorElement) => {
    if (!canDrag) {
      e.preventDefault();
      return;
    }

    setIsDraggingLocal(element.id);
    setDraggingElement(element);

    e.dataTransfer.setData("elementId", element.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setIsDraggingLocal(null);
    setDraggingElement(undefined);
    setDraggedOverElement(undefined);
  };

  const handleDrop = (e: React.DragEvent, element: EditorElement) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canDrag && !canCreate) {
      toast.error("Cannot perform this action - editor is in read-only mode", {
        duration: 2000,
      });
      setDraggedOverElement(undefined);
      setDraggingElement(undefined);
      setIsDraggingLocal(null);
      return;
    }

    const elementType = e.dataTransfer.getData("elementType");
    const customElement = e.dataTransfer.getData("customComponentName");
    const draggedElementId = e.dataTransfer.getData("elementId");

    if (draggedElementId && draggingElement) {
      if (draggedElementId !== element.id) {
        swapElement(draggedElementId, element.id);
        toast.success("Elements swapped successfully", {
          duration: 1500,
        });
      }
      setDraggedOverElement(undefined);
      setDraggingElement(undefined);
      setIsDraggingLocal(null);
      return;
    }

    if (elementType) {
      if (!canCreate) {
        toast.error("Cannot add elements - editor is in read-only mode", {
          duration: 2000,
        });
        setDraggedOverElement(undefined);
        setDraggingElement(undefined);
        setIsDraggingLocal(null);
        return;
      }

      const newElement = elementHelper.createElement.create(
        elementType as ElementType,
        element.pageId,
        undefined,
      );
      if (newElement) insertElement(element, newElement);
    }

    if (customElement) {
      try {
        if (!canCreate) {
          toast.error("Cannot add elements - editor is in read-only mode", {
            duration: 2000,
          });
          setDraggedOverElement(undefined);
          setDraggingElement(undefined);
          setIsDraggingLocal(null);
          return;
        }

        const customComp = customComps[parseInt(customElement)];
        const newElement = elementHelper.createElement.createFromTemplate(
          customComp,
          element.pageId,
        );
        if (newElement) insertElement(element, newElement);
      } catch (error) {
        // Silent error handling
      }
    }

    setDraggedOverElement(undefined);
    setDraggingElement(undefined);
    setIsDraggingLocal(null);
  };

  const handleReorder = (newOrder: EditorElement[]) => {
    if (!canDrag) return;

    const currentIds = elements?.map((e) => e.id) || [];
    const newIds = newOrder.map((e) => e.id);

    for (let i = 0; i < currentIds.length; i++) {
      if (currentIds[i] !== newIds[i]) {
        const originalIndex = newIds.indexOf(currentIds[i]);
        if (originalIndex !== -1 && originalIndex !== i) {
          swapElement(currentIds[i], newIds[i]);
          break;
        }
      }
    }
  };

  if (enableReorder && canDrag && elements && elements.length > 1) {
    return (
      <Reorder.Group
        axis="y"
        values={elements}
        onReorder={handleReorder}
        as="div"
        className="relative"
      >
        {elements.map((element) => (
          <Reorder.Item
            key={element.id}
            value={element}
            as="div"
            className="relative"
            whileDrag={{
              scale: 1.02,
              boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.3)",
              zIndex: 50,
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          >
            <ResizeHandler
              element={element}
              isReadOnly={isReadOnly}
              isLocked={isLocked}
              iframeRef={iframeRef}
            >
              {permissions.role === CollaboratorRole.VIEWER ? (
                renderElement(element)
              ) : (
                <EditorContextMenu
                  element={element}
                  isReadOnly={isReadOnly}
                  isLocked={isLocked}
                >
                  {renderElement(element)}
                </EditorContextMenu>
              )}
            </ResizeHandler>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    );
  }

  return (
    <>
      {elements?.map((element) => {
        const isBeingDragged = isDraggingLocal === element.id;
        const isDropTarget =
          draggedOverElement?.id === element.id && !isBeingDragged;

        return (
          <motion.div
            key={element.id}
            className={cn(
              "relative",
              isBeingDragged && "opacity-50 z-50",
              isDropTarget && "ring-2 ring-blue-500 ring-offset-2 rounded-lg",
            )}
            draggable={canDrag}
            onDragStart={(e) =>
              handleDragStart(e as unknown as React.DragEvent, element)
            }
            onDragEnd={handleDragEnd}
            style={{
              cursor: canDrag ? "grab" : "default",
            }}
          >
            <ResizeHandler
              element={element}
              isReadOnly={isReadOnly}
              isLocked={isLocked}
              iframeRef={iframeRef}
            >
              {permissions.role === CollaboratorRole.VIEWER ? (
                renderElement(element)
              ) : (
                <EditorContextMenu
                  element={element}
                  isReadOnly={isReadOnly}
                  isLocked={isLocked}
                >
                  {renderElement(element)}
                </EditorContextMenu>
              )}

              <motion.div
                onDragOver={(e) =>
                  handleHover(e as unknown as React.DragEvent, element)
                }
                onDrop={(e) =>
                  handleDrop(e as unknown as React.DragEvent, element)
                }
                animate={{
                  height: isDropTarget ? 60 : 0,
                  opacity: isDropTarget ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
                className={cn(
                  "relative flex items-center justify-center overflow-hidden rounded-lg",
                  "bg-primary/20",
                  "border-2 border-dashed border-primary/50",
                )}
              >
                {isDropTarget && (
                  <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                    <ArrowRightLeft className="w-4 h-4 text-primary" />
                    <span>{draggingElement ? "Swap Here" : "Insert Here"}</span>
                  </div>
                )}
              </motion.div>
            </ResizeHandler>
          </motion.div>
        );
      })}
    </>
  );
}
