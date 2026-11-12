import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useEditor } from "@/features/editor/hooks/useEditor";
import { useSearch } from "@tanstack/react-router";
import CollaborationProvider from "./collaborationprovider";
import EditorLayout from "@/features/editor/components/layout/EditorLayout";
import { toast } from "sonner";
import AIChatProvider from "./aiprovider";

interface EditorProviderProps {
  children: React.ReactNode;
  projectId?: string;
  userId?: string;
}

type EditorHookReturnType = ReturnType<typeof useEditor>;

interface EditorContextType {
  projectId: string | null;
  userId: string | null;
  editor: EditorHookReturnType;
  mode: "editor" | "wireframe";
  setMode: (mode: "editor" | "wireframe") => void;
  editingMode: "visual" | "code";
  setEditingMode: (mode: "visual" | "code") => void;
  pageId: string;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export function useEditorContext() {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error("useEditorContext must be used within EditorProvider");
  }
  return context;
}

export default function EditorProvider({
  children,
  projectId,
  userId,
}: EditorProviderProps) {
  const search = useSearch({ strict: false }) as { page?: string };
  const pageId = search.page || "";
  const [mode, setMode] = useState<"editor" | "wireframe">("editor");
  const [editingMode, setEditingMode] = useState<"visual" | "code">("visual");

  const collabEnabled = !!userId;

  const editorData = useEditor(projectId || "", pageId);

  const contextValue = useMemo<EditorContextType>(
    () => ({
      projectId: projectId || null,
      userId: userId || null,
      editor: editorData,
      mode,
      setMode,
      editingMode,
      setEditingMode,
      pageId,
    }),
    [projectId, userId, editorData, mode, editingMode, pageId],
  );

  return (
    <EditorContext.Provider value={contextValue}>
      <CollaborationProvider
        config={{
          projectId: projectId || "",
          pageId,
          wsUrl: import.meta.env.VITE_COLLAB_WS_URL || "ws://localhost:8080",
          enabled: collabEnabled,
          onSync: () => {
            toast.dismiss("collab-offline");
            toast.success("Live collaboration connected", {
              id: "collab-connected",
              duration: 3000,
            });
          },
          onError: (error) => {
            console.error("[Collaboration] Synchronization failed:", error);
            toast.error("Page synchronization failed", {
              id: "collab-offline",
              description: `${error.message} Local edits may not be saved until synchronization is restored.`,
              duration: 5000,
            });
          },
        }}
      >
        <AIChatProvider>
          <EditorLayout>{children}</EditorLayout>
        </AIChatProvider>
      </CollaborationProvider>
    </EditorContext.Provider>
  );
}
