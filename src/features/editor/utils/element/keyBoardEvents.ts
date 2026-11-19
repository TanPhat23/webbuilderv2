import { getSelectedOrHoveredElement } from "@/features/editor/store/selected-element";
import { EditorElement } from "@/types/global.type";
import { cloneComponentTree, componentSetting, visitComponentTree } from "@/features/projects/lib/components";
import { elementHelper } from "./elementhelper";
import { ElementStore } from "@/features/editor";
import { SelectionStore } from "@/features/editor";
import { toast } from "sonner";

export class ElementKeyboardActions {
  private isReadOnly = false;
  private isLocked = false;

  public setReadOnly = (value: boolean) => {
    this.isReadOnly = value;
  };

  public setLocked = (value: boolean) => {
    this.isLocked = value;
  };

  public copyElement = () => {
    const selectedElement =
      getSelectedOrHoveredElement();
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
    sessionStorage.setItem("copiedElementProject", ElementStore.getState().activePage?.projectId ?? "");
  };

  public cutElement = () => {
    // Prevent cut in read-only or locked mode
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot cut elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement =
      getSelectedOrHoveredElement();
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
    sessionStorage.setItem("copiedElementProject", ElementStore.getState().activePage?.projectId ?? "");
    ElementStore.getState().deleteElement(selectedElement.id);
    SelectionStore.getState().setSelectedElement(undefined);
  };

  public pasteElement = () => {
    // Prevent paste in read-only or locked mode
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
    visitComponentTree([elementData], (element) => { if (componentSetting(element)) linked = true; });
    if (linked && (state.isComponentPage || sessionStorage.getItem("copiedElementProject") !== activePage.projectId)) {
      toast.error("Use the Components panel to add linked components to a master, or detach them to copy across projects.");
      return;
    }
    state.addElement(cloneComponentTree(elementData, activePage.pageId));
  };

  public bringToFront = () => {
    // Prevent reorder in read-only or locked mode
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement =
      getSelectedOrHoveredElement();
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
    elementState.loadElements(newElements);
  };

  public sendToBack = () => {
    // Prevent reorder in read-only or locked mode
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot reorder elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement =
      getSelectedOrHoveredElement();
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
    elementState.loadElements(newElements);
  };

  public deleteElement = () => {
    // Prevent delete in read-only or locked mode
    if (this.isReadOnly || this.isLocked) {
      toast.error("Cannot delete elements - editor is in read-only mode", {
        duration: 2000,
      });
      return;
    }

    const selectedElement =
      getSelectedOrHoveredElement();
    if (!selectedElement) return;
    ElementStore.getState().deleteElement(selectedElement.id);
    SelectionStore.getState().setSelectedElement(undefined);
  };

  public deselectAll = () => {
    SelectionStore.getState().setSelectedElement(undefined);
  };

  public undo = () => {
    ElementStore.getState().undo();
  };

  public redo = () => {
    ElementStore.getState().redo();
  };
}
