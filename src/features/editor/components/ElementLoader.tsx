import React from "react";
import type { EditorElement } from "@/types/global.type";
import { useElements } from "@/features/editor";
import ElementItem from "./element-loader/ElementItem";
import useElementDragHandlers from "@/features/editor/hooks/element/useElementDragHandlers";
import {
  EditorFlagsProvider,
  useEditorFlagsOptional,
} from "./context/EditorFlagsContext";
import { DragProvider } from "./context/DragContext";

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
        <ElementItem key={element.id} element={element} data={data} />
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
  const { permissions, ...drag } = useElementDragHandlers({
    isReadOnly,
    isLocked,
  });

  return (
    <EditorFlagsProvider
      isReadOnly={isReadOnly}
      isLocked={isLocked}
      permissionsRole={permissions?.role ?? null}
      iframeRef={iframeRef}
    >
      <DragProvider {...drag}>
        <ElementList elements={elements ?? pageElements} data={data} />
      </DragProvider>
    </EditorFlagsProvider>
  );
}

/**
 * Renders a list of canvas elements. The outermost loader owns editor flags
 * and drag state; loaders nested inside container elements reuse them.
 */
export default function ElementLoader(props: ElementLoaderProps) {
  const isNested = useEditorFlagsOptional() !== null;
  if (isNested) {
    return <ElementList elements={props.elements ?? []} data={props.data} />;
  }
  return <RootElementLoader {...props} />;
}
