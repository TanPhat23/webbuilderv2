import SectionView from "@/features/elements/views/SectionView";
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
    <SectionView element={sectionElement} rootProps={rootProps} mode="edit">
      <ElementLoader elements={sectionElement.elements} data={data} />
      <SectionActions element={sectionElement} />
    </SectionView>
  );
};

export default SectionComponent;
