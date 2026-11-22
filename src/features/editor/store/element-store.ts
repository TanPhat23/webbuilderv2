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
import type { EditorElement } from "@/types/global.type";
import type { MoveData } from "@/types/elements";
import { elementHelper } from "@/features/elements/lib/elementhelper";
import type { DropPosition } from "@/features/elements/lib/element-tree-helper";

export type { MoveData };

export type ElementUpdateWirePatch = Omit<
  Partial<EditorElement>,
  "styles" | "settings"
> & {
  styles?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type CollaborativeData =
  | Partial<EditorElement>
  | ElementUpdateWirePatch
  | EditorElement
  | MoveData;

export type ElementStore = {
  elements: EditorElement[];
  activePage: { projectId: string; pageId: string } | null;
  beginPage: (projectId: string, pageId: string, isComponentPage?: boolean) => void;
  isComponentPage: boolean;
  past: EditorElement[][];
  future: EditorElement[][];
  elementsChangeCallback: ((elements: EditorElement[]) => void) | null;
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
  moveElement: (
    id: string,
    targetId: string,
    position: DropPosition,
  ) => ElementStore;
  insertElementRelative: (
    element: EditorElement,
    targetId: string,
    position: DropPosition,
  ) => ElementStore;
  /** Replace the whole page tree as one undoable step, syncing what changed. */
  replaceTree: (next: EditorElement[]) => ElementStore;
  rememberTree: (previous: EditorElement[]) => void;
  undo: () => ElementStore;
  redo: () => ElementStore;
  setElementsChangeCallback: (
    callback: ((elements: EditorElement[]) => void) | null,
  ) => void;
  setCollaborativeCallback: (
    callback: ElementStore["collaborativeCallback"],
  ) => void;
};

function fitToParent(
  tree: EditorElement[],
  id: string,
): {
  tree: EditorElement[];
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
    stylesPatch: patchWithDeletions(el.styles, styles),
  };
}

function toElementUpdateWirePatch(
  before: EditorElement | undefined,
  updated: Partial<EditorElement>,
): Partial<EditorElement> | ElementUpdateWirePatch {
  if (!before) return updated;
  const { styles, settings, ...rest } = updated;
  const wire: ElementUpdateWirePatch = { ...rest };
  if (styles !== undefined) {
    const delta = patchWithDeletions(before.styles, styles);
    if (delta) wire.styles = delta;
  }
  if (settings !== undefined) {
    const delta = patchWithDeletions(before.settings, settings);
    if (delta) wire.settings = delta;
  }
  return wire;
}

const MAX_HISTORY = 50;
type StoreSet = Parameters<StateCreator<ElementStore>>[0];
type StoreGet = Parameters<StateCreator<ElementStore>>[1];

interface LocalEdits {
  get: StoreGet;
  allowsRootCount: (tree: EditorElement[]) => boolean;
  commitLocalTree: (tree: EditorElement[]) => void;
  emit: NonNullable<ElementStore["collaborativeCallback"]>;
}

function createHistoryActions(
  { get, allowsRootCount, commitLocalTree, emit }: LocalEdits,
  set: StoreSet,
  notify: () => void,
  takeSnapshot: (elements?: EditorElement[]) => void,
): Pick<ElementStore, "replaceTree" | "rememberTree" | "undo" | "redo"> {
  const syncTreeChange = (from: EditorElement[], to: EditorElement[]) => {
    for (const op of diffTrees(from, to)) {
      if (op.type === "delete") emit("delete", op.id);
      else if (op.type === "create")
        emit("create", op.element.id, op.element);
      else if (op.type === "move")
        emit("move", op.id, {
          elementId: op.id,
          newParentId: op.newParentId,
          newPosition: op.newPosition,
        });
      else emit("update", op.id, op.patch);
    }
  };

  return {
    replaceTree: (next: EditorElement[]) => {
      const { elements } = get();
      if (!allowsRootCount(next) || diffTrees(elements, next).length === 0) return get();
      commitLocalTree(next);
      syncTreeChange(elements, next);
      return get();
    },

    rememberTree: (previous) => takeSnapshot(previous),

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
      notify();
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
      notify();
      syncTreeChange(elements, next);
      return get();
    },
  };
}

function createPlacementActions(
  { get, allowsRootCount, commitLocalTree, emit }: LocalEdits,
): Pick<ElementStore, "insertElement" | "insertElementRelative" | "moveElement" | "addElement"> {
  return {
    insertElement: (
      parentElement: EditorElement,
      elementToBeInserted: EditorElement,
    ) => {
      const { elements } = get();
      const updated = fitToParent(
        elementHelper.mapInsertAfterId(
          elements as EditorElement[],
          parentElement.id,
          elementToBeInserted,
        ) as EditorElement[],
        elementToBeInserted.id,
      ).tree;

      if (updated === elements || !allowsRootCount(updated)) return get();
      commitLocalTree(updated);
      const inserted =
        elementHelper.findById(updated, elementToBeInserted.id) ??
        elementToBeInserted;
      emit("create", inserted.id, inserted);
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
      if (placed === elements || !allowsRootCount(placed)) return get();
      const updated = fitToParent(placed, element.id).tree;
      commitLocalTree(updated);
      const inserted = elementHelper.findById(updated, element.id) ?? element;
      emit("create", inserted.id, inserted);
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
      if (moved === elements || !allowsRootCount(moved)) return get();
      const { tree: updated, stylesPatch } = fitToParent(moved, id);
      commitLocalTree(updated);
      const location = elementHelper.findLocation(updated, id);
      if (location) {
        emit("move", id, {
          elementId: id,
          newParentId: location.parentId,
          newPosition: location.index,
        });
      }
      if (stylesPatch) {
        emit("update", id, {
          styles: stylesPatch,
        });
      }
      return get();
    },

    addElement: (...newElements: EditorElement[]) => {
      const { elements } = get();
      const updatedTree = newElements.reduce<EditorElement[]>(
        (acc, newEl) =>
          fitToParent(
            elementHelper.mapAddChildById(acc, newEl.parentId, newEl),
            newEl.id,
          ).tree,
        elements as EditorElement[],
      ) as EditorElement[];

      const added = newElements.flatMap(({ id }) => elementHelper.findById(updatedTree, id) ?? []);
      if (!added.length || !allowsRootCount(updatedTree)) return get();
      commitLocalTree(updatedTree);
      for (const element of added) {
        emit("create", element.id, element);
      }
      return get();
    },
  };
}

const createElementStoreImpl: StateCreator<ElementStore> = (set, get) => {
  const takeSnapshot = (elements = get().elements) => {
    const { past } = get();
    const next = [...past, cloneDeep(elements)];
    set({
      past:
        next.length > MAX_HISTORY
          ? next.slice(next.length - MAX_HISTORY)
          : next,
      future: [],
    });
  };

  const allowsRootCount = (next: EditorElement[]): boolean =>
    !get().isComponentPage || next.length <= Math.max(1, get().elements.length);

  const notifyElementsChange = () => {
    const { elements, elementsChangeCallback } = get();
    if (elementsChangeCallback && typeof elementsChangeCallback === "function") {
      elementsChangeCallback(elements as EditorElement[]);
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

  const localEdits: LocalEdits = {
    get,
    allowsRootCount,
    emit: triggerCollaborativeCallback,
    commitLocalTree: (elements) => {
      takeSnapshot();
      set({ elements });
      notifyElementsChange();
    },
  };

  return {
    elements: [],
    activePage: null,
    isComponentPage: false,
    beginPage: (projectId, pageId, isComponentPage = false) => {
      const active = get().activePage;
      if (active?.projectId === projectId && active.pageId === pageId) {
        if (get().isComponentPage !== isComponentPage) set({ isComponentPage });
        return;
      }
      set({ activePage: { projectId, pageId }, isComponentPage, elements: [], past: [], future: [] });
      SelectionStore.getState().clearSelection();
    },
    past: [],
    future: [],
    elementsChangeCallback: null,
    collaborativeCallback: null,

    loadElements: (elements: EditorElement[], skipSave?: boolean) => {
      set({ elements });
      if (!skipSave) {
        notifyElementsChange();
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
      set({
        elements: elementHelper.mapInsertAt(without, newParentId, order, moved),
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

      notifyElementsChange();
      triggerCollaborativeCallback(
        "update",
        id,
        toElementUpdateWirePatch(before, updatedElement),
      );
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
      notifyElementsChange();
      triggerCollaborativeCallback("delete", id);
      return get();
    },

    ...createPlacementActions(localEdits),
    ...createHistoryActions(localEdits, set, notifyElementsChange, takeSnapshot),

    setElementsChangeCallback: (
      callback: ((elements: EditorElement[]) => void) | null,
    ) => {
      set({ elementsChangeCallback: callback });
    },

    setCollaborativeCallback: (
      callback: ElementStore["collaborativeCallback"],
    ) => {
      set({ collaborativeCallback: callback });
    },
  };
};

/** A fresh, independent store. The app uses the singleton below; tests that simulate several users need one each. */
export const createElementStore = () =>
  create<ElementStore>()(createElementStoreImpl);

export const useElementStore = createElementStore();

export const ElementStore = useElementStore;
