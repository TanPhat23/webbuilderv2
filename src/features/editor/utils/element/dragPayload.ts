import type { ElementType } from "@/types/global.type";

/** dataTransfer keys shared by canvas drag sources and drop targets. */
export const DRAG_KEYS = {
  elementType: "elementType",
  template: "customComponentName",
  elementId: "elementId",
  json: "application/json",
  payload: "application/x-webbuilder-drag",
  text: "text/plain",
} as const;

const TEXT_PAYLOAD_PREFIX = "__wb_drag__:";

export type DropPayload =
  | { kind: "move"; elementId: string }
  | { kind: "create"; elementType: ElementType }
  | { kind: "template"; index: number }
  | { kind: "component"; id: string }
  | { kind: "snapshot"; id: string };

let activeDragPayload: DropPayload | null = null;

export function getActiveDragPayload(): DropPayload | null {
  return activeDragPayload;
}

export function clearActiveDragPayload(): void {
  activeDragPayload = null;
}

function readDragValue(dt: DataTransfer, key: string): string {
  return dt.getData(key) || dt.getData(key.toLowerCase());
}

function writeStandardDragOffer(dt: DataTransfer, payload: DropPayload): void {
  const serialized = JSON.stringify(payload);
  dt.setData(DRAG_KEYS.payload, serialized);
  dt.setData(DRAG_KEYS.text, `${TEXT_PAYLOAD_PREFIX}${serialized}`);
}

function parseSerializedPayload(raw: string): DropPayload | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed === null || typeof parsed !== "object" || !("kind" in parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    switch (record.kind) {
      case "move":
        return typeof record.elementId === "string" && record.elementId
          ? { kind: "move", elementId: record.elementId }
          : null;
      case "create":
        return typeof record.elementType === "string" && record.elementType
          ? { kind: "create", elementType: record.elementType as ElementType }
          : null;
      case "template":
        return typeof record.index === "number" && Number.isInteger(record.index) && record.index >= 0
          ? { kind: "template", index: record.index }
          : null;
      case "component":
      case "snapshot":
        return typeof record.id === "string" && record.id
          ? { kind: record.kind, id: record.id }
          : null;
      default:
        return null;
    }
  } catch {
    return null;
  }
}

export function setElementTypeDrag(dt: DataTransfer, type: ElementType): void {
  const payload: DropPayload = { kind: "create", elementType: type };
  activeDragPayload = payload;
  dt.setData(DRAG_KEYS.elementType, type);
  writeStandardDragOffer(dt, payload);
  dt.effectAllowed = "copy";
}

export function setTemplateDrag(dt: DataTransfer, index: number): void {
  const payload: DropPayload = { kind: "template", index };
  activeDragPayload = payload;
  dt.setData(DRAG_KEYS.template, index.toString());
  writeStandardDragOffer(dt, payload);
  dt.effectAllowed = "copy";
}

export function setComponentDrag(dt: DataTransfer, kind: "component" | "snapshot", id: string): void {
  const payload: DropPayload = { kind, id };
  activeDragPayload = payload;
  dt.setData(DRAG_KEYS.template, `${kind}:${id}`);
  writeStandardDragOffer(dt, payload);
  dt.effectAllowed = "copy";
}

export function setMoveDrag(dt: DataTransfer, elementId: string): void {
  const payload: DropPayload = { kind: "move", elementId };
  activeDragPayload = payload;
  dt.setData(DRAG_KEYS.elementId, elementId);
  writeStandardDragOffer(dt, payload);
  dt.effectAllowed = "move";
}

function matchesActiveDragType(
  dt: Pick<DataTransfer, "types">,
  payload: DropPayload | null,
): payload is DropPayload {
  if (!payload) return false;
  const types = Array.from(dt.types).map((t) => t.toLowerCase());
  if (
    types.includes(DRAG_KEYS.payload) ||
    types.includes(DRAG_KEYS.text)
  ) {
    return true;
  }
  switch (payload.kind) {
    case "move":
      return types.includes(DRAG_KEYS.elementId.toLowerCase());
    case "create":
      return types.includes(DRAG_KEYS.elementType.toLowerCase());
    case "template":
    case "component":
    case "snapshot":
      return types.includes(DRAG_KEYS.template.toLowerCase());
  }
}

/**
 * Reads a drop payload. Only valid in `drop` handlers: browsers return empty
 * strings from `getData` during `dragover`. Falls back to the in-memory payload
 * when dragging from the editor sidebar into the iframe portal in browsers that
 * strip custom DataTransfer keys across document boundaries.
 */
export function readDropPayload(dt: DataTransfer): DropPayload | null {
  const elementId = readDragValue(dt, DRAG_KEYS.elementId);
  if (elementId) return { kind: "move", elementId };

  const elementType = readDragValue(dt, DRAG_KEYS.elementType);
  if (elementType) return { kind: "create", elementType: elementType as ElementType };

  const template = readDragValue(dt, DRAG_KEYS.template);
  if (template) {
    const tagged = /^(component|snapshot):([A-Za-z0-9_-]{1,255})$/.exec(template);
    if (tagged) return { kind: tagged[1] === "component" ? "component" : "snapshot", id: tagged[2] };
    if (/^\d+$/.test(template)) return { kind: "template", index: Number(template) };
  }

  const mimePayload = parseSerializedPayload(readDragValue(dt, DRAG_KEYS.payload));
  if (mimePayload) return mimePayload;

  const textValue = readDragValue(dt, DRAG_KEYS.text);
  if (textValue.startsWith(TEXT_PAYLOAD_PREFIX)) {
    const textPayload = parseSerializedPayload(
      textValue.slice(TEXT_PAYLOAD_PREFIX.length),
    );
    if (textPayload) return textPayload;
  }

  return matchesActiveDragType(dt, activeDragPayload) ? activeDragPayload : null;
}

/**
 * True when the drag carries something to create (palette element, template
 * or image) rather than an existing element. Safe to call during `dragover`
 * because it only inspects `types`.
 */
export function isCreateDrag(dt: DataTransfer): boolean {
  const types = Array.from(dt.types);
  return (
    types.includes(DRAG_KEYS.elementType.toLowerCase()) ||
    types.includes(DRAG_KEYS.template.toLowerCase()) ||
    types.includes(DRAG_KEYS.json)
  );
}
