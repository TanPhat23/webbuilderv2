import React, { useState, useMemo } from "react";
import { useEditor } from "@/features/editor/hooks/useEditor";
import {
  EditorContext,
  useEditorContext,
  type EditorContextType,
} from "@/features/editor/context/EditorContext";
import { useSearch } from "@tanstack/react-router";
import CollaborationProvider from "./collaborationprovider";
import EditorLayout from "@/features/editor/components/layout/EditorLayout";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { AgentHost } from "@/features/agent/AgentHost";
import { AgentCanvasOverlay } from "@/features/agent/components/AgentCanvasOverlay";
import { AgentPlaybackHud } from "@/features/agent/components/AgentPlaybackHud";
import ConnectCliPanel from "@/features/agent/components/ConnectCliPanel";
import { ProjectSettingsDialog } from "@/features/projectsettings";
import { ensureInteractionsEditorBridge } from "@/features/editor/lib/registerInteractionsBridge";
import { toast } from "sonner";
import AIChatProvider from "./aiprovider";

ensureInteractionsEditorBridge();

const AiChatPanel = React.lazy(() => import("@/features/ai/components/AiChatPanel"));

interface EditorProviderProps {
  children: React.ReactNode;
  projectId?: string;
  userId?: string;
}

export { useEditorContext };

export default function EditorProvider({
  children,
  projectId,
  userId,
}: EditorProviderProps) {
  const search = useSearch({ strict: false }) as { page?: string };
  const pageId = search.page || "";
  const [mode, setMode] = useState<"editor" | "wireframe">("editor");
  const [editingMode, setEditingMode] = useState<"visual" | "code">("visual");
  const settingsOpen = useEditorChromeStore((s) => s.settingsOpen);
  const setSettingsOpen = useEditorChromeStore((s) => s.setSettingsOpen);

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
      renderAiPanel: (onClose: () => void) => <AiChatPanel onClose={onClose} />,
      renderAgentCanvasOverlay: (root: HTMLElement) => (
        <AgentCanvasOverlay root={root} />
      ),
      renderAgentPlaybackHud: () => <AgentPlaybackHud />,
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
          {projectId && (
            <ProjectSettingsDialog
              projectId={projectId}
              open={settingsOpen}
              onOpenChange={setSettingsOpen}
              mcpConnectPanel={<ConnectCliPanel />}
            />
          )}
          <AgentHost />
        </AIChatProvider>
      </CollaborationProvider>
    </EditorContext.Provider>
  );
}
