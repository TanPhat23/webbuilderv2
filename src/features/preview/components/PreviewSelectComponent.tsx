import React from "react";
import { SelectElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

interface PreviewSelectComponentProps {
  element: SelectElement;
  data?: any;
}

const PreviewSelectComponent = ({ element }: PreviewSelectComponentProps) => {
  const safeStyles = elementHelper.getSafeStyles(element);
  const settings = (element.settings ?? {}) as unknown as {
    name?: string;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
    selectOptions?: { id: string; value: string; label: string }[];
  };

  return (
    <select id={element.id} data-element-id={element.id} className={element.tailwindStyles} style={safeStyles}
      name={settings.name} defaultValue={settings.defaultValue} required={settings.required} disabled={settings.disabled}>
      {settings.selectOptions ? settings.selectOptions.map((option, index) => (
        <option key={option.id || index} value={option.value}>{option.label}</option>
      )) : <><option value="">{element.content || "Select an option"}</option>
      {element.elements?.map((option, index) => (
        <option key={index} value={option.content || ""}>
          {option.content || `Option ${index + 1}`}
        </option>
      ))}</>}
    </select>
  );
};

export default PreviewSelectComponent;
