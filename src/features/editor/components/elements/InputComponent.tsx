import React from "react";
import { EditorComponentProps, InputElement } from "@/features/editor";
import { useCanvasElement } from "./shared";

const InputComponent = ({ element }: EditorComponentProps) => {
  const inputElement = element as InputElement;
  const { rootProps } = useCanvasElement(inputElement);

  return (
    <input
      type="text"
      placeholder={inputElement.content || "Input field"}
      {...rootProps}
    />
  );
};

export default InputComponent;
