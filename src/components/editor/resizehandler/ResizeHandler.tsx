"use client";

import { useElementStore } from "@/globalstore/elementstore";
import { useSelectionStore } from "@/globalstore/selectionstore";
import { useElementHandler } from "@/hooks";
import { useResizeHandler } from "@/hooks";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import type React from "react";
import { type ReactNode, useRef, memo, useState, useEffect } from "react";
import {
  type ResizeDirection,
  directionalClasses,
  getResizeHandles,
} from "@/constants/direciton";
import ResizeTooltip from "./ResizeTooltip";
import { ElementCommentButton } from "@/components/editor/comments/ElementCommentButton";
import { useElementCommentStore } from "@/globalstore/elementcommentstore";
import { useEditorPermissions } from "@/hooks/editor/useEditorPermissions";

interface ResizeHandlerProps {
  element: EditorElement;
  children: ReactNode;
  isReadOnly?: boolean;
  isLocked?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement>;
}

interface ResizeHandleProps {
  direction: ResizeDirection;
  onResizeStart: (direction: ResizeDirection, e: React.MouseEvent) => void;
  element: EditorElement;
  isResizing: boolean;
  currentResizeDirection: ResizeDirection | null;
}

const STANDARD_DIRECTIONS = new Set([
  "n",
  "s",
  "e",
  "w",
  "ne",
  "nw",
  "se",
  "sw",
]);

const ResizeHandle = memo(function ResizeHandle({
  direction,
  onResizeStart,
  element,
  isResizing,
  currentResizeDirection,
}: ResizeHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    onResizeStart(direction, e);
  };

  const isMarginHandle = direction.startsWith("margin-");
  const isPaddingHandle = direction.startsWith("padding-");
  const isGapHandle = direction === "gap";

  let handleColorClasses: string;
  if (isGapHandle) {
    handleColorClasses =
      "bg-pink-500 border-pink-200 hover:bg-pink-600 text-white";
  } else if (isMarginHandle) {
    handleColorClasses = "bg-orange-500 border-orange-200 hover:bg-orange-600";
  } else if (isPaddingHandle) {
    handleColorClasses =
      "bg-emerald-500 border-emerald-200 hover:bg-emerald-600";
  } else {
    handleColorClasses = "bg-blue-500 border-blue-200 hover:bg-blue-600";
  }

  const baseClasses = cn(
    "absolute z-50 transition-all duration-200 ease-in-out shadow-sm flex items-center justify-center",
    isGapHandle ? "w-5 h-5 rounded-sm cursor-ns-resize" : "w-3.5 h-3.5",
    (isMarginHandle || isPaddingHandle) && !isGapHandle
      ? "rounded-[2px]"
      : !isGapHandle && "rounded-full",
    !isGapHandle && "border-2",
    handleColorClasses,
    directionalClasses[direction],
    "hover:scale-125 active:scale-110",
    isResizing &&
      currentResizeDirection !== direction &&
      "opacity-0 pointer-events-none",
    isResizing &&
      currentResizeDirection === direction &&
      "scale-125 ring-2 ring-offset-1 ring-current z-[60]",
  );

  // Determine icon for gap handle based on flex direction
  const flexDirection = element.styles?.default?.flexDirection || "row";
  const isColumn = flexDirection.includes("column");

  return (
    <ResizeTooltip
      direction={direction}
      element={element}
      isResizing={isResizing}
      currentResizeDirection={currentResizeDirection}
    >
      <div
        className={baseClasses}
        onMouseDown={handleMouseDown}
        onPointerDown={(e) => e.stopPropagation()}
        role="button"
        aria-label={`Resize ${direction}`}
        tabIndex={-1}
      >
        {isGapHandle && (
          <div
            className={cn("pointer-events-none", isColumn ? "rotate-90" : "")}
          >
            {/* Simple Gap Icon */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="2"
                y="1"
                width="2"
                height="8"
                rx="0.5"
                fill="currentColor"
              />
              <rect
                x="6"
                y="1"
                width="2"
                height="8"
                rx="0.5"
                fill="currentColor"
              />
            </svg>
          </div>
        )}
      </div>
    </ResizeTooltip>
  );
});

const SpacingValueLabel = ({
  value,
  type,
  side,
}: {
  value: string | undefined;
  type: "margin" | "padding";
  side: "top" | "bottom" | "left" | "right";
}) => {
  if (!value || value === "0px" || value === "0") return null;
  const numValue = parseFloat(value);
  if (isNaN(numValue) || numValue === 0) return null;

  const isMargin = type === "margin";
  const colorClass = isMargin
    ? "text-orange-600 bg-orange-100/80"
    : "text-emerald-600 bg-emerald-100/80";

  const positionStyles: React.CSSProperties = {
    position: "absolute",
    fontSize: "9px",
    fontWeight: 600,
    padding: "1px 3px",
    borderRadius: "2px",
    pointerEvents: "none",
    zIndex: 40,
    whiteSpace: "nowrap",
  };

  if (side === "top") {
    Object.assign(positionStyles, {
      top: isMargin ? `-${parseFloat(value) / 2}px` : "0",
      left: "50%",
      transform: "translate(-50%, -50%)",
      marginTop: isMargin ? 0 : "4px",
    });
  } else if (side === "bottom") {
    Object.assign(positionStyles, {
      bottom: isMargin ? `-${parseFloat(value) / 2}px` : "0",
      left: "50%",
      transform: "translate(-50%, 50%)",
      marginBottom: isMargin ? 0 : "4px",
    });
  } else if (side === "left") {
    Object.assign(positionStyles, {
      left: isMargin ? `-${parseFloat(value) / 2}px` : "0",
      top: "50%",
      transform: "translate(-50%, -50%)",
      marginLeft: isMargin ? 0 : "4px",
    });
  } else if (side === "right") {
    Object.assign(positionStyles, {
      right: isMargin ? `-${parseFloat(value) / 2}px` : "0",
      top: "50%",
      transform: "translate(50%, -50%)",
      marginRight: isMargin ? 0 : "4px",
    });
  }

  return (
    <div
      style={positionStyles}
      className={cn("shadow-sm backdrop-blur-[1px]", colorClass)}
    >
      {numValue}
    </div>
  );
};

const SpacingOverlay = memo(function SpacingOverlay({
  element,
  show,
}: {
  element: EditorElement;
  show: boolean;
}) {
  if (!show) return null;

  const styles = element.styles?.default || {};
  const {
    marginTop = "0px",
    marginRight = "0px",
    marginBottom = "0px",
    marginLeft = "0px",
    paddingTop = "0px",
    paddingRight = "0px",
    paddingBottom = "0px",
    paddingLeft = "0px",
  } = styles;

  return (
    <>
      {/* Margin Visualization - Outside */}
      <div className="absolute inset-0 pointer-events-none z-30">
        {/* Top Margin */}
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            height: marginTop,
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            backgroundImage:
              "linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "8px 8px",
            borderLeft: "1px dashed rgba(249, 115, 22, 0.3)",
            borderRight: "1px dashed rgba(249, 115, 22, 0.3)",
            borderTop: "1px dashed rgba(249, 115, 22, 0.3)",
          }}
        >
          <SpacingValueLabel
            value={String(marginTop)}
            type="margin"
            side="top"
          />
        </div>
        {/* Bottom Margin */}
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            height: marginBottom,
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            backgroundImage:
              "linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "8px 8px",
            borderLeft: "1px dashed rgba(249, 115, 22, 0.3)",
            borderRight: "1px dashed rgba(249, 115, 22, 0.3)",
            borderBottom: "1px dashed rgba(249, 115, 22, 0.3)",
          }}
        >
          <SpacingValueLabel
            value={String(marginBottom)}
            type="margin"
            side="bottom"
          />
        </div>
        {/* Left Margin */}
        <div
          style={{
            position: "absolute",
            right: "100%",
            top: 0,
            bottom: 0,
            width: marginLeft,
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            backgroundImage:
              "linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "8px 8px",
            borderTop: "1px dashed rgba(249, 115, 22, 0.3)",
            borderBottom: "1px dashed rgba(249, 115, 22, 0.3)",
            borderLeft: "1px dashed rgba(249, 115, 22, 0.3)",
          }}
        >
          <SpacingValueLabel
            value={String(marginLeft)}
            type="margin"
            side="left"
          />
        </div>
        {/* Right Margin */}
        <div
          style={{
            position: "absolute",
            left: "100%",
            top: 0,
            bottom: 0,
            width: marginRight,
            backgroundColor: "rgba(249, 115, 22, 0.15)",
            backgroundImage:
              "linear-gradient(45deg, rgba(249, 115, 22, 0.1) 25%, transparent 25%, transparent 50%, rgba(249, 115, 22, 0.1) 50%, rgba(249, 115, 22, 0.1) 75%, transparent 75%, transparent)",
            backgroundSize: "8px 8px",
            borderTop: "1px dashed rgba(249, 115, 22, 0.3)",
            borderBottom: "1px dashed rgba(249, 115, 22, 0.3)",
            borderRight: "1px dashed rgba(249, 115, 22, 0.3)",
          }}
        >
          <SpacingValueLabel
            value={String(marginRight)}
            type="margin"
            side="right"
          />
        </div>
      </div>

      {/* Padding Visualization - Inside */}
      <div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          borderTopWidth: paddingTop,
          borderRightWidth: paddingRight,
          borderBottomWidth: paddingBottom,
          borderLeftWidth: paddingLeft,
          borderColor: "rgba(16, 185, 129, 0.15)",
          borderStyle: "solid",
          boxSizing: "border-box",
        }}
      >
        <div className="w-full h-full border border-dashed border-emerald-500/30 relative">
          <SpacingValueLabel
            value={String(paddingTop)}
            type="padding"
            side="top"
          />
          <SpacingValueLabel
            value={String(paddingBottom)}
            type="padding"
            side="bottom"
          />
          <SpacingValueLabel
            value={String(paddingLeft)}
            type="padding"
            side="left"
          />
          <SpacingValueLabel
            value={String(paddingRight)}
            type="padding"
            side="right"
          />
        </div>
      </div>
    </>
  );
});

const ElementLabel = memo(function ElementLabel({
  element,
  showSpacingInfo,
  onToggleSpacing,
}: {
  element: EditorElement;
  showSpacingInfo: boolean;
  onToggleSpacing: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute top-0 left-0 z-40 text-xs px-2 py-1 pointer-events-none select-none rounded-sm flex items-center gap-2 transition-all duration-200 shadow-sm",
        showSpacingInfo
          ? "bg-orange-50 text-orange-700 border border-orange-200"
          : "bg-blue-500 text-white border border-blue-600",
      )}
      style={{
        transform: "translateY(-100%) translateY(-4px)",
        maxWidth: "200px",
      }}
    >
      <span className="font-semibold truncate max-w-[100px]">
        {element.type}
      </span>
      <div
        className={cn(
          "h-3 w-px",
          showSpacingInfo ? "bg-orange-200" : "bg-blue-400",
        )}
      />
      {showSpacingInfo ? (
        <span className="text-[10px] font-mono uppercase tracking-wider">
          Spacing
        </span>
      ) : (
        <span className="text-[10px] opacity-90 font-mono">
          {element.styles?.default?.width || "auto"} ×{" "}
          {element.styles?.default?.height || "auto"}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleSpacing();
        }}
        className={cn(
          "ml-1 p-0.5 rounded hover:bg-black/10 transition-colors pointer-events-auto cursor-pointer",
          showSpacingInfo ? "text-orange-700" : "text-white",
        )}
        title={
          showSpacingInfo ? "Exit Spacing Mode" : "Enter Spacing Mode (Alt)"
        }
      >
        {showSpacingInfo ? (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12H3M12 3v18" />
          </svg>
        )}
      </button>
    </div>
  );
});

export default function ResizeHandler({
  element,
  children,
  isReadOnly = false,
  isLocked = false,
  iframeRef,
}: ResizeHandlerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const { updateElement } = useElementStore();
  const { draggedOverElement, selectedElement, hoveredElement } =
    useSelectionStore();
  const { handleDoubleClick } = useElementHandler();
  const permissions = useEditorPermissions();
  const canResize = !isReadOnly && !isLocked && permissions.canEditElements;

  const { handleResizeStart, isResizing, currentResizeDirection } =
    useResizeHandler({
      element,
      updateElement,
      targetRef,
      enabled: canResize,
    });

  const [manualSpacingMode, setManualSpacingMode] = useState(false);
  const { showCommentButtons, toggleCommentButtons } = useElementCommentStore();
  const altKeyRef = useRef(false);
  const [altKeyPressed, setAltKeyPressed] = useState(false);

  const showSpacingHandles = manualSpacingMode || altKeyPressed;

  // Determine selection states
  const isSelected = selectedElement?.id === element.id;

  // Poll Alt key state to trigger re-renders
  useEffect(() => {
    const checkAltState = () => {
      setAltKeyPressed(altKeyRef.current);
    };

    const interval = setInterval(checkAltState, 50);
    return () => clearInterval(interval);
  }, []);

  // Setup keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "AltLeft" || e.code === "AltRight" || e.key === "Alt") {
        altKeyRef.current = true;
        setAltKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "AltLeft" || e.code === "AltRight" || e.key === "Alt") {
        altKeyRef.current = false;
        setAltKeyPressed(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);

    // Also listen to iframe document if it exists
    let iframeDoc: Document | null = null;
    if (iframeRef?.current?.contentDocument) {
      iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.addEventListener("keydown", handleKeyDown, true);
      iframeDoc.addEventListener("keyup", handleKeyUp, true);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
      if (iframeDoc) {
        iframeDoc.removeEventListener("keydown", handleKeyDown, true);
        iframeDoc.removeEventListener("keyup", handleKeyUp, true);
      }
    };
  }, [iframeRef]);

  const isHovered =
    hoveredElement?.id === element.id &&
    draggedOverElement?.id !== element.id &&
    !isSelected;
  const isDraggedOver = draggedOverElement?.id === element.id && !isSelected;

  // Get all possible handles
  const allHandles = getResizeHandles(element.styles?.default);

  // Filter handles based on mode (Standard vs Spacing)
  let visibleHandles: ResizeDirection[] = [];
  if (isSelected && canResize) {
    if (isResizing && currentResizeDirection) {
      visibleHandles = [currentResizeDirection];
    } else if (showSpacingHandles) {
      const handles: ResizeDirection[] = [
        "margin-n",
        "margin-s",
        "margin-e",
        "margin-w",
        "padding-n",
        "padding-s",
        "padding-e",
        "padding-w",
      ];

      const style = element.styles?.default;
      if (
        style?.display === "flex" ||
        style?.display === "grid" ||
        style?.display === "inline-flex" ||
        style?.display === "inline-grid"
      ) {
        handles.push("gap");
      }

      visibleHandles = handles;
    } else {
      visibleHandles = allHandles.filter((h) => STANDARD_DIRECTIONS.has(h));
    }
  }

  const handleElementDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleDoubleClick(e, element);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={targetRef}
      className="relative group"
      style={{
        width: element.styles?.default?.width || "auto",
        height: element.styles?.default?.height || "auto",
        position: "relative",
      }}
      id={element.id}
      onPointerDown={handlePointerDown}
      onDoubleClick={handleElementDoubleClick}
    >
      {isSelected && (
        <ElementLabel
          element={element}
          showSpacingInfo={showSpacingHandles}
          onToggleSpacing={() => setManualSpacingMode((prev) => !prev)}
        />
      )}

      {isSelected && showCommentButtons && (
        <ElementCommentButton element={element} />
      )}

      {children}

      {isSelected && (
        <SpacingOverlay element={element} show={showSpacingHandles} />
      )}

      {visibleHandles.map((dir) => (
        <ResizeHandle
          key={dir}
          direction={dir}
          onResizeStart={handleResizeStart}
          element={element}
          isResizing={isResizing}
          currentResizeDirection={currentResizeDirection}
        />
      ))}

      {isSelected && !showSpacingHandles && (
        <div
          className={cn(
            "absolute inset-0 pointer-events-none rounded-sm transition-all duration-200",
            "border-2 border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,0.1)]",
          )}
        />
      )}

      {isHovered && (
        <div className="pointer-events-none absolute inset-0 border-2 border-blue-400/50 z-20 rounded-sm transition-colors duration-100" />
      )}

      {isDraggedOver && (
        <div
          className="pointer-events-none absolute inset-0 border-2 border-dashed border-green-600 z-20 rounded-sm bg-green-500/5"
          style={{
            boxShadow: "0 0 0 1px rgba(22, 163, 74, 0.1)",
          }}
        />
      )}
    </div>
  );
}
