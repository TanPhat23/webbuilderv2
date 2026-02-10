"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSideBar } from "@/components/editor/sidebar/EditorSideBar";
import LayoutSideBar from "@/components/editor/sidebar/LayoutSideBar";
import AIChatProvider from "./aiprovider";
import AIChatPanel from "@/components/editor/ai/AiChatPanel";
import { useAiChat } from "./aiprovider";
import { ElementCommentsPanel } from "@/components/editor/comments/ElementCommentsPanel";
import { useEditor } from "@/hooks";
import { useSearchParams } from "next/navigation";
import WireframeManager from "@/components/editor/wireframe/WireframeManager";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, PenTool } from "lucide-react";
import CollaborationProvider from "./collaborationprovider";
import { toast } from "sonner";

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

function LeftSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { chatOpen } = useAiChat();

  return (
    <SidebarProvider
      defaultOpen={true}
      className="shrink-0"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      <EditorSideBar />
      {chatOpen && <AIChatPanel />}
      {children}
    </SidebarProvider>
  );
}

function RightSidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider
      defaultOpen={true}
      className="shrink-0"
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "3rem",
        } as React.CSSProperties
      }
    >
      {children}
      <LayoutSideBar />
    </SidebarProvider>
  );
}

function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <LeftSidebarWrapper>
        <div className="flex flex-1 min-w-0">
          <RightSidebarWrapper>
            <main className="flex-1 relative h-screen overflow-hidden min-w-0">
              {children}
            </main>
          </RightSidebarWrapper>
        </div>
      </LeftSidebarWrapper>
      <ElementCommentsPanel />
    </div>
  );
}

function ModeToggle({
  mode,
  setMode,
}: {
  mode: "editor" | "wireframe";
  setMode: (mode: "editor" | "wireframe") => void;
}) {
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex items-center bg-background/80 p-1 rounded-lg border border-border backdrop-blur-sm shadow-sm">
      <Button
        variant={mode === "wireframe" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setMode("wireframe")}
        className="h-7 text-xs gap-2"
      >
        <LayoutTemplate className="h-3.5 w-3.5" />
        Wireframe
      </Button>
      <Button
        variant={mode === "editor" ? "secondary" : "ghost"}
        size="sm"
        onClick={() => setMode("editor")}
        className="h-7 text-xs gap-2"
      >
        <PenTool className="h-3.5 w-3.5" />
        Editor
      </Button>
    </div>
  );
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

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const collabEnabled = isMounted && !!userId;

  const editorData = useEditor(projectId || "", pageId, {
    enableCollab: false, // Collab is now managed by CollaborationProvider
    userId: userId || "guest",
  });

  const contextValue: EditorContextType = {
    projectId: projectId || null,
    userId: userId || null,
    editor: editorData,
    mode,
    setMode,
    pageId,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      <CollaborationProvider
        config={{
          projectId: projectId || "",
          pageId,
          wsUrl: process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:8080",
          enabled: collabEnabled,
          onSync: () => {
            toast.success("Live collaboration connected", {
              duration: 3000,
            });
          },
          onError: (error) => {
            toast.info("Working in offline mode", {
              description:
                "Collaboration server unavailable. Changes will be saved locally.",
              duration: 5000,
            });
          },
        }}
      >
        <AIChatProvider>
          <ModeToggle mode={mode} setMode={setMode} />
          {mode === "wireframe" ? (
            <div className="flex h-screen w-screen overflow-hidden pt-12 bg-background">
              <WireframeManager pageId={pageId} />
            </div>
          ) : (
            <EditorLayout>{children}</EditorLayout>
          )}
        </AIChatProvider>
      </CollaborationProvider>
    </EditorContext.Provider>
  );
}
