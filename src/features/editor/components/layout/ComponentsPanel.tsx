import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Component, GripVertical, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Page } from "@/features/pages";
import type { EditorElement } from "@/types/global.type";
import { renameComponentPage } from "@/features/projects/api/page.api";
import { projectKeys } from "@/features/projects/hooks/useProjects";
import { usageCount } from "@/features/projects/lib/components";
import { plainComponentSnapshot } from "@/features/projects/lib/resolve-elements";
import { useEditorContext } from "@/providers/editorprovider";
import { errorMessage } from "@/services/api-error";
import { useEditorPermissions } from "../../hooks/useEditorPermissions";
import { useProjectComponents } from "../../hooks/useProjectComponents";
import { useComponentActions } from "../../hooks/useComponentActions";
import { componentLibrary, componentLibraryKey, isComponentSnapshot, type ComponentSnapshot } from "../../services/component-library.service";
import { setComponentDrag } from "../../utils/element/dragPayload";
import { ComponentNameDialog } from "../ComponentNameDialog";
import { DeletePageDialog, useDeletePage } from "../ProjectPageCommand";
import { SaveElementDialog } from "../SaveElementDialog";

type ActiveDialog =
  | { kind: "rename" | "delete"; page: Page }
  | { kind: "save"; name: string; root: EditorElement }
  | { kind: "import" | "delete-snapshot"; snapshot: ComponentSnapshot };

export default function ComponentsPanel() {
  const { projectId, userId, pageId, editor, mode, setMode } = useEditorContext();
  const permissions = useEditorPermissions(projectId);
  const project = useProjectComponents();
  const { canCreate, createComponent } = useComponentActions();
  const [dialog, setDialog] = useState<ActiveDialog>();
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();
  const deletePage = useDeletePage(projectId ?? undefined, project.pages);
  const account = useQuery({ queryKey: componentLibraryKey(userId), queryFn: componentLibrary.list, enabled: !!userId });
  const canInsert = !editor.isLocked && !editor.isReadOnly && !editor.isLoading && mode === "editor" && permissions.canCreateElements;

  const close = () => setDialog(undefined);
  async function rename(page: Page, name: string) {
    if (!projectId) return;
    await renameComponentPage({ data: { projectId, pageId: page.Id, name } });
    await queryClient.cancelQueries({ queryKey: projectKeys.pages(projectId), exact: true });
    queryClient.setQueryData<Page[]>(projectKeys.pages(projectId),
      (pages) => pages?.map((entry) => entry.Id === page.Id ? { ...entry, Name: name } : entry));
  }

  async function deleteSnapshot(snapshot: ComponentSnapshot) {
    if (deleting) return;
    setDeleting(true);
    try {
      await componentLibrary.delete(snapshot.id);
      await queryClient.cancelQueries({ queryKey: componentLibraryKey(userId), exact: true });
      queryClient.setQueryData<ComponentSnapshot[]>(componentLibraryKey(userId), (items) => items?.filter(({ id }) => id !== snapshot.id));
      close();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setDeleting(false);
    }
  }

  const row = "flex min-h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-1.5 text-left text-xs hover:bg-accent/60";
  const empty = "px-1.5 py-2 text-xs text-muted-foreground";

  return (
    <div className="space-y-4 p-2">
      <section aria-label="Project components">
        <h2 className="px-1.5 pb-1 text-xs font-semibold">Project components</h2>
        {project.isLoading && <p className={empty}>Loading components…</p>}
        {project.isError && <p role="alert" className={empty}>Could not load project components.</p>}
        {!project.isLoading && !project.isError && !project.pages.length && (
          <p className={empty}>Right-click an element to create a component.</p>
        )}
        <ul>
          {project.pages.map((page) => {
            const root = project.roots.get(page.Id);
            const draggable = canInsert && !!root && page.Id !== pageId;
            return (
              <li key={page.Id} className="flex items-center gap-0.5">
                {projectId && (
                  <Link to="/editor/$id" params={{ id: projectId }} search={{ page: page.Id }}
                    aria-current={page.Id === pageId ? "page" : undefined}
                    onClick={() => setMode("editor")}
                    draggable={draggable}
                    onDragStart={(event) => { if (draggable) setComponentDrag(event.dataTransfer, "component", page.Id); }}
                    className={`${row} ${draggable ? "cursor-grab" : ""}`}
                  >
                    <Component className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{page.Name}</span>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Actions for ${page.Name}`}>
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {projectId && <DropdownMenuItem asChild><Link to="/editor/$id" params={{ id: projectId }} search={{ page: page.Id }} onClick={() => setMode("editor")}>Open master</Link></DropdownMenuItem>}
                    {permissions.canEditPages && <DropdownMenuItem onSelect={() => setDialog({ kind: "rename", page })}>Rename</DropdownMenuItem>}
                    {root && <DropdownMenuItem onSelect={() => setDialog({ kind: "save", name: page.Name, root })}>Save component to my library</DropdownMenuItem>}
                    {permissions.canDeletePages && <DropdownMenuItem variant="destructive" disabled={project.isLoading || project.isError}
                      onSelect={() => setDialog({ kind: "delete", page })}>Delete</DropdownMenuItem>}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </section>
      <section aria-label="My library">
        <h2 className="px-1.5 pb-1 text-xs font-semibold">My library</h2>
        {account.isLoading && <p className={empty}>Loading your library…</p>}
        {account.isError && <p role="alert" className={empty}>Could not load your library.</p>}
        {account.data?.length === 0 && <p className={empty}>Saved snapshots appear here.</p>}
        <ul>
          {account.data?.map((snapshot) => {
            const valid = isComponentSnapshot(snapshot.structure);
            const draggable = valid && canInsert;
            return (
              <li key={snapshot.id} className="flex items-center gap-0.5">
                <div draggable={draggable}
                  onDragStart={(event) => { if (draggable) setComponentDrag(event.dataTransfer, "snapshot", snapshot.id); }}
                  className={`${row} ${draggable ? "cursor-grab" : ""}`}>
                  <GripVertical className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{snapshot.name}</span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-7 shrink-0" aria-label={`Actions for ${snapshot.name}`}>
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled={!valid || !canInsert || !canCreate}
                      onSelect={() => setDialog({ kind: "import", snapshot })}>Make project component</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" onSelect={() => setDialog({ kind: "delete-snapshot", snapshot })}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            );
          })}
        </ul>
      </section>
      {dialog?.kind === "rename" && <ComponentNameDialog title="Rename component" confirmLabel="Rename"
        initialName={dialog.page.Name} onClose={close} onSubmit={(name) => rename(dialog.page, name)} />}
      {dialog?.kind === "save" && <SaveElementDialog title="Save component to my library"
        initialName={dialog.name} element={dialog.root} onClose={close} />}
      {dialog?.kind === "import" && <ComponentNameDialog title="Make project component" confirmLabel="Create and insert"
        initialName={dialog.snapshot.name} onClose={close}
        onSubmit={(name) => createComponent(name, { snapshot: plainComponentSnapshot(dialog.snapshot.structure) })} />}
      {dialog?.kind === "delete" && <DeletePageDialog
        page={dialog.page} usage={usageCount(project.elements, dialog.page.Id)} initiallyOpen
        onClose={close} onDelete={(id) => { void deletePage(id); }} />}
      {dialog?.kind === "delete-snapshot" && (
        <AlertDialog open onOpenChange={(open) => { if (!open && !deleting) close(); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete snapshot</AlertDialogTitle>
              <AlertDialogDescription>Remove “{dialog.snapshot.name}” from your library?</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); void deleteSnapshot(dialog.snapshot); }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
