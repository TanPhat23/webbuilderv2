"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  BlockquoteElement,
  BlockquoteSettings,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const BlockquoteComponent = ({ element, data }: EditorComponentProps) => {
  const blockquoteElement = element as BlockquoteElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(blockquoteElement);
  const commonProps = getCommonProps(blockquoteElement);
  const isEditing = commonProps.contentEditable;

  const settings = (blockquoteElement.settings ?? {}) as BlockquoteSettings;
  const cite = settings.cite;

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

  return (
    <blockquote
      ref={elementRef as React.RefObject<HTMLQuoteElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      cite={cite || undefined}
      {...commonProps}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
      suppressContentEditableWarning={true}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(displayContent),
      }}
    />
  );
};

export default BlockquoteComponent;
