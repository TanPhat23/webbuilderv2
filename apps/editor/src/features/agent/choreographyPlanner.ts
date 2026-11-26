import type { CSSProperties } from "react";
import {
  diffTrees,
  type TreeOp,
} from "@/features/editor/utils/element/treeDiff";
import type { ContainerElement, EditorElement } from "@webbuilder/site-runtime/types/global.type";

export type ChoreographyAction = "create" | "update" | "move" | "delete";

export interface ChoreographyStep {
  readonly id: string;
  readonly ops: readonly TreeOp[];
  readonly targetElementId: string;
  readonly action: ChoreographyAction;
  readonly label: string;
  readonly delayMs: number;
}

const MIN_STEP_DELAY_MS = 180;
const MAX_SINGLE_STEP_DELAY_MS = 520;
const MIN_BATCH_STEP_DELAY_MS = 200;
const MAX_BATCH_STEP_DELAY_MS = 300;
const TARGET_SINGLE_DURATION_MS = 6000;
const TARGET_BATCH_DURATION_MS = 8400;
const MAX_VISUAL_STEPS = 32;
const MAX_LABEL_NAME_LEN = 28;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isContainer(el: EditorElement): el is ContainerElement {
  return "elements" in el && Array.isArray(el.elements);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface IndexedTree {
  readonly byId: Map<string, EditorElement>;
  readonly orderById: Map<string, number>;
  readonly parentById: Map<string, string | undefined>;
}

function indexTree(tree: readonly EditorElement[]): IndexedTree {
  const byId = new Map<string, EditorElement>();
  const orderById = new Map<string, number>();
  const parentById = new Map<string, string | undefined>();
  const visit = (
    list: readonly EditorElement[],
    parentId: string | undefined,
  ): void => {
    list.forEach((el, idx) => {
      byId.set(el.id, el);
      orderById.set(el.id, idx);
      parentById.set(el.id, parentId);
      if (isContainer(el)) {
        visit(el.elements, el.id);
      }
    });
  };
  visit(tree, undefined);
  return { byId, orderById, parentById };
}

function expandCreateSubtree(
  element: EditorElement,
  parentId: string | undefined,
  order: number,
  out: TreeOp[],
): void {
  if (isContainer(element)) {
    const shallow: ContainerElement = {
      ...element,
      parentId,
      order,
      elements: [],
    };
    out.push({ type: "create", element: shallow });
    element.elements.forEach((child, idx) => {
      expandCreateSubtree(child, element.id, idx, out);
    });
    return;
  }

  const normalized: EditorElement = {
    ...element,
    parentId,
    order,
  };
  out.push({ type: "create", element: normalized });
}

function opElementId(op: TreeOp): string {
  return op.type === "create" ? op.element.id : op.id;
}

function formatElementName(el: EditorElement | undefined): string {
  const raw =
    (typeof el?.name === "string" && el.name.trim()) ||
    (typeof el?.type === "string" && el.type.trim()) ||
    "Element";
  if (raw.length <= MAX_LABEL_NAME_LEN) return raw;
  return `${raw.slice(0, MAX_LABEL_NAME_LEN - 1)}…`;
}

function isStyleOnlyPatch(patch: Partial<EditorElement>): boolean {
  const keys = Object.keys(patch);
  if (keys.length === 0) return false;
  return keys.every((key) => key === "styles" || key === "tailwindStyles");
}

function buildStepLabel(
  action: ChoreographyAction,
  ops: readonly TreeOp[],
  targetId: string,
  beforeById: ReadonlyMap<string, EditorElement>,
  afterById: ReadonlyMap<string, EditorElement>,
): string {
  const firstOp = ops[0];
  const fallbackEl =
    firstOp && firstOp.type === "create" ? firstOp.element : undefined;
  const el = afterById.get(targetId) ?? beforeById.get(targetId) ?? fallbackEl;
  const name = formatElementName(el);

  switch (action) {
    case "delete":
      return ops.length > 1 ? `Removing ${ops.length} items` : `Removing ${name}`;
    case "create":
      return ops.length > 1 ? `Building ${name} (+${ops.length - 1})` : `Creating ${name}`;
    case "move":
      return ops.length > 1 ? `Reordering ${ops.length} items` : `Moving ${name}`;
    case "update": {
      if (ops.length === 1 && firstOp && firstOp.type === "update" && isStyleOnlyPatch(firstOp.patch)) {
        return `Styling ${name}`;
      }
      return ops.length > 1 ? `Updating ${ops.length} elements` : `Updating ${name}`;
    }
  }
}

function chunkSameTypeOps(
  ops: readonly TreeOp[],
  maxChunkSize: number,
): TreeOp[][] {
  const groups: TreeOp[][] = [];
  for (const op of ops) {
    const prev = groups.at(-1);
    if (prev && prev[0]?.type === op.type && prev.length < maxChunkSize) {
      prev.push(op);
    } else {
      groups.push([op]);
    }
  }
  return groups;
}

export function planChoreographySteps(
  beforeTree: readonly EditorElement[],
  afterTree: readonly EditorElement[],
): readonly ChoreographyStep[] {
  const rawOps = diffTrees([...beforeTree], [...afterTree]);
  if (rawOps.length === 0) return [];

  const deletes: TreeOp[] = [];
  const creates: TreeOp[] = [];
  const moves: TreeOp[] = [];
  const updates: TreeOp[] = [];

  const beforeIndexed = indexTree(beforeTree);
  const afterIndexed = indexTree(afterTree);

  for (const op of rawOps) {
    switch (op.type) {
      case "delete":
        deletes.push(op);
        break;
      case "create": {
        const parentId =
          afterIndexed.parentById.get(op.element.id) ??
          op.element.parentId ??
          undefined;
        const order =
          afterIndexed.orderById.get(op.element.id) ??
          (typeof op.element.order === "number" ? op.element.order : 0);
        expandCreateSubtree(op.element, parentId, order, creates);
        break;
      }
      case "move":
        moves.push(op);
        break;
      case "update":
        updates.push(op);
        break;
    }
  }

  const orderedOps: TreeOp[] = [...deletes, ...creates, ...moves, ...updates];
  if (orderedOps.length === 0) return [];

  const beforeById = beforeIndexed.byId;
  const afterById = afterIndexed.byId;

  let groupedOps: TreeOp[][];
  let delayMs: number;

  if (orderedOps.length <= MAX_VISUAL_STEPS) {
    groupedOps = orderedOps.map((op) => [op]);
    delayMs = clamp(
      Math.round(TARGET_SINGLE_DURATION_MS / orderedOps.length),
      MIN_STEP_DELAY_MS,
      MAX_SINGLE_STEP_DELAY_MS,
    );
  } else {
    let chunkSize = Math.ceil(orderedOps.length / MAX_VISUAL_STEPS);
    groupedOps = chunkSameTypeOps(orderedOps, chunkSize);
    while (groupedOps.length > MAX_VISUAL_STEPS) {
      chunkSize += 1;
      groupedOps = chunkSameTypeOps(orderedOps, chunkSize);
    }
    delayMs = clamp(
      Math.round(TARGET_BATCH_DURATION_MS / groupedOps.length),
      MIN_BATCH_STEP_DELAY_MS,
      MAX_BATCH_STEP_DELAY_MS,
    );
  }

  return groupedOps.map((ops, index): ChoreographyStep => {
    const primary = ops[0];
    const action: ChoreographyAction = primary ? primary.type : "update";
    const targetElementId = primary ? opElementId(primary) : "";
    const label = buildStepLabel(
      action,
      ops,
      targetElementId,
      beforeById,
      afterById,
    );
    return {
      id: `step-${index + 1}-${action}-${targetElementId}`,
      ops,
      targetElementId,
      action,
      label,
      delayMs,
    };
  });
}

function deepMergeWithDeletions(
  base: unknown,
  patch: unknown,
): Record<string, unknown> {
  const result: Record<string, unknown> = isRecord(base) ? { ...base } : {};
  if (!isRecord(patch)) return result;

  for (const [key, value] of Object.entries(patch)) {
    if (value === null) {
      delete result[key];
    } else if (isRecord(value) && isRecord(result[key])) {
      result[key] = deepMergeWithDeletions(result[key], value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function removeById(
  list: readonly EditorElement[],
  id: string,
): { readonly tree: EditorElement[]; readonly removed: EditorElement | null } {
  let removed: EditorElement | null = null;
  const next: EditorElement[] = [];

  for (const el of list) {
    if (el.id === id) {
      removed = el;
      continue;
    }
    if (isContainer(el)) {
      const childResult = removeById(el.elements, id);
      if (childResult.removed) {
        removed = childResult.removed;
        next.push({ ...el, elements: childResult.tree });
        continue;
      }
    }
    next.push(el);
  }

  return { tree: next, removed };
}

function containsId(list: readonly EditorElement[], id: string): boolean {
  for (const el of list) {
    if (el.id === id) return true;
    if (isContainer(el) && containsId(el.elements, id)) return true;
  }
  return false;
}

function insertAt(
  list: readonly EditorElement[],
  element: EditorElement,
  position: number,
): EditorElement[] {
  const next = [...list];
  const idx = clamp(position, 0, next.length);
  next.splice(idx, 0, element);
  return next;
}

function insertIntoParent(
  list: readonly EditorElement[],
  parentId: string | undefined,
  element: EditorElement,
  position: number,
): EditorElement[] {
  if (!parentId) {
    return insertAt(list, { ...element, parentId: undefined }, position);
  }

  let inserted = false;
  const next = list.map((el): EditorElement => {
    if (el.id === parentId && isContainer(el)) {
      inserted = true;
      const childWithParent: EditorElement = { ...element, parentId };
      return {
        ...el,
        elements: insertAt(el.elements, childWithParent, position),
      };
    }
    if (isContainer(el)) {
      const updatedKids = insertIntoParent(
        el.elements,
        parentId,
        element,
        position,
      );
      if (updatedKids !== el.elements) {
        inserted = true;
        return { ...el, elements: updatedKids };
      }
    }
    return el;
  });

  return inserted ? next : [...list];
}

function mergeResponsiveStyles(
  base: EditorElement["styles"],
  patch: Partial<EditorElement>["styles"],
): Partial<Record<string, CSSProperties>> | undefined {
  if (patch === undefined) return base;
  const merged = deepMergeWithDeletions(base, patch);
  const result: Partial<Record<string, CSSProperties>> = {};
  for (const [breakpoint, styleVal] of Object.entries(merged)) {
    if (isRecord(styleVal)) {
      const cssProps: Record<string, string | number> = {};
      for (const [prop, val] of Object.entries(styleVal)) {
        if (typeof val === "string" || typeof val === "number") {
          cssProps[prop] = val;
        }
      }
      result[breakpoint] = cssProps;
    }
  }
  return result;
}

function applyElementPatch(
  el: EditorElement,
  patch: Partial<EditorElement>,
): EditorElement {
  const nextStyles = mergeResponsiveStyles(el.styles, patch.styles);
  const nextSettings =
    patch.settings !== undefined
      ? deepMergeWithDeletions(el.settings, patch.settings)
      : undefined;

  const baseUpdated: EditorElement = {
    ...el,
    ...(patch.content !== undefined && { content: patch.content }),
    ...(patch.name !== undefined && { name: patch.name }),
    ...(patch.src !== undefined && { src: patch.src }),
    ...(patch.href !== undefined && { href: patch.href }),
    ...(patch.tailwindStyles !== undefined && {
      tailwindStyles: patch.tailwindStyles,
    }),
    ...(patch.styles !== undefined && { styles: nextStyles }),
  };

  if (nextSettings !== undefined) {
    return Object.assign({}, baseUpdated, { settings: nextSettings });
  }
  return baseUpdated;
}

function updateById(
  list: readonly EditorElement[],
  id: string,
  patch: Partial<EditorElement>,
): EditorElement[] {
  let changed = false;
  const next = list.map((el): EditorElement => {
    if (el.id === id) {
      changed = true;
      return applyElementPatch(el, patch);
    }
    if (isContainer(el)) {
      const updatedKids = updateById(el.elements, id, patch);
      if (updatedKids !== el.elements) {
        changed = true;
        return { ...el, elements: updatedKids };
      }
    }
    return el;
  });
  return changed ? next : [...list];
}

export function applyTreeOpsLocally(
  currentTree: readonly EditorElement[],
  ops: readonly TreeOp[],
): EditorElement[] {
  let tree: EditorElement[] = [...currentTree];

  for (const op of ops) {
    switch (op.type) {
      case "delete": {
        tree = removeById(tree, op.id).tree;
        break;
      }
      case "create": {
        if (containsId(tree, op.element.id)) {
          break;
        }
        const position =
          typeof op.element.order === "number"
            ? op.element.order
            : Number.MAX_SAFE_INTEGER;
        tree = insertIntoParent(
          tree,
          op.element.parentId ?? undefined,
          op.element,
          position,
        );
        break;
      }
      case "move": {
        const { tree: withoutEl, removed } = removeById(tree, op.id);
        if (!removed) break;
        const targetParentId = op.newParentId ?? undefined;
        const movedEl: EditorElement = {
          ...removed,
          parentId: targetParentId,
          order: op.newPosition,
        };
        tree = insertIntoParent(
          withoutEl,
          targetParentId,
          movedEl,
          op.newPosition,
        );
        break;
      }
      case "update": {
        tree = updateById(tree, op.id, op.patch);
        break;
      }
    }
  }

  return tree;
}
