"use client";

import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/features/editor";
import { useSelectedElement } from "@/features/editor";
import {
  ProgressElement,
  ProgressSettings,
} from "@/features/editor";
import {
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Settings2,
  Tag,
  Percent,
  Loader,
} from "lucide-react";

/* ─── Main Component ─── */

export default function ProgressConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Progress") {
    return null;
  }

  const settings: ProgressSettings =
    (selectedElement as ProgressElement).settings ?? {};

  /* ─── Handlers ─── */

  const updateSetting = (name: keyof ProgressSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const handleNumberInput = (
    name: keyof ProgressSettings,
    e: ChangeEvent<HTMLInputElement>,
  ) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    updateSetting(name, isNaN(parsed) ? undefined : parsed);
  };

  const handleLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, label: e.target.value || undefined },
    });
  };

  /* ─── Derived State ─── */

  const currentValue = settings.value ?? 0;
  const maxValue = settings.max ?? 100;
  const isIndeterminate = !!settings.indeterminate;
  const percentage =
    maxValue > 0 && !isIndeterminate
      ? Math.min(100, Math.round((currentValue / maxValue) * 100))
      : 0;

  return (
    <AccordionItem value="progress-settings" className="border-border/40">
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
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Progress Settings</span>
          {!isIndeterminate && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground tabular-nums">
                {percentage}%
              </span>
            </span>
          )}
          {isIndeterminate && (
            <span className="ml-auto mr-1 shrink-0">
              <Loader className="h-3 w-3 text-muted-foreground/50 animate-spin" />
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Values ── */}
          <ConfigSection
            title="Values"
            icon={<Settings2 className="h-3 w-3" />}
          >
            {/* Indeterminate */}
            <ConfigField
              label="Indeterminate"
              htmlFor="progress-indeterminate"
              hint="Show an indeterminate (loading) state instead of a specific value. Useful when the completion percentage is unknown."
            >
              <Switch
                id="progress-indeterminate"
                checked={isIndeterminate}
                onCheckedChange={(checked) =>
                  updateSetting("indeterminate", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {isIndeterminate && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Loader className="h-3 w-3 text-muted-foreground/40 animate-spin" />
                <span className="text-[10px] text-muted-foreground/50">
                  Indeterminate — no specific value displayed
                </span>
              </div>
            )}

            {!isIndeterminate && (
              <>
                <SectionDivider />

                {/* Value */}
                <ConfigField
                  label="Value"
                  htmlFor="progress-value"
                  hint="The current progress value. Must be between 0 and the max value."
                >
                  <div className="flex items-center gap-1">
                    <Input
                      id="progress-value"
                      type="number"
                      value={settings.value ?? ""}
                      onChange={(e) => handleNumberInput("value", e)}
                      placeholder="0"
                      min={0}
                      max={maxValue}
                      step={1}
                      className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                    />
                    <span className="text-[10px] text-muted-foreground/60 font-medium select-none">
                      / {maxValue}
                    </span>
                  </div>
                </ConfigField>

                {/* Max */}
                <ConfigField
                  label="Max"
                  htmlFor="progress-max"
                  hint="The maximum value that represents 100% completion. Defaults to 100."
                >
                  <Input
                    id="progress-max"
                    type="number"
                    value={settings.max ?? ""}
                    onChange={(e) => handleNumberInput("max", e)}
                    placeholder="100"
                    min={0}
                    step={1}
                    className="h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                  />
                </ConfigField>

                {/* Visual progress bar */}
                <SectionDivider />

                <div className="flex flex-col gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Percent className="h-3 w-3 text-muted-foreground/40" />
                      <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
                        {currentValue} / {maxValue} ({percentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Mini progress preview */}
                  <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-300",
                        percentage >= 100
                          ? "bg-emerald-500"
                          : percentage >= 50
                            ? "bg-blue-500"
                            : percentage >= 25
                              ? "bg-amber-500"
                              : "bg-red-500",
                      )}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>

                  {/* Completion hint */}
                  <span className="text-[10px] text-muted-foreground/50">
                    {percentage >= 100
                      ? "Complete!"
                      : percentage >= 75
                        ? "Almost there"
                        : percentage >= 50
                          ? "Halfway done"
                          : percentage > 0
                            ? "In progress"
                            : "Not started"}
                  </span>
                </div>

                {/* Value out of range warning */}
                {currentValue > maxValue && (
                  <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                    <BarChart3 className="h-3 w-3 text-amber-500/60" />
                    <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                      Value exceeds max — will be clamped to {maxValue}
                    </span>
                  </div>
                )}
              </>
            )}
          </ConfigSection>

          <SectionDivider />

          {/* ── Label ── */}
          <ConfigSection
            title="Accessibility"
            icon={<Tag className="h-3 w-3" />}
          >
            {/* Label */}
            <ConfigField
              label="Label"
              htmlFor="progress-label"
              hint="Accessible label for the progress bar. Describes what the progress represents (e.g. 'Upload progress', 'Loading files'). Used by screen readers."
            >
              <Input
                id="progress-label"
                type="text"
                value={settings.label ?? ""}
                onChange={handleLabelChange}
                placeholder="Loading..."
                className="h-7 w-full max-w-[160px] px-2 text-[11px] rounded-md"
                autoComplete="off"
              />
            </ConfigField>

            {/* Label preview */}
            {settings.label && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Tag className="h-3 w-3 text-muted-foreground/40" />
                <span className="text-[10px] text-muted-foreground/50">
                  aria-label: &ldquo;{settings.label}&rdquo;
                </span>
              </div>
            )}

            {!settings.label && (
              <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
                <Tag className="h-3 w-3 text-amber-500/60" />
                <span className="text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight">
                  Add a label for better accessibility
                </span>
              </div>
            )}
          </ConfigSection>

          {/* ── Summary ── */}
          <SectionDivider />
          <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
            {isIndeterminate ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-mono text-blue-600 dark:text-blue-400">
                <Loader className="h-2.5 w-2.5 animate-spin" />
                indeterminate
              </span>
            ) : (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-mono",
                  percentage >= 100
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                <Percent className="h-2.5 w-2.5" />
                {percentage}%
              </span>
            )}
            {settings.label && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <Tag className="h-2.5 w-2.5" />
                labeled
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
