import type { EditorElement } from "@/types/global.type";
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";

export type ElementOperation = {
  type: "element:create" | "element:update" | "element:move" | "element:delete";
  payload: Record<string, unknown>;
  clientOpId?: string;
  requestId?: string;
  seq?: number;
};

type ObjectMap = Record<string, unknown>;
const isObject = (value: unknown): value is ObjectMap =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function mergeServerPatch(original: ObjectMap, patch: ObjectMap): ObjectMap {
  const result = { ...original };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      delete result[key];
    } else {
      const next = isObject(value) ? mergeServerPatch(isObject(result[key]) ? result[key] : {}, value) : value;
      Object.defineProperty(result, key, { value: next, enumerable: true, configurable: true, writable: true });
    }
  }
  return result;
}

export function applyElementOperation(elements: EditorElement[], operation: ElementOperation): EditorElement[] {
  const payload = operation.payload;
  if (operation.type === "element:create") {
    const element = payload.element as EditorElement | undefined;
    if (!element || !element.id || ElementTreeHelper.findById(elements, element.id)) return elements;
    const position = typeof payload.position === "number" ? payload.position :
      typeof element.orderKey === "string" && typeof element.order === "number" ? element.order : undefined;
    return position === undefined
      ? ElementTreeHelper.mapAddChildById(elements, element.parentId, element)
      : ElementTreeHelper.mapInsertAt(elements, element.parentId, position, element);
  }
  const id = typeof payload.id === "string" ? payload.id : "";
  if (!id) return elements;
  if (operation.type === "element:delete") return ElementTreeHelper.mapDeleteById(elements, id);
  if (operation.type === "element:move") {
    const element = ElementTreeHelper.findById(elements, id);
    if (!element) return elements;
    const parentId = typeof payload.parentId === "string" && payload.parentId ? payload.parentId : null;
    if (parentId) {
      const parent = ElementTreeHelper.findById(elements, parentId);
      if (!parent || !Array.isArray((parent as { elements?: unknown }).elements) || ElementTreeHelper.findById([element], parentId)) return elements;
    }
    const without = ElementTreeHelper.mapDeleteById(elements, id);
    const order = typeof payload.order === "number" ? payload.order : 0;
    const orderKey = typeof payload.orderKey === "string" ? payload.orderKey : element.orderKey;
    return ElementTreeHelper.mapInsertAt(without, parentId, order, { ...element, parentId: parentId ?? undefined, order, orderKey } as EditorElement);
  }
  return ElementTreeHelper.mapUpdateById(elements, id, (element) => {
    const propertyNames = ["name", "content", "src", "href", "tailwindStyles", "isLocked"];
    const properties = isObject(payload.properties) ? payload.properties : {};
    const patch: ObjectMap = {};
    for (const key of propertyNames) {
      if (Object.prototype.hasOwnProperty.call(payload, key)) patch[key] = payload[key];
      if (Object.prototype.hasOwnProperty.call(properties, key)) patch[key] = properties[key];
    }
    if (isObject(payload.styles)) patch.styles = mergeServerPatch(isObject(element.styles) ? element.styles : {}, payload.styles);
    if (isObject(payload.settings)) patch.settings = mergeServerPatch(isObject(element.settings) ? element.settings : {}, payload.settings);
    return { ...element, ...patch } as EditorElement;
  });
}

interface SessionOptions {
  render: (elements: EditorElement[]) => void;
  requestSnapshot: () => void;
  onCommitted?: (operation: ElementOperation, pending: ElementOperation) => void;
  gapTimeoutMs?: number;
  snapshotTimeoutMs?: number;
}

export class OrderedElementSession {
  private base: EditorElement[] = [];
  private lastSeq: number | null = null;
  private pending: ElementOperation[] = [];
  private awaitingSnapshot = false;
  private buffered = new Map<number, ElementOperation>();
  private gapTimer: ReturnType<typeof setTimeout> | undefined;
  private snapshotTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly options: SessionOptions;

  constructor(options: SessionOptions) { this.options = options; }
  get pendingCount() { return this.pending.length; }

  snapshot(elements: EditorElement[], seq: number): void {
    this.clearGapTimer();
    this.clearSnapshotTimer();
    const sequenceReset = this.lastSeq !== null && seq < this.lastSeq;
    if (sequenceReset) this.buffered.clear();
    this.base = elements;
    this.lastSeq = seq;
    this.awaitingSnapshot = false;
    for (const [key, operation] of this.buffered) {
      if (key <= seq) {
        this.confirm(operation);
        this.buffered.delete(key);
      }
    }
    this.drain();
    this.render();
    if (sequenceReset) this.resync();
    else this.scheduleGap();
  }

  recordLocal(operation: ElementOperation): void {
    this.pending.push(operation);
  }

  receive(operation: ElementOperation): void {
    const seq = operation.seq;
    if (!Number.isSafeInteger(seq) || seq === undefined || seq < 1) return;
    if (!this.awaitingSnapshot && this.lastSeq !== null && seq <= this.lastSeq) {
      if (operation.clientOpId || operation.requestId) {
        this.confirm(operation);
        this.render();
      }
      return;
    }
    this.buffered.set(seq, operation);
    if (this.awaitingSnapshot) return;
    this.drain();
    this.render();
    this.scheduleGap();
  }

  resync(): void {
    if (this.awaitingSnapshot) return;
    this.awaitingSnapshot = true;
    this.clearGapTimer();
    this.requestSnapshot();
  }

  acknowledge(operation: ElementOperation): void {
    this.confirm(operation);
  }

  suspend(): void {
    this.awaitingSnapshot = true;
    this.clearGapTimer();
    this.clearSnapshotTimer();
    this.buffered.clear();
  }

  reject(id: string): ElementOperation | undefined {
    const rejected = this.pending.find((op) => op.clientOpId === id || op.requestId === id);
    if (rejected) this.pending = this.pending.filter((op) => op !== rejected);
    this.render();
    return rejected;
  }

  dispose(): void { this.clearGapTimer(); this.clearSnapshotTimer(); this.buffered.clear(); }

  private requestSnapshot(): void {
    this.snapshotTimer = setTimeout(() => {
      this.snapshotTimer = undefined;
      if (this.awaitingSnapshot) this.requestSnapshot();
    }, this.options.snapshotTimeoutMs ?? 5000);
    this.options.requestSnapshot();
  }

  private clearSnapshotTimer(): void {
    if (this.snapshotTimer) clearTimeout(this.snapshotTimer);
    this.snapshotTimer = undefined;
  }

  private drain(): void {
    if (this.lastSeq === null || this.awaitingSnapshot) return;
    let currentSeq: number = this.lastSeq;
    while (this.buffered.has(currentSeq + 1)) {
      const seq: number = currentSeq + 1;
      const operation = this.buffered.get(seq)!;
      this.buffered.delete(seq);
      this.base = applyElementOperation(this.base, operation);
      this.confirm(operation);
      currentSeq = seq;
      this.lastSeq = seq;
    }
    if (this.buffered.size === 0) this.clearGapTimer();
  }

  private confirm(operation: ElementOperation): void {
    const matched = this.pending.find((op) =>
      operation.clientOpId && op.clientOpId
        ? op.clientOpId === operation.clientOpId
        : !!operation.requestId && op.requestId === operation.requestId,
    );
    if (!matched) return;
    this.pending = this.pending.filter((op) => op !== matched);
    this.options.onCommitted?.(operation, matched);
  }

  private render(): void {
    if (this.lastSeq === null) return;
    this.options.render(this.pending.reduce(applyElementOperation, this.base));
  }

  private scheduleGap(): void {
    if (this.awaitingSnapshot || !this.buffered.size || this.gapTimer) return;
    this.gapTimer = setTimeout(() => {
      this.gapTimer = undefined;
      this.resync();
    }, this.options.gapTimeoutMs ?? 1500);
  }

  private clearGapTimer(): void {
    if (this.gapTimer) clearTimeout(this.gapTimer);
    this.gapTimer = undefined;
  }
}
