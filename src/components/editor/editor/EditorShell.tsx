"use client";

import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EditorSideBar } from "@/components/editor/sidebar/EditorSideBar";
import LayoutSideBar from "@/components/editor/sidebar/LayoutSideBar";
import AIChatPanel from "@/components/editor/ai/AiChatPanel";
import { ElementCommentsPanel } from "@/components/editor/comments/ElementCommentsPanel";
import { useAiChat } from "@/providers/aiprovider";
import { useEditorContext } from "@/providers/editorprovider";

function LeftSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { chatOpen } = useAiChat();
  const { editingMode } = useEditorContext();
  const showSidebars = editingMode !== "code";

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
      {showSidebars && <EditorSideBar />}
      {showSidebars && chatOpen && <AIChatPanel />}
      {children}
    </SidebarProvider>
  );
}

function RightSidebarWrapper({ children }: { children: React.ReactNode }) {
  const { editingMode } = useEditorContext();
  const showSidebars = editingMode !== "code";

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
      {showSidebars && <LayoutSideBar />}
    </SidebarProvider>
  );
}

export default function EditorShell({ children }: { children: React.ReactNode }) {
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
