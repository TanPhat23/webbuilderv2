import React from "react";
import type { TextareaElement } from "../../types/elements";
import type { ViewProps } from "../view-props";

export default function TextareaView({ element, rootProps }: ViewProps<TextareaElement>) {
  const settings = element.settings ?? {};
  return (
    <textarea
      name={settings.name}
      placeholder={settings.placeholder ?? "Enter text..."}
      defaultValue={settings.defaultValue ?? ""}
      rows={settings.rows ?? 4}
      cols={settings.cols}
      maxLength={settings.maxLength}
      minLength={settings.minLength}
      required={settings.required}
      readOnly={settings.readOnly}
      disabled={settings.disabled}
      wrap={settings.wrap}
      autoComplete={settings.autoComplete}
      spellCheck={settings.spellCheck}
      {...rootProps}
      style={{ ...rootProps.style, resize: settings.resize ?? "vertical" }}
    />
  );
}
