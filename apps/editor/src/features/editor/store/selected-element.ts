import { ElementStore } from "./element-store";
import { SelectionStore } from "./selection-store";
import { elementTree } from "@webbuilder/site-runtime/elements/lib/element-tree-helper";

/** The selected element only: destructive and saving actions never use the hovered one. */
export function getSelectedElement() {
  const id = SelectionStore.getState().selectedElementId;
  return id ? elementTree.findById(ElementStore.getState().elements, id) : undefined;
}

export function getSelectedOrHoveredElement() {
  const selection = SelectionStore.getState();
  const id = selection.selectedElementId ?? selection.hoveredElementId;
  return id ? elementTree.findById(ElementStore.getState().elements, id) : undefined;
}
