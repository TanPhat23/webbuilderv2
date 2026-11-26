import React, { useCallback, useState } from "react";
import { Component } from "lucide-react";
import {
  componentSetting,
  isMissingComponent,
} from "@webbuilder/site-runtime/projects/components";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  useHoveredElementId,
  useSelectedElement,
  useElementCommentStore,
} from "@/features/editor";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useAltKey } from "@/features/editor/hooks/useAltKey";
import { ElementCommentButton } from "@/features/editor/components/comments/ElementCommentButton";
import { useCanvasViewportStore } from "@/features/editor/store/canvas-viewport-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { ElementLabel } from "../resizehandler/ElementLabel";
import { ResizeChrome } from "../resizehandler/ResizeChrome";
import { SpacingChrome } from "../resizehandler/SpacingChrome";
import RemoteCursorsOverlay from "../editor/RemoteCursorsOverlay";
import type { DropIndicatorState } from "./canvasTypes";
import type { CanvasController } from "./useCanvasController";
import {
  measureStageElementNode,
  projectIframeRectToStage,
  useStageElementRect,
  type ElementRect,
  type RectLike,
  type StageProjectionParams,
} from "./rectTracker";
import { useFrameLayout, type FrameLayout } from "./SiteFrame";

export interface CanvasHudProps {
  /** `#wb-site-root` inside the preview iframe. */
  readonly siteRoot: HTMLElement | null;
  readonly stageEl: HTMLElement | null;
  readonly iframeEl: HTMLIFrameElement | null;
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
  readonly controller: Pick<
    CanvasController,
    "session" | "drop" | "startResize" | "startSpacing"
  >;
  readonly instances: ReadonlyMap<string, EditorElement>;
  readonly canEdit: boolean;
  readonly userId: string;
}

export interface ClipInset {
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}

/** `clip-path: inset()` values that show only `frameRect` inside `stageRect`. */
export function computeClipInset(stageRect: RectLike, frameRect: RectLike): ClipInset {
  return {
    top: frameRect.top - stageRect.top,
    left: frameRect.left - stageRect.left,
    right: stageRect.left + stageRect.width - (frameRect.left + frameRect.width),
    bottom: stageRect.top + stageRect.height - (frameRect.top + frameRect.height),
  };
}

function isSmallBox(rect: ElementRect): boolean {
  return rect.width < 96 || rect.height < 48;
}

function boxStyle(rect: ElementRect): React.CSSProperties {
  return {
    position: "absolute",
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/** Outlines that must not bleed outside the page frame. */
function OutlineClippedLayer({
  layout,
  stageWidth,
  stageHeight,
  children,
}: {
  readonly layout: FrameLayout;
  readonly stageWidth: number;
  readonly stageHeight: number;
  readonly children: React.ReactNode;
}): React.ReactElement {
  const inset = computeClipInset(
    { left: 0, top: 0, width: stageWidth, height: stageHeight },
    { left: layout.left, top: layout.top, width: layout.scaledWidth, height: layout.scaledHeight },
  );
  return (
    <div
      data-hud-layer="outline"
      className="pointer-events-none absolute inset-0"
      style={{
        clipPath: `inset(${inset.top}px ${inset.right}px ${inset.bottom}px ${inset.left}px)`,
      }}
    >
      {children}
    </div>
  );
}

/** Labels, handles, badges and cursors: never clipped, so a label above y = 0 stays whole. */
function FloatingChromeLayer({
  children,
}: {
  readonly children: React.ReactNode;
}): React.ReactElement {
  return (
    <div data-hud-layer="floating" className="pointer-events-none absolute inset-0">
      {children}
    </div>
  );
}

function SelectionOutline({ rect }: { readonly rect: ElementRect }): React.ReactElement {
  return (
    <div
      className="pointer-events-none rounded-[2px] border-[1.5px] border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]"
      style={boxStyle(rect)}
    />
  );
}

function SelectionChrome({
  element,
  node,
  rect,
  zoom,
  controller,
  canEdit,
  iframeRef,
}: {
  readonly element: EditorElement;
  readonly node: HTMLElement | null;
  readonly rect: ElementRect;
  readonly zoom: number;
  readonly controller: CanvasHudProps["controller"];
  readonly canEdit: boolean;
  readonly iframeRef: React.RefObject<HTMLIFrameElement | null>;
}): React.ReactElement {
  const { session, startResize, startSpacing } = controller;
  const linked = !!componentSetting(element);
  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const showCommentButtons = useElementCommentStore((s) => s.showCommentButtons);
  const isEditing = useSelectionStore((s) => s.editingElementId === element.id);
  const altKeyPressed = useAltKey(iframeRef);
  const showAllSpacing = !linked && (manualSpacingMode || altKeyPressed);
  const isMovingThis = session.kind === "moving" && session.elementId === element.id;
  const showHandles = !linked && !isEditing;

  return (
    <div className="group pointer-events-none" style={boxStyle(rect)}>
      {!linked && !isMovingThis && (
        <ElementLabel
          element={element}
          showSpacingInfo={showAllSpacing}
          onToggleSpacing={() => setManualSpacingMode((prev) => !prev)}
        />
      )}
      {showCommentButtons && session.kind === "idle" && (
        <div
          className="pointer-events-auto"
          style={
            isSmallBox(rect)
              ? {
                  position: "absolute",
                  left: rect.width + 36,
                  top: rect.height / 2 - 3,
                }
              : undefined
          }
        >
          <ElementCommentButton element={element} />
        </div>
      )}
      {showHandles && (
        <>
          <SpacingChrome
            rect={rect}
            element={element}
            node={node}
            zoom={zoom}
            session={session}
            canEdit={canEdit}
            showAllSpacing={showAllSpacing}
            onStartSpacing={startSpacing}
          />
          <ResizeChrome
            rect={rect}
            element={element}
            node={node}
            session={session}
            canEdit={canEdit}
            onStartResize={startResize}
          />
        </>
      )}
    </div>
  );
}

function HoverBox({
  siteRoot,
  stageEl,
  iframeEl,
  id,
}: {
  readonly siteRoot: HTMLElement | null;
  readonly stageEl: HTMLElement | null;
  readonly iframeEl: HTMLIFrameElement | null;
  readonly id: string;
}): React.ReactElement | null {
  const { rect, visibleInFrame } = useStageElementRect(siteRoot, stageEl, iframeEl, id);
  if (!rect || !visibleInFrame) return null;
  return (
    <div
      className="rounded-[2px] border border-blue-400/70"
      style={{ ...boxStyle(rect), pointerEvents: "none" }}
    />
  );
}

function DropIndicator({
  siteRoot,
  stageEl,
  iframeEl,
  drop,
}: {
  readonly siteRoot: HTMLElement | null;
  readonly stageEl: HTMLElement | null;
  readonly iframeEl: HTMLIFrameElement | null;
  readonly drop: DropIndicatorState;
}): React.ReactElement | null {
  const { node, rect } = useStageElementRect(siteRoot, stageEl, iframeEl, drop.targetId);
  if (!rect) return null;

  if (drop.position === "inside") {
    const label = node?.dataset.elementType ?? "Container";
    return (
      <div
        className="rounded-[2px] border-2 border-dashed border-emerald-500 bg-emerald-500/8"
        style={{ ...boxStyle(rect), pointerEvents: "none" }}
      >
        <span className="absolute top-1 left-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] leading-none font-medium text-white shadow-xs">
          Inside {label}
        </span>
      </div>
    );
  }

  const LINE = 4;
  const CAP = 10;
  const atStart = drop.position === "before";

  if (drop.horizontal) {
    const x = atStart ? rect.left : rect.left + rect.width;
    return (
      <div
        style={{
          position: "absolute",
          pointerEvents: "none",
          left: x - LINE / 2,
          top: rect.top,
          width: LINE,
          height: rect.height,
        }}
        className="rounded-full bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.22)]"
      >
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-500 shadow-xs"
          style={{ top: -CAP / 2, width: CAP, height: CAP }}
        />
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-blue-500 shadow-xs"
          style={{ bottom: -CAP / 2, width: CAP, height: CAP }}
        />
      </div>
    );
  }

  const y = atStart ? rect.top : rect.top + rect.height;
  return (
    <div
      style={{
        position: "absolute",
        pointerEvents: "none",
        left: rect.left,
        top: y - LINE / 2,
        width: rect.width,
        height: LINE,
      }}
      className="rounded-full bg-blue-500 shadow-[0_0_0_2px_rgba(59,130,246,0.22)]"
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-xs"
        style={{ left: -CAP / 2, width: CAP, height: CAP }}
      />
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-500 shadow-xs"
        style={{ right: -CAP / 2, width: CAP, height: CAP }}
      />
    </div>
  );
}

function ComponentBadge({
  siteRoot,
  stageEl,
  iframeEl,
  id,
}: {
  readonly siteRoot: HTMLElement | null;
  readonly stageEl: HTMLElement | null;
  readonly iframeEl: HTMLIFrameElement | null;
  readonly id: string;
}): React.ReactElement | null {
  const { rect, visibleInFrame } = useStageElementRect(siteRoot, stageEl, iframeEl, id);
  if (!rect || !visibleInFrame) return null;
  return (
    <div
      className="absolute rounded-sm border border-border/70 bg-background/90 p-0.5 text-muted-foreground shadow-sm"
      style={{ left: rect.left + 3, top: rect.top + 3 }}
    >
      <Component className="size-3" />
    </div>
  );
}

function MovingBadge({
  label,
  point,
}: {
  readonly label: string;
  readonly point: { readonly x: number; readonly y: number };
}): React.ReactElement {
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow-md"
      style={{ left: point.x + 12, top: point.y + 12 }}
    >
      {label}
    </div>
  );
}

function readProjection(
  stageEl: HTMLElement,
  iframeEl: HTMLIFrameElement,
  zoom: number,
): StageProjectionParams {
  return {
    stageRect: stageEl.getBoundingClientRect(),
    frameRect: iframeEl.getBoundingClientRect(),
    zoom,
  };
}

/**
 * Editor chrome for the whole canvas, drawn in the parent DOM above the
 * iframe at 1:1 UI pixels: outlines clipped to the page frame, and floating
 * labels, handles, badges and cursors that may extend past it.
 */
export function CanvasHud({
  siteRoot,
  stageEl,
  iframeEl,
  iframeRef,
  controller,
  instances,
  canEdit,
  userId,
}: CanvasHudProps): React.ReactElement | null {
  const { renderAgentCanvasOverlay } = useEditorContext();
  const layout = useFrameLayout();
  const stageWidth = useCanvasViewportStore((s) => s.stageWidthPx);
  const stageHeight = useCanvasViewportStore((s) => s.stageHeightPx);
  const selectedElement = useSelectedElement();
  const hoveredId = useHoveredElementId();
  const selected = useStageElementRect(siteRoot, stageEl, iframeEl, selectedElement?.id);

  const projectRect = useCallback(
    (node: HTMLElement): ElementRect | null =>
      stageEl && iframeEl ? measureStageElementNode(node, stageEl, iframeEl, layout.zoom).rect : null,
    [stageEl, iframeEl, layout.zoom],
  );

  if (!siteRoot || !stageEl || !iframeEl) return null;

  const { session, drop } = controller;
  const activeDrop: DropIndicatorState | null =
    session.kind === "moving" ? session.target : drop?.kind === "relative" ? drop.indicator : null;
  const isManipulating = session.kind !== "idle" || drop !== null;

  let movingPoint: { x: number; y: number } | null = null;
  if (session.kind === "moving") {
    // The session pointer is relative to the site root, in unscaled iframe px.
    const rootRect = siteRoot.getBoundingClientRect();
    const projected = projectIframeRectToStage(
      {
        left: session.pointer.x + rootRect.left,
        top: session.pointer.y + rootRect.top,
        width: 0,
        height: 0,
      },
      readProjection(stageEl, iframeEl, layout.zoom),
    );
    movingPoint = { x: projected.left, y: projected.top };
  }

  const selectionVisible =
    selectedElement !== undefined && selected.rect !== null && selected.visibleInFrame;
  const isMovingSelection =
    session.kind === "moving" && session.elementId === selectedElement?.id;
  const selectionKey = selectedElement
    ? `${selectedElement.id}:${instances.get(selectedElement.id)?.type ?? ""}:${isMissingComponent(instances.get(selectedElement.id) ?? selectedElement)}`
    : "";

  return (
    <div aria-hidden data-canvas-overlay className="pointer-events-none absolute inset-0 z-[1000]">
      <OutlineClippedLayer layout={layout} stageWidth={stageWidth} stageHeight={stageHeight}>
        {!isManipulating && hoveredId && hoveredId !== selectedElement?.id && (
          <HoverBox siteRoot={siteRoot} stageEl={stageEl} iframeEl={iframeEl} id={hoveredId} />
        )}
        {selectionVisible && !isMovingSelection && selected.rect && (
          <SelectionOutline rect={selected.rect} />
        )}
        {Array.from(
          instances,
          ([id, element]) =>
            !isMissingComponent(element) && (
              <ComponentBadge
                key={id}
                siteRoot={siteRoot}
                stageEl={stageEl}
                iframeEl={iframeEl}
                id={id}
              />
            ),
        )}
        {drop?.kind === "root" && (
          <div
            className="rounded-[2px] border-2 border-dashed border-emerald-500 bg-emerald-500/8"
            style={{
              position: "absolute",
              left: layout.left,
              top: layout.top,
              width: layout.scaledWidth,
              height: layout.scaledHeight,
              pointerEvents: "none",
            }}
          />
        )}
        {activeDrop && (
          <DropIndicator
            siteRoot={siteRoot}
            stageEl={stageEl}
            iframeEl={iframeEl}
            drop={activeDrop}
          />
        )}
      </OutlineClippedLayer>
      <FloatingChromeLayer>
        {selectionVisible && selectedElement && selected.rect && (
          <SelectionChrome
            key={selectionKey}
            element={selectedElement}
            node={selected.node}
            rect={selected.rect}
            zoom={layout.zoom}
            controller={controller}
            canEdit={canEdit}
            iframeRef={iframeRef}
          />
        )}
        {session.kind === "moving" && movingPoint && (
          <MovingBadge label={session.elementLabel} point={movingPoint} />
        )}
        <RemoteCursorsOverlay
          userId={userId}
          siteRoot={siteRoot}
          stageEl={stageEl}
          iframeEl={iframeEl}
        />
        {renderAgentCanvasOverlay?.(siteRoot, projectRect)}
      </FloatingChromeLayer>
    </div>
  );
}

export default CanvasHud;
