"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  HeadingElement,
  HeadingSettings,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorElement, eventsStyle, resolveContent } from "./shared";

const HeadingComponent = ({ element, data }: EditorComponentProps) => {
  const headingElement = element as HeadingElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(headingElement);
  const commonProps = getCommonProps(headingElement);

  const settings = (headingElement.settings ?? { level: 2 }) as HeadingSettings;
  const level = settings.level ?? 2;
  const Tag = `h${level}` as const;

  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable,
  );

  return React.createElement(Tag, {
    ref: elementRef as React.RefObject<HTMLHeadingElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...commonProps,
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      ...eventsStyle(eventsActive),
    },
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(displayContent),
    },
  });
};

export default HeadingComponent;
