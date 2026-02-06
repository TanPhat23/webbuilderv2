"use client";

import React, { useState } from "react";
import {
  Monitor,
  Smartphone,
  Tablet,
  ChevronDown,
  Check,
  Search,
  MessageSquare,
  MessageSquareOff,
} from "lucide-react";

// Types
import { Viewport } from "@/hooks";

// Components
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import ExportDialog from "../ExportDialog";
import CollaborationButton from "./CollaborationButton";
import CollaboratorIndicator from "./CollaboratorIndicator";
import EventModeToggle from "../eventmode/EventModeToggle";
import { PageNavigationCommand } from "./PageNavigationCommand";
import CollaborationStatus from "./CollaborationStatus";
import { useElementCommentStore } from "@/globalstore/elementcommentstore";

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

function ViewportSelector({
  currentView,
  setCurrentView,
}: Pick<EditorHeaderProps, "currentView" | "setCurrentView">) {
  const [open, setOpen] = useState(false);
  const currentOption = VIEWPORT_OPTIONS.find(
    (opt) => opt.view === currentView,
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 h-8 px-2 hover:bg-muted transition-colors"
          aria-label="Select viewport size"
          aria-expanded={open}
        >
          {currentOption && <currentOption.icon className="w-4 h-4" />}
          <ChevronDown
            className={`w-3.5 h-3.5 opacity-50 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-0" align="end">
        <Command>
          <CommandList className="max-h-48">
            <CommandEmpty>No viewport found</CommandEmpty>
            <CommandGroup>
              {VIEWPORT_OPTIONS.map(({ view, icon: Icon, label }) => (
                <CommandItem
                  key={view}
                  value={view}
                  onSelect={() => {
                    setCurrentView(view);
                    setOpen(false);
                  }}
                  className={`cursor-pointer ${
                    currentView === view ? "bg-muted" : ""
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span>{label}</span>
                  {currentView === view && (
                    <Check className="w-4 h-4 ml-auto text-accent-foreground" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function ControlsGroup() {
  return (
    <div className="flex items-center gap-2.5">
      <EventModeToggle />
      <ExportDialog />
    </div>
  );
}

export default function EditorHeader({
  currentView,
  setCurrentView,
  projectId,
}: EditorHeaderProps) {
  const [navigationCommandOpen, setNavigationCommandOpen] = useState(false);
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setNavigationCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="relative z-40 flex items-center justify-between gap-3 sm:gap-4 border-b border-border bg-background shadow-sm px-3 sm:px-4 py-2.5 transition-colors duration-200">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-none">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setNavigationCommandOpen(true)}
            className="h-8 w-32 sm:w-40 px-3 py-1.5 text-xs rounded-lg bg-input border border-border hover:bg-muted transition-all"
            aria-label="Open navigation command"
          >
            <Search className="w-4 h-4 mr-2" />
            Navigate... (Cmd+K)
          </Button>
          <div className="h-6 w-px bg-border" aria-hidden="true" />
          <CollaboratorIndicator projectId={projectId} />
          <CollaborationButton projectId={projectId} />
        </div>

        {/* Right Section: Controls and Viewport Selector */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <ControlsGroup />
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCommentButtons}
            aria-pressed={showCommentButtons}
            aria-label="Toggle comment buttons"
            className="h-8 px-2 gap-1"
          >
            {showCommentButtons ? (
              <MessageSquare className="w-4 h-4" />
            ) : (
              <MessageSquareOff className="w-4 h-4" />
            )}
          </Button>
          <div className="h-6 w-px bg-border" aria-hidden="true" />
          <ViewportSelector
            currentView={currentView}
            setCurrentView={setCurrentView}
          />
        </div>

        {/* Mobile Collaboration Status */}
        <div className="md:hidden">
          <CollaborationStatus />
        </div>
      </header>

      <PageNavigationCommand
        open={navigationCommandOpen}
        setOpen={setNavigationCommandOpen}
      />
    </>
  );
}
