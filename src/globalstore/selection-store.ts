import { create } from "zustand";
import { EditorElement } from "@/types/global.type";

type SelectionStore<TElement extends EditorElement> = {
  selectedElement: TElement | undefined;
  draggingElement: TElement | undefined;
  draggedOverElement: TElement | undefined;
  hoveredElement: TElement | undefined;
  setSelectedElement: (element: TElement | undefined) => void;
  setDraggingElement: (element: TElement | undefined) => void;
  setDraggedOverElement: (element: TElement | undefined) => void;
  setHoveredElement: (element: TElement | undefined) => void;
};

const createSelectionStore = <TElement extends EditorElement>() =>
  create<SelectionStore<TElement>>((set) => ({
    selectedElement: undefined,
    draggingElement: undefined,
    draggedOverElement: undefined,
    hoveredElement: undefined,
    setSelectedElement: (element: TElement | undefined) =>
      set({ selectedElement: element }),
    setDraggingElement: (element: TElement | undefined) =>
      set({ draggingElement: element }),
    setDraggedOverElement: (element: TElement | undefined) =>
      set({ draggedOverElement: element }),
    setHoveredElement: (element: TElement | undefined) =>
      set({ hoveredElement: element }),
  }));

const useSelectionStoreImplementation = createSelectionStore();

export const useSelectionStore = useSelectionStoreImplementation as unknown as {
  <TElement extends EditorElement>(): SelectionStore<TElement>;
  <TElement extends EditorElement, U>(
    selector: (state: SelectionStore<TElement>) => U,
  ): U;
};

export const SelectionStore = useSelectionStoreImplementation;
