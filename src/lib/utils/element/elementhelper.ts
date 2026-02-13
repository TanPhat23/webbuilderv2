import {
  ContainerElement,
  ContainerElementType,
  EditableElementType,
  EditorElement,
  ElementTemplate,
  ElementType,
} from "@/types/global.type";
import { reject, find } from "lodash";
import { handleSwap } from "./handleSwap";
import computeTailwindFromStyles from "./computeTailwindFromStyles";
import React from "react";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";
import {
  CONTAINER_ELEMENT_TYPES,
  EDITABLE_ELEMENT_TYPES,
} from "@/constants/elements";
import {
  createElement,
  createElementFromTemplate,
} from "./create/createElements";
import { ResponsiveStyles } from "@/interfaces/elements.interface";

// Helper function to safely extract styles from an element
const getSafeStyles = (element: EditorElement): React.CSSProperties => {
  if (
    !element.styles ||
    typeof element.styles !== "object" ||
    Array.isArray(element.styles)
  ) {
    return {};
  }
  const merged: React.CSSProperties = {};
  const styles = element.styles;
  const breakpoints: (keyof typeof styles)[] = [
    "default",
    "sm",
    "md",
    "lg",
    "xl",
  ];
  breakpoints.forEach((bp) => {
    if (styles[bp]) {
      Object.assign(merged, styles[bp]);
    }
  });
  return merged;
};

// Helper function to replace placeholders like {{field}} with data values
const replacePlaceholders = (text: string, data: any): string => {
  if (!data || typeof data !== "object") return text;

  return text.replace(/\{\{([^}]+)\}\}/g, (match, placeholder) => {
    const [field, filter] = placeholder.split("|");
    let value = data;

    // Support nested property access using dot notation (e.g., "0.content", "item.title")
    for (const part of field.split(".")) {
      if (value && typeof value === "object" && part in value) {
        value = value[part];
      } else {
        value = undefined;
        break;
      }
    }

    if (value === undefined) return match; // Keep placeholder if field not found

    // Apply filters
    if (filter === "date" && value) {
      try {
        value = new Date(value).toLocaleDateString();
      } catch {
        // Keep original value if date parsing fails
      }
    }

    return String(value);
  });
};

const findById = (
  els: EditorElement[],
  id: string,
): EditorElement | undefined => {
  for (const el of els) {
    if (el.id === id) return el;
    if (isContainerElement(el)) {
      const found = findById((el as ContainerElement).elements, id);
      if (found) return found;
    }
  }
  return undefined;
};

const mapUpdateById = (
  els: EditorElement[],
  id: string,
  updater: (el: EditorElement) => EditorElement,
): EditorElement[] =>
  els.map((el) => {
    if (el.id === id) return updater(el);
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapUpdateById(el.elements, id, updater),
      } as EditorElement;
    }
    return el;
  });

const mapDeleteById = (els: EditorElement[], id: string): EditorElement[] => {
  return reject(els, (el) => el.id === id).map((el) => {
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapDeleteById(el.elements, id),
      } as EditorElement;
    }
    return el;
  });
};

export const mapInsertAfterId = (
  els: EditorElement[],
  targetId: string,
  toInsert: EditorElement,
): EditorElement[] => {
  const idx = els.findIndex((e) => e.id === targetId);
  if (idx !== -1) {
    const newEls = [...els];
    newEls.splice(idx + 1, 0, toInsert);
    return newEls;
  }
  return els.map((el) => {
    if (isContainerElement(el)) {
      return {
        ...el,
        elements: mapInsertAfterId(el.elements, targetId, toInsert),
      } as EditorElement;
    }
    return el;
  });
};

interface ICreateElement {
  create: <T extends EditorElement>(
    type: ElementType,
    pageId: string,
    parentId?: string,
  ) => T | undefined;

  createFromTemplate: <T extends EditorElement>(
    element: ElementTemplate,
    pageId: string,
  ) => T | undefined;
}

interface ElementHelper {
  createElement: ICreateElement;

  handleSwap: (
    draggingElement: EditorElement,
    hoveredElement: EditorElement,
    elements: EditorElement[],
    setElements: (elements: EditorElement[]) => void,
  ) => void;

  findElement: (
    elements: EditorElement[],
    id: string,
  ) => EditorElement | undefined;

  getElementSettings: (element: EditorElement) => string | null;

  isContainerElement: (element: EditorElement) => element is ContainerElement;

  isEditableElement: (element: EditorElement) => boolean;

  computeTailwindFromStyles: (styles: ResponsiveStyles | undefined) => string;

  updateElementStyle: (
    element: EditorElement,
    styles: React.CSSProperties,
    breakpoint: "default" | "sm" | "md" | "lg" | "xl",
    updateElement: (id: string, updates: Partial<EditorElement>) => void,
  ) => void;

  findById: (els: EditorElement[], id: string) => EditorElement | undefined;

  mapUpdateById: (
    els: EditorElement[],
    id: string,
    updater: (el: EditorElement) => EditorElement,
  ) => EditorElement[];

  mapDeleteById: (els: EditorElement[], id: string) => EditorElement[];

  mapInsertAfterId: (
    els: EditorElement[],
    targetId: string,
    toInsert: EditorElement,
  ) => EditorElement[];

  replacePlaceholders: (text: string, data: any) => string;

  getSafeStyles: (element: EditorElement) => React.CSSProperties;
}

export const isContainerElement = (
  element: EditorElement,
): element is ContainerElement => {
  return CONTAINER_ELEMENT_TYPES.includes(element.type as ContainerElementType);
};

const findElement = (
  elements: EditorElement[],
  id: string,
): EditorElement | undefined => {
  const findRecursive = (els: EditorElement[]): EditorElement | undefined => {
    const directMatch = find(els, (el) => el.id === id);
    if (directMatch) return directMatch;

    for (const el of els) {
      if ("elements" in el && Array.isArray(el.elements)) {
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
  breakpoint: "default" | "sm" | "md" | "lg" | "xl",
  updateElement: (id: string, updates: Partial<EditorElement>) => void,
): void => {
  const currentStyles = element.styles || {};
  const newStyles = { ...currentStyles, [breakpoint]: styles };

  try {
    const computedTailwind = computeTailwindFromStyles(newStyles);
    const mergedTailwind = twMerge(
      cn(element.tailwindStyles || "", computedTailwind),
    );
    updateElement(element.id, {
      styles: newStyles,
      tailwindStyles: mergedTailwind,
    });
  } catch (err) {
    console.error("Failed to compute tailwind classes from styles:", err);
    updateElement(element.id, { styles: newStyles });
  }
};

export const elementHelper: ElementHelper = {
  createElement: {
    create: createElement,
    createFromTemplate: createElementFromTemplate,
  },
  handleSwap: handleSwap,
  findElement: findElement,
  getElementSettings: getElementSettings,
  isContainerElement: isContainerElement,
  isEditableElement: (element: EditorElement): boolean => {
    return EDITABLE_ELEMENT_TYPES.includes(element.type as EditableElementType);
  },
  computeTailwindFromStyles: computeTailwindFromStyles,
  updateElementStyle: updateElementStyle,
  findById: findById,
  mapUpdateById: mapUpdateById,
  mapDeleteById: mapDeleteById,
  mapInsertAfterId: mapInsertAfterId,
  replacePlaceholders: replacePlaceholders,
  getSafeStyles: getSafeStyles,
};
