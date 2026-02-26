"use client";
import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import ElementRenderer from "./ElementRenderer";
import type { EditorElement } from "@/types/global.type";

import ElementItem from "./element-loader/ElementItem";
import ElementReorderList from "./element-loader/ElementReorderList";
import useElementDragHandlers from "@/features/editor/hooks/element/useElementDragHandlers";
import { EditorFlagsProvider } from "./context/EditorFlagsContext";
import { DragProvider } from "./context/DragContext";

/**
 * ElementLoaderProps
 *
 * The loader is intentionally lightweight — it delegates responsibilities to:
 *  - `useElementDragHandlers` for drag / drop / reorder logic
 *  - `ElementItem` for per-element rendering & DnD UI
 *  - `ElementReorderList` for the reorderable list view
 *
 * Props drilling has been reduced by wrapping children in:
 *  - `EditorFlagsProvider` — isReadOnly, isLocked, permissionsRole, iframeRef
 *  - `DragProvider` — canDrag, isDraggingLocal, draggingElement, draggedOverElement, handlers
 *
 * `ElementItem` and `ElementReorderList` consume these via `useEditorFlags()` and
 * `useDragContext()` hooks instead of receiving them as explicit props.
 */
interface ElementLoaderProps {
  elements?: EditorElement[];
  data?: Record<string, unknown>;
  isReadOnly?: boolean;
  isLocked?: boolean;
  enableReorder?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
  isExport?: boolean;
}

export default function ElementLoader({
  elements,
  data,
  isReadOnly = false,
  isLocked = false,
  enableReorder = false,
  iframeRef,
  isExport = false,
}: ElementLoaderProps = {}) {
  const { id } = useParams();

  const {
    items,
    permissions,
    canDrag,
    canCreate,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleHover,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    handleReorder,
  } = useElementDragHandlers({
    elements,
    isReadOnly,
    isLocked,
    projectId: (id as string) || null,
  });

  const renderElement = useCallback(
    (element: EditorElement) => (
      <ElementRenderer key={element.id} element={element} data={data} />
    ),
    [data],
  );

  // Export mode: render elements without any editor wrappers
  if (isExport) {
    return (
      <>
        {items?.map((el: EditorElement) => (
          <ElementRenderer key={el.id} element={el} data={data} />
        ))}
      </>
    );
  }

  // Shared context values — provided once here instead of drilling through every child
  const editorFlagsValue = {
    isReadOnly,
    isLocked,
    permissionsRole: permissions?.role ?? null,
    iframeRef,
  };

  const dragContextValue = {
    canDrag,
    isDraggingLocal,
    draggingElement,
    draggedOverElement,
    handleDragStart,
    handleDragEnd,
    handleHover,
    handleDrop,
  };

  if (enableReorder && canDrag && items && items.length > 1) {
    return (
      <EditorFlagsProvider {...editorFlagsValue}>
        <ElementReorderList
          items={items}
          onReorder={handleReorder}
          renderElement={renderElement}
        />
      </EditorFlagsProvider>
    );
  }

  return (
    <EditorFlagsProvider {...editorFlagsValue}>
      <DragProvider {...dragContextValue}>
        {items?.map((element: EditorElement) => (
          <ElementItem
            key={element.id}
            element={element}
            renderElement={renderElement}
          />
        ))}
      </DragProvider>
    </EditorFlagsProvider>
  );
}
