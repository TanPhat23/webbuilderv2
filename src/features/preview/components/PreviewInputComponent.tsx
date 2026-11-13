import React from "react";
import { InputElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewInputComponentProps {
  element: InputElement;
  data?: any;
}

const PreviewInputComponent = ({ element }: PreviewInputComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = element.settings || {};

  return (
    <input
      type={settings.type || "text"}
      placeholder={settings.placeholder || element.content || "Input field"}
      defaultValue={settings.defaultValue || ""}
      min={settings.min}
      max={settings.max}
      step={settings.step}
      required={settings.required}
      pattern={settings.pattern}
      autoComplete={settings.autoComplete}
      id={element.id} data-element-id={element.id} className={element.tailwindStyles}
      style={safeStyles}
    />
  );
};

export default PreviewInputComponent;
