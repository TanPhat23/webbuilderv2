import {
  createContext,
  useContext,
  type Dispatch,
  type DragEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";

export type Viewport = "mobile" | "tablet" | "desktop";

export interface UseEditorReturn {
  currentView: Viewport;
  setCurrentView: Dispatch<SetStateAction<Viewport>>;
  isDraggingOver: boolean;
  isLoading: boolean;
  selectedElement: EditorElement | undefined;
  handleDrop: (e: DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: DragEvent<HTMLDivElement>) => void;
  addNewSection: () => void;
  isReadOnly: boolean;
  isLocked: boolean;
  permissions: {
    canCreateElements: boolean;
    canEditElements: boolean;
    canDeleteElements: boolean;
    canReorderElements: boolean;
  };
  userId?: string;
}

export interface EditorContextType {
  projectId: string | null;
  userId: string | null;
  editor: UseEditorReturn;
  mode: "editor" | "wireframe";
  setMode: (mode: "editor" | "wireframe") => void;
  editingMode: "visual" | "code";
  setEditingMode: (mode: "visual" | "code") => void;
  pageId: string;
  renderAiPanel?: (onClose: () => void) => ReactNode;
  renderAgentCanvasOverlay?: (root: HTMLElement) => ReactNode;
  renderAgentPlaybackHud?: () => ReactNode;
  renderMcpConnectPanel?: () => ReactNode;
}

export const EditorContext = createContext<EditorContextType | undefined>(
  undefined,
);

export function useEditorContext(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within EditorProvider");
  }
  return context;
}
