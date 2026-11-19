import React from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { EditorElement } from "@/types/global.type";
import { useElements, useEventModeStore } from "@/features/editor";
import { InteractionHost } from "@/features/interactions/components/InteractionHost";
import { useActiveLogic } from "@/features/interactions/logic-hooks";
import { editorPlatform } from "@/features/interactions/runtime/executors";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useResolvedElements } from "@/features/editor/hooks/useResolvedElements";
import { componentSetting, visitComponentTree } from "@/features/projects/lib/components";
import { ResolvedInstancesContext } from "./ComponentInstanceCanvas";
import { sharedSectionSetting } from "@/features/projects/lib/shared-sections";
import PreviewElementLoader from "@/features/preview/components/PreviewElementLoader";
import ElementRenderer from "./ElementRenderer";
import {
  EditorFlagsProvider,
  useEditorFlagsOptional,
} from "./context/EditorFlagsContext";
import { CanvasInteractionLayer } from "./canvas/CanvasInteractionLayer";

interface ElementLoaderProps {
  /** Elements to render. The root loader defaults to the whole page. */
  elements?: EditorElement[];
  data?: Record<string, unknown>;
  /** Root-only: nested loaders inherit flags from the enclosing loader. */
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

function ElementList({
  elements,
  data,
}: {
  elements: EditorElement[];
  data?: Record<string, unknown>;
}) {
  return (
    <>
      {elements.map((element) => (
        <ElementRenderer key={element.id} element={element} data={data} />
      ))}
    </>
  );
}

function RootElementLoader({
  elements,
  data,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}: ElementLoaderProps) {
  const pageElements = useElements();
  const params = useParams({ strict: false }) as { id?: string };
  const permissions = useEditorPermissions(params.id ?? null);
  const editable = !isReadOnly && !isLocked;
  const eventsOn = useEventModeStore((s) => s.isEventModeEnabled);
  const list = elements ?? pageElements;
  const resolved = useResolvedElements(list);
  const instances = React.useMemo(() => {
    const ids = new Set<string>();
    visitComponentTree(list, (element) => { if (componentSetting(element)) ids.add(element.id); });
    const byId = new Map<string, EditorElement>();
    visitComponentTree(resolved, (element) => { if (ids.has(element.id)) byId.set(element.id, element); });
    return byId;
  }, [list, resolved]);
  const logic = useActiveLogic();

  return (
    <EditorFlagsProvider
      isReadOnly={isReadOnly}
      isLocked={isLocked}
      permissionsRole={permissions?.role ?? null}
      canEdit={editable && !!permissions?.canEditElements}
      canCreate={editable && !!permissions?.canCreateElements}
      iframeRef={iframeRef}
    >
      <ResolvedInstancesContext.Provider value={instances}>
        <CanvasInteractionLayer>
          <InteractionHost elements={resolved} enabled={eventsOn} namespace={params.id ?? "editor"} variables={logic.variables} flows={logic.flows} platform={editorPlatform} showLog>
            {list.map((element, index) => {
              const setting = sharedSectionSetting(element);
              const rendered = resolved[index];
              const renderedSetting = rendered && sharedSectionSetting(rendered);
              if (params.id && renderedSetting && !("sourceId" in renderedSetting) && setting && "sourceId" in setting) {
                return (
                  <div key={element.id} data-shared-section-id={element.id} className="relative">
                    <div inert>
                      <PreviewElementLoader elements={[rendered]} data={data} showMissing />
                    </div>
                    <Link
                      to="/editor/$id"
                      params={{ id: params.id }}
                      search={{ page: setting.sourcePageId }}
                      className="absolute right-2 top-2 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground shadow-sm hover:bg-accent"
                    >
                      Edit shared {setting.slot}
                    </Link>
                  </div>
                );
              }
              return <ElementRenderer key={element.id} element={element} data={data} />;
            })}
          </InteractionHost>
        </CanvasInteractionLayer>
      </ResolvedInstancesContext.Provider>
    </EditorFlagsProvider>
  );
}

/**
 * Renders a list of canvas elements. The outermost loader provides editor
 * flags and the interaction layer (hover, selection, drag & drop, overlay);
 * loaders nested inside container elements only render their children.
 */
export default function ElementLoader(props: ElementLoaderProps) {
  const isNested = useEditorFlagsOptional() !== null;
  if (isNested) {
    return <ElementList elements={props.elements ?? []} data={props.data} />;
  }
  return <RootElementLoader {...props} />;
}
