import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useElementStore } from "@/globalstore/element-store";
import { useSelectionStore } from "@/globalstore/selection-store";
import { SelectElement } from "@/interfaces/elements.interface";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
} from "lucide-react";
import React, { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { updateElement } = useElementStore();
  const { selectedElement } = useSelectionStore();

  if (!selectedElement || selectedElement.type !== "Select") {
    return null;
  }

  const selectElement = selectedElement as SelectElement;
  const settings = (selectElement.settings as unknown as SelectSettings) || {};

  const options: SelectOption[] = useMemo(() => {
    return (
      settings.selectOptions || [
        {
          id: "default-1",
          label: selectElement.content || "Option 1",
          value: "option-1",
        },
        {
          id: "default-2",
          label: "Option 2",
          value: "option-2",
        },
      ]
    );
  }, [settings.selectOptions, selectElement.content]);

  const defaultValue = settings.defaultValue || "";

  const updateSettings = (newSettings: Partial<SelectSettings>) => {
    updateElement(selectElement.id, {
      settings: {
        ...settings,
        ...newSettings,
      } as any,
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
    <AccordionItem value="select-settings">
      <AccordionTrigger className="text-sm">Select Settings</AccordionTrigger>
      <AccordionContent>
        <div className="flex flex-col gap-4 p-1">
          {/* Global Settings */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between space-x-2 border rounded-md p-2">
              <Label htmlFor="required-mode" className="text-xs cursor-pointer">
                Required
              </Label>
              <Switch
                id="required-mode"
                checked={settings.required}
                onCheckedChange={(c) => updateSettings({ required: c })}
                className="scale-75"
              />
            </div>
            <div className="flex items-center justify-between space-x-2 border rounded-md p-2">
              <Label htmlFor="disabled-mode" className="text-xs cursor-pointer">
                Disabled
              </Label>
              <Switch
                id="disabled-mode"
                checked={settings.disabled}
                onCheckedChange={(c) => updateSettings({ disabled: c })}
                className="scale-75"
              />
            </div>
          </div>

          {/* Options Management */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-muted-foreground">
                Options ({options.length})
              </Label>
            </div>

            <div className="grid grid-cols-[30px_1fr_1fr_60px] gap-2 px-1 mb-1">
              <div className="flex justify-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle2 className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Default Selected</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-[10px] font-medium text-muted-foreground">
                Label
              </span>
              <span className="text-[10px] font-medium text-muted-foreground">
                Value
              </span>
              <span className="text-[10px] font-medium text-muted-foreground text-center">
                Actions
              </span>
            </div>

            <ScrollArea className="h-60 pr-3 -mr-3 border rounded-md bg-muted/10">
              <div className="space-y-1 p-1">
                {options.map((option, index) => (
                  <div
                    key={option.id || index}
                    className="group/item grid grid-cols-[30px_1fr_1fr_60px] gap-2 items-center bg-background rounded-md border border-transparent hover:border-border hover:shadow-sm transition-all p-1"
                  >
                    {/* Default Toggle */}
                    <div className="flex justify-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "h-5 w-5 rounded-full hover:bg-primary/10",
                          defaultValue === option.value
                            ? "text-primary"
                            : "text-muted-foreground hover:text-primary/60",
                        )}
                        onClick={() => handleSetDefault(option.value)}
                      >
                        {defaultValue === option.value ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>

                    {/* Inputs */}
                    <Input
                      value={option.label}
                      onChange={(e) =>
                        handleUpdateOption(index, "label", e.target.value)
                      }
                      placeholder="Label"
                      className="h-7 text-[10px] px-2 bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-colors"
                    />
                    <Input
                      value={option.value}
                      onChange={(e) =>
                        handleUpdateOption(index, "value", e.target.value)
                      }
                      placeholder="Value"
                      className="h-7 text-[10px] px-2 bg-transparent border-transparent hover:border-input focus:border-input focus:bg-background transition-colors font-mono text-muted-foreground"
                    />

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-0.5 opacity-40 group-hover/item:opacity-100 transition-opacity">
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-4 rounded-none rounded-t hover:bg-muted"
                          disabled={index === 0}
                          onClick={() => handleMoveOption(index, "up")}
                        >
                          <ArrowUp className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-4 rounded-none rounded-b hover:bg-muted"
                          disabled={index === options.length - 1}
                          onClick={() => handleMoveOption(index, "down")}
                        >
                          <ArrowDown className="h-2 w-2" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}

                {options.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-xs border-2 border-dashed rounded-md">
                    No options added yet
                  </div>
                )}
              </div>
            </ScrollArea>

            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 text-xs border-dashed hover:border-solid hover:bg-muted/50"
              onClick={handleAddOption}
            >
              <Plus className="mr-2 h-3 w-3" /> Add New Option
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};
