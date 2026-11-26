import React from "react";
import type { InputElement } from "../../types/elements";
import type { ViewProps } from "../view-props";

export default function InputView({ element, rootProps }: ViewProps<InputElement>) {
  const settings = element.settings || {};

  return (
    <input
      name={settings.name}
      type={settings.type || "text"}
      placeholder={settings.placeholder || element.content || "Input field"}
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
}
