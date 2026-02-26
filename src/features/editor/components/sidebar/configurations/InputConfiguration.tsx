"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import { InputElement, InputSettings } from "@/features/editor";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import ValidationConfiguration from "./ValidationConfiguration";
import {
  TextCursorInput,
  Settings2,
  ShieldCheck,
  Lock,
  Type,
  Hash,
  AtSign,
  KeyRound,
  Phone,
  Globe,
  Keyboard,
} from "lucide-react";

/* ─── Input Type Options ─── */

interface InputTypeOption {
  value: string;
  label: string;
  icon: React.ReactNode;
}

const INPUT_TYPE_OPTIONS: InputTypeOption[] = [
  { value: "text", label: "Text", icon: <Type className="h-3 w-3" /> },
  { value: "email", label: "Email", icon: <AtSign className="h-3 w-3" /> },
  {
    value: "password",
    label: "Password",
    icon: <KeyRound className="h-3 w-3" />,
  },
  { value: "number", label: "Number", icon: <Hash className="h-3 w-3" /> },
  { value: "tel", label: "Tel", icon: <Phone className="h-3 w-3" /> },
  { value: "url", label: "URL", icon: <Globe className="h-3 w-3" /> },
];

/* ─── Main Component ─── */

export default function InputConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Input") {
    return null;
  }

  const settings: InputSettings =
    (selectedElement as InputElement).settings ?? {};

  /* ─── Handlers ─── */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const updateSetting = (name: keyof InputSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  /* ─── Derived State ─── */

  const isNumberType = settings.type === "number";
  const currentType =
    INPUT_TYPE_OPTIONS.find((opt) => opt.value === settings.type) ??
    INPUT_TYPE_OPTIONS[0];

  return (
    <AccordionItem value="input-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <TextCursorInput className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Input Settings</span>
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
            <ConfigField
              label="Name"
              htmlFor="input-name"
              hint="The name attribute for the input field. Used as the key when the form is submitted."
            >
              <Input
                id="input-name"
                name="name"
                type="text"
                value={settings.name || ""}
                onChange={handleChange}
                placeholder="fieldName"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Type */}
            <ConfigField
              label="Type"
              htmlFor="input-type"
              hint="The input type determines validation behavior and the keyboard layout shown on mobile devices."
            >
              <Select
                value={settings.type || "text"}
                onValueChange={(value) => updateSetting("type", value)}
              >
                <SelectTrigger
                  id="input-type"
                  className="h-7 w-[120px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INPUT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {opt.icon}
                        </span>
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Type indicator */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <span className="text-muted-foreground/40">
                {currentType.icon}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                {currentType.label} input
                {isNumberType && " — numeric keyboard on mobile"}
                {settings.type === "email" && " — email keyboard on mobile"}
                {settings.type === "tel" && " — phone keyboard on mobile"}
                {settings.type === "url" && " — URL keyboard on mobile"}
                {settings.type === "password" && " — characters hidden"}
              </span>
            </div>

            <SectionDivider />

            {/* Placeholder */}
            <ConfigField
              label="Placeholder"
              htmlFor="input-placeholder"
              hint="Ghost text shown inside the input when it's empty. Helps guide the user on what to enter."
            >
              <Input
                id="input-placeholder"
                name="placeholder"
                type="text"
                value={settings.placeholder || ""}
                onChange={handleChange}
                placeholder="Enter value..."
                className="h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Default Value */}
            <ConfigField
              label="Default value"
              htmlFor="input-defaultValue"
              hint="Pre-filled value in the input field. The user can change it."
            >
              <Input
                id="input-defaultValue"
                name="defaultValue"
                type="text"
                value={settings.defaultValue ?? ""}
                onChange={handleChange}
                placeholder="None"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>
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
              htmlFor="input-required"
              hint="Make this field mandatory for form submission."
            >
              <Switch
                id="input-required"
                checked={!!settings.required}
                onCheckedChange={(checked) =>
                  updateSetting("required", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Pattern */}
            <ConfigField
              label="Pattern"
              htmlFor="input-pattern"
              hint="Regular expression pattern for native HTML validation. The input value must match this pattern."
            >
              <Input
                id="input-pattern"
                name="pattern"
                type="text"
                value={settings.pattern || ""}
                onChange={handleChange}
                placeholder="[A-Za-z]+"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Number-specific constraints */}
            {isNumberType && (
              <>
                <SectionDivider />

                <ConfigSection
                  title="Number Constraints"
                  icon={<Hash className="h-3 w-3" />}
                >
                  {/* Min */}
                  <ConfigField
                    label="Min"
                    htmlFor="input-min"
                    hint="Minimum allowed numeric value."
                  >
                    <Input
                      id="input-min"
                      type="number"
                      value={settings.min ?? ""}
                      onChange={(e) =>
                        updateSetting(
                          "min",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="0"
                      className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    />
                  </ConfigField>

                  {/* Max */}
                  <ConfigField
                    label="Max"
                    htmlFor="input-max"
                    hint="Maximum allowed numeric value."
                  >
                    <Input
                      id="input-max"
                      type="number"
                      value={settings.max ?? ""}
                      onChange={(e) =>
                        updateSetting(
                          "max",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="100"
                      className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    />
                  </ConfigField>

                  {/* Step */}
                  <ConfigField
                    label="Step"
                    htmlFor="input-step"
                    hint="Increment step for the number input. Determines the granularity of valid values."
                  >
                    <Input
                      id="input-step"
                      type="number"
                      value={settings.step ?? ""}
                      onChange={(e) =>
                        updateSetting(
                          "step",
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder="1"
                      className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    />
                  </ConfigField>

                  {/* Range summary */}
                  {(settings.min !== undefined ||
                    settings.max !== undefined) && (
                    <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                      <Hash className="h-3 w-3 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground/50 font-mono">
                        {settings.min !== undefined ? settings.min : "−∞"}
                        {" → "}
                        {settings.max !== undefined ? settings.max : "+∞"}
                        {settings.step ? ` (step: ${settings.step})` : ""}
                      </span>
                    </div>
                  )}
                </ConfigSection>
              </>
            )}
          </AccordionSection>

          {/* ── Advanced ── */}
          <AccordionSection
            value="advanced"
            title="Advanced"
            icon={<Keyboard />}
            nested
          >
            <ConfigField
              label="Autocomplete"
              htmlFor="input-autoComplete"
              hint="Browser autocomplete hint. Common values: 'on', 'off', 'name', 'email', 'tel', 'address-line1', etc."
            >
              <Input
                id="input-autoComplete"
                name="autoComplete"
                type="text"
                value={settings.autoComplete || ""}
                onChange={handleChange}
                placeholder="on / off"
                className="h-7 w-full max-w-[120px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Autocomplete hint */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <Keyboard className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {settings.autoComplete === "off"
                  ? "Browser autocomplete disabled"
                  : settings.autoComplete
                    ? `Autocomplete hint: "${settings.autoComplete}"`
                    : "Using browser default autocomplete"}
              </span>
            </div>
          </AccordionSection>
        </Accordion>
      </AccordionContent>
    </AccordionItem>
  );
}
