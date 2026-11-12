import { toast } from "sonner";
import {
  useElementStore,
  useElementsWithActions,
  useInsertElementRelative,
  useMoveElement,
  useSetSelectedElement,
} from "@/features/editor";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { newEntityId } from "@/lib/entity-id";
import type { EditorElement, ElementTemplate } from "@/types/global.type";
import { cloneWithNewIds, dropTarget } from "./sketchModel";

/** Structural edits to the open page's top-level sections. */
export function useSectionActions(pageId: string) {
  const { elements: sections, addElement, deleteElement } = useElementsWithActions();
  const insertRelative = useInsertElementRelative();
  const moveElement = useMoveElement();
  const setSelected = useSetSelectedElement();

  const insertAt = (el: EditorElement | undefined, index: number) => {
    if (!el) return;
    if (sections.length === 0) addElement(el);
    else if (index >= sections.length) insertRelative(el, sections[sections.length - 1].id, "after");
    else insertRelative(el, sections[Math.max(0, index)].id, "before");
    setSelected(el);
  };

  return {
    sections,
    insertBlankAt: (index: number) =>
      insertAt(ElementFactory.getInstance().createElement({ type: "Section", pageId }), index),
    insertTemplateAt: (template: ElementTemplate, index: number) =>
      insertAt(ElementFactory.getInstance().createElementFromTemplate({ element: template, pageId }), index),
    duplicate: (el: EditorElement) => {
      const copy = cloneWithNewIds(el as never, newEntityId) as EditorElement;
      insertRelative(copy, el.id, "after");
      setSelected(copy);
    },
    moveBy: (index: number, delta: -1 | 1) => {
      const target = sections[index + delta];
      if (target) moveElement(sections[index].id, target.id, delta < 0 ? "before" : "after");
    },
    moveTo: (id: string, gapIndex: number) => {
      const t = dropTarget(sections.map((s) => s.id), id, gapIndex);
      if (t) moveElement(id, t.targetId, t.position);
    },
    remove: (el: EditorElement) => {
      deleteElement(el.id);
      setSelected(undefined);
      toast(`Deleted ${el.name || el.type}`, {
        action: { label: "Undo", onClick: () => useElementStore.getState().undo() },
      });
    },
  };
}

export type SectionActions = ReturnType<typeof useSectionActions>;
