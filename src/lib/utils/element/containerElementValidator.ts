import { z } from "zod";
import { EditorElement, ContainerElement } from "@/types/global.type";
import { CONTAINER_ELEMENT_TYPES } from "@/constants/elements";

/**
 * Zod schema for validating container elements
 * Ensures all container elements have the required `elements` array
 */

// Base schema that matches EditorElement structure (simplified)
// Note: settings and styles use .nullable().transform() to convert null → {}
const BaseElementSchema = z.object({
  id: z.string(),
  type: z.string(),
  pageId: z.string().optional(),
  parentId: z.string().optional(),
  styles: z
    .record(z.string(), z.any())
    .nullable()
    .transform((val) => val ?? {})
    .optional(),
  name: z.string().optional(),
  src: z.string().optional(),
  href: z.string().optional(),
  content: z.string().optional(),
  settings: z
    .record(z.string(), z.any())
    .nullable()
    .transform((val) => val ?? {})
    .optional(),
  tailwindStyles: z.string().optional(),
});

// Lazy schema for recursive element validation
type ElementSchema = z.ZodType<EditorElement>;

const ElementSchemaLazy: ElementSchema = BaseElementSchema.extend({
  elements: z.lazy(() => ElementSchemaLazy.array()).optional(),
}).passthrough() as ElementSchema;

export function validateAndNormalizeElement(element: unknown): EditorElement {
  try {
    // Parse with lazy schema to handle nested elements
    const parsed = ElementSchemaLazy.parse(element);

    // Check if this is a container element
    const isContainer = CONTAINER_ELEMENT_TYPES.includes(parsed.type as any);

    if (isContainer) {
      const container = parsed as any;
      // Ensure elements array exists
      if (!Array.isArray(container.elements)) {
        container.elements = [];
      }
      // Recursively normalize nested elements
      container.elements = container.elements.map((child: any) =>
        validateAndNormalizeElement(child),
      );
    }

    // Ensure settings and styles are objects (not null)
    if (!parsed.settings) {
      (parsed as any).settings = {};
    }
    if (!parsed.styles) {
      (parsed as any).styles = {};
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[ContainerValidator] Validation error for element:", {
        message: error.message,
        element,
      });
    }
    throw error;
  }
}

/**
 * Validates and normalizes entire element tree
 */
export function validateAndNormalizeElementTree(
  elements: unknown,
): EditorElement[] {
  try {
    const parsed = z.array(ElementSchemaLazy).parse(elements);
    return parsed.map((el) => {
      const normalized = validateAndNormalizeElement(el);
      // Ensure every element in tree has proper settings/styles
      if (!normalized.settings) {
        (normalized as any).settings = {};
      }
      if (!normalized.styles) {
        (normalized as any).styles = {};
      }
      return normalized;
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        "[ContainerValidator] Element tree validation error:",
        error.message,
      );
    }
    throw error;
  }
}

/**
 * Safe validation - returns validation result instead of throwing
 */
export function safeValidateElement(element: unknown): {
  success: boolean;
  data?: EditorElement;
  error?: string;
} {
  try {
    const data = validateAndNormalizeElement(element);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Safe validation for element tree
 */
export function safeValidateElementTree(elements: unknown): {
  success: boolean;
  data?: EditorElement[];
  error?: string;
} {
  try {
    const data = validateAndNormalizeElementTree(elements);
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Unknown validation error",
    };
  }
}

/**
 * Checks if a single element is a valid container with elements array
 */
export function isValidContainerElement(element: EditorElement): boolean {
  const isContainer = CONTAINER_ELEMENT_TYPES.includes(element.type as any);
  if (!isContainer) {
    return true; // Not a container, so it's valid
  }

  const container = element as any;
  return Array.isArray(container.elements);
}

/**
 * Validates entire tree structure
 * Returns object with validation status and any issues found
 */
export function validateContainerElementTree(elements: EditorElement[]): {
  valid: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  const validateRecursive = (els: EditorElement[], path: string = "root") => {
    for (const el of els) {
      const isContainer = CONTAINER_ELEMENT_TYPES.includes(el.type as any);

      if (isContainer) {
        const container = el as any;
        const currentPath = `${path}/${el.type}[${el.id.slice(0, 8)}]`;

        if (!Array.isArray(container.elements)) {
          issues.push(
            `${currentPath}: missing or non-array elements field (got ${typeof container.elements})`,
          );
          continue;
        }

        validateRecursive(container.elements, currentPath);
      }
    }
  };

  validateRecursive(elements);
  return {
    valid: issues.length === 0,
    issues,
  };
}

/**
 * Recursively counts all elements in a tree
 */
export function countAllElements(elements: EditorElement[]): number {
  let count = 0;
  for (const el of elements) {
    count++;
    const isContainer = CONTAINER_ELEMENT_TYPES.includes(el.type as any);
    if (isContainer) {
      const container = el as any;
      if (Array.isArray(container.elements)) {
        count += countAllElements(container.elements);
      }
    }
  }
  return count;
}

/**
 * Gets all element IDs in a tree
 */
export function getAllElementIds(elements: EditorElement[]): string[] {
  const ids: string[] = [];
  for (const el of elements) {
    ids.push(el.id);
    const isContainer = CONTAINER_ELEMENT_TYPES.includes(el.type as any);
    if (isContainer) {
      const container = el as any;
      if (Array.isArray(container.elements)) {
        ids.push(...getAllElementIds(container.elements));
      }
    }
  }
  return ids;
}

/**
 * Gets element tree structure as a debug string
 */
export function getElementTreeDebugString(
  elements: EditorElement[],
  indent: number = 0,
): string {
  const indentStr = "  ".repeat(indent);
  const lines: string[] = [];

  for (const el of elements) {
    const isContainer = CONTAINER_ELEMENT_TYPES.includes(el.type as any);
    const container = el as any;
    const childCount =
      isContainer && Array.isArray(container.elements)
        ? container.elements.length
        : 0;

    lines.push(
      `${indentStr}${el.type} [${el.id.slice(0, 8)}]${isContainer ? ` (${childCount} children)` : ""}`,
    );

    if (isContainer && Array.isArray(container.elements)) {
      lines.push(getElementTreeDebugString(container.elements, indent + 1));
    }
  }

  return lines.join("\n");
}

/**
 * Flattens tree to a single array of all elements
 */
export function flattenElementTree(elements: EditorElement[]): EditorElement[] {
  const flattened: EditorElement[] = [];

  const flatten = (els: EditorElement[]) => {
    for (const el of els) {
      flattened.push(el);
      const isContainer = CONTAINER_ELEMENT_TYPES.includes(el.type as any);
      if (isContainer) {
        const container = el as any;
        if (Array.isArray(container.elements)) {
          flatten(container.elements);
        }
      }
    }
  };

  flatten(elements);
  return flattened;
}

/**
 * Logs element tree structure for debugging
 */
export function debugLogElementTree(
  elements: EditorElement[],
  label: string = "Element Tree",
): void {
  const treeString = getElementTreeDebugString(elements);
  const totalCount = countAllElements(elements);
  const validation = validateContainerElementTree(elements);

  console.group(`[ContainerValidator] ${label}`);
  console.log(`Total elements: ${totalCount}`);
  console.log(`Valid: ${validation.valid}`);
  if (validation.issues.length > 0) {
    console.warn("Issues found:", validation.issues);
  }
  console.log("Tree structure:\n" + treeString);
  console.groupEnd();
}
