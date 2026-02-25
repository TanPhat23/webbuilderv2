"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  BlockquoteElement,
  BlockquoteSettings,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorElement, eventsStyle, resolveContent } from "./shared";

const BlockquoteComponent = ({ element, data }: EditorComponentProps) => {
  const blockquoteElement = element as BlockquoteElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(blockquoteElement);
  const commonProps = getCommonProps(blockquoteElement);

  const settings = (blockquoteElement.settings ?? {}) as BlockquoteSettings;
  const cite = settings.cite;

  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable,
  );

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
        ...eventsStyle(eventsActive),
      }}
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(displayContent) }}
    />
  );
};

export default BlockquoteComponent;
