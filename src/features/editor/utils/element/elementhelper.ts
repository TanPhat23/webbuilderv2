import { EditorElement, ElementType } from "@/types/global.type";
import { ElementTreeHelper } from "./element-tree-helper";
import { ALL_ELEMENT_TYPES } from "@/features/editor";
import { handleSwap } from "./handleSwap";
import type { ResponsiveStyles } from "@/features/editor";
import computeTailwindFromStyles from "./computeTailwindFromStyles";
import React from "react";
import { cn } from "@/lib/utils";
import { twMerge } from "tailwind-merge";

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
        // keep original value if date parsing fails
      }
    }

    return String(value);
  });
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

/** Returns `true` if `value` is a known `ElementType`. */
export function isValidElementType(value: unknown): value is ElementType {
  return (
    typeof value === "string" &&
    (ALL_ELEMENT_TYPES as readonly string[]).includes(value)
  );
}

export const elementHelper = {
  // styles
  getSafeStyles,
  updateElementStyle,
  computeTailwindFromStyles,
  // content
  replacePlaceholders,
  getElementSettings,
  // tree — delegated to ElementTreeHelper
  isContainerElement: ElementTreeHelper.isContainerElement,
  isEditableElement: ElementTreeHelper.isEditableElement,
  findById: ElementTreeHelper.findById,
  mapUpdateById: ElementTreeHelper.mapUpdateById,
  mapDeleteById: ElementTreeHelper.mapDeleteById,
  mapInsertAfterId: ElementTreeHelper.mapInsertAfterId,
  mapRecursively: ElementTreeHelper.mapRecursively,
  mapAddChildById: ElementTreeHelper.mapAddChildById,
  mapSwapChildrenById: ElementTreeHelper.mapSwapChildrenById,
  insertAtPosition: ElementTreeHelper.insertAtPosition,
  // misc
  handleSwap,
  isValidElementType,
};

export type { Breakpoint };
