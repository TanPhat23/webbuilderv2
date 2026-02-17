"use client";

import React from "react";
import { WireframeSidebar } from "./WireframeSidebar";
import { WireframeCanvas } from "./WireframeCanvas";
import { SidebarProvider } from "@/components/ui/sidebar";

interface WireframeManagerProps {
  pageId: string;
}

export default function WireframeManager({ pageId }: WireframeManagerProps) {
  return (
    <SidebarProvider>
      <div className="flex w-full h-full overflow-hidden bg-background">
        <WireframeSidebar />
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          <WireframeCanvas pageId={pageId} />
        </main>
      </div>
    </SidebarProvider>
  );
}
