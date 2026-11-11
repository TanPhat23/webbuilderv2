import { create } from "zustand";
import type { EditorElement } from "@/types/global.type";

type SelectionStoreState = {
  selectedElementId: string | undefined;
  draggingElementId: string | undefined;
  draggedOverElementId: string | undefined;
  hoveredElementId: string | undefined;
  setSelectedElement: (element: EditorElement | undefined) => void;
  setDraggingElement: (element: EditorElement | undefined) => void;
  setDraggedOverElement: (element: EditorElement | undefined) => void;
  setHoveredElement: (element: EditorElement | undefined) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStoreState>((set) => ({
  selectedElementId: undefined,
  draggingElementId: undefined,
  draggedOverElementId: undefined,
  hoveredElementId: undefined,
  setSelectedElement: (element) => set({ selectedElementId: element?.id }),
  setDraggingElement: (element) => set({ draggingElementId: element?.id }),
  setDraggedOverElement: (element) => set({ draggedOverElementId: element?.id }),
  setHoveredElement: (element) => set({ hoveredElementId: element?.id }),
  clearSelection: () => set({ selectedElementId: undefined, draggingElementId: undefined, draggedOverElementId: undefined, hoveredElementId: undefined }),
}));

export const SelectionStore = useSelectionStore;
