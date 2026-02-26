"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import {
  TextareaElement,
  TextareaSettings,
} from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const TextareaComponent = ({ element }: EditorComponentProps) => {
  const textareaElement = element as TextareaElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(textareaElement);
  const commonProps = getCommonProps(textareaElement);

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

  return (
    <textarea
      ref={elementRef as React.RefObject<HTMLTextAreaElement>}
      data-element-id={element.id}
      data-element-type={element.type}
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
      {...commonProps}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        resize,
        ...eventsStyle(eventsActive),
      }}
    />
  );
};

export default TextareaComponent;
