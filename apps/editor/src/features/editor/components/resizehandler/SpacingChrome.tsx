import React, { memo, useMemo, useState } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  readComputedSpacing,
  spacingCursor,
  type ComputedSpacing,
  type GapAxis,
  type SpacingHandleId,
  type SpacingSide,
} from "@/features/editor/utils/element/spacingMath";
import type { ManipulationSession } from "../canvas/canvasTypes";
import type { ElementRect } from "../canvas/useElementRect";

export interface SpacingChromeProps {
  readonly rect: ElementRect;
  readonly element: EditorElement;
  readonly node: HTMLElement | null;
  readonly session: ManipulationSession;
  readonly canEdit: boolean;
  readonly showAllSpacing: boolean;
  readonly onStartSpacing: (
    element: EditorElement,
    node: HTMLElement,
    handle: SpacingHandleId,
    event: React.PointerEvent,
  ) => void;
}

const SIDES: readonly SpacingSide[] = ["top", "right", "bottom", "left"];
const MIN_BOX_FOR_SPACING = 36;

interface GapSlotRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
  readonly axis: GapAxis;
}

function measureFirstGapSlot(
  node: HTMLElement,
  gapAxis: GapAxis,
): GapSlotRect | null {
  const children = node.children;
  if (children.length < 2) return null;
  const first = children[0];
  const second = children[1];
  if (!first || !second) return null;

  const parentRect = node.getBoundingClientRect();
  const r1 = first.getBoundingClientRect();
  const r2 = second.getBoundingClientRect();

  if (gapAxis === "horizontal") {
    const start = Math.min(r1.right, r2.left);
    const end = Math.max(r1.right, r2.left);
    const left = start - parentRect.left;
    const width = Math.max(8, end - start);
    const top = Math.min(r1.top, r2.top) - parentRect.top;
    const height = Math.max(16, Math.max(r1.bottom, r2.bottom) - Math.min(r1.top, r2.top));
    return { left, top, width, height, axis: "horizontal" };
  }

  const start = Math.min(r1.bottom, r2.top);
  const end = Math.max(r1.bottom, r2.top);
  const top = start - parentRect.top;
  const height = Math.max(8, end - start);
  const left = Math.min(r1.left, r2.left) - parentRect.left;
  const width = Math.max(16, Math.max(r1.right, r2.right) - Math.min(r1.left, r2.left));
  return { left, top, width, height, axis: "vertical" };
}

function paddingBandStyle(side: SpacingSide, px: number): React.CSSProperties {
  switch (side) {
    case "top":
      return { top: 0, left: 0, right: 0, height: px };
    case "bottom":
      return { bottom: 0, left: 0, right: 0, height: px };
    case "left":
      return { top: 0, bottom: 0, left: 0, width: px };
    case "right":
      return { top: 0, bottom: 0, right: 0, width: px };
  }
}

function marginBandStyle(side: SpacingSide, px: number): React.CSSProperties {
  switch (side) {
    case "top":
      return { top: -px, left: 0, right: 0, height: px };
    case "bottom":
      return { bottom: -px, left: 0, right: 0, height: px };
    case "left":
      return { top: 0, bottom: 0, left: -px, width: px };
    case "right":
      return { top: 0, bottom: 0, right: -px, width: px };
  }
}

function paddingHandlePosition(side: SpacingSide, px: number): React.CSSProperties {
  const inset = Math.max(8, Math.min(px / 2, 24));
  switch (side) {
    case "top":
      return { top: inset, left: "50%", transform: "translate(-50%, -50%)" };
    case "bottom":
      return { bottom: inset, left: "50%", transform: "translate(-50%, 50%)" };
    case "left":
      return { left: inset, top: "50%", transform: "translate(-50%, -50%)" };
    case "right":
      return { right: inset, top: "50%", transform: "translate(50%, -50%)" };
  }
}

function marginHandlePosition(side: SpacingSide, px: number): React.CSSProperties {
  const offset = Math.max(10, Math.min(px / 2, 26));
  switch (side) {
    case "top":
      return { top: -offset, left: "50%", transform: "translate(-50%, -50%)" };
    case "bottom":
      return { bottom: -offset, left: "50%", transform: "translate(-50%, 50%)" };
    case "left":
      return { left: -offset, top: "50%", transform: "translate(-50%, -50%)" };
    case "right":
      return { right: -offset, top: "50%", transform: "translate(50%, -50%)" };
  }
}

export const SpacingChrome = memo(function SpacingChrome({
  rect,
  element,
  node,
  session,
  canEdit,
  showAllSpacing,
  onStartSpacing,
}: SpacingChromeProps): React.ReactElement | null {
  const [hoveredHandle, setHoveredHandle] = useState<SpacingHandleId | null>(null);

  const computed: ComputedSpacing | null = useMemo(() => {
    if (!node) return null;
    const view = node.ownerDocument.defaultView ?? window;
    return readComputedSpacing(view.getComputedStyle(node));
  }, [node, element.styles, element.tailwindStyles, rect.width, rect.height]);

  const isFlexOrGrid = useMemo(() => {
    if (!node) return false;
    const view = node.ownerDocument.defaultView ?? window;
    const display = view.getComputedStyle(node).display;
    return display.includes("flex") || display.includes("grid");
  }, [node, element.styles, element.tailwindStyles]);

  if (!canEdit || !node || !computed) return null;
  if (session.kind === "moving" || session.kind === "resizing") return null;

  const isSpacingThis =
    session.kind === "spacing" && session.elementId === element.id;

  const padding = isSpacingThis ? session.preview.padding : computed.padding;
  const margin = isSpacingThis ? session.preview.margin : computed.margin;
  const gap = isSpacingThis ? session.preview.gap : computed.gap;
  const activeSides = isSpacingThis ? session.preview.activeSides : [];
  const activeKind = isSpacingThis ? session.preview.kind : null;

  const showPaddingBands =
    showAllSpacing ||
    activeKind === "padding" ||
    (hoveredHandle !== null && hoveredHandle.startsWith("padding-"));

  const showMarginBands =
    showAllSpacing ||
    activeKind === "margin" ||
    (hoveredHandle !== null && hoveredHandle.startsWith("margin-"));

  const canShowVerticalSides = rect.height >= MIN_BOX_FOR_SPACING;
  const canShowHorizontalSides = rect.width >= MIN_BOX_FOR_SPACING;

  const gapSlot = isFlexOrGrid
    ? measureFirstGapSlot(node, computed.gapAxis)
    : null;
  const showGapBand =
    gapSlot !== null &&
    (showAllSpacing || activeKind === "gap" || hoveredHandle === "gap");

  return (
    <>
      {showPaddingBands &&
        SIDES.map((side) => {
          const px = padding[side];
          const isActive = activeKind === "padding" && activeSides.includes(side);
          const isHovered = hoveredHandle === `padding-${side}`;
          if (px <= 0 && !isActive && !isHovered) return null;
          return (
            <div
              key={`pad-band-${side}`}
              className={
                isActive || isHovered
                  ? "pointer-events-none absolute z-10 bg-emerald-500/20"
                  : "pointer-events-none absolute z-10 bg-emerald-500/12"
              }
              style={paddingBandStyle(side, px)}
            >
              {px >= 14 && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-emerald-600/90 px-1 py-px font-mono text-[9px] leading-none font-semibold text-white">
                  {px}
                </span>
              )}
            </div>
          );
        })}

      {showMarginBands &&
        SIDES.map((side) => {
          const px = margin[side];
          const isActive = activeKind === "margin" && activeSides.includes(side);
          const isHovered = hoveredHandle === `margin-${side}`;
          if (px <= 0 && !isActive && !isHovered) return null;
          return (
            <div
              key={`mar-band-${side}`}
              className={
                isActive || isHovered
                  ? "pointer-events-none absolute z-10 bg-amber-500/20"
                  : "pointer-events-none absolute z-10 bg-amber-500/12"
              }
              style={marginBandStyle(side, px)}
            >
              {px >= 14 && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-amber-600/90 px-1 py-px font-mono text-[9px] leading-none font-semibold text-white">
                  {px}
                </span>
              )}
            </div>
          );
        })}

      {SIDES.map((side) => {
        const isVertical = side === "top" || side === "bottom";
        if (isVertical && !canShowVerticalSides) return null;
        if (!isVertical && !canShowHorizontalSides) return null;
        const handleId: SpacingHandleId = `padding-${side}`;
        const isHighlighted =
          (activeKind === "padding" && activeSides.includes(side)) ||
          hoveredHandle === handleId;
        return (
          <div
            key={handleId}
            data-spacing-handle={handleId}
            className="pointer-events-auto absolute z-35 flex items-center justify-center p-1.5"
            style={{
              ...paddingHandlePosition(side, padding[side]),
              cursor: spacingCursor(handleId, computed.gapAxis),
            }}
            onPointerEnter={() => setHoveredHandle(handleId)}
            onPointerLeave={() =>
              setHoveredHandle((prev) => (prev === handleId ? null : prev))
            }
            onPointerDown={(e) => onStartSpacing(element, node, handleId, e)}
          >
            <span
              className={
                isVertical
                  ? `block h-[3px] w-4 rounded-full bg-emerald-500 transition-opacity ${
                      isHighlighted || showAllSpacing
                        ? "opacity-100"
                        : "opacity-35 hover:opacity-100"
                    }`
                  : `block h-4 w-[3px] rounded-full bg-emerald-500 transition-opacity ${
                      isHighlighted || showAllSpacing
                        ? "opacity-100"
                        : "opacity-35 hover:opacity-100"
                    }`
              }
            />
          </div>
        );
      })}

      {SIDES.map((side) => {
        const isVertical = side === "top" || side === "bottom";
        const px = margin[side];
        const handleId: SpacingHandleId = `margin-${side}`;
        const shouldRender =
          showAllSpacing ||
          px > 0 ||
          (activeKind === "margin" && activeSides.includes(side));
        if (!shouldRender) return null;
        const isHighlighted =
          (activeKind === "margin" && activeSides.includes(side)) ||
          hoveredHandle === handleId;
        return (
          <div
            key={handleId}
            data-spacing-handle={handleId}
            className="pointer-events-auto absolute z-35 flex items-center justify-center p-1.5"
            style={{
              ...marginHandlePosition(side, px),
              cursor: spacingCursor(handleId, computed.gapAxis),
            }}
            onPointerEnter={() => setHoveredHandle(handleId)}
            onPointerLeave={() =>
              setHoveredHandle((prev) => (prev === handleId ? null : prev))
            }
            onPointerDown={(e) => onStartSpacing(element, node, handleId, e)}
          >
            <span
              className={
                isVertical
                  ? `block h-[3px] w-4 rounded-full bg-amber-500 transition-opacity ${
                      isHighlighted || showAllSpacing
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-100"
                    }`
                  : `block h-4 w-[3px] rounded-full bg-amber-500 transition-opacity ${
                      isHighlighted || showAllSpacing
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-100"
                    }`
              }
            />
          </div>
        );
      })}

      {gapSlot && (
        <>
          {showGapBand && (
            <div
              className="pointer-events-none absolute z-10 bg-violet-500/18"
              style={{
                left: gapSlot.left,
                top: gapSlot.top,
                width: gapSlot.width,
                height: gapSlot.height,
              }}
            >
              {gap > 0 && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded bg-violet-600/90 px-1 py-px font-mono text-[9px] leading-none font-semibold text-white">
                  {gap}
                </span>
              )}
            </div>
          )}
          <div
            data-spacing-handle="gap"
            className="pointer-events-auto absolute z-35 flex items-center justify-center p-1.5"
            style={{
              left: gapSlot.left + gapSlot.width / 2,
              top: gapSlot.top + gapSlot.height / 2,
              transform: "translate(-50%, -50%)",
              cursor: spacingCursor("gap", computed.gapAxis),
            }}
            onPointerEnter={() => setHoveredHandle("gap")}
            onPointerLeave={() =>
              setHoveredHandle((prev) => (prev === "gap" ? null : prev))
            }
            onPointerDown={(e) => onStartSpacing(element, node, "gap", e)}
          >
            <span
              className={
                gapSlot.axis === "horizontal"
                  ? `block h-4 w-[3px] rounded-full bg-violet-500 transition-opacity ${
                      activeKind === "gap" || hoveredHandle === "gap" || showAllSpacing
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-100"
                    }`
                  : `block h-[3px] w-4 rounded-full bg-violet-500 transition-opacity ${
                      activeKind === "gap" || hoveredHandle === "gap" || showAllSpacing
                        ? "opacity-100"
                        : "opacity-45 hover:opacity-100"
                    }`
              }
            />
          </div>
        </>
      )}

      {isSpacingThis && (
        <div
          className="pointer-events-none absolute left-1/2 bottom-0 z-50 -translate-x-1/2 translate-y-[calc(100%+8px)] rounded-full bg-zinc-900/95 px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-white shadow-md"
          data-spacing-hud
        >
          {session.preview.label}
        </div>
      )}
    </>
  );
});
