import type { ReactElement } from "react";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { Breakpoint } from "@webbuilder/site-runtime/types/elements";
import type { Viewport } from "@/features/editor/context/EditorContext";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@webbuilder/site-runtime/lib/utils";

export interface ViewportControlsProps {
  currentView?: Viewport;
  setCurrentView?: (view: Viewport) => void;
  className?: string;
}

const VIEWPORT_OPTIONS = [
  { view: "mobile" as const, icon: Smartphone, label: "Mobile" },
  { view: "tablet" as const, icon: Tablet, label: "Tablet" },
  { view: "desktop" as const, icon: Monitor, label: "Desktop" },
] as const;

const BREAKPOINT_LABELS: Readonly<Record<Breakpoint, string>> = {
  default: "Base",
  sm: "SM",
  md: "MD",
  lg: "LG",
  xl: "XL",
};

export default function ViewportControls({
  currentView,
  setCurrentView,
  className,
}: ViewportControlsProps): ReactElement {
  const frameWidthPx = useCanvasViewportStore((s) => s.frameWidthPx);
  const preset = useCanvasViewportStore((s) => s.preset);
  const activeBreakpoint = useCanvasViewportStore((s) => s.activeBreakpoint);
  const zoomMode = useCanvasViewportStore((s) => s.zoomMode);
  const manualZoom = useCanvasViewportStore((s) => s.manualZoom);
  const stageWidthPx = useCanvasViewportStore((s) => s.stageWidthPx);
  const resetZoomToFit = useCanvasViewportStore((s) => s.resetZoomToFit);

  const effectiveZoom = computeEffectiveZoom({
    zoomMode,
    manualZoom,
    frameWidthPx,
    stageWidthPx,
  });
  const activeView = currentView ?? (preset === "custom" ? null : preset);

  return (
    <div className={cn("flex items-center gap-1.5 shrink-0", className)}>
      <div className="flex items-center rounded-lg bg-muted/50 border border-border p-0.5 gap-0.5">
        {VIEWPORT_OPTIONS.map(({ view, icon: Icon, label }) => (
          <Tooltip key={view}>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  useCanvasViewportStore.getState().setPreset(view);
                  setCurrentView?.(view);
                }}
                aria-pressed={activeView === view}
                aria-label={label}
                className={cn(
                  "inline-flex items-center justify-center h-7 w-7 rounded-md transition-all duration-150",
                  activeView === view
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
        aria-label={`Active viewport width: ${frameWidthPx}px`}
        className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/40 border border-border/50 text-[10px] text-muted-foreground font-mono select-none"
      >
        <span>{frameWidthPx}px</span>
        <span className="font-sans font-medium text-foreground/80">
          {BREAKPOINT_LABELS[activeBreakpoint]}
        </span>
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={() => resetZoomToFit()}
            aria-label="Reset zoom to fit"
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded border border-border/50 text-[10px] font-mono transition-colors select-none",
              zoomMode === "fit"
                ? "bg-muted/40 text-muted-foreground hover:text-foreground"
                : "bg-background text-foreground border-border hover:bg-muted/60",
            )}
          >
            {Math.round(effectiveZoom * 100)}%
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {zoomMode === "fit" ? "Auto-fit zoom (click to reset)" : "Reset zoom to fit"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
