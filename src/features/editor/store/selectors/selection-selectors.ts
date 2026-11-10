/**
 * Selection Store Selectors
 *
 * Provides memoized selectors for the selection store to prevent unnecessary
 * re-renders. Components should use these selectors instead of destructuring
 * the full store with `useSelectionStore()`.
 *
 * @example
 * ```ts
 * // ❌ Bad — re-renders on ANY selection change (selected, dragging, hovered, draggedOver)
 * const { selectedElement, setSelectedElement } = useSelectionStore();
 */

import { useShallow } from "zustand/react/shallow";
import { useSelectionStore } from "@/features/editor";
import type { EditorElement } from "@/types/global.type";

// ─── Individual State Selectors ──────────────────────────────────────

/** Select only the currently selected element. */
export const useSelectedElement = (): EditorElement | undefined =>
  useSelectionStore((s) => s.selectedElement);

// ─── Individual Action Selectors ─────────────────────────────────────
// Actions are stable references in Zustand — they never change after store
// creation, so selecting them individually will never cause a re-render.

/** Select only the setSelectedElement action. */
export const useSetSelectedElement = () =>
  useSelectionStore((s) => s.setSelectedElement);

/** Select only the setDraggedOverElement action. */
export const useSetDraggedOverElement = () =>
  useSelectionStore((s) => s.setDraggedOverElement);

/**
 * Select all drag-related state (shallow compared).
 * Used by drag handlers and the ResizeHandler component.
 */
export const useDragState = () =>
  useSelectionStore(
    useShallow((s) => ({
      draggingElement: s.draggingElement,
      draggedOverElement: s.draggedOverElement,
    })),
  );

/**
 * Select drag state + selected element (shallow compared).
 * Used by the ResizeHandler which needs all three.
 */
export const useDragAndSelectionState = () =>
  useSelectionStore(
    useShallow((s) => ({
      selectedElement: s.selectedElement,
      draggedOverElement: s.draggedOverElement,
      hoveredElement: s.hoveredElement,
    })),
  );

/**
 * Select drag-related action setters (shallow compared).
 * Used by DnD hooks that need to update drag state.
 */
export const useDragActions = () =>
  useSelectionStore(
    useShallow((s) => ({
      setDraggingElement: s.setDraggingElement,
      setDraggedOverElement: s.setDraggedOverElement,
    })),
  );

// ─── State + Actions Combined ────────────────────────────────────────

/**
 * Selected element + its setter — the most common pattern in sidebar panels.
 * Only re-renders when `selectedElement` reference changes.
 */
export const useSelectedElementWithSetter = () =>
  useSelectionStore(
    useShallow((s) => ({
      selectedElement: s.selectedElement,
      setSelectedElement: s.setSelectedElement,
    })),
  );

/**
 * Full drag state + all drag action setters — used by useElementDnD and
 * useElementDragHandlers hooks.
 */
export const useFullDragContext = () =>
  useSelectionStore(
    useShallow((s) => ({
      draggingElement: s.draggingElement,
      draggedOverElement: s.draggedOverElement,
      selectedElement: s.selectedElement,
      setSelectedElement: s.setSelectedElement,
      setDraggingElement: s.setDraggingElement,
      setDraggedOverElement: s.setDraggedOverElement,
      setHoveredElement: s.setHoveredElement,
    })),
  );

/**
 * Interaction-focused selection: selected + hovered + their setters.
 * Used by useElementInteraction hook.
 */
export const useInteractionSelectionState = () =>
  useSelectionStore(
    useShallow((s) => ({
      selectedElement: s.selectedElement,
      hoveredElement: s.hoveredElement,
      setSelectedElement: s.setSelectedElement,
      setHoveredElement: s.setHoveredElement,
    })),
  );
