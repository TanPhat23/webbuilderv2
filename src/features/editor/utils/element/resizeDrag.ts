import type { ResizeDirection } from "@/features/editor/constants/direction";
import type { ResponsiveStyles } from "@/types/elements";
import {
  computeDimensionStyles,
  computeSpacingStyles,
  resizeHandles,
} from "./resizeStyles";
import type { SizeAxis } from "./sizing";

const RESIZE_DOM_PROPS = [
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
] as const;

function applyPreview(target: HTMLElement, styles: ResponsiveStyles) {
  const base = styles.default ?? {};
  for (const property of RESIZE_DOM_PROPS) {
    const value = base[property];
    if (value !== undefined) target.style[property] = String(value);
  }
  // Stop Fill from overriding the preview after fixing the flex axis.
  if (base.flexGrow === undefined && target.style.flexGrow) {
    target.style.flexGrow = "";
    target.style.flexBasis = "";
    target.style.flexShrink = "0";
  }
}

function findResizeParent(target: HTMLElement): HTMLElement {
  const doc = target.ownerDocument;
  return (
    target.parentElement ??
    doc.getElementById("preview-iframe") ??
    doc.getElementById("canvas") ??
    document.body
  );
}

function readMainAxis(parent: HTMLElement): SizeAxis | null {
  const css = parent.ownerDocument.defaultView?.getComputedStyle(parent);
  if (!css?.display.includes("flex")) return null;
  return css.flexDirection.startsWith("column") ? "height" : "width";
}

function setBodyStyles(doc: Document, userSelect: string, cursor: string) {
  const body = doc.body;
  if (!body) return;
  body.style.userSelect = userSelect;
  body.style.cursor = cursor;
}

interface ResizeDragOptions {
  target: HTMLElement;
  direction: ResizeDirection;
  start: Pick<MouseEvent, "clientX" | "clientY">;
  pending: { current: ResponsiveStyles | null };
  readStyles: () => ResponsiveStyles | undefined;
  readTarget: () => HTMLElement | null;
  finish: (styles: ResponsiveStyles | null) => void;
}

function captureResize(
  target: HTMLElement,
  direction: ResizeDirection,
  start: ResizeDragOptions["start"],
  initialStyles: ResponsiveStyles | undefined,
) {
  const handle = resizeHandles[direction];
  const parent = findResizeParent(target);
  const origin = {
    rect: target.getBoundingClientRect(),
    parentRect: parent.getBoundingClientRect(),
  };
  const initial = initialStyles?.default;
  return {
    cursor: handle.cursor,
    compute(
      event: MouseEvent,
      styles: ResponsiveStyles | undefined,
    ): ResponsiveStyles {
      const current = styles ?? { default: {} };
      if (handle.kind === "spacing") {
        return computeSpacingStyles(handle, initial, current, {
          clientX: event.clientX - start.clientX,
          clientY: event.clientY - start.clientY,
        });
      }

      const width = parent.clientWidth || origin.parentRect.width;
      const height = parent.clientHeight || origin.parentRect.height;
      if (width <= 0 || height <= 0) return current;
      return computeDimensionStyles(handle, origin, event, current, {
        width,
        height,
        mainAxis: readMainAxis(parent),
      });
    },
  };
}

/** Owns the listeners and animation frame for one mouse drag. */
export function startResizeDrag({
  target,
  direction,
  start,
  pending,
  readStyles,
  readTarget,
  finish,
}: ResizeDragOptions): () => void {
  const doc = target.ownerDocument;
  const win = doc.defaultView ?? window;
  const resize = captureResize(target, direction, start, readStyles());
  let frame: number | null = null;

  function preview() {
    frame = null;
    const node = readTarget();
    if (node && pending.current) applyPreview(node, pending.current);
  }

  function move(event: MouseEvent) {
    event.preventDefault();
    pending.current = resize.compute(event, readStyles());
    frame ??= requestAnimationFrame(preview);
  }

  function dispose() {
    doc.removeEventListener("mousemove", move);
    doc.removeEventListener("mouseup", release);
    win.removeEventListener("mouseup", release);
    if (frame !== null) cancelAnimationFrame(frame);
    pending.current = null;
    setBodyStyles(doc, "", "");
  }

  function release() {
    const styles = pending.current;
    dispose();
    finish(styles);
  }

  doc.addEventListener("mousemove", move);
  doc.addEventListener("mouseup", release);
  win.addEventListener("mouseup", release);
  setBodyStyles(doc, "none", resize.cursor);
  return dispose;
}
