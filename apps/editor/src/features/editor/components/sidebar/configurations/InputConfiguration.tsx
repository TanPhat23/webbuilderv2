import type { ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";
import { ConfigNumberInput, ConfigSelectInput, ConfigSwitch, ConfigTextInput } from "./_shared/ConfigInputs";
import { useSelectedElement, useUpdateElement, type InputSettings } from "@/features/editor";
import {
  AccordionSection,
  ConfigSection,
  looseSettingUpdater,
  SectionDivider,
} from "./_shared";
import { AutocompleteSetting, FieldNameSetting, FieldValidationSection, NamedFieldConfigPanel } from "./_shared/TextControlSections";
import {
  TextCursorInput,
  Settings2,
  Lock,
  Type,
  Hash,
  AtSign,
  KeyRound,
  Phone,
  Globe,
  Keyboard,
} from "lucide-react";

interface InputTypeOption {
  value: NonNullable<InputSettings["type"]>;
  label: string;
  icon: ReactNode;
  description?: string;
}

const INPUT_TYPE_OPTIONS: InputTypeOption[] = [
  { value: "text", label: "Text", icon: <Type className="h-3 w-3" /> },
  {
    value: "email",
    label: "Email",
    icon: <AtSign className="h-3 w-3" />,
    description: "email keyboard on mobile",
  },
  {
    value: "password",
    label: "Password",
    icon: <KeyRound className="h-3 w-3" />,
    description: "characters hidden",
  },
  {
    value: "number",
    label: "Number",
    icon: <Hash className="h-3 w-3" />,
    description: "numeric keyboard on mobile",
  },
  {
    value: "tel",
    label: "Tel",
    icon: <Phone className="h-3 w-3" />,
    description: "phone keyboard on mobile",
  },
  {
    value: "url",
    label: "URL",
    icon: <Globe className="h-3 w-3" />,
    description: "URL keyboard on mobile",
  },
];

const NUMBER_CONSTRAINTS = [
  { key: "min", label: "Min", hint: "Minimum allowed numeric value.", placeholder: "0" },
  { key: "max", label: "Max", hint: "Maximum allowed numeric value.", placeholder: "100" },
  {
    key: "step",
    label: "Step",
    hint: "Increment step for the number input. Determines the granularity of valid values.",
    placeholder: "1",
  },
] as const;

function InputTypeField({
  value,
  onValueChange,
}: {
  value: InputSettings["type"];
  onValueChange: (value: string) => void;
}) {
  const currentType = INPUT_TYPE_OPTIONS.find((option) => option.value === value) ?? INPUT_TYPE_OPTIONS[0];

  return (
    <>
      <ConfigSelectInput
        id="input-type"
        label="Type"
        hint="The input type determines validation behavior and the keyboard layout shown on mobile devices."
        value={value || "text"}
        onValueChange={onValueChange}
        options={INPUT_TYPE_OPTIONS}
      />

      <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
        <span className="text-muted-foreground/40">
          {currentType.icon}
        </span>
        <span className="text-[10px] text-muted-foreground/50">
          {currentType.label} input
          {currentType.description && ` — ${currentType.description}`}
        </span>
      </div>
    </>
  );
}

type NumberConstraint = (typeof NUMBER_CONSTRAINTS)[number]["key"];
type NumberSettings = Pick<InputSettings, NumberConstraint>;

function InputRangeSummary({ min, max, step }: NumberSettings) {
  if (min === undefined && max === undefined) return null;

  return (
    <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
      <Hash className="h-3 w-3 text-muted-foreground/40" />
      <span className="text-[10px] text-muted-foreground/50 font-mono">
        {min === undefined ? "−∞" : min}
        {" → "}
        {max === undefined ? "+∞" : max}
        {step ? ` (step: ${step})` : ""}
      </span>
    </div>
  );
}

function InputNumberConstraints({
  settings,
  updateSetting,
}: {
  settings: NumberSettings;
  updateSetting: (key: NumberConstraint, value: number | undefined) => void;
}) {
  return (
    <>
      <SectionDivider />
      <ConfigSection title="Number Constraints" icon={<Hash className="h-3 w-3" />}>
        {NUMBER_CONSTRAINTS.map(({ key, label, hint, placeholder }) => (
          <ConfigNumberInput
            key={key}
            id={`input-${key}`}
            label={label}
            hint={hint}
            value={settings[key]}
            onValueChange={(value) => updateSetting(key, value ? Number(value) : undefined)}
            placeholder={placeholder}
          />
        ))}
        <InputRangeSummary min={settings.min} max={settings.max} step={settings.step} />
      </ConfigSection>
    </>
  );
}

export default function InputConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (selectedElement?.type !== "Input") {
    return null;
  }

  const settings = selectedElement.settings ?? {};

  const updateSetting = looseSettingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  return (
    <NamedFieldConfigPanel
      value="input-settings"
      icon={<TextCursorInput className="h-3.5 w-3.5" />}
      title="Input Settings"
      name={settings.name}
    >
      <Accordion
        type="multiple"
        defaultValue={["general", "validation", "constraints"]}
        className="w-full"
      >
        {/* ── General ── */}
        <AccordionSection
          value="general"
          title="General"
          icon={<Settings2 />}
          nested
        >
          {/* Name */}
          <FieldNameSetting
            id="input-name"
            value={settings.name}
            hint="The name attribute for the input field. Used as the key when the form is submitted."
            onValueChange={(value) => updateSetting("name", value)}
          />

          <InputTypeField
            value={settings.type}
            onValueChange={(value) => updateSetting("type", value)}
          />

          <SectionDivider />

          {/* Placeholder */}
          <ConfigTextInput
            label="Placeholder"
            hint="Ghost text shown inside the input when it's empty. Helps guide the user on what to enter."
            id="input-placeholder"
            name="placeholder"
            value={settings.placeholder || ""}
            onValueChange={(value) => updateSetting("placeholder", value)}
            placeholder="Enter value..."
          />

          {/* Default Value */}
          <ConfigTextInput
            label="Default value"
            hint="Pre-filled value in the input field. The user can change it."
            id="input-defaultValue"
            name="defaultValue"
            value={settings.defaultValue ?? ""}
            onValueChange={(value) => updateSetting("defaultValue", value)}
            placeholder="None"
          />
        </AccordionSection>

        {/* ── Validation ── */}
        <FieldValidationSection />

        {/* ── Constraints ── */}
        <AccordionSection
          value="constraints"
          title="Constraints"
          icon={<Lock />}
          nested
        >
          {/* Required */}
          <ConfigSwitch
            label="Required"
            hint="Make this field mandatory for form submission."
            id="input-required"
            checked={!!settings.required}
            onCheckedChange={(checked) => updateSetting("required", checked)}
          />

          {/* Pattern */}
          <ConfigTextInput
            label="Pattern"
            hint="Regular expression pattern for native HTML validation. The input value must match this pattern."
            id="input-pattern"
            name="pattern"
            value={settings.pattern || ""}
            onValueChange={(value) => updateSetting("pattern", value)}
            placeholder="[A-Za-z]+"
            className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
          />

          {settings.type === "number" && (
            <InputNumberConstraints settings={settings} updateSetting={updateSetting} />
          )}
        </AccordionSection>

        {/* ── Advanced ── */}
        <AccordionSection
          value="advanced"
          title="Advanced"
          icon={<Keyboard />}
          nested
        >
          <AutocompleteSetting
            id="input-autoComplete"
            hint="Browser autocomplete hint. Common values: 'on', 'off', 'name', 'email', 'tel', 'address-line1', etc."
            value={settings.autoComplete || ""}
            onValueChange={(value) => updateSetting("autoComplete", value)}
          />
        </AccordionSection>
      </Accordion>
    </NamedFieldConfigPanel>
  );
}
