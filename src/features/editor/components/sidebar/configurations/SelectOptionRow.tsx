import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, CheckCircle2, Circle, Trash2 } from "lucide-react";
import type { SelectOption, SelectSettings } from "../../../lib/selectOptions";

const SELECT_STATE_TOGGLES: ReadonlyArray<{
  key: "required" | "disabled";
  id: string;
  label: string;
}> = [
  { key: "required", id: "required-mode", label: "Required" },
  { key: "disabled", id: "disabled-mode", label: "Disabled" },
];

const OPTION_INPUT_CLASS = cn(
  "h-6 text-[10px] px-1.5 rounded-md",
  "bg-transparent border-transparent",
  "hover:border-border/40 hover:bg-background",
  "focus:border-foreground/20 focus:bg-background focus:ring-1 focus:ring-foreground/10",
  "transition-colors duration-150",
);

const MOVE_BUTTON_CLASS = cn(
  "flex items-center justify-center h-3 w-4 outline-none",
  "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/60",
  "disabled:opacity-20 disabled:pointer-events-none",
  "transition-colors duration-100",
);

export function SelectStateToggles({
  settings,
  onToggle,
}: {
  settings: SelectSettings;
  onToggle: (key: "required" | "disabled", checked: boolean) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {SELECT_STATE_TOGGLES.map(({ key, id, label }) => {
        const checked = Boolean(settings[key]);
        return (
          <div
            key={key}
            className={cn(
              "flex items-center justify-between gap-2",
              "rounded-lg border border-border/40 bg-muted/10 px-2.5 py-2",
              "transition-colors duration-150",
              checked && "border-foreground/10 bg-foreground/[0.03]",
            )}
          >
            <label
              htmlFor={id}
              className="text-[11px] font-medium text-muted-foreground select-none"
            >
              {label}
            </label>
            <Switch
              id={id}
              checked={checked}
              onCheckedChange={(c) => onToggle(key, c)}
              className="scale-[0.65] origin-right"
            />
          </div>
        );
      })}
    </div>
  );
}

export function SelectOptionRow({
  option,
  index,
  total,
  isDefault,
  onSetDefault,
  onUpdateField,
  onMove,
  onRemove,
}: {
  option: SelectOption;
  index: number;
  total: number;
  isDefault: boolean;
  onSetDefault: () => void;
  onUpdateField: (field: keyof SelectOption, value: string) => void;
  onMove: (direction: "up" | "down") => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "group/item grid grid-cols-[26px_1fr_1fr_52px] gap-1.5 items-center",
        "rounded-md border border-transparent",
        "hover:border-border/40 hover:bg-background hover:shadow-sm",
        "transition-all duration-150 p-1",
        isDefault && "bg-primary/[0.03] border-primary/10",
      )}
    >
      <div className="flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                "flex items-center justify-center h-5 w-5 rounded-full outline-none transition-all duration-150",
                isDefault
                  ? "text-primary hover:text-primary/80"
                  : "text-muted-foreground/30 hover:text-primary/50",
              )}
              onClick={onSetDefault}
            >
              {isDefault ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-[11px]">
            {isDefault ? "Default — click to unset" : "Set as default"}
          </TooltipContent>
        </Tooltip>
      </div>

      <Input
        value={option.label}
        onChange={(e) => onUpdateField("label", e.target.value)}
        placeholder="Label"
        className={OPTION_INPUT_CLASS}
      />

      <Input
        value={option.value}
        onChange={(e) => onUpdateField("value", e.target.value)}
        placeholder="value"
        className={cn(
          OPTION_INPUT_CLASS,
          "font-mono text-muted-foreground focus:text-foreground",
        )}
      />

      <div className="flex items-center justify-end gap-0 opacity-0 group-hover/item:opacity-100 focus-within:opacity-100 transition-opacity duration-150">
        <div className="flex flex-col">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className={cn(MOVE_BUTTON_CLASS, "rounded-t-sm")}
                disabled={index === 0}
                onClick={() => onMove("up")}
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
                className={cn(MOVE_BUTTON_CLASS, "rounded-b-sm")}
                disabled={index === total - 1}
                onClick={() => onMove("down")}
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
                "flex items-center justify-center h-5 w-5 rounded-md outline-none",
                "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                "transition-colors duration-150",
              )}
              onClick={onRemove}
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
  );
}
