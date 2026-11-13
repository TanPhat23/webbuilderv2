import React from "react";
import { TextareaElement } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";

const PreviewTextareaComponent = ({ element }: { element: TextareaElement; data?: unknown }) => {
  const settings = element.settings ?? {};
  return (
    <textarea
      id={element.id}
      data-element-id={element.id}
      className={element.tailwindStyles}
      style={{ ...elementHelper.getSafeStyles(element), resize: settings.resize ?? "vertical" }}
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
    />
  );
};

export default PreviewTextareaComponent;
