import { useShallow } from "zustand/react/shallow";
import { useSelectionStore } from "../selection-store";
import { useElementStore } from "../element-store";
import { ElementTreeHelper } from "../../utils/element/element-tree-helper";
import type { EditorElement } from "@/types/global.type";

/*
 * Per-element components should use the id/boolean selectors below
 * (`useIsSelected(id)` etc.): they re-render only when their own answer
 * changes. The element-object selectors walk the tree and re-render on every
 * tree change, so keep them to one-per-screen consumers (panels, overlays).
 */

export const useSelectedElementId = () =>
  useSelectionStore((s) => s.selectedElementId);
export const useHoveredElementId = () =>
  useSelectionStore((s) => s.hoveredElementId);
export const useDraggingElementId = () =>
  useSelectionStore((s) => s.draggingElementId);

export const useIsSelected = (id: string) =>
  useSelectionStore((s) => s.selectedElementId === id);
export const useIsHovered = (id: string) =>
  useSelectionStore((s) => s.hoveredElementId === id);

/** Looks up an element by id; re-renders when that element changes. */
export const useElementById = (id: string | undefined): EditorElement | undefined =>
  useElementStore((state) =>
    id ? ElementTreeHelper.findById(state.elements, id) : undefined,
  );

export const useSelectedElement = (): EditorElement | undefined =>
  useElementById(useSelectedElementId());

export const useSetSelectedElement = () => useSelectionStore((state) => state.setSelectedElement);
export const useSetDraggedOverElement = () => useSelectionStore((state) => state.setDraggedOverElement);

export const useDragState = () => ({
  draggingElement: useElementById(useDraggingElementId()),
  draggedOverElement: useElementById(
    useSelectionStore((s) => s.draggedOverElementId),
  ),
});
export const useDragAndSelectionState = () => ({
  selectedElement: useSelectedElement(),
  draggedOverElement: useDragState().draggedOverElement,
  hoveredElement: useElementById(useHoveredElementId()),
});
export const useDragActions = () => useSelectionStore(useShallow((s) => ({
  setDraggingElement: s.setDraggingElement, setDraggedOverElement: s.setDraggedOverElement,
})));
export const useSelectedElementWithSetter = () => ({
  selectedElement: useSelectedElement(), setSelectedElement: useSetSelectedElement(),
});
