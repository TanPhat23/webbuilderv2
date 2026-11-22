import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage } from "@/utils/errors/api-error";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { plainComponentSnapshot } from "@/features/projects/lib/resolve-elements";
import type { EditorElement } from "@/types/global.type";
import { useProjectComponents } from "../hooks/useProjectComponents";
import { componentLibrary, componentLibraryKey } from "../services/component-library.service";

export function SaveElementDialog({
  element, onClose, initialName, title = "Save to my library",
}: {
  element: EditorElement;
  onClose: () => void;
  initialName?: string;
  title?: string;
}) {
  const { userId } = useEditorContext();
  const queryClient = useQueryClient();
  const source = useProjectComponents();
  const [name, setName] = useState(initialName ?? element.name ?? "");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || saving || source.isLoading || source.isError) return;
    setSaving(true);
    setError("");
    try {
      await componentLibrary.save(trimmed, description.trim(), plainComponentSnapshot(element, element.pageId, source));
      void queryClient.invalidateQueries({ queryKey: componentLibraryKey(userId) });
      toast.success(`Saved "${trimmed}" to your library`);
      onClose();
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !saving) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Save a copy you can insert in any project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="library-element-name">Name</Label>
            <Input id="library-element-name" required maxLength={255} value={name} disabled={saving}
              onChange={(event) => setName(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="library-element-description">Description</Label>
            <Textarea id="library-element-description" value={description} disabled={saving}
              onChange={(event) => setDescription(event.target.value)} />
          </div>
          {(error || source.isError) && <p role="alert" className="text-xs text-destructive">{error || "Could not load the project’s components."}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={!name.trim() || saving || source.isLoading || source.isError}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
