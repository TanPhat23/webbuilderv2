"use client";

import React from "react";
import { EditorElement } from "@/types/global.type";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { getComponentMap } from "@/constants/elements";

interface ElementRendererProps {
  element: EditorElement;
  data?: any;
}

/**
 * Pure renderer for editor elements.
 *
 * - Renders the mapped component for a given element without any editor-only
 *   wrappers (resize handles, context menus, drag/drop overlays).
 * - Memoized so it can be used in export paths (server-side rendering / static
 *   markup generation) and to reduce unnecessary re-renders in the editor.
 *
 * Note: This intentionally avoids editor state / side-effects so it can be
 * reused both in the editor and in export pipelines.
 */
const ElementRenderer: React.FC<ElementRendererProps> = ({ element, data }) => {
  const commonProps: EditorComponentProps = {
    element,
    data,
  };

  const Component = getComponentMap(commonProps);
  return Component ? <Component {...commonProps} /> : null;
};

export default React.memo(
  ElementRenderer,
  (prev, next) => prev.element === next.element && prev.data === next.data,
);
