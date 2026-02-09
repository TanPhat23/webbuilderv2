import { create } from "zustand";
import { cloneDeep } from "lodash";
import { SelectionStore } from "./selection-store";
import { ContainerElement, EditorElement } from "@/types/global.type";
import { elementHelper } from "@/lib/utils/element/elementhelper";

export type MoveData = {
  elementId: string;
  newParentId: string | null;
  newPosition: number;
};

export type CollaborativeData<T extends EditorElement = EditorElement> =
  | Partial<T>
  | T
  | MoveData;

export type ElementStore<T extends EditorElement = EditorElement> = {
  elements: T[];
  past: T[][];
  future: T[][];
  yjsUpdateCallback: ((elements: EditorElement[]) => void) | null;
  collaborativeCallback:
    | ((
        type: "update" | "delete" | "create" | "move",
        id?: string,
        data?: CollaborativeData<T>,
      ) => void)
    | null;
  loadElements: (elements: T[], skipSave?: boolean) => ElementStore<T>;
  updateElement: (id: string, updatedElement: Partial<T>) => ElementStore<T>;
  deleteElement: (id: string) => ElementStore<T>;
  addElement: (...newElements: T[]) => ElementStore<T>;
  updateAllElements: (update: Partial<EditorElement>) => ElementStore<T>;
  insertElement: (parentElement: T, elementToBeInserted: T) => ElementStore<T>;
  swapElement: (id1: string, id2: string) => ElementStore<T>;
  undo: () => ElementStore<T>;
  redo: () => ElementStore<T>;
  clearHistory: () => ElementStore<T>;
  setYjsUpdateCallback: (
    callback: ((elements: EditorElement[]) => void) | null,
  ) => void;
  setCollaborativeCallback: (
    callback: ElementStore<T>["collaborativeCallback"],
  ) => void;
};

const createElementStore = <T extends EditorElement>() => {
  return create<ElementStore<T>>((set, get) => {
    const takeSnapshot = () => {
      const { elements, past } = get();
      set({
        past: [...past, cloneDeep(elements)],
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
      data?: CollaborativeData<T>,
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

      loadElements: (elements: T[], skipSave?: boolean) => {
        set({ elements });
        if (!skipSave) {
          triggerYjsCallback();
        }
        return get();
      },

      updateElement: (id: string, updatedElement: Partial<T>) => {
        takeSnapshot();
        const { elements } = get();
        const updatedTree = elementHelper.mapUpdateById(
          elements as EditorElement[],
          id,
          (el) => ({
            ...el,
            ...updatedElement,
          }),
        ) as T[];

        set({ elements: updatedTree });

        const { selectedElement } = SelectionStore.getState();
        if (selectedElement?.id === id) {
          const updatedSelected = elementHelper.findById(
            updatedTree as EditorElement[],
            id,
          );
          if (updatedSelected) {
            SelectionStore.setState({
              selectedElement: updatedSelected as EditorElement,
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
        ) as T[];
        set({
          elements: updatedTree,
        });
        triggerYjsCallback();
        triggerCollaborativeCallback("delete", id);
        return get();
      },

      insertElement: (parentElement: T, elementToBeInserted: T) => {
        takeSnapshot();
        const { elements } = get();
        const updated = elementHelper.mapInsertAfterId(
          elements as EditorElement[],
          parentElement.id,
          elementToBeInserted,
        ) as T[];

        set({ elements: updated });
        triggerYjsCallback();
        triggerCollaborativeCallback(
          "create",
          elementToBeInserted.id,
          elementToBeInserted,
        );
        return get();
      },

      addElement: (...newElements: T[]) => {
        takeSnapshot();
        const { elements } = get();
        const insertOne = (
          tree: EditorElement[],
          newEl: T,
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
        ) as T[];

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
          (e) => recursivelyUpdate(e as EditorElement) as T,
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
        const el1 = elementHelper.findById(elements as EditorElement[], id1);
        const el2 = elementHelper.findById(elements as EditorElement[], id2);

        if (!el1 || !el2 || el1.parentId !== el2.parentId) return get();

        const parentId = el1.parentId;

        if (parentId) {
          // Nested elements
          const parent = elementHelper.findById(
            elements as EditorElement[],
            parentId,
          );
          if (!parent || !elementHelper.isContainerElement(parent))
            return get();

          const targetElements = parent.elements;
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
          ) as T[];

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
        callback: ElementStore<T>["collaborativeCallback"],
      ) => {
        set({ collaborativeCallback: callback });
      },
    };
  });
};

const elementStoreInstance = createElementStore<EditorElement>();

export const useElementStore = elementStoreInstance as {
  <T extends EditorElement = EditorElement>(): ElementStore<T>;
  <U, T extends EditorElement = EditorElement>(
    selector: (state: ElementStore<T>) => U,
  ): U;
};

export const ElementStore = elementStoreInstance;
