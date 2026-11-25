import { elementTree } from "@/features/elements/lib/element-tree-helper";
import type { EditorElement } from "@/types/global.type";
import type { ElementStore, ElementStoreCreator } from "./element-store-types";

export function createRemoteElementActions(
  set: Parameters<ElementStoreCreator>[0],
): Pick<
  ElementStore,
  "remoteUpdate" | "remoteDelete" | "remoteAdd" | "remoteMove"
> {
  return {
    remoteUpdate: (id, patch) => {
      set(({ elements }) => ({
        elements: elementTree.mapUpdateById(
          elements,
          id,
          (element) => ({ ...element, ...patch }) as EditorElement,
        ),
      }));
    },

    remoteDelete: (id) => {
      set(({ elements }) => ({
        elements: elementTree.mapDeleteById(elements, id),
      }));
    },

    remoteAdd: (element) => {
      set(({ elements }) => ({
        elements: elementTree.mapAddChildById(
          elements,
          element.parentId,
          element,
        ),
      }));
    },

    remoteMove: (id, newParentId, order) => {
      set((state) => {
        const { elements } = state;
        const element = elementTree.findById(elements, id);
        if (!element) return state;
        const without = elementTree.mapDeleteById(elements, id);
        const moved = { ...element, parentId: newParentId ?? undefined, order };
        return {
          elements: elementTree.mapInsertAt(without, newParentId, order, moved),
        };
      });
    },
  };
}
