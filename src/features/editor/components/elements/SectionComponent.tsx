import React from "react";
import { EditorComponentProps, SectionElement } from "@/features/editor";
import ElementLoader from "../ElementLoader";
import { SectionActions } from "./SectionActions";
import { useCanvasElement } from "./shared";

const SectionComponent = ({ element, data }: EditorComponentProps) => {
  const sectionElement = element as SectionElement;
  const { rootProps } = useCanvasElement(sectionElement, {
    style: { position: "relative" },
  });

  return (
    <div {...rootProps}>
      <ElementLoader elements={sectionElement.elements} data={data} />
      <SectionActions element={sectionElement} />
    </div>
  );
};

export default SectionComponent;
