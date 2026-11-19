import React from "react";
import { createPortal } from "react-dom";
import { DropOverlay } from "./DropOverlay";

export function MediaDropOverlay({ target, label }: { target: HTMLElement; label: string }) {
  const { top, left, width, height } = target.getBoundingClientRect();
  return createPortal(
    <div className="pointer-events-none fixed z-50" style={{ top, left, width, height }}>
      <DropOverlay label={label} />
    </div>,
    target.ownerDocument.body,
  );
}
