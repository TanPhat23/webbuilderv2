import React from "react";
import { EditorComponentProps } from "@/features/editor";
import { useCanvasElement } from "./shared";

const SeparatorComponent = ({ element }: EditorComponentProps) => {
  const { rootProps } = useCanvasElement(element, { fill: false });
  return <hr {...rootProps} />;
};

export default SeparatorComponent;
