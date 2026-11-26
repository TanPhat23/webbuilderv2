import { replacePlaceholders } from "./replacePlaceholders";
import { EditorElement, ElementType } from "../../types/global.type";
import { elementTree } from "./element-tree-helper";
import { ALL_ELEMENT_TYPES, type ResponsiveStyles } from "../../types/elements";
import computeTailwindFromStyles from "./computeTailwindFromStyles";
import React from "react";
import { cn } from "../../lib/utils";
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
  /** Extra classes to remove, e.g. a stale size class on a re-sized axis. */
  dropClass?: (cls: string) => boolean,
): void => {
  const currentStyles = element.styles || {};
  const newStyles = { ...currentStyles, [breakpoint]: styles };

  try {
    const computedTailwind = computeTailwindFromStyles(
      newStyles as ResponsiveStyles,
    );
    // Classes generated from the previous styles must go first; otherwise a
    // removed style (say a width) lives on as its class and still applies.
    const generatedBefore = new Set(
      computeTailwindFromStyles(currentStyles as ResponsiveStyles)
        .split(/\s+/)
        .filter(Boolean),
    );
    const kept = (element.tailwindStyles || "")
      .split(/\s+/)
      .filter((c) => c && !generatedBefore.has(c) && !dropClass?.(c));
    const mergedTailwind = twMerge(cn(kept.join(" "), computedTailwind));
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

export const elementUtils = {
  // styles
  getSafeStyles,
  updateElementStyle,
  computeTailwindFromStyles,
  // content
  replacePlaceholders,
  getElementSettings,
  // tree — delegated to elementTree
  isContainerElement: elementTree.isContainerElement,
  isEditableElement: elementTree.isEditableElement,
  findById: elementTree.findById,
  mapUpdateById: elementTree.mapUpdateById,
  mapDeleteById: elementTree.mapDeleteById,
  mapInsertAfterId: elementTree.mapInsertAfterId,
  mapInsertAt: elementTree.mapInsertAt,
  mapInsertRelative: elementTree.mapInsertRelative,
  mapMoveRelative: elementTree.mapMoveRelative,
  findLocation: elementTree.findLocation,
  mapRecursively: elementTree.mapRecursively,
  mapAddChildById: elementTree.mapAddChildById,
  mapSwapChildrenById: elementTree.mapSwapChildrenById,
  // misc
  isValidElementType,
};

export type { Breakpoint };
