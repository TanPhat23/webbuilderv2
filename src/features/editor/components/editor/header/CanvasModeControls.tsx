import {
  Code,
  PenTool,
  LayoutTemplate,
  MessageSquare,
  MessageSquareOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditorContext } from "@/providers/editorprovider";
import EventModeToggle from "../EventModeToggle";
import { useElementCommentStore } from "@/features/editor";
import { cn } from "@/lib/utils";

export interface CanvasModeControlsProps {
  className?: string;
}

export default function CanvasModeControls({ className }: CanvasModeControlsProps) {
  const { mode, setMode, editingMode, setEditingMode } = useEditorContext();
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();
  const isVisual = editingMode === "visual";

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      {/* Event Mode */}
      <EventModeToggle />

      {/* Visual vs Code Toggle */}
      <div className="flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setEditingMode("visual")}
              aria-pressed={isVisual}
              aria-label="Visual editor"
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
              aria-label="Code editor"
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
      </div>

      {/* Wireframe vs Editor Canvas Mode Toggle */}
      <div className="flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => setMode("wireframe")}
              aria-pressed={mode === "wireframe"}
              aria-label="Wireframe mode"
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
              aria-label="Canvas editor mode"
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
      </div>

      {/* Comments Toggle */}
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
    </div>
  );
}
