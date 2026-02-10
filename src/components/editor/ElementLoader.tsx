import React, { useCallback } from "react";
import { useParams } from "next/navigation";
import ElementRenderer from "./ElementRenderer";
import type { EditorElement } from "@/types/global.type";

import ElementItem from "./element-loader/ElementItem";
import ElementReorderList from "./element-loader/ElementReorderList";
import useElementDragHandlers from "@/hooks/editor/element/useElementDragHandlers";

/**
 * ElementLoaderProps
 *
 * The loader is intentionally lightweight — it delegates responsibilities to:
 *  - `useElementDragHandlers` for drag / drop / reorder logic
 *  - `ElementItem` for per-element rendering & DnD UI
 *  - `ElementReorderList` for the reorderable list view
 *
 * This keeps the file maintainable and the responsibilities well scoped.
 */
interface ElementLoaderProps {
  elements?: EditorElement[];
  data?: any;
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

  if (isExport) {
    return (
      <>
        {items?.map((el: EditorElement) => (
          <ElementRenderer key={el.id} element={el} data={data} />
        ))}
      </>
    );
  }

  if (enableReorder && canDrag && items && items.length > 1) {
    return (
      <ElementReorderList
        items={items}
        onReorder={handleReorder}
        renderElement={renderElement}
        isReadOnly={isReadOnly}
        isLocked={isLocked}
        iframeRef={iframeRef}
        permissionsRole={permissions?.role ?? null}
      />
    );
  }

  return (
    <>
      {items?.map((element: EditorElement) => (
        <ElementItem
          key={element.id}
          element={element}
          isReadOnly={isReadOnly}
          isLocked={isLocked}
          iframeRef={iframeRef}
          renderElement={renderElement}
          canDrag={canDrag}
          isDraggingLocal={isDraggingLocal}
          draggingElement={draggingElement}
          draggedOverElement={draggedOverElement}
          handleDragStart={handleDragStart}
          handleDragEnd={handleDragEnd}
          handleHover={handleHover}
          handleDrop={handleDrop}
          permissionsRole={permissions?.role ?? null}
        />
      ))}
    </>
  );
}
