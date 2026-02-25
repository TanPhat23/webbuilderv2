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
  RadioElement,
  RadioSettings,
} from "@/interfaces/elements.interface";
import {
  AccordionSection,
  ConfigField,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import ValidationConfiguration from "./ValidationConfiguration";
import {
  Circle,
  Settings2,
  ShieldCheck,
  Lock,
  Tag,
  CircleDot,
} from "lucide-react";

/* ─── Main Component ─── */

export default function RadioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Radio") {
    return null;
  }

  const settings: RadioSettings =
    (selectedElement as RadioElement).settings ?? {};

  /* ─── Handlers ─── */

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
    <AccordionItem value="radio-settings" className="border-border/40">
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
            <Circle className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Radio Settings</span>
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
              htmlFor="radio-name"
              hint="The name attribute for the radio button. Radio buttons with the same name form a mutually exclusive group — only one can be selected at a time."
            >
              <Input
                id="radio-name"
                name="name"
                type="text"
                value={settings.name || ""}
                onChange={handleChange}
                placeholder="groupName"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Group name hint */}
            {settings.name && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <CircleDot className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50 leading-tight">
                  Group: &ldquo;{settings.name}&rdquo; — all radios with this
                  name share a group
                </span>
              </div>
            )}

            <SectionDivider />

            {/* Value */}
            <ConfigField
              label="Value"
              htmlFor="radio-value"
              hint="The value submitted with the form when this radio button is selected. Each radio in a group should have a unique value."
            >
              <Input
                id="radio-value"
                name="value"
                type="text"
                value={settings.value || ""}
                onChange={handleChange}
                placeholder="option-1"
                className="h-7 w-full max-w-[140px] px-2 text-[11px] font-mono rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            <SectionDivider />

            {/* Label */}
            <ConfigField
              label="Label text"
              htmlFor="radio-label"
              hint="Visible label text displayed next to the radio button. Clicking the label also selects the radio."
            >
              <Input
                id="radio-label"
                name="label"
                type="text"
                value={settings.label || ""}
                onChange={handleChange}
                placeholder="Option label"
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
            icon={<CircleDot />}
            nested
          >
            {/* Default Checked */}
            <ConfigField
              label="Default selected"
              htmlFor="radio-defaultChecked"
              hint="Whether this radio button is initially selected when the page loads. Only one radio in a group should be default-selected."
            >
              <Switch
                id="radio-defaultChecked"
                checked={!!settings.defaultChecked}
                onCheckedChange={(checked) =>
                  updateSetting("defaultChecked", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* State summary */}
            <SectionDivider />
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

            {/* Multiple default hint */}
            {settings.defaultChecked && (
              <div className="flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150">
                <CircleDot className="h-3 w-3 text-amber-500/60" />
                <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                  Ensure only one radio in the &ldquo;{settings.name || "unnamed"}&rdquo; group
                  is default-selected
                </span>
              </div>
            )}
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
              htmlFor="radio-required"
              hint="At least one radio button in the group must be selected for the form to be submitted."
            >
              <Switch
                id="radio-required"
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
              htmlFor="radio-disabled"
              hint="Prevents all interaction and dims the radio button. The value is NOT submitted with the form."
            >
              <Switch
                id="radio-disabled"
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
