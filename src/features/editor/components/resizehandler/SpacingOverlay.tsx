"use client";

import React, { memo } from "react";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";

type SpacingSide = "top" | "bottom" | "left" | "right";

const MARGIN_STRIPE = `linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)`;
const MARGIN_BG = "rgba(249, 115, 22, 0.15)";
const MARGIN_BORDER = "1px dashed rgba(249, 115, 22, 0.3)";

const BASE_LABEL_STYLE: React.CSSProperties = {
  position: "absolute",
  fontSize: "9px",
  fontWeight: 600,
  padding: "1px 3px",
  borderRadius: "2px",
  pointerEvents: "none",
  zIndex: 40,
  whiteSpace: "nowrap",
};

function getSideLabelPosition(
  side: SpacingSide,
  value: string,
  isMargin: boolean,
): React.CSSProperties {
  const half = `${parseFloat(value) / 2}px`;
  const outer = isMargin ? `-${half}` : "0";
  const inner = isMargin ? 0 : "4px";

  switch (side) {
    case "top":
      return { top: outer, left: "50%", transform: "translate(-50%, -50%)", marginTop: inner };
    case "bottom":
      return { bottom: outer, left: "50%", transform: "translate(-50%, 50%)", marginBottom: inner };
    case "left":
      return { left: outer, top: "50%", transform: "translate(-50%, -50%)", marginLeft: inner };
    case "right":
      return { right: outer, top: "50%", transform: "translate(50%, -50%)", marginRight: inner };
  }
}

function buildMarginSlabStyle(side: SpacingSide, value: string): React.CSSProperties {
  const base: React.CSSProperties = {
    position: "absolute",
    backgroundColor: MARGIN_BG,
    backgroundImage: MARGIN_STRIPE,
    backgroundSize: "8px 8px",
  };

  switch (side) {
    case "top":
      return { ...base, bottom: "100%", left: 0, right: 0, height: value, borderLeft: MARGIN_BORDER, borderRight: MARGIN_BORDER, borderTop: MARGIN_BORDER };
    case "bottom":
      return { ...base, top: "100%", left: 0, right: 0, height: value, borderLeft: MARGIN_BORDER, borderRight: MARGIN_BORDER, borderBottom: MARGIN_BORDER };
    case "left":
      return { ...base, right: "100%", top: 0, bottom: 0, width: value, borderTop: MARGIN_BORDER, borderBottom: MARGIN_BORDER, borderLeft: MARGIN_BORDER };
    case "right":
      return { ...base, left: "100%", top: 0, bottom: 0, width: value, borderTop: MARGIN_BORDER, borderBottom: MARGIN_BORDER, borderRight: MARGIN_BORDER };
  }
}

const SIDES: SpacingSide[] = ["top", "bottom", "left", "right"];

function SpacingValueLabel({
  value,
  type,
  side,
}: {
  value: string | undefined;
  type: "margin" | "padding";
  side: SpacingSide;
}) {
  if (!value || value === "0px" || value === "0") return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue === 0) return null;

  const isMargin = type === "margin";
  const colorClass = isMargin
    ? "text-orange-600 bg-orange-100/80"
    : "text-emerald-600 bg-emerald-100/80";

  return (
    <div
      style={{ ...BASE_LABEL_STYLE, ...getSideLabelPosition(side, value, isMargin) }}
      className={cn("shadow-sm backdrop-blur-[1px]", colorClass)}
    >
      {numValue}
    </div>
  );
}

export const SpacingOverlay = memo(function SpacingOverlay({
  element,
  show,
}: {
  element: EditorElement;
  show: boolean;
}) {
  if (!show) return null;

  const s = element.styles?.default ?? {};

  const margin: Record<SpacingSide, string> = {
    top:    String(s.marginTop    ?? "0px"),
    bottom: String(s.marginBottom ?? "0px"),
    left:   String(s.marginLeft   ?? "0px"),
    right:  String(s.marginRight  ?? "0px"),
  };

  const padding: Record<SpacingSide, string> = {
    top:    String(s.paddingTop    ?? "0px"),
    bottom: String(s.paddingBottom ?? "0px"),
    left:   String(s.paddingLeft   ?? "0px"),
    right:  String(s.paddingRight  ?? "0px"),
  };

  return (
    <>
      {/* Margin bands */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {SIDES.map((side) => (
          <div key={side} style={buildMarginSlabStyle(side, margin[side])}>
            <SpacingValueLabel value={margin[side]} type="margin" side={side} />
          </div>
        ))}
      </div>

      {/* Padding inset */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          borderTopWidth:    padding.top,
          borderRightWidth:  padding.right,
          borderBottomWidth: padding.bottom,
          borderLeftWidth:   padding.left,
          borderColor: "rgba(16, 185, 129, 0.15)",
          borderStyle: "solid",
          boxSizing: "border-box",
        }}
      >
        <div className="w-full h-full border border-dashed border-emerald-500/30 relative">
          {SIDES.map((side) => (
            <SpacingValueLabel key={side} value={padding[side]} type="padding" side={side} />
          ))}
        </div>
      </div>
    </>
  );
});
