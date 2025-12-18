"use client";

import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { InputElement } from "@/interfaces/elements.interface";
import React, { useEffect } from "react";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useParams } from "next/navigation";

const InputComponent = ({ element }: EditorComponentProps) => {
  const inputElement = element as InputElement;
  const { getCommonProps } = useElementHandler();
  const { id } = useParams();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(inputElement);
  const commonProps = getCommonProps(inputElement);

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    />
  );
};

export default InputComponent;
