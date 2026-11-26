import type { ReactElement } from "react";
import { FastForward, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { liveEditPlayer } from "../liveEditPlayer";
import { useAgentPlaybackStore } from "../playbackStore";

export function AgentPlaybackHud(): ReactElement | null {
  const playback = useAgentPlaybackStore((s) => s.playback);

  if (playback.status !== "playing") {
    return null;
  }

  const displayStep = Math.max(1, Math.min(playback.currentStep, playback.totalSteps));

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-auto absolute bottom-4 left-1/2 z-50 -translate-x-1/2"
    >
      <div className="bg-card/95 border-border text-foreground flex items-center gap-3 rounded-full border px-3.5 py-1.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-2">
          <span className="bg-primary size-2 animate-pulse rounded-full" />
          <Sparkles className="text-primary size-3.5 shrink-0" />
          <span className="text-xs font-semibold">{playback.agentName}</span>
          <span className="text-muted-foreground max-w-[200px] truncate text-xs">
            {playback.statusLabel}
          </span>
        </div>

        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {displayStep}/{playback.totalSteps}
        </span>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => liveEditPlayer.flush()}
          className="h-6 gap-1 rounded-full px-2.5 text-[11px]"
        >
          <FastForward className="size-3" />
          Skip
        </Button>
      </div>
    </div>
  );
}
