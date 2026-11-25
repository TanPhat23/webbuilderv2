import { ElementStore } from "./element-store";
import { SelectionStore } from "./selection-store";
import { elementTree } from "@/features/elements/lib/element-tree-helper";

export function getSelectedOrHoveredElement() {
  const selection = SelectionStore.getState();
  const id = selection.selectedElementId ?? selection.hoveredElementId;
  return id ? elementTree.findById(ElementStore.getState().elements, id) : undefined;
}
