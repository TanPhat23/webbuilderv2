import { create } from "zustand";
import type { EditorElement } from "@/types/global.type";
import { createElementHistory } from "./element-store-history";
import { createLocalElementActions } from "./element-store-local";
import { createRemoteElementActions } from "./element-store-remote";
import type {
  ElementStore as ElementStoreState,
  ElementStoreCreator,
} from "./element-store-types";
import { SelectionStore } from "./selection-store";

export type { MoveData } from "@/types/elements";
export type {
  CollaborativeData,
  ElementUpdateWirePatch,
} from "./element-store-types";

export type ElementStore = ElementStoreState;

function createBeginPage(
  set: Parameters<ElementStoreCreator>[0],
  get: Parameters<ElementStoreCreator>[1],
): ElementStore["beginPage"] {
  return (projectId, pageId, isComponentPage = false) => {
    const { activePage, isComponentPage: wasComponentPage } = get();
    if (activePage?.projectId === projectId && activePage.pageId === pageId) {
      if (wasComponentPage !== isComponentPage) set({ isComponentPage });
      return;
    }
    set({
      activePage: { projectId, pageId },
      isComponentPage,
      elements: [],
      past: [],
      future: [],
    });
    SelectionStore.getState().clearSelection();
  };
}

const createElementStoreImpl: ElementStoreCreator = (set, get) => {
  const notify = () => {
    const { elements, elementsChangeCallback } = get();
    elementsChangeCallback?.(elements);
  };
  const emit: NonNullable<ElementStore["collaborativeCallback"]> = (
    type,
    id,
    data,
  ) => get().collaborativeCallback?.(type, id, data);

  const allowsRootCount = (next: EditorElement[]): boolean => {
    const { isComponentPage, elements } = get();
    return !isComponentPage || next.length <= Math.max(1, elements.length);
  };

  const { actions: historyActions, ...history } = createElementHistory(
    set,
    get,
    {
      notify,
      emit,
      allowsRootCount,
    },
  );

  return {
    elements: [],
    activePage: null,
    isComponentPage: false,
    past: [],
    future: [],
    elementsChangeCallback: null,
    collaborativeCallback: null,

    beginPage: createBeginPage(set, get),

    loadElements: (elements, skipSave) => {
      set({ elements });
      if (!skipSave) notify();
      return get();
    },

    setElementsChangeCallback: (elementsChangeCallback) =>
      set({ elementsChangeCallback }),
    setCollaborativeCallback: (collaborativeCallback) =>
      set({ collaborativeCallback }),
    ...createLocalElementActions(get, { ...history, emit, allowsRootCount }),
    ...createRemoteElementActions(set),
    ...historyActions,
  };
};

/** A fresh, independent store for clients that need their own editor state. */
export const createElementStore = () =>
  create<ElementStore>()(createElementStoreImpl);

export const useElementStore = createElementStore();

export const ElementStore = useElementStore;
