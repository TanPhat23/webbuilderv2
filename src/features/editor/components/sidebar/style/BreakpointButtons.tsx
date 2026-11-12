import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { BREAKPOINTS, type Breakpoint } from "./styleModel";

export function BreakpointButtons({
  value,
  onChange,
}: {
  value: Breakpoint;
  onChange: (b: Breakpoint) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Breakpoint"
      className="flex items-center gap-0"
    >
      {BREAKPOINTS.map((b) => (
        <Tooltip key={b.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              role="radio"
              aria-checked={value === b.id}
              onClick={() => onChange(b.id)}
              className={cn(
                "h-6 rounded px-1 text-[10px] font-medium text-muted-foreground hover:text-foreground",
                value === b.id && "bg-muted text-foreground",
              )}
            >
              {b.label}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {b.label}: {b.minWidth}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
