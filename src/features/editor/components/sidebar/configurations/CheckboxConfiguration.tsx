import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import {
  CheckboxElement,
  CheckboxSettings,
} from "@/features/editor";
import { looseSettingUpdater } from "./_shared";
import { ChoiceConfigurationShell } from "./_shared/ChoiceConfigurationSection";
import { ConfigSwitch } from "./_shared/ConfigInputs";
import {
  CheckSquare,
  MinusSquare,
} from "lucide-react";

export default function CheckboxConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Checkbox") {
    return null;
  }

  const settings: CheckboxSettings =
    (selectedElement as CheckboxElement).settings ?? {};

  const updateSetting = looseSettingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  return (
    <ChoiceConfigurationShell
      idPrefix="checkbox"
      accordionValue="checkbox-settings"
      title="Checkbox Settings"
      icon={<CheckSquare className="h-3.5 w-3.5" />}
      stateIcon={<CheckSquare />}
      settings={settings}
      onSettingChange={updateSetting}
      nameHint="The name attribute for the checkbox. Used as the key when the form is submitted."
      namePlaceholder="fieldName"
      valueHint="The value submitted with the form when the checkbox is checked. Defaults to 'on' if not set."
      valuePlaceholder="on"
      labelHint="Visible label text displayed next to the checkbox. Clicking the label also toggles the checkbox."
      labelPlaceholder="Accept terms"
      defaultCheckedLabel="Default checked"
      defaultCheckedHint="Whether the checkbox is initially checked when the page loads."
      requiredHint="The checkbox must be checked for the form to be submitted. Commonly used for terms & conditions."
      disabledHint="Prevents all interaction and dims the checkbox. The value is NOT submitted with the form."
      extraStateFields={
        <ConfigSwitch
          label="Indeterminate"
          id="checkbox-indeterminate"
          hint="Show the checkbox in an indeterminate (mixed) state. Typically used for 'select all' checkboxes where only some children are checked."
          checked={!!settings.indeterminate}
          onCheckedChange={(checked) => updateSetting("indeterminate", checked)}
        />
      }
      stateSummary={
        <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
          {settings.defaultChecked && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              <CheckSquare className="h-2.5 w-2.5" />
              checked
            </span>
          )}
          {settings.indeterminate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono text-amber-600 dark:text-amber-400">
              <MinusSquare className="h-2.5 w-2.5" />
              indeterminate
            </span>
          )}
          {!settings.defaultChecked && !settings.indeterminate && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              unchecked
            </span>
          )}
        </div>
      }
    />
  );
}
