"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { EditorElement } from "@/types/global.type";

/**
 * Drag-related state and handlers that are commonly prop-drilled through the
 * ElementLoader → ElementItem chain.
 *
 * By placing these in a context, `ElementItem` no longer needs ~10 drag-related
 * props drilled from the parent — it can simply call `useDragContext()`.
 */
export interface DragContextValue {
  // ---- Drag state ----

  /** Whether the current user is allowed to drag/reorder elements. */
  readonly canDrag: boolean;

  /** The id of the element currently being dragged locally, or `null`. */
  readonly isDraggingLocal: string | null;

  /** The element being dragged (from the selection store). */
  readonly draggingElement: EditorElement | undefined;

  /** The element currently hovered during a drag (drop target indicator). */
  readonly draggedOverElement: EditorElement | undefined;

  // ---- Drag handlers ----

  /** Called when the user starts dragging an element. */
  readonly handleDragStart: (e: React.DragEvent, element: EditorElement) => void;

  /** Called when the drag operation ends (drop or cancel). */
  readonly handleDragEnd: () => void;

  /** Called when a dragged item hovers over a potential drop target. */
  readonly handleHover: (e: React.DragEvent, element: EditorElement) => void;

  /** Called when an element is dropped onto a target. */
  readonly handleDrop: (e: React.DragEvent, element: EditorElement) => void;
}

const DragCtx = createContext<DragContextValue | null>(null);

/**
 * Hook to read the nearest {@link DragContextValue} from context.
 *
 * Throws if used outside of a `<DragProvider>`.
 *
 * @example
 * ```tsx
 * const {
 *   canDrag,
 *   isDraggingLocal,
 *   draggingElement,
 *   draggedOverElement,
 *   handleDragStart,
 *   handleDragEnd,
 *   handleHover,
 *   handleDrop,
 * } = useDragContext();
 * ```
 */
export function useDragContext(): DragContextValue {
  const ctx = useContext(DragCtx);
  if (!ctx) {
    throw new Error("useDragContext must be used within a <DragProvider>");
  }
  return ctx;
}

/**
 * Optional variant that returns `null` when no provider is present.
 * Useful for components that can render both inside and outside the drag tree.
 */
export function useDragContextOptional(): DragContextValue | null {
  return useContext(DragCtx);
}

/**
 * Props for the {@link DragProvider}.
 */
export interface DragProviderProps extends DragContextValue {
  children: React.ReactNode;
}

/**
 * Provides drag-related state and handlers to all descendants via context.
 *
 * Wrap this around the element list rendered by `ElementLoader` so that
 * individual `ElementItem` components can consume drag state without receiving
 * it as props.
 *
 * The provider is memoized — the context value only changes when one of the
 * drag state values or handler references changes.
 *
 * @example
 * ```tsx
 * <DragProvider
 *   canDrag={canDrag}
 *   isDraggingLocal={isDraggingLocal}
 *   draggingElement={draggingElement}
 *   draggedOverElement={draggedOverElement}
 *   handleDragStart={handleDragStart}
 *   handleDragEnd={handleDragEnd}
 *   handleHover={handleHover}
 *   handleDrop={handleDrop}
 * >
 *   {items.map((el) => (
 *     <ElementItem key={el.id} element={el} renderElement={renderElement} />
 *   ))}
 * </DragProvider>
 * ```
 */
export function DragProvider({
  canDrag,
  isDraggingLocal,
  draggingElement,
  draggedOverElement,
  handleDragStart,
  handleDragEnd,
  handleHover,
  handleDrop,
  children,
}: DragProviderProps) {
  const value = useMemo<DragContextValue>(
    () => ({
      canDrag,
      isDraggingLocal,
      draggingElement,
      draggedOverElement,
      handleDragStart,
      handleDragEnd,
      handleHover,
      handleDrop,
    }),
    [
      canDrag,
      isDraggingLocal,
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
