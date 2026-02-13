import { create } from "zustand";
import { EditorElement } from "@/types/global.type";

/**
 * SelectionStore
 *
 * Manages the currently selected, dragged, dragged-over, and hovered elements
 * in the editor. This store is consumed by many components — use selectors
 * from `@/globalstore/selectors/selection-selectors` to avoid unnecessary
 * re-renders.
 *
 * @example
 * ```ts
 * // ✅ Preferred — use a targeted selector
 * import { useSelectedElement } from "@/globalstore/selectors";
 * const selected = useSelectedElement();
 *
 * // ⚠️ Full store — causes re-renders on ANY selection change
 * import { useSelectionStore } from "@/globalstore/selection-store";
 * const { selectedElement } = useSelectionStore();
 * ```
 */

export type SelectionStore = {
  selectedElement: EditorElement | undefined;
  draggingElement: EditorElement | undefined;
  draggedOverElement: EditorElement | undefined;
  hoveredElement: EditorElement | undefined;
  setSelectedElement: (element: EditorElement | undefined) => void;
  setDraggingElement: (element: EditorElement | undefined) => void;
  setDraggedOverElement: (element: EditorElement | undefined) => void;
  setHoveredElement: (element: EditorElement | undefined) => void;
};

export const useSelectionStore = create<SelectionStore>((set) => ({
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

/**
 * Direct access to the selection store instance for use outside of React
 * (e.g. from other Zustand stores or imperative code).
 *
 * @example
 * ```ts
 * const { selectedElement } = SelectionStore.getState();
 * SelectionStore.setState({ selectedElement: undefined });
 * ```
 */
export const SelectionStore = useSelectionStore;
