"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
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
import { useEditorElement, eventsStyle } from "./shared";

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
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(semanticElement);
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
      ...eventsStyle(eventsActive),
    },
  };

  return React.createElement(
    tag,
    props,
    <ElementLoader elements={semanticElement.elements} data={data} />,
  );
};

export default SemanticContainerComponent;
