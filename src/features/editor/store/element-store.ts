import { create, type StateCreator } from "zustand";
import {
  adaptToParent,
  parentLayout,
  type SizingStyles,
} from "@/features/editor/utils/element/sizing";
import { cloneDeep } from 'lodash-es';
import {
  diffTrees,
  patchWithDeletions,
} from "@/features/editor/utils/element/treeDiff";
import { SelectionStore } from "./selection-store";
import type { ContainerElement, EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import type { DropPosition } from "@/features/editor/utils/element/element-tree-helper";

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
 * import { useElements, useUpdateElement } from "@/features/editor";
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
  activePage: { projectId: string; pageId: string } | null;
  beginPage: (projectId: string, pageId: string) => void;
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
  remoteUpdate: (id: string, patch: Partial<EditorElement>) => void;
  remoteDelete: (id: string) => void;
  remoteAdd: (element: EditorElement) => void;
  remoteMove: (id: string, newParentId: string | null, order: number) => void;
  insertElement: (
    parentElement: EditorElement,
    elementToBeInserted: EditorElement,
  ) => ElementStore;
  swapElement: (id1: string, id2: string) => ElementStore;
  /** Moves an element before/after another element, or into a container. */
  moveElement: (
    id: string,
    targetId: string,
    position: DropPosition,
  ) => ElementStore;
  /** Inserts a new element before/after another element, or into a container. */
  insertElementRelative: (
    element: EditorElement,
    targetId: string,
    position: DropPosition,
  ) => ElementStore;
  undo: () => ElementStore;
  redo: () => ElementStore;
  setYjsUpdateCallback: (
    callback: ((elements: EditorElement[]) => void) | null,
  ) => void;
  setCollaborativeCallback: (
    callback: ElementStore["collaborativeCallback"],
  ) => void;
};

/**
 * After an element lands in a parent, fix a size that doesn't fit that
 * parent's layout (see sizing.ts). Returns the patched tree and the new
 * styles, or the same tree when nothing changed.
 */
function fitToParent(
  tree: EditorElement[],
  id: string,
): {
  tree: EditorElement[];
  styles?: EditorElement["styles"];
  /** The same change as a merge patch (removed keys are null), for the wire. */
  stylesPatch?: Record<string, unknown>;
} {
  const el = elementHelper.findById(tree, id);
  const location = elementHelper.findLocation(tree, id);
  if (!el || !location?.parentId) return { tree };
  const parent = elementHelper.findById(tree, location.parentId);
  const all = (el.styles ?? {}) as Record<string, SizingStyles | undefined>;
  const fitted = adaptToParent(all.default ?? {}, parentLayout(parent));
  if (!fitted) return { tree };
  const styles = { ...all, default: fitted } as EditorElement["styles"];
  return {
    tree: elementHelper.mapUpdateById(
      tree,
      id,
      (e) => ({ ...e, styles }) as EditorElement,
    ) as EditorElement[],
    styles,
    stylesPatch: patchWithDeletions(el.styles, styles),
  };
}

const createElementStoreImpl: StateCreator<ElementStore> = (set, get) => {
  const MAX_HISTORY = 50;

  const takeSnapshot = () => {
    const { elements, past } = get();
    const next = [...past, cloneDeep(elements)];
    set({
      past:
        next.length > MAX_HISTORY
          ? next.slice(next.length - MAX_HISTORY)
          : next,
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

  /** Sends what changed between two trees, for undo and redo. */
  const syncTreeChange = (from: EditorElement[], to: EditorElement[]) => {
    for (const op of diffTrees(from, to)) {
      if (op.type === "delete") triggerCollaborativeCallback("delete", op.id);
      else if (op.type === "create")
        triggerCollaborativeCallback("create", op.element.id, op.element);
      else if (op.type === "move")
        triggerCollaborativeCallback("move", op.id, {
          elementId: op.id,
          newParentId: op.newParentId,
          newPosition: op.newPosition,
        });
      else triggerCollaborativeCallback("update", op.id, op.patch);
    }
  };

  return {
    elements: [],
    activePage: null,
    beginPage: (projectId, pageId) => {
      const active = get().activePage;
      if (active?.projectId === projectId && active.pageId === pageId) return;
      set({ activePage: { projectId, pageId }, elements: [], past: [], future: [] });
      SelectionStore.getState().clearSelection();
    },
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

    remoteUpdate: (id: string, patch: Partial<EditorElement>) => {
      const { elements } = get();
      const updated = elementHelper.mapUpdateById(
        elements,
        id,
        (el) => ({ ...el, ...patch }) as EditorElement,
      );
      set({ elements: updated });
    },

    remoteDelete: (id: string) => {
      const { elements } = get();
      set({ elements: elementHelper.mapDeleteById(elements, id) });
    },

    remoteAdd: (element: EditorElement) => {
      const { elements } = get();
      set({
        elements: elementHelper.mapAddChildById(
          elements,
          element.parentId,
          element,
        ),
      });
    },

    remoteMove: (id: string, newParentId: string | null, order: number) => {
      const { elements } = get();
      const elementToMove = elementHelper.findById(elements, id);
      if (!elementToMove) return;
      const without = elementHelper.mapDeleteById(elements, id);
      const moved: EditorElement = {
        ...elementToMove,
        parentId: newParentId ?? undefined,
        order,
      };
      // `order` is the index in the new parent; negative means "append".
      const index =
        order >= 0
          ? order
          : (newParentId
              ? ((elementHelper.findById(without, newParentId) as ContainerElement | undefined)
                  ?.elements?.length ?? 0)
              : without.length);
      set({
        elements: elementHelper.mapInsertAt(without, newParentId, index, moved),
      });
    },

    updateElement: (id: string, updatedElement: Partial<EditorElement>) => {
      takeSnapshot();
      const { elements } = get();
      const before = elementHelper.findById(elements as EditorElement[], id);
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

      triggerYjsCallback();
      // The server deep-merges styles and settings, so a key removed here
      // must travel as null or it would survive there.
      const wire: Partial<EditorElement> = { ...updatedElement };
      for (const key of ["styles", "settings"] as const) {
        if (updatedElement[key] === undefined || !before) continue;
        const delta = patchWithDeletions(before[key], updatedElement[key]);
        if (delta) (wire as Record<string, unknown>)[key] = delta;
        else delete wire[key];
      }
      triggerCollaborativeCallback("update", id, wire);
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
      const updated = fitToParent(
        elementHelper.mapInsertAfterId(
          elements as EditorElement[],
          parentElement.id,
          elementToBeInserted,
        ) as EditorElement[],
        elementToBeInserted.id,
      ).tree;

      set({ elements: updated });
      triggerYjsCallback();
      // Send the inserted copy: it carries the corrected parentId.
      const inserted =
        elementHelper.findById(updated, elementToBeInserted.id) ??
        elementToBeInserted;
      triggerCollaborativeCallback("create", inserted.id, inserted);
      return get();
    },

    insertElementRelative: (element, targetId, position) => {
      const { elements } = get();
      const placed = elementHelper.mapInsertRelative(
        elements,
        element,
        targetId,
        position,
      );
      if (placed === elements) return get();
      const updated = fitToParent(placed, element.id).tree;
      takeSnapshot();
      set({ elements: updated });
      triggerYjsCallback();
      const inserted = elementHelper.findById(updated, element.id) ?? element;
      triggerCollaborativeCallback("create", inserted.id, inserted);
      return get();
    },

    moveElement: (id, targetId, position) => {
      const { elements } = get();
      const moved = elementHelper.mapMoveRelative(
        elements,
        id,
        targetId,
        position,
      );
      if (moved === elements) return get();
      const { tree: updated, stylesPatch } = fitToParent(moved, id);
      takeSnapshot();
      set({ elements: updated });
      triggerYjsCallback();
      const location = elementHelper.findLocation(updated, id);
      if (location) {
        triggerCollaborativeCallback("move", id, {
          elementId: id,
          newParentId: location.parentId,
          newPosition: location.index,
        });
      }
      if (stylesPatch) {
        triggerCollaborativeCallback("update", id, {
          styles: stylesPatch,
        } as Partial<EditorElement>);
      }
      return get();
    },

    addElement: (...newElements: EditorElement[]) => {
      takeSnapshot();
      const { elements } = get();
      const updatedTree = newElements.reduce<EditorElement[]>(
        (acc, newEl) =>
          fitToParent(
            elementHelper.mapAddChildById(acc, newEl.parentId, newEl),
            newEl.id,
          ).tree,
        elements as EditorElement[],
      ) as EditorElement[];

      set({
        elements: updatedTree,
      });
      triggerYjsCallback();
      for (const newEl of newElements) {
        const added = elementHelper.findById(updatedTree, newEl.id) ?? newEl;
        triggerCollaborativeCallback("create", added.id, added);
      }
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
      syncTreeChange(elements, previous);
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
      syncTreeChange(elements, next);
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
