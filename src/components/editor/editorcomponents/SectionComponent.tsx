"use client";
import React, { useEffect, useRef } from "react";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { SectionElement } from "@/interfaces/elements.interface";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { useParams } from "next/navigation";
import ElementLoader from "../ElementLoader";
import { SectionActions } from "./SectionActions";

const SectionComponent = ({ element, data }: EditorComponentProps) => {
  const sectionElement = element as SectionElement;
  const { id } = useParams();
  const previousEventsRef = useRef<any>(null);

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: (id as string) || "",
    });

  const safeStyles = elementHelper.getSafeStyles(sectionElement);

  useEffect(() => {
    const eventsChanged =
      JSON.stringify(element.events) !==
      JSON.stringify(previousEventsRef.current);

    if (eventsChanged) {
      previousEventsRef.current = element.events;
    }

    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      <ElementLoader elements={sectionElement.elements} data={data} />
      <SectionActions element={sectionElement} />
    </div>
  );
};

export default SectionComponent;
