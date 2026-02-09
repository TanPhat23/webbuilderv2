"use client";

import type { EditorElement } from "@/types/global.type";
import type { ResizeDirection } from "@/constants/direction";
import { CSSStyles } from "@/interfaces/elements.interface";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import type React from "react";

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
  const shouldShowTooltip = !isResizing || direction === currentResizeDirection;

  if (!shouldShowTooltip) {
    return <>{children}</>;
  }

  return (
    <Tooltip open={isResizing ? true : undefined}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="top">
        {getHandleTooltip(direction, element.styles?.default)}
      </TooltipContent>
    </Tooltip>
  );
}
