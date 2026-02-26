import { create, type StateCreator } from "zustand";
import { cloneDeep } from "lodash";
import { SelectionStore } from "./selection-store";
import type { ContainerElement, EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

export type MoveData = {
  elementId: string;
  newParentId: string | null;
  newPosition: number;
};

export type CollaborativeData =
  | Partial<EditorElement>
  | EditorElement
  | MoveData;

/**
 * ElementStore
 *
 * Manages the editor element tree, undo/redo history, and collaborative
 * callbacks. This is the largest store in the application — use selectors
 * from `@/features/editor` to avoid unnecessary
 * re-renders.
 *
 * @example
 * ```ts
 * import { useElements, useUpdateElement } from "@/globalstore/selectors";
 * const elements = useElements();
 * const updateElement = useUpdateElement();
 *
 * // ⚠️ Full store — causes re-renders on ANY store change
 * import { useElementStore } from "@/features/editor";
 * const { elements, updateElement } = useElementStore();
 * ```
 */
export type ElementStore = {
  elements: EditorElement[];
  past: EditorElement[][];
  future: EditorElement[][];
  yjsUpdateCallback: ((elements: EditorElement[]) => void) | null;
  collaborativeCallback:
    | ((
        type: "update" | "delete" | "create" | "move",
        id?: string,
        data?: CollaborativeData,
      ) => void)
    | null;
  loadElements: (elements: EditorElement[], skipSave?: boolean) => ElementStore;
  updateElement: (
    id: string,
    updatedElement: Partial<EditorElement>,
  ) => ElementStore;
  deleteElement: (id: string) => ElementStore;
  addElement: (...newElements: EditorElement[]) => ElementStore;
  updateAllElements: (update: Partial<EditorElement>) => ElementStore;
  insertElement: (
    parentElement: EditorElement,
    elementToBeInserted: EditorElement,
  ) => ElementStore;
  swapElement: (id1: string, id2: string) => ElementStore;
  undo: () => ElementStore;
  redo: () => ElementStore;
  clearHistory: () => ElementStore;
  setYjsUpdateCallback: (
    callback: ((elements: EditorElement[]) => void) | null,
  ) => void;
  setCollaborativeCallback: (
    callback: ElementStore["collaborativeCallback"],
  ) => void;
};

const createElementStoreImpl: StateCreator<ElementStore> = (set, get) => {
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
    data?: CollaborativeData,
  ) => {
    const { collaborativeCallback } = get();
    if (collaborativeCallback && typeof collaborativeCallback === "function") {
      collaborativeCallback(type, id, data);
    }
  };

  return {
    elements: [],
    past: [],
    future: [],
    yjsUpdateCallback: null,
    collaborativeCallback: null,

    loadElements: (elements: EditorElement[], skipSave?: boolean) => {
      set({ elements });
      if (!skipSave) {
        triggerYjsCallback();
      }
      return get();
    },

    updateElement: (id: string, updatedElement: Partial<EditorElement>) => {
      takeSnapshot();
      const { elements } = get();
      const updatedTree = elementHelper.mapUpdateById(
        elements as EditorElement[],
        id,
        (el) =>
          ({
            ...el,
            ...updatedElement,
          }) as EditorElement,
      ) as EditorElement[];

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
      ) as EditorElement[];
      set({
        elements: updatedTree,
      });
      triggerYjsCallback();
      triggerCollaborativeCallback("delete", id);
      return get();
    },

    insertElement: (
      parentElement: EditorElement,
      elementToBeInserted: EditorElement,
    ) => {
      takeSnapshot();
      const { elements } = get();
      const updated = elementHelper.mapInsertAfterId(
        elements as EditorElement[],
        parentElement.id,
        elementToBeInserted,
      ) as EditorElement[];

      set({ elements: updated });
      triggerYjsCallback();
      triggerCollaborativeCallback(
        "create",
        elementToBeInserted.id,
        elementToBeInserted,
      );
      return get();
    },

    addElement: (...newElements: EditorElement[]) => {
      takeSnapshot();
      const { elements } = get();
      const updatedTree = newElements.reduce<EditorElement[]>(
        (acc, newEl) =>
          elementHelper.mapAddChildById(acc, newEl.parentId, newEl),
        elements as EditorElement[],
      ) as EditorElement[];

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
      const updated = elementHelper.mapRecursively(
        elements as EditorElement[],
        (el) => {
          const updateEl = { ...el };
          Object.assign(updateEl, update);
          if (update.styles) {
            const safeElStyles =
              el.styles &&
              typeof el.styles === "object" &&
              !Array.isArray(el.styles)
                ? el.styles
                : {};
            updateEl.styles = { ...safeElStyles, ...update.styles };
          }
          return updateEl as EditorElement;
        },
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

      const parentId = el1.parentId ?? null;
      const updatedTree = elementHelper.mapSwapChildrenById(
        elements as EditorElement[],
        parentId,
        id1,
        id2,
      ) as EditorElement[];

      set({ elements: updatedTree });
      triggerYjsCallback();

      // Find the new position of id1 after swap
      const newIdx =
        updatedTree.length > 0
          ? parentId
            ? (() => {
                const parent = elementHelper.findById(updatedTree, parentId);
                return parent && elementHelper.isContainerElement(parent)
                  ? parent.elements.findIndex((e) => e.id === id1)
                  : -1;
              })()
            : updatedTree.findIndex((e) => e.id === id1)
          : -1;

      // Send only the first element's move to avoid conflicts
      triggerCollaborativeCallback("move", id1, {
        elementId: id1,
        newParentId: parentId,
        newPosition: newIdx,
      });

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
      callback: ElementStore["collaborativeCallback"],
    ) => {
      set({ collaborativeCallback: callback });
    },
  };
};

export const useElementStore = create<ElementStore>()(createElementStoreImpl);

/**
 * Direct access to the element store instance for use outside of React
 * (e.g. from other Zustand stores or imperative code).
 *
 * @example
 * ```ts
 * const { elements } = ElementStore.getState();
 * ElementStore.getState().updateElement(id, updates);
 * ```
 */
export const ElementStore = useElementStore;
