"use client";

import type { EditorElement } from "@/types/global.type";
import type { ResizeDirection } from "@/features/editor";
import { CSSStyles } from "@/features/editor";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import React, { useState, useEffect } from "react";
import { useResizeContext } from "./ResizeContext";

function getHandleTooltip(
  direction: ResizeDirection,
  styles: CSSStyles | undefined,
): string {
  // Helper for margin/padding tooltip
  const getSpacingTooltip = (
    type: "margin" | "padding",
    dir: string,
  ): string => {
    const propMap = {
      n: `${type}Top`,
      s: `${type}Bottom`,
      e: `${type}Right`,
      w: `${type}Left`,
    } as const;
    const prop = propMap[dir as keyof typeof propMap] as keyof CSSStyles;
    const value = prop && styles?.[prop] !== undefined ? styles?.[prop] : "0";
    return `${
      type.charAt(0).toUpperCase() + type.slice(1)
    } (${dir.toUpperCase()}): ${value}`;
  };

  if (direction.startsWith("margin-")) {
    const dir = direction.split("-")[1];
    return getSpacingTooltip("margin", dir);
  }
  if (direction.startsWith("padding-")) {
    const dir = direction.split("-")[1];
    return getSpacingTooltip("padding", dir);
  }
  if (direction === "gap") {
    const value = styles?.gap !== undefined ? styles.gap : "0";
    return `Gap: ${value}`;
  }
  switch (direction) {
    case "n":
      return `Resize top (Height: ${styles?.height || "auto"})`;
    case "s":
      return `Resize bottom (Height: ${styles?.height || "auto"})`;
    case "e":
      return `Resize right (Width: ${styles?.width || "auto"})`;
    case "w":
      return `Resize left (Width: ${styles?.width || "auto"})`;
    case "ne":
      return `Resize top-right (Width: ${styles?.width || "auto"}, Height: ${
        styles?.height || "auto"
      })`;
    case "nw":
      return `Resize top-left (Width: ${styles?.width || "auto"}, Height: ${
        styles?.height || "auto"
      })`;
    case "se":
      return `Resize bottom-right (Width: ${styles?.width || "auto"}, Height: ${
        styles?.height || "auto"
      })`;
    case "sw":
      return `Resize bottom-left (Width: ${styles?.width || "auto"}, Height: ${
        styles?.height || "auto"
      })`;
    default:
      return "Resize";
  }
}

interface ResizeTooltipProps {
  direction: ResizeDirection;
  element: EditorElement;
  children: React.ReactNode;
  isResizing?: boolean;
  currentResizeDirection?: ResizeDirection | null;
}

export default function ResizeTooltip({
  direction,
  element,
  children,
  isResizing = false,
  currentResizeDirection = null,
}: ResizeTooltipProps) {
  const resizeCtx = useResizeContext();
  const pendingStylesRef = resizeCtx?.pendingStylesRef;
  const isActive = isResizing && direction === currentResizeDirection;
  const [liveStyles, setLiveStyles] = useState<CSSStyles | undefined>(
    undefined,
  );

  // Poll pendingStylesRef via RAF while this handle is the active resize direction
  useEffect(() => {
    if (!isActive || !pendingStylesRef) return;

    let raf: number;
    let prevTooltipText = "";
    const poll = () => {
      if (pendingStylesRef.current?.default) {
        const nextStyles = pendingStylesRef.current.default as CSSStyles;
        const nextText = getHandleTooltip(direction, nextStyles);
        if (nextText !== prevTooltipText) {
          prevTooltipText = nextText;
          setLiveStyles(nextStyles);
        }
      }
      raf = requestAnimationFrame(poll);
    };
    raf = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(raf);
  }, [isActive, pendingStylesRef, direction]);

  const shouldShowTooltip = !isResizing || direction === currentResizeDirection;

  if (!shouldShowTooltip) {
    return <>{children}</>;
  }

  const displayStyles =
    isActive && liveStyles ? liveStyles : element.styles?.default;

  return (
    <Tooltip open={isResizing ? true : undefined}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">
        {getHandleTooltip(direction, displayStyles)}
      </TooltipContent>
    </Tooltip>
  );
}
