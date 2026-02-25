import React, { useMemo } from "react";
import { EditorComponentProps } from "@/interfaces/editor.interface";
import { SelectElement } from "@/interfaces/elements.interface";
import { elementHelper } from "@/lib/utils/element/elementhelper";
import { cn } from "@/lib/utils";
import { useEditorElement, eventsStyle } from "./shared";

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
  const { elementRef, eventHandlers, eventsActive } = useEditorElement({
    elementId: element.id,
    events: element.events,
  });

  const safeStyles = elementHelper.getSafeStyles(selectElement);
  const settings = (selectElement.settings as unknown as SelectSettings) || {};

  const options: SelectOption[] = useMemo(
    () =>
      settings.selectOptions ?? [
        {
          id: "default-1",
          label: selectElement.content || "Option 1",
          value: "option-1",
        },
        { id: "default-2", label: "Option 2", value: "option-2" },
      ],
    [settings.selectOptions, selectElement.content],
  );

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
        ...eventsStyle(eventsActive),
      }}
      className={cn(
        selectElement.tailwindStyles,
        "appearance-none bg-no-repeat",
      )}
      defaultValue={settings.defaultValue ?? ""}
      required={settings.required}
      disabled={settings.disabled && !eventsActive}
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
