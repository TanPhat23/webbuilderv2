import type { ElementType } from "@/types/global.type";

/** dataTransfer keys shared by canvas drag sources and drop targets. */
export const DRAG_KEYS = {
  elementType: "elementType",
  template: "customComponentName",
  elementId: "elementId",
  json: "application/json",
} as const;

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

export function setElementTypeDrag(dt: DataTransfer, type: ElementType): void {
  activeDragPayload = { kind: "create", elementType: type };
  dt.setData(DRAG_KEYS.elementType, type);
  dt.effectAllowed = "copy";
}

export function setTemplateDrag(dt: DataTransfer, index: number): void {
  activeDragPayload = { kind: "template", index };
  dt.setData(DRAG_KEYS.template, index.toString());
  dt.effectAllowed = "copy";
}

export function setComponentDrag(dt: DataTransfer, kind: "component" | "snapshot", id: string): void {
  activeDragPayload = { kind, id };
  dt.setData(DRAG_KEYS.template, `${kind}:${id}`);
  dt.effectAllowed = "copy";
}

export function setMoveDrag(dt: DataTransfer, elementId: string): void {
  activeDragPayload = { kind: "move", elementId };
  dt.setData(DRAG_KEYS.elementId, elementId);
  dt.effectAllowed = "move";
}

function matchesActiveDragType(
  dt: Pick<DataTransfer, "types">,
  payload: DropPayload | null,
): payload is DropPayload {
  if (!payload) return false;
  const types = Array.from(dt.types).map((t) => t.toLowerCase());
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
