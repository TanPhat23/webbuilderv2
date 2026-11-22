import type { EditorElement } from "@/types/global.type";

export interface ElementStoreLike {
  getState(): {
    elements: unknown[];
    activePage?: { projectId: string; pageId: string } | null;
    updateElement(id: string, patch: Partial<EditorElement>): unknown;
  };
}

export interface InteractionsEditorAdapter {
  elementStore: ElementStoreLike;
  useElements: () => EditorElement[];
  useSelectedElement: () => EditorElement | undefined;
  useSetSelectedElement: () => (element: EditorElement | undefined) => void;
}

const emptyElements: EditorElement[] = [];
const noopSetSelected = (_element: EditorElement | undefined): void => {};
const fallbackElementStore: ElementStoreLike = {
  getState: () => ({
    elements: emptyElements,
    activePage: null,
    updateElement: () => undefined,
  }),
};

let currentAdapter: InteractionsEditorAdapter = {
  elementStore: fallbackElementStore,
  useElements: () => emptyElements,
  useSelectedElement: () => undefined,
  useSetSelectedElement: () => noopSetSelected,
};

export function registerInteractionsEditorAdapter(
  adapter: InteractionsEditorAdapter,
): void {
  currentAdapter = adapter;
}

export function getInteractionsEditorAdapter(): InteractionsEditorAdapter {
  return currentAdapter;
}
