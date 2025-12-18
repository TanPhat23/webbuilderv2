"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import DOMPurify from "isomorphic-dompurify";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { ButtonElement } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const ButtonComponent = ({ element }: EditorComponentProps) => {
  const buttonElement = element as ButtonElement;
  const { id } = useParams();
  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(buttonElement);
  const commonProps = getCommonProps(buttonElement);

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(element.content || ""),
      }}
    />
  );
};

export default ButtonComponent;
