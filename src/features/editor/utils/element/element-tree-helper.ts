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

const mapUpdateById = (
  elements: EditorElement[],
  id: string,
  updater: (el: EditorElement) => EditorElement,
): EditorElement[] =>
  elements.map((el) => {
    if (el.id === id) return updater(el);
    if (hasChildren(el)) {
      return {
        ...el,
        elements: mapUpdateById(children(el), id, updater),
      } as EditorElement;
    }
    return el;
  });

const mapDeleteById = (
  elements: EditorElement[],
  id: string,
): EditorElement[] =>
  elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (hasChildren(el)) {
        return {
          ...el,
          elements: mapDeleteById(children(el), id),
        } as EditorElement;
      }
      return el;
    });

const mapInsertAfterId = (
  elements: EditorElement[],
  targetId: string,
  toInsert: EditorElement,
): EditorElement[] => {
  const idx = elements.findIndex((e) => e.id === targetId);
  if (idx !== -1) {
    const next = [...elements];
    next.splice(idx + 1, 0, toInsert);
    return next;
  }
  return elements.map((el) => {
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapInsertAfterId(el.elements, targetId, toInsert),
      } as EditorElement;
    }
    return el;
  });
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
  mapRecursively,
  mapAddChildById,
  mapSwapChildrenById,
  flatten,
};
