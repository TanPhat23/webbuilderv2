"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { TextareaElement, TextareaSettings } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const TextareaComponent = ({ element }: EditorComponentProps) => {
  const textareaElement = element as TextareaElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

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

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    />
  );
};

export default TextareaComponent;
