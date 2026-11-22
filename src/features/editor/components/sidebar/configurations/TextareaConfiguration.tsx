import { Accordion } from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfigNumberInput, ConfigSwitch, ConfigTextInput } from "./_shared/ConfigInputs";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { TextareaElement, TextareaSettings } from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  looseSettingUpdater,
  SectionDivider,
} from "./_shared";
import { AutocompleteSetting, FieldNameSetting, FieldValidationSection, NamedFieldConfigPanel } from "./_shared/TextControlSections";
import {
  AlignLeft,
  Settings2,
  Lock,
  Keyboard,
  Hash,
  Maximize2,
  WrapText,
  SpellCheck,
} from "lucide-react";

const WRAP_OPTIONS = [
  {
    value: "soft",
    label: "Soft",
    description: "Wraps visually, no newlines added on submit",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Inserts newlines at wrap points on submit (requires cols)",
  },
  {
    value: "off",
    label: "Off",
    description: "No wrapping — horizontal scrollbar instead",
  },
] as const;

const RESIZE_OPTIONS = [
  { value: "both", label: "Both", description: "Resize in any direction" },
  {
    value: "vertical",
    label: "Vertical",
    description: "Resize vertically only",
  },
  {
    value: "horizontal",
    label: "Horizontal",
    description: "Resize horizontally only",
  },
  { value: "none", label: "None", description: "Disable resizing" },
] as const;

export default function TextareaConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Textarea") {
    return null;
  }

  const settings: TextareaSettings =
    (selectedElement as TextareaElement).settings ?? {};

  const updateSetting = looseSettingUpdater(
    updateElement,
    selectedElement.id,
    settings,
  );

  const handleNumberInput = (
    name: "rows" | "cols" | "minLength" | "maxLength",
    raw: string,
  ) => {
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  return (
    <NamedFieldConfigPanel
      value="textarea-settings"
      icon={<AlignLeft className="h-3.5 w-3.5" />}
      title="Textarea Settings"
      name={settings.name}
    >
      <Accordion
        type="multiple"
        defaultValue={["general", "validation", "dimensions", "behavior"]}
        className="w-full"
      >
        <AccordionSection
          value="general"
          title="General"
          icon={<Settings2 />}
          nested
        >
          <FieldNameSetting
            id="textarea-name"
            value={settings.name}
            hint="The name attribute for the textarea. Used as the key when the form is submitted."
            onValueChange={(value) => updateSetting("name", value)}
          />

          <SectionDivider />

          <ConfigTextInput
            label="Placeholder"
            hint="Ghost text shown inside the textarea when it's empty. Helps guide the user on what to enter."
            id="textarea-placeholder"
            name="placeholder"
            value={settings.placeholder || ""}
            onValueChange={(value) => updateSetting("placeholder", value)}
            placeholder="Enter text..."
          />

          <ConfigTextInput
            label="Default value"
            hint="Pre-filled text in the textarea. The user can change it."
            vertical
            id="textarea-defaultValue"
            name="defaultValue"
            value={settings.defaultValue ?? ""}
            onValueChange={(value) => updateSetting("defaultValue", value)}
            placeholder="None"
            className="h-7 w-full px-2 text-[11px] rounded-md"
          />
        </AccordionSection>

        <AccordionSection
          value="dimensions"
          title="Dimensions"
          icon={<Maximize2 />}
          nested
        >
          <ConfigNumberInput
            label="Rows"
            hint="Number of visible text lines. Controls the initial height of the textarea."
            id="textarea-rows"
            value={settings.rows}
            onValueChange={(value) => handleNumberInput("rows", value)}
            placeholder="4"
            min={1}
            max={100}
            compact
          />

          <ConfigNumberInput
            label="Cols"
            hint="Number of visible character columns. Controls the initial width of the textarea."
            id="textarea-cols"
            value={settings.cols}
            onValueChange={(value) => handleNumberInput("cols", value)}
            placeholder="20"
            min={1}
            max={200}
            compact
          />

          {/* Dimensions summary */}
          {(settings.rows || settings.cols) && (
            <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
              <Hash className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 font-mono">
                {settings.rows ?? "auto"} rows × {settings.cols ?? "auto"}{" "}
                cols
              </span>
            </div>
          )}

          <SectionDivider />

          <ConfigField
            label="Resize"
            htmlFor="textarea-resize"
            hint="Controls whether the user can resize the textarea by dragging the corner handle."
          >
            <Select
              value={settings.resize ?? "both"}
              onValueChange={(value) => updateSetting("resize", value)}
            >
              <SelectTrigger
                id="textarea-resize"
                className="h-7 w-[100px] px-2 text-[11px] rounded-md"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESIZE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigField>

          {/* Resize info */}
          <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
            <Maximize2 className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">
              {
                RESIZE_OPTIONS.find(
                  (o) => o.value === (settings.resize ?? "both"),
                )?.description
              }
            </span>
          </div>
        </AccordionSection>

        <FieldValidationSection />

        <AccordionSection
          value="constraints"
          title="Constraints"
          icon={<Lock />}
          nested
        >
          <ConfigSwitch
            label="Required"
            hint="Make this field mandatory for form submission."
            id="textarea-required"
            checked={!!settings.required}
            onCheckedChange={(checked) => updateSetting("required", checked)}
          />

          <ConfigSwitch
            label="Read only"
            hint="User can see and select the text but cannot edit it. The value is still submitted with the form."
            id="textarea-readOnly"
            checked={!!settings.readOnly}
            onCheckedChange={(checked) => updateSetting("readOnly", checked)}
          />

          <ConfigSwitch
            label="Disabled"
            hint="Prevents all interaction and dims the textarea. The value is NOT submitted with the form."
            id="textarea-disabled"
            checked={!!settings.disabled}
            onCheckedChange={(checked) => updateSetting("disabled", checked)}
          />

          <SectionDivider />

          <ConfigSection
            title="Character Limits"
            icon={<Hash className="h-3 w-3" />}
          >
            <ConfigNumberInput
              label="Min length"
              hint="Minimum number of characters required."
              id="textarea-minLength"
              value={settings.minLength}
              onValueChange={(value) => handleNumberInput("minLength", value)}
              placeholder="0"
              min={0}
            />

            <ConfigNumberInput
              label="Max length"
              hint="Maximum number of characters allowed. The browser will prevent typing beyond this limit."
              id="textarea-maxLength"
              value={settings.maxLength}
              onValueChange={(value) => handleNumberInput("maxLength", value)}
              placeholder="∞"
              min={0}
            />

            {/* Character limits summary */}
            {(settings.minLength !== undefined ||
              settings.maxLength !== undefined) && (
              <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                <Hash className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {settings.minLength !== undefined
                    ? settings.minLength
                    : "0"}
                  {" → "}
                  {settings.maxLength !== undefined
                    ? `${settings.maxLength} chars`
                    : "∞"}
                </span>
              </div>
            )}
          </ConfigSection>
        </AccordionSection>

        <AccordionSection
          value="behavior"
          title="Behavior"
          icon={<Keyboard />}
          nested
        >
          <ConfigField
            label="Wrap"
            htmlFor="textarea-wrap"
            hint="Controls how text wrapping is handled when the form is submitted."
          >
            <Select
              value={settings.wrap ?? "soft"}
              onValueChange={(value) => updateSetting("wrap", value)}
            >
              <SelectTrigger
                id="textarea-wrap"
                className="h-7 w-[100px] px-2 text-[11px] rounded-md"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WRAP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ConfigField>

          {/* Wrap info */}
          <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
            <WrapText className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">
              {
                WRAP_OPTIONS.find(
                  (o) => o.value === (settings.wrap ?? "soft"),
                )?.description
              }
            </span>
          </div>

          {settings.wrap === "hard" && !settings.cols && (
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Hash className="h-3 w-3 text-amber-500/60" />
              <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                Hard wrap requires a cols value to be set
              </span>
            </div>
          )}

          <SectionDivider />

          <ConfigSwitch
            label="Spell check"
            hint="Enable browser spell checking for the textarea content."
            id="textarea-spellCheck"
            checked={settings.spellCheck !== false}
            onCheckedChange={(checked) => updateSetting("spellCheck", checked)}
          />

          {/* Spell check indicator */}
          <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
            <SpellCheck className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">
              {settings.spellCheck !== false
                ? "Browser spell check enabled"
                : "Spell check disabled"}
            </span>
          </div>

          <SectionDivider />

          <AutocompleteSetting
            id="textarea-autoComplete"
            hint="Browser autocomplete hint. Common values: 'on', 'off'. Helps browsers pre-fill content."
            value={settings.autoComplete || ""}
            onValueChange={(value) => updateSetting("autoComplete", value)}
          />
        </AccordionSection>
      </Accordion>
    </NamedFieldConfigPanel>
  );
}
