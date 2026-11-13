import React, { useMemo } from "react";
import { EditorComponentProps } from "@/features/editor";
import { SelectElement } from "@/features/editor";
import { cn } from "@/lib/utils";
import { useCanvasElement } from "./shared";

interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface SelectSettings {
  name?: string;
  selectOptions: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

const SelectComponent = ({ element }: EditorComponentProps) => {
  const selectElement = element as SelectElement;
  const { rootProps, eventsActive } = useCanvasElement(selectElement);
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
      {...rootProps}
      name={settings.name}
      className={cn(rootProps.className, "appearance-none bg-no-repeat")}
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
