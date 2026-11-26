import { create } from "zustand";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

type SelectionStoreState = {
  selectedElementId: string | undefined;
  /** Element whose text is being edited inline; always implies it is selected. */
  editingElementId: string | undefined;
  draggingElementId: string | undefined;
  draggedOverElementId: string | undefined;
  hoveredElementId: string | undefined;
  setSelectedElement: (element: EditorElement | undefined) => void;
  setEditingElementId: (id: string | undefined) => void;
  setDraggingElement: (element: EditorElement | undefined) => void;
  setDraggedOverElement: (element: EditorElement | undefined) => void;
  setHoveredElement: (element: EditorElement | undefined) => void;
  clearSelection: () => void;
};

export const useSelectionStore = create<SelectionStoreState>((set) => ({
  selectedElementId: undefined,
  editingElementId: undefined,
  draggingElementId: undefined,
  draggedOverElementId: undefined,
  hoveredElementId: undefined,
  // Selecting a different element (or nothing) always leaves text editing.
  setSelectedElement: (element) =>
    set((state) =>
      element?.id === state.selectedElementId
        ? state
        : { selectedElementId: element?.id, editingElementId: undefined },
    ),
  setEditingElementId: (id) => set({ editingElementId: id }),
  setDraggingElement: (element) => set({ draggingElementId: element?.id }),
  setDraggedOverElement: (element) => set({ draggedOverElementId: element?.id }),
  setHoveredElement: (element) => set({ hoveredElementId: element?.id }),
  clearSelection: () =>
    set({
      selectedElementId: undefined,
      editingElementId: undefined,
      draggingElementId: undefined,
      draggedOverElementId: undefined,
      hoveredElementId: undefined,
    }),
}));

export const SelectionStore = useSelectionStore;
