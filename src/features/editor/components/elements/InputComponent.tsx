import React from "react";
import { EditorComponentProps, InputElement } from "@/features/editor";
import { useCanvasElement } from "./shared";

const InputComponent = ({ element }: EditorComponentProps) => {
  const inputElement = element as InputElement;
  const settings = inputElement.settings ?? {};
  const { rootProps } = useCanvasElement(inputElement);

  return (
    <input
      name={settings.name}
      type={settings.type || "text"}
      placeholder={settings.placeholder || inputElement.content || "Input field"}
      defaultValue={settings.defaultValue ?? ""}
      min={settings.min}
      max={settings.max}
      step={settings.step}
      required={settings.required}
      pattern={settings.pattern}
      autoComplete={settings.autoComplete}
      {...rootProps}
    />
  );
};

export default InputComponent;
