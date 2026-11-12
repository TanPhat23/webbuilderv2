import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSetSelectedElement } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useEditorContext } from "@/providers/editorprovider";
import type { EditorElement } from "@/types/global.type";
import { CreatePageDialog } from "../ProjectPageCommand";
import { PageColumn, type ColumnState } from "./PageColumn";
import { useBoardPages } from "./useBoardPages";
import { useSectionActions } from "./useSectionActions";

/** Wireframe mode: every page of the project as a column of section sketches. */
export default function WireframeBoard() {
  const { projectId, pageId, setMode, editor } = useEditorContext();
  const board = useBoardPages();
  const actions = useSectionActions(pageId);
  const pagePerms = useEditorPermissions(projectId);
  const setSelected = useSetSelectedElement();
  const navigate = useNavigate();
  const activeRef = useRef<HTMLDivElement>(null);

  const writable = !editor.isReadOnly && !editor.isLocked;
  const perms = {
    canAdd: writable && editor.permissions.canCreateElements,
    canDelete: writable && editor.permissions.canDeleteElements,
    canMove: writable && editor.permissions.canReorderElements,
  };
  const anyEdit = perms.canAdd || perms.canDelete || perms.canMove;

  // Bring the open page into view when the board opens or the page changes.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [board.activePageId, board.pages.length]);

  const openInDesign = (el: EditorElement) => {
    setSelected(el);
    setMode("editor");
  };

  const stateOf = (id: string): ColumnState => {
    if (id === board.activePageId) return board.activeReady ? "ready" : "loading";
    if (board.othersError) return "error";
    return board.othersLoading ? "loading" : "ready";
  };

  return (
    <div
      onClick={() => setSelected(undefined)}
      className="h-full w-full overflow-auto bg-canvas-backdrop bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)] [background-size:16px_16px]"
    >
      <div className="flex min-h-full w-max items-start gap-7 p-6">
        {board.pagesLoading
          ? [0, 1, 2].map((i) => <div key={i} className="h-64 w-[240px] shrink-0 animate-pulse rounded-lg bg-muted/40" />)
          : board.pages.map((page) => {
              const active = page.Id === board.activePageId;
              return (
                <PageColumn
                  key={page.Id}
                  ref={active ? activeRef : undefined}
                  page={page}
                  sections={board.sectionsOf(page.Id)}
                  state={stateOf(page.Id)}
                  active={active}
                  perms={perms}
                  actions={active && anyEdit ? actions : undefined}
                  onOpen={() => projectId && navigate({ to: `/editor/${projectId}?page=${page.Id}` })}
                  onRetry={board.retry}
                  onOpenInDesign={openInDesign}
                />
              );
            })}
        {!board.pagesLoading && pagePerms.canCreatePages && (
          <CreatePageDialog
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="mt-8 flex h-36 w-[160px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                New page
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
