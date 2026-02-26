import React from "react";
import DOMPurify from "isomorphic-dompurify";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { TextElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle, resolveContent } from "./shared";

const BaseComponent = ({ element, data }: EditorComponentProps) => {
  const baseElement = element as TextElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(baseElement);
  const commonProps = getCommonProps(baseElement);
  const displayContent = resolveContent(
    element,
    data,
    !!commonProps.contentEditable,
  );

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
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

export default BaseComponent;
