"use client";

import { useRef, useEffect } from "react";
import { clamp } from "lodash";
import type { EditorElement } from "@/types/global.type";
import type { ResizeDirection } from "@/constants/direction";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

/**
 * Enhanced resize handler with improvements:
 * - Fixed direction parsing to avoid string matching bugs
 * - Optimized calculations with caching
 * - Smooth RAF-based updates
 * - Proper constraint handling
 * - Fixed special resize (gap, padding, margin) logic
 * - Better aspect ratio locking
 * - Robust cleanup
 */

const MIN_SIZE = 20;
const MAX_PERCENT = 100;

interface UseResizeHandlerProps {
  element: EditorElement;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  targetRef: React.RefObject<HTMLDivElement | null>;
  enabled?: boolean;
}

interface DirectionFlags {
  isNorth: boolean;
  isSouth: boolean;
  isEast: boolean;
  isWest: boolean;
  isSpecial: boolean;
  specialType?: "gap" | "padding" | "margin";
  specialSide?: "n" | "s" | "e" | "w";
}

interface ResizeState {
  direction: ResizeDirection;
  directionFlags: DirectionFlags;
  startRect: DOMRect;
  startPos: { x: number; y: number };
  parentElement: HTMLElement;
  parentRect: DOMRect;
  aspectRatio?: number;
  ownerDocument: Document;
  ownerWindow: Window;
  initialStyles: ResponsiveStyles;
}

/**
 * Parse direction into explicit flags to avoid string matching bugs
 */
function parseDirection(direction: ResizeDirection): DirectionFlags {
  // Handle special cases first
  if (direction === "gap") {
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "gap",
    };
  }

  if (direction.startsWith("padding-")) {
    const side = direction.split("-")[1] as "n" | "s" | "e" | "w";
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "padding",
      specialSide: side,
    };
  }

  if (direction.startsWith("margin-")) {
    const side = direction.split("-")[1] as "n" | "s" | "e" | "w";
    return {
      isNorth: false,
      isSouth: false,
      isEast: false,
      isWest: false,
      isSpecial: true,
      specialType: "margin",
      specialSide: side,
    };
  }

  // Parse normal directional resize
  const normalized = direction.toLowerCase().replace(/[-_]/g, "");
  return {
    isNorth: normalized.includes("n"),
    isSouth: normalized.includes("s"),
    isEast: normalized.includes("e"),
    isWest: normalized.includes("w"),
    isSpecial: false,
  };
}

/**
 * Map direction to appropriate cursor
 */
function directionToCursor(direction: ResizeDirection): string {
  if (direction === "gap") return "ns-resize";
  if (direction.startsWith("padding-") || direction.startsWith("margin-")) {
    return "move";
  }

  const cursorMap: Record<string, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
    sw: "nesw-resize",
  };

  const key = direction.replace(/[-_]/g, "").toLowerCase();
  return cursorMap[key] || "default";
}

export function useResizeHandler({
  element,
  updateElement,
  targetRef,
  enabled = true,
}: UseResizeHandlerProps) {
  // Store element in ref to always have latest version
  const elementRef = useRef(element);
  elementRef.current = element;

  const resizeStateRef = useRef<ResizeState | null>(null);
  const pendingStylesRef = useRef<ResponsiveStyles | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastOwnerDocRef = useRef<Document | null>(null);

  /**
   * Schedule a batched style update using RAF
   */
  const scheduleUpdate = () => {
    if (rafRef.current !== null) return;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const styles = pendingStylesRef.current;
      if (styles) {
        updateElement(elementRef.current.id, { styles });
        pendingStylesRef.current = null;
      }
    });
  };

  /**
   * Cancel pending RAF update
   */
  const cancelUpdate = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    pendingStylesRef.current = null;
  };

  /**
   * Handle special resize types (gap, padding, margin)
   */
  const handleSpecialResize = (
    state: ResizeState,
    clientX: number,
    clientY: number,
  ): ResponsiveStyles => {
    const { directionFlags, startPos, initialStyles } = state;
    const currentElement = elementRef.current;
    const initialDefaultStyles = initialStyles.default || {};

    // Handle gap resize
    if (directionFlags.specialType === "gap") {
      const deltaY = clientY - startPos.y;
      const initialGap = parseInt(String(initialDefaultStyles.gap || "0"), 10);
      const newGap = Math.max(0, initialGap + deltaY);

      return {
        ...currentElement.styles,
        default: {
          ...currentElement.styles?.default,
          gap: `${newGap}px`,
        },
      };
    }

    // Handle padding/margin resize
    if (
      (directionFlags.specialType === "padding" ||
        directionFlags.specialType === "margin") &&
      directionFlags.specialSide
    ) {
      const type = directionFlags.specialType;
      const side = directionFlags.specialSide;

      // Map side to CSS property
      const sideMap = {
        n: "Top",
        s: "Bottom",
        e: "Right",
        w: "Left",
      };
      const propName =
        `${type}${sideMap[side]}` as keyof typeof initialDefaultStyles;

      // Calculate delta based on side
      let delta = 0;
      if (side === "n") delta = startPos.y - clientY;
      else if (side === "s") delta = clientY - startPos.y;
      else if (side === "e") delta = clientX - startPos.x;
      else if (side === "w") delta = startPos.x - clientX;

      const initialValue = parseInt(
        String(initialDefaultStyles[propName] || "0"),
        10,
      );
      const newValue = Math.max(0, initialValue + delta);

      return {
        ...currentElement.styles,
        default: {
          ...currentElement.styles?.default,
          [propName]: `${newValue}px`,
        },
      };
    }

    return currentElement.styles || { default: {} };
  };

  /**
   * Handle normal dimension resize
   */
  const handleDimensionResize = (
    state: ResizeState,
    clientX: number,
    clientY: number,
    shiftKey: boolean,
  ): ResponsiveStyles => {
    const {
      directionFlags,
      startRect,
      parentRect,
      parentElement,
      aspectRatio,
    } = state;

    const currentElement = elementRef.current;

    let newWidth = startRect.width;
    let newHeight = startRect.height;
    let newTop = startRect.top - parentRect.top;
    let newLeft = startRect.left - parentRect.left;

    // Calculate new dimensions based on direction flags
    if (directionFlags.isEast) {
      newWidth = clientX - startRect.left;
    }
    if (directionFlags.isWest) {
      const delta = startRect.left - clientX;
      newWidth = startRect.width + delta;
      newLeft = clientX - parentRect.left;
    }
    if (directionFlags.isSouth) {
      newHeight = clientY - startRect.top;
    }
    if (directionFlags.isNorth) {
      const delta = startRect.top - clientY;
      newHeight = startRect.height + delta;
      newTop = clientY - parentRect.top;
    }

    // Apply aspect ratio locking with Shift key
    if (shiftKey && aspectRatio && aspectRatio > 0) {
      const isDiagonal =
        (directionFlags.isNorth || directionFlags.isSouth) &&
        (directionFlags.isEast || directionFlags.isWest);

      if (isDiagonal) {
        // For corner handles, maintain aspect ratio
        const widthDelta = Math.abs(newWidth - startRect.width);
        const heightDelta = Math.abs(newHeight - startRect.height);

        if (widthDelta > heightDelta) {
          // Width changed more, adjust height
          newHeight = newWidth / aspectRatio;
          if (directionFlags.isNorth) {
            newTop = startRect.bottom - parentRect.top - newHeight;
          }
        } else {
          // Height changed more, adjust width
          newWidth = newHeight * aspectRatio;
          if (directionFlags.isWest) {
            newLeft = startRect.right - parentRect.left - newWidth;
          }
        }
      }
    }

    // Apply minimum size constraints
    newWidth = Math.max(MIN_SIZE, newWidth);
    newHeight = Math.max(MIN_SIZE, newHeight);

    // Get parent dimensions
    const parentWidth = parentElement.clientWidth || parentRect.width;
    const parentHeight = parentElement.clientHeight || parentRect.height;

    // Ensure parent dimensions are valid
    if (parentWidth <= 0 || parentHeight <= 0) {
      return currentElement.styles || { default: {} };
    }

    // Convert to percentages
    const widthPercent = clamp((newWidth / parentWidth) * 100, 0, MAX_PERCENT);
    const heightPercent = clamp(
      (newHeight / parentHeight) * 100,
      0,
      MAX_PERCENT,
    );

    const defaultStyles = currentElement.styles?.default || {};
    const updatedDefault: Record<string, string | undefined> = {
      ...(defaultStyles as Record<string, string | undefined>),
    };

    // Update dimensions based on resize direction
    const isSingleAxisVertical =
      (directionFlags.isNorth || directionFlags.isSouth) &&
      !(directionFlags.isEast || directionFlags.isWest);
    const isSingleAxisHorizontal =
      (directionFlags.isEast || directionFlags.isWest) &&
      !(directionFlags.isNorth || directionFlags.isSouth);

    if (!isSingleAxisVertical) {
      updatedDefault.width = `${widthPercent.toFixed(2)}%`;
    }
    if (!isSingleAxisHorizontal) {
      updatedDefault.height = `${heightPercent.toFixed(2)}%`;
    }

    // Handle absolute positioning
    if (defaultStyles.position === "absolute") {
      const leftPercent = clamp((newLeft / parentWidth) * 100, 0, MAX_PERCENT);
      const topPercent = clamp((newTop / parentHeight) * 100, 0, MAX_PERCENT);

      updatedDefault.left = `${leftPercent.toFixed(2)}%`;
      updatedDefault.top = `${topPercent.toFixed(2)}%`;
    }

    return {
      ...currentElement.styles,
      default: updatedDefault,
    };
  };

  /**
   * Mouse move handler
   */
  const onMouseMove = (e: MouseEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;

    e.preventDefault();

    const clientX = e.clientX;
    const clientY = e.clientY;

    // Handle special resize (gap, padding, margin)
    if (state.directionFlags.isSpecial) {
      pendingStylesRef.current = handleSpecialResize(state, clientX, clientY);
      scheduleUpdate();
      return;
    }

    // Handle normal dimension resize
    pendingStylesRef.current = handleDimensionResize(
      state,
      clientX,
      clientY,
      e.shiftKey,
    );
    scheduleUpdate();
  };

  /**
   * Mouse up handler - finalize resize
   */
  const onMouseUp = () => {
    const state = resizeStateRef.current;
    if (!state) return;

    resizeStateRef.current = null;

    const ownerDoc = lastOwnerDocRef.current || document;

    // Remove event listeners
    ownerDoc.removeEventListener("mousemove", onMouseMove);
    ownerDoc.removeEventListener("mouseup", onMouseUp);

    // Cancel any pending updates
    cancelUpdate();

    // Restore body styles
    try {
      if (ownerDoc.body) {
        ownerDoc.body.style.userSelect = "";
        ownerDoc.body.style.cursor = "";
      }
    } catch (e) {
      // Ignore cross-origin errors
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    lastOwnerDocRef.current = null;
  };

  /**
   * Start resize operation
   */
  const handleResizeStart = (
    direction: ResizeDirection,
    e: React.MouseEvent,
  ) => {
    if (!enabled || !targetRef.current) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopPropagation();

    // Get owner document and window
    const ownerDoc = targetRef.current.ownerDocument || document;
    const ownerWin = ownerDoc.defaultView || window;

    lastOwnerDocRef.current = ownerDoc;

    // Find parent element
    const parentElement =
      targetRef.current.parentElement ||
      ownerDoc.getElementById("preview-iframe") ||
      ownerDoc.getElementById("canvas") ||
      document.body;

    const startRect = targetRef.current.getBoundingClientRect();
    const parentRect = parentElement.getBoundingClientRect();

    // Parse direction into flags
    const directionFlags = parseDirection(direction);

    // Calculate aspect ratio
    const aspectRatio =
      startRect.height > 0 ? startRect.width / startRect.height : undefined;

    // Store resize state
    resizeStateRef.current = {
      direction,
      directionFlags,
      startRect,
      startPos: { x: e.clientX, y: e.clientY },
      parentElement,
      parentRect,
      aspectRatio,
      ownerDocument: ownerDoc,
      ownerWindow: ownerWin,
      initialStyles: element.styles || { default: {} },
    };

    ownerDoc.addEventListener("mousemove", onMouseMove);
    ownerDoc.addEventListener("mouseup", onMouseUp);

    try {
      if (ownerDoc.body) {
        ownerDoc.body.style.userSelect = "none";
        ownerDoc.body.style.cursor = directionToCursor(direction);
      }
    } catch (e) {
      // Ignore cross-origin errors
      document.body.style.userSelect = "none";
      document.body.style.cursor = directionToCursor(direction);
    }
  };

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      const ownerDoc = lastOwnerDocRef.current || document;

      resizeStateRef.current = null;

      // Remove event listeners
      ownerDoc.removeEventListener("mousemove", onMouseMove);
      ownerDoc.removeEventListener("mouseup", onMouseUp);

      // Cancel pending updates
      cancelUpdate();

      // Restore body styles
      try {
        if (ownerDoc.body) {
          ownerDoc.body.style.userSelect = "";
          ownerDoc.body.style.cursor = "";
        }
      } catch (e) {
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
      }

      lastOwnerDocRef.current = null;
    };
  }, []);

  const isResizing = resizeStateRef.current !== null;
  const currentResizeDirection = resizeStateRef.current?.direction || null;

  return {
    handleResizeStart,
    isResizing,
    currentResizeDirection,
  };
}
