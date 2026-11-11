import type {
  ContainerElement,
  ContainerElementType,
  EditableElementType,
  EditorElement,
} from "@/types/global.type";
import {
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
} from "@/features/editor/constants/elements";

const asContainer = (el: EditorElement): ContainerElement =>
  el as unknown as ContainerElement;

const hasChildren = (el: EditorElement): boolean =>
  Array.isArray(asContainer(el).elements);

const children = (el: EditorElement): EditorElement[] =>
  asContainer(el).elements ?? [];


const mapChildArrays = (
  element: EditorElement,
  map: (elements: EditorElement[]) => EditorElement[],
): EditorElement =>
  hasChildren(element)
    ? ({ ...element, elements: map(children(element)) } as EditorElement)
    : element;

const isContainerElement = (
  element: EditorElement,
): element is ContainerElement =>
  CONTAINER_ELEMENT_TYPES.includes(element.type as ContainerElementType);

const isEditableElement = (element: EditorElement): boolean =>
  EDITABLE_ELEMENT_TYPES.includes(element.type as EditableElementType);

const findById = (
  elements: EditorElement[],
  id: string,
): EditorElement | undefined => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (hasChildren(el)) {
      const found = findById(children(el), id);
      if (found) return found;
    }
  }
  return undefined;
};

/**
 * The tree helpers below keep structural sharing: subtrees that do not
 * contain the change keep their object identity, so memoized renderers for
 * untouched elements skip re-rendering. When nothing changes, the input array
 * itself is returned.
 */
const mapUpdateById = (
  elements: EditorElement[],
  id: string,
  updater: (el: EditorElement) => EditorElement,
): EditorElement[] => {
  let changed = false;
  const next = elements.map((el) => {
    if (el.id === id) {
      changed = true;
      return updater(el);
    }
    if (!hasChildren(el)) return el;
    const kids = children(el);
    const nextKids = mapUpdateById(kids, id, updater);
    if (nextKids === kids) return el;
    changed = true;
    return { ...el, elements: nextKids } as EditorElement;
  });
  return changed ? next : elements;
};

const mapDeleteById = (
  elements: EditorElement[],
  id: string,
): EditorElement[] => {
  let changed = false;
  const next: EditorElement[] = [];
  for (const el of elements) {
    if (el.id === id) {
      changed = true;
      continue;
    }
    if (hasChildren(el)) {
      const kids = children(el);
      const nextKids = mapDeleteById(kids, id);
      if (nextKids !== kids) {
        changed = true;
        next.push({ ...el, elements: nextKids } as EditorElement);
        continue;
      }
    }
    next.push(el);
  }
  return changed ? next : elements;
};

/** Inserts `toInsert` at `index` of the list owned by `parentId` (null = page root). */
const mapInsertAt = (
  elements: EditorElement[],
  parentId: string | null | undefined,
  index: number,
  toInsert: EditorElement,
): EditorElement[] => {
  const insertInto = (list: EditorElement[]) => {
    const next = [...list];
    next.splice(Math.max(0, Math.min(index, list.length)), 0, toInsert);
    return next;
  };
  if (!parentId) return insertInto(elements);
  return mapUpdateById(elements, parentId, (parent) =>
    hasChildren(parent)
      ? ({ ...parent, elements: insertInto(children(parent)) } as EditorElement)
      : parent,
  );
};

/** Where an element sits: its parent's id (null = page root) and its index. */
const findLocation = (
  elements: EditorElement[],
  id: string,
  parentId: string | null = null,
): { parentId: string | null; index: number } | undefined => {
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el.id === id) return { parentId, index: i };
    if (hasChildren(el)) {
      const found = findLocation(children(el), id, el.id);
      if (found) return found;
    }
  }
  return undefined;
};

const mapInsertAfterId = (
  elements: EditorElement[],
  targetId: string,
  toInsert: EditorElement,
): EditorElement[] => {
  const location = findLocation(elements, targetId);
  if (!location) return elements;
  return mapInsertAt(elements, location.parentId, location.index + 1, {
    ...toInsert,
    parentId: location.parentId ?? undefined,
  } as EditorElement);
};

export type DropPosition = "before" | "after" | "inside";

/**
 * Inserts `toInsert` before/after `targetId`, or as the last child of it
 * (`inside`). Returns the input unchanged when the target is missing or
 * cannot hold children.
 */
const mapInsertRelative = (
  elements: EditorElement[],
  toInsert: EditorElement,
  targetId: string,
  position: DropPosition,
): EditorElement[] => {
  if (position === "inside") {
    const target = findById(elements, targetId);
    if (!target || !isContainerElement(target)) return elements;
    return mapInsertAt(elements, targetId, children(target).length, {
      ...toInsert,
      parentId: targetId,
    } as EditorElement);
  }
  const location = findLocation(elements, targetId);
  if (!location) return elements;
  const index = position === "before" ? location.index : location.index + 1;
  return mapInsertAt(elements, location.parentId, index, {
    ...toInsert,
    parentId: location.parentId ?? undefined,
  } as EditorElement);
};

/**
 * Moves element `id` relative to `targetId`. Returns the input unchanged when
 * either element is missing, or the target is the element itself or one of
 * its descendants.
 */
const mapMoveRelative = (
  elements: EditorElement[],
  id: string,
  targetId: string,
  position: DropPosition,
): EditorElement[] => {
  if (id === targetId) return elements;
  const moving = findById(elements, id);
  if (!moving || findById([moving], targetId)) return elements;
  const without = mapDeleteById(elements, id);
  const next = mapInsertRelative(without, moving, targetId, position);
  return next === without ? elements : next;
};

const mapRecursively = (
  elements: EditorElement[],
  updater: (el: EditorElement) => EditorElement,
): EditorElement[] =>
  elements.map((el) => {
    const updated = updater(el);
    if (isContainerElement(updated)) {
      return {
        ...updated,
        elements: mapRecursively(updated.elements, updater),
      } as EditorElement;
    }
    return updated;
  });

const mapAddChildById = (
  elements: EditorElement[],
  parentId: string | null | undefined,
  childToAdd: EditorElement,
): EditorElement[] => {
  if (!parentId) return [...elements, childToAdd];

  return mapUpdateById(elements, parentId, (parent) => {
    if (!isContainerElement(parent)) return parent;
    return {
      ...parent,
      elements: [...parent.elements, childToAdd],
    } as EditorElement;
  });
};

const mapSwapChildrenById = (
  elements: EditorElement[],
  parentId: string | null | undefined,
  id1: string,
  id2: string,
): EditorElement[] => {
  const targetElements = !parentId
    ? elements
    : (() => {
        const parent = findById(elements, parentId);
        return parent && isContainerElement(parent) ? parent.elements : null;
      })();

  if (!targetElements) return elements;

  const idx1 = targetElements.findIndex((e) => e.id === id1);
  const idx2 = targetElements.findIndex((e) => e.id === id2);

  if (idx1 === -1 || idx2 === -1) return elements;

  const next = [...targetElements];
  [next[idx1], next[idx2]] = [next[idx2], next[idx1]];

  if (!parentId) return next;

  return mapUpdateById(
    elements,
    parentId,
    (parent) => ({ ...parent, elements: next }) as EditorElement,
  );
};

const flatten = (elements: EditorElement[]): EditorElement[] =>
  elements.flatMap((el) => [
    el,
    ...(hasChildren(el) ? flatten(children(el)) : []),
  ]);

export const ElementTreeHelper = {
  isContainerElement,
  isEditableElement,
  findById,
  mapUpdateById,
  mapDeleteById,
  mapInsertAfterId,
  mapInsertAt,
  mapInsertRelative,
  mapMoveRelative,
  findLocation,
  mapRecursively,
  mapAddChildById,
  mapSwapChildrenById,
  flatten,
};
