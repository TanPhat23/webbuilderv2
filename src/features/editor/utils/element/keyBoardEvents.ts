import { ContainerElement, EditorElement } from "@/types/global.type";
import { v4 as uuidv4 } from "uuid";
import { elementHelper } from "./elementhelper";
import { ElementStore } from "@/features/editor";
import { SelectionStore } from "@/features/editor";
import { toast } from "sonner";

export interface IKeyboardEvent {
  copyElement: () => void;
  cutElement: () => void;
  pasteElement: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  deleteElement: () => void;
  saveElement: () => Promise<void>;
  setReadOnly: (value: boolean) => void;
  setLocked: (value: boolean) => void;
}

export class KeyboardEvent implements IKeyboardEvent {
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
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
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
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;
    if (!selectedElement) return;
    sessionStorage.setItem("copiedElement", JSON.stringify(selectedElement));
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
    let newElement = { ...elementData, id: uuidv4() };

    if (elementHelper.isContainerElement(newElement)) {
      const updateIdsRecursively = (
        element: ContainerElement,
      ): ContainerElement => {
        const updatedElements = element.elements.map((child) => {
          const newChild = { ...child, id: uuidv4() };
          if (elementHelper.isContainerElement(newChild)) {
            return updateIdsRecursively(newChild);
          }
          return newChild;
        });
        return { ...element, elements: updatedElements };
      };
      newElement = updateIdsRecursively(newElement as ContainerElement);
    }

    const elementState = ElementStore.getState();

    elementState.addElement(newElement);
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
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;
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
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;
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
      SelectionStore.getState().selectedElement ||
      SelectionStore.getState().hoveredElement;
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

  public saveElement = async () => {
    // This method is now handled by the SaveElementDialog component
    // The dialog will be opened from the context menu
  };
}
