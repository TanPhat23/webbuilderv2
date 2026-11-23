import React from "react";
import type { SelectElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

export default function SelectView({ element, rootProps }: ViewProps<SelectElement>) {
  const settings = element.settings ?? {};

  return (
    <select name={settings.name} defaultValue={settings.defaultValue} required={settings.required} disabled={settings.disabled} {...rootProps}>
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
}
