import { useMemo } from "react";
import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import { useEditorContext } from "@/providers/editorprovider";
import { Sketch } from "./Sketch";
import { setTemplateDragData } from "./dragTypes";
import { toSketch, type SketchSource } from "./sketchModel";
import { useSectionActions } from "./useSectionActions";

/** Sections panel shown by the Insert rail item in Wireframe mode. */
export default function SectionsLibrary() {
  const { pageId, editor } = useEditorContext();
  const actions = useSectionActions(pageId);
  const canAdd = !editor.isReadOnly && !editor.isLocked && editor.permissions.canCreateElements;

  const groups = useMemo(
    () =>
      sectionTemplateGroups.map((g) => ({
        ...g,
        tiles: g.templates.map((t, index) => ({
          index,
          template: t,
          name: t.name || `${g.label} ${index + 1}`,
          sketch: toSketch(t as SketchSource),
        })),
      })),
    [],
  );

  return (
    <div className="h-full overflow-y-auto px-2.5 pb-4 pt-1">
      <p className="px-0.5 py-2 text-[11px] text-muted-foreground">
        {canAdd ? "Click to add to the open page, or drag onto it." : "You don't have permission to add sections."}
      </p>
      {groups.map((g) => (
        <div key={g.id} className="mb-3">
          <h3 className="px-0.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {g.tiles.map((tile) => (
              <button
                key={tile.index}
                type="button"
                disabled={!canAdd}
                draggable={canAdd}
                onDragStart={(e) => setTemplateDragData(e.dataTransfer, g.id, tile.index)}
                onClick={() => actions.insertTemplateAt(tile.template, actions.sections.length)}
                title={`Add ${tile.name}`}
                className="group flex flex-col gap-1.5 rounded-lg border border-border/60 bg-card/50 p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50"
              >
                <div className="pointer-events-none flex h-12 w-full items-center overflow-hidden rounded-sm bg-muted/40 p-1.5">
                  <Sketch node={tile.sketch} />
                </div>
                <span className="w-full truncate text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                  {tile.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
