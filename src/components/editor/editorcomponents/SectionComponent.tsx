"use client";
import React, { useEffect, useRef } from "react";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { ElementFactory } from "@/lib/utils/element/create/ElementFactory";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { SectionElement } from "@/interfaces/elements.interface";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useInsertElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import ElementLoader from "../ElementLoader";
import { usePageStore } from "@/globalstore/page-store";

const SectionComponent = ({ element, data }: EditorComponentProps) => {
  const sectionElement = element as SectionElement;
  const insertElement = useInsertElement();
  const selectedElement = useSelectedElement();
  const { id } = useParams();
  const previousEventsRef = useRef<any>(null);

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });
  const { currentPage } = usePageStore();

  const safeStyles = elementHelper.getSafeStyles(sectionElement);

  useEffect(() => {
    // Only log if element events have actually changed
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

  const handleCreateSeciont = () => {
    const newElement = ElementFactory.getInstance().createElement({
      type: "Section",
      pageId: currentPage?.Id || "",
    });
    console.log("New Section Element:", newElement);
    if (newElement) insertElement(element, newElement);
  };
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
      {selectedElement?.id === sectionElement.id && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: -30,
            zIndex: 10,
          }}
        >
          <Button
            className="h-6 text-primary-foreground"
            onDoubleClick={handleCreateSeciont}
          >
            + Add Section
          </Button>
        </div>
      )}
    </div>
  );
};

export default SectionComponent;
