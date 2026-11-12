import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { StyleProps } from "./useStyleProps";

export function Segmented({
  value,
  options,
  onChange,
  disabled,
  className,
}: {
  value: string | undefined;
  options: { value: string; label: React.ReactNode; title: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <ToggleGroup
      spacing={1}
      type="single"
      value={value ?? ""}
      onValueChange={(v) => {
        if (v) onChange(v);
      }}
      disabled={disabled}
      className={cn(
        "flex h-7 w-full rounded-[5px] bg-muted/40 p-0.5",
        className,
      )}
    >
      {options.map((o) => (
        <ToggleGroupItem
          value={o.value}
          aria-label={o.title}
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          title={o.title}
          disabled={disabled}
          className={cn(
            "h-full min-w-0 flex-1 px-1 flex items-center justify-center rounded-[4px] text-[11px] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50 [&_svg]:h-3 [&_svg]:w-3",
            value === o.value &&
              "bg-card text-foreground shadow-sm ring-1 ring-border/50",
          )}
        >
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

const UNSET = "__unset__";

/** A Select bound to one style key. The "—" option clears it. */
export function StyleSelect({
  sp,
  k,
  label,
  options,
  placeholder = "—",
  className,
}: {
  sp: StyleProps;
  k: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const v = sp.values[k];
  const inherited = sp.inherited[k];
  return (
    <div className={cn("relative min-w-0", className)}>
      {sp.breakpoint !== "default" && v !== undefined && (
        <button
          type="button"
          disabled={sp.disabled}
          aria-label={`Clear ${label} override`}
          title="Clear breakpoint override"
          onClick={() => sp.clear([k])}
          className="absolute -left-1 top-1/2 z-1 size-1.5 -translate-y-1/2 rounded-full bg-sky-500"
        />
      )}
      <Select
        value={v === undefined ? UNSET : String(v)}
        onValueChange={(next) => sp.set(k, next === UNSET ? undefined : next)}
        disabled={sp.disabled}
      >
        <SelectTrigger
          aria-label={label}
          title={label}
          className={cn(
            "h-7! w-full min-w-0 rounded-[5px] border-border/25 bg-muted/30 px-2! text-xs! shadow-none [&_svg]:size-3!",
            className,
          )}
        >
          <SelectValue
            placeholder={
              inherited !== undefined ? String(inherited) : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value={UNSET} className="text-xs text-muted-foreground">
              {inherited !== undefined ? String(inherited) : placeholder}
            </SelectItem>
            {v !== undefined && !options.some((o) => o.value === String(v)) && (
              <SelectItem value={String(v)}>{String(v)}</SelectItem>
            )}
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs">
                {o.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

export function MoreToggle({
  open,
  onToggle,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={label}
      title={label}
      onClick={onToggle}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground",
        open && "bg-muted text-foreground",
      )}
    >
      <MoreHorizontal className="h-3.5 w-3.5" />
    </button>
  );
}
