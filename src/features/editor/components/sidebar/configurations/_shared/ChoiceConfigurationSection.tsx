import React, { ChangeEvent, ReactNode } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AccordionSection,
  SectionDivider,
} from "./AccordionSection";
import { ConfigField } from "./ConfigField";
import ValidationConfiguration from "../ValidationConfiguration";
import { cn } from "@/lib/utils";
import {
  Settings2,
  ShieldCheck,
  Lock,
  Tag,
} from "lucide-react";

export interface ChoiceSettingsBase {
  name?: string;
  value?: string;
  label?: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface ChoiceDefaults {
  name: string;
  value: string;
  label: string;
  defaultChecked: boolean;
  disabled: boolean;
  required: boolean;
}

export function getChoiceConfigurationDefaults(
  settings?: ChoiceSettingsBase
): ChoiceDefaults {
  return {
    name: settings?.name ?? "",
    value: settings?.value ?? "",
    label: settings?.label ?? "",
    defaultChecked: Boolean(settings?.defaultChecked),
    disabled: Boolean(settings?.disabled),
    required: Boolean(settings?.required),
  };
}

export type ChoiceSettingKey = "defaultChecked" | "required" | "disabled";

export interface ChoiceConfigurationShellProps<T extends string = string> {
  idPrefix: "checkbox" | "radio";
  accordionValue: string;
  title: string;
  icon: ReactNode;
  stateIcon: ReactNode;
  settings: ChoiceSettingsBase;
  onFieldChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSettingChange: (name: T | ChoiceSettingKey, value: unknown) => void;
  nameHint: string;
  namePlaceholder: string;
  valueHint: string;
  valuePlaceholder: string;
  labelHint: string;
  labelPlaceholder: string;
  defaultCheckedLabel: string;
  defaultCheckedHint: string;
  requiredHint: string;
  disabledHint: string;
  afterNameField?: ReactNode;
  extraStateFields?: ReactNode;
  stateSummary?: ReactNode;
  afterStateSummary?: ReactNode;
}

export function ChoiceConfigurationShell<T extends string = string>({
  idPrefix,
  accordionValue,
  title,
  icon,
  stateIcon,
  settings,
  onFieldChange,
  onSettingChange,
  nameHint,
  namePlaceholder,
  valueHint,
  valuePlaceholder,
  labelHint,
  labelPlaceholder,
  defaultCheckedLabel,
  defaultCheckedHint,
  requiredHint,
  disabledHint,
  afterNameField,
  extraStateFields,
  stateSummary,
  afterStateSummary,
}: ChoiceConfigurationShellProps<T>) {
  return (
    <AccordionItem value={accordionValue} className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            {icon}
          </span>
          <span className="truncate">{title}</span>
          {settings.name && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                {settings.name}
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <Accordion
          type="multiple"
          defaultValue={["general", "state", "validation", "constraints"]}
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
            <ConfigField
              label="Name"
              htmlFor={`${idPrefix}-name`}
              hint={nameHint}
            >
              <Input
                id={`${idPrefix}-name`}
                name="name"
                type="text"
                value={settings.name || ""}
                onChange={onFieldChange}
                placeholder={namePlaceholder}
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {afterNameField}

            <SectionDivider />

            {/* Value */}
            <ConfigField
              label="Value"
              htmlFor={`${idPrefix}-value`}
              hint={valueHint}
            >
              <Input
                id={`${idPrefix}-value`}
                name="value"
                type="text"
                value={settings.value || ""}
                onChange={onFieldChange}
                placeholder={valuePlaceholder}
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <SectionDivider />

            {/* Label */}
            <ConfigField
              label="Label text"
              htmlFor={`${idPrefix}-label`}
              hint={labelHint}
            >
              <Input
                id={`${idPrefix}-label`}
                name="label"
                type="text"
                value={settings.label || ""}
                onChange={onFieldChange}
                placeholder={labelPlaceholder}
                className="h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Label preview */}
            {settings.label && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Tag className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  Label: &ldquo;{settings.label}&rdquo;
                </span>
              </div>
            )}
          </AccordionSection>

          {/* ── State ── */}
          <AccordionSection
            value="state"
            title="State"
            icon={stateIcon}
            nested
          >
            {/* Default Checked */}
            <ConfigField
              label={defaultCheckedLabel}
              htmlFor={`${idPrefix}-defaultChecked`}
              hint={defaultCheckedHint}
            >
              <Switch
                id={`${idPrefix}-defaultChecked`}
                checked={!!settings.defaultChecked}
                onCheckedChange={(checked) =>
                  onSettingChange("defaultChecked", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {extraStateFields}

            {/* State summary */}
            <SectionDivider />
            {stateSummary}
            {afterStateSummary}
          </AccordionSection>

          {/* ── Validation ── */}
          <AccordionSection
            value="validation"
            title="Validation Rules"
            icon={<ShieldCheck />}
            nested
          >
            <ValidationConfiguration />
          </AccordionSection>

          {/* ── Constraints ── */}
          <AccordionSection
            value="constraints"
            title="Constraints"
            icon={<Lock />}
            nested
          >
            {/* Required */}
            <ConfigField
              label="Required"
              htmlFor={`${idPrefix}-required`}
              hint={requiredHint}
            >
              <Switch
                id={`${idPrefix}-required`}
                checked={!!settings.required}
                onCheckedChange={(checked) =>
                  onSettingChange("required", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Disabled */}
            <ConfigField
              label="Disabled"
              htmlFor={`${idPrefix}-disabled`}
              hint={disabledHint}
            >
              <Switch
                id={`${idPrefix}-disabled`}
                checked={!!settings.disabled}
                onCheckedChange={(checked) =>
                  onSettingChange("disabled", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Constraint summary */}
            <SectionDivider />
            <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
              {settings.required && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-1.5 py-0.5 text-[10px] font-mono text-red-600 dark:text-red-400">
                  required
                </span>
              )}
              {settings.disabled && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  disabled
                </span>
              )}
              {!settings.required && !settings.disabled && (
                <div className="flex items-center gap-1.5">
                  <Lock className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/50">
                    No constraints applied
                  </span>
                </div>
              )}
            </div>
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}

export default ChoiceConfigurationShell;
