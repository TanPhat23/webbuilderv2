
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import {
  NavElement,
  HeaderElement,
  FooterElement,
  ArticleElement,
  AsideElement,
} from "@/features/editor";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared";

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
  const tag = ELEMENT_TYPE_TO_TAG[element.type] ?? "div";

  const { rootProps } = useCanvasElement(semanticElement, {
    style: { position: "relative" },
  });

  return React.createElement(
    tag,
    rootProps,
    <ElementLoader elements={semanticElement.elements} data={data} />,
  );
};

export default SemanticContainerComponent;
