import React from "react";
import { Link, useParams } from "@tanstack/react-router";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { useElements, useEventModeStore } from "@/features/editor";
import { InteractionHost } from "@webbuilder/site-runtime/interactions/components/InteractionHost";
import { useActiveLogic } from "@/features/interactions/logic-hooks";
import { editorPlatform } from "@webbuilder/site-runtime/interactions/runtime/executors";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useResolvedElements } from "@/features/editor/hooks/useResolvedElements";
import { componentSetting, visitComponentTree } from "@webbuilder/site-runtime/projects/components";
import type { CollaboratorRole } from "@/features/collaboration";
import { ResolvedInstancesContext } from "./ComponentInstanceCanvas";
import { sharedSectionSetting } from "@webbuilder/site-runtime/projects/shared-sections";
import PreviewElementLoader from "@webbuilder/site-runtime/preview/PreviewElementLoader";
import ElementRenderer from "./ElementRenderer";
import {
  EditorFlagsProvider,
  useEditorFlagsOptional,
} from "./context/EditorFlagsContext";
import { ChildElementLoaderProvider } from "./context/ChildElementLoaderContext";

/** The page's elements, their resolved (component / shared section) form, and component instances. */
export interface ResolvedPage {
  readonly list: EditorElement[];
  readonly resolved: EditorElement[];
  readonly instances: ReadonlyMap<string, EditorElement>;
}

/**
 * Resolves the page once so the site frame's CSS compilers, the element
 * renderers, and the HUD's component badges all share one computation.
 */
export function useResolvedPage(elements?: EditorElement[]): ResolvedPage {
  const pageElements = useElements();
  const list = elements ?? pageElements;
  const resolved = useResolvedElements(list);
  const instances = React.useMemo(() => {
    const ids = new Set<string>();
    visitComponentTree(list, (element) => { if (componentSetting(element)) ids.add(element.id); });
    const byId = new Map<string, EditorElement>();
    visitComponentTree(resolved, (element) => { if (ids.has(element.id)) byId.set(element.id, element); });
    return byId;
  }, [list, resolved]);
  return React.useMemo(() => ({ list, resolved, instances }), [list, resolved, instances]);
}

export interface CanvasAccess {
  readonly canEdit: boolean;
  readonly canCreate: boolean;
  readonly permissionsRole: CollaboratorRole | null;
}

/** What the current user may do on the canvas, given the read-only and lock flags. */
export function useCanvasAccess(flags: {
  readonly isReadOnly: boolean;
  readonly isLocked: boolean;
}): CanvasAccess {
  const params = useParams({ strict: false }) as { id?: string };
  const permissions = useEditorPermissions(params.id ?? null);
  const editable = !flags.isReadOnly && !flags.isLocked;
  return {
    canEdit: editable && !!permissions?.canEditElements,
    canCreate: editable && !!permissions?.canCreateElements,
    permissionsRole: permissions?.role ?? null,
  };
}

interface ElementLoaderProps {
  /** Elements to render. The root loader defaults to the whole page. */
  elements?: EditorElement[];
  data?: Record<string, unknown>;
  /** Root-only: nested loaders inherit flags from the enclosing loader. */
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  /** Root-only: an already resolved page, to share it with the canvas HUD. */
  page?: ResolvedPage;
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
  page,
  data,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}: ElementLoaderProps & { page: ResolvedPage }) {
  const params = useParams({ strict: false }) as { id?: string };
  const { canEdit, canCreate, permissionsRole } = useCanvasAccess({ isReadOnly, isLocked });
  const eventsOn = useEventModeStore((s) => s.isEventModeEnabled);
  const { list, resolved, instances } = page;
  const logic = useActiveLogic();

  const renderChildElements = React.useCallback(
    (nestedElements: EditorElement[], nestedData?: Record<string, unknown>) => (
      <ElementList elements={nestedElements} data={nestedData} />
    ),
    [],
  );

  return (
    <EditorFlagsProvider
      isReadOnly={isReadOnly}
      isLocked={isLocked}
      permissionsRole={permissionsRole}
      canEdit={canEdit}
      canCreate={canCreate}
      iframeRef={iframeRef}
    >
      <ChildElementLoaderProvider renderElements={renderChildElements}>
        <ResolvedInstancesContext.Provider value={instances}>
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
        </ResolvedInstancesContext.Provider>
      </ChildElementLoaderProvider>
    </EditorFlagsProvider>
  );
}

function SelfResolvedLoader(props: ElementLoaderProps) {
  const page = useResolvedPage(props.elements);
  return <RootElementLoader {...props} page={page} />;
}

/**
 * Renders a list of canvas elements as pure site content. The outermost
 * loader provides editor flags and the interaction host; all editor chrome
 * (selection, handles, drop indicators) lives in the parent-DOM canvas HUD.
 * Loaders nested inside container elements only render their children.
 */
export default function ElementLoader(props: ElementLoaderProps) {
  const isNested = useEditorFlagsOptional() !== null;
  if (isNested) {
    return <ElementList elements={props.elements ?? []} data={props.data} />;
  }
  if (props.page) return <RootElementLoader {...props} page={props.page} />;
  return <SelfResolvedLoader {...props} />;
}
