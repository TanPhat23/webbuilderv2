import React, { createContext, useContext, useMemo } from "react";
import type { EditorElement } from "@/types/global.type";

/** Drag state and handlers shared by every `ElementItem` under an `ElementLoader`. */
export interface DragContextValue {
  readonly canDrag: boolean;
  readonly draggingElement: EditorElement | undefined;
  readonly draggedOverElement: EditorElement | undefined;
  readonly handleDragStart: (e: React.DragEvent, element: EditorElement) => void;
  readonly handleDragEnd: () => void;
  readonly handleHover: (e: React.DragEvent, element: EditorElement) => void;
  readonly handleDrop: (e: React.DragEvent, element: EditorElement) => void;
}

const DragCtx = createContext<DragContextValue | null>(null);

export function useDragContext(): DragContextValue {
  const ctx = useContext(DragCtx);
  if (!ctx) {
    throw new Error("useDragContext must be used within a <DragProvider>");
  }
  return ctx;
}

export function DragProvider({
  canDrag,
  draggingElement,
  draggedOverElement,
  handleDragStart,
  handleDragEnd,
  handleHover,
  handleDrop,
  children,
}: DragContextValue & { children: React.ReactNode }) {
  const value = useMemo<DragContextValue>(
    () => ({
      canDrag,
      draggingElement,
      draggedOverElement,
      handleDragStart,
      handleDragEnd,
      handleHover,
      handleDrop,
    }),
    [
      canDrag,
      draggingElement,
      draggedOverElement,
      handleDragStart,
      handleDragEnd,
      handleHover,
      handleDrop,
    ],
  );

  return <DragCtx.Provider value={value}>{children}</DragCtx.Provider>;
}
