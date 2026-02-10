import { create } from "zustand";
import { EditorElement } from "@/types/global.type";

type SelectionStore = {
  selectedElement: EditorElement | undefined;
  draggingElement: EditorElement | undefined;
  draggedOverElement: EditorElement | undefined;
  hoveredElement: EditorElement | undefined;
  setSelectedElement: (element: EditorElement | undefined) => void;
  setDraggingElement: (element: EditorElement | undefined) => void;
  setDraggedOverElement: (element: EditorElement | undefined) => void;
  setHoveredElement: (element: EditorElement | undefined) => void;
};

const createSelectionStore = () =>
  create<SelectionStore>((set) => ({
    selectedElement: undefined,
    draggingElement: undefined,
    draggedOverElement: undefined,
    hoveredElement: undefined,
    setSelectedElement: (element: EditorElement | undefined) =>
      set({ selectedElement: element }),
    setDraggingElement: (element: EditorElement | undefined) =>
      set({ draggingElement: element }),
    setDraggedOverElement: (element: EditorElement | undefined) =>
      set({ draggedOverElement: element }),
    setHoveredElement: (element: EditorElement | undefined) =>
      set({ hoveredElement: element }),
  }));

const useSelectionStoreImplementation = createSelectionStore();

export const useSelectionStore = useSelectionStoreImplementation as unknown as {
  (): SelectionStore;
  <U>(selector: (state: SelectionStore) => U): U;
};

export const SelectionStore = useSelectionStoreImplementation;
