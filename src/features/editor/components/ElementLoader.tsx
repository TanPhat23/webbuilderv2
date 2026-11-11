import React from "react";
import { useParams } from "@tanstack/react-router";
import type { EditorElement } from "@/types/global.type";
import { useElements } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
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

  return (
    <EditorFlagsProvider
      isReadOnly={isReadOnly}
      isLocked={isLocked}
      permissionsRole={permissions?.role ?? null}
      canEdit={editable && !!permissions?.canEditElements}
      canCreate={editable && !!permissions?.canCreateElements}
      iframeRef={iframeRef}
    >
      <CanvasInteractionLayer>
        <ElementList elements={elements ?? pageElements} data={data} />
      </CanvasInteractionLayer>
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
