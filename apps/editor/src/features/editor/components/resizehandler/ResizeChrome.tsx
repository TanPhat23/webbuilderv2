import React, { memo } from "react";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  resizeCursor,
  type DimensionDirection,
} from "@/features/editor/utils/element/resizeMath";
import type { ManipulationSession } from "../canvas/canvasTypes";
import type { ElementRect } from "../canvas/useElementRect";

export interface ResizeChromeProps {
  readonly rect: ElementRect;
  readonly element: EditorElement;
  readonly node: HTMLElement | null;
  readonly session: ManipulationSession;
  readonly canEdit: boolean;
  readonly onStartResize: (
    element: EditorElement,
    node: HTMLElement,
    direction: DimensionDirection,
    event: React.PointerEvent,
  ) => void;
}

const EDGE_STRIP_PX = 8;
const TINY_BOX_THRESHOLD = 24;

interface EdgeConfig {
  readonly dir: "n" | "s" | "e" | "w";
  readonly style: React.CSSProperties;
}

const EDGE_CONFIGS: readonly EdgeConfig[] = [
  {
    dir: "n",
    style: {
      top: -EDGE_STRIP_PX / 2,
      left: 6,
      right: 6,
      height: EDGE_STRIP_PX,
    },
  },
  {
    dir: "s",
    style: {
      bottom: -EDGE_STRIP_PX / 2,
      left: 6,
      right: 6,
      height: EDGE_STRIP_PX,
    },
  },
  {
    dir: "w",
    style: {
      left: -EDGE_STRIP_PX / 2,
      top: 6,
      bottom: 6,
      width: EDGE_STRIP_PX,
    },
  },
  {
    dir: "e",
    style: {
      right: -EDGE_STRIP_PX / 2,
      top: 6,
      bottom: 6,
      width: EDGE_STRIP_PX,
    },
  },
];

interface CornerConfig {
  readonly dir: "nw" | "ne" | "sw" | "se";
  readonly style: React.CSSProperties;
}

const CORNER_CONFIGS: readonly CornerConfig[] = [
  { dir: "nw", style: { top: -4, left: -4 } },
  { dir: "ne", style: { top: -4, right: -4 } },
  { dir: "sw", style: { bottom: -4, left: -4 } },
  { dir: "se", style: { bottom: -4, right: -4 } },
];

export const ResizeChrome = memo(function ResizeChrome({
  rect,
  element,
  node,
  session,
  canEdit,
  onStartResize,
}: ResizeChromeProps): React.ReactElement | null {
  if (!canEdit || !node) return null;
  if (session.kind === "moving" || session.kind === "spacing") return null;

  const isResizingThis =
    session.kind === "resizing" && session.elementId === element.id;
  const isTiny = rect.width < TINY_BOX_THRESHOLD || rect.height < TINY_BOX_THRESHOLD;
  const corners = isTiny ? CORNER_CONFIGS.filter((c) => c.dir === "se") : CORNER_CONFIGS;

  return (
    <>
      {!isTiny &&
        EDGE_CONFIGS.map((edge) => (
          <div
            key={edge.dir}
            data-resize-handle={edge.dir}
            className="pointer-events-auto absolute z-30"
            style={{
              ...edge.style,
              cursor: resizeCursor(edge.dir),
            }}
            onPointerDown={(e) => onStartResize(element, node, edge.dir, e)}
          />
        ))}

      {corners.map((corner) => (
        <div
          key={corner.dir}
          data-resize-handle={corner.dir}
          className="pointer-events-auto absolute z-40 size-[8px] rounded-[1.5px] border-[1.5px] border-blue-500 bg-white shadow-xs transition-transform duration-100 hover:scale-125"
          style={{
            ...corner.style,
            cursor: resizeCursor(corner.dir),
          }}
          onPointerDown={(e) => onStartResize(element, node, corner.dir, e)}
        />
      ))}

      {isResizingThis && (
        <div
          className="pointer-events-none absolute left-1/2 bottom-0 z-50 -translate-x-1/2 translate-y-[calc(100%+8px)] rounded-full bg-zinc-900/95 px-2 py-0.5 font-mono text-[11px] font-medium whitespace-nowrap text-white shadow-md"
          data-resize-hud
        >
          {session.preview.widthLabel} &times; {session.preview.heightLabel}
        </div>
      )}
    </>
  );
});
