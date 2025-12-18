"use client";

import React, { createContext, useContext } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSideBar } from "@/components/editor/sidebar/EditorSideBar";
import LayoutSideBar from "@/components/editor/sidebar/LayoutSideBar";
import AIChatProvider from "./aiprovider";
import AIChatPanel from "@/components/editor/ai/AiChatPanel";
import { useAiChat } from "./aiprovider";
import { ElementCommentsPanel } from "@/components/editor/comments/ElementCommentsPanel";

interface EditorProviderProps {
  children: React.ReactNode;
  projectId?: string;
  userId?: string;
}

interface EditorContextType {
  projectId: string | null;
  userId: string | null;
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

export default function EditorProvider({
  children,
  projectId,
  userId,
}: EditorProviderProps) {
  return (
    <EditorContext.Provider
      value={{ projectId: projectId || null, userId: userId || null }}
    >
      <AIChatProvider>
        <EditorLayout>{children}</EditorLayout>
      </AIChatProvider>
    </EditorContext.Provider>
  );
}
