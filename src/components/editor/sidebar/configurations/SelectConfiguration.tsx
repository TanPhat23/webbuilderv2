"use client";

import React, { useMemo } from "react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import { SelectElement } from "@/interfaces/elements.interface";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ListFilter,
  GripVertical,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { ConfigField, ConfigEmpty, SectionDivider } from "./_shared";

interface SelectOption {
  id: string;
  label: string;
  value: string;
}

interface SelectSettings {
  selectOptions: SelectOption[];
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
}

export const SelectConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Select") return null;

  const selectElement = selectedElement as SelectElement;
  const settings = (selectElement.settings as unknown as SelectSettings) || {};

  const options: SelectOption[] = useMemo(
    () =>
      settings.selectOptions || [
        {
          id: "default-1",
          label: selectElement.content || "Option 1",
          value: "option-1",
        },
        { id: "default-2", label: "Option 2", value: "option-2" },
      ],
    [settings.selectOptions, selectElement.content],
  );

  const defaultValue = settings.defaultValue || "";

  /* ─── Handlers ─── */

  const updateSettings = (newSettings: Partial<SelectSettings>) => {
    updateElement(selectElement.id, {
      settings: { ...settings, ...newSettings } as any,
    });
  };

  const handleAddOption = () => {
    const newOption: SelectOption = {
      id: uuidv4(),
      label: `Option ${options.length + 1}`,
      value: `option-${options.length + 1}`,
    };
    updateSettings({ selectOptions: [...options, newOption] });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    let newDefault = defaultValue;
    if (options[index].value === defaultValue) {
      newDefault = "";
    }
    updateSettings({ selectOptions: newOptions, defaultValue: newDefault });
  };

  const handleUpdateOption = (
    index: number,
    field: keyof SelectOption,
    newValue: string,
  ) => {
    const newOptions = options.map((opt, i) => {
      if (i === index) {
        return { ...opt, [field]: newValue };
      }
      return opt;
    });

    let newDefault = defaultValue;
    if (field === "value" && options[index].value === defaultValue) {
      newDefault = newValue;
    }

    updateSettings({ selectOptions: newOptions, defaultValue: newDefault });
  };

  const handleMoveOption = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === options.length - 1)
    ) {
      return;
    }

    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [
      newOptions[targetIndex],
      newOptions[index],
    ];
    updateSettings({ selectOptions: newOptions });
  };

  const handleSetDefault = (value: string) => {
    if (defaultValue === value) {
      updateSettings({ defaultValue: "" });
    } else {
      updateSettings({ defaultValue: value });
    }
  };

  return (
    <AccordionItem value="select-settings" className="border-border/40">
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
            <ListFilter className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Select Options</span>
          {options.length > 0 && (
            <span className="ml-auto mr-1 shrink-0">
              <Badge
                variant="secondary"
                className="h-4 min-w-[18px] px-1 text-[9px] font-mono tabular-nums"
              >
                {options.length}
              </Badge>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── State Toggles ── */}
          <div className="grid grid-cols-2 gap-1.5">
            <div
              className={cn(
                "flex items-center justify-between gap-2",
                "rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2",
                "transition-colors duration-150",
                settings.required &&
                  "border-foreground/10 bg-foreground/[0.03]",
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground select-none">
                Required
              </span>
              <Switch
                id="required-mode"
                checked={settings.required}
                onCheckedChange={(c) => updateSettings({ required: c })}
                className="scale-[0.65] origin-right"
              />
            </div>
            <div
              className={cn(
                "flex items-center justify-between gap-2",
                "rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2",
                "transition-colors duration-150",
                settings.disabled &&
                  "border-foreground/10 bg-foreground/[0.03]",
              )}
            >
              <span className="text-[11px] font-medium text-muted-foreground select-none">
                Disabled
              </span>
              <Switch
                id="disabled-mode"
                checked={settings.disabled}
                onCheckedChange={(c) => updateSettings({ disabled: c })}
                className="scale-[0.65] origin-right"
              />
            </div>
          </div>

          <SectionDivider />

          {/* ── Options Header ── */}
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
              Options
            </span>
            <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
              {options.length} {options.length === 1 ? "item" : "items"}
            </span>
          </div>

          {/* ── Column Headers ── */}
          <div className="grid grid-cols-[26px_1fr_1fr_52px] gap-1.5 px-1">
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    <CheckCircle2 className="h-3 w-3 text-muted-foreground/40" />
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[11px]">
                  Default selected option
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Label
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider">
              Value
            </span>
            <span className="text-[10px] font-medium text-muted-foreground/50 uppercase tracking-wider text-center">
              Actions
            </span>
          </div>

          {/* ── Options List ── */}
          <ScrollArea className="h-56 pr-2 -mr-2 rounded-lg border border-border/30 bg-muted/10">
            <div className="flex flex-col gap-0.5 p-1">
              {options.map((option, index) => (
                <div
                  key={option.id || index}
                  className={cn(
                    "group/item grid grid-cols-[26px_1fr_1fr_52px] gap-1.5 items-center",
                    "rounded-md border border-transparent",
                    "hover:border-border/40 hover:bg-background hover:shadow-sm",
                    "transition-all duration-150 p-1",
                    defaultValue === option.value &&
                      "bg-primary/[0.03] border-primary/10",
                  )}
                >
                  {/* Default Toggle */}
                  <div className="flex justify-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex items-center justify-center",
                            "h-5 w-5 rounded-full outline-none",
                            "transition-all duration-150",
                            defaultValue === option.value
                              ? "text-primary hover:text-primary/80"
                              : "text-muted-foreground/30 hover:text-primary/50",
                          )}
                          onClick={() => handleSetDefault(option.value)}
                        >
                          {defaultValue === option.value ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <Circle className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-[11px]">
                        {defaultValue === option.value
                          ? "Default — click to unset"
                          : "Set as default"}
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Label Input */}
                  <Input
                    value={option.label}
                    onChange={(e) =>
                      handleUpdateOption(index, "label", e.target.value)
                    }
                    placeholder="Label"
                    className={cn(
                      "h-6 text-[10px] px-1.5 rounded-md",
                      "bg-transparent border-transparent",
                      "hover:border-border/40 hover:bg-background",
                      "focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/10",
                      "transition-colors duration-150",
                    )}
                  />

                  {/* Value Input */}
                  <Input
                    value={option.value}
                    onChange={(e) =>
                      handleUpdateOption(index, "value", e.target.value)
                    }
                    placeholder="value"
                    className={cn(
                      "h-6 text-[10px] px-1.5 rounded-md font-mono",
                      "bg-transparent border-transparent text-muted-foreground",
                      "hover:border-border/40 hover:bg-background",
                      "focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/10 focus:text-foreground",
                      "transition-colors duration-150",
                    )}
                  />

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-0 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
                    <div className="flex flex-col">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex items-center justify-center h-3 w-4",
                              "rounded-t-sm outline-none",
                              "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/60",
                              "disabled:opacity-20 disabled:pointer-events-none",
                              "transition-colors duration-100",
                            )}
                            disabled={index === 0}
                            onClick={() => handleMoveOption(index, "up")}
                          >
                            <ArrowUp className="h-2 w-2" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-[10px]">
                          Move up
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className={cn(
                              "flex items-center justify-center h-3 w-4",
                              "rounded-b-sm outline-none",
                              "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/60",
                              "disabled:opacity-20 disabled:pointer-events-none",
                              "transition-colors duration-100",
                            )}
                            disabled={index === options.length - 1}
                            onClick={() => handleMoveOption(index, "down")}
                          >
                            <ArrowDown className="h-2 w-2" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="left" className="text-[10px]">
                          Move down
                        </TooltipContent>
                      </Tooltip>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex items-center justify-center",
                            "h-5 w-5 rounded-md outline-none",
                            "text-muted-foreground/40",
                            "hover:text-destructive hover:bg-destructive/10",
                            "transition-colors duration-150",
                          )}
                          onClick={() => handleRemoveOption(index)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="text-[10px]">
                        Remove option
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {options.length === 0 && (
                <ConfigEmpty
                  icon={<ListFilter className="h-5 w-5" />}
                  message="No options added yet. Click below to add one."
                  className="my-2"
                />
              )}
            </div>
          </ScrollArea>

          {/* ── Add Button ── */}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full h-8 text-[11px] font-medium",
              "border border-dashed border-border/40 rounded-lg",
              "text-muted-foreground/60",
              "hover:border-border/60 hover:bg-muted/20 hover:text-muted-foreground",
              "transition-all duration-150",
            )}
            onClick={handleAddOption}
          >
            <Plus className="mr-1.5 h-3 w-3" />
            Add option
          </Button>

          {/* ── Summary ── */}
          {options.length > 0 && (
            <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
              <ListFilter className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50">
                <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                  {options.length}
                </span>{" "}
                {options.length === 1 ? "option" : "options"}
                {defaultValue && (
                  <>
                    {" · default: "}
                    <span className="font-mono font-medium text-muted-foreground/70">
                      {defaultValue}
                    </span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
