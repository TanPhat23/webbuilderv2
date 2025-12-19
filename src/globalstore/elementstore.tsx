import { create } from "zustand";
import { cloneDeep } from "lodash";
import { SelectionStore } from "./selectionstore";
import { ContainerElement, EditorElement } from "@/types/global.type";
import { elementHelper } from "@/lib/utils/element/elementhelper";

type ElementStore<TElement extends EditorElement> = {
  elements: TElement[];
  past: TElement[][];
  future: TElement[][];
  yjsUpdateCallback: ((elements: EditorElement[]) => void) | null;
  collaborativeCallback:
    | ((
        type: "update" | "delete" | "create" | "move",
        id?: string,
        data?: any,
      ) => void)
    | null;
  loadElements: (
    elements: TElement[],
    skipSave?: boolean,
  ) => ElementStore<TElement>;
  updateElement: (
    id: string,
    updatedElement: Partial<TElement>,
  ) => ElementStore<TElement>;
  deleteElement: (id: string) => ElementStore<TElement>;
  addElement: (...newElements: TElement[]) => ElementStore<TElement>;
  updateAllElements: (update: Partial<EditorElement>) => ElementStore<TElement>;
  insertElement: (
    parentElement: TElement,
    elementToBeInserted: TElement,
  ) => ElementStore<TElement>;
  swapElement: (id1: string, id2: string) => ElementStore<TElement>;
  undo: () => ElementStore<TElement>;
  redo: () => ElementStore<TElement>;
  clearHistory: () => ElementStore<TElement>;
  setYjsUpdateCallback: (
    callback: ((elements: EditorElement[]) => void) | null,
  ) => void;
  setCollaborativeCallback: (
    callback:
      | ((
          type: "update" | "delete" | "create" | "move",
          id?: string,
          data?: any,
        ) => void)
      | null,
  ) => void;
};

const createElementStore = <TElement extends EditorElement>() => {
  return create<ElementStore<TElement>>((set, get) => {
    const takeSnapshot = () => {
      const { elements, past } = get();
      set({
        past: [...past, cloneDeep(elements) as TElement[]],
        future: [],
      });
    };

    const triggerYjsCallback = () => {
      const { elements, yjsUpdateCallback } = get();
      if (yjsUpdateCallback && typeof yjsUpdateCallback === "function") {
        yjsUpdateCallback(elements as EditorElement[]);
      }
    };

    const triggerCollaborativeCallback = (
      type: "update" | "delete" | "create" | "move",
      id?: string,
      data?: any,
    ) => {
      const { collaborativeCallback } = get();
      if (
        collaborativeCallback &&
        typeof collaborativeCallback === "function"
      ) {
        collaborativeCallback(type, id, data);
      }
    };

    return {
      elements: [],
      past: [],
      future: [],
      yjsUpdateCallback: null,
      collaborativeCallback: null,

      loadElements: (elements: TElement[], skipSave?: boolean) => {
        set({ elements });
        if (!skipSave) {
          triggerYjsCallback();
        }
        return get();
      },

      updateElement: (id: string, updatedElement: Partial<TElement>) => {
        console.log("Updating element:", id, updatedElement);
        takeSnapshot();
        const { elements } = get();
        const updatedTree = elementHelper.mapUpdateById(
          elements as EditorElement[],
          id,
          (el) => ({
            ...el,
            ...updatedElement,
          }),
        ) as TElement[];

        set({ elements: updatedTree });

        const { selectedElement } = SelectionStore.getState();
        if (selectedElement?.id === id) {
          const updatedSelected = elementHelper.findById(
            updatedTree as EditorElement[],
            id,
          );
          if (updatedSelected) {
            SelectionStore.setState({
              selectedElement: updatedSelected as TElement,
            });
          }
        }

        triggerYjsCallback();
        triggerCollaborativeCallback("update", id, updatedElement);
        return get();
      },

      deleteElement: (id: string) => {
        takeSnapshot();
        const { elements } = get();
        const updatedTree = elementHelper.mapDeleteById(
          elements as EditorElement[],
          id,
        ) as TElement[];
        set({
          elements: updatedTree,
        });
        triggerYjsCallback();
        triggerCollaborativeCallback("delete", id);
        return get();
      },

      insertElement: (
        parentElement: TElement,
        elementToBeInserted: TElement,
      ) => {
        takeSnapshot();
        const { elements } = get();
        const updated = elementHelper.mapInsertAfterId(
          elements as EditorElement[],
          parentElement.id,
          elementToBeInserted,
        ) as TElement[];

        set({ elements: updated });
        triggerYjsCallback();
        triggerCollaborativeCallback(
          "create",
          elementToBeInserted.id,
          elementToBeInserted,
        );
        return get();
      },

      addElement: (...newElements: TElement[]) => {
        takeSnapshot();
        const { elements } = get();
        const insertOne = (
          tree: EditorElement[],
          newEl: TElement,
        ): EditorElement[] => {
          if (!newEl.parentId) return [...tree, newEl];
          let parentFound = false;

          const addToParent = (el: EditorElement): EditorElement => {
            if (el.id === newEl.parentId) {
              if (elementHelper.isContainerElement(el)) {
                parentFound = true;
                return {
                  ...el,
                  elements: [...el.elements, newEl],
                } as EditorElement;
              }
              parentFound = true;
              return el;
            }
            if (elementHelper.isContainerElement(el)) {
              return {
                ...el,
                elements: el.elements.map(addToParent),
              } as EditorElement;
            }
            return el;
          };

          const updatedTree = tree.map(addToParent);
          if (!parentFound) return [...updatedTree, newEl];
          return updatedTree;
        };

        const updatedTree = newElements.reduce<EditorElement[]>(
          (acc, newEl) => insertOne(acc, newEl),
          elements as EditorElement[],
        ) as TElement[];

        set({
          elements: updatedTree,
        });
        triggerYjsCallback();
        for (const newEl of newElements) {
          triggerCollaborativeCallback("create", newEl.id, newEl);
        }
        return get();
      },

      updateAllElements: (update: Partial<EditorElement>) => {
        takeSnapshot();
        const { elements } = get();
        const recursivelyUpdate = (el: EditorElement): EditorElement => {
          const updated = { ...el };
          Object.assign(updated, update);
          if (update.styles) {
            const safeElStyles =
              el.styles &&
              typeof el.styles === "object" &&
              !Array.isArray(el.styles)
                ? el.styles
                : {};
            updated.styles = { ...safeElStyles, ...update.styles };
          }
          if (elementHelper.isContainerElement(el)) {
            return {
              ...updated,
              elements: el.elements.map(recursivelyUpdate),
            } as EditorElement;
          }
          return updated;
        };
        const updated = elements.map(
          (e: TElement) => recursivelyUpdate(e) as TElement,
        );
        set({ elements: updated });
        triggerYjsCallback();
        return get();
      },

      undo: () => {
        const { past, elements, future } = get();
        if (past.length === 0) return get();
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        set({
          past: newPast,
          elements: previous,
          future: [elements, ...future],
        });
        triggerYjsCallback();
        return get();
      },

      redo: () => {
        const { future, elements, past } = get();
        if (future.length === 0) return get();
        const next = future[0];
        const newFuture = future.slice(1);
        set({
          past: [...past, elements],
          elements: next,
          future: newFuture,
        });
        triggerYjsCallback();
        return get();
      },

      swapElement: (id1: string, id2: string) => {
        takeSnapshot();
        const { elements } = get();
        const el1 = elementHelper.findById(elements, id1);
        const el2 = elementHelper.findById(elements, id2);

        if (!el1 || !el2 || el1.parentId !== el2.parentId) return get();

        const parentId = el1.parentId;

        if (parentId) {
          // Nested elements
          const parent = elementHelper.findById(elements, parentId);
          if (!parent || !elementHelper.isContainerElement(parent))
            return get();

          const targetElements = (parent as ContainerElement).elements;
          const idx1 = targetElements.findIndex((e) => e.id === id1);
          const idx2 = targetElements.findIndex((e) => e.id === id2);

          if (idx1 === -1 || idx2 === -1) return get();

          const newTargetElements = [...targetElements];
          [newTargetElements[idx1], newTargetElements[idx2]] = [
            newTargetElements[idx2],
            newTargetElements[idx1],
          ];

          // Update the parent element
          const updatedParent = {
            ...parent,
            elements: newTargetElements,
          } as EditorElement;

          const updatedTree = elementHelper.mapUpdateById(
            elements as EditorElement[],
            parentId,
            () => updatedParent,
          ) as TElement[];

          set({ elements: updatedTree });

          triggerYjsCallback();

          // Send only the first element's move to avoid conflicts
          triggerCollaborativeCallback("move", id1, {
            elementId: id1,
            newParentId: parentId,
            newPosition: idx2,
          });
        } else {
          // Top-level elements
          const idx1 = elements.findIndex((e) => e.id === id1);
          const idx2 = elements.findIndex((e) => e.id === id2);

          if (idx1 === -1 || idx2 === -1) return get();

          const newElements = [...elements];
          [newElements[idx1], newElements[idx2]] = [
            newElements[idx2],
            newElements[idx1],
          ];

          set({ elements: newElements });

          triggerYjsCallback();

          // Send only the first element's move to avoid conflicts
          triggerCollaborativeCallback("move", id1, {
            elementId: id1,
            newParentId: null,
            newPosition: idx2,
          });
        }

        return get();
      },

      clearHistory: () => {
        set({ past: [], future: [] });
        return get();
      },

      setYjsUpdateCallback: (
        callback: ((elements: EditorElement[]) => void) | null,
      ) => {
        set({ yjsUpdateCallback: callback });
      },

      setCollaborativeCallback: (
        callback:
          | ((
              type: "update" | "delete" | "create" | "move",
              id?: string,
              data?: any,
            ) => void)
          | null,
      ) => {
        set({ collaborativeCallback: callback });
      },
    };
  });
};

const elementStoreInstance = createElementStore();

const useElementStoreImplementation = elementStoreInstance;

export const useElementStore = useElementStoreImplementation as {
  <TElement extends EditorElement>(): ElementStore<TElement>;
  <TElement extends EditorElement, U>(
    selector: (state: ElementStore<TElement>) => U,
  ): U;
};

export const ElementStore = elementStoreInstance;
