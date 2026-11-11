import React, { useState } from "react";
import { Viewport } from "@/features/editor/hooks/useEditor";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { PageNavigationCommand } from "./PageNavigationCommand";
import ProjectBreadcrumb from "./header/ProjectBreadcrumb";
import ViewportControls from "./header/ViewportControls";
import CanvasModeControls from "./header/CanvasModeControls";
import HeaderActions from "./header/HeaderActions";

export type EditorHeaderProps = {
  currentView: Viewport;
  setCurrentView: (view: Viewport) => void;
  projectId: string;
};

function useNavigationShortcut(onToggle: () => void) {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onToggle]);
}

export default function EditorHeader({
  currentView,
  setCurrentView,
  projectId,
}: EditorHeaderProps) {
  const [navigationCommandOpen, setNavigationCommandOpen] = useState(false);

  useNavigationShortcut(() => setNavigationCommandOpen((prev) => !prev));

  return (
    <TooltipProvider>
      <header className="relative z-40 h-11 flex items-center justify-between gap-3 border-b border-border bg-background px-3 min-w-0 overflow-x-auto">
        {/* Left Zone: Project Breadcrumb & Quick Page Navigation */}
        <div className="flex items-center min-w-0 shrink">
          <ProjectBreadcrumb onNavigate={() => setNavigationCommandOpen(true)} />
        </div>

        {/* Center Zone: Viewport Device Switcher & Resolution Badge */}
        <div className="flex items-center justify-center shrink-0">
          <ViewportControls
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>

        {/* Right Zone: Canvas Modes, Event/Comment Toggles, Separator, Collaboration & View Live */}
        <div className="flex items-center gap-2.5 shrink-0">
          <CanvasModeControls />
          <Separator orientation="vertical" className="h-4" />
          <HeaderActions projectId={projectId} />
        </div>
      </header>

      <PageNavigationCommand
        open={navigationCommandOpen}
        setOpen={setNavigationCommandOpen}
      />
    </TooltipProvider>
  );
}
