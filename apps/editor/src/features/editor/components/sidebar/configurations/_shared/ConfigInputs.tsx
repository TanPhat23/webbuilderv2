import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import { ConfigField } from "./ConfigField";

interface FieldProps {
  id: string;
  label: string;
  hint: string;
}

interface ConfigSelectInputProps extends FieldProps {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly { value: string; label: string; icon?: ReactNode }[];
  className?: string;
  optionLabelClassName?: string;
}

export function ConfigSelectInput({
  id, label, hint, value, onValueChange, options, optionLabelClassName,
  className = "h-7 w-[120px] px-2 text-[11px] rounded-md",
}: ConfigSelectInputProps) {
  return (
    <ConfigField label={label} htmlFor={id} hint={hint}>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className={className}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.icon ? (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{option.icon}</span>
                  <span className={optionLabelClassName}>{option.label}</span>
                </div>
              ) : option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </ConfigField>
  );
}

interface ConfigTextInputProps extends FieldProps {
  name: string;
  value: string | number;
  placeholder: string;
  onValueChange: (value: string) => void;
  className?: string;
  vertical?: boolean;
}

export function ConfigTextInput({
  id, label, hint, name, value, placeholder, onValueChange, vertical,
  className = "h-7 w-full max-w-[140px] px-2 text-[11px] rounded-md",
}: ConfigTextInputProps) {
  return (
    <ConfigField label={label} htmlFor={id} hint={hint} vertical={vertical}>
      <Input
        id={id}
        name={name}
        type="text"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
    </ConfigField>
  );
}

interface ConfigSwitchProps extends FieldProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ConfigSwitch({ id, label, hint, checked, onCheckedChange }: ConfigSwitchProps) {
  return (
    <ConfigField label={label} htmlFor={id} hint={hint}>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="scale-75 origin-right"
      />
    </ConfigField>
  );
}

interface ConfigNumberInputProps extends FieldProps {
  value?: number;
  placeholder: string;
  onValueChange: (value: string) => void;
  min?: number;
  max?: number;
  compact?: boolean;
}

export function ConfigNumberInput({
  id, label, hint, value, placeholder, onValueChange, min, max, compact,
}: ConfigNumberInputProps) {
  return (
    <ConfigField label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        type="number"
        value={value ?? ""}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
        min={min}
        max={max}
        className={cn(
          "h-7 px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md",
          compact ? "w-[56px]" : "w-[72px]",
        )}
      />
    </ConfigField>
  );
}
