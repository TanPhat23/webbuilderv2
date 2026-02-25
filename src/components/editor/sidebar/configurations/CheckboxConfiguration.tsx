"use client";

import React, { ChangeEvent } from "react";
import { Accordion } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  CheckboxElement,
  CheckboxSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import ValidationConfiguration from "./ValidationConfiguration";
import {
  CheckSquare,
  Settings2,
  ShieldCheck,
  Lock,
  Tag,
  MinusSquare,
} from "lucide-react";

/* ─── Main Component ─── */

export default function CheckboxConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Checkbox") {
    return null;
  }

  const settings: CheckboxSettings =
    (selectedElement as CheckboxElement).settings ?? {};

  /* ─── Handlers ─── */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const updateSetting = (name: keyof CheckboxSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  return (
    <AccordionItem value="checkbox-settings" className="border-border/40">
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
            <CheckSquare className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Checkbox Settings</span>
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
              htmlFor="checkbox-name"
              hint="The name attribute for the checkbox. Used as the key when the form is submitted."
            >
              <Input
                id="checkbox-name"
                name="name"
                type="text"
                value={settings.name || ""}
                onChange={handleChange}
                placeholder="fieldName"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Value */}
            <ConfigField
              label="Value"
              htmlFor="checkbox-value"
              hint="The value submitted with the form when the checkbox is checked. Defaults to 'on' if not set."
            >
              <Input
                id="checkbox-value"
                name="value"
                type="text"
                value={settings.value || ""}
                onChange={handleChange}
                placeholder="on"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <SectionDivider />

            {/* Label */}
            <ConfigField
              label="Label text"
              htmlFor="checkbox-label"
              hint="Visible label text displayed next to the checkbox. Clicking the label also toggles the checkbox."
            >
              <Input
                id="checkbox-label"
                name="label"
                type="text"
                value={settings.label || ""}
                onChange={handleChange}
                placeholder="Accept terms"
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
            icon={<CheckSquare />}
            nested
          >
            {/* Default Checked */}
            <ConfigField
              label="Default checked"
              htmlFor="checkbox-defaultChecked"
              hint="Whether the checkbox is initially checked when the page loads."
            >
              <Switch
                id="checkbox-defaultChecked"
                checked={!!settings.defaultChecked}
                onCheckedChange={(checked) =>
                  updateSetting("defaultChecked", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Indeterminate */}
            <ConfigField
              label="Indeterminate"
              htmlFor="checkbox-indeterminate"
              hint="Show the checkbox in an indeterminate (mixed) state. Typically used for 'select all' checkboxes where only some children are checked."
            >
              <Switch
                id="checkbox-indeterminate"
                checked={!!settings.indeterminate}
                onCheckedChange={(checked) =>
                  updateSetting("indeterminate", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* State summary */}
            <SectionDivider />
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
              htmlFor="checkbox-required"
              hint="The checkbox must be checked for the form to be submitted. Commonly used for terms & conditions."
            >
              <Switch
                id="checkbox-required"
                checked={!!settings.required}
                onCheckedChange={(checked) =>
                  updateSetting("required", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Disabled */}
            <ConfigField
              label="Disabled"
              htmlFor="checkbox-disabled"
              hint="Prevents all interaction and dims the checkbox. The value is NOT submitted with the form."
            >
              <Switch
                id="checkbox-disabled"
                checked={!!settings.disabled}
                onCheckedChange={(checked) =>
                  updateSetting("disabled", !!checked)
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
