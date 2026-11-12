import { useState } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import { cn } from "@/lib/utils";
import { MOVE_DRAG, TEMPLATE_DRAG, readTemplateDrag } from "./dragTypes";
import type { SectionActions } from "./useSectionActions";

/** The gap before section `index` (or after the last): a `+` picker and a drop target. */
export function InsertPoint({
  index, actions, canAdd, canMove,
}: {
  index: number;
  actions: SectionActions;
  canAdd: boolean;
  canMove: boolean;
}) {
  const [over, setOver] = useState(false);
  const [open, setOpen] = useState(false);

  const accepts = (e: React.DragEvent) =>
    (canAdd && e.dataTransfer.types.includes(TEMPLATE_DRAG)) ||
    (canMove && e.dataTransfer.types.includes(MOVE_DRAG));

  return (
    <div
      onDragOver={(e) => {
        if (!accepts(e)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        if (!accepts(e)) return;
        e.preventDefault();
        e.stopPropagation();
        const movedId = e.dataTransfer.getData(MOVE_DRAG);
        if (movedId) return actions.moveTo(movedId, index);
        const template = readTemplateDrag(e.dataTransfer);
        if (template) actions.insertTemplateAt(template, index);
      }}
      className="group/ip relative flex h-3 items-center justify-center"
    >
      <div className={cn("absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity", over && "opacity-100")} />
      {canAdd && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Add section here"
              className={cn(
                "relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover/ip:opacity-100",
                open && "opacity-100",
              )}
            >
              <Plus className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="max-h-72 w-52 overflow-y-auto p-1 text-xs">
            <button
              type="button"
              className="flex w-full rounded px-2 py-1.5 text-left hover:bg-accent"
              onClick={() => {
                actions.insertBlankAt(index);
                setOpen(false);
              }}
            >
              Blank section
            </button>
            {sectionTemplateGroups.map((g) => (
              <div key={g.id}>
                <p className="px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                {g.templates.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex w-full truncate rounded px-2 py-1.5 text-left hover:bg-accent"
                    onClick={() => {
                      actions.insertTemplateAt(t, index);
                      setOpen(false);
                    }}
                  >
                    {t.name || `${g.label} ${i + 1}`}
                  </button>
                ))}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
