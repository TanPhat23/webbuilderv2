import * as Y from "yjs";
import { EditorElement } from "@/types/global.type";
import { Page } from "@/interfaces/page.interface";
import type {
  ElementOperationResult,
  PageOperationResult,
  SyncResponsePayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
  WSEnvelope,
} from "@/interfaces/websocket";
import { ElementTreeHelper } from "@/lib/utils/element-tree-helper";

/**
 * Handles the synchronization and mutation of the Y.Doc local cache.
 *
 * Updated to work with the new WebSocket API envelope protocol:
 *   - `sync`            → full state replacement (elements + users)
 *   - `element:create`  → insert a new element from server broadcast
 *   - `element:update`  → patch merge an existing element
 *   - `element:move`    → reparent/reorder an element
 *   - `element:delete`  → remove an element
 *
 * The Y.Doc is used purely as a local cache layer. The server is authoritative;
 * all incoming broadcasts are applied as source of truth.
 *
 * @see WebSocket API Reference — Sections 3 & 4
 */
export class DocumentSyncer {
  private readonly pageId: string;

  constructor(
    private doc: Y.Doc,
    pageId?: string,
  ) {
    this.pageId = pageId ?? "";
  }

  // ==========================================================================
  // Full Sync (server → client)
  // ==========================================================================

  /**
   * Replaces the entire document state with the authoritative server snapshot.
   * Called when a `sync` message is received (after `join` or on explicit request).
   *
   * Uses the `"v2-sync"` transaction origin so observers can distinguish
   * initial sync from incremental updates.
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
   * Convenience method that accepts the full SyncResponsePayload and
   * converts ServerElements into EditorElements before applying.
   */
  public applySyncPayload(payload: SyncResponsePayload): EditorElement[] {
    const elements = payload.elements.map((el) => el);
    this.applyInitialSync(elements);
    return elements;
  }

  // ==========================================================================
  // Incoming Broadcasts — Envelope-based handlers
  // ==========================================================================

  /**
   * Handles an `element:create` broadcast from the server.
   * The server includes the full element with server-assigned fields (id, createdAt, createdBy).
   */
  public handleElementCreate(payload: ElementCreateBroadcastPayload): void {
    const currentElements = this.getCurrentElements();
    const updatedElements = this.applyElementUpsert(
      currentElements,
      payload.element,
    );
    this.updateElementsInDoc(updatedElements);
  }

  /**
   * Handles an `element:update` broadcast from the server.
   * The payload contains only the changed fields (patch semantics).
   */
  public handleElementUpdate(payload: ElementUpdateBroadcastPayload): void {
    const currentElements = this.getCurrentElements();
    const existing = ElementTreeHelper.findById(currentElements, payload.id);
    if (!existing) return;

    // Build the merged element
    const merged: EditorElement = { ...existing };

    if (payload.settings !== undefined) {
      merged.settings = {
        ...((existing.settings as Record<string, unknown>) ?? {}),
        ...((payload.settings as Record<string, unknown>) ?? {}),
      } as EditorElement["settings"];
    }

    if (payload.styles !== undefined) {
      merged.styles = {
        ...((existing.styles as Record<string, unknown>) ?? {}),
        ...((payload.styles as Record<string, unknown>) ?? {}),
      } as EditorElement["styles"];
    }

    // Apply any other top-level fields from the patch
    const reserved = new Set(["id", "settings", "styles"]);
    for (const [key, value] of Object.entries(payload)) {
      if (!reserved.has(key) && value !== undefined) {
        (merged as unknown as Record<string, unknown>)[key] = value;
      }
    }

    const updatedElements = ElementTreeHelper.mapUpdateById(
      currentElements,
      payload.id,
      () => merged,
    );
    this.updateElementsInDoc(updatedElements);
  }

  /**
   * Handles an `element:move` broadcast from the server.
   * Reparents and/or reorders the element.
   */
  public handleElementMove(payload: ElementMoveBroadcastPayload): void {
    const currentElements = this.getCurrentElements();
    const updatedElements = this.applyElementMove(
      currentElements,
      payload.id,
      payload.parentId,
      payload.order,
    );
    this.updateElementsInDoc(updatedElements);
  }

  /**
   * Handles an `element:delete` broadcast from the server.
   */
  public handleElementDelete(payload: ElementDeleteBroadcastPayload): void {
    const currentElements = this.getCurrentElements();
    const updatedElements = ElementTreeHelper.mapDeleteById(
      currentElements,
      payload.id,
    );
    this.updateElementsInDoc(updatedElements);
  }

  // ==========================================================================
  // Legacy compat — route by ElementOperationResult
  // ==========================================================================

  /**
   * Routes an ElementOperationResult to the correct handler.
   * Kept for backward compatibility with code that constructs these objects.
   */
  public handleElementOperation(message: ElementOperationResult): void {
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
          updatedElements = ElementTreeHelper.mapDeleteById(
            updatedElements,
            message.deletedElementId,
          );
        }
        break;
      case "move":
        if (message.elementId && message.parentId !== undefined) {
          updatedElements = this.applyElementMove(
            updatedElements,
            message.elementId,
            message.parentId ?? null,
            message.order ?? 0,
          );
        }
        break;
    }

    this.updateElementsInDoc(updatedElements);
  }

  /**
   * Routes a PageOperationResult to update the pages Y.Text.
   */
  public handlePageOperation(message: PageOperationResult): void {
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

  // ==========================================================================
  // Y.Doc Accessors
  // ==========================================================================

  /**
   * Retrieves current elements from the Y.Text cache.
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
   * Retrieves current pages from the Y.Text cache.
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

  // ==========================================================================
  // Internal — Y.Doc Mutations
  // ==========================================================================

  /**
   * Writes the elements array into the Y.Text, wrapped in a transaction
   * with `"remote-update"` origin so local observers can skip re-broadcasting.
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
   * Writes the pages array into the Y.Text.
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

  // ==========================================================================
  // Internal — Element Tree Operations
  // ==========================================================================

  /**
   * Upserts an element: updates in-place if it exists, or inserts at the
   * correct position if it's new.
   */
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

    // New element — insert into parent's children or at root
    if (element.parentId) {
      return ElementTreeHelper.mapUpdateById(
        elements,
        element.parentId,
        (parent) => {
          const container = parent as unknown as {
            elements?: EditorElement[];
          };
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

  /**
   * Moves an element to a new parent and/or position.
   */
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
        const container = parent as unknown as {
          elements?: EditorElement[];
        };
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
