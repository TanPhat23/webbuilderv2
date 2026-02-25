"use client";

import React, { useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  Search,
  MessageSquare,
  MessageSquareOff,
  Code,
  PenTool,
  LayoutTemplate,
  ChevronRight,
} from "lucide-react";

import { Viewport } from "@/hooks";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import CollaborationButton from "./CollaborationButton";
import CollaboratorIndicator from "./CollaboratorIndicator";
import { useEditorContext } from "@/providers/editorprovider";
import EventModeToggle from "../eventmode/EventModeToggle";
import { PageNavigationCommand } from "./PageNavigationCommand";
import { useElementCommentStore } from "@/globalstore/element-comment-store";
import { useProjectStore } from "@/globalstore/project-store";
import { usePageStore } from "@/globalstore/page-store";
import { cn } from "@/lib/utils";

type EditorHeaderProps = {
  currentView: Viewport;
  setCurrentView: (view: Viewport) => void;
  projectId: string;
};

const VIEWPORT_OPTIONS = [
  { view: "mobile" as const, icon: Smartphone, label: "Mobile" },
  { view: "tablet" as const, icon: Tablet, label: "Tablet" },
  { view: "desktop" as const, icon: Monitor, label: "Desktop" },
] as const;

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

function HeaderDivider() {
  return <div className="h-4 w-px bg-border shrink-0" aria-hidden="true" />;
}

function PillGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ProjectBreadcrumb() {
  const { project } = useProjectStore();
  const { currentPage } = usePageStore();

  if (!project) return null;

  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-sm font-semibold text-foreground truncate max-w-32">
        {project.name}
      </span>
      {currentPage && (
        <>
          <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0" />
          <span className="text-sm text-muted-foreground truncate max-w-24">
            {currentPage.Name}
          </span>
        </>
      )}
    </div>
  );
}

function ViewportToggle({
  currentView,
  setCurrentView,
}: Pick<EditorHeaderProps, "currentView" | "setCurrentView">) {
  return (
    <PillGroup>
      {VIEWPORT_OPTIONS.map(({ view, icon: Icon, label }) => (
        <Tooltip key={view}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setCurrentView(view)}
              aria-pressed={currentView === view}
              aria-label={label}
              className={cn(
                "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
                currentView === view
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/60",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
      ))}
    </PillGroup>
  );
}

function EditingModeToggle() {
  const { editingMode, setEditingMode } = useEditorContext();
  const isVisual = editingMode === "visual";

  return (
    <PillGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setEditingMode("visual")}
            aria-pressed={isVisual}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
              isVisual
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Visual</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setEditingMode("code")}
            aria-pressed={!isVisual}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
              !isVisual
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Code</TooltipContent>
      </Tooltip>
    </PillGroup>
  );
}

function CanvasModeToggle() {
  const { mode, setMode } = useEditorContext();

  return (
    <PillGroup>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setMode("wireframe")}
            aria-pressed={mode === "wireframe"}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
              mode === "wireframe"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <LayoutTemplate className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Wireframe</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setMode("editor")}
            aria-pressed={mode === "editor"}
            className={cn(
              "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
              mode === "editor"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60",
            )}
          >
            <PenTool className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Editor</TooltipContent>
      </Tooltip>
    </PillGroup>
  );
}

function CommentToggleButton() {
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCommentButtons}
          aria-pressed={showCommentButtons}
          aria-label="Toggle comments"
          className={cn(
            "h-7 w-7 p-0 transition-colors",
            showCommentButtons
              ? "text-primary bg-primary/10 hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {showCommentButtons ? (
            <MessageSquare className="w-3.5 h-3.5" />
          ) : (
            <MessageSquareOff className="w-3.5 h-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {showCommentButtons ? "Hide comments" : "Show comments"}
      </TooltipContent>
    </Tooltip>
  );
}

function NavigateButton({ onClick }: { onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          aria-label="Open page navigation (Cmd+K)"
          className="inline-flex items-center justify-center h-7 w-7 text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-all duration-150"
        >
          <Search className="w-3.5 h-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        Pages <kbd className="font-mono opacity-60 text-[10px] ml-1">⌘K</kbd>
      </TooltipContent>
    </Tooltip>
  );
}

function LeftSection({
  projectId,
  onNavigate,
}: {
  projectId: string;
  onNavigate: () => void;
}) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <ProjectBreadcrumb />
      <HeaderDivider />
      <NavigateButton onClick={onNavigate} />
      <CollaboratorIndicator projectId={projectId} />
      <CollaborationButton projectId={projectId} />
    </div>
  );
}

function RightSection({
  currentView,
  setCurrentView,
}: Pick<EditorHeaderProps, "currentView" | "setCurrentView">) {
  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <HeaderDivider />
      <EventModeToggle />
      <EditingModeToggle />
      <CommentToggleButton />
      <HeaderDivider />
      <ViewportToggle
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
    </div>
  );
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
      <header className="relative z-40 h-11 flex items-center justify-between gap-4 border-b border-border bg-background px-3">
        <LeftSection
          projectId={projectId}
          onNavigate={() => setNavigationCommandOpen(true)}
        />
        <div className="absolute left-1/2 -translate-x-1/2">
          <CanvasModeToggle />
        </div>
        <RightSection
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      </header>

      <PageNavigationCommand
        open={navigationCommandOpen}
        setOpen={setNavigationCommandOpen}
      />
    </TooltipProvider>
  );
}
