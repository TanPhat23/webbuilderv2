import React, { useEffect, useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { normalizeCssInput, splitNumber, stepCssValue } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

type PropInputProps = {
  value: string | number | undefined;
  placeholder?: string;
  prefix: React.ReactNode;
  /** Plain-words property name, shown as the prefix tooltip and aria-label. */
  label: string;
  defaultUnit?: string;
  /** Free text (grid templates, transforms, filters): no validation. */
  free?: boolean;
  overridden?: boolean;
  onClearOverride?: () => void;
  onCommit: (v: string | undefined) => void;
  disabled?: boolean;
  className?: string;
};

export function PropInput({
  value,
  placeholder,
  prefix,
  label,
  defaultUnit = "px",
  free = false,
  overridden = false,
  onClearOverride,
  onCommit,
  disabled,
  className,
}: PropInputProps) {
  const raw = value === undefined ? "" : String(value);
  const [draft, setDraft] = useState<string | null>(null);
  const [invalid, setInvalid] = useState(false);
  const skipBlur = useRef(false);
  const scrub = useRef<{ x: number; start: string } | null>(null);

  useEffect(() => {
    setDraft(null);
    setInvalid(false);
  }, [raw]);

  const commit = (text: string) => {
    if (free) {
      const t = text.trim();
      onCommit(t === "" ? undefined : t);
      setDraft(null);
      return;
    }
    const r = normalizeCssInput(text, defaultUnit);
    if (!r.ok) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setDraft(null);
    if (r.value !== (raw || undefined)) onCommit(r.value);
  };

  const step = (delta: number) => {
    const next = stepCssValue(draft ?? raw, delta, defaultUnit);
    setDraft(next);
    setInvalid(false);
    onCommit(next);
  };

  const onPrefixDown = (e: React.PointerEvent) => {
    if (disabled || free) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    scrub.current = { x: e.clientX, start: raw };
  };
  const onPrefixMove = (e: React.PointerEvent) => {
    if (!scrub.current) return;
    const px = e.clientX - scrub.current.x;
    const factor = e.shiftKey ? 10 : e.altKey ? 0.1 : 1;
    const delta = Math.trunc(px / 2) * factor;
    onCommit(stepCssValue(scrub.current.start, delta, defaultUnit));
  };
  const onPrefixUp = () => {
    scrub.current = null;
  };

  const parts = splitNumber(raw);
  const shown =
    draft ?? (parts && parts.unit && !free ? String(parts.num) : raw);
  const unit = draft === null && parts && !free ? parts.unit : "";

  return (
    <div
      className={cn(
        "group/pi relative flex h-7 min-w-0 items-center gap-1 rounded-[5px] border border-border/25 bg-muted/30 px-2 text-[11px] transition-colors",
        "focus-within:border-ring/60 focus-within:bg-muted hover:bg-muted/70",
        invalid && "border-destructive/70",
        disabled && "opacity-50",
        className,
      )}
    >
      {overridden && (
        <button
          type="button"
          title="Set at this breakpoint. Click to clear."
          aria-label={`Clear ${label} override`}
          disabled={disabled}
          onClick={onClearOverride}
          className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-500"
        />
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            onPointerDown={onPrefixDown}
            onPointerMove={onPrefixMove}
            onPointerUp={onPrefixUp}
            onPointerCancel={onPrefixUp}
            onLostPointerCapture={onPrefixUp}
            className={cn(
              "flex min-w-3 shrink-0 select-none items-center justify-center text-[10px] text-muted-foreground [&_svg]:h-3 [&_svg]:w-3",
              !free && !disabled && "cursor-ew-resize",
            )}
          >
            {prefix}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
      <input
        aria-label={label}
        aria-invalid={invalid}
        disabled={disabled}
        value={shown}
        placeholder={placeholder}
        onFocus={() => setDraft(raw)}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onBlur={(e) => {
          if (!skipBlur.current && draft !== null) commit(e.target.value);
          skipBlur.current = false;
          setDraft(null);
          setInvalid(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
          else if (e.key === "Escape") {
            skipBlur.current = true;
            setDraft(null);
            setInvalid(false);
            e.currentTarget.blur();
          } else if (!free && (e.key === "ArrowUp" || e.key === "ArrowDown")) {
            e.preventDefault();
            step((e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1));
          }
        }}
        className="h-full w-full min-w-0 bg-transparent font-sans text-xs tabular-nums text-foreground/90 outline-none placeholder:text-muted-foreground/65"
      />
      {unit && (
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {unit}
        </span>
      )}
    </div>
  );
}

/** A PropInput bound to one style key of the selected element. */
export function StyleField({
  sp,
  k,
  prefix,
  label,
  defaultUnit,
  free,
  className,
}: {
  sp: StyleProps;
  k: string;
  prefix: React.ReactNode;
  label: string;
  defaultUnit?: string;
  free?: boolean;
  className?: string;
}) {
  const inherited = sp.inherited[k];
  return (
    <PropInput
      value={sp.values[k]}
      placeholder={
        inherited !== undefined
          ? String(inherited)
          : ["width", "height", "zIndex", "flexBasis"].includes(k)
            ? "Auto"
            : "—"
      }
      prefix={prefix}
      label={label}
      defaultUnit={defaultUnit}
      free={free}
      overridden={sp.breakpoint !== "default" && sp.values[k] !== undefined}
      onClearOverride={() => sp.clear([k])}
      onCommit={(v) => sp.set(k, v)}
      disabled={sp.disabled}
      className={className}
    />
  );
}
