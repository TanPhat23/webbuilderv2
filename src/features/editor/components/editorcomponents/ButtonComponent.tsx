"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import DOMPurify from "isomorphic-dompurify";
import { EditorComponentProps } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { ButtonElement } from "@/features/editor";
import { useEditorElement, eventsStyle } from "./shared";

const ButtonComponent = ({ element }: EditorComponentProps) => {
  const buttonElement = element as ButtonElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(buttonElement);
  const commonProps = getCommonProps(buttonElement);

  return (
    <button
      ref={elementRef as React.RefObject<HTMLButtonElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...commonProps}
      {...eventHandlers}
      type="button"
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(element.content || ""),
      }}
    />
  );
};

export default ButtonComponent;
