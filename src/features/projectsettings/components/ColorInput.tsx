import type { ChangeEvent, ReactElement } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ColorInputProps {
  readonly label: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly bgClass?: string;
  readonly id: string;
  readonly disabled?: boolean;
}

export function ColorInput({
  label,
  value,
  onChange,
  placeholder,
  id,
  disabled = false,
}: ColorInputProps): ReactElement {
  const handleValueChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-background/60 p-2.5 transition-colors hover:border-ring/50",
        disabled && "opacity-60",
      )}
    >
      <label
        htmlFor={id}
        className={cn(
          "relative size-9 shrink-0 overflow-hidden rounded-md border border-border shadow-xs",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
        style={{ backgroundColor: value }}
        title={`Pick ${label} color`}
      >
        <input
          type="color"
          id={id}
          value={value}
          disabled={disabled}
          onChange={handleValueChange}
          aria-label={`${label} color picker`}
          className="absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
        />
      </label>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Label
          htmlFor={`${id}-hex`}
          className="truncate text-xs font-medium text-foreground"
        >
          {label}
        </Label>
        <Input
          id={`${id}-hex`}
          value={value}
          disabled={disabled}
          onChange={handleValueChange}
          className="h-7 bg-card px-2 font-mono text-xs"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
