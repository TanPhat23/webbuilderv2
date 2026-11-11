import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { EditorElement } from "@/types/global.type";
import { useCanvasElement } from "./useCanvasElement";
import { resolveContent } from "@/features/editor/utils/element/resolveContent";

export function sanitizeTextContent(content: string): string {
  return DOMPurify.sanitize(content);
}

export interface TextElementShellProps {
  element: EditorElement;
  data?: Record<string, unknown>;
  as?: React.ElementType;
  elementProps?: React.HTMLAttributes<HTMLElement> & Record<string, unknown>;
}

export const TextElementShell = ({
  element,
  data,
  as: Component = "div",
  elementProps,
}: TextElementShellProps) => {
  const { rootProps, isEditing } = useCanvasElement(element);
  const displayContent = resolveContent(element, data, isEditing);

  return React.createElement(Component, {
    ...elementProps,
    ...rootProps,
    style: { ...rootProps.style, ...elementProps?.style },
    dangerouslySetInnerHTML: {
      __html: sanitizeTextContent(displayContent),
    },
  });
};
