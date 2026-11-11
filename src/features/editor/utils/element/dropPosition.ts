import type { DropPosition } from "./element-tree-helper";

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
 * (flex row parent), so before/after use the x axis.
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
}): boolean {
  return style.display.includes("flex") && style.flexDirection.startsWith("row");
}
