import { elementTree, type DropPosition } from "@/features/elements/lib/element-tree-helper";
import type { EditorElement } from "@/types/global.type";

export type { DropPosition };

export interface DropBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Largest edge band (px) of a container that still means before/after. */
const CONTAINER_EDGE_PX = 12;

/**
 * Where a drop lands relative to the element under the cursor. Containers
 * take drops inside unless the cursor is in a thin edge band; other elements
 * split in half. `horizontal` is true when siblings flow left-to-right
 * (flex row or multi-column grid parent), so before/after use the x axis.
 */
export function computeDropPosition(
  box: DropBox,
  point: { x: number; y: number },
  { isContainer, horizontal }: { isContainer: boolean; horizontal: boolean },
): DropPosition {
  const offset = horizontal ? point.x - box.left : point.y - box.top;
  const size = horizontal ? box.width : box.height;

  if (isContainer) {
    const edge = Math.min(CONTAINER_EDGE_PX, size * 0.25);
    if (offset < edge) return "before";
    if (offset > size - edge) return "after";
    return "inside";
  }
  return offset < size / 2 ? "before" : "after";
}

/** True when children of a parent with this computed style flow horizontally. */
export function isHorizontalFlow(style: {
  display: string;
  flexDirection: string;
  gridTemplateColumns?: string;
}): boolean {
  if (style.display.includes("flex") && style.flexDirection.startsWith("row")) {
    return true;
  }
  if (style.display.includes("grid") && style.gridTemplateColumns) {
    const tracks = style.gridTemplateColumns
      .trim()
      .split(/\s+/)
      .filter((t) => t && t !== "none");
    return tracks.length > 1;
  }
  return false;
}

/** True when moving `movingId` to `(targetId, position)` produces no tree change. */
export function isNoOpMove(
  elements: EditorElement[],
  movingId: string,
  targetId: string,
  position: DropPosition,
): boolean {
  if (movingId === targetId) return true;
  const from = elementTree.findLocation(elements, movingId);
  if (!from) return true;

  if (position === "inside") {
    const parent = elementTree.findById(elements, targetId);
    if (!parent || !elementTree.isContainerElement(parent)) return true;
    return from.parentId === targetId && from.index === parent.elements.length - 1;
  }

  const target = elementTree.findLocation(elements, targetId);
  if (!target) return true;
  if (from.parentId !== target.parentId) return false;
  if (position === "before") return from.index === target.index - 1;
  return from.index === target.index + 1;
}
