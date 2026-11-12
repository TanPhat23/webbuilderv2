# Wireframe Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the half-built wireframe mode with a board, inside the new editor layout, that shows every page as grey sketches drawn from the real elements. The open page can be restructured on the board.

**Architecture:**
- A pure `sketchModel.ts` turns element trees into sketch trees, groups a project's elements by page and clones a section with fresh ids. It's unit-tested with `node:test`.
- React pieces: `Sketch`, `SectionBlock`, `InsertPoint`, `PageColumn`, `WireframeBoard` and `SectionsLibrary` render the sketches and call a `useSectionActions` hook built on the existing element store.
- Wireframe stops being a provider-level layout swap. `EditorLayout` stays mounted and the route renders the board in place of the canvas.

**Tech Stack:** React 19, TypeScript, Tailwind v4, shadcn/ui (Popover, Tooltip), zustand element store, @tanstack/react-query, @tanstack/react-router, sonner, lucide-react, node:test + tsx.

**Spec:** `docs/superpowers/specs/2026-11-13-wireframe-board-design.md`

## Global Constraints

- The board is a view of real page data. No separate draft, no "Convert to Design", no "Clear All".
- Only the open page is editable. Other pages come from `elementService.getElements(projectId)` (`GET /api/v1/elements/:projectId`), grouped by `pageId`. They're fetched on entering Wireframe and refetched when the open page changes, with no polling.
- Clicking another page navigates to `/editor/${projectId}?page=${pageId}`, and the mode stays `"wireframe"`.
- Sketch limits: nesting drawn to depth 4 (deeper becomes one "…" block), and at most 6 children per container plus a "+N" block.
- Sketches use neutral greys only and render no text content.
- Permissions: add needs `editor.permissions.canCreateElements`, delete needs `canDeleteElements`, reorder needs `canReorderElements`. If `editor.isReadOnly || editor.isLocked`, no controls render. "+ New page" needs `useEditorPermissions(projectId).canCreatePages`.
- The inspector is hidden in Wireframe. The top bar and rail stay.
- The Sections library groups are Navigation, Header, Hero & landing, Sidebar, Form and Footer. Site templates are excluded.
- Page columns are 240px wide.
- No Go API changes.
- Unit tests live in `tests/*.test.ts`, use `node:test` and `node:assert/strict`, and import with relative paths. Run them with `bun run test:unit`.
- The type check (`npx tsc --noEmit`) must be clean after every task.

**Plan deviation from the spec, fixed in the spec in Task 1:** `templateCategories(customComps)` is replaced by a static `sectionTemplateGroups` export in `customComponents.ts`, because the flat `customComps` array carries no category information.

## Review Focus

1. **Layout expressed only in Tailwind classes**, e.g. `tailwindStyles: "flex flex-col md:flex-row"` with no `styles`. The sketch must still lay that out as a row, not stack everything. Pinned by `toSketch` tests in Task 1.
2. **The all-elements response shape.** Top-level elements may arrive nested (children in `elements`), or flat with `parentId`. Either way, each page gets its own top-level sections with children attached once. Pinned by `groupByPage` tests in Task 1.
3. **Duplicating a section.** No id in the copy may equal an id in the original, and children must point at the new parent. Otherwise the copy and the original would edit each other. Pinned by `cloneWithNewIds` tests in Task 1.
4. **Dropping a section onto its own position.** Dropping in the gap directly above or below itself must do nothing, not reorder. Pinned by `dropTarget` tests in Task 1.
5. **The open page before sync.** Its column shows a skeleton until the collab socket has synced, never "Empty page" for a page that has content. Checked manually in Task 4; the gate is the same `collab.isSynced` used by the empty-page starter.

---

## File Structure

Create, under `src/features/editor/components/wireframe/`:

| File | Responsibility |
|---|---|
| `sketchModel.ts` | Pure: `toSketch`, `groupByPage`, `cloneWithNewIds`, `dropTarget`. No imports. |
| `Sketch.tsx` | Renders a `SketchNode` |
| `useSectionActions.ts` | Insert blank or template at an index, duplicate, move, remove (with an Undo toast) |
| `useBoardPages.ts` | Pages plus per-page sections (live for the open page, fetched for the others) |
| `InsertPoint.tsx` | Gap between sections: `+` picker and drop target |
| `SectionBlock.tsx` | One section sketch with its toolbar, drag handle and selection |
| `PageColumn.tsx` | Page header and frame, editable or click-to-open |
| `WireframeBoard.tsx` | The board (default export) |
| `SectionsLibrary.tsx` | Sections panel for the Insert rail item |
| `dragTypes.ts` | The two `dataTransfer` type strings and the payload helpers |

Modify:

- `src/features/editor/lib/customcomponents/customComponents.ts`: add `sectionTemplateGroups`.
- `src/providers/editorprovider.tsx`: always render `EditorLayout`.
- `src/features/editor/components/layout/EditorLayout.tsx`: hide the inspector in Wireframe.
- `src/app/_protected/editor.$id/-editor.tsx`: render the board in Wireframe.
- `src/features/editor/components/layout/railItems.tsx`: Insert shows `SectionsLibrary` in Wireframe.

Delete: `components/editor/WireframeView.tsx`, `components/wireframe/WireframeManager.tsx`, `components/wireframe/WireframeSidebar.tsx`, and the old `components/wireframe/WireframeCanvas.tsx`.

Test: `tests/sketch-model.test.ts`.

---

### Task 1: Sketch model (pure)

**Files:**
- Create: `src/features/editor/components/wireframe/sketchModel.ts`
- Test: `tests/sketch-model.test.ts`
- Modify: `docs/superpowers/specs/2026-11-13-wireframe-board-design.md` (deviation)

**Interfaces:**
- Produces:
  - `type SketchSource = { type: string; content?: string; tailwindStyles?: string; styles?: { default?: Record<string, unknown> } | null; elements?: SketchSource[] }`
  - `type SketchNode = { kind: "box"; dir: "row" | "col"; cols?: number; children: SketchNode[] } | { kind: "heading"; width: number } | { kind: "text"; lines: 1 | 2 | 3 } | { kind: "button" | "link" | "media" | "field" | "icon" | "rule" | "plain" } | { kind: "more"; count?: number }`
  - `MAX_DEPTH = 4`, `MAX_CHILDREN = 6`
  - `toSketch(el: SketchSource, depth?: number): SketchNode`
  - `type PageItem = { id: string; pageId: string; parentId?: string | null; order?: number; elements?: PageItem[] }`
  - `groupByPage<T extends PageItem>(items: T[]): Map<string, T[]>`
  - `cloneWithNewIds<T extends { id: string; parentId?: string | null; elements?: T[] }>(el: T, makeId: () => string): T`
  - `dropTarget(ids: string[], draggedId: string, gapIndex: number): { targetId: string; position: "before" | "after" } | null`

- [ ] **Step 1: Write the failing tests**

`tests/sketch-model.test.ts`:

```ts
import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import {
  cloneWithNewIds, dropTarget, groupByPage, toSketch,
} from '../src/features/editor/components/wireframe/sketchModel';

test('leaf elements map to sketch kinds', () => {
  assert.deepEqual(toSketch({ type: 'Heading', content: 'Hello' }), { kind: 'heading', width: 40 });
  assert.deepEqual(toSketch({ type: 'Heading', content: 'x'.repeat(200) }), { kind: 'heading', width: 90 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'Short' }), { kind: 'text', lines: 1 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'x'.repeat(100) }), { kind: 'text', lines: 2 });
  assert.deepEqual(toSketch({ type: 'Text', content: 'x'.repeat(300) }), { kind: 'text', lines: 3 });
  assert.deepEqual(toSketch({ type: 'Button' }), { kind: 'button' });
  assert.deepEqual(toSketch({ type: 'Link' }), { kind: 'link' });
  assert.deepEqual(toSketch({ type: 'Image' }), { kind: 'media' });
  assert.deepEqual(toSketch({ type: 'Carousel', elements: [{ type: 'Image' }] }), { kind: 'media' });
  assert.deepEqual(toSketch({ type: 'Input' }), { kind: 'field' });
  assert.deepEqual(toSketch({ type: 'Icon' }), { kind: 'icon' });
  assert.deepEqual(toSketch({ type: 'Separator' }), { kind: 'rule' });
  assert.deepEqual(toSketch({ type: 'SomethingCustom' }), { kind: 'plain' });
});

test('container direction from styles', () => {
  const kids = [{ type: 'Button' }];
  const dir = (styles: Record<string, unknown>) => {
    const n = toSketch({ type: 'Section', styles: { default: styles }, elements: kids });
    return n.kind === 'box' ? [n.dir, n.cols] : null;
  };
  assert.deepEqual(dir({ display: 'flex' }), ['row', undefined]);
  assert.deepEqual(dir({ display: 'flex', flexDirection: 'column' }), ['col', undefined]);
  assert.deepEqual(dir({ display: 'block' }), ['col', undefined]);
  assert.deepEqual(dir({}), ['col', undefined]);
  assert.deepEqual(dir({ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }), ['row', 3]);
  assert.deepEqual(dir({ display: 'grid', gridTemplateColumns: '1fr 2fr' }), ['row', 2]);
});

test('container direction from tailwind classes when styles are silent', () => {
  const dir = (tw: string) => {
    const n = toSketch({ type: 'Frame', tailwindStyles: tw, elements: [{ type: 'Text' }] });
    return n.kind === 'box' ? [n.dir, n.cols] : null;
  };
  assert.deepEqual(dir('flex items-center'), ['row', undefined]);
  assert.deepEqual(dir('flex flex-col gap-4'), ['col', undefined]);
  assert.deepEqual(dir('flex flex-col md:flex-row'), ['row', undefined]);
  assert.deepEqual(dir('grid grid-cols-1 md:grid-cols-3'), ['row', 3]);
  assert.deepEqual(dir('p-4 rounded'), ['col', undefined]);
});

test('an empty container is still a box', () => {
  assert.deepEqual(toSketch({ type: 'Section', elements: [] }), { kind: 'box', dir: 'col', children: [] });
  assert.deepEqual(toSketch({ type: 'Section' }), { kind: 'box', dir: 'col', children: [] });
});

test('depth and child limits', () => {
  let deep: { type: string; elements?: unknown[] } = { type: 'Text' };
  for (let i = 0; i < 6; i++) deep = { type: 'Frame', elements: [deep] };
  let n = toSketch(deep as never);
  let depth = 0;
  while (n.kind === 'box') { n = n.children[0]; depth++; }
  assert.equal(depth, 4);
  assert.deepEqual(n, { kind: 'more' });

  const wide = toSketch({ type: 'Section', elements: Array.from({ length: 9 }, () => ({ type: 'Button' })) });
  assert.equal(wide.kind, 'box');
  if (wide.kind === 'box') {
    assert.equal(wide.children.length, 7);
    assert.deepEqual(wide.children[6], { kind: 'more', count: 3 });
  }
});

test('groupByPage: nested response', () => {
  const g = groupByPage([
    { id: 'a', pageId: 'p1', elements: [{ id: 'a1', pageId: 'p1', parentId: 'a' }] },
    { id: 'b', pageId: 'p2' },
  ]);
  assert.deepEqual([...g.keys()], ['p1', 'p2']);
  assert.equal(g.get('p1')!.length, 1);
  assert.equal(g.get('p1')![0].elements!.length, 1);
});

test('groupByPage: flat response with parentId, ordered', () => {
  const g = groupByPage([
    { id: 'a2', pageId: 'p1', parentId: 'a', order: 1 },
    { id: 'a', pageId: 'p1', order: 1 },
    { id: 'a1', pageId: 'p1', parentId: 'a', order: 0 },
    { id: 'z', pageId: 'p1', order: 0 },
  ]);
  const top = g.get('p1')!;
  assert.deepEqual(top.map((e) => e.id), ['z', 'a']);
  assert.deepEqual(top[1].elements!.map((e) => e.id), ['a1', 'a2']);
});

test('groupByPage: a child listed both nested and flat is attached once', () => {
  const g = groupByPage([
    { id: 'a', pageId: 'p1', elements: [{ id: 'a1', pageId: 'p1', parentId: 'a' }] },
    { id: 'a1', pageId: 'p1', parentId: 'a' },
  ]);
  assert.equal(g.get('p1')!.length, 1);
  assert.equal(g.get('p1')![0].elements!.length, 1);
});

test('cloneWithNewIds gives every node a new id and re-parents children', () => {
  let n = 0;
  const src = { id: 's', parentId: null, name: 'Hero', elements: [{ id: 'c', parentId: 's', elements: [{ id: 'g', parentId: 'c' }] }] };
  const copy = cloneWithNewIds(src, () => `new${++n}`);
  assert.equal(copy.id, 'new1');
  assert.equal(copy.parentId, null);
  assert.equal(copy.name, 'Hero');
  assert.equal(copy.elements![0].id, 'new2');
  assert.equal(copy.elements![0].parentId, 'new1');
  assert.equal(copy.elements![0].elements![0].parentId, 'new2');
  assert.equal(src.elements[0].id, 'c');
});

test('dropTarget: gap index to store move, no-ops return null', () => {
  const ids = ['a', 'b', 'c'];
  assert.deepEqual(dropTarget(ids, 'c', 0), { targetId: 'a', position: 'before' });
  assert.deepEqual(dropTarget(ids, 'a', 3), { targetId: 'c', position: 'after' });
  assert.deepEqual(dropTarget(ids, 'a', 2), { targetId: 'c', position: 'before' });
  assert.equal(dropTarget(ids, 'b', 1), null);
  assert.equal(dropTarget(ids, 'b', 2), null);
  assert.equal(dropTarget(ids, 'x', 1), null);
  assert.equal(dropTarget(['a'], 'a', 0), null);
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `bun run test:unit`
Expected: FAIL with `Cannot find module '.../wireframe/sketchModel'`.

- [ ] **Step 3: Implement `sketchModel.ts`**

```ts
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
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `bun run test:unit`
Expected: all `sketch-model` tests PASS, and the existing tests still pass.

- [ ] **Step 5: Record the deviation in the spec**

In the spec's Architecture list, replace the `templateCategories(customComps)` bullet under `sketchModel.ts` with: `cloneWithNewIds` and `dropTarget`. The template groups are a static `sectionTemplateGroups` export in `lib/customcomponents/customComponents.ts`.

In Testing, replace the `templateCategories` bullet with: `cloneWithNewIds` (fresh ids, re-parented children) and `dropTarget` (gap to move, no-ops).

- [ ] **Step 6: Commit**

```bash
git add tests/sketch-model.test.ts src/features/editor/components/wireframe/sketchModel.ts docs/superpowers/specs/2026-11-13-wireframe-board-design.md
git commit -m "feat(wireframe): pure sketch model for the board"
```

---

### Task 2: Template groups, sketch renderer, section actions, Sections library

**Files:**
- Modify: `src/features/editor/lib/customcomponents/customComponents.ts`
- Create: `wireframe/dragTypes.ts`, `wireframe/Sketch.tsx`, `wireframe/useSectionActions.ts`, `wireframe/SectionsLibrary.tsx`

**Interfaces:**
- Consumes:
  - `toSketch`, `SketchNode`, `cloneWithNewIds` (Task 1);
  - `useElementsWithActions()`, `useInsertElementRelative()`, `useMoveElement()`, `useSetSelectedElement()` and `useElementStore` from `@/features/editor`;
  - `ElementFactory.getInstance().createElement({ type, pageId })` and `.createElementFromTemplate({ element, pageId })`;
  - `newEntityId()` from `@/lib/entity-id`.
- Produces:
  - `type SectionTemplateGroup = { id: string; label: string; templates: ElementTemplate[] }`, and `sectionTemplateGroups: SectionTemplateGroup[]`
  - `TEMPLATE_DRAG = "application/x-wf-template"`, `MOVE_DRAG = "application/x-wf-move"`
  - `setTemplateDragData(dt: DataTransfer, groupId: string, index: number): void`
  - `readTemplateDrag(dt: DataTransfer): ElementTemplate | null`
  - `Sketch({ node, className? }: { node: SketchNode; className?: string })`
  - `useSectionActions(pageId: string)` returning `{ sections: EditorElement[]; insertBlankAt(index: number): void; insertTemplateAt(t: ElementTemplate, index: number): void; duplicate(el: EditorElement): void; moveBy(index: number, delta: -1 | 1): void; moveTo(id: string, gapIndex: number): void; remove(el: EditorElement): void }`
  - `SectionsLibrary()` (default export)

- [ ] **Step 1: Add `sectionTemplateGroups` to `customComponents.ts`**

Append at the end of the file (the imports it uses already exist there):

```ts
export type SectionTemplateGroup = {
  id: string;
  label: string;
  templates: ElementTemplate[];
};

const templatesOf = (items: CustomComponent[]): ElementTemplate[] =>
  items.map((c) => c.component);

/** Section templates grouped for the wireframe Sections library. Whole-site templates are excluded. */
export const sectionTemplateGroups: SectionTemplateGroup[] = [
  { id: "navigation", label: "Navigation", templates: templatesOf([navbarComponent, navbarComponent2, navbarComponent3, navbarComponent4, navbarComponent5]) },
  { id: "header", label: "Header", templates: templatesOf([headerComponent, headerComponent2, headerComponent3]) },
  { id: "landing", label: "Hero & landing", templates: templatesOf(landingPageSections as CustomComponent[]) },
  { id: "sidebar", label: "Sidebar", templates: templatesOf([sidebarLeftComponent, sidebarLeftComponent2, sidebarLeftComponent3, sidebarLeftComponent4, sidebarRightComponent, sidebarRightComponent2, sidebarRightComponent3, sidebarRightComponent4]) },
  { id: "form", label: "Form", templates: templatesOf([formComponent1, formComponent2]) },
  { id: "footer", label: "Footer", templates: templatesOf([footerComponent, footerComponent2, footerComponent3, footerComponent4]) },
];
```

Run: `npx tsc --noEmit`
Expected: clean. If `landingPageSections` is already typed `CustomComponent[]`, drop the cast.

- [ ] **Step 2: Implement `dragTypes.ts`**

```ts
import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import type { ElementTemplate } from "@/types/global.type";

/** A Sections-library tile being dragged onto the board. */
export const TEMPLATE_DRAG = "application/x-wf-template";
/** A section on the open page being dragged to a new position. */
export const MOVE_DRAG = "application/x-wf-move";

export function setTemplateDragData(dt: DataTransfer, groupId: string, index: number) {
  dt.setData(TEMPLATE_DRAG, JSON.stringify({ groupId, index }));
  dt.effectAllowed = "copy";
}

export function readTemplateDrag(dt: DataTransfer): ElementTemplate | null {
  try {
    const { groupId, index } = JSON.parse(dt.getData(TEMPLATE_DRAG)) as { groupId: string; index: number };
    return sectionTemplateGroups.find((g) => g.id === groupId)?.templates[index] ?? null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 3: Implement `Sketch.tsx`**

```tsx
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SketchNode } from "./sketchModel";

const LINE_WIDTHS = ["100%", "82%", "58%"];

/** Draws a sketch tree in neutral greys. Never renders text content. */
export function Sketch({ node, className }: { node: SketchNode; className?: string }) {
  switch (node.kind) {
    case "heading":
      return <div className={cn("h-2 rounded-sm bg-foreground/35", className)} style={{ width: `${node.width}%` }} />;
    case "text":
      return (
        <div className={cn("flex w-full flex-col gap-1", className)}>
          {LINE_WIDTHS.slice(0, node.lines).map((w, i) => (
            <div key={i} className="h-[3px] rounded-full bg-foreground/20" style={{ width: node.lines === 1 ? "70%" : w }} />
          ))}
        </div>
      );
    case "button":
      return <div className={cn("h-3 w-10 shrink-0 rounded-full bg-foreground/30", className)} />;
    case "link":
      return <div className={cn("h-[3px] w-8 shrink-0 rounded-full bg-foreground/30", className)} />;
    case "media":
      return (
        <div className={cn("flex aspect-[16/9] w-full min-w-6 items-center justify-center rounded-sm border border-foreground/15 bg-foreground/5 text-foreground/20", className)}>
          <X className="h-3 w-3" />
        </div>
      );
    case "field":
      return <div className={cn("h-3.5 w-full min-w-8 rounded-sm border border-foreground/25", className)} />;
    case "icon":
      return <div className={cn("h-3 w-3 shrink-0 rounded-sm bg-foreground/25", className)} />;
    case "rule":
      return <div className={cn("h-px w-full bg-foreground/20", className)} />;
    case "more":
      return (
        <div className={cn("flex h-3 min-w-5 shrink-0 items-center justify-center rounded-sm bg-foreground/10 px-1 text-[8px] leading-none text-foreground/40", className)}>
          {node.count ? `+${node.count}` : "…"}
        </div>
      );
    case "plain":
      return <div className={cn("h-4 w-full rounded-sm bg-foreground/10", className)} />;
    case "box": {
      const grid = node.cols !== undefined;
      return (
        <div
          className={cn(
            "min-h-3 w-full min-w-0 gap-1.5 rounded-sm",
            grid ? "grid" : node.dir === "row" ? "flex flex-row items-center" : "flex flex-col",
            className,
          )}
          style={grid ? { gridTemplateColumns: `repeat(${Math.min(node.cols!, 6)}, minmax(0, 1fr))` } : undefined}
        >
          {node.children.map((child, i) => (
            <Sketch
              key={i}
              node={child}
              className={child.kind === "box" ? "flex-1 rounded-sm border border-foreground/10 p-1" : node.dir === "row" && (child.kind === "text" || child.kind === "media" || child.kind === "field") ? "flex-1" : undefined}
            />
          ))}
        </div>
      );
    }
  }
}
```

- [ ] **Step 4: Implement `useSectionActions.ts`**

```ts
import { toast } from "sonner";
import {
  useElementStore,
  useElementsWithActions,
  useInsertElementRelative,
  useMoveElement,
  useSetSelectedElement,
} from "@/features/editor";
import { ElementFactory } from "@/features/editor/utils/element/create/ElementFactory";
import { newEntityId } from "@/lib/entity-id";
import type { EditorElement, ElementTemplate } from "@/types/global.type";
import { cloneWithNewIds, dropTarget } from "./sketchModel";

/** Structural edits to the open page's top-level sections. */
export function useSectionActions(pageId: string) {
  const { elements: sections, addElement, deleteElement } = useElementsWithActions();
  const insertRelative = useInsertElementRelative();
  const moveElement = useMoveElement();
  const setSelected = useSetSelectedElement();

  const insertAt = (el: EditorElement | undefined, index: number) => {
    if (!el) return;
    if (sections.length === 0) addElement(el);
    else if (index >= sections.length) insertRelative(el, sections[sections.length - 1].id, "after");
    else insertRelative(el, sections[Math.max(0, index)].id, "before");
    setSelected(el);
  };

  return {
    sections,
    insertBlankAt: (index: number) =>
      insertAt(ElementFactory.getInstance().createElement({ type: "Section", pageId }), index),
    insertTemplateAt: (template: ElementTemplate, index: number) =>
      insertAt(ElementFactory.getInstance().createElementFromTemplate({ element: template, pageId }), index),
    duplicate: (el: EditorElement) => {
      const copy = cloneWithNewIds(el as never, newEntityId) as EditorElement;
      insertRelative(copy, el.id, "after");
      setSelected(copy);
    },
    moveBy: (index: number, delta: -1 | 1) => {
      const target = sections[index + delta];
      if (target) moveElement(sections[index].id, target.id, delta < 0 ? "before" : "after");
    },
    moveTo: (id: string, gapIndex: number) => {
      const t = dropTarget(sections.map((s) => s.id), id, gapIndex);
      if (t) moveElement(id, t.targetId, t.position);
    },
    remove: (el: EditorElement) => {
      deleteElement(el.id);
      setSelected(undefined);
      toast(`Deleted ${el.name || el.type}`, {
        action: { label: "Undo", onClick: () => useElementStore.getState().undo() },
      });
    },
  };
}

export type SectionActions = ReturnType<typeof useSectionActions>;
```

Before relying on `newEntityId`, open `ElementFactory.ts` and check what `generateId()` calls. If it uses a different generator, import and use that one, so duplicated ids have the same format as created ones.

- [ ] **Step 5: Implement `SectionsLibrary.tsx`**

```tsx
import { useMemo } from "react";
import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import { useEditorContext } from "@/providers/editorprovider";
import { Sketch } from "./Sketch";
import { setTemplateDragData } from "./dragTypes";
import { toSketch, type SketchSource } from "./sketchModel";
import { useSectionActions } from "./useSectionActions";

/** Sections panel shown by the Insert rail item in Wireframe mode. */
export default function SectionsLibrary() {
  const { pageId, editor } = useEditorContext();
  const actions = useSectionActions(pageId);
  const canAdd = !editor.isReadOnly && !editor.isLocked && editor.permissions.canCreateElements;

  const groups = useMemo(
    () =>
      sectionTemplateGroups.map((g) => ({
        ...g,
        tiles: g.templates.map((t, index) => ({
          index,
          template: t,
          name: t.name || `${g.label} ${index + 1}`,
          sketch: toSketch(t as SketchSource),
        })),
      })),
    [],
  );

  return (
    <div className="h-full overflow-y-auto px-2.5 pb-4 pt-1">
      <p className="px-0.5 py-2 text-[11px] text-muted-foreground">
        {canAdd ? "Click to add to the open page, or drag onto it." : "You don't have permission to add sections."}
      </p>
      {groups.map((g) => (
        <div key={g.id} className="mb-3">
          <h3 className="px-0.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {g.label}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {g.tiles.map((tile) => (
              <button
                key={tile.index}
                type="button"
                disabled={!canAdd}
                draggable={canAdd}
                onDragStart={(e) => setTemplateDragData(e.dataTransfer, g.id, tile.index)}
                onClick={() => actions.insertTemplateAt(tile.template, actions.sections.length)}
                title={`Add ${tile.name}`}
                className="group flex flex-col gap-1.5 rounded-lg border border-border/60 bg-card/50 p-1.5 text-left transition-colors hover:border-primary/40 hover:bg-accent disabled:opacity-50"
              >
                <div className="pointer-events-none flex h-12 w-full items-center overflow-hidden rounded-sm bg-muted/40 p-1.5">
                  <Sketch node={tile.sketch} />
                </div>
                <span className="w-full truncate text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                  {tile.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Type-check and test**

Run: `npx tsc --noEmit && bun run test:unit`
Expected: the type check is clean and all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/features/editor/lib/customcomponents/customComponents.ts src/features/editor/components/wireframe/
git commit -m "feat(wireframe): section templates, sketch renderer, actions and library"
```

---

### Task 3: Board components

**Files:**
- Create: `wireframe/useBoardPages.ts`, `wireframe/InsertPoint.tsx`, `wireframe/SectionBlock.tsx`, `wireframe/PageColumn.tsx`
- Replace: `wireframe/WireframeCanvas.tsx` is deleted here; create `wireframe/WireframeBoard.tsx`

**Interfaces:**
- Consumes:
  - Tasks 1–2;
  - `useProjectPages(projectId)` from `@/features/projects/hooks/useProjects`;
  - `elementService.getElements(projectId)` and `useElements()` from `@/features/editor`;
  - `useCollaborationOptional()` from `@/providers/collaborationprovider`;
  - `useEditorPermissions(projectId)`;
  - `CreatePageDialog({ trigger })` from `../ProjectPageCommand`;
  - `Popover`, `PopoverTrigger` and `PopoverContent` from `@/components/ui/popover`.
- Produces:
  - `useBoardPages()` returning `{ pages: Page[]; activePageId: string; sectionsOf(pageId: string): EditorElement[] | undefined; activeReady: boolean; othersLoading: boolean; othersError: boolean; retry(): void; pagesLoading: boolean }`
  - `InsertPoint({ index, actions, canAdd })`
  - `SectionBlock({ element, index, count, editable, perms, actions, onOpenInDesign })`
  - `PageColumn({ page, sections, state, active, perms, actions, onOpen, onRetry, onOpenInDesign })`
  - `WireframeBoard()` (default export)

- [ ] **Step 1: Implement `useBoardPages.ts`**

```ts
import { useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { elementService, useElements } from "@/features/editor";
import { useProjectPages } from "@/features/projects/hooks/useProjects";
import { useCollaborationOptional } from "@/providers/collaborationprovider";
import { useEditorContext } from "@/providers/editorprovider";
import type { EditorElement } from "@/types/global.type";
import { groupByPage, type PageItem } from "./sketchModel";

/** Pages of the project with their top-level sections: live for the open page, saved state for the rest. */
export function useBoardPages() {
  const { projectId, pageId: activePageId } = useEditorContext();
  const { data: pages = [], isLoading: pagesLoading } = useProjectPages(projectId);
  const live = useElements();
  const collab = useCollaborationOptional();

  // Keyed by the open page so switching pages refetches the saved state.
  const query = useQuery({
    queryKey: ["wireframe-elements", projectId, activePageId],
    queryFn: () => elementService.getElements(projectId as string),
    enabled: Boolean(projectId),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  const saved = useMemo(
    () => groupByPage((query.data ?? []) as unknown as PageItem[]) as unknown as Map<string, EditorElement[]>,
    [query.data],
  );

  return {
    pages,
    pagesLoading,
    activePageId,
    activeReady: collab ? collab.isSynced : true,
    othersLoading: query.isPending,
    othersError: query.isError,
    retry: () => void query.refetch(),
    sectionsOf: (pageId: string): EditorElement[] | undefined =>
      pageId === activePageId ? live : query.data ? (saved.get(pageId) ?? []) : undefined,
  };
}
```

- [ ] **Step 2: Implement `InsertPoint.tsx`**

```tsx
import { useState } from "react";
import { Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { sectionTemplateGroups } from "@/features/editor/lib/customcomponents/customComponents";
import { cn } from "@/lib/utils";
import { MOVE_DRAG, TEMPLATE_DRAG, readTemplateDrag } from "./dragTypes";
import type { SectionActions } from "./useSectionActions";

/** The gap before section `index` (or after the last): a `+` picker and a drop target. */
export function InsertPoint({
  index, actions, canAdd, canMove,
}: {
  index: number;
  actions: SectionActions;
  canAdd: boolean;
  canMove: boolean;
}) {
  const [over, setOver] = useState(false);
  const [open, setOpen] = useState(false);

  const accepts = (e: React.DragEvent) =>
    (canAdd && e.dataTransfer.types.includes(TEMPLATE_DRAG)) ||
    (canMove && e.dataTransfer.types.includes(MOVE_DRAG));

  return (
    <div
      onDragOver={(e) => {
        if (!accepts(e)) return;
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        if (!accepts(e)) return;
        e.preventDefault();
        e.stopPropagation();
        const movedId = e.dataTransfer.getData(MOVE_DRAG);
        if (movedId) return actions.moveTo(movedId, index);
        const template = readTemplateDrag(e.dataTransfer);
        if (template) actions.insertTemplateAt(template, index);
      }}
      className="group/ip relative flex h-3 items-center justify-center"
    >
      <div className={cn("absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-primary opacity-0 transition-opacity", over && "opacity-100")} />
      {canAdd && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label="Add section here"
              className={cn(
                "relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-sm transition-opacity focus-visible:opacity-100 group-hover/ip:opacity-100",
                open && "opacity-100",
              )}
            >
              <Plus className="h-3 w-3" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="center" className="max-h-72 w-52 overflow-y-auto p-1 text-xs">
            <button
              type="button"
              className="flex w-full rounded px-2 py-1.5 text-left hover:bg-accent"
              onClick={() => {
                actions.insertBlankAt(index);
                setOpen(false);
              }}
            >
              Blank section
            </button>
            {sectionTemplateGroups.map((g) => (
              <div key={g.id}>
                <p className="px-2 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{g.label}</p>
                {g.templates.map((t, i) => (
                  <button
                    key={i}
                    type="button"
                    className="flex w-full truncate rounded px-2 py-1.5 text-left hover:bg-accent"
                    onClick={() => {
                      actions.insertTemplateAt(t, index);
                      setOpen(false);
                    }}
                  >
                    {t.name || `${g.label} ${i + 1}`}
                  </button>
                ))}
              </div>
            ))}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Implement `SectionBlock.tsx`**

```tsx
import { useMemo } from "react";
import { ArrowDown, ArrowUp, Copy, GripVertical, Trash2 } from "lucide-react";
import { useIsSelected, useSetSelectedElement } from "@/features/editor";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { Sketch } from "./Sketch";
import { MOVE_DRAG } from "./dragTypes";
import { toSketch, type SketchSource } from "./sketchModel";
import type { SectionActions } from "./useSectionActions";

export type BoardPerms = { canAdd: boolean; canDelete: boolean; canMove: boolean };

function Tool({ label, onClick, disabled, children, danger }: {
  label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode; danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30 [&_svg]:h-3 [&_svg]:w-3",
        danger && "hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

/** One top-level section drawn as a sketch. Editable only on the open page. */
export function SectionBlock({
  element, index, count, editable, perms, actions, onOpenInDesign,
}: {
  element: EditorElement;
  index: number;
  count: number;
  editable: boolean;
  perms: BoardPerms;
  actions?: SectionActions;
  onOpenInDesign?: (el: EditorElement) => void;
}) {
  const selected = useIsSelected(element.id) && editable;
  const setSelected = useSetSelectedElement();
  const sketch = useMemo(() => toSketch(element as unknown as SketchSource), [element]);
  const name = element.name || element.type;

  return (
    <div
      onClick={editable ? (e) => { e.stopPropagation(); setSelected(element); } : undefined}
      onDoubleClick={editable && onOpenInDesign ? () => onOpenInDesign(element) : undefined}
      className={cn(
        "group/sb relative rounded-md border border-border bg-card p-2",
        editable && "cursor-pointer hover:border-foreground/30",
        selected && "border-primary ring-1 ring-primary hover:border-primary",
      )}
    >
      <div className="mb-1.5 flex h-5 items-center gap-1">
        {editable && perms.canMove && (
          <span
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData(MOVE_DRAG, element.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            title="Drag to reorder"
            className="flex h-5 w-4 cursor-grab items-center justify-center text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          >
            <GripVertical className="h-3 w-3" />
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[10px] font-medium text-muted-foreground">{name}</span>
        {editable && actions && (
          <div className={cn("flex items-center opacity-0 transition-opacity group-hover/sb:opacity-100", selected && "opacity-100")}>
            {perms.canMove && (
              <>
                <Tool label="Move up" disabled={index === 0} onClick={() => actions.moveBy(index, -1)}><ArrowUp /></Tool>
                <Tool label="Move down" disabled={index === count - 1} onClick={() => actions.moveBy(index, 1)}><ArrowDown /></Tool>
              </>
            )}
            {perms.canAdd && <Tool label="Duplicate" onClick={() => actions.duplicate(element)}><Copy /></Tool>}
            {perms.canDelete && <Tool label="Delete" danger onClick={() => actions.remove(element)}><Trash2 /></Tool>}
          </div>
        )}
      </div>
      <div className="pointer-events-none overflow-hidden">
        <Sketch node={sketch} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement `PageColumn.tsx`**

```tsx
import { forwardRef } from "react";
import { Database, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Page } from "@/features/pages";
import { cn } from "@/lib/utils";
import type { EditorElement } from "@/types/global.type";
import { InsertPoint } from "./InsertPoint";
import { SectionBlock, type BoardPerms } from "./SectionBlock";
import type { SectionActions } from "./useSectionActions";

export type ColumnState = "ready" | "loading" | "error";

/** One page on the board: header plus a frame of section sketches. */
export const PageColumn = forwardRef<HTMLDivElement, {
  page: Page;
  sections: EditorElement[] | undefined;
  state: ColumnState;
  active: boolean;
  perms: BoardPerms;
  actions?: SectionActions;
  onOpen: () => void;
  onRetry: () => void;
  onOpenInDesign: (el: EditorElement) => void;
}>(function PageColumn({ page, sections, state, active, perms, actions, onOpen, onRetry, onOpenInDesign }, ref) {
  const Icon = page.Type === "dp" ? Database : FileText;
  const list = sections ?? [];
  const editable = active && Boolean(actions);

  return (
    <div ref={ref} className="w-[240px] shrink-0 [content-visibility:auto]">
      <div className="mb-2 flex h-6 items-center gap-1.5 px-0.5 text-[11px]">
        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 truncate font-semibold">{page.Name}</span>
        {page.Type === "dp" && <span className="rounded bg-muted px-1 text-[9px] uppercase tracking-wide text-muted-foreground">CMS</span>}
        {state === "ready" && (
          <span className="shrink-0 text-muted-foreground">
            {list.length} {list.length === 1 ? "section" : "sections"}
          </span>
        )}
        <span className="flex-1" />
        {active && <span className="shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-medium text-primary">Editing</span>}
      </div>

      <div
        role={active ? undefined : "button"}
        tabIndex={active ? undefined : 0}
        aria-label={active ? undefined : `Open ${page.Name}`}
        onClick={active ? undefined : onOpen}
        onKeyDown={active ? undefined : (e) => (e.key === "Enter" || e.key === " ") && onOpen()}
        className={cn(
          "rounded-lg border bg-background/60 p-2 transition-all",
          active
            ? "border-primary ring-1 ring-primary"
            : "cursor-pointer border-border opacity-60 hover:opacity-100 hover:border-foreground/30",
        )}
      >
        {state === "loading" ? (
          <div className="space-y-2">
            {[40, 72, 56].map((h) => (
              <div key={h} className="animate-pulse rounded-md bg-muted/60" style={{ height: h }} />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center text-[11px] text-muted-foreground">
            Couldn't load this page.
            <Button
              variant="outline"
              size="sm"
              className="h-6 px-2 text-[11px]"
              onClick={(e) => {
                e.stopPropagation();
                onRetry();
              }}
            >
              Retry
            </Button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col">
            {editable && actions && <InsertPoint index={0} actions={actions} canAdd={perms.canAdd} canMove={false} />}
            <p className="py-6 text-center text-[11px] text-muted-foreground">
              {editable && perms.canAdd ? "Empty page. Add a section from the panel." : "Empty page"}
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {list.map((el, i) => (
              <div key={el.id}>
                {editable && actions ? (
                  <InsertPoint index={i} actions={actions} canAdd={perms.canAdd} canMove={perms.canMove} />
                ) : (
                  i > 0 && <div className="h-2" />
                )}
                <SectionBlock
                  element={el}
                  index={i}
                  count={list.length}
                  editable={editable}
                  perms={perms}
                  actions={actions}
                  onOpenInDesign={onOpenInDesign}
                />
              </div>
            ))}
            {editable && actions && (
              <InsertPoint index={list.length} actions={actions} canAdd={perms.canAdd} canMove={perms.canMove} />
            )}
          </div>
        )}
      </div>
      {!active && state === "ready" && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">Click to edit</p>
      )}
    </div>
  );
});
```

- [ ] **Step 5: Delete the old canvas and implement `WireframeBoard.tsx`**

```bash
git rm src/features/editor/components/wireframe/WireframeCanvas.tsx
```

```tsx
import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useSetSelectedElement } from "@/features/editor";
import { useEditorPermissions } from "@/features/editor/hooks/useEditorPermissions";
import { useEditorContext } from "@/providers/editorprovider";
import type { EditorElement } from "@/types/global.type";
import { CreatePageDialog } from "../ProjectPageCommand";
import { PageColumn, type ColumnState } from "./PageColumn";
import { useBoardPages } from "./useBoardPages";
import { useSectionActions } from "./useSectionActions";

/** Wireframe mode: every page of the project as a column of section sketches. */
export default function WireframeBoard() {
  const { projectId, pageId, setMode, editor } = useEditorContext();
  const board = useBoardPages();
  const actions = useSectionActions(pageId);
  const pagePerms = useEditorPermissions(projectId);
  const setSelected = useSetSelectedElement();
  const navigate = useNavigate();
  const activeRef = useRef<HTMLDivElement>(null);

  const writable = !editor.isReadOnly && !editor.isLocked;
  const perms = {
    canAdd: writable && editor.permissions.canCreateElements,
    canDelete: writable && editor.permissions.canDeleteElements,
    canMove: writable && editor.permissions.canReorderElements,
  };
  const anyEdit = perms.canAdd || perms.canDelete || perms.canMove;

  // Bring the open page into view when the board opens or the page changes.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [board.activePageId, board.pages.length]);

  const openInDesign = (el: EditorElement) => {
    setSelected(el);
    setMode("editor");
  };

  const stateOf = (id: string): ColumnState => {
    if (id === board.activePageId) return board.activeReady ? "ready" : "loading";
    if (board.othersError) return "error";
    return board.othersLoading ? "loading" : "ready";
  };

  return (
    <div
      onClick={() => setSelected(undefined)}
      className="h-full w-full overflow-auto bg-canvas-backdrop bg-[radial-gradient(var(--canvas-dot)_1px,transparent_1px)] [background-size:16px_16px]"
    >
      <div className="flex min-h-full w-max items-start gap-7 p-6">
        {board.pagesLoading
          ? [0, 1, 2].map((i) => <div key={i} className="h-64 w-[240px] shrink-0 animate-pulse rounded-lg bg-muted/40" />)
          : board.pages.map((page) => {
              const active = page.Id === board.activePageId;
              return (
                <PageColumn
                  key={page.Id}
                  ref={active ? activeRef : undefined}
                  page={page}
                  sections={board.sectionsOf(page.Id)}
                  state={stateOf(page.Id)}
                  active={active}
                  perms={perms}
                  actions={active && anyEdit ? actions : undefined}
                  onOpen={() => projectId && navigate({ to: `/editor/${projectId}?page=${page.Id}` })}
                  onRetry={board.retry}
                  onOpenInDesign={openInDesign}
                />
              );
            })}
        {!board.pagesLoading && pagePerms.canCreatePages && (
          <CreatePageDialog
            trigger={
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                className="mt-8 flex h-36 w-[160px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-[11px] text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                New page
              </button>
            }
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: one known error at this point: `WireframeManager.tsx` imports the deleted `./WireframeCanvas`. That file is removed in Task 4, so do not fix it here. Any other error must be fixed.

- [ ] **Step 7: Commit**

```bash
git add -A src/features/editor/components/wireframe/
git commit -m "feat(wireframe): multi-page board, page columns and section blocks"
```

---

### Task 4: Wire into the editor layout, remove the old mode, verify

**Files:**
- Modify: `src/providers/editorprovider.tsx`, `src/features/editor/components/layout/EditorLayout.tsx`, `src/app/_protected/editor.$id/-editor.tsx`, `src/features/editor/components/layout/railItems.tsx`
- Delete: `src/features/editor/components/editor/WireframeView.tsx`, `src/features/editor/components/wireframe/WireframeManager.tsx`, `src/features/editor/components/wireframe/WireframeSidebar.tsx`

**Interfaces:**
- Consumes: `WireframeBoard` (default export), `SectionsLibrary` (default export).

- [ ] **Step 1: `editorprovider.tsx` always renders the layout**

Remove the `WireframeView` import. Replace:

```tsx
          {mode === "wireframe" ? (
            <WireframeView mode={mode} setMode={setMode} pageId={pageId} />
          ) : (
            <EditorLayout>{children}</EditorLayout>
          )}
```

with:

```tsx
          <EditorLayout>{children}</EditorLayout>
```

- [ ] **Step 2: `EditorLayout.tsx` hides the inspector in Wireframe**

Change `const { editingMode, projectId } = useEditorContext();` to `const { editingMode, mode, projectId } = useEditorContext();` and add under `const showChrome = editingMode !== "code";`:

```tsx
  // Wireframe is about structure, not styling: the inspector stays hidden.
  const showInspector = showChrome && mode !== "wireframe";
```

Then replace `{showChrome && !inspectorOpen && (` with `{showInspector && !inspectorOpen && (`, and `{showChrome && inspectorOpen && <Inspector />}` with `{showInspector && inspectorOpen && <Inspector />}`.

- [ ] **Step 3: `-editor.tsx` renders the board in Wireframe**

Add near the other imports:

```tsx
const WireframeBoard = React.lazy(
  () => import("@/features/editor/components/wireframe/WireframeBoard"),
);
```

In `Editor`, change `const { editor, editingMode } = useEditorContext();` to `const { editor, editingMode, mode } = useEditorContext();` and replace the body of the inner `<div className="flex-1 min-h-0 overflow-hidden">` with:

```tsx
        {mode === "wireframe" ? (
          <React.Suspense fallback={null}>
            <WireframeBoard />
          </React.Suspense>
        ) : isCodeMode ? (
          <CodeSplit canvas={previewContent} />
        ) : (
          previewContent
        )}
```

- [ ] **Step 4: `railItems.tsx`: Insert shows the Sections library in Wireframe**

Add:

```tsx
import { useEditorContext } from "@/providers/editorprovider";

const SectionsLibrary = React.lazy(() => import("../wireframe/SectionsLibrary"));

function InsertPanel() {
  const { mode } = useEditorContext();
  return mode === "wireframe" ? <SectionsLibrary /> : <ElementSelector />;
}
```

and change the insert item's `render: () => <ElementSelector />` to `render: () => <InsertPanel />`.

- [ ] **Step 5: Delete the old mode**

```bash
git rm src/features/editor/components/editor/WireframeView.tsx \
       src/features/editor/components/wireframe/WireframeManager.tsx \
       src/features/editor/components/wireframe/WireframeSidebar.tsx
```

Then confirm nothing still references them:

```bash
grep -rn "WireframeView\|WireframeManager\|WireframeSidebar\|WireframeCanvas\|wireframeBlockType" src
```

Expected: no output.

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit && bun run test:unit && bun run build`
Expected: all three succeed.

- [ ] **Step 7: Commit**

```bash
git add -A src
git commit -m "feat(wireframe): board replaces the old wireframe mode inside the editor layout"
```

- [ ] **Step 8: Manual browser check (user)**

Start the dev server (`bun run dev`), open a project with several pages and switch to **Wireframe**. Check:

1. The top bar and rail stay; the inspector is hidden; the board shows every page as a column. The open page has the blue frame and "Editing".
2. On first open and after a page switch, the open column shows a skeleton and then its sections. It never shows "Empty page" for a page that has content.
3. Sketches follow real layout: a navbar draws as a row, a features grid as columns.
4. Click another page: it becomes the open one, the URL's `?page=` changes, and you stay in Wireframe.
5. On the open page:
   - `+` between sections adds a Blank section and a template at that spot.
   - Dragging a tile from the Sections panel shows a line and inserts there.
   - Dragging a section's handle reorders it. Dropping it in the gap next to itself does nothing.
   - ↑ and ↓ move the section, and Duplicate inserts a copy below.
   - Delete shows a toast, and its Undo restores the section.
6. Double-click a section: Design opens with that element selected.
7. Switch to Design, edit a heading, switch back: the sketch reflects it.
8. A viewer or read-only role sees sketches only, with no `+`, handles or toolbar. "+ New page" is hidden without page-create permission.
9. Stop the realtime server and reload: other pages still load from the API. The open column stays a skeleton and nothing crashes.

---

## Self-review notes

- **Spec coverage:**
  - frame (layout kept, inspector hidden, Insert becomes Sections): Task 4;
  - board (columns, order, New page, open vs other pages, click to open, states): Task 3;
  - sketch rules and limits: Task 1 (model) and Task 2 (renderer);
  - editing (select, open in Design, reorder by drag and buttons, duplicate, delete with undo, add via `+` and drag): Tasks 2–3;
  - permissions and read-only: `perms` in `WireframeBoard`, `canAdd` in `SectionsLibrary`;
  - Sections library groups, excluding site templates: Task 2;
  - removal of the old files, "Clear All" and "Convert to Design": Tasks 3–4;
  - edge cases: stale pages (query key includes the open page), not-yet-synced (`activeReady`), many pages (`content-visibility`), unknown types (`plain`);
  - tests: Task 1.
- **Types:** `SectionActions`, `BoardPerms`, `ColumnState`, `SketchNode` and `SketchSource` are used with the same names throughout. The actions are `insertBlankAt`, `insertTemplateAt`, `duplicate`, `moveBy`, `moveTo` and `remove` everywhere.
