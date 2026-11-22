import type { ComponentProps } from "react";
import { Keyboard, ShieldCheck } from "lucide-react";
import ValidationConfiguration from "../ValidationConfiguration";
import { AccordionSection } from "./AccordionSection";
import { ConfigTextInput } from "./ConfigInputs";
import { ConfigPanel } from "./ConfigPanel";

type NamedFieldConfigPanelProps = Omit<ComponentProps<typeof ConfigPanel>, "trailing"> & {
  name?: string;
};

export function NamedFieldConfigPanel({ name, ...panel }: NamedFieldConfigPanelProps) {
  return (
    <ConfigPanel
      {...panel}
      trailing={name && (
        <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
          {name}
        </span>
      )}
    />
  );
}

interface FieldNameSettingProps {
  id: string;
  hint: string;
  value?: string;
  onValueChange: (value: string) => void;
}

export function FieldNameSetting({ id, hint, value, onValueChange }: FieldNameSettingProps) {
  return (
    <ConfigTextInput
      id={id}
      label="Name"
      hint={hint}
      name="name"
      value={value || ""}
      onValueChange={onValueChange}
      placeholder="fieldName"
      className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
    />
  );
}

export function FieldValidationSection() {
  return (
    <AccordionSection value="validation" title="Validation Rules" icon={<ShieldCheck />} nested>
      <ValidationConfiguration />
    </AccordionSection>
  );
}

interface AutocompleteSettingProps {
  id: string;
  hint: string;
  value: string;
  onValueChange: (value: string) => void;
}

export function AutocompleteSetting({ id, hint, value, onValueChange }: AutocompleteSettingProps) {
  return (
    <>
      <ConfigTextInput
        id={id}
        label="Autocomplete"
        hint={hint}
        name="autoComplete"
        value={value}
        onValueChange={onValueChange}
        placeholder="on / off"
        className="h-7 w-full max-w-[120px] px-2 text-[11px] font-mono rounded-md"
      />
      <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
        <Keyboard className="h-3 w-3 text-muted-foreground/40" />
        <span className="text-[10px] text-muted-foreground/50 leading-tight">
          {value === "off"
            ? "Browser autocomplete disabled"
            : value
              ? `Autocomplete hint: "${value}"`
              : "Using browser default autocomplete"}
        </span>
      </div>
    </>
  );
}
