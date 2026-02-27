import { z } from "zod";
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
import { ElementSchema } from "../../schema/element";

const asContainer = (el: EditorElement): ContainerElement =>
  el as unknown as ContainerElement;

const hasChildren = (el: EditorElement): boolean =>
  Array.isArray(asContainer(el).elements);

const children = (el: EditorElement): EditorElement[] =>
  asContainer(el).elements ?? [];


type EditorElementInput = z.infer<typeof ElementSchema> & {
  elements?: EditorElementInput[];
};

const EditorElementSchema: z.ZodType<EditorElementInput> =
  ElementSchema.extend({
    get elements() {
      return z.array(EditorElementSchema).optional();
    },
  });

const EditorElementArraySchema = z.array(EditorElementSchema);

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

const insertAtPosition = (
  elements: EditorElement[],
  element: EditorElement,
  position?: number,
): EditorElement[] => {
  const next = [...elements];
  if (position !== undefined && position >= 0 && position <= elements.length) {
    next.splice(position, 0, element);
  } else {
    next.push(element);
  }
  return next;
};

const findParent = (
  elements: EditorElement[],
  childId: string,
): EditorElement | undefined => {
  for (const el of elements) {
    if (!hasChildren(el)) continue;
    if (children(el).some((c) => c.id === childId)) return el;
    const found = findParent(children(el), childId);
    if (found) return found;
  }
  return undefined;
};

const countElements = (elements: EditorElement[]): number =>
  elements.reduce(
    (acc, el) => acc + 1 + (hasChildren(el) ? countElements(children(el)) : 0),
    0,
  );

const flatten = (elements: EditorElement[]): EditorElement[] =>
  elements.flatMap((el) => [
    el,
    ...(hasChildren(el) ? flatten(children(el)) : []),
  ]);

const getAllIds = (elements: EditorElement[]): string[] =>
  flatten(elements).map((el) => el.id);

const exists = (elements: EditorElement[], id: string): boolean =>
  findById(elements, id) !== undefined;

const getDepth = (
  elements: EditorElement[],
  id: string,
  currentDepth = 0,
): number => {
  for (const el of elements) {
    if (el.id === id) return currentDepth;
    if (hasChildren(el)) {
      const depth = getDepth(children(el), id, currentDepth + 1);
      if (depth !== -1) return depth;
    }
  }
  return -1;
};

const getPath = (elements: EditorElement[], id: string): string[] => {
  for (const el of elements) {
    if (el.id === id) return [id];
    if (hasChildren(el)) {
      const childPath = getPath(children(el), id);
      if (childPath.length > 0) return [el.id, ...childPath];
    }
  }
  return [];
};

const validate = (
  elements: EditorElement[],
): { isValid: boolean; errors: string[] } => {
  const result = EditorElementArraySchema.safeParse(elements);

  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map(
        (issue) => `[${issue.path.join(".")}] ${issue.message}`,
      ),
    };
  }

  const errors: string[] = [];
  const seenIds = new Set<string>();

  const check = (els: EditorElement[], parentId: string | null): void => {
    for (const el of els) {
      if (seenIds.has(el.id)) {
        errors.push(`Duplicate element ID: ${el.id}`);
      } else {
        seenIds.add(el.id);
      }

      if (el.parentId !== parentId) {
        errors.push(
          `Element ${el.id} has incorrect parentId. Expected: ${parentId}, Got: ${el.parentId}`,
        );
      }

      if (hasChildren(el)) check(children(el), el.id);
    }
  };

  check(elements, null);
  return { isValid: errors.length === 0, errors };
};

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
  insertAtPosition,
  findParent,
  countElements,
  flatten,
  getAllIds,
  exists,
  getDepth,
  getPath,
  validate,
};
