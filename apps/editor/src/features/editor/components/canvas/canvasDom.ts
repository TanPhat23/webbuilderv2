import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import { elementUtils } from "@webbuilder/site-runtime/elements/lib/elementhelper";
import { useElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import {
  DRAG_KEYS,
  getActiveDragPayload,
} from "@/features/editor/utils/element/dragPayload";
import type { DropIndicatorState } from "./canvasTypes";
import { findElementNode } from "./rectTracker";

function hasClosest(value: unknown): value is Element {
  return (
    value !== null &&
    typeof value === "object" &&
    "closest" in value &&
    typeof value.closest === "function"
  );
}

function resolveElementFromTarget(target: EventTarget | null): Element | null {
  if (hasClosest(target)) return target;
  if (target !== null && typeof target === "object" && "parentElement" in target) {
    const parent = target.parentElement;
    return hasClosest(parent) ? parent : null;
  }
  return null;
}

export function findElementNodeFromTarget(
  root: HTMLElement | null,
  target: EventTarget | null,
): HTMLElement | null {
  // Firefox can dispatch drag/pointer events with a Text node as target; unwrap cross-realm nodes safely.
  const element = resolveElementFromTarget(target);
  const boundary = element?.closest<HTMLElement>("[data-component-instance]");
  const closest = boundary
    ? findElementNode(boundary, boundary.dataset.componentInstance)
    : element?.closest("[data-element-id]");
  return closest && root?.contains(closest) ? (closest as HTMLElement) : null;
}

export function isTypingInCanvas(root: HTMLElement | null): boolean {
  const active = root?.ownerDocument.activeElement as HTMLElement | null;
  return !!active?.isContentEditable;
}

export function findElement(id: string): EditorElement | undefined {
  return elementUtils.findById(useElementStore.getState().elements, id);
}

export function setCanvasSelection(patch: {
  selectedElementId?: string | undefined;
  editingElementId?: string | undefined;
  hoveredElementId?: string | undefined;
  draggingElementId?: string | undefined;
}): void {
  const changesSelection =
    "selectedElementId" in patch &&
    patch.selectedElementId !== useSelectionStore.getState().selectedElementId;
  // Selecting a different element leaves text editing unless told otherwise.
  useSelectionStore.setState(
    changesSelection && !("editingElementId" in patch)
      ? { ...patch, editingElementId: undefined }
      : patch,
  );
}

export function hasElementDragPayload(dt: Pick<DataTransfer, "types">): boolean {
  const types = Array.from(dt.types).map((t) => t.toLowerCase());
  return (
    types.includes(DRAG_KEYS.elementId.toLowerCase()) ||
    types.includes(DRAG_KEYS.elementType.toLowerCase()) ||
    types.includes(DRAG_KEYS.template.toLowerCase()) ||
    types.includes(DRAG_KEYS.payload) ||
    (types.includes(DRAG_KEYS.text) && getActiveDragPayload() !== null)
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
