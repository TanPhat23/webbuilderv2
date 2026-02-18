"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { HeadingElement, HeadingSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const HeadingComponent = ({ element, data }: EditorComponentProps) => {
  const headingElement = element as HeadingElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(headingElement);
  const commonProps = getCommonProps(headingElement);
  const isEditing = commonProps.contentEditable;

  const settings = (headingElement.settings ?? { level: 2 }) as HeadingSettings;
  const level = settings.level ?? 2;

  let content =
    (typeof data === "string" ? data : "") ||
    (typeof data === "object" && data && typeof data.content === "string"
      ? data.content
      : "") ||
    (typeof element.content === "string" ? element.content : "") ||
    "";

  if (typeof element.content === "string" && data && typeof data === "object") {
    content = elementHelper.replacePlaceholders(element.content, data);
  }

  const displayContent = isEditing ? element.content : content;

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  const Tag = `h${level}` as const;

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
      cursor: eventsActive ? "pointer" : "inherit",
      userSelect: eventsActive ? "none" : "auto",
    },
    suppressContentEditableWarning: true,
    dangerouslySetInnerHTML: {
      __html: DOMPurify.sanitize(displayContent),
    },
  });
};

export default HeadingComponent;
