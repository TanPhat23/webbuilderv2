
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import {
  TextareaElement,
  TextareaSettings,
} from "@/features/editor";
import { useCanvasElement } from "./shared";

const TextareaComponent = ({ element }: EditorComponentProps) => {
  const textareaElement = element as TextareaElement;

  const settings = (textareaElement.settings ?? {}) as TextareaSettings;
  const placeholder = settings.placeholder ?? "Enter text...";
  const rows = settings.rows ?? 4;
  const cols = settings.cols;
  const maxLength = settings.maxLength;
  const minLength = settings.minLength;
  const required = settings.required ?? false;
  const readOnly = settings.readOnly ?? false;
  const disabled = settings.disabled ?? false;
  const wrap = settings.wrap;
  const autoComplete = settings.autoComplete;
  const spellCheck = settings.spellCheck;
  const resize = settings.resize ?? "vertical";
  const { rootProps, eventsActive } = useCanvasElement(textareaElement, {
    style: { resize },
  });

  return (
    <textarea
      placeholder={placeholder}
      rows={rows}
      cols={cols}
      maxLength={maxLength}
      minLength={minLength}
      required={required}
      readOnly={readOnly}
      disabled={disabled && !eventsActive}
      wrap={wrap}
      autoComplete={autoComplete}
      spellCheck={spellCheck}
      defaultValue={settings.defaultValue ?? ""}
      {...rootProps}
    />
  );
};

export default TextareaComponent;
