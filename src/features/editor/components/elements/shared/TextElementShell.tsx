import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/features/editor/hooks/element/useElementHandler";
import { EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement } from "./useEditorElement";
import { eventsStyle } from "./eventsStyle";
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
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(element);
  const commonProps = getCommonProps(element);
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable,
  );

  return React.createElement(Component, {
    ref: elementRef,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...elementProps,
    ...commonProps,
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive),
      ...elementProps?.style,
    },
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: {
      __html: sanitizeTextContent(displayContent),
    },
  });
};
