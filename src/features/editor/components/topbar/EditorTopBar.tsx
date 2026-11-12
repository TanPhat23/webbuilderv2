import { useEffect, useState } from "react";
import { HelpCircle, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorContext } from "@/providers/editorprovider";
import { PageNavigationCommand } from "../editor/PageNavigationCommand";
import ProjectBreadcrumb from "../editor/header/ProjectBreadcrumb";
import ViewportControls from "../editor/header/ViewportControls";
import EventModeToggle from "../editor/EventModeToggle";
import CollaboratorIndicator from "../editor/CollaboratorIndicator";
import CollaborationButton from "../editor/CollaborationButton";
import ModeSwitch from "./ModeSwitch";
import CommentsToggle from "./CommentsToggle";
import PublishButton from "./PublishButton";

interface EditorTopBarProps {
  projectId: string;
  onShowShortcuts: () => void;
}

export default function EditorTopBar({
  projectId,
  onShowShortcuts,
}: EditorTopBarProps) {
  const { editor } = useEditorContext();
  const [navOpen, setNavOpen] = useState(false);

  // Cmd/Ctrl+K opens page navigation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setNavOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="relative z-40 flex h-11 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <div className="flex min-w-0 flex-1 items-center">
        <ProjectBreadcrumb onNavigate={() => setNavOpen(true)} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <ModeSwitch />
        <ViewportControls
          currentView={editor.currentView}
          setCurrentView={editor.setCurrentView}
        />
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
        <EventModeToggle />
        <CommentsToggle />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              aria-label="Keyboard shortcuts"
              onClick={onShowShortcuts}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Shortcuts <kbd className="ml-1 font-mono text-[10px] opacity-60">?</kbd>
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-1 h-4" />

        <CollaboratorIndicator projectId={projectId} />
        <CollaborationButton projectId={projectId} />
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs font-medium"
        >
          <a href={`/preview/${projectId}`} target="_blank" rel="noreferrer">
            <Play className="h-3 w-3" />
            Preview
          </a>
        </Button>
        <PublishButton projectId={projectId} />
      </div>

      <PageNavigationCommand open={navOpen} setOpen={setNavOpen} />
    </header>
  );
}
