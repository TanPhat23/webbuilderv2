import type { StateCreator } from "zustand";
import type { DropPosition } from "@/features/elements/lib/element-tree-helper";
import type { MoveData } from "@/types/elements";
import type { EditorElement } from "@/types/global.type";

export type ElementUpdateWirePatch = Omit<
  Partial<EditorElement>,
  "styles" | "settings"
> & {
  styles?: Record<string, unknown>;
  settings?: Record<string, unknown>;
};

export type CollaborativeData =
  Partial<EditorElement> | ElementUpdateWirePatch | EditorElement | MoveData;

export type ElementStore = {
  elements: EditorElement[];
  activePage: { projectId: string; pageId: string } | null;
  beginPage: (
    projectId: string,
    pageId: string,
    isComponentPage?: boolean,
  ) => void;
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

export type ElementStoreCreator = StateCreator<ElementStore>;
