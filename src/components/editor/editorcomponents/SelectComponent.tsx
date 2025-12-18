import { EditorComponentProps } from "@/interfaces/editor.interface";
import { SelectElement } from "@/interfaces/elements.interface";
import React, { useEffect, useMemo } from "react";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { useElementEvents } from "@/hooks/editor/eventworkflow/useElementEvents";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface SelectSettings {
  selectOptions: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

const SelectComponent = ({ element }: EditorComponentProps) => {
  const selectElement = element as SelectElement;
  const { id } = useParams();
  const { elementRef, registerEvents, createEventHandlers, eventsActive } =
    useElementEvents({
      elementId: element.id,
      projectId: id as string,
    });

  const safeStyles = elementHelper.getSafeStyles(selectElement);

  // Register events when element events change
  useEffect(() => {
    if (element.events) {
      registerEvents(element.events);
    }
  }, [element.events, registerEvents]);

  const eventHandlers = createEventHandlers();

  // Parse settings
  const settings = (selectElement.settings as unknown as SelectSettings) || {};

  const options: SelectOption[] = useMemo(() => {
    return (
      settings.selectOptions || [
        {
          id: "default-1",
          label: selectElement.content || "Option 1",
          value: "option-1",
        },
        {
          id: "default-2",
          label: "Option 2",
          value: "option-2",
        },
      ]
    );
  }, [settings.selectOptions, selectElement.content]);

  const defaultValue = settings.defaultValue || "";

  return (
    <select
      ref={elementRef as React.RefObject<HTMLSelectElement>}
      data-element-id={element.id}
      data-element-type={element.type}
      {...eventHandlers}
      style={{
        ...safeStyles,
        width: "100%",
        height: "100%",
        cursor: eventsActive ? "pointer" : "inherit",
        userSelect: eventsActive ? "none" : "auto",
      }}
      className={cn(
        selectElement.tailwindStyles,
        "appearance-none bg-no-repeat", // Ensure basic reset if tailwind styles are missing
      )}
      defaultValue={defaultValue}
      required={settings.required}
      disabled={settings.disabled && !eventsActive} // Only disable in preview/live, not editor
    >
      {options.map((opt, index) => (
        <option key={opt.id || index} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default SelectComponent;
