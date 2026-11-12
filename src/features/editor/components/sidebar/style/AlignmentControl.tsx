import { cn } from "@/lib/utils";
import type { StyleProps } from "./useStyleProps";

const POSITIONS = ["flex-start", "center", "flex-end"] as const;
const NAMES = ["start", "center", "end"];

export function AlignmentControl({ sp }: { sp: StyleProps }) {
  const justify =
    sp.values.justifyContent ?? sp.inherited.justifyContent ?? "flex-start";
  const align = sp.values.alignItems ?? sp.inherited.alignItems ?? "stretch";
  return (
    <div
      role="group"
      aria-label="Child alignment"
      className="grid size-[68px] shrink-0 grid-cols-3 rounded-[5px] border border-border/60 bg-muted/30 p-1"
    >
      {POSITIONS.flatMap((a, row) =>
        POSITIONS.map((j, col) => (
          <button
            key={`${a}:${j}`}
            type="button"
            disabled={sp.disabled}
            aria-label={`Align ${NAMES[row]}, justify ${NAMES[col]}`}
            aria-pressed={justify === j && align === a}
            onClick={() => sp.setMany({ justifyContent: j, alignItems: a })}
            className={cn(
              "flex items-center justify-center rounded-sm text-muted-foreground/50 transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              justify === j && align === a && "bg-primary/15 text-primary",
            )}
          >
            <span
              className={cn(
                "size-[3px] rounded-full bg-current",
                justify === j && align === a && "size-[5px]",
              )}
            />
          </button>
        )),
      )}
    </div>
  );
}
