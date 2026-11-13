import React, { useMemo, useState } from "react";
import type { EditorElement } from "@/types/global.type";
import {
  useHoveredElementId,
  useSelectedElement,
  useUpdateElement,
  useElementCommentStore,
  type ResizeDirection,
  getResizeHandles,
} from "@/features/editor";
import { useEditorFlags } from "@/features/editor/components/context/EditorFlagsContext";
import { useResizeHandler } from "@/features/editor/hooks/useResizeHandler";
import { useAltKey } from "@/features/editor/hooks/useAltKey";
import { ElementCommentButton } from "@/features/editor/components/comments/ElementCommentButton";
import { ResizeHandle, STANDARD_DIRECTIONS } from "../resizehandler/ResizeHandle";
import { SpacingOverlay } from "../resizehandler/SpacingOverlay";
import { ElementLabel } from "../resizehandler/ElementLabel";
import { ResizeContext } from "../resizehandler/ResizeContext";
import type { DropPosition } from "@/features/editor/utils/element/dropPosition";
import { useElementRect, type ElementRect } from "./useElementRect";
import { handlesForSize } from "@/features/editor/constants/direction";

export interface DropIndicatorState {
  targetId: string;
  position: DropPosition;
  /** Siblings flow left-to-right, so before/after are vertical bars. */
  horizontal: boolean;
}

const FLEX_DISPLAYS = new Set(["flex", "grid", "inline-flex", "inline-grid"]);

const SPACING_HANDLES: ResizeDirection[] = [
  "margin-n",
  "margin-s",
  "margin-e",
  "margin-w",
  "padding-n",
  "padding-s",
  "padding-e",
  "padding-w",
];

/** A box too small to carry the comment button on its corner. */
function isSmallBox(rect: ElementRect) {
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
}: {
  root: HTMLElement;
  element: EditorElement;
}) {
  const { node, rect } = useElementRect(root, element.id);
  const { canEdit, iframeRef } = useEditorFlags();
  const updateElement = useUpdateElement();
  const targetRef = useMemo(() => ({ current: null as HTMLElement | null }), []);
  targetRef.current = node;

  const { handleResizeStart, isResizing, currentResizeDirection, pendingStylesRef } =
    useResizeHandler({ element, updateElement, targetRef, enabled: canEdit });

  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const showCommentButtons = useElementCommentStore((s) => s.showCommentButtons);
  const altKeyPressed = useAltKey(iframeRef);
  const showSpacing = manualSpacingMode || altKeyPressed;

  if (!rect) return null;

  let handles: ResizeDirection[] = [];
  if (canEdit) {
    if (isResizing && currentResizeDirection) {
      handles = [currentResizeDirection];
    } else if (showSpacing) {
      handles = [...SPACING_HANDLES];
      if (FLEX_DISPLAYS.has(element.styles?.default?.display ?? "")) {
        handles.push("gap");
      }
    } else {
      handles = handlesForSize(
        getResizeHandles(element.styles?.default).filter((h) =>
          STANDARD_DIRECTIONS.has(h),
        ),
        rect.width,
        rect.height,
      );
    }
  }

  return (
    <ResizeContext value={{ pendingStylesRef }}>
      <div className="group" style={boxStyle(rect)}>
        <ElementLabel
          element={element}
          showSpacingInfo={showSpacing}
          onToggleSpacing={() => setManualSpacingMode((prev) => !prev)}
        />
        {showCommentButtons && (
          <div
            className="pointer-events-auto"
            // The button hangs off its anchor's top-right corner. On a small
            // element, move the anchor so it sits beside the box, not on it.
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
        <SpacingOverlay element={element} show={showSpacing} />
        {handles.map((dir) => (
          <div key={dir} className="pointer-events-auto">
            <ResizeHandle
              direction={dir}
              onResizeStart={handleResizeStart}
              element={element}
              isResizing={isResizing}
              currentResizeDirection={currentResizeDirection}
            />
          </div>
        ))}
        {!showSpacing && (
          <div className="absolute inset-0 rounded-sm border-2 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]" />
        )}
      </div>
    </ResizeContext>
  );
}

function HoverBox({ root, id }: { root: HTMLElement; id: string }) {
  const { rect } = useElementRect(root, id);
  if (!rect) return null;
  return (
    <div
      className="rounded-sm border-2 border-blue-400/50"
      style={boxStyle(rect)}
    />
  );
}

function DropIndicator({
  root,
  drop,
}: {
  root: HTMLElement;
  drop: DropIndicatorState;
}) {
  const { rect } = useElementRect(root, drop.targetId);
  if (!rect) return null;

  if (drop.position === "inside") {
    return (
      <div
        className="rounded-sm border-2 border-dashed border-green-600 bg-green-500/5"
        style={boxStyle(rect)}
      />
    );
  }

  const BAR = 3;
  const atStart = drop.position === "before";
  const bar: React.CSSProperties = drop.horizontal
    ? {
        left: (atStart ? rect.left : rect.left + rect.width) - BAR / 2,
        top: rect.top,
        width: BAR,
        height: rect.height,
      }
    : {
        left: rect.left,
        top: (atStart ? rect.top : rect.top + rect.height) - BAR / 2,
        width: rect.width,
        height: BAR,
      };
  return (
    <div
      className="rounded-full bg-blue-500"
      style={{ position: "absolute", ...bar }}
    />
  );
}

/**
 * Editor chrome for the whole canvas: hover outline, selection box with
 * resize/spacing handles, and the drop indicator. Drawn in one layer over
 * the page so elements render without per-element wrappers.
 */
export function CanvasOverlay({
  root,
  drop,
  isDragging,
}: {
  root: HTMLElement | null;
  drop: DropIndicatorState | null;
  isDragging: boolean;
}) {
  const selectedElement = useSelectedElement();
  const hoveredId = useHoveredElementId();
  if (!root) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1000]"
      data-canvas-overlay
    >
      {!isDragging && hoveredId && hoveredId !== selectedElement?.id && (
        <HoverBox root={root} id={hoveredId} />
      )}
      {selectedElement && (
        <SelectionBox
          key={selectedElement.id}
          root={root}
          element={selectedElement}
        />
      )}
      {drop && <DropIndicator root={root} drop={drop} />}
    </div>
  );
}
