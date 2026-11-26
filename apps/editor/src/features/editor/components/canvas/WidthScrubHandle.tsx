import type React from "react";
import { useRef, type ReactElement } from "react";
import {
  computeEffectiveZoom,
  useCanvasViewportStore,
} from "@/features/editor/store/canvas-viewport-store";
import type { FrameLayout } from "./SiteFrame";

const HANDLE_GAP_PX = 12;
const HANDLE_WIDTH_PX = 8;
const HANDLE_HEIGHT_PX = 48;

interface ScrubDrag {
  readonly startX: number;
  readonly startWidth: number;
  /** Zoom held constant for the whole drag so the edge tracks the pointer. */
  readonly zoom: number;
  readonly restoreFit: boolean;
}

export interface WidthScrubHandleProps {
  readonly side: "left" | "right";
  readonly layout: FrameLayout;
}

/**
 * Drags one frame edge to change the frame width. In fit mode the effective
 * zoom depends on the width, so the zoom is pinned (manual, at its current
 * value) while dragging and fit mode is restored on release.
 */
export function WidthScrubHandle({ side, layout }: WidthScrubHandleProps): ReactElement {
  const dragRef = useRef<ScrubDrag | null>(null);
  const left =
    side === "left"
      ? layout.left - HANDLE_GAP_PX - HANDLE_WIDTH_PX
      : layout.left + layout.scaledWidth + HANDLE_GAP_PX;
  const direction = side === "left" ? -1 : 1;

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const store = useCanvasViewportStore.getState();
    const zoom = computeEffectiveZoom(store);
    dragRef.current = {
      startX: event.clientX,
      startWidth: store.frameWidthPx,
      zoom,
      restoreFit: store.zoomMode === "fit",
    };
    if (store.zoomMode === "fit") store.setManualZoom(zoom);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag) return;
    // The frame is centered, so one edge moving by dx moves the width by 2 * dx.
    const dx = (event.clientX - drag.startX) * direction;
    useCanvasViewportStore
      .getState()
      .scrubFrameWidth(drag.startWidth + Math.round((dx * 2) / drag.zoom));
  };
  const endDrag = (event: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag?.restoreFit) useCanvasViewportStore.setState({ zoomMode: "fit" });
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize frame width (${side})`}
      data-width-handle={side}
      className="pointer-events-auto absolute z-[1001] cursor-ew-resize touch-none rounded-full bg-border transition-colors hover:bg-primary/60 active:bg-primary"
      style={{
        left,
        top: layout.top + layout.scaledHeight / 2 - HANDLE_HEIGHT_PX / 2,
        width: HANDLE_WIDTH_PX,
        height: HANDLE_HEIGHT_PX,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    />
  );
}
