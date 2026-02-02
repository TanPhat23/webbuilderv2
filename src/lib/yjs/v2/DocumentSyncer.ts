import * as Y from "yjs";
import { EditorElement } from "@/types/global.type";
import { Page } from "@/interfaces/page.interface";
import type {
  ElementOperationSuccess,
  PageOperationSuccess,
} from "@/interfaces/yjs-v2.interface";
import { ElementTreeHelper } from "@/lib/utils/element-tree-helper";

/**
 * Handles the synchronization and mutation of the YJS document.
 * This class encapsulates all logic related to how data is structured and updated
 * within the Y.Doc instances (e.g., elementsJson, pagesJson).
 *
 * It utilizes ElementTreeHelper for complex recursive operations on the element tree.
 *
 * Part of the refactored CustomYjsProviderV2 using OOP patterns.
 */
export class DocumentSyncer {
  constructor(private doc: Y.Doc) {}

  /**
   * Resets the document state with initial elements from the server.
   * Uses the 'v2-sync' transaction origin to distinguish from user-initiated changes.
   */
  public applyInitialSync(elements: EditorElement[]): void {
    Y.transact(
      this.doc,
      () => {
        const yElementsText = this.doc.getText("elementsJson");
        yElementsText.delete(0, yElementsText.length);
        yElementsText.insert(0, JSON.stringify(elements));
      },
      "v2-sync",
    );
  }

  /**
   * Routes and applies element-related operation results from the WebSocket.
   */
  public handleElementOperation(message: ElementOperationSuccess): void {
    const currentElements = this.getCurrentElements();
    let updatedElements: EditorElement[] = [...currentElements];

    switch (message.operationType) {
      case "create":
      case "update":
        if (message.element) {
          updatedElements = this.applyElementUpsert(
            updatedElements,
            message.element,
          );
        }
        break;
      case "delete":
        if (message.deletedElementId) {
          updatedElements = this.applyElementDelete(
            updatedElements,
            message.deletedElementId,
            message.deletedChildren,
          );
        }
        break;
      case "move":
        if (message.elementId && message.newParentId !== undefined) {
          updatedElements = this.applyElementMove(
            updatedElements,
            message.elementId,
            message.newParentId,
            message.newPosition ?? 0,
          );
        }
        break;
    }

    this.updateElementsInDoc(updatedElements);
  }

  /**
   * Routes and applies page-related operation results from the WebSocket.
   */
  public handlePageOperation(message: PageOperationSuccess): void {
    const currentPages = this.getCurrentPages();
    let updatedPages = [...currentPages];

    switch (message.operationType) {
      case "create":
      case "update":
        if (message.page) {
          const index = updatedPages.findIndex(
            (p) => p.Id === message.page?.Id,
          );
          if (index !== -1) {
            updatedPages[index] = { ...updatedPages[index], ...message.page };
          } else {
            updatedPages.push(message.page);
          }
        }
        break;
      case "delete":
        if (message.deletedPageId) {
          updatedPages = updatedPages.filter(
            (p) => p.Id !== message.deletedPageId,
          );
        }
        break;
    }

    this.updatePagesInDoc(updatedPages);
  }

  /**
   * Retrieves current elements from the YJS text type.
   */
  public getCurrentElements(): EditorElement[] {
    const yElementsText = this.doc.getText("elementsJson");
    const json = yElementsText.toString();
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error("[DocumentSyncer] Failed to parse elements JSON:", err);
      return [];
    }
  }

  /**
   * Retrieves current pages from the YJS text type.
   */
  public getCurrentPages(): Page[] {
    const yPagesText = this.doc.getText("pagesJson");
    const json = yPagesText.toString();
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch (err) {
      console.error("[DocumentSyncer] Failed to parse pages JSON:", err);
      return [];
    }
  }

  /**
   * Updates the elementsJson Y.Text type in the document.
   */
  private updateElementsInDoc(elements: EditorElement[]): void {
    Y.transact(
      this.doc,
      () => {
        const yElementsText = this.doc.getText("elementsJson");
        const json = JSON.stringify(elements);
        if (yElementsText.toString() !== json) {
          yElementsText.delete(0, yElementsText.length);
          yElementsText.insert(0, json);
        }
      },
      "remote-update",
    );
  }

  /**
   * Updates the pagesJson Y.Text type in the document.
   */
  private updatePagesInDoc(pages: Page[]): void {
    Y.transact(
      this.doc,
      () => {
        const yPagesText = this.doc.getText("pagesJson");
        const json = JSON.stringify(pages);
        if (yPagesText.toString() !== json) {
          yPagesText.delete(0, yPagesText.length);
          yPagesText.insert(0, json);
        }
      },
      "remote-update",
    );
  }

  private applyElementUpsert(
    elements: EditorElement[],
    element: EditorElement,
  ): EditorElement[] {
    const existing = ElementTreeHelper.findById(elements, element.id);

    if (existing) {
      return ElementTreeHelper.mapUpdateById(
        elements,
        element.id,
        () => element,
      );
    }

    if (element.parentId) {
      return ElementTreeHelper.mapUpdateById(
        elements,
        element.parentId,
        (parent) => {
          const container = parent as unknown as { elements?: EditorElement[] };
          const children = container.elements || [];
          const updatedChildren = ElementTreeHelper.insertAtPosition(
            children,
            element,
            element.order,
          );

          return {
            ...parent,
            elements: updatedChildren,
          } as EditorElement;
        },
      );
    }

    return ElementTreeHelper.insertAtPosition(elements, element, element.order);
  }

  private applyElementDelete(
    elements: EditorElement[],
    elementId: string,
    deletedChildren?: string[],
  ): EditorElement[] {
    let updated = ElementTreeHelper.mapDeleteById(elements, elementId);

    if (deletedChildren?.length) {
      for (const id of deletedChildren) {
        updated = ElementTreeHelper.mapDeleteById(updated, id);
      }
    }

    return updated;
  }

  private applyElementMove(
    elements: EditorElement[],
    elementId: string,
    newParentId: string | null,
    newPosition: number,
  ): EditorElement[] {
    const elementToMove = ElementTreeHelper.findById(elements, elementId);
    if (!elementToMove) return elements;

    // Remove from old position
    let updated = ElementTreeHelper.mapDeleteById(elements, elementId);

    // Create updated version of the element
    const movedElement: EditorElement = {
      ...elementToMove,
      parentId: newParentId ?? undefined,
      order: newPosition,
    };

    // Insert into new position
    if (newParentId) {
      return ElementTreeHelper.mapUpdateById(updated, newParentId, (parent) => {
        const container = parent as unknown as { elements?: EditorElement[] };
        const children = container.elements || [];
        const updatedChildren = ElementTreeHelper.insertAtPosition(
          children,
          movedElement,
          newPosition,
        );

        return {
          ...parent,
          elements: updatedChildren,
        } as EditorElement;
      });
    }

    return ElementTreeHelper.insertAtPosition(
      updated,
      movedElement,
      newPosition,
    );
  }
}
