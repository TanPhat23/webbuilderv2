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

export function setElementTypeDrag(dt: DataTransfer, type: ElementType) {
  dt.setData(DRAG_KEYS.elementType, type);
}

export function setTemplateDrag(dt: DataTransfer, index: number) {
  dt.setData(DRAG_KEYS.template, index.toString());
}

export function setComponentDrag(dt: DataTransfer, kind: "component" | "snapshot", id: string) {
  dt.setData(DRAG_KEYS.template, `${kind}:${id}`);
  dt.effectAllowed = "copy";
}

export function setMoveDrag(dt: DataTransfer, elementId: string) {
  dt.setData(DRAG_KEYS.elementId, elementId);
  dt.effectAllowed = "move";
}

/**
 * Reads a drop payload. Only valid in `drop` handlers: browsers return empty
 * strings from `getData` during `dragover`.
 */
export function readDropPayload(dt: DataTransfer): DropPayload | null {
  const elementId = dt.getData(DRAG_KEYS.elementId);
  if (elementId) return { kind: "move", elementId };

  const elementType = dt.getData(DRAG_KEYS.elementType);
  if (elementType) return { kind: "create", elementType: elementType as ElementType };

  const template = dt.getData(DRAG_KEYS.template);
  if (template) {
    const tagged = /^(component|snapshot):([A-Za-z0-9_-]{1,255})$/.exec(template);
    if (tagged) return { kind: tagged[1] === "component" ? "component" : "snapshot", id: tagged[2] };
    if (/^\d+$/.test(template)) return { kind: "template", index: Number(template) };
  }

  return null;
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
