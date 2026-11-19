import { useId } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  componentOverrideFields, componentSetting, detach, resolveComponents, validComponentOverrides, visitComponentTree,
  type ComponentOverride,
} from "@/features/projects/lib/components";
import type { EditorElement } from "@/types/global.type";
import { useEditorContext } from "@/providers/editorprovider";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useProjectComponents } from "../../../hooks/useProjectComponents";
import { useEditorPermissions } from "../../../hooks/useEditorPermissions";
import { useSelectionStore } from "../../../store/selection-store";
import { ElementStore } from "../../../store/element-store";
import { elementHelper } from "../../../utils/element/elementhelper";

const fieldLabels: Record<keyof ComponentOverride, string> = {
  text: "Text", src: "Image URL", alt: "Alt text", href: "Link URL",
};

export function ComponentConfiguration({ element }: { element: EditorElement }) {
  const { projectId, editor, setMode } = useEditorContext();
  const permissions = useEditorPermissions(projectId);
  const collaboration = useCollaborationOptional();
  const source = useProjectComponents();
  const id = useId();
  const setting = componentSetting(element);
  if (!setting) return null;

  const page = source.pages.find((page) => page.Id === setting.pageId);
  const root = source.roots.get(setting.pageId);
  const nodes: EditorElement[] = [];
  if (root?.id === setting.rootId) {
    const resolved = resolveComponents([root], source.elements, source.pageIds);
    visitComponentTree([root], (node) => {
      const baseline = elementHelper.findById(resolved, node.id);
      if (baseline && componentOverrideFields(baseline).length) nodes.push(baseline);
    });
  }
  const editable = !editor.isReadOnly && !editor.isLocked && !editor.isLoading &&
    !!collaboration?.isSynced && permissions.canEditElements && !source.isLoading && !source.isError;
  const overrides = setting.overrides;

  function change(nodeId: string, field: keyof ComponentOverride, value: string, baseline: string) {
    const next = { ...overrides };
    const fields = { ...next[nodeId] };
    if (value === baseline) delete fields[field];
    else fields[field] = value;
    if (Object.keys(fields).length) next[nodeId] = fields;
    else delete next[nodeId];
    setOverrides(Object.keys(next).length ? next : undefined);
  }

  function setOverrides(next?: typeof overrides) {
    if (!setting || !editable) return;
    if (next && !validComponentOverrides(next)) {
      toast.error("The component overrides exceed the size limit.");
      return;
    }
    const { pageId, rootId } = setting;
    ElementStore.getState().updateElement(element.id, {
      settings: { ...element.settings, component: { pageId, rootId, ...(next && { overrides: next }) } },
    });
  }

  function detachInstance() {
    if (!editable) return;
    const store = ElementStore.getState();
    const live = elementHelper.findById(store.elements, element.id);
    if (!live || !componentSetting(live)) return;
    const next = detach(live, source.elements, source.pageIds);
    store.replaceTree(elementHelper.mapUpdateById(store.elements, element.id, () => next));
    useSelectionStore.setState({ selectedElementId: next.id });
  }

  return (
    <div className="space-y-4 overflow-y-auto p-3 text-xs">
      <div className="space-y-2">
        <p className="font-medium">{page?.Name ?? (source.isLoading ? "Loading component…" : "Missing component")}</p>
        <div className="flex flex-wrap gap-1.5">
          {projectId && page && (
            <Button size="sm" variant="outline" asChild>
              <Link to="/editor/$id" params={{ id: projectId }} search={{ page: page.Id }} onClick={() => setMode("editor")}>Edit component</Link>
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={!editable || !permissions.canCreateElements} onClick={detachInstance}>Detach</Button>
        </div>
      </div>
      {source.isError && <p role="alert" className="text-destructive">Could not load the component master.</p>}
      {(nodes.length > 0 || overrides) && (
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold">Overrides</h3>
            <Button size="sm" variant="ghost" disabled={!editable || !overrides} onClick={() => setOverrides()}>Reset overrides</Button>
          </div>
          {nodes.map((node) => (
            <fieldset key={node.id} className="space-y-2" disabled={!editable}>
              <legend className="truncate pb-1 text-muted-foreground">{node.name || node.type}</legend>
              {componentOverrideFields(node).map((field) => {
                const inputId = `${id}-${node.id}-${field}`;
                const baseline = field === "alt" ? node.name ?? node.content : field === "text" ? node.content : node[field] ?? "";
                const value = overrides?.[node.id]?.[field] ?? baseline;
                return (
                  <div key={field} className="space-y-1">
                    <Label htmlFor={inputId} className="text-xs">{fieldLabels[field]}</Label>
                    <Input id={inputId} className="h-7 text-xs" key={value} defaultValue={value} maxLength={20_000}
                      onBlur={(event) => { if (event.target.value !== value) change(node.id, field, event.target.value, baseline); }}
                      onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }} />
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>
      )}
    </div>
  );
}
