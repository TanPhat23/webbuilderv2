import { Zap, ZapOff } from "lucide-react";
import { useEventModeStore } from "@/features/editor";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * When on, elements run their configured event actions on the canvas; when
 * off, the canvas is in select/drag mode.
 */
export const EventModeToggle = () => {
  const isEventModeEnabled = useEventModeStore((s) => s.isEventModeEnabled);
  const toggleEventMode = useEventModeStore((s) => s.toggleEventMode);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleEventMode}
          aria-pressed={isEventModeEnabled}
          aria-label="Toggle event mode"
          className={cn(
            "h-7 w-7 p-0 transition-colors",
            isEventModeEnabled
              ? "bg-primary/10 text-primary hover:bg-primary/15"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {isEventModeEnabled ? (
            <Zap className="h-3.5 w-3.5" />
          ) : (
            <ZapOff className="h-3.5 w-3.5" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isEventModeEnabled
          ? "Events on: elements run their actions"
          : "Events off: select and drag elements"}
      </TooltipContent>
    </Tooltip>
  );
};

export default EventModeToggle;
