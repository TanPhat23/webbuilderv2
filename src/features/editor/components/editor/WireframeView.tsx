"use client";

import React, { Suspense } from "react";
import { LayoutTemplate, PenTool } from "lucide-react";
import { cn } from "@/lib/utils";

const WireframeManager = React.lazy(
  () => import("@/features/editor/components/wireframe/WireframeManager"),
);

type Mode = "editor" | "wireframe";

interface WireframeViewProps {
  mode: Mode;
  setMode: (mode: Mode) => void;
  pageId: string;
}

function WireframeHeader({ mode, setMode }: Pick<WireframeViewProps, "mode" | "setMode">) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-center border-b border-border bg-background px-4">
      <div className="flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5">
        <button
          onClick={() => setMode("wireframe")}
          aria-pressed={mode === "wireframe"}
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md font-medium transition-all duration-150",
            mode === "wireframe"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60",
          )}
        >
          <LayoutTemplate className="w-3.5 h-3.5" />
          Wireframe
        </button>
        <button
          onClick={() => setMode("editor")}
          aria-pressed={mode === "editor"}
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2.5 text-xs rounded-md font-medium transition-all duration-150",
            mode === "editor"
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-background/60",
          )}
        >
          <PenTool className="w-3.5 h-3.5" />
          Editor
        </button>
      </div>
    </header>
  );
}

export default function WireframeView({ mode, setMode, pageId }: WireframeViewProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background">
      <WireframeHeader mode={mode} setMode={setMode} />
      <div className="flex-1 min-h-0">
        <Suspense
          fallback={
            <div className="flex items-center justify-center w-full h-full">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent" />
            </div>
          }
        >
          <WireframeManager pageId={pageId} />
        </Suspense>
      </div>
    </div>
  );
}
