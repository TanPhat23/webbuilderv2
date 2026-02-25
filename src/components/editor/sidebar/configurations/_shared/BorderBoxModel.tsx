"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Link2, Link2Off, CornerUpLeft } from "lucide-react";
import { Input } from "@/components/ui/input";

/* ─── Types ─── */

type BorderSide = "top" | "right" | "bottom" | "left";
type Corner = "topLeft" | "topRight" | "bottomRight" | "bottomLeft";
type BorderStyle =
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "none"
  | "groove"
  | "ridge"
  | "inset"
  | "outset";

interface SideBorder {
  width: string | number | undefined;
  style: BorderStyle | undefined;
  color: string | undefined;
}

interface BorderBoxModelProps {
  /** Per-side border values. Falls back to uniform values. */
  sides: {
    top: SideBorder;
    right: SideBorder;
    bottom: SideBorder;
    left: SideBorder;
  };
  /** Per-corner radius values */
  radii: {
    topLeft: string | number | undefined;
    topRight: string | number | undefined;
    bottomRight: string | number | undefined;
    bottomLeft: string | number | undefined;
  };
  /** Uniform border color (used for the color picker row) */
  borderColor: string | undefined;
  onSideChange: (
    side: BorderSide,
    field: keyof SideBorder,
    value: string,
  ) => void;
  onRadiusChange: (corner: Corner, value: string) => void;
  /** Called to set border-color uniformly */
  onColorChange: (color: string | undefined) => void;
  /** Called to set border-style uniformly */
  onStyleChange: (style: BorderStyle) => void;
  className?: string;
}

/* ─── Helpers ─── */

function parseNumericValue(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "0";
  const str = String(value);
  const num = parseInt(str, 10);
  return isNaN(num) ? "0" : String(num);
}

const BORDER_STYLES: BorderStyle[] = [
  "solid",
  "dashed",
  "dotted",
  "double",
  "none",
];

const STYLE_LABELS: Record<BorderStyle, string> = {
  solid: "—",
  dashed: "- -",
  dotted: "···",
  double: "═",
  none: "✕",
  groove: "grv",
  ridge: "rdg",
  inset: "ins",
  outset: "out",
};

/* ─── Inline editable number ─── */

interface InlineNumberProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  className?: string;
  ariaLabel?: string;
  min?: number;
}

function InlineNumber({
  value,
  onChange,
  className,
  ariaLabel,
  min = 0,
}: InlineNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayed = parseNumericValue(value);

  const startEditing = useCallback(() => {
    setDraft(displayed);
    setEditing(true);
  }, [displayed]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === displayed) return;
    const num = Math.max(min, parseInt(trimmed, 10) || 0);
    onChange(`${num}px`);
  }, [draft, displayed, onChange, min]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = Math.max(min, parseInt(displayed, 10) || 0);
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = Math.max(min, current + delta);
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange, min],
  );

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        className={cn(
          "w-7 h-4 bg-transparent text-center font-mono outline-none",
          "border border-white/30 rounded-sm text-[10px] leading-none px-0.5",
          className,
        )}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={startEditing}
      aria-label={ariaLabel}
      className={cn(
        "text-[10px] font-mono leading-none cursor-text",
        "rounded-sm px-0.5 py-px min-w-4.5 text-center",
        "hover:bg-white/10 transition-colors duration-100 tabular-nums select-none",
        className,
      )}
    >
      {displayed}
    </button>
  );
}

/* ─── Corner radius inline input ─── */

interface CornerRadiusInputProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  ariaLabel: string;
  /** Which corner this input represents, affects rotation of icon */
  corner: Corner;
}

const CORNER_ROTATIONS: Record<Corner, string> = {
  topLeft: "rotate-0",
  topRight: "rotate-90",
  bottomRight: "rotate-180",
  bottomLeft: "-rotate-90",
};

function CornerRadiusInput({
  value,
  onChange,
  ariaLabel,
  corner,
}: CornerRadiusInputProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayed = parseNumericValue(value);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const commit = useCallback(() => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed === "" || trimmed === displayed) return;
    const num = Math.max(0, parseInt(trimmed, 10) || 0);
    onChange(`${num}px`);
  }, [draft, displayed, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") commit();
      else if (e.key === "Escape") setEditing(false);
      else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = Math.max(0, parseInt(displayed, 10) || 0);
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = Math.max(0, current + delta);
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange],
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <CornerUpLeft
        className={cn(
          "h-2.5 w-2.5 text-violet-400/50",
          CORNER_ROTATIONS[corner],
        )}
      />
      {editing ? (
        <Input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          aria-label={ariaLabel}
          className="w-7 h-3.5 bg-transparent text-center font-mono outline-none border border-white/30 rounded-sm text-[9px] leading-none px-0.5 text-violet-300/90"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setDraft(displayed);
            setEditing(true);
          }}
          aria-label={ariaLabel}
          className="text-[9px] font-mono leading-none cursor-text rounded-sm px-0.5 py-px min-w-4.5 text-center hover:bg-white/10 transition-colors tabular-nums select-none text-violet-300/80"
        >
          {displayed}
        </button>
      )}
    </div>
  );
}

/* ─── Side label pill (shows width on the edge) ─── */

interface SideWidthProps {
  side: BorderSide;
  width: string | number | undefined;
  style: BorderStyle | undefined;
  color: string | undefined;
  onWidthChange: (value: string) => void;
  onStyleCycle: () => void;
}

/** Maps a BorderStyle to a Tailwind border-style class */
const STYLE_TO_DASH_ARRAY: Record<BorderStyle, string | undefined> = {
  solid: undefined,
  dashed: "6,3",
  dotted: "2,2",
  double: undefined,
  none: undefined,
  groove: undefined,
  ridge: undefined,
  inset: undefined,
  outset: undefined,
};

function SideWidth({
  side,
  width,
  style,
  color,
  onWidthChange,
  onStyleCycle,
}: SideWidthProps) {
  const isHorizontal = side === "top" || side === "bottom";
  const displayWidth = parseNumericValue(width);
  const currentStyle = style ?? "solid";
  const isNone = currentStyle === "none" || displayWidth === "0";

  // Visual line preview
  const lineColor = color
    ? color.startsWith("var(")
      ? undefined // resolved at runtime
      : color
    : "hsl(var(--border))";

  const lineStyle =
    currentStyle === "dashed"
      ? "dashed"
      : currentStyle === "dotted"
        ? "dotted"
        : currentStyle === "double"
          ? "double"
          : "solid";

  return (
    <div
      className={cn(
        "flex items-center gap-1",
        isHorizontal ? "flex-row justify-center w-full" : "flex-col",
      )}
    >
      {/* Style cycle button */}
      <button
        type="button"
        onClick={onStyleCycle}
        title={`Border style: ${currentStyle}`}
        className={cn(
          "text-[9px] font-mono rounded px-1 py-0.5 select-none",
          "hover:bg-white/10 transition-colors tabular-nums",
          isNone
            ? "text-muted-foreground/30"
            : "text-sky-300/80 hover:text-sky-200",
        )}
      >
        {STYLE_LABELS[currentStyle]}
      </button>

      {/* Width input */}
      <InlineNumber
        value={width}
        onChange={onWidthChange}
        ariaLabel={`${side} border width`}
        className={cn(isNone ? "text-muted-foreground/30" : "text-sky-300/90")}
      />

      {/* Visual line */}
      {!isNone && (
        <div
          className={cn(isHorizontal ? "flex-1 h-0" : "flex-1 w-0")}
          style={
            isHorizontal
              ? {
                  borderTopWidth: `${Math.min(
                    parseInt(displayWidth, 10) || 1,
                    4,
                  )}px`,
                  borderTopStyle: lineStyle,
                  borderTopColor: lineColor,
                  minWidth: "8px",
                }
              : {
                  borderLeftWidth: `${Math.min(
                    parseInt(displayWidth, 10) || 1,
                    4,
                  )}px`,
                  borderLeftStyle: lineStyle,
                  borderLeftColor: lineColor,
                  minHeight: "8px",
                }
          }
        />
      )}
    </div>
  );
}

/* ─── Uniform controls row ─── */

interface UniformControlsProps {
  linkedWidth: string;
  linked: boolean;
  onToggleLinked: () => void;
  onWidthChange: (v: string) => void;
  currentStyle: BorderStyle;
  onStyleChange: (s: BorderStyle) => void;
  borderColor: string | undefined;
  onColorChange: (c: string | undefined) => void;
}

function UniformControls({
  linkedWidth,
  linked,
  onToggleLinked,
  onWidthChange,
  currentStyle,
  onStyleChange,
  borderColor,
  onColorChange,
}: UniformControlsProps) {
  const [draftColor, setDraftColor] = useState(borderColor ?? "");

  useEffect(() => {
    setDraftColor(borderColor ?? "");
  }, [borderColor]);

  const commitColor = useCallback(() => {
    const trimmed = draftColor.trim();
    onColorChange(trimmed || undefined);
  }, [draftColor, onColorChange]);

  return (
    <div className="flex items-center gap-2 mt-2 px-0.5">
      {/* Link toggle */}
      <button
        type="button"
        onClick={onToggleLinked}
        title={linked ? "Unlink sides" : "Link all sides"}
        className={cn(
          "flex items-center justify-center h-6 w-6 rounded-md border transition-colors shrink-0",
          linked
            ? "border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20"
            : "border-border/40 bg-muted/20 text-muted-foreground/50 hover:bg-muted/40",
        )}
      >
        {linked ? (
          <Link2 className="h-3 w-3" />
        ) : (
          <Link2Off className="h-3 w-3" />
        )}
      </button>

      {/* Uniform width (shown only when linked) */}
      {linked && (
        <div className="flex items-center gap-1 rounded-md border border-border/50 bg-muted/20 px-1.5 h-6 shrink-0">
          <span className="text-[9px] text-muted-foreground/50 font-medium select-none">
            W
          </span>
          <InlineNumber
            value={linkedWidth}
            onChange={onWidthChange}
            ariaLabel="Border width all sides"
            className="text-sky-300/90"
          />
          <span className="text-[9px] text-muted-foreground/40 select-none">
            px
          </span>
        </div>
      )}

      {/* Style cycle */}
      <div className="flex items-center gap-0.5">
        {BORDER_STYLES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStyleChange(s)}
            title={s}
            className={cn(
              "h-6 px-1.5 text-[9px] font-mono rounded-md border transition-colors",
              currentStyle === s
                ? "border-sky-500/40 bg-sky-500/10 text-sky-300"
                : "border-border/40 bg-muted/10 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/30",
            )}
          >
            {STYLE_LABELS[s]}
          </button>
        ))}
      </div>

      {/* Color swatch + hex input */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <div className="relative h-5 w-5 shrink-0 rounded border border-border/60 overflow-hidden">
          <input
            type="color"
            value={
              borderColor && !borderColor.startsWith("var(")
                ? borderColor
                : "#000000"
            }
            onChange={(e) => onColorChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Border color picker"
          />
          <div
            className="h-full w-full rounded"
            style={{
              backgroundColor:
                borderColor && !borderColor.startsWith("var(")
                  ? borderColor
                  : borderColor
                    ? undefined
                    : "hsl(var(--border))",
            }}
          />
        </div>
        <input
          type="text"
          value={draftColor}
          onChange={(e) => setDraftColor(e.target.value)}
          onBlur={commitColor}
          onKeyDown={(e) => e.key === "Enter" && commitColor()}
          placeholder="color"
          className="h-6 flex-1 min-w-0 bg-transparent border border-border/40 rounded-md px-1.5 text-[10px] font-mono text-muted-foreground focus:outline-none focus:border-sky-500/40"
        />
      </div>
    </div>
  );
}

/* ─── Main Component ─── */

/**
 * Figma-style visual border box model.
 *
 * Shows a preview rectangle with:
 *  - Per-side border width + style controls on each edge
 *  - Per-corner radius inputs at the corners
 *  - A uniform controls row at the bottom (link/unlink, style pills, color)
 *
 *     ╭──r:TL──────────── [top w] ─────────────r:TR──╮
 *     │                                               │
 *  [left w]            (element)                [right w]
 *     │                                               │
 *     ╰──r:BL─────────── [bot w] ─────────────r:BR──╯
 *
 *     [ 🔗 ] [W: 1px]  [ — ][ - ][ · ][ = ][ ✕ ]  [● #hex ]
 */
export function BorderBoxModel({
  sides,
  radii,
  borderColor,
  onSideChange,
  onRadiusChange,
  onColorChange,
  onStyleChange,
  className,
}: BorderBoxModelProps) {
  const [linked, setLinked] = useState(true);

  // Derive a "representative" width from the top side for the linked control
  const linkedWidth = parseNumericValue(sides.top.width);
  const currentStyle = sides.top.style ?? "solid";

  /** Cycle to the next border style */
  const cycleSideStyle = useCallback(
    (side: BorderSide) => {
      const idx = BORDER_STYLES.indexOf(
        (sides[side].style as BorderStyle) ?? "solid",
      );
      const next = BORDER_STYLES[(idx + 1) % BORDER_STYLES.length];
      onSideChange(side, "style", next);
      if (linked) {
        (["top", "right", "bottom", "left"] as BorderSide[]).forEach((s) => {
          if (s !== side) onSideChange(s, "style", next);
        });
      }
    },
    [sides, linked, onSideChange],
  );

  const handleLinkedWidthChange = useCallback(
    (v: string) => {
      (["top", "right", "bottom", "left"] as BorderSide[]).forEach((s) =>
        onSideChange(s, "width", v),
      );
    },
    [onSideChange],
  );

  const handleWidthChange = useCallback(
    (side: BorderSide, v: string) => {
      if (linked) {
        handleLinkedWidthChange(v);
      } else {
        onSideChange(side, "width", v);
      }
    },
    [linked, handleLinkedWidthChange, onSideChange],
  );

  const handleGlobalStyleChange = useCallback(
    (s: BorderStyle) => {
      onStyleChange(s);
    },
    [onStyleChange],
  );

  // Determine a preview border color for the box outline
  const previewColor =
    borderColor && !borderColor.startsWith("var(")
      ? borderColor
      : "hsl(var(--border))";

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Visual box */}
      <div
        className={cn(
          "relative flex flex-col",
          "rounded-lg bg-muted/10 border border-border/30",
          "px-1 py-1 gap-0",
        )}
      >
        {/* ── Top row: TL corner | top side | TR corner ── */}
        <div className="flex items-center gap-1">
          <CornerRadiusInput
            corner="topLeft"
            value={radii.topLeft}
            onChange={(v) => onRadiusChange("topLeft", v)}
            ariaLabel="Top-left radius"
          />

          <div className="flex-1">
            <SideWidth
              side="top"
              width={sides.top.width}
              style={sides.top.style}
              color={sides.top.color ?? borderColor}
              onWidthChange={(v) => handleWidthChange("top", v)}
              onStyleCycle={() => cycleSideStyle("top")}
            />
          </div>

          <CornerRadiusInput
            corner="topRight"
            value={radii.topRight}
            onChange={(v) => onRadiusChange("topRight", v)}
            ariaLabel="Top-right radius"
          />
        </div>

        {/* ── Middle row: left side | content area | right side ── */}
        <div className="flex items-center gap-1">
          {/* Left side */}
          <div className="flex flex-col items-center justify-center w-8 shrink-0">
            <SideWidth
              side="left"
              width={sides.left.width}
              style={sides.left.style}
              color={sides.left.color ?? borderColor}
              onWidthChange={(v) => handleWidthChange("left", v)}
              onStyleCycle={() => cycleSideStyle("left")}
            />
          </div>

          {/* Content area preview */}
          <div
            className={cn(
              "flex-1 min-h-12 rounded-sm flex items-center justify-center",
              "bg-muted/20",
            )}
            style={{
              borderWidth: "1px",
              borderStyle: currentStyle === "none" ? "dashed" : currentStyle,
              borderColor:
                currentStyle === "none"
                  ? "hsl(var(--border) / 0.3)"
                  : previewColor,
              borderRadius: `${parseNumericValue(radii.topLeft)}px ${parseNumericValue(radii.topRight)}px ${parseNumericValue(radii.bottomRight)}px ${parseNumericValue(radii.bottomLeft)}px`,
            }}
          >
            <span className="text-[8px] text-muted-foreground/30 uppercase tracking-wider font-medium select-none">
              border
            </span>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-center justify-center w-8 shrink-0">
            <SideWidth
              side="right"
              width={sides.right.width}
              style={sides.right.style}
              color={sides.right.color ?? borderColor}
              onWidthChange={(v) => handleWidthChange("right", v)}
              onStyleCycle={() => cycleSideStyle("right")}
            />
          </div>
        </div>

        {/* ── Bottom row: BL corner | bottom side | BR corner ── */}
        <div className="flex items-center gap-1">
          <CornerRadiusInput
            corner="bottomLeft"
            value={radii.bottomLeft}
            onChange={(v) => onRadiusChange("bottomLeft", v)}
            ariaLabel="Bottom-left radius"
          />

          <div className="flex-1">
            <SideWidth
              side="bottom"
              width={sides.bottom.width}
              style={sides.bottom.style}
              color={sides.bottom.color ?? borderColor}
              onWidthChange={(v) => handleWidthChange("bottom", v)}
              onStyleCycle={() => cycleSideStyle("bottom")}
            />
          </div>

          <CornerRadiusInput
            corner="bottomRight"
            value={radii.bottomRight}
            onChange={(v) => onRadiusChange("bottomRight", v)}
            ariaLabel="Bottom-right radius"
          />
        </div>
      </div>

      {/* ── Uniform controls row ── */}
      <UniformControls
        linked={linked}
        onToggleLinked={() => setLinked((l) => !l)}
        linkedWidth={linkedWidth}
        onWidthChange={handleLinkedWidthChange}
        currentStyle={currentStyle}
        onStyleChange={handleGlobalStyleChange}
        borderColor={borderColor}
        onColorChange={onColorChange}
      />
    </div>
  );
}
