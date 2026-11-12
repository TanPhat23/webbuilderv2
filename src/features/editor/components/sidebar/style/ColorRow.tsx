import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { joinColorAlpha, splitColorAlpha } from "./styleModel";
import type { StyleProps } from "./useStyleProps";

/** Swatch (native picker) · hex/raw text · alpha %. Non-hex values pass through unchanged. */
export function ColorRow({
  sp,
  k,
  label,
}: {
  sp: StyleProps;
  k: string;
  label: string;
}) {
  const value = sp.values[k] as string | undefined;
  const inherited = sp.inherited[k] as string | undefined;
  const { hex, alpha, raw } = splitColorAlpha(value);
  const [draft, setDraft] = useState(raw);
  useEffect(() => setDraft(raw), [raw]);

  const commitText = (t: string) => {
    const s = t.trim();
    sp.set(k, s === "" ? undefined : s);
  };
  const overridden = sp.breakpoint !== "default" && value !== undefined;

  return (
    <div
      className={cn(
        "relative flex h-7 items-center gap-1.5 rounded-[5px] border border-border/25 bg-muted/30 px-2",
        sp.disabled && "opacity-50",
      )}
    >
      {overridden && (
        <button
          type="button"
          aria-label={`Clear ${label} override`}
          title="Set at this breakpoint. Click to clear."
          disabled={sp.disabled}
          onClick={() => sp.clear([k])}
          className="absolute -left-1 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-500"
        />
      )}
      <label
        className="relative size-4 shrink-0 overflow-hidden rounded-[3px] border border-border"
        style={{ background: value ?? inherited ?? "transparent" }}
        title={label}
      >
        <input
          type="color"
          aria-label={`${label} picker`}
          disabled={sp.disabled}
          value={hex ?? "#000000"}
          onChange={(e) => sp.set(k, joinColorAlpha(e.target.value, alpha))}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <input
        aria-label={label}
        disabled={sp.disabled}
        value={draft}
        placeholder={inherited ?? "None"}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commitText(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && commitText(e.currentTarget.value)
        }
        className="h-full min-w-0 flex-1 bg-transparent font-sans text-xs outline-none placeholder:normal-case placeholder:text-muted-foreground/50"
      />
      <input
        aria-label={`${label} opacity`}
        title={hex ? "Opacity %" : "Opacity applies to hex colours only"}
        disabled={sp.disabled || !hex}
        defaultValue={alpha}
        key={`${raw}-${alpha}`}
        onBlur={(e) => {
          const n = Number(e.target.value);
          if (hex && Number.isFinite(n)) sp.set(k, joinColorAlpha(hex, n));
        }}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        className="h-full w-8 shrink-0 bg-transparent text-right font-sans text-[11px] tabular-nums text-muted-foreground outline-none disabled:opacity-40"
      />
      <span className="text-[10px] text-muted-foreground">%</span>
    </div>
  );
}
