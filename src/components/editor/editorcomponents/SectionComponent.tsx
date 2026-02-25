"use client";
import React from "react";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useElementHandler } from "@/hooks";
import { SectionElement } from "@/interfaces/elements.interface";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import ElementLoader from "../ElementLoader";
import { SectionActions } from "./SectionActions";
import { useEditorElement, eventsStyle } from "./shared";

const SectionComponent = ({ element, data }: EditorComponentProps) => {
  const sectionElement = element as SectionElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(sectionElement);

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...getCommonProps(sectionElement)}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        position: "relative",
        ...eventsStyle(eventsActive),
      }}
    >
      <ElementLoader elements={sectionElement.elements} data={data} />
      <SectionActions element={sectionElement} />
    </div>
  );
};

export default SectionComponent;
