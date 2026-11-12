import { useMemo } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { useIsSelected, useSetSelectedElement } from "@/features/editor";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { Sketch } from "./Sketch";
import { MOVE_DRAG } from "./dragTypes";
import { toSketch, type SketchSource } from "./sketchModel";
import type { SectionActions } from "./useSectionActions";

export type BoardPerms = { canAdd: boolean; canDelete: boolean; canMove: boolean };

function Tool({ label, onClick, disabled, children, danger }: {
  label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 [&_svg]:h-3 [&_svg]:w-3",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

/** One top-level section drawn as a sketch. Editable only on the open page. */
export function SectionBlock({
  element, index, count, editable, perms, actions, onOpenInDesign,
}: {
  element: EditorElement;
  index: number;
  count: number;
  editable: boolean;
  perms: BoardPerms;
  actions?: SectionActions;
  onOpenInDesign?: (el: EditorElement) => void;
}) {
  const selected = useIsSelected(element.id) && editable;
  const setSelected = useSetSelectedElement();
  const sketch = useMemo(() => toSketch(element as unknown as SketchSource), [element]);
  const name = element.name || element.type;

  return (
    <div
      onClick={editable ? (e) => { e.stopPropagation(); setSelected(element); } : undefined}
      onDoubleClick={editable && onOpenInDesign ? () => onOpenInDesign(element) : undefined}
      className={cn(
        "group/sb relative rounded-md border border-border bg-card p-2",
        editable && "cursor-pointer hover:border-foreground/30",
        selected && "border-primary ring-1 ring-primary hover:border-primary",
      )}
    >
      <div className="mb-1.5 flex h-5 items-center gap-1">
        {editable && perms.canMove && (
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(MOVE_DRAG, element.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            title="Drag to reorder"
            className="flex h-5 w-4 cursor-grab items-center justify-center text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-muted-foreground">{name}</span>
        {editable && actions && (
          <div className={cn("flex items-center opacity-0 transition-opacity group-hover/sb:opacity-100", selected && "opacity-100")}>
            {perms.canMove && (
              <>
                <Tool label="Move up" disabled={index === 0} onClick={() => actions.moveBy(index, -1)}><ArrowUp /></Tool>
                <Tool label="Move down" disabled={index === count - 1} onClick={() => actions.moveBy(index, 1)}><ArrowDown /></Tool>
              </>
            )}
            {perms.canAdd && <Tool label="Duplicate" onClick={() => actions.duplicate(element)}><Copy /></Tool>}
            {perms.canDelete && <Tool label="Delete" danger onClick={() => actions.remove(element)}><Trash2 /></Tool>}
          </div>
        )}
      </div>
      <div className="pointer-events-none overflow-hidden">
        <Sketch node={sketch} />
      </div>
    </div>
  );
}
