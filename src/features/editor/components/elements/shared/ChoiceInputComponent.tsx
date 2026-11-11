
import React from "react";
import { EditorComponentProps } from "@/features/editor";
import type { CheckboxElement, CheckboxSettings, RadioElement, RadioSettings } from "@/features/editor";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { useCanvasElement } from "./useCanvasElement";

export function ChoiceInputComponent({ element, type }: EditorComponentProps & { type: "checkbox" | "radio" }) {
  const choiceElement = element as CheckboxElement | RadioElement;
  const { rootProps, eventsActive } = useCanvasElement(choiceElement, {
    style: { display: "inline-flex", alignItems: "center", gap: "8px" },
  });
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
    <div {...rootProps}>
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
