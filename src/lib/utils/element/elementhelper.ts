import {
  ContainerElement,
  ContainerElementType,
  EditableElementType,
  EditorElement,
  ElementTemplate,
  ElementType,
} from "@/types/global.type";
import { ALL_ELEMENT_TYPES } from "@/constants/elements";
import { handleSwap } from "./handleSwap";
import type { ResponsiveStyles } from "@/interfaces/elements.interface";
import computeTailwindFromStyles from "./computeTailwindFromStyles";
import React from "react";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import {
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
} from "@/constants/elements";

type Breakpoint = "default" | "sm" | "md" | "lg" | "xl";

const BREAKPOINTS: readonly Breakpoint[] = ["default", "sm", "md", "lg", "xl"];

const getSafeStyles = (element: EditorElement): React.CSSProperties => {
  if (
    !element.styles ||
    typeof element.styles !== "object" ||
    Array.isArray(element.styles)
  ) {
    return {};
  }

  const merged: React.CSSProperties = {};
  const styles = element.styles as Record<string, React.CSSProperties>;

  for (const bp of BREAKPOINTS) {
    if (styles[bp]) {
      Object.assign(merged, styles[bp]);
    }
  }

  return merged;
};

const replacePlaceholders = (text: string, data: unknown): string => {
  if (!data || typeof data !== "object") return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder: string) => {
    const [field, filter] = placeholder.split("|");
    let value: unknown = data;

    for (const part of field.split(".")) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined) return match;

    if (filter === "date" && value) {
      try {
        value = new Date(String(value)).toLocaleDateString();
      } catch {
        // Keep original value if date parsing fails
      }
    }

    return String(value);
  });
};

const findById = (
  elements: EditorElement[],
  id: string,
): EditorElement | undefined => {
  for (const el of elements) {
    if (el.id === id) return el;
    if (isContainerElement(el)) {
      const found = findById(el.elements, id);
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
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapUpdateById(el.elements, id, updater),
      } as EditorElement;
    }
    return el;
  });

const mapDeleteById = (
  elements: EditorElement[],
  id: string,
): EditorElement[] => {
  return elements
    .filter((el) => el.id !== id)
    .map((el) => {
      if (isContainerElement(el)) {
        return {
          ...el,
          elements: mapDeleteById(el.elements, id),
        } as EditorElement;
      }
      return el;
    });
};

const mapInsertAfterId = (
  elements: EditorElement[],
  targetId: string,
  toInsert: EditorElement,
): EditorElement[] => {
  const idx = elements.findIndex((e) => e.id === targetId);
  if (idx !== -1) {
    const newEls = [...elements];
    newEls.splice(idx + 1, 0, toInsert);
    return newEls;
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

/**
 * Recursively maps over all elements in the tree, applying an updater function
 * to each element. Useful for global updates that affect all elements.
 *
 * @param elements - The root elements array
 * @param updater - Function to apply to each element
 * @returns Updated tree with all elements transformed
 */
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

/**
 * Adds a child element to a parent element's children array, recursively
 * searching through the tree. If parentId is null/undefined, adds to root.
 *
 * @param elements - The root elements array
 * @param parentId - ID of the parent element (null for root-level addition)
 * @param childToAdd - The child element to add
 * @returns Updated tree with child added
 */
const mapAddChildById = (
  elements: EditorElement[],
  parentId: string | null | undefined,
  childToAdd: EditorElement,
): EditorElement[] => {
  if (!parentId) {
    return [...elements, childToAdd];
  }

  return mapUpdateById(elements, parentId, (parent) => {
    if (!isContainerElement(parent)) {
      return parent;
    }
    return {
      ...parent,
      elements: [...parent.elements, childToAdd],
    } as EditorElement;
  });
};

/**
 * Swaps the positions of two children within their parent's children array.
 * Both elements must have the same parent.
 *
 * @param elements - The root elements array
 * @param parentId - ID of the parent containing both children (null for root)
 * @param id1 - ID of first child to swap
 * @param id2 - ID of second child to swap
 * @returns Updated tree with children swapped, or unchanged tree if swap fails
 */
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

  if (!targetElements) {
    return elements;
  }

  const idx1 = targetElements.findIndex((e) => e.id === id1);
  const idx2 = targetElements.findIndex((e) => e.id === id2);

  if (idx1 === -1 || idx2 === -1) {
    return elements;
  }

  const newTargetElements = [...targetElements];
  [newTargetElements[idx1], newTargetElements[idx2]] = [
    newTargetElements[idx2],
    newTargetElements[idx1],
  ];

  if (!parentId) {
    return newTargetElements;
  }

  return mapUpdateById(
    elements,
    parentId,
    (parent) =>
      ({
        ...parent,
        elements: newTargetElements,
      }) as EditorElement,
  );
};

const isContainerElement = (
  element: EditorElement,
): element is ContainerElement => {
  return CONTAINER_ELEMENT_TYPES.includes(element.type as ContainerElementType);
};

const isEditableElement = (element: EditorElement): boolean => {
  return EDITABLE_ELEMENT_TYPES.includes(element.type as EditableElementType);
};

const findElement = (
  elements: EditorElement[],
  id: string,
): EditorElement | undefined => {
  const findRecursive = (els: EditorElement[]): EditorElement | undefined => {
    const directMatch = els.find((el) => el.id === id);
    if (directMatch) return directMatch;

    for (const el of els) {
      if (isContainerElement(el)) {
        const nestedMatch = findRecursive(el.elements);
        if (nestedMatch) return nestedMatch;
      }
    }
    return undefined;
  };

  return findRecursive(elements);
};

const getElementSettings = (element: EditorElement): string | null => {
  if (!element || typeof element !== "object" || element.settings == null) {
    return null;
  }
  return JSON.stringify(element.settings);
};

const updateElementStyle = (
  element: EditorElement,
  styles: React.CSSProperties,
  breakpoint: Breakpoint,
  updateElement: (id: string, updates: Partial<EditorElement>) => void,
): void => {
  const currentStyles = element.styles || {};
  const newStyles = { ...currentStyles, [breakpoint]: styles };

  try {
    const computedTailwind = computeTailwindFromStyles(
      newStyles as ResponsiveStyles,
    );
    const mergedTailwind = twMerge(
      cn(element.tailwindStyles || "", computedTailwind),
    );
    updateElement(element.id, {
      styles: newStyles as ResponsiveStyles,
      tailwindStyles: mergedTailwind,
    });
  } catch (err) {
    console.error("Failed to compute tailwind classes from styles:", err);
    updateElement(element.id, { styles: newStyles as ResponsiveStyles });
  }
};

/**
 * Runtime type guard that checks whether a value is a valid {@link ElementType}.
 *
 * Useful for validating user input, drag-data payloads, or any external string
 * before narrowing it to `ElementType`.
 *
 * @param value - The value to check.
 * @returns `true` if `value` is one of the known element types.
 *
 * @example
 * ```ts
 * const raw: unknown = e.dataTransfer.getData("elementType");
 * if (isValidElementType(raw)) {
 *   // raw is now narrowed to ElementType
 *   factory.createElement({ type: raw, pageId });
 * }
 * ```
 */
export function isValidElementType(value: unknown): value is ElementType {
  return (
    typeof value === "string" &&
    (ALL_ELEMENT_TYPES as readonly string[]).includes(value)
  );
}

export const elementHelper = {
  getSafeStyles,
  replacePlaceholders,
  findById,
  mapUpdateById,
  mapDeleteById,
  mapInsertAfterId,
  mapRecursively,
  mapAddChildById,
  mapSwapChildrenById,
  isContainerElement,
  isEditableElement,
  findElement,
  getElementSettings,
  updateElementStyle,
  computeTailwindFromStyles,
  handleSwap,
  isValidElementType,
};

export type { Breakpoint };
