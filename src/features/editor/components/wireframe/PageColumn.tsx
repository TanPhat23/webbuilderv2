import { forwardRef } from "react";
import { Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Page } from "@/features/pages";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { InsertPoint } from "./InsertPoint";
import { SectionBlock, type BoardPerms } from "./SectionBlock";
import type { SectionActions } from "./useSectionActions";

export type ColumnState = "ready" | "loading" | "error";

/** One page on the board: header plus a frame of section sketches. */
export const PageColumn = forwardRef<HTMLDivElement, {
  page: Page;
  sections: EditorElement[] | undefined;
  state: ColumnState;
  active: boolean;
  perms: BoardPerms;
  actions?: SectionActions;
  onOpen: () => void;
  onRetry: () => void;
  onOpenInDesign: (el: EditorElement) => void;
}>(function PageColumn({ page, sections, state, active, perms, actions, onOpen, onRetry, onOpenInDesign }, ref) {
  const Icon = page.Type === "dp" ? Database : FileText;
  const list = sections ?? [];
  const editable = active && Boolean(actions);

  return (
    <div ref={ref} className="w-[240px] shrink-0 [content-visibility:auto]">
      <div className="mb-2 flex h-6 items-center gap-1.5 px-0.5 text-[11px]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate font-semibold">{page.Name}</span>
        {page.Type === "dp" && <span className="rounded bg-muted px-1 text-[9px] uppercase tracking-wide text-muted-foreground">CMS</span>}
        {state === "ready" && (
          <span className="shrink-0 text-muted-foreground">
            {list.length} {list.length === 1 ? "section" : "sections"}
          </span>
        )}
        <span className="flex-1" />
        {active && <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary">Editing</span>}
      </div>

      <div
        role={active ? undefined : "button"}
        tabIndex={active ? undefined : 0}
        aria-label={active ? undefined : `Open ${page.Name}`}
        onClick={active ? undefined : onOpen}
        onKeyDown={active ? undefined : (e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        className={cn(
          "rounded-lg border bg-background/60 p-2 transition-all",
          active
            ? "border-primary ring-1 ring-primary"
            : "cursor-pointer border-border opacity-60 hover:opacity-100 hover:border-foreground/30",
        )}
      >
        {state === "loading" ? (
          <div className="space-y-2">
            {[40, 72, 56].map((h) => (
              <div key={h} className="animate-pulse rounded-md bg-muted/60" style={{ height: h }} />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-[11px] text-muted-foreground">
            Couldn't load this page.
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
            >
              Retry
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col">
            {editable && actions && <InsertPoint index={0} actions={actions} canAdd={perms.canAdd} canMove={false} />}
            <p className="py-6 text-center text-[11px] text-muted-foreground">
              {editable && perms.canAdd ? "Empty page. Add a section from the panel." : "Empty page"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {list.map((el, i) => (
              <div key={el.id}>
                {editable && actions ? (
                  <InsertPoint index={i} actions={actions} canAdd={perms.canAdd} canMove={perms.canMove} />
                ) : (
                  i > 0 && <div className="h-2" />
                )}
                <SectionBlock
                  element={el}
                  index={i}
                  count={list.length}
                  editable={editable}
                  perms={perms}
                  actions={actions}
                  onOpenInDesign={onOpenInDesign}
                />
              </div>
            ))}
            {editable && actions && (
              <InsertPoint index={list.length} actions={actions} canAdd={perms.canAdd} canMove={perms.canMove} />
            )}
          </div>
        )}
      </div>
      {!active && state === "ready" && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">Click to edit</p>
      )}
    </div>
  );
});
