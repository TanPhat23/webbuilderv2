import type { EditorElement } from "@/types/global.type";
import type { Page } from "@/features/pages";
import type {
  SyncResponsePayload,
  ElementCreateBroadcastPayload,
  ElementUpdateBroadcastPayload,
  ElementMoveBroadcastPayload,
  ElementDeleteBroadcastPayload,
} from "@/features/collaboration";
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";
import { ElementStore } from "@/features/editor/store/element-store";
import { usePageStore } from "@/features/editor/store/page-store";

export class DocumentSyncer {
  public applySyncPayload(payload: SyncResponsePayload): EditorElement[] {
    const elements = payload.elements as EditorElement[];
    ElementStore.getState().loadElements(elements, true);
    return elements;
  }

  public handleElementCreate(payload: ElementCreateBroadcastPayload): void {
    const current = this.getCurrentElements();
    this.commitElements(this.applyElementUpsert(current, payload.element));
  }

  public handleElementUpdate(payload: ElementUpdateBroadcastPayload): void {
    const current = this.getCurrentElements();
    const existing = ElementTreeHelper.findById(current, payload.id);
    if (!existing) return;

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

    const reserved = new Set(["id", "settings", "styles"]);
    for (const [key, value] of Object.entries(payload)) {
      if (!reserved.has(key) && value !== undefined) {
        (merged as unknown as Record<string, unknown>)[key] = value;
      }
    }

    this.commitElements(
      ElementTreeHelper.mapUpdateById(current, payload.id, () => merged),
    );
  }

  public handleElementMove(payload: ElementMoveBroadcastPayload): void {
    const current = this.getCurrentElements();
    this.commitElements(
      this.applyElementMove(
        current,
        payload.id,
        payload.parentId,
        payload.order,
      ),
    );
  }

  public handleElementDelete(payload: ElementDeleteBroadcastPayload): void {
    const current = this.getCurrentElements();
    this.commitElements(ElementTreeHelper.mapDeleteById(current, payload.id));
  }

  public getCurrentElements(): EditorElement[] {
    return ElementStore.getState().elements;
  }

  public getCurrentPages(): Page[] {
    return usePageStore.getState().pages;
  }

  private commitElements(elements: EditorElement[]): void {
    ElementStore.getState().loadElements(elements, true);
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
          const updatedChildren = ElementTreeHelper.insertAtPosition(
            container.elements ?? [],
            element,
            element.order,
          );
          return { ...parent, elements: updatedChildren } as EditorElement;
        },
      );
    }

    return ElementTreeHelper.insertAtPosition(elements, element, element.order);
  }

  private applyElementMove(
    elements: EditorElement[],
    elementId: string,
    newParentId: string | null,
    newPosition: number,
  ): EditorElement[] {
    const elementToMove = ElementTreeHelper.findById(elements, elementId);
    if (!elementToMove) return elements;

    const updated = ElementTreeHelper.mapDeleteById(elements, elementId);
    const movedElement: EditorElement = {
      ...elementToMove,
      parentId: newParentId ?? undefined,
      order: newPosition,
    };

    if (newParentId) {
      return ElementTreeHelper.mapUpdateById(updated, newParentId, (parent) => {
        const container = parent as unknown as { elements?: EditorElement[] };
        const updatedChildren = ElementTreeHelper.insertAtPosition(
          container.elements ?? [],
          movedElement,
          newPosition,
        );
        return { ...parent, elements: updatedChildren } as EditorElement;
      });
    }

    return ElementTreeHelper.insertAtPosition(
      updated,
      movedElement,
      newPosition,
    );
  }
}
