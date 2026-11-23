import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelectedElement, useUpdateElement } from "@/features/editor";
import { newEntityId } from "@/lib/entity-id";
import { cn } from "@/lib/utils";
import { CheckCircle2, ListFilter, Plus } from "lucide-react";
import {
  addSelectOption,
  moveSelectOption,
  readSelectSettings,
  removeSelectOption,
  resolveSelectOptions,
  toggleDefaultSelectOption,
  updateSelectOptionField,
  type SelectSettings,
} from "../../../lib/selectOptions";
import { ConfigEmpty, ConfigPanel, SectionDivider } from "./_shared";
import { SelectOptionRow, SelectStateToggles } from "./SelectOptionRow";

export const SelectConfigurationAccordion = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  const selectElement =
    selectedElement?.type === "Select" ? selectedElement : undefined;
  const settings = useMemo(
    () => readSelectSettings(selectElement?.settings),
    [selectElement?.settings],
  );
  const options = useMemo(
    () =>
      resolveSelectOptions(
        settings,
        selectElement?.content,
        selectElement?.elements,
      ),
    [settings, selectElement?.content, selectElement?.elements],
  );

  if (!selectElement) return null;

  const defaultValue = settings.defaultValue;

  const updateSettings = (patch: Partial<SelectSettings>) => {
    updateElement(selectElement.id, {
      settings: { ...(selectElement.settings ?? {}), ...patch },
    });
  };

  return (
    <ConfigPanel
      value="select-settings"
      icon={<ListFilter className="h-3.5 w-3.5" />}
      title="Select Options"
      trailing={
        options.length > 0 && (
          <Badge
            variant="secondary"
            className="h-4 min-w-[18px] px-1 text-[9px] font-mono tabular-nums"
          >
            {options.length}
          </Badge>
        )
      }
    >
      <div className="flex flex-col gap-3">
        <SelectStateToggles
          settings={settings}
          onToggle={(key, checked) => updateSettings({ [key]: checked })}
        />

        <SectionDivider />

        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 select-none">
            Options
          </span>
          <span className="text-[10px] text-muted-foreground/50 font-mono tabular-nums">
            {options.length} {options.length === 1 ? "item" : "items"}
          </span>
        </div>

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

        <ScrollArea className="h-56 pr-2 -mr-2 rounded-lg border border-border/30 bg-muted/10">
          <div className="flex flex-col gap-0.5 p-1">
            {options.map((option, index) => (
              <SelectOptionRow
                key={option.id || index}
                option={option}
                index={index}
                total={options.length}
                isDefault={
                  defaultValue !== undefined && defaultValue === option.value
                }
                onSetDefault={() =>
                  updateSettings({
                    ...(settings.selectOptions === undefined
                      ? { selectOptions: options }
                      : {}),
                    defaultValue: toggleDefaultSelectOption(
                      defaultValue,
                      option.value,
                    ),
                  })
                }
                onUpdateField={(field, value) =>
                  updateSettings(
                    updateSelectOptionField(
                      options,
                      index,
                      field,
                      value,
                      defaultValue,
                    ),
                  )
                }
                onMove={(dir) => {
                  const reordered = moveSelectOption(options, index, dir);
                  if (reordered) updateSettings({ selectOptions: reordered });
                }}
                onRemove={() =>
                  updateSettings(removeSelectOption(options, index, defaultValue))
                }
              />
            ))}

            {options.length === 0 && (
              <ConfigEmpty
                icon={<ListFilter className="h-5 w-5" />}
                message="No options added yet. Click below to add one."
                className="my-2"
              />
            )}
          </div>
        </ScrollArea>

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
          onClick={() =>
            updateSettings({
              selectOptions: addSelectOption(options, newEntityId()),
            })
          }
        >
          <Plus className="mr-1.5 h-3 w-3" />
          Add option
        </Button>

        {options.length > 0 && (
          <div className="flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150">
            <ListFilter className="h-3 w-3 text-muted-foreground/40" />
            <span className="text-[10px] text-muted-foreground/50">
              <span className="font-mono tabular-nums font-medium text-muted-foreground/70">
                {options.length}
              </span>{" "}
              {options.length === 1 ? "option" : "options"}
              {defaultValue !== undefined && (
                <>
                  {" · default: "}
                  <span className="font-mono font-medium text-muted-foreground/70">
                    {defaultValue || "(empty)"}
                  </span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </ConfigPanel>
  );
};
