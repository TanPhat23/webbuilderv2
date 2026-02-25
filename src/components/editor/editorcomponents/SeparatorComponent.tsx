"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { SeparatorElement } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const SeparatorComponent = ({ element }: EditorComponentProps) => {
  const separatorElement = element as SeparatorElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(separatorElement);

  return (
    <hr
      ref={elementRef as React.RefObject<HTMLHRElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(separatorElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        ...eventsStyle(eventsActive),
      }}
    />
  );
};

export default SeparatorComponent;
