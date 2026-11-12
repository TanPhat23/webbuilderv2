/**
 * Pure model for the wireframe board. No imports, so it runs under node:test.
 */

export type SketchSource = {
  type: string;
  content?: string;
  tailwindStyles?: string;
  styles?: { default?: Record<string, unknown> } | null;
  elements?: SketchSource[];
};

export type SketchNode =
  | { kind: "box"; dir: "row" | "col"; cols?: number; children: SketchNode[] }
  | { kind: "heading"; width: number }
  | { kind: "text"; lines: 1 | 2 | 3 }
  | { kind: "button" | "link" | "media" | "field" | "icon" | "rule" | "plain" }
  | { kind: "more"; count?: number };

export const MAX_DEPTH = 4;
export const MAX_CHILDREN = 6;

const TEXT = new Set(["Text", "Span", "Label", "Blockquote", "Code"]);
const MEDIA = new Set(["Image", "Video", "IFrame", "Carousel", "Audio"]);
const FIELD = new Set(["Input", "Textarea", "Select", "Checkbox", "Radio"]);
const RULE = new Set(["Separator", "Progress"]);
const CONTAINER = new Set([
  "Frame", "Form", "List", "Section", "CMSContentList", "CMSContentItem", "CMSContentGrid",
  "Table", "Nav", "Header", "Footer", "Article", "Aside",
]);

function layoutOf(el: SketchSource): { dir: "row" | "col"; cols?: number } {
  const s = el.styles?.default ?? {};
  const display = typeof s.display === "string" ? s.display : "";
  if (display.includes("grid")) {
    const tpl = typeof s.gridTemplateColumns === "string" ? s.gridTemplateColumns.trim() : "";
    const rep = /^repeat\(\s*(\d+)/.exec(tpl);
    const cols = rep ? Number(rep[1]) : tpl ? tpl.split(/\s+/).length : undefined;
    return { dir: "row", cols };
  }
  if (display.includes("flex")) {
    const fd = typeof s.flexDirection === "string" ? s.flexDirection : "row";
    return { dir: fd.startsWith("column") ? "col" : "row" };
  }
  if (display) return { dir: "col" };

  // Templates often carry layout only as Tailwind classes; read every
  // breakpoint variant, since the board sketches the widest layout.
  const tokens = (el.tailwindStyles ?? "").split(/\s+/).map((t) => t.slice(t.lastIndexOf(":") + 1));
  const gridCols = tokens
    .map((t) => /^grid-cols-(\d+)$/.exec(t))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]));
  if (tokens.includes("grid") || gridCols.length > 0) {
    return { dir: "row", cols: gridCols.length ? Math.max(...gridCols) : undefined };
  }
  if (tokens.includes("flex") || tokens.includes("inline-flex")) {
    if (tokens.includes("flex-row")) return { dir: "row" };
    return { dir: tokens.includes("flex-col") ? "col" : "row" };
  }
  return { dir: "col" };
}

export function toSketch(el: SketchSource, depth = 0): SketchNode {
  const len = (el.content ?? "").length;
  if (el.type === "Heading") return { kind: "heading", width: Math.max(30, Math.min(90, 30 + len * 2)) };
  if (TEXT.has(el.type)) return { kind: "text", lines: len <= 40 ? 1 : len <= 120 ? 2 : 3 };
  if (el.type === "Button") return { kind: "button" };
  if (el.type === "Link") return { kind: "link" };
  if (MEDIA.has(el.type)) return { kind: "media" };
  if (FIELD.has(el.type)) return { kind: "field" };
  if (el.type === "Icon") return { kind: "icon" };
  if (RULE.has(el.type)) return { kind: "rule" };

  if (CONTAINER.has(el.type) || Array.isArray(el.elements)) {
    if (depth >= MAX_DEPTH) return { kind: "more" };
    const kids = el.elements ?? [];
    const children = kids.slice(0, MAX_CHILDREN).map((k) => toSketch(k, depth + 1));
    if (kids.length > MAX_CHILDREN) children.push({ kind: "more", count: kids.length - MAX_CHILDREN });
    const { dir, cols } = layoutOf(el);
    return cols === undefined ? { kind: "box", dir, children } : { kind: "box", dir, cols, children };
  }
  return { kind: "plain" };
}

export type PageItem = {
  id: string;
  pageId: string;
  parentId?: string | null;
  order?: number;
  elements?: PageItem[];
};

const byOrder = (a: PageItem, b: PageItem) => (a.order ?? 0) - (b.order ?? 0);

/** Top-level elements per page. Accepts nested trees and flat lists with `parentId`. */
export function groupByPage<T extends PageItem>(items: T[]): Map<string, T[]> {
  const nodes = new Map<string, T>();
  for (const item of items) {
    if (!nodes.has(item.id)) {
      nodes.set(item.id, { ...item, elements: item.elements ? [...item.elements] : undefined });
    }
  }
  const attached = new Set<string>();
  const roots: T[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (!parent) {
      roots.push(node);
      continue;
    }
    const kids = (parent.elements ??= []);
    if (!kids.some((k) => k.id === node.id)) {
      kids.push(node);
      attached.add(parent.id);
    }
  }
  for (const id of attached) nodes.get(id)!.elements!.sort(byOrder);

  const out = new Map<string, T[]>();
  for (const root of roots.sort(byOrder)) {
    const list = out.get(root.pageId);
    if (list) list.push(root);
    else out.set(root.pageId, [root]);
  }
  return out;
}

/** Deep copy with a fresh id on every node; children point at their new parent. */
export function cloneWithNewIds<T extends { id: string; parentId?: string | null; elements?: T[] }>(
  el: T,
  makeId: () => string,
): T {
  const walk = (node: T, parentId: T["parentId"]): T => {
    const id = makeId();
    const copy = { ...node, id, parentId } as T;
    if (node.elements) copy.elements = node.elements.map((c) => walk(c, id));
    return copy;
  };
  return walk(el, el.parentId);
}

/**
 * Translates "drop `draggedId` into gap `gapIndex`" (gap i sits before item i;
 * gap n is after the last) into a store move. Null when nothing would change.
 */
export function dropTarget(
  ids: string[],
  draggedId: string,
  gapIndex: number,
): { targetId: string; position: "before" | "after" } | null {
  const from = ids.indexOf(draggedId);
  if (from === -1 || gapIndex === from || gapIndex === from + 1) return null;
  if (gapIndex >= ids.length) return { targetId: ids[ids.length - 1], position: "after" };
  return { targetId: ids[gapIndex], position: "before" };
}
