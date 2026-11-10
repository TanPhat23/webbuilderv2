import React, { useCallback } from "react";
import { useParams } from '@tanstack/react-router';
import ElementRenderer from "./ElementRenderer";
import type { EditorElement } from "@/types/global.type";

import ElementItem from "./element-loader/ElementItem";
import useElementDragHandlers from "@/features/editor/hooks/element/useElementDragHandlers";
import { EditorFlagsProvider } from "./context/EditorFlagsContext";
import { DragProvider } from "./context/DragContext";

interface ElementLoaderProps {
  elements?: EditorElement[];
  data?: Record<string, unknown>;
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

export default function ElementLoader({
  elements,
  data,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}: ElementLoaderProps = {}) {
  const { id } = useParams({ strict: false });

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
