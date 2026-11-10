import React, { ChangeEvent } from "react";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import {
  RadioElement,
  RadioSettings,
} from "@/features/editor";
import { ChoiceConfigurationShell } from "./_shared/ChoiceConfigurationSection";
import {
  Circle,
  CircleDot,
} from "lucide-react";

export default function RadioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Radio") {
    return null;
  }

  const settings: RadioSettings =
    (selectedElement as RadioElement).settings ?? {};

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const updateSetting = (name: keyof RadioSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  return (
    <ChoiceConfigurationShell
      idPrefix="radio"
      accordionValue="radio-settings"
      title="Radio Settings"
      icon={<Circle className="h-3.5 w-3.5" />}
      stateIcon={<CircleDot />}
      settings={settings}
      onFieldChange={handleChange}
      onSettingChange={updateSetting}
      nameHint="The name attribute for the radio button. Radio buttons with the same name form a mutually exclusive group — only one can be selected at a time."
      namePlaceholder="groupName"
      valueHint="The value submitted with the form when this radio button is selected. Each radio in a group should have a unique value."
      valuePlaceholder="option-1"
      labelHint="Visible label text displayed next to the radio button. Clicking the label also selects the radio."
      labelPlaceholder="Option label"
      defaultCheckedLabel="Default selected"
      defaultCheckedHint="Whether this radio button is initially selected when the page loads. Only one radio in a group should be default-selected."
      requiredHint="At least one radio button in the group must be selected for the form to be submitted."
      disabledHint="Prevents all interaction and dims the radio button. The value is NOT submitted with the form."
      afterNameField={
        settings.name ? (
          <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
            <CircleDot className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50 leading-tight">
              Group: &ldquo;{settings.name}&rdquo; — all radios with this name share a group
            </span>
          </div>
        ) : null
      }
      stateSummary={
        <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
          {settings.defaultChecked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <CircleDot className="h-2.5 w-2.5" />
              selected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Circle className="h-2.5 w-2.5" />
              unselected
            </span>
          )}
        </div>
      }
      afterStateSummary={
        settings.defaultChecked ? (
          <div className="flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150">
            <CircleDot className="h-3 w-3 text-amber-500/60" />
            <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
              Ensure only one radio in the &ldquo;{settings.name || "unnamed"}&rdquo; group is default-selected
            </span>
          </div>
        ) : null
      }
    />
  );
}
