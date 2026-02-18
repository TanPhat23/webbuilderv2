"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/* ─── Types ─── */

interface SpacingValues {
  top: string | number | undefined;
  right: string | number | undefined;
  bottom: string | number | undefined;
  left: string | number | undefined;
}

interface SpacingBoxModelProps {
  margin: SpacingValues;
  padding: SpacingValues;
  onMarginChange: (
    direction: "top" | "right" | "bottom" | "left",
    value: string,
  ) => void;
  onPaddingChange: (
    direction: "top" | "right" | "bottom" | "left",
    value: string,
  ) => void;
  className?: string;
}

/* ─── Inline editable value ─── */

interface InlineValueProps {
  value: string | number | undefined;
  onChange: (value: string) => void;
  className?: string;
  /** Where this input sits so we can pick a sensible width */
  orientation: "horizontal" | "vertical";
  ariaLabel?: string;
}

function parseDisplayValue(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "0";
  const str = String(value);
  const num = parseInt(str, 10);
  if (isNaN(num)) return "0";
  return String(num);
}

function InlineValue({
  value,
  onChange,
  className,
  orientation,
  ariaLabel,
}: InlineValueProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const displayed = parseDisplayValue(value);

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

    // If the user typed a plain number, append "px"
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && String(num) === trimmed) {
      onChange(`${num}px`);
    } else {
      onChange(trimmed);
    }
  }, [draft, displayed, onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        commit();
      } else if (e.key === "Escape") {
        setEditing(false);
      } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const current = parseInt(displayed, 10) || 0;
        const delta = e.key === "ArrowUp" ? 1 : -1;
        const next = current + delta;
        onChange(`${next}px`);
        setDraft(String(next));
      }
    },
    [commit, displayed, onChange],
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
          "bg-transparent text-center font-mono outline-none",
          "border border-white/30 rounded-sm",
          "text-[10px] leading-none",
          orientation === "horizontal"
            ? "w-7.5 h-4 px-0.5"
            : "w-6.5 h-3.5 px-0.5",
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
        "rounded-sm px-0.5 py-px",
        "hover:bg-white/10 transition-colors duration-100",
        "tabular-nums select-none min-w-4.5 text-center",
        className,
      )}
    >
      {displayed}
    </button>
  );
}

/* ─── Main Component ─── */

/**
 * Figma / Chrome DevTools-inspired visual box model.
 *
 * Shows nested rectangles for margin → padding → content,
 * with inline-editable values on each edge.
 *
 * ┌─────────────── margin ───────────────┐
 * │               [top]                  │
 * │        ┌─── padding ───┐             │
 * │ [left] │     [top]     │ [right]     │
 * │        │[l] content [r]│             │
 * │        │    [bottom]   │             │
 * │        └───────────────┘             │
 * │              [bottom]                │
 * └──────────────────────────────────────┘
 */
export function SpacingBoxModel({
  margin,
  padding,
  onMarginChange,
  onPaddingChange,
  className,
}: SpacingBoxModelProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {/* Margin outer box */}
      <div
        className={cn(
          "relative flex flex-col items-center",
          "rounded-lg border border-dashed border-orange-400/40",
          "bg-orange-500/6",
          "px-2 pt-1 pb-1",
        )}
      >
        {/* Margin label */}
        <span className="absolute top-0.75 left-1.5 text-[8px] font-semibold uppercase tracking-widest text-orange-400/60 select-none pointer-events-none">
          margin
        </span>

        {/* Margin top */}
        <div className="flex items-center justify-center w-full h-5">
          <InlineValue
            value={margin.top}
            onChange={(v) => onMarginChange("top", v)}
            orientation="horizontal"
            ariaLabel="Margin top"
            className="text-orange-300/90"
          />
        </div>

        {/* Middle row: margin-left | padding box | margin-right */}
        <div className="flex items-center w-full gap-0">
          {/* Margin left */}
          <div className="flex items-center justify-center w-8 shrink-0">
            <InlineValue
              value={margin.left}
              onChange={(v) => onMarginChange("left", v)}
              orientation="vertical"
              ariaLabel="Margin left"
              className="text-orange-300/90"
            />
          </div>

          {/* Padding inner box */}
          <div
            className={cn(
              "relative flex flex-col items-center flex-1",
              "rounded-md border border-dashed border-emerald-400/40",
              "bg-emerald-500/6",
              "px-2 pt-1 pb-1",
              "min-h-20",
            )}
          >
            {/* Padding label */}
            <span className="absolute top-0.5 left-1.25 text-[8px] font-semibold uppercase tracking-widest text-emerald-400/60 select-none pointer-events-none">
              padding
            </span>

            {/* Padding top */}
            <div className="flex items-center justify-center w-full h-4.5">
              <InlineValue
                value={padding.top}
                onChange={(v) => onPaddingChange("top", v)}
                orientation="horizontal"
                ariaLabel="Padding top"
                className="text-emerald-300/90"
              />
            </div>

            {/* Middle: padding-left | content | padding-right */}
            <div className="flex items-center w-full gap-0 flex-1">
              <div className="flex items-center justify-center w-7 shrink-0">
                <InlineValue
                  value={padding.left}
                  onChange={(v) => onPaddingChange("left", v)}
                  orientation="vertical"
                  ariaLabel="Padding left"
                  className="text-emerald-300/90"
                />
              </div>

              {/* Content placeholder */}
              <div
                className={cn(
                  "flex-1 rounded border border-border/30",
                  "bg-muted/20",
                  "flex items-center justify-center",
                  "min-h-6 min-w-10",
                )}
              >
                <span className="text-[8px] text-muted-foreground/40 select-none uppercase tracking-wider font-medium">
                  content
                </span>
              </div>

              <div className="flex items-center justify-center w-7 shrink-0">
                <InlineValue
                  value={padding.right}
                  onChange={(v) => onPaddingChange("right", v)}
                  orientation="vertical"
                  ariaLabel="Padding right"
                  className="text-emerald-300/90"
                />
              </div>
            </div>

            {/* Padding bottom */}
            <div className="flex items-center justify-center w-full h-4.5">
              <InlineValue
                value={padding.bottom}
                onChange={(v) => onPaddingChange("bottom", v)}
                orientation="horizontal"
                ariaLabel="Padding bottom"
                className="text-emerald-300/90"
              />
            </div>
          </div>

          {/* Margin right */}
          <div className="flex items-center justify-center w-8 shrink-0">
            <InlineValue
              value={margin.right}
              onChange={(v) => onMarginChange("right", v)}
              orientation="vertical"
              ariaLabel="Margin right"
              className="text-orange-300/90"
            />
          </div>
        </div>

        {/* Margin bottom */}
        <div className="flex items-center justify-center w-full h-5">
          <InlineValue
            value={margin.bottom}
            onChange={(v) => onMarginChange("bottom", v)}
            orientation="horizontal"
            ariaLabel="Margin bottom"
            className="text-orange-300/90"
          />
        </div>
      </div>
    </div>
  );
}
