import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import type { ElementTemplate } from "@/types/global.type";

/** A Sections-library tile being dragged onto the board. */
export const TEMPLATE_DRAG = "application/x-wf-template";
/** A section on the open page being dragged to a new position. */
export const MOVE_DRAG = "application/x-wf-move";

export function setTemplateDragData(dt: DataTransfer, groupId: string, index: number) {
  dt.setData(TEMPLATE_DRAG, JSON.stringify({ groupId, index }));
  dt.effectAllowed = "copy";
}

export function readTemplateDrag(dt: DataTransfer): ElementTemplate | null {
  try {
    const { groupId, index } = JSON.parse(dt.getData(TEMPLATE_DRAG)) as { groupId: string; index: number };
    return sectionTemplateGroups.find((g) => g.id === groupId)?.templates[index] ?? null;
  } catch {
    return null;
  }
}
