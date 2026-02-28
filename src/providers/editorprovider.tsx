"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import { useEditor } from "@/hooks";
import { useSearchParams } from "next/navigation";
import CollaborationProvider from "./collaborationprovider";
import EditorShell from "@/features/editor/components/editor/EditorShell";
import WireframeView from "@/features/editor/components/editor/WireframeView";
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
  const searchParams = useSearchParams();
  const pageId = searchParams.get("page") || "";
  const [isMounted, setIsMounted] = useState(false);
  const [mode, setMode] = useState<"editor" | "wireframe">("editor");
  const [editingMode, setEditingMode] = useState<"visual" | "code">("visual");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const collabEnabled = isMounted && !!userId;

  const editorData = useEditor(projectId || "", pageId, {
    enableCollab: false,
    userId: userId || "guest",
  });

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
          wsUrl: process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:8080",
          enabled: collabEnabled,
          onSync: () => {
            toast.dismiss("collab-offline");
            toast.success("Live collaboration connected", {
              id: "collab-connected",
              duration: 3000,
            });
          },
          onError: () => {
            toast.info("Working in offline mode", {
              id: "collab-offline",
              description:
                "Collaboration server unavailable. Changes will be saved locally.",
              duration: 5000,
            });
          },
        }}
      >
        <AIChatProvider>
          {mode === "wireframe" ? (
            <WireframeView mode={mode} setMode={setMode} pageId={pageId} />
          ) : (
            <EditorShell>{children}</EditorShell>
          )}
        </AIChatProvider>
      </CollaborationProvider>
    </EditorContext.Provider>
  );
}
