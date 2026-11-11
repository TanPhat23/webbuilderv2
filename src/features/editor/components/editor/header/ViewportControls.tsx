import { Monitor, Smartphone, Tablet } from "lucide-react";
import { Viewport } from "@/features/editor/hooks/useEditor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface ViewportControlsProps {
  currentView: Viewport;
  setCurrentView: (view: Viewport) => void;
  className?: string;
}

const VIEWPORT_OPTIONS = [
  { view: "mobile" as const, icon: Smartphone, label: "Mobile", resolution: "375px" },
  { view: "tablet" as const, icon: Tablet, label: "Tablet", resolution: "768px" },
  { view: "desktop" as const, icon: Monitor, label: "Desktop", resolution: "1440px" },
] as const;

export default function ViewportControls({
  currentView,
  setCurrentView,
  className,
}: ViewportControlsProps) {
  const activeOption = VIEWPORT_OPTIONS.find((opt) => opt.view === currentView) ?? VIEWPORT_OPTIONS[2];

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      <div className="flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5">
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
      </div>

      <span
        aria-label={`Active viewport width: ${activeOption.resolution}`}
        className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-muted/40 border border-border/50 text-[10px] text-muted-foreground font-mono select-none"
      >
        {activeOption.resolution}
      </span>
    </div>
  );
}
