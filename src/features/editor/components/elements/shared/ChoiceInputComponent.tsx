
import React from "react";
import { useElementInteraction } from "@/features/editor/hooks/element/useElementInteraction";
import { EditorComponentProps } from "@/features/editor";
import type { CheckboxElement, CheckboxSettings, RadioElement, RadioSettings } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useEditorElement } from "./useEditorElement";
import { eventsStyle } from "./eventsStyle";

export function ChoiceInputComponent({ element, type }: EditorComponentProps & { type: "checkbox" | "radio" }) {
  const choiceElement = element as CheckboxElement | RadioElement;
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  useElementInteraction();
  const safeStyles = elementHelper.getSafeStyles(choiceElement);

  const settings = (choiceElement.settings ?? {}) as CheckboxSettings | RadioSettings;
  const name = settings.name;
  const defaultChecked = settings.defaultChecked ?? false;
  const required = settings.required ?? false;
  const disabled = settings.disabled ?? false;
  const value = settings.value ?? "";
  const label = settings.label || choiceElement.content || (type === "checkbox" ? "Checkbox label" : "Radio label");

  const inputId = `${type}-${element.id}`;

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
        id={inputId}
        type={type}
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
        htmlFor={inputId}
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
}
