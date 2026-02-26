"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { FontFamilyPicker } from "./FontFamilyPicker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Underline,
  Strikethrough,
  Italic,
  Minus,
  ChevronUp,
  ChevronDown,
  Type,
} from "lucide-react";

/* ─── Types ─── */

export type TextAlign = "left" | "center" | "right" | "justify";
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";
export type TextDecoration = "none" | "underline" | "line-through" | "overline";
export type FontStyle = "normal" | "italic" | "oblique";
export type WhiteSpace = "normal" | "nowrap" | "pre" | "pre-wrap" | "pre-line";
export type TextOverflow = "clip" | "ellipsis";
export type WordBreak = "normal" | "break-all" | "break-word" | "keep-all";

export interface TypographyValues {
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string | number;
  fontStyle?: FontStyle;
  color?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  wordSpacing?: string | number;
  textAlign?: TextAlign;
  textTransform?: TextTransform;
  textDecoration?: TextDecoration;
  textShadow?: string;
  whiteSpace?: WhiteSpace;
  textOverflow?: TextOverflow;
  wordBreak?: WordBreak;
}

export interface TypographyPanelProps {
  values: TypographyValues;
  onChange: <K extends keyof TypographyValues>(
    property: K,
    value: TypographyValues[K],
  ) => void;
  fonts?: string[];
  className?: string;
}

/* ─── Constants ─── */

const FONT_WEIGHTS: { label: string; value: number; abbr: string }[] = [
  { label: "Thin", value: 100, abbr: "100" },
  { label: "Extra Light", value: 200, abbr: "200" },
  { label: "Light", value: 300, abbr: "Lt" },
  { label: "Regular", value: 400, abbr: "Rg" },
  { label: "Medium", value: 500, abbr: "Md" },
  { label: "Semi Bold", value: 600, abbr: "Sb" },
  { label: "Bold", value: 700, abbr: "Bd" },
  { label: "Extra Bold", value: 800, abbr: "Eb" },
  { label: "Black", value: 900, abbr: "Bk" },
];

const FONT_SIZE_UNITS = ["px", "rem", "em", "%", "vw", "vh"] as const;

/* ─── Helpers ─── */

function parseFontSize(v: string | number | undefined): string {
  if (!v) return "16px";
  return String(v);
}

function parseUnit(fontSize: string): string {
  return fontSize.match(/[a-z%]+$/)?.[0] ?? "px";
}

function parseNumeric(fontSize: string): string {
  return fontSize.replace(/[^0-9.]/g, "") || "16";
}

function parseLineHeight(v: string | number | undefined): string {
  if (v === undefined || v === null || v === "") return "1.5";
  return String(v);
}

function parseLetterSpacing(v: string | number | undefined): string {
  if (v === undefined || v === null || v === "") return "0";
  const num = parseFloat(String(v));
  return isNaN(num) ? "0" : String(num);
}

function parseFontWeight(v: string | number | undefined): number {
  const n = Number(v);
  return isNaN(n) || !n ? 400 : n;
}

/* ─── NudgeInput ─── */
/**
 * shadcn Input with arrow-key nudging and ▲/▼ spinner buttons.
 * Wraps the shadcn <Input> so focus-ring / dark-mode styles are inherited.
 */
interface NudgeInputProps {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  ariaLabel?: string;
  className?: string;
}

function NudgeInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  ariaLabel,
  className,
}: NudgeInputProps) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setDraft(value);
  }, [value, focused]);

  const nudge = useCallback(
    (delta: number) => {
      const num = parseFloat(value) || 0;
      let next = Math.round((num + delta) * 1000) / 1000;
      if (min !== undefined) next = Math.max(min, next);
      if (max !== undefined) next = Math.min(max, next);
      onChange(String(next));
    },
    [value, min, max, onChange],
  );

  const commit = useCallback(
    (raw: string) => {
      setFocused(false);
      const trimmed = raw.trim();
      if (trimmed) onChange(trimmed);
    },
    [onChange],
  );

  return (
    <div
      className={cn(
        "flex h-8 items-stretch overflow-hidden rounded-md border border-input bg-transparent shadow-xs",
        className,
      )}
    >
      <input
        aria-label={ariaLabel}
        value={focused ? draft : value}
        onFocus={() => {
          setDraft(value);
          setFocused(true);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(draft);
          else if (e.key === "Escape") {
            setFocused(false);
            setDraft(value);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            nudge(step);
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            nudge(-step);
          }
        }}
        className="min-w-0 flex-1 bg-transparent px-2 text-[11px] font-mono text-foreground outline-none placeholder:text-muted-foreground"
        placeholder="—"
      />
      {suffix && (
        <span className="flex items-center pr-1 text-[9px] font-medium text-muted-foreground/50 select-none">
          {suffix}
        </span>
      )}
      <div className="flex flex-col border-l border-input">
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            nudge(step);
          }}
          className="flex h-4 w-4 items-center justify-center text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors"
        >
          <ChevronUp className="size-2.5" />
        </button>
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={(e) => {
            e.preventDefault();
            nudge(-step);
          }}
          className="flex h-4 w-4 items-center justify-center border-t border-input text-muted-foreground/40 hover:bg-muted/50 hover:text-muted-foreground transition-colors"
        >
          <ChevronDown className="size-2.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Row ─── */

function Row({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Label className="w-14 shrink-0 text-[10px] font-medium text-muted-foreground/70">
        {label}
      </Label>
      <div className="flex flex-1 items-center gap-1.5 min-w-0">{children}</div>
    </div>
  );
}

/* ─── SectionLabel ─── */

function SectionLabel({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && (
        <span className="text-muted-foreground/40 [&>svg]:size-3">{icon}</span>
      )}
      <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/50 select-none">
        {children}
      </span>
    </div>
  );
}

/* ─── Live Preview ─── */

function LivePreview({ values }: { values: TypographyValues }) {
  const fontSize = parseFontSize(values.fontSize);
  const previewSize = (() => {
    const raw = parseFloat(fontSize);
    if (isNaN(raw)) return "14px";
    const unit = parseUnit(fontSize);
    const px = unit === "rem" || unit === "em" ? raw * 16 : raw;
    return `${Math.min(Math.max(px, 10), 30)}px`;
  })();

  return (
    <div className="relative flex min-h-14 w-full items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/10 px-3 py-2">
      <span
        className="max-w-full select-none leading-tight truncate"
        style={{
          fontFamily: values.fontFamily ?? undefined,
          fontSize: previewSize,
          fontWeight: values.fontWeight ?? 400,
          fontStyle: values.fontStyle ?? "normal",
          color: values.color ?? undefined,
          letterSpacing: values.letterSpacing
            ? `${parseLetterSpacing(values.letterSpacing)}px`
            : undefined,
          lineHeight: values.lineHeight
            ? parseLineHeight(values.lineHeight)
            : undefined,
          textAlign: values.textAlign ?? "center",
          textTransform: values.textTransform ?? undefined,
          textDecoration: values.textDecoration ?? undefined,
        }}
      >
        {values.fontFamily || "Typography"}
      </span>
      <span className="absolute bottom-1 left-2 text-[8px] font-mono text-muted-foreground/30 select-none">
        {values.fontWeight ?? 400}
      </span>
      <span className="absolute bottom-1 right-2 text-[8px] font-mono text-muted-foreground/30 select-none">
        {fontSize}
      </span>
    </div>
  );
}

/* ─── Main Component ─── */

export function TypographyPanel({
  values,
  onChange,
  fonts = [],
  className,
}: TypographyPanelProps) {
  const fontWeight = parseFontWeight(values.fontWeight);
  const fontSize = parseFontSize(values.fontSize);
  const unit = parseUnit(fontSize);
  const numericSize = parseNumeric(fontSize);
  const lineHeight = parseLineHeight(values.lineHeight);
  const letterSpacing = parseLetterSpacing(values.letterSpacing);
  const wordSpacing = values.wordSpacing
    ? String(parseFloat(String(values.wordSpacing)) || 0)
    : "0";

  // color input state
  const [colorDraft, setColorDraft] = useState(values.color ?? "");
  useEffect(() => setColorDraft(values.color ?? ""), [values.color]);
  const commitColor = useCallback(() => {
    onChange("color", colorDraft.trim() || undefined);
  }, [colorDraft, onChange]);

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-3", className)}>
        <LivePreview values={values} />

        {/* ══════════════════ FONT ══════════════════ */}
        <div className="flex flex-col gap-2">
          <SectionLabel icon={<Type />}>Font</SectionLabel>

          {/* Family */}
          <Row label="Family">
            {fonts.length > 0 ? (
              <FontFamilyPicker
                value={values.fontFamily}
                onChange={(v) => onChange("fontFamily", v)}
                fonts={fonts}
              />
            ) : (
              <Input
                value={values.fontFamily ?? ""}
                onChange={(e) =>
                  onChange("fontFamily", e.target.value || undefined)
                }
                placeholder="Inter, sans-serif"
                className="h-8 flex-1 text-[10px] font-mono"
                style={{ fontFamily: values.fontFamily ?? undefined }}
              />
            )}
          </Row>

          {/* Size */}
          <Row label="Size">
            <NudgeInput
              value={numericSize}
              onChange={(v) => onChange("fontSize", `${v}${unit}`)}
              min={1}
              max={999}
              step={1}
              ariaLabel="Font size"
              className="w-20"
            />
            <Select
              value={unit}
              onValueChange={(u) => onChange("fontSize", `${numericSize}${u}`)}
            >
              <SelectTrigger
                size="sm"
                className="h-8 w-16 text-[10px] font-mono"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZE_UNITS.map((u) => (
                  <SelectItem
                    key={u}
                    value={u}
                    className="text-[10px] font-mono"
                  >
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>

          {/* Weight */}
          <Row label="Weight">
            <div className="flex flex-wrap gap-0.5">
              <TooltipProvider>
                {FONT_WEIGHTS.map((w) => (
                  <Tooltip key={w.value}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="xs"
                        variant={fontWeight === w.value ? "secondary" : "ghost"}
                        onClick={() => onChange("fontWeight", w.value)}
                        className="h-6 px-1.5 text-[9px] font-mono"
                        style={{ fontWeight: w.value }}
                      >
                        {w.abbr}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px]">
                      {w.label} ({w.value})
                    </TooltipContent>
                  </Tooltip>
                ))}
              </TooltipProvider>
            </div>
          </Row>

          {/* Style + Color */}
          <Row label="Style">
            <ToggleGroup
              type="single"
              value={values.fontStyle ?? "normal"}
              onValueChange={(v) =>
                onChange("fontStyle", (v as FontStyle) || "normal")
              }
              className="gap-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="normal"
                    size="sm"
                    className="h-7 w-7 px-0 text-[10px] font-medium"
                  >
                    N
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Normal
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="italic"
                    size="sm"
                    className="h-7 w-7 px-0"
                  >
                    <Italic className="size-3" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Italic
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="oblique"
                    size="sm"
                    className="h-7 w-7 px-0 text-[10px] italic -skew-x-6 font-medium"
                  >
                    O
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Oblique
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>

            {/* Color */}
            <div className="ml-auto flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative size-7 shrink-0 cursor-pointer overflow-hidden rounded-md border border-input shadow-xs">
                    <input
                      type="color"
                      value={
                        values.color && !values.color.startsWith("var(")
                          ? values.color
                          : "#000000"
                      }
                      onChange={(e) => onChange("color", e.target.value)}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                      aria-label="Text color"
                    />
                    <div
                      className="size-full"
                      style={{
                        backgroundColor:
                          values.color && !values.color.startsWith("var(")
                            ? values.color
                            : values.color
                              ? undefined
                              : "hsl(var(--foreground))",
                        ...(values.color?.startsWith("var(")
                          ? { backgroundColor: values.color }
                          : {}),
                      }}
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Text color
                </TooltipContent>
              </Tooltip>
              <Input
                value={colorDraft}
                onChange={(e) => setColorDraft(e.target.value)}
                onBlur={commitColor}
                onKeyDown={(e) => e.key === "Enter" && commitColor()}
                placeholder="var(--foreground)"
                className="h-7 w-24 text-[10px] font-mono"
              />
            </div>
          </Row>
        </div>

        <Separator />

        {/* ══════════════════ METRICS ══════════════════ */}
        <div className="flex flex-col gap-2">
          <SectionLabel>Metrics</SectionLabel>

          {/* Line Height + Letter Spacing */}
          <Row label="Line H">
            <NudgeInput
              value={lineHeight}
              onChange={(v) => onChange("lineHeight", v)}
              min={0.5}
              max={10}
              step={0.1}
              ariaLabel="Line height"
              className="w-20"
            />
            <Label className="ml-1 shrink-0 text-[10px] font-medium text-muted-foreground/70">
              Letter
            </Label>
            <NudgeInput
              value={letterSpacing}
              onChange={(v) => onChange("letterSpacing", `${v}px`)}
              min={-20}
              max={100}
              step={0.5}
              suffix="px"
              ariaLabel="Letter spacing"
              className="w-24"
            />
          </Row>

          {/* Word Spacing */}
          <Row label="Word">
            <NudgeInput
              value={wordSpacing}
              onChange={(v) => onChange("wordSpacing", `${v}px`)}
              min={-20}
              max={100}
              step={1}
              suffix="px"
              ariaLabel="Word spacing"
              className="w-24"
            />
          </Row>
        </div>

        <Separator />

        {/* ══════════════════ TEXT ══════════════════ */}
        <div className="flex flex-col gap-2">
          <SectionLabel>Text</SectionLabel>

          {/* Align */}
          <Row label="Align">
            <ToggleGroup
              type="single"
              value={values.textAlign ?? ""}
              onValueChange={(v) =>
                onChange("textAlign", (v as TextAlign) || undefined)
              }
              className="gap-0"
            >
              {(
                [
                  {
                    v: "left",
                    icon: <AlignLeft className="size-3" />,
                    label: "Left",
                  },
                  {
                    v: "center",
                    icon: <AlignCenter className="size-3" />,
                    label: "Center",
                  },
                  {
                    v: "right",
                    icon: <AlignRight className="size-3" />,
                    label: "Right",
                  },
                  {
                    v: "justify",
                    icon: <AlignJustify className="size-3" />,
                    label: "Justify",
                  },
                ] as const
              ).map(({ v, icon, label }) => (
                <Tooltip key={v}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={v}
                      size="sm"
                      className="h-7 w-7 px-0"
                    >
                      {icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">
                    {label}
                  </TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </Row>

          {/* Case */}
          <Row label="Case">
            <ToggleGroup
              type="single"
              value={values.textTransform ?? "none"}
              onValueChange={(v) =>
                onChange(
                  "textTransform",
                  !v || v === "none" ? undefined : (v as TextTransform),
                )
              }
              className="gap-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="none"
                    size="sm"
                    className="h-7 w-7 px-0"
                  >
                    <Minus className="size-3" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  None
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="capitalize"
                    size="sm"
                    className="h-7 px-2 text-[9px] font-semibold"
                  >
                    Aa
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Capitalize
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="uppercase"
                    size="sm"
                    className="h-7 px-2 text-[9px] font-semibold"
                  >
                    AA
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Uppercase
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="lowercase"
                    size="sm"
                    className="h-7 px-2 text-[9px] font-semibold"
                  >
                    aa
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Lowercase
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </Row>

          {/* Decoration */}
          <Row label="Decor">
            <ToggleGroup
              type="single"
              value={values.textDecoration ?? "none"}
              onValueChange={(v) =>
                onChange(
                  "textDecoration",
                  !v || v === "none" ? undefined : (v as TextDecoration),
                )
              }
              className="gap-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="none"
                    size="sm"
                    className="h-7 w-7 px-0"
                  >
                    <Minus className="size-3" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  None
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="underline"
                    size="sm"
                    className="h-7 w-7 px-0"
                  >
                    <Underline className="size-3" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Underline
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="line-through"
                    size="sm"
                    className="h-7 w-7 px-0"
                  >
                    <Strikethrough className="size-3" />
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Strikethrough
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="overline"
                    size="sm"
                    className="h-7 w-7 px-0 text-[10px] font-medium overline"
                  >
                    O
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Overline
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </Row>

          {/* Shadow */}
          <Row label="Shadow">
            <Input
              value={values.textShadow ?? ""}
              onChange={(e) =>
                onChange("textShadow", e.target.value || undefined)
              }
              placeholder="2px 2px 4px #000"
              className="h-8 flex-1 text-[10px] font-mono"
            />
          </Row>
        </div>

        <Separator />

        {/* ══════════════════ OVERFLOW ══════════════════ */}
        <div className="flex flex-col gap-2">
          <SectionLabel>Overflow</SectionLabel>

          {/* White Space */}
          <Row label="Wrap">
            <Select
              value={values.whiteSpace ?? "normal"}
              onValueChange={(v) => onChange("whiteSpace", v as WhiteSpace)}
            >
              <SelectTrigger size="sm" className="h-8 flex-1 text-[10px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  [
                    { v: "normal", label: "Normal" },
                    { v: "nowrap", label: "No Wrap" },
                    { v: "pre", label: "Pre" },
                    { v: "pre-wrap", label: "Pre Wrap" },
                    { v: "pre-line", label: "Pre Line" },
                  ] as const
                ).map(({ v, label }) => (
                  <SelectItem key={v} value={v} className="text-[10px]">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Row>

          {/* Text Overflow + Word Break */}
          <Row label="Overflow">
            <ToggleGroup
              type="single"
              value={values.textOverflow ?? "clip"}
              onValueChange={(v) =>
                v && onChange("textOverflow", v as TextOverflow)
              }
              className="gap-0"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="clip"
                    size="sm"
                    className="h-7 px-2 text-[9px]"
                  >
                    Clip
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Clip overflow
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ToggleGroupItem
                    value="ellipsis"
                    size="sm"
                    className="h-7 px-2 text-[9px]"
                  >
                    …
                  </ToggleGroupItem>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-[10px]">
                  Ellipsis
                </TooltipContent>
              </Tooltip>
            </ToggleGroup>
          </Row>

          {/* Word Break */}
          <Row label="Break">
            <ToggleGroup
              type="single"
              value={values.wordBreak ?? "normal"}
              onValueChange={(v) => v && onChange("wordBreak", v as WordBreak)}
              className="gap-0"
            >
              {(
                [
                  { v: "normal", label: "—", tooltip: "Normal" },
                  { v: "break-all", label: "All", tooltip: "Break All" },
                  { v: "break-word", label: "Wrd", tooltip: "Break Word" },
                  { v: "keep-all", label: "Keep", tooltip: "Keep All" },
                ] as const
              ).map(({ v, label, tooltip }) => (
                <Tooltip key={v}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={v}
                      size="sm"
                      className="h-7 px-2 text-[9px]"
                    >
                      {label}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-[10px]">
                    {tooltip}
                  </TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </Row>
        </div>
      </div>
    </TooltipProvider>
  );
}
