import { useState } from "react";
import { History, RotateCcw, Save } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCurrentProject } from "@/features/projects/hooks/useProjects";
import { useElementsWithLoad } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import {
  useSnapshots,
  useSaveSnapshot,
  useLoadSnapshot,
} from "@/features/editor/hooks/useSnapshot";
import type { EditorElement } from "@/types/global.type";
import PanelIntro from "../layout/PanelIntro";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} h ago`;
  return new Date(iso).toLocaleDateString();
}

/** Saved versions of the project, listed inline in the History panel. */
export default function SnapshotManager() {
  const { data: project } = useCurrentProject();
  const { elements, loadElements } = useElementsWithLoad();
  const permissions = useEditorPermissions(project?.id);
  const { data: snapshots = [], isLoading } = useSnapshots(project?.id);
  const save = useSaveSnapshot();
  const load = useLoadSnapshot();
  const [restoreId, setRestoreId] = useState<string | null>(null);

  const canSave = permissions.canCreateSnapshots && elements.length > 0;

  const handleSave = () => {
    if (!project?.id || !canSave) return;
    const now = new Date();
    save.mutate({
      projectId: project.id,
      snapshot: {
        id: `snapshot-${now.getTime()}`,
        elements,
        type: "version" as const,
        name: `Version ${now.toLocaleString()}`,
        timestamp: now.getTime(),
        createdAt: now.toISOString(),
      },
    });
  };

  const handleRestore = () => {
    if (!project?.id || !restoreId) return;
    load.mutate(
      { projectId: project.id, snapshotId: restoreId },
      { onSuccess: (els) => loadElements(els as EditorElement[]) },
    );
    setRestoreId(null);
  };

  const sorted = [...snapshots].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="flex flex-col gap-2 p-2">
      {permissions.canCreateSnapshots && (
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full gap-2 text-xs"
          onClick={handleSave}
          disabled={!canSave || save.isPending}
          title={elements.length === 0 ? "Add elements before saving a version" : undefined}
        >
          <Save className="h-3.5 w-3.5" />
          {save.isPending ? "Saving…" : "Save current version"}
        </Button>
      )}

      {isLoading ? (
        <div className="space-y-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-md bg-muted/50" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <PanelIntro
          icon={History}
          title="No saved versions"
          description="Save a version to create a restore point you can return to."
        />
      ) : (
        <ol className="relative space-y-0.5 before:absolute before:bottom-3 before:left-[11px] before:top-3 before:w-px before:bg-border">
          {sorted.map((snapshot, i) => (
            <li
              key={snapshot.id}
              className="group relative flex items-center gap-2.5 rounded-md py-1.5 pl-1 pr-1 hover:bg-accent/50"
            >
              <span
                className={
                  i === 0
                    ? "relative z-10 ml-[3px] h-2.5 w-2.5 shrink-0 rounded-full bg-primary ring-2 ring-card"
                    : "relative z-10 ml-[3px] h-2.5 w-2.5 shrink-0 rounded-full border border-muted-foreground/50 bg-card"
                }
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">{snapshot.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {relativeTime(snapshot.createdAt)}
                </p>
              </div>
              {permissions.canRestoreSnapshots && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Restore ${snapshot.name}`}
                  title="Restore"
                  className="h-6 w-6 shrink-0 text-muted-foreground opacity-0 focus-visible:opacity-100 group-hover:opacity-100"
                  disabled={load.isPending}
                  onClick={() => setRestoreId(snapshot.id)}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              )}
            </li>
          ))}
        </ol>
      )}

      <AlertDialog open={restoreId !== null} onOpenChange={(o) => !o && setRestoreId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              The page will be replaced with the saved version. Save the current
              version first if you want to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
