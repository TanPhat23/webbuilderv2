import { v4 as uuidv4 } from "uuid";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import type {
  ElementOperationResult,
  UpdateType,
  WSEnvelope,
  ElementCreatePayload,
  ElementCreatePayloadNode,
  ElementUpdatePayload,
  ElementMovePayload,
  ElementDeletePayload,
} from "../../interfaces/websocket";
import type { MessageDispatcher } from "./MessageDispatcher";
import type { MessageSender } from "./MessageSender";

function isElementOperationResult(value: unknown): value is ElementOperationResult {
  if (typeof value !== "object" || value === null || !("operationType" in value)) {
    return false;
  }
  const op = value.operationType;
  return op === "create" || op === "update" || op === "delete" || op === "move";
}

function parseElementOperationResult(data: unknown): ElementOperationResult {
  if (!isElementOperationResult(data)) {
    throw new Error("Unexpected element operation response payload");
  }
  return data;
}

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

  private sendRequest(envelope: WSEnvelope<unknown>, requestId: string): Promise<ElementOperationResult> {
    return this.sender.sendRequest(envelope, requestId, parseElementOperationResult);
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
      { element: this.toPayloadNode(element, parentId, position), ...(position !== undefined ? { position } : {}) },
      { userId: this.userId, requestId, clientOpId: uuidv4() },
    );
    return this.sendRequest(envelope, requestId);
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
      { userId: this.userId, requestId, clientOpId: uuidv4() },
    );
    return this.sendRequest(envelope, requestId);
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
      { userId: this.userId, requestId, clientOpId: uuidv4() },
    );
    return this.sendRequest(envelope, requestId);
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
      { userId: this.userId, requestId, clientOpId: uuidv4() },
    );
    return this.sendRequest(envelope, requestId);
  }
}
