import { createContext, useContext } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { isMissingComponent } from "@webbuilder/site-runtime/projects/components";
import { useEditorFlags } from "./context/EditorFlagsContext";
import PreviewElementLoader from "@webbuilder/site-runtime/preview/PreviewElementLoader";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";

export const ResolvedInstancesContext = createContext<ReadonlyMap<string, EditorElement>>(new Map());

export function ComponentInstanceCanvas({
  element, data,
}: { element: EditorElement; data?: Record<string, unknown> }) {
  const rendered = useContext(ResolvedInstancesContext).get(element.id);
  const { canEdit } = useEditorFlags();
  const missing = !rendered || isMissingComponent(rendered);

  return (
    <div
      className="contents select-none"
      data-component-instance={element.id}
      onClick={(event) => event.preventDefault()}
      onSubmit={(event) => event.preventDefault()}
    >
      {missing ? (
        <div data-element-id={element.id} draggable={canEdit} style={elementUtils.getSafeStyles(element)}
          className="min-h-10 rounded border border-dashed border-border bg-muted px-2 py-1.5 text-xs text-muted-foreground">
          Missing component
        </div>
      ) : <PreviewElementLoader elements={[rendered]} data={data} showMissing draggableRoot={canEdit} />}
    </div>
  );
}
