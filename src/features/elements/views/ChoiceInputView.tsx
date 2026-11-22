import React from "react";
import type { CheckboxElement, RadioElement } from "@/types/elements";
import type { ViewProps } from "../view-props";

interface ChoiceInputViewProps extends ViewProps<CheckboxElement | RadioElement> {
  enableDisabledInput?: boolean;
}

export default function ChoiceInputView({ element, rootProps, enableDisabledInput }: ChoiceInputViewProps) {
  const settings = element.settings;
  return (
    <label {...rootProps}>
      <input type={element.type === "Checkbox" ? "checkbox" : "radio"} name={settings?.name} value={settings?.value}
        defaultChecked={settings?.checked ?? settings?.defaultChecked}
        disabled={enableDisabledInput ? false : settings?.disabled} required={settings?.required} />
      {settings?.label ?? element.content}
    </label>
  );
}
