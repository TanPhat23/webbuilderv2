import type { EditorElement } from "@/types/global.type";
import { elementHelper } from "@/features/elements/lib/elementhelper";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { DRAG_KEYS } from "@/features/editor/utils/element/dragPayload";
import type { DropIndicatorState } from "./CanvasOverlay";
import { findElementNode } from "./useElementRect";

export function elementNodeFrom(
  root: HTMLElement | null,
  target: EventTarget | null,
): HTMLElement | null {
  const element = target as Element | null;
  const boundary = element?.closest?.<HTMLElement>("[data-component-instance]");
  const closest = boundary
    ? findElementNode(boundary, boundary.dataset.componentInstance)
    : element?.closest?.("[data-element-id]");
  return closest && root?.contains(closest) ? (closest as HTMLElement) : null;
}

export function isTypingInCanvas(root: HTMLElement | null): boolean {
  const active = root?.ownerDocument.activeElement as HTMLElement | null;
  return !!active?.isContentEditable;
}

export function findElement(id: string): EditorElement | undefined {
  return elementHelper.findById(useElementStore.getState().elements, id);
}

export function setCanvasSelection(patch: {
  selectedElementId?: string | undefined;
  hoveredElementId?: string | undefined;
  draggingElementId?: string | undefined;
}): void {
  useSelectionStore.setState(patch);
}

export function hasElementDragData(dt: Pick<DataTransfer, "types">): boolean {
  const types = Array.from(dt.types);
  return (
    types.includes(DRAG_KEYS.elementId.toLowerCase()) ||
    types.includes(DRAG_KEYS.elementType.toLowerCase()) ||
    types.includes(DRAG_KEYS.template.toLowerCase())
  );
}

export function isSameDropIndicator(
  prev: DropIndicatorState | null,
  next: DropIndicatorState | null,
): boolean {
  if (prev === next) return true;
  if (!prev || !next) return false;
  return (
    prev.targetId === next.targetId &&
    prev.position === next.position &&
    prev.horizontal === next.horizontal
  );
}
