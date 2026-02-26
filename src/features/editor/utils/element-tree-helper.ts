import type { EditorElement } from "@/types/global.type";

/**
 * Utility class for working with hierarchical element trees.
 * Provides methods for finding, updating, deleting, and inserting elements
 * in a tree structure while maintaining immutability.
 */
export class ElementTreeHelper {
  /**
   * Recursively finds an element by its ID in the element tree.
   *
   * @param elements - Array of elements to search
   * @param id - The ID of the element to find
   * @returns The found element or undefined
   */
  static findById(
    elements: EditorElement[],
    id: string,
  ): EditorElement | undefined {
    for (const element of elements) {
      if (element.id === id) return element;

      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        const found = this.findById(containerElement.elements, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Recursively updates an element by its ID in the element tree.
   * Returns a new array with the update applied (immutable).
   *
   * @param elements - Array of elements to search
   * @param id - The ID of the element to update
   * @param updater - Function that receives the element and returns the updated version
   * @returns New array with the update applied
   */
  static mapUpdateById(
    elements: EditorElement[],
    id: string,
    updater: (el: EditorElement) => EditorElement,
  ): EditorElement[] {
    return elements.map((element) => {
      if (element.id === id) return updater(element);

      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        return {
          ...element,
          elements: this.mapUpdateById(containerElement.elements, id, updater),
        } as EditorElement;
      }
      return element;
    });
  }

  /**
   * Recursively deletes an element by its ID from the element tree.
   * Returns a new array with the element removed (immutable).
   *
   * @param elements - Array of elements to search
   * @param id - The ID of the element to delete
   * @returns New array with the element removed
   */
  static mapDeleteById(elements: EditorElement[], id: string): EditorElement[] {
    return elements
      .filter((element) => element.id !== id)
      .map((element) => {
        const containerElement = element as unknown as {
          elements?: EditorElement[];
        };
        if (
          containerElement.elements &&
          Array.isArray(containerElement.elements)
        ) {
          return {
            ...element,
            elements: this.mapDeleteById(containerElement.elements, id),
          } as EditorElement;
        }
        return element;
      });
  }

  /**
   * Inserts an element at a specific position in the array.
   * If position is undefined or out of bounds, appends to the end.
   *
   * @param elements - Array of elements
   * @param element - Element to insert
   * @param position - Optional position to insert at (0-based index)
   * @returns New array with element inserted
   */
  static insertAtPosition(
    elements: EditorElement[],
    element: EditorElement,
    position?: number,
  ): EditorElement[] {
    const newElements = [...elements];
    if (
      position !== undefined &&
      position >= 0 &&
      position <= elements.length
    ) {
      newElements.splice(position, 0, element);
    } else {
      newElements.push(element);
    }
    return newElements;
  }

  /**
   * Finds the parent element that contains the child with the given ID.
   *
   * @param elements - Array of elements to search
   * @param childId - The ID of the child element
   * @returns The parent element or undefined
   */
  static findParent(
    elements: EditorElement[],
    childId: string,
  ): EditorElement | undefined {
    for (const element of elements) {
      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        // Check if this element is the direct parent
        if (
          containerElement.elements.some((child) => child.id === childId)
        ) {
          return element;
        }

        // Recursively search in children
        const found = this.findParent(containerElement.elements, childId);
        if (found) return found;
      }
    }
    return undefined;
  }

  /**
   * Counts the total number of elements in the tree (including nested).
   *
   * @param elements - Array of elements to count
   * @returns Total number of elements
   */
  static countElements(elements: EditorElement[]): number {
    let count = elements.length;

    for (const element of elements) {
      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        count += this.countElements(containerElement.elements);
      }
    }

    return count;
  }

  /**
   * Flattens the element tree into a single-level array.
   *
   * @param elements - Array of elements to flatten
   * @returns Flattened array of all elements
   */
  static flatten(elements: EditorElement[]): EditorElement[] {
    const result: EditorElement[] = [];

    for (const element of elements) {
      result.push(element);

      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        result.push(...this.flatten(containerElement.elements));
      }
    }

    return result;
  }

  /**
   * Gets all IDs from the element tree.
   *
   * @param elements - Array of elements
   * @returns Array of all element IDs
   */
  static getAllIds(elements: EditorElement[]): string[] {
    return this.flatten(elements).map((el) => el.id);
  }

  /**
   * Checks if an element with the given ID exists in the tree.
   *
   * @param elements - Array of elements to search
   * @param id - The ID to check for
   * @returns True if element exists, false otherwise
   */
  static exists(elements: EditorElement[], id: string): boolean {
    return this.findById(elements, id) !== undefined;
  }

  /**
   * Gets the depth/level of an element in the tree (0 for root level).
   *
   * @param elements - Array of elements to search
   * @param id - The ID of the element
   * @param currentDepth - Current recursion depth (internal use)
   * @returns Depth of the element, or -1 if not found
   */
  static getDepth(
    elements: EditorElement[],
    id: string,
    currentDepth = 0,
  ): number {
    for (const element of elements) {
      if (element.id === id) return currentDepth;

      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        const depth = this.getDepth(
          containerElement.elements,
          id,
          currentDepth + 1,
        );
        if (depth !== -1) return depth;
      }
    }
    return -1;
  }

  /**
   * Gets the path from root to an element (array of IDs).
   *
   * @param elements - Array of elements to search
   * @param id - The ID of the target element
   * @returns Array of IDs representing the path, or empty array if not found
   */
  static getPath(elements: EditorElement[], id: string): string[] {
    for (const element of elements) {
      if (element.id === id) return [id];

      const containerElement = element as unknown as {
        elements?: EditorElement[];
      };
      if (
        containerElement.elements &&
        Array.isArray(containerElement.elements)
      ) {
        const childPath = this.getPath(containerElement.elements, id);
        if (childPath.length > 0) {
          return [element.id, ...childPath];
        }
      }
    }
    return [];
  }

  /**
   * Validates the element tree structure.
   *
   * @param elements - Array of elements to validate
   * @returns Object with validation results
   */
  static validate(elements: EditorElement[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    const seenIds = new Set<string>();

    const validateRecursive = (
      els: EditorElement[],
      parentId: string | null = null,
    ): void => {
      for (const element of els) {
        // Check for duplicate IDs
        if (seenIds.has(element.id)) {
          errors.push(`Duplicate element ID: ${element.id}`);
        } else {
          seenIds.add(element.id);
        }

        // Check parentId consistency
        if (element.parentId !== parentId) {
          errors.push(
            `Element ${element.id} has incorrect parentId. Expected: ${parentId}, Got: ${element.parentId}`,
          );
        }

        // Recursively validate children
        const containerElement = element as unknown as {
          elements?: EditorElement[];
        };
        if (
          containerElement.elements &&
          Array.isArray(containerElement.elements)
        ) {
          validateRecursive(containerElement.elements, element.id);
        }
      }
    };

    validateRecursive(elements);

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
