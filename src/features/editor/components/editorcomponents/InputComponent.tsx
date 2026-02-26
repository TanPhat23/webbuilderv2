"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { InputElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const InputComponent = ({ element }: EditorComponentProps) => {
  const inputElement = element as InputElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(inputElement);
  const commonProps = getCommonProps(inputElement);

  return (
    <input
      ref={elementRef as React.RefObject<HTMLInputElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      type="text"
      placeholder={inputElement.content || "Input field"}
      {...commonProps}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        ...eventsStyle(eventsActive),
      }}
    />
  );
};

export default InputComponent;
