import { ElementStore } from "../store/element-store";
import { SelectionStore } from "../store/selection-store";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  cloneComponentTree,
  componentSetting,
  visitComponentTree,
} from "@webbuilder/site-runtime/projects/components";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import { findParentElement } from "../utils/element/ancestors";
import { toast } from "sonner";

/**
 * The selected element, and nothing else. Destructive and clipboard actions
 * must never fall back to the hovered element: the pointer resting over an
 * element is not an intent to delete it.
 */
function getSelectedElement(): EditorElement | undefined {
  return elementUtils.findById(
    ElementStore.getState().elements,
    SelectionStore.getState().selectedElementId ?? "",
  );
}

export class ElementKeyboardActions {
  private isReadOnly = false;
  private isLocked = false;

  public setReadOnly = (value: boolean): void => {
    this.isReadOnly = value;
  };

  public setLocked = (value: boolean): void => {
    this.isLocked = value;
  };

  public copyElement = (): void => {
    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
    sessionStorage.setItem(
      "copiedElementProject",
      ElementStore.getState().activePage?.projectId ?? "",
    );
  };

  public cutElement = (): void => {
    if (!getSelectedElement()) return;
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot cut elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
    sessionStorage.setItem(
      "copiedElementProject",
      ElementStore.getState().activePage?.projectId ?? "",
    );
    ElementStore.getState().deleteElement(selectedElement.id);
    SelectionStore.getState().setSelectedElement(undefined);
  };

  public pasteElement = (): void => {
    if (!sessionStorage.getItem("copiedElement")) return;
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot paste elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const copiedElement = sessionStorage.getItem("copiedElement");
    if (!copiedElement) return;

    const elementData = JSON.parse(copiedElement) as EditorElement;
    const state = ElementStore.getState();
    const { activePage } = state;
    if (!activePage) return;
    let linked = false;
    visitComponentTree([elementData], (element) => {
      if (componentSetting(element)) linked = true;
    });
    if (
      linked &&
      (state.isComponentPage ||
        sessionStorage.getItem("copiedElementProject") !== activePage.projectId)
    ) {
      toast.error(
        "Use the Components panel to add linked components to a master, or detach them to copy across projects.",
      );
      return;
    }
    const pasted = cloneComponentTree(elementData, activePage.pageId);
    const selected = getSelectedElement();
    if (!selected) {
      state.addElement(pasted);
      return;
    }
    // Into a selected container, otherwise right after the selected leaf.
    state.insertElementRelative(
      pasted,
      selected.id,
      elementUtils.isContainerElement(selected) ? "inside" : "after",
    );
  };

  public bringToFront = (): void => {
    if (!getSelectedElement()) return;
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    const elementState = ElementStore.getState();
    const elements = elementState.elements;
    const idx = elements.findIndex(
      (el: EditorElement) => el.id === selectedElement.id,
    );
    if (idx === -1) return;
    const newElements = [...elements];
    const [removed] = newElements.splice(idx, 1);
    newElements.push(removed);
    elementState.setElements(newElements);
  };

  public sendToBack = (): void => {
    if (!getSelectedElement()) return;
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    const elementState = ElementStore.getState();
    const elements = elementState.elements;
    const idx = elements.findIndex(
      (el: EditorElement) => el.id === selectedElement.id,
    );
    if (idx === -1) return;
    const newElements = [...elements];
    const [removed] = newElements.splice(idx, 1);
    newElements.unshift(removed);
    elementState.setElements(newElements);
  };

  public deleteElement = (): void => {
    if (!getSelectedElement()) return;
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot delete elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement = getSelectedElement();
    if (!selectedElement) return;
    ElementStore.getState().deleteElement(selectedElement.id);
    SelectionStore.getState().setSelectedElement(undefined);
  };

  public deselectAll = (): void => {
    SelectionStore.getState().setSelectedElement(undefined);
  };

  /**
   * Escape hierarchy: leave inline text editing, then select the parent, then
   * clear the selection.
   */
  public stepOutSelection = (): void => {
    const selection = SelectionStore.getState();
    if (selection.editingElementId !== undefined) {
      selection.setEditingElementId(undefined);
      return;
    }
    const { selectedElementId } = selection;
    if (selectedElementId === undefined) {
      selection.clearSelection();
      return;
    }
    const elements = ElementStore.getState().elements;
    const parent = findParentElement(elements, selectedElementId);
    if (parent) {
      selection.setSelectedElement(parent);
      return;
    }
    selection.clearSelection();
  };

  public undo = (): void => {
    ElementStore.getState().undo();
  };

  public redo = (): void => {
    ElementStore.getState().redo();
  };
}
