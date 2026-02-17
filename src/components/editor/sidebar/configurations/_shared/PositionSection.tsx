"use client";

import React, { useCallback, useMemo } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AlignHorizontalDistributeStart,
  AlignHorizontalDistributeCenter,
  AlignHorizontalDistributeEnd,
  AlignVerticalDistributeStart,
  AlignVerticalDistributeCenter,
  AlignVerticalDistributeEnd,
  FlipHorizontal2,
  FlipVertical2,
  Layers,
  Minus,
} from "lucide-react";


type CSSPositionValue = "static" | "relative" | "absolute" | "fixed" | "sticky";
type HorizontalConstraint = "left" | "center" | "right";
type VerticalConstraint = "top" | "center" | "bottom";

interface PositionStyles {
  position?: string;
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
  zIndex?: string | number;
  transform?: string;
}

interface PositionSectionProps {
  styles: PositionStyles;
  updateStyle: (property: string, value: unknown) => void;
  className?: string;
}

/* ─── Helpers ─── */

function parseNumericValue(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number") return value.toString();
  const parsed = parseFloat(value);
  return isNaN(parsed) ? "" : parsed.toString();
}

function parseRotation(transform: string | undefined): string {
  if (!transform) return "0";
  const match = transform.match(/rotate\(([^)]+)\)/);
  if (!match) return "0";
  const parsed = parseFloat(match[1]);
  return isNaN(parsed) ? "0" : parsed.toString();
}

function buildTransformWithRotation(
  existingTransform: string | undefined,
  degrees: number,
): string {
  if (!existingTransform) {
    return degrees === 0 ? "" : `rotate(${degrees}deg)`;
  }
  // Replace existing rotate or append
  const hasRotate = /rotate\([^)]*\)/.test(existingTransform);
  if (hasRotate) {
    const updated = existingTransform.replace(
      /rotate\([^)]*\)/,
      degrees === 0 ? "" : `rotate(${degrees}deg)`,
    );
    return updated.trim();
  }
  return degrees === 0
    ? existingTransform
    : `${existingTransform} rotate(${degrees}deg)`.trim();
}

function hasScale(transform: string | undefined, axis: "X" | "Y"): boolean {
  if (!transform) return false;
  const regex = new RegExp(`scale${axis}\\(\\s*-1\\s*\\)`);
  return regex.test(transform);
}

function toggleScale(
  existingTransform: string | undefined,
  axis: "X" | "Y",
): string {
  const scaleStr = `scale${axis}(-1)`;
  const regex = new RegExp(`\\s*scale${axis}\\(\\s*-1\\s*\\)`);

  if (!existingTransform) return scaleStr;

  if (regex.test(existingTransform)) {
    return existingTransform.replace(regex, "").trim();
  }
  return `${existingTransform} ${scaleStr}`.trim();
}

function inferHConstraint(styles: PositionStyles): HorizontalConstraint | "" {
  const hasLeft =
    styles.left !== undefined && styles.left !== "" && styles.left !== "auto";
  const hasRight =
    styles.right !== undefined &&
    styles.right !== "" &&
    styles.right !== "auto";
  if (hasLeft && hasRight) return "center";
  if (hasRight) return "right";
  if (hasLeft) return "left";
  return "";
}

function inferVConstraint(styles: PositionStyles): VerticalConstraint | "" {
  const hasTop =
    styles.top !== undefined && styles.top !== "" && styles.top !== "auto";
  const hasBottom =
    styles.bottom !== undefined &&
    styles.bottom !== "" &&
    styles.bottom !== "auto";
  if (hasTop && hasBottom) return "center";
  if (hasBottom) return "bottom";
  if (hasTop) return "top";
  return "";
}

/* ─── Compact icon button with tooltip ─── */

function IconBtn({
  tooltip,
  active,
  onClick,
  children,
  className,
}: {
  tooltip: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          className={cn(
            "flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground",
            "transition-all duration-150 hover:bg-muted/60 hover:text-foreground",
            active && "bg-muted text-foreground shadow-sm",
            className,
          )}
          aria-label={tooltip}
        >
          {children}
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-[11px]">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}

/* ─── Compact labeled input (X, Y, rotation, z-index) ─── */

function CompactInput({
  label,
  value,
  onChange,
  placeholder = "0",
  suffix,
  type = "text",
  className,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  suffix?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center h-8 rounded-lg bg-muted/50 border border-border/40 overflow-hidden",
        "focus-within:border-foreground/30 focus-within:ring-1 focus-within:ring-foreground/10",
        "transition-colors",
        className,
      )}
    >
      <span className="flex items-center justify-center h-full px-2 text-[11px] font-medium text-muted-foreground select-none shrink-0 border-r border-border/30">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "flex-1 h-full bg-transparent px-2 text-[12px] font-mono tabular-nums text-foreground",
          "outline-none border-none min-w-0",
          "placeholder:text-muted-foreground/40",
        )}
      />
      {suffix && (
        <span className="flex items-center justify-center h-full px-1.5 text-[10px] text-muted-foreground/60 font-medium select-none shrink-0">
          {suffix}
        </span>
      )}
    </div>
  );
}

/* ─── Main Position Section ─── */

export function PositionSection({
  styles,
  updateStyle,
  className,
}: PositionSectionProps) {
  const positionValue = (styles.position as CSSPositionValue) || "static";
  const isPositioned = positionValue !== "static";
  const showOffsets =
    positionValue === "absolute" ||
    positionValue === "relative" ||
    positionValue === "fixed" ||
    positionValue === "sticky";

  const rotation = useMemo(
    () => parseRotation(styles.transform as string | undefined),
    [styles.transform],
  );
  const isFlippedH = useMemo(
    () => hasScale(styles.transform as string | undefined, "X"),
    [styles.transform],
  );
  const isFlippedV = useMemo(
    () => hasScale(styles.transform as string | undefined, "Y"),
    [styles.transform],
  );

  const hConstraint = useMemo(
    () => inferHConstraint(styles),
    [styles.left, styles.right],
  );
  const vConstraint = useMemo(
    () => inferVConstraint(styles),
    [styles.top, styles.bottom],
  );

  /* ─── Handlers ─── */

  const handlePositionChange = useCallback(
    (value: string) => {
      if (value === "static") {
        updateStyle("position", undefined);
        // Clear offsets when going back to static
        updateStyle("top", undefined);
        updateStyle("right", undefined);
        updateStyle("bottom", undefined);
        updateStyle("left", undefined);
      } else {
        updateStyle("position", value);
      }
    },
    [updateStyle],
  );

  const handleHConstraintChange = useCallback(
    (constraint: string) => {
      const currentLeft = parseNumericValue(styles.left);
      const currentRight = parseNumericValue(styles.right);

      switch (constraint) {
        case "left":
          updateStyle("left", currentLeft || "0");
          updateStyle("right", undefined);
          break;
        case "center":
          updateStyle("left", currentLeft || "0");
          updateStyle("right", currentRight || "0");
          break;
        case "right":
          updateStyle("left", undefined);
          updateStyle("right", currentRight || "0");
          break;
        default:
          // Deselect
          break;
      }
    },
    [updateStyle, styles.left, styles.right],
  );

  const handleVConstraintChange = useCallback(
    (constraint: string) => {
      const currentTop = parseNumericValue(styles.top);
      const currentBottom = parseNumericValue(styles.bottom);

      switch (constraint) {
        case "top":
          updateStyle("top", currentTop || "0");
          updateStyle("bottom", undefined);
          break;
        case "center":
          updateStyle("top", currentTop || "0");
          updateStyle("bottom", currentBottom || "0");
          break;
        case "bottom":
          updateStyle("top", undefined);
          updateStyle("bottom", currentBottom || "0");
          break;
        default:
          break;
      }
    },
    [updateStyle, styles.top, styles.bottom],
  );

  const handleXChange = useCallback(
    (val: string) => {
      if (hConstraint === "right") {
        updateStyle("right", val ? `${val}px` : undefined);
      } else {
        updateStyle("left", val ? `${val}px` : undefined);
      }
    },
    [updateStyle, hConstraint],
  );

  const handleYChange = useCallback(
    (val: string) => {
      if (vConstraint === "bottom") {
        updateStyle("bottom", val ? `${val}px` : undefined);
      } else {
        updateStyle("top", val ? `${val}px` : undefined);
      }
    },
    [updateStyle, vConstraint],
  );

  const handleRotationChange = useCallback(
    (val: string) => {
      const deg = parseFloat(val) || 0;
      const newTransform = buildTransformWithRotation(
        styles.transform as string | undefined,
        deg,
      );
      updateStyle("transform", newTransform || undefined);
    },
    [updateStyle, styles.transform],
  );

  const handleFlipH = useCallback(() => {
    const newTransform = toggleScale(
      styles.transform as string | undefined,
      "X",
    );
    updateStyle("transform", newTransform || undefined);
  }, [updateStyle, styles.transform]);

  const handleFlipV = useCallback(() => {
    const newTransform = toggleScale(
      styles.transform as string | undefined,
      "Y",
    );
    updateStyle("transform", newTransform || undefined);
  }, [updateStyle, styles.transform]);

  const handleResetOffsets = useCallback(() => {
    updateStyle("top", undefined);
    updateStyle("right", undefined);
    updateStyle("bottom", undefined);
    updateStyle("left", undefined);
  }, [updateStyle]);

  /* ─── Derived display values ─── */

  const xValue = useMemo(() => {
    if (hConstraint === "right") return parseNumericValue(styles.right);
    return parseNumericValue(styles.left);
  }, [hConstraint, styles.left, styles.right]);

  const yValue = useMemo(() => {
    if (vConstraint === "bottom") return parseNumericValue(styles.bottom);
    return parseNumericValue(styles.top);
  }, [vConstraint, styles.top, styles.bottom]);

  const xLabel = hConstraint === "right" ? "R" : "X";
  const yLabel = vConstraint === "bottom" ? "B" : "Y";

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {/* ── Position Type Selector ── */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          Position
        </span>
        <Select value={positionValue} onValueChange={handlePositionChange}>
          <SelectTrigger className="h-6 w-[90px] px-2 text-[10px] rounded-md border-border/40 bg-muted/30">
            <SelectValue placeholder="Static" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="relative">Relative</SelectItem>
            <SelectItem value="absolute">Absolute</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="sticky">Sticky</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Constraint Toggles (Figma-style) ── */}
      {showOffsets && (
        <div className="flex items-center gap-2">
          {/* Horizontal constraints */}
          <ToggleGroup
            type="single"
            value={hConstraint}
            onValueChange={handleHConstraintChange}
            className="h-8 gap-0 rounded-lg bg-muted/40 p-0.5 border border-border/30"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="left"
                  aria-label="Pin left"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignHorizontalDistributeStart className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Left
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="center"
                  aria-label="Pin center horizontal"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Left & Right
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="right"
                  aria-label="Pin right"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignHorizontalDistributeEnd className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Right
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {/* Vertical constraints */}
          <ToggleGroup
            type="single"
            value={vConstraint}
            onValueChange={handleVConstraintChange}
            className="h-8 gap-0 rounded-lg bg-muted/40 p-0.5 border border-border/30"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="top"
                  aria-label="Pin top"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignVerticalDistributeStart className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Top
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="center"
                  aria-label="Pin center vertical"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Top & Bottom
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value="bottom"
                  aria-label="Pin bottom"
                  className={cn(
                    "h-7 w-8 min-w-0 rounded-[5px] p-0",
                    "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
                    "transition-all duration-150 hover:text-foreground/80",
                  )}
                >
                  <AlignVerticalDistributeEnd className="h-3.5 w-3.5" />
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Pin Bottom
              </TooltipContent>
            </Tooltip>
          </ToggleGroup>

          {/* Reset offsets */}
          <IconBtn tooltip="Reset offsets" onClick={handleResetOffsets}>
            <Minus className="h-3.5 w-3.5" />
          </IconBtn>
        </div>
      )}

      {/* ── X / Y Coordinate Inputs ── */}
      {showOffsets && (
        <div className="grid grid-cols-2 gap-2">
          <CompactInput
            label={xLabel}
            value={xValue}
            onChange={handleXChange}
            placeholder="0"
          />
          <CompactInput
            label={yLabel}
            value={yValue}
            onChange={handleYChange}
            placeholder="0"
          />
        </div>
      )}

      {/* ── Rotation & Transform Row ── */}
      {isPositioned && (
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <CompactInput
            label="↻"
            value={rotation}
            onChange={handleRotationChange}
            placeholder="0"
            suffix="°"
          />
          <div className="flex items-center gap-0.5">
            <IconBtn
              tooltip="Flip horizontal"
              active={isFlippedH}
              onClick={handleFlipH}
            >
              <FlipHorizontal2 className="h-3.5 w-3.5" />
            </IconBtn>
            <IconBtn
              tooltip="Flip vertical"
              active={isFlippedV}
              onClick={handleFlipV}
            >
              <FlipVertical2 className="h-3.5 w-3.5" />
            </IconBtn>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center h-7 rounded-md bg-muted/40 border border-border/30 px-1.5 gap-1">
                  <Layers className="h-3 w-3 text-muted-foreground/60" />
                  <input
                    type="number"
                    value={styles.zIndex ?? ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateStyle(
                        "zIndex",
                        val === "" ? undefined : parseInt(val, 10),
                      );
                    }}
                    placeholder="0"
                    className={cn(
                      "w-[32px] h-full bg-transparent text-[11px] font-mono tabular-nums text-foreground",
                      "outline-none border-none text-center",
                      "placeholder:text-muted-foreground/40",
                    )}
                    aria-label="Z-Index"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-[11px]">
                Z-Index (stack order)
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* ── Static mode: Z-Index only ── */}
      {!isPositioned && (
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground/70">Z-Index</span>
          <div className="flex items-center h-7 rounded-md bg-muted/40 border border-border/30 px-1.5 gap-1">
            <Layers className="h-3 w-3 text-muted-foreground/60" />
            <input
              type="number"
              value={styles.zIndex ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                updateStyle(
                  "zIndex",
                  val === "" ? undefined : parseInt(val, 10),
                );
              }}
              placeholder="auto"
              className={cn(
                "w-[48px] h-full bg-transparent text-[11px] font-mono tabular-nums text-foreground",
                "outline-none border-none text-center",
                "placeholder:text-muted-foreground/40",
              )}
              aria-label="Z-Index"
            />
          </div>
        </div>
      )}
    </div>
  );
}
