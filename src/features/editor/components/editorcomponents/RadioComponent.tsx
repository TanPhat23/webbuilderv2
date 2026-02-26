"use client";

import React from "react";
import { useElementHandler } from "@/hooks";
import { EditorComponentProps } from "@/features/editor";
import { RadioElement, RadioSettings } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement, eventsStyle } from "./shared";

const RadioComponent = ({ element }: EditorComponentProps) => {
  const radioElement = element as RadioElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const { getCommonProps } = useElementHandler();
  const safeStyles = elementHelper.getSafeStyles(radioElement);

  const settings = (radioElement.settings ?? {}) as RadioSettings;
  const name = settings.name;
  const defaultChecked = settings.defaultChecked ?? false;
  const required = settings.required ?? false;
  const disabled = settings.disabled ?? false;
  const value = settings.value ?? "";
  const label = settings.label || radioElement.content || "Radio label";

  const radioId = `radio-${element.id}`;

  return (
    <div
      ref={elementRef as React.RefObject<HTMLDivElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        ...eventsStyle(eventsActive),
      }}
    >
      <input
        id={radioId}
        type="radio"
        name={name}
        defaultChecked={defaultChecked}
        required={required}
        disabled={disabled && !eventsActive}
        value={value}
        style={{
          width: "16px",
          height: "16px",
          cursor: "pointer",
          accentColor: "var(--color-primary, #2563eb)",
          flexShrink: 0,
        }}
      />
      <label
        htmlFor={radioId}
        style={{
          cursor: "pointer",
          fontSize: safeStyles.fontSize ?? "14px",
          fontWeight: safeStyles.fontWeight ?? "400",
          color: safeStyles.color ?? "var(--text-primary, #1e293b)",
          lineHeight: "1.4",
        }}
      >
        {label}
      </label>
    </div>
  );
};

export default RadioComponent;
