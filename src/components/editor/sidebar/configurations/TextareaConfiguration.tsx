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
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  TextareaElement,
  TextareaSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import ValidationConfiguration from "./ValidationConfiguration";
import {
  AlignLeft,
  Settings2,
  ShieldCheck,
  Lock,
  Keyboard,
  Hash,
  Maximize2,
  WrapText,
  SpellCheck,
} from "lucide-react";

/* ─── Wrap Options ─── */

const WRAP_OPTIONS = [
  { value: "soft", label: "Soft", description: "Wraps visually, no newlines added on submit" },
  { value: "hard", label: "Hard", description: "Inserts newlines at wrap points on submit (requires cols)" },
  { value: "off", label: "Off", description: "No wrapping — horizontal scrollbar instead" },
] as const;

/* ─── Resize Options ─── */

const RESIZE_OPTIONS = [
  { value: "both", label: "Both", description: "Resize in any direction" },
  { value: "vertical", label: "Vertical", description: "Resize vertically only" },
  { value: "horizontal", label: "Horizontal", description: "Resize horizontally only" },
  { value: "none", label: "None", description: "Disable resizing" },
] as const;

/* ─── Main Component ─── */

export default function TextareaConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Textarea") {
    return null;
  }

  const settings: TextareaSettings =
    (selectedElement as TextareaElement).settings ?? {};

  /* ─── Handlers ─── */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const updateSetting = (name: keyof TextareaSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const handleNumberInput = (
    name: keyof TextareaSettings,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  return (
    <AccordionItem value="textarea-settings" className="border-border/40">
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
            <AlignLeft className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Textarea Settings</span>
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
          defaultValue={["general", "validation", "dimensions", "behavior"]}
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
              htmlFor="textarea-name"
              hint="The name attribute for the textarea. Used as the key when the form is submitted."
            >
              <Input
                id="textarea-name"
                name="name"
                type="text"
                value={settings.name || ""}
                onChange={handleChange}
                placeholder="fieldName"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <SectionDivider />

            {/* Placeholder */}
            <ConfigField
              label="Placeholder"
              htmlFor="textarea-placeholder"
              hint="Ghost text shown inside the textarea when it's empty. Helps guide the user on what to enter."
            >
              <Input
                id="textarea-placeholder"
                name="placeholder"
                type="text"
                value={settings.placeholder || ""}
                onChange={handleChange}
                placeholder="Enter text..."
                className="h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Default Value */}
            <ConfigField
              label="Default value"
              htmlFor="textarea-defaultValue"
              hint="Pre-filled text in the textarea. The user can change it."
              vertical
            >
              <Input
                id="textarea-defaultValue"
                name="defaultValue"
                type="text"
                value={settings.defaultValue ?? ""}
                onChange={handleChange}
                placeholder="None"
                className="h-7 w-full px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>
          </AccordionSection>

          {/* ── Dimensions ── */}
          <AccordionSection
            value="dimensions"
            title="Dimensions"
            icon={<Maximize2 />}
            nested
          >
            {/* Rows */}
            <ConfigField
              label="Rows"
              htmlFor="textarea-rows"
              hint="Number of visible text lines. Controls the initial height of the textarea."
            >
              <Input
                id="textarea-rows"
                type="number"
                value={settings.rows ?? ""}
                onChange={(e) => handleNumberInput("rows", e)}
                placeholder="4"
                min={1}
                max={100}
                className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
              />
            </ConfigField>

            {/* Cols */}
            <ConfigField
              label="Cols"
              htmlFor="textarea-cols"
              hint="Number of visible character columns. Controls the initial width of the textarea."
            >
              <Input
                id="textarea-cols"
                type="number"
                value={settings.cols ?? ""}
                onChange={(e) => handleNumberInput("cols", e)}
                placeholder="20"
                min={1}
                max={200}
                className="h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
              />
            </ConfigField>

            {/* Dimensions summary */}
            {(settings.rows || settings.cols) && (
              <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                <Hash className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 font-mono">
                  {settings.rows ?? "auto"} rows × {settings.cols ?? "auto"} cols
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Resize */}
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
              htmlFor="textarea-required"
              hint="Make this field mandatory for form submission."
            >
              <Switch
                id="textarea-required"
                checked={!!settings.required}
                onCheckedChange={(checked) =>
                  updateSetting("required", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Read Only */}
            <ConfigField
              label="Read only"
              htmlFor="textarea-readOnly"
              hint="User can see and select the text but cannot edit it. The value is still submitted with the form."
            >
              <Switch
                id="textarea-readOnly"
                checked={!!settings.readOnly}
                onCheckedChange={(checked) =>
                  updateSetting("readOnly", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Disabled */}
            <ConfigField
              label="Disabled"
              htmlFor="textarea-disabled"
              hint="Prevents all interaction and dims the textarea. The value is NOT submitted with the form."
            >
              <Switch
                id="textarea-disabled"
                checked={!!settings.disabled}
                onCheckedChange={(checked) =>
                  updateSetting("disabled", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            <SectionDivider />

            <ConfigSection
              title="Character Limits"
              icon={<Hash className="h-3 w-3" />}
            >
              {/* Min Length */}
              <ConfigField
                label="Min length"
                htmlFor="textarea-minLength"
                hint="Minimum number of characters required."
              >
                <Input
                  id="textarea-minLength"
                  type="number"
                  value={settings.minLength ?? ""}
                  onChange={(e) => handleNumberInput("minLength", e)}
                  placeholder="0"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
              </ConfigField>

              {/* Max Length */}
              <ConfigField
                label="Max length"
                htmlFor="textarea-maxLength"
                hint="Maximum number of characters allowed. The browser will prevent typing beyond this limit."
              >
                <Input
                  id="textarea-maxLength"
                  type="number"
                  value={settings.maxLength ?? ""}
                  onChange={(e) => handleNumberInput("maxLength", e)}
                  placeholder="∞"
                  min={0}
                  className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                />
              </ConfigField>

              {/* Character limits summary */}
              {(settings.minLength !== undefined ||
                settings.maxLength !== undefined) && (
                <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
                  <Hash className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] text-muted-foreground/50 font-mono">
                    {settings.minLength !== undefined ? settings.minLength : "0"}
                    {" → "}
                    {settings.maxLength !== undefined
                      ? `${settings.maxLength} chars`
                      : "∞"}
                  </span>
                </div>
              )}
            </ConfigSection>
          </AccordionSection>

          {/* ── Behavior ── */}
          <AccordionSection
            value="behavior"
            title="Behavior"
            icon={<Keyboard />}
            nested
          >
            {/* Wrap */}
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

            {/* Spell Check */}
            <ConfigField
              label="Spell check"
              htmlFor="textarea-spellCheck"
              hint="Enable browser spell checking for the textarea content."
            >
              <Switch
                id="textarea-spellCheck"
                checked={settings.spellCheck !== false}
                onCheckedChange={(checked) =>
                  updateSetting("spellCheck", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

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

            {/* Autocomplete */}
            <ConfigField
              label="Autocomplete"
              htmlFor="textarea-autoComplete"
              hint="Browser autocomplete hint. Common values: 'on', 'off'. Helps browsers pre-fill content."
            >
              <Input
                id="textarea-autoComplete"
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
