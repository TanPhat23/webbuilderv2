"use client";

import React, { useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  NavElement,
  HeaderElement,
  FooterElement,
  ArticleElement,
  AsideElement,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import ElementLoader from "../ElementLoader";

type SemanticElement =
  | NavElement
  | HeaderElement
  | FooterElement
  | ArticleElement
  | AsideElement;

const ELEMENT_TYPE_TO_TAG: Record<string, string> = {
  Nav: "nav",
  Header: "header",
  Footer: "footer",
  Article: "article",
  Aside: "aside",
};

const SemanticContainerComponent = ({
  element,
  data,
}: EditorComponentProps) => {
  const semanticElement = element as SemanticElement;
  const { id } = useParams();
  const previousEventsRef = useRef<any>(null);

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: (id as string) || "",
    });

  const safeStyles = elementHelper.getSafeStyles(semanticElement);

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

  const tag = ELEMENT_TYPE_TO_TAG[element.type] ?? "div";

  const props = {
    ref: elementRef as React.RefObject<HTMLElement>,
    "data-element-id": element.id,
    "data-element-type": element.type,
    ...getCommonProps(semanticElement as any),
    ...eventHandlers,
    style: {
      ...safeStyles,
      width: "100%",
      height: "100%",
      position: "relative" as const,
      cursor: eventsActive ? "pointer" : "inherit",
      userSelect: eventsActive ? ("none" as const) : ("auto" as const),
    },
  };

  return React.createElement(
    tag,
    props,
    <ElementLoader elements={semanticElement.elements} data={data} />,
  );
};

export default SemanticContainerComponent;
