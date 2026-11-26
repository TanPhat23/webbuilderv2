import type React from "react";
import { useEffect, useRef } from "react";
import { usePickStore } from "@/features/interactions/editing/pick-store";
import { findElementNodeFromTarget } from "./canvasDom";

export function shouldBlockPickEvent(
  hasPendingPick: boolean,
  suppressMultiClick: boolean,
  detail: number,
): boolean {
  return hasPendingPick || (suppressMultiClick && detail > 1);
}

export function useCanvasPickMode(root: HTMLElement | null): {
  picking: boolean;
  blockPickPointer: (event: React.MouseEvent) => void;
  handleClickCapture: (event: React.MouseEvent) => void;
  handleDoubleClickCapture: (event: React.MouseEvent) => void;
} {
  const picking = usePickStore((s) => s.onPick !== null);
  const suppressMultiClick = useRef(false);

  useEffect(() => {
    if (!picking) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      usePickStore.getState().cancel();
    };
    const views = new Set<Window>([window]);
    if (root?.ownerDocument.defaultView) {
      views.add(root.ownerDocument.defaultView);
    }
    views.forEach((view) => view.addEventListener("keydown", handleKeyDown, true));
    return () => {
      views.forEach((view) => view.removeEventListener("keydown", handleKeyDown, true));
    };
  }, [picking, root]);

  const blockPickPointer = (event: React.MouseEvent): void => {
    if (event.type === "mousedown" && event.detail === 1) {
      suppressMultiClick.current = false;
    }
    const pending = usePickStore.getState().onPick !== null;
    if (!shouldBlockPickEvent(pending, suppressMultiClick.current, event.detail)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClickCapture = (event: React.MouseEvent): void => {
    const waiting = usePickStore.getState().onPick !== null;
    if (!shouldBlockPickEvent(waiting, suppressMultiClick.current, event.detail)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const id = findElementNodeFromTarget(root, event.target)?.dataset.elementId;
    if (waiting && id) {
      suppressMultiClick.current = true;
      usePickStore.getState().pick(id);
    }
  };

  const handleDoubleClickCapture = (event: React.MouseEvent): void => {
    if (!suppressMultiClick.current && !usePickStore.getState().onPick) return;
    event.preventDefault();
    event.stopPropagation();
    suppressMultiClick.current = false;
  };

  return {
    picking,
    blockPickPointer,
    handleClickCapture,
    handleDoubleClickCapture,
  };
}
