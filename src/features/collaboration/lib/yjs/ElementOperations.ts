import type { EditorElement } from "@/types/global.type";
import type {
  ElementOperationResult,
  UpdateType,
  WSEnvelope,
  ElementCreatePayload,
  ElementCreatePayloadNode,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
} from "@/features/collaboration";
import type { MessageDispatcher } from "./MessageDispatcher";
import type { MessageSender } from "./MessageSender";

export class ElementOperations {
  constructor(
    private readonly projectId: string,
    private readonly pageId: string,
    private readonly userId: string,
    private readonly dispatcher: MessageDispatcher,
    private readonly sender: MessageSender,
  ) {}

  private toPayloadNode(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): ElementCreatePayloadNode {
    const children = (element as { elements?: EditorElement[] }).elements;
    return {
      id: element.id,
      type: element.type,
      settings: (element.settings as Record<string, unknown>) ?? null,
      styles: (element.styles as Record<string, unknown>) ?? null,
      tailwindStyles: element.tailwindStyles ?? "",
      order: position ?? element.order ?? 0,
      parentId: parentId ?? element.parentId ?? null,
      ...(element.content !== undefined ? { content: element.content } : {}),
      ...(element.name !== undefined ? { name: element.name } : {}),
      ...(element.src !== undefined ? { src: element.src } : {}),
      ...(element.href !== undefined ? { href: element.href } : {}),
      ...(children && children.length > 0
        ? { elements: children.map((child) => this.toPayloadNode(child, element.id)) }
        : {}),
    };
  }

  private sendRequest<T>(envelope: WSEnvelope<unknown>, requestId: string): Promise<T> {
    return this.sender.sendRequest<T>(envelope, requestId);
  }

  async createElement(
    element: EditorElement,
    parentId?: string | null,
    position?: number,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope<ElementCreatePayload>(
      "element:create",
      this.projectId,
      this.pageId,
      { element: this.toPayloadNode(element, parentId, position) },
      { userId: this.userId, requestId },
    );
    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  async updateElement(
    elementId: string,
    updates: Partial<EditorElement>,
    _updateType: UpdateType = "partial",
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope<ElementUpdatePayload>(
      "element:update",
      this.projectId,
      this.pageId,
      {
        id: elementId,
        ...(updates.settings !== undefined ? { settings: updates.settings as Record<string, unknown> } : {}),
        ...(updates.styles !== undefined ? { styles: updates.styles as Record<string, unknown> } : {}),
        ...(updates.content !== undefined ? { content: updates.content } : {}),
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.order !== undefined ? { order: updates.order } : {}),
        ...(updates.tailwindStyles !== undefined ? { tailwindStyles: updates.tailwindStyles } : {}),
        ...(updates.src !== undefined ? { src: updates.src } : {}),
        ...(updates.href !== undefined ? { href: updates.href } : {}),
      },
      { userId: this.userId, requestId },
    );
    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  async deleteElement(
    elementId: string,
    _deleteChildren = false,
    _preserveStructure = true,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope<ElementDeletePayload>(
      "element:delete",
      this.projectId,
      this.pageId,
      { id: elementId },
      { userId: this.userId, requestId },
    );
    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }

  async moveElement(
    elementId: string,
    newParentId: string | null = null,
    newPosition?: number,
  ): Promise<ElementOperationResult> {
    const requestId = this.dispatcher.generateRequestId();
    const envelope = this.dispatcher.createEnvelope<ElementMovePayload>(
      "element:move",
      this.projectId,
      this.pageId,
      { id: elementId, parentId: newParentId, order: newPosition ?? 0 },
      { userId: this.userId, requestId },
    );
    return this.sendRequest<ElementOperationResult>(envelope, requestId);
  }
}
