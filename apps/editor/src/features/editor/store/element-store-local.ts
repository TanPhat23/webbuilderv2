import { elementTree } from "@webbuilder/site-runtime/elements/lib/element-tree-helper";
import {
  adaptToParent,
  parentLayout,
} from "@/features/editor/utils/element/sizing";
import { patchWithDeletions } from "@/features/editor/utils/element/treeDiff";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type {
  ElementStore,
  ElementStoreCreator,
  ElementUpdateWirePatch,
} from "./element-store-types";

function fitToParent(
  elements: EditorElement[],
  id: string,
): {
  tree: EditorElement[];
  stylesPatch?: Record<string, unknown>;
} {
  const el = elementTree.findById(elements, id);
  const location = elementTree.findLocation(elements, id);
  if (!el || !location?.parentId) return { tree: elements };
  const parent = elementTree.findById(elements, location.parentId);
  const fitted = adaptToParent({ ...el.styles?.default }, parentLayout(parent));
  if (!fitted) return { tree: elements };
  const styles = { ...el.styles, default: fitted };
  return {
    tree: elementTree.mapUpdateById(elements, id, (e) => ({ ...e, styles })),
    stylesPatch: patchWithDeletions(el.styles, styles),
  };
}

function toElementUpdateWirePatch(
  before: EditorElement | undefined,
  updated: Partial<EditorElement>,
): Partial<EditorElement> | ElementUpdateWirePatch {
  if (!before) return updated;
  const { styles, settings, ...rest } = updated;
  const wire: ElementUpdateWirePatch = { ...rest };
  if (styles !== undefined) {
    const delta = patchWithDeletions(before.styles, styles);
    if (delta) wire.styles = delta;
  }
  if (settings !== undefined) {
    const delta = patchWithDeletions(before.settings, settings);
    if (delta) wire.settings = delta;
  }
  return wire;
}

function emitPlacementMove(
  emit: LocalEditEffects["emit"],
  elements: EditorElement[],
  id: string,
  stylesPatch: Record<string, unknown> | undefined,
) {
  const location = elementTree.findLocation(elements, id);
  if (location) {
    emit("move", id, {
      elementId: id,
      newParentId: location.parentId,
      newPosition: location.index,
    });
  }
  if (stylesPatch) emit("update", id, { styles: stylesPatch });
}

interface LocalEditEffects {
  allowsRootCount: (tree: EditorElement[]) => boolean;
  takeSnapshot: () => void;
  publishTree: (tree: EditorElement[]) => void;
  commitLocalTree: (tree: EditorElement[]) => void;
  emit: NonNullable<ElementStore["collaborativeCallback"]>;
}

export function createLocalElementActions(
  get: Parameters<ElementStoreCreator>[1],
  effects: LocalEditEffects,
): Pick<
  ElementStore,
  | "updateElement"
  | "deleteElement"
  | "insertElement"
  | "insertElementRelative"
  | "moveElement"
  | "addElement"
> {
  const { takeSnapshot, publishTree, emit } = effects;
  return {
    updateElement: (id, patch) => {
      takeSnapshot();
      const { elements } = get();
      const before = elementTree.findById(elements, id);
      publishTree(
        elementTree.mapUpdateById(
          elements,
          id,
          (element) => ({ ...element, ...patch }) as EditorElement,
        ),
      );
      emit("update", id, toElementUpdateWirePatch(before, patch));
      return get();
    },

    deleteElement: (id) => {
      takeSnapshot();
      publishTree(elementTree.mapDeleteById(get().elements, id));
      emit("delete", id);
      return get();
    },

    ...createPlacementActions(get, effects),
  };
}

function createPlacementActions(
  get: Parameters<ElementStoreCreator>[1],
  {
    allowsRootCount,
    commitLocalTree,
    emit,
  }: Pick<LocalEditEffects, "allowsRootCount" | "commitLocalTree" | "emit">,
): Pick<
  ElementStore,
  "insertElement" | "insertElementRelative" | "moveElement" | "addElement"
> {
  const commitInsertion = (
    updated: EditorElement[],
    element: EditorElement,
  ) => {
    commitLocalTree(updated);
    const inserted = elementTree.findById(updated, element.id) ?? element;
    emit("create", inserted.id, inserted);
  };

  const acceptsPlacement = (before: EditorElement[], after: EditorElement[]) =>
    before !== after && allowsRootCount(after);

  return {
    insertElement: (sibling, element) => {
      const { elements } = get();
      const placed = elementTree.mapInsertAfterId(
        elements,
        sibling.id,
        element,
      );
      const updated = fitToParent(placed, element.id).tree;
      if (acceptsPlacement(elements, updated))
        commitInsertion(updated, element);
      return get();
    },

    insertElementRelative: (element, targetId, position) => {
      const { elements } = get();
      const placed = elementTree.mapInsertRelative(
        elements,
        element,
        targetId,
        position,
      );
      if (acceptsPlacement(elements, placed)) {
        commitInsertion(fitToParent(placed, element.id).tree, element);
      }
      return get();
    },

    moveElement: (id, targetId, position) => {
      const { elements } = get();
      const moved = elementTree.mapMoveRelative(
        elements,
        id,
        targetId,
        position,
      );
      if (!acceptsPlacement(elements, moved)) return get();
      const { tree: updated, stylesPatch } = fitToParent(moved, id);
      commitLocalTree(updated);
      emitPlacementMove(emit, updated, id, stylesPatch);
      return get();
    },

    addElement: (...newElements) => {
      const updated = newElements.reduce(
        (elements, element) =>
          fitToParent(
            elementTree.mapAddChildById(elements, element.parentId, element),
            element.id,
          ).tree,
        get().elements,
      );
      const added = newElements.flatMap(
        ({ id }) => elementTree.findById(updated, id) ?? [],
      );
      if (!added.length || !allowsRootCount(updated)) return get();
      commitLocalTree(updated);
      for (const element of added) emit("create", element.id, element);
      return get();
    },
  };
}
