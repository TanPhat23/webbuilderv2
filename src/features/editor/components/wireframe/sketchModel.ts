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
  | { kind: "box"; dir: "row" | "col"; cols?: number; span?: number; children: SketchNode[] }
  | { kind: "heading"; width: number; span?: number }
  | { kind: "text"; lines: 1 | 2 | 3; span?: number }
  | { kind: "button" | "link" | "media" | "field" | "icon" | "rule" | "plain"; span?: number }
  | { kind: "more"; count?: number; span?: number };

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

function tailwindTokens(tw?: string): string[] {
  return (tw ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((t) => t.slice(t.lastIndexOf(":") + 1));
}

function colSpanOf(el: SketchSource): number | undefined {
  const s = el.styles?.default ?? {};
  if (typeof s.gridColumn === "string") {
    const m = /span\s+(\d+)/.exec(s.gridColumn);
    if (m) return Number(m[1]);
  }
  const spans = tailwindTokens(el.tailwindStyles)
    .map((t) => /^col-span-(\d+)$/.exec(t))
    .filter((m): m is RegExpExecArray => m !== null)
    .map((m) => Number(m[1]));
  return spans.length > 0 ? Math.max(...spans) : undefined;
}

function isHeadingStyledText(el: SketchSource): boolean {
  const content = (el.content ?? "").trim();
  if (/^<h[1-3]\b/i.test(content)) return true;
  const tokens = tailwindTokens(el.tailwindStyles);
  return tokens.some((t) => {
    if (/^text-(2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/.test(t)) return true;
    const px = /^text-\[(\d+)px\]$/.exec(t);
    return px !== null && Number(px[1]) >= 24;
  });
}

function withSpan<T extends SketchNode>(node: T, span: number | undefined): T {
  return span !== undefined ? { ...node, span } : node;
}

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
  const tokens = tailwindTokens(el.tailwindStyles);
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
  const span = colSpanOf(el);
  const plainText = (el.content ?? "").replace(/<[^>]+>/g, "").trim();
  const len = plainText.length;

  if (el.type === "Heading") {
    return withSpan({ kind: "heading", width: Math.max(30, Math.min(90, 30 + len * 2)) }, span);
  }
  if (TEXT.has(el.type)) {
    if (isHeadingStyledText(el)) {
      return withSpan({ kind: "heading", width: Math.max(36, Math.min(90, 30 + len * 2)) }, span);
    }
    return withSpan({ kind: "text", lines: len <= 40 ? 1 : len <= 120 ? 2 : 3 }, span);
  }
  if (el.type === "Button") return withSpan({ kind: "button" }, span);
  if (el.type === "Link") return withSpan({ kind: "link" }, span);
  if (MEDIA.has(el.type)) return withSpan({ kind: "media" }, span);
  if (FIELD.has(el.type)) return withSpan({ kind: "field" }, span);
  if (el.type === "Icon") return withSpan({ kind: "icon" }, span);
  if (RULE.has(el.type)) return withSpan({ kind: "rule" }, span);

  if (CONTAINER.has(el.type) || Array.isArray(el.elements)) {
    const kids = el.elements ?? [];
    if (depth >= MAX_DEPTH) {
      if (kids.length === 1 && MEDIA.has(kids[0].type)) {
        return withSpan({ kind: "media" }, span);
      }
      return withSpan({ kind: "more" }, span);
    }
    const children = kids.slice(0, MAX_CHILDREN).map((k) => toSketch(k, depth + 1));
    if (kids.length > MAX_CHILDREN) children.push({ kind: "more", count: kids.length - MAX_CHILDREN });
    const { dir, cols } = layoutOf(el);
    return cols === undefined
      ? withSpan({ kind: "box", dir, children }, span)
      : withSpan({ kind: "box", dir, cols, children }, span);
  }
  return withSpan({ kind: "plain" }, span);
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
