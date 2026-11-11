import React from "react";
import { EditorComponentProps, FrameElement } from "@/features/editor";
import ElementLoader from "../ElementLoader";
import { useCanvasElement } from "./shared";

const FrameComponent = ({ element, data }: EditorComponentProps) => {
  const frameElement = element as FrameElement;
  const { rootProps } = useCanvasElement(frameElement);

  return (
    <div {...rootProps}>
      <ElementLoader elements={frameElement.elements} data={data} />
    </div>
  );
};

export default FrameComponent;
