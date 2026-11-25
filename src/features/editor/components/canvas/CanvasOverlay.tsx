import React, { useContext, useState } from "react";
import { Component } from "lucide-react";
import { ResolvedInstancesContext } from "../ComponentInstanceCanvas";
import { componentSetting, isMissingComponent } from "@/features/projects/lib/components";
import type { EditorElement } from "@/types/global.type";
import {
  useHoveredElementId,
  useSelectedElement,
  useElementCommentStore,
} from "@/features/editor";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { useAltKey } from "@/features/editor/hooks/useAltKey";
import { ElementCommentButton } from "@/features/editor/components/comments/ElementCommentButton";
import type { DimensionDirection } from "@/features/editor/utils/element/resizeMath";
import type { SpacingHandleId } from "@/features/editor/utils/element/spacingMath";
import { ElementLabel } from "../resizehandler/ElementLabel";
import { ResizeChrome } from "../resizehandler/ResizeChrome";
import { SpacingChrome } from "../resizehandler/SpacingChrome";
import type { DropIndicatorState, ManipulationSession } from "./canvasTypes";
import { useElementRect, type ElementRect } from "./useElementRect";

export type { DropIndicatorState };

export interface CanvasOverlayProps {
  readonly root: HTMLElement | null;
  readonly session: ManipulationSession;
  readonly sidebarDrop: DropIndicatorState | null;
  readonly onStartResize: (
    element: EditorElement,
    node: HTMLElement,
    direction: DimensionDirection,
    event: React.PointerEvent,
  ) => void;
  readonly onStartSpacing: (
    element: EditorElement,
    node: HTMLElement,
    handle: SpacingHandleId,
    event: React.PointerEvent,
  ) => void;
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

function SelectionBox({
  root,
  element,
  session,
  onStartResize,
  onStartSpacing,
}: {
  readonly root: HTMLElement;
  readonly element: EditorElement;
  readonly session: ManipulationSession;
  readonly onStartResize: CanvasOverlayProps["onStartResize"];
  readonly onStartSpacing: CanvasOverlayProps["onStartSpacing"];
}): React.ReactElement | null {
  const linked = !!componentSetting(element);
  const { node, rect } = useElementRect(root, element.id);
  const { canEdit, iframeRef } = useEditorFlags();
  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const showCommentButtons = useElementCommentStore((s) => s.showCommentButtons);
  const altKeyPressed = useAltKey(iframeRef);
  const showAllSpacing = !linked && (manualSpacingMode || altKeyPressed);

  if (!rect) return null;

  const isMovingThis =
    session.kind === "moving" && session.elementId === element.id;

  return (
    <div className="group" style={boxStyle(rect)}>
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
      {!linked && (
        <>
          <SpacingChrome
            rect={rect}
            element={element}
            node={node}
            session={session}
            canEdit={canEdit}
            showAllSpacing={showAllSpacing}
            onStartSpacing={onStartSpacing}
          />
          <ResizeChrome
            rect={rect}
            element={element}
            node={node}
            session={session}
            canEdit={canEdit}
            onStartResize={onStartResize}
          />
        </>
      )}
      {!isMovingThis && (
        <div className="pointer-events-none absolute inset-0 rounded-[2px] border-[1.5px] border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.08)]" />
      )}
    </div>
  );
}

function HoverBox({
  root,
  id,
}: {
  readonly root: HTMLElement;
  readonly id: string;
}): React.ReactElement | null {
  const { rect } = useElementRect(root, id);
  if (!rect) return null;
  return (
    <div
      className="rounded-[2px] border border-blue-400/70"
      style={{ ...boxStyle(rect), pointerEvents: "none" }}
    />
  );
}

function DropIndicator({
  root,
  drop,
}: {
  readonly root: HTMLElement;
  readonly drop: DropIndicatorState;
}): React.ReactElement | null {
  const { node, rect } = useElementRect(root, drop.targetId);
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

  const LINE = 2;
  const CAP = 6;
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
        className="bg-blue-500"
      >
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full border border-white bg-blue-500"
          style={{ top: -CAP / 2, width: CAP, height: CAP }}
        />
        <span
          className="absolute left-1/2 -translate-x-1/2 rounded-full border border-white bg-blue-500"
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
      className="bg-blue-500"
    >
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-500"
        style={{ left: -CAP / 2, width: CAP, height: CAP }}
      />
      <span
        className="absolute top-1/2 -translate-y-1/2 rounded-full border border-white bg-blue-500"
        style={{ right: -CAP / 2, width: CAP, height: CAP }}
      />
    </div>
  );
}

function MovingBadge({
  label,
  pointer,
}: {
  readonly label: string;
  readonly pointer: { readonly x: number; readonly y: number };
}): React.ReactElement {
  return (
    <div
      className="pointer-events-none absolute z-50 rounded-full bg-zinc-900/90 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap text-white shadow-md"
      style={{
        left: pointer.x + 12,
        top: pointer.y + 12,
      }}
    >
      {label}
    </div>
  );
}

function ComponentBadge({
  root,
  id,
}: {
  readonly root: HTMLElement;
  readonly id: string;
}): React.ReactElement | null {
  const { rect } = useElementRect(root, id);
  if (!rect) return null;
  return (
    <div
      className="absolute rounded-sm border border-border/70 bg-background/90 p-0.5 text-muted-foreground shadow-sm"
      style={{ left: rect.left + 3, top: rect.top + 3 }}
    >
      <Component className="size-3" />
    </div>
  );
}

/**
 * Editor chrome for the whole canvas: hover outline, selection box with
 * resize/spacing handles, and the drop indicator. Drawn in one layer over
 * the page so elements render without per-element wrappers.
 */
export function CanvasOverlay({
  root,
  session,
  sidebarDrop,
  onStartResize,
  onStartSpacing,
}: CanvasOverlayProps): React.ReactElement | null {
  const instances = useContext(ResolvedInstancesContext);
  const { renderAgentCanvasOverlay } = useEditorContext();
  const selectedElement = useSelectedElement();
  const hoveredId = useHoveredElementId();
  if (!root) return null;

  const activeDrop = session.kind === "moving" ? session.target : sidebarDrop;
  const isManipulating = session.kind !== "idle" || sidebarDrop !== null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1000]"
      style={{ pointerEvents: "none" }}
      data-canvas-overlay
    >
      {!isManipulating && hoveredId && hoveredId !== selectedElement?.id && (
        <HoverBox root={root} id={hoveredId} />
      )}
      {selectedElement && (
        <SelectionBox
          key={`${selectedElement.id}:${instances.get(selectedElement.id)?.type ?? ""}:${isMissingComponent(instances.get(selectedElement.id) ?? selectedElement)}`}
          root={root}
          element={selectedElement}
          session={session}
          onStartResize={onStartResize}
          onStartSpacing={onStartSpacing}
        />
      )}
      {Array.from(
        instances,
        ([id, element]) =>
          !isMissingComponent(element) && (
            <ComponentBadge key={id} root={root} id={id} />
          ),
      )}
      {activeDrop && <DropIndicator root={root} drop={activeDrop} />}
      {session.kind === "moving" && (
        <MovingBadge label={session.elementLabel} pointer={session.pointer} />
      )}
      {renderAgentCanvasOverlay?.(root)}
    </div>
  );
}
