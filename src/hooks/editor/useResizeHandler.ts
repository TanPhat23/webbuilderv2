"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { clamp } from "lodash";
import type { EditorElement } from "@/types/global.type";
import type { ResizeDirection } from "@/constants/direction";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

// CSS properties that resize operations can change — safe to write directly to el.style
const RESIZE_DOM_PROPS = new Set([
  "width",
  "height",
  "top",
  "left",
  "gap",
  "paddingTop",
  "paddingBottom",
  "paddingLeft",
  "paddingRight",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
]);

function applyStylesToDom(el: HTMLDivElement, styles: ResponsiveStyles): void {
  const s = styles.default ?? {};
  for (const [prop, val] of Object.entries(s)) {
    if (RESIZE_DOM_PROPS.has(prop) && val !== undefined) {
      (el.style as unknown as Record<string, string>)[prop] = String(val);
    }
  }
}

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

function parseDirection(direction: ResizeDirection): DirectionFlags {
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

  const normalized = direction.toLowerCase().replace(/[-_]/g, "");
  return {
    isNorth: normalized.includes("n"),
    isSouth: normalized.includes("s"),
    isEast: normalized.includes("e"),
    isWest: normalized.includes("w"),
    isSpecial: false,
  };
}

function directionToCursor(direction: ResizeDirection): string {
  if (direction === "gap") return "ns-resize";
  if (direction.startsWith("padding-") || direction.startsWith("margin-"))
    return "move";

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
  return cursorMap[direction.replace(/[-_]/g, "").toLowerCase()] ?? "default";
}

function computeSpecialStyles(
  state: ResizeState,
  element: EditorElement,
  clientX: number,
  clientY: number,
): ResponsiveStyles {
  const { directionFlags, startPos, initialStyles } = state;
  const initialDefault = initialStyles.default ?? {};

  if (directionFlags.specialType === "gap") {
    const initialGap = parseInt(String(initialDefault.gap ?? "0"), 10);
    return {
      ...element.styles,
      default: {
        ...element.styles?.default,
        gap: `${Math.max(0, initialGap + (clientY - startPos.y))}px`,
      },
    };
  }

  if (
    (directionFlags.specialType === "padding" ||
      directionFlags.specialType === "margin") &&
    directionFlags.specialSide
  ) {
    const { specialType: type, specialSide: side } = directionFlags;
    const sideMap = { n: "Top", s: "Bottom", e: "Right", w: "Left" } as const;
    const propName = `${type}${sideMap[side]}` as keyof typeof initialDefault;

    const deltaMap: Record<"n" | "s" | "e" | "w", number> = {
      n: startPos.y - clientY,
      s: clientY - startPos.y,
      e: clientX - startPos.x,
      w: startPos.x - clientX,
    };
    const initialValue = parseInt(String(initialDefault[propName] ?? "0"), 10);
    const newValue = Math.max(0, initialValue + deltaMap[side]);

    return {
      ...element.styles,
      default: { ...element.styles?.default, [propName]: `${newValue}px` },
    };
  }

  return element.styles ?? { default: {} };
}

function computeDimensionStyles(
  state: ResizeState,
  element: EditorElement,
  clientX: number,
  clientY: number,
  shiftKey: boolean,
): ResponsiveStyles {
  const { directionFlags, startRect, parentRect, parentElement, aspectRatio } =
    state;

  let newWidth = startRect.width;
  let newHeight = startRect.height;
  let newTop = startRect.top - parentRect.top;
  let newLeft = startRect.left - parentRect.left;

  if (directionFlags.isEast) newWidth = clientX - startRect.left;
  if (directionFlags.isWest) {
    newWidth = startRect.width + (startRect.left - clientX);
    newLeft = clientX - parentRect.left;
  }
  if (directionFlags.isSouth) newHeight = clientY - startRect.top;
  if (directionFlags.isNorth) {
    newHeight = startRect.height + (startRect.top - clientY);
    newTop = clientY - parentRect.top;
  }

  if (shiftKey && aspectRatio && aspectRatio > 0) {
    const isDiagonal =
      (directionFlags.isNorth || directionFlags.isSouth) &&
      (directionFlags.isEast || directionFlags.isWest);
    if (isDiagonal) {
      if (
        Math.abs(newWidth - startRect.width) >
        Math.abs(newHeight - startRect.height)
      ) {
        newHeight = newWidth / aspectRatio;
        if (directionFlags.isNorth)
          newTop = startRect.bottom - parentRect.top - newHeight;
      } else {
        newWidth = newHeight * aspectRatio;
        if (directionFlags.isWest)
          newLeft = startRect.right - parentRect.left - newWidth;
      }
    }
  }

  newWidth = Math.max(MIN_SIZE, newWidth);
  newHeight = Math.max(MIN_SIZE, newHeight);

  const parentWidth = parentElement.clientWidth || parentRect.width;
  const parentHeight = parentElement.clientHeight || parentRect.height;

  if (parentWidth <= 0 || parentHeight <= 0)
    return element.styles ?? { default: {} };

  const widthPercent = clamp((newWidth / parentWidth) * 100, 0, MAX_PERCENT);
  const heightPercent = clamp((newHeight / parentHeight) * 100, 0, MAX_PERCENT);

  const defaultStyles = element.styles?.default ?? {};
  const updatedDefault: Record<string, string | undefined> = {
    ...(defaultStyles as Record<string, string | undefined>),
  };

  const isVerticalOnly =
    (directionFlags.isNorth || directionFlags.isSouth) &&
    !(directionFlags.isEast || directionFlags.isWest);
  const isHorizontalOnly =
    (directionFlags.isEast || directionFlags.isWest) &&
    !(directionFlags.isNorth || directionFlags.isSouth);

  if (!isVerticalOnly) updatedDefault.width = `${widthPercent.toFixed(2)}%`;
  if (!isHorizontalOnly) updatedDefault.height = `${heightPercent.toFixed(2)}%`;

  if (defaultStyles.position === "absolute") {
    updatedDefault.left = `${clamp((newLeft / parentWidth) * 100, 0, MAX_PERCENT).toFixed(2)}%`;
    updatedDefault.top = `${clamp((newTop / parentHeight) * 100, 0, MAX_PERCENT).toFixed(2)}%`;
  }

  return { ...element.styles, default: updatedDefault };
}

export function useResizeHandler({
  element,
  updateElement,
  targetRef,
  enabled = true,
}: UseResizeHandlerProps) {
  const elementRef = useRef(element);
  elementRef.current = element;

  const updateElementRef = useRef(updateElement);
  updateElementRef.current = updateElement;

  const resizeStateRef = useRef<ResizeState | null>(null);
  const pendingStylesRef = useRef<ResponsiveStyles | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastOwnerDocRef = useRef<Document | null>(null);

  const [isResizing, setIsResizing] = useState(false);

  // Stable listener refs — DOM handlers are created once; implementations are updated each render
  const handlersRef = useRef({
    onMouseMove: (_e: MouseEvent) => {},
    onMouseUp: () => {},
  });

  const domMouseMove = useCallback(
    (e: MouseEvent) => handlersRef.current.onMouseMove(e),
    [],
  );
  const domMouseUp = useCallback(() => handlersRef.current.onMouseUp(), []);

  const restoreBodyStyles = useCallback((doc: Document) => {
    try {
      if (doc.body) {
        doc.body.style.userSelect = "";
        doc.body.style.cursor = "";
      }
    } catch {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }
  }, []);

  // Update implementations (fresh each render, but DOM listeners stay stable)
  handlersRef.current.onMouseMove = (e: MouseEvent) => {
    const state = resizeStateRef.current;
    if (!state) return;
    e.preventDefault();

    const computed = state.directionFlags.isSpecial
      ? computeSpecialStyles(state, elementRef.current, e.clientX, e.clientY)
      : computeDimensionStyles(
          state,
          elementRef.current,
          e.clientX,
          e.clientY,
          e.shiftKey,
        );

    pendingStylesRef.current = computed;

    // Write directly to DOM via RAF — zero React/store overhead during drag
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      if (pendingStylesRef.current && targetRef.current) {
        applyStylesToDom(targetRef.current, pendingStylesRef.current);
      }
    });
  };

  handlersRef.current.onMouseUp = () => {
    if (!resizeStateRef.current) return;
    resizeStateRef.current = null;
    setIsResizing(false);

    const ownerDoc = lastOwnerDocRef.current ?? document;
    ownerDoc.removeEventListener("mousemove", domMouseMove);
    ownerDoc.removeEventListener("mouseup", domMouseUp);

    // Cancel any pending DOM-only RAF
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // Single store commit — takes one undo snapshot, one React render
    if (pendingStylesRef.current) {
      updateElementRef.current(elementRef.current.id, {
        styles: pendingStylesRef.current,
      });
      pendingStylesRef.current = null;
    }

    restoreBodyStyles(ownerDoc);
    lastOwnerDocRef.current = null;
  };

  const handleResizeStart = useCallback(
    (direction: ResizeDirection, e: React.MouseEvent) => {
      if (!enabled || !targetRef.current) return;
      e.preventDefault();
      e.stopPropagation();

      const ownerDoc = targetRef.current.ownerDocument ?? document;
      const ownerWin = ownerDoc.defaultView ?? window;
      lastOwnerDocRef.current = ownerDoc;

      const parentElement =
        targetRef.current.parentElement ??
        ownerDoc.getElementById("preview-iframe") ??
        ownerDoc.getElementById("canvas") ??
        document.body;

      const startRect = targetRef.current.getBoundingClientRect();
      const parentRect = parentElement.getBoundingClientRect();

      resizeStateRef.current = {
        direction,
        directionFlags: parseDirection(direction),
        startRect,
        startPos: { x: e.clientX, y: e.clientY },
        parentElement,
        parentRect,
        aspectRatio:
          startRect.height > 0 ? startRect.width / startRect.height : undefined,
        ownerDocument: ownerDoc,
        ownerWindow: ownerWin,
        initialStyles: elementRef.current.styles ?? { default: {} },
      };

      setIsResizing(true);
      ownerDoc.addEventListener("mousemove", domMouseMove);
      ownerDoc.addEventListener("mouseup", domMouseUp);

      try {
        if (ownerDoc.body) {
          ownerDoc.body.style.userSelect = "none";
          ownerDoc.body.style.cursor = directionToCursor(direction);
        }
      } catch {
        document.body.style.userSelect = "none";
        document.body.style.cursor = directionToCursor(direction);
      }
    },
    [enabled, targetRef, domMouseMove, domMouseUp],
  );

  useEffect(() => {
    return () => {
      const ownerDoc = lastOwnerDocRef.current ?? document;
      resizeStateRef.current = null;
      ownerDoc.removeEventListener("mousemove", domMouseMove);
      ownerDoc.removeEventListener("mouseup", domMouseUp);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      pendingStylesRef.current = null;
      restoreBodyStyles(ownerDoc);
      lastOwnerDocRef.current = null;
    };
  }, [domMouseMove, domMouseUp, restoreBodyStyles]);

  return {
    handleResizeStart,
    isResizing,
    currentResizeDirection: resizeStateRef.current?.direction ?? null,
    pendingStylesRef,
  };
}
