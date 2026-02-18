"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useElementHandler } from "@/hooks";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import {
  CheckboxElement,
  CheckboxSettings,
} from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";

const CheckboxComponent = ({ element }: EditorComponentProps) => {
  const checkboxElement = element as CheckboxElement;
  const { id } = useParams();

  const { getCommonProps } = useElementHandler();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(checkboxElement);

  const settings = (checkboxElement.settings ?? {}) as CheckboxSettings;
  const name = settings.name;
  const defaultChecked = settings.defaultChecked ?? false;
  const required = settings.required ?? false;
  const disabled = settings.disabled ?? false;
  const value = settings.value ?? "";
  const label =
    settings.label || checkboxElement.content || "Checkbox label";

  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  const checkboxId = `checkbox-${element.id}`;

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
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
    >
      <input
        id={checkboxId}
        type="checkbox"
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
        htmlFor={checkboxId}
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

export default CheckboxComponent;
