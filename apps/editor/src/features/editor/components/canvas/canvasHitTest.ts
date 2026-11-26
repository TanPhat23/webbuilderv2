import { elementTree } from "@webbuilder/site-runtime/elements/lib/element-tree-helper";
import { componentSetting } from "@webbuilder/site-runtime/projects/components";
import { CONTAINER_ELEMENT_TYPES } from "@webbuilder/site-runtime/types/elements";
import type { EditorElement } from "@webbuilder/site-runtime/types/global.type";
import {
  computeDropPosition,
  isHorizontalFlow,
  isNoOpMove,
  resolveNearestChildSlot,
  type ChildDropCandidate,
} from "@/features/editor/utils/element/dropPosition";
import { findElementNodeFromTarget } from "./canvasDom";
import type { CanvasDropResolution, DropIndicatorState } from "./canvasTypes";
import { findElementNode } from "./rectTracker";

export type { CanvasDropResolution };

export interface ResolveCanvasDropTargetParams {
  readonly siteRoot: HTMLElement | null;
  readonly doc: Document | null;
  readonly iframeClientX: number;
  readonly iframeClientY: number;
  readonly elements: readonly EditorElement[];
  readonly canCreate?: boolean;
  readonly isComponentPage?: boolean;
  readonly movingElementId?: string | undefined;
  readonly draggedNode?: HTMLElement | null;
}

const CONTAINER_TYPE_SET: ReadonlySet<string> = new Set(CONTAINER_ELEMENT_TYPES);

function hasClosest(value: unknown): value is Element {
  return (
    value !== null &&
    typeof value === "object" &&
    "closest" in value &&
    typeof value.closest === "function"
  );
}

function isSkippedOverlayOrDraggedNode(
  el: Element,
  draggedNode: HTMLElement | null,
): boolean {
  if (el.closest("[data-canvas-overlay]")) return true;
  if (el.closest("[inert]")) return true;
  if (draggedNode && (el === draggedNode || draggedNode.contains(el))) return true;
  return false;
}

function resolveLayoutParent(
  node: HTMLElement,
  view: Window | null,
): HTMLElement | null {
  let current = (
    node.closest<HTMLElement>("[data-component-instance]") ?? node
  ).parentElement;
  while (current && view) {
    const style = view.getComputedStyle(current);
    if (style.display !== "contents") return current;
    current = current.parentElement;
  }
  return current;
}

function findLastRootElementNode(
  siteRoot: HTMLElement,
  rootElements: readonly EditorElement[],
): { readonly id: string; readonly node: Element } | null {
  if (typeof siteRoot.querySelector === "function") {
    for (let i = rootElements.length - 1; i >= 0; i -= 1) {
      const rootEl = rootElements[i];
      if (!rootEl) continue;
      const found = findElementNode(siteRoot, rootEl.id);
      if (found) {
        return { id: rootEl.id, node: found };
      }
    }
  }

  const children = siteRoot.children;
  if (children) {
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const child = children[i];
      if (!child || typeof child.getAttribute !== "function") continue;
      const directId = child.getAttribute("data-element-id");
      if (directId) {
        return { id: directId, node: child };
      }
      const instId = child.getAttribute("data-component-instance");
      if (instId) {
        const instNode = findElementNode(child, instId);
        if (instNode) {
          return { id: instId, node: instNode };
        }
      }
    }
  }
  return null;
}

function collectDirectChildCandidates(
  containerNode: HTMLElement,
  draggedNode: HTMLElement | null,
  movingElementId: string | undefined,
): ChildDropCandidate[] {
  const candidates: ChildDropCandidate[] = [];
  for (const child of Array.from(containerNode.children)) {
    if (child.hasAttribute("inert") || child.hasAttribute("data-canvas-overlay")) {
      continue;
    }
    const directId = child.getAttribute("data-element-id");
    if (directId) {
      if (directId === movingElementId) continue;
      if (draggedNode && (child === draggedNode || draggedNode.contains(child))) {
        continue;
      }
      candidates.push({ id: directId, box: child.getBoundingClientRect() });
      continue;
    }

    const instanceId = child.getAttribute("data-component-instance");
    if (instanceId && instanceId !== movingElementId) {
      const instanceNode = findElementNode(child, instanceId);
      if (
        instanceNode &&
        !(
          draggedNode &&
          (instanceNode === draggedNode || draggedNode.contains(instanceNode))
        )
      ) {
        candidates.push({
          id: instanceId,
          box: instanceNode.getBoundingClientRect(),
        });
      }
    }
  }
  return candidates;
}

/**
 * Unified drop target resolver shared by sidebar HTML5 drag-and-drop and
 * on-canvas pointer reordering.
 */
export function resolveCanvasDropTarget(
  params: ResolveCanvasDropTargetParams,
): CanvasDropResolution {
  const {
    siteRoot,
    doc,
    iframeClientX,
    iframeClientY,
    elements,
    canCreate = true,
    isComponentPage = false,
    movingElementId,
    draggedNode = null,
  } = params;

  if (!siteRoot || !doc) return null;

  if (elements.length === 0) {
    if (movingElementId !== undefined) return null;
    return canCreate ? { kind: "root" } : null;
  }

  if (movingElementId === undefined && !canCreate) {
    return null;
  }

  if (typeof doc.elementsFromPoint !== "function") return null;

  const rootElements: EditorElement[] = [...elements];
  const stack = doc.elementsFromPoint(iframeClientX, iframeClientY);

  let candidate: HTMLElement | null = null;
  for (const el of stack) {
    if (!hasClosest(el)) continue;
    if (isSkippedOverlayOrDraggedNode(el, draggedNode)) continue;
    const resolved = findElementNodeFromTarget(siteRoot, el);
    if (!resolved) continue;
    if (isSkippedOverlayOrDraggedNode(resolved, draggedNode)) continue;
    if (
      movingElementId !== undefined &&
      resolved.dataset.elementId === movingElementId
    ) {
      continue;
    }
    candidate = resolved;
    break;
  }

  if (!candidate) {
    if (isComponentPage) return null;
    const lastRoot = findLastRootElementNode(siteRoot, rootElements);
    if (!lastRoot) return null;
    const lastRect = lastRoot.node.getBoundingClientRect();
    const lastBottom = lastRect.top + lastRect.height;
    if (iframeClientY < lastBottom) return null;

    const fallbackIndicator: DropIndicatorState = {
      targetId: lastRoot.id,
      position: "after",
      horizontal: false,
    };
    if (
      movingElementId !== undefined &&
      isNoOpMove(
        rootElements,
        movingElementId,
        fallbackIndicator.targetId,
        fallbackIndicator.position,
      )
    ) {
      return null;
    }
    return { kind: "relative", indicator: fallbackIndicator };
  }

  const targetId = candidate.dataset.elementId;
  if (!targetId) return null;

  const view =
    doc.defaultView ?? (typeof window !== "undefined" ? window : null);
  const layoutParent = resolveLayoutParent(candidate, view);
  const parentStyle =
    layoutParent && view ? view.getComputedStyle(layoutParent) : null;
  const horizontal = parentStyle
    ? isHorizontalFlow({
        display: parentStyle.display,
        flexDirection: parentStyle.flexDirection,
        gridTemplateColumns: parentStyle.gridTemplateColumns,
      })
    : false;

  const isComponentBoundary = Boolean(
    candidate.closest("[data-component-instance]"),
  );
  const model = elementTree.findById(rootElements, targetId);
  const isLinkedComponent = model ? Boolean(componentSetting(model)) : false;
  const elementType = candidate.dataset.elementType ?? model?.type;
  const isContainer =
    !isComponentBoundary &&
    !isLinkedComponent &&
    elementType !== undefined &&
    CONTAINER_TYPE_SET.has(elementType);

  let resolvedTargetId = targetId;
  let resolvedPosition = computeDropPosition(
    candidate.getBoundingClientRect(),
    { x: iframeClientX, y: iframeClientY },
    { isContainer, horizontal },
  );
  let resolvedHorizontal = horizontal;

  if (resolvedPosition === "inside" && isContainer) {
    const childCandidates = collectDirectChildCandidates(
      candidate,
      draggedNode,
      movingElementId,
    );
    if (childCandidates.length > 0) {
      const containerStyle = view ? view.getComputedStyle(candidate) : null;
      const containerHorizontal = containerStyle
        ? isHorizontalFlow({
            display: containerStyle.display,
            flexDirection: containerStyle.flexDirection,
            gridTemplateColumns: containerStyle.gridTemplateColumns,
          })
        : false;
      const slot = resolveNearestChildSlot(
        childCandidates,
        { x: iframeClientX, y: iframeClientY },
        containerHorizontal,
      );
      if (slot) {
        resolvedTargetId = slot.targetId;
        resolvedPosition = slot.position;
        resolvedHorizontal = containerHorizontal;
      }
    }
  }

  if (isComponentPage && resolvedPosition !== "inside") {
    const isRootTarget = rootElements.some((el) => el.id === resolvedTargetId);
    const isRootMove =
      movingElementId !== undefined &&
      rootElements.some((el) => el.id === movingElementId);
    if (isRootTarget && !isRootMove) {
      return null;
    }
  }

  if (
    movingElementId !== undefined &&
    isNoOpMove(rootElements, movingElementId, resolvedTargetId, resolvedPosition)
  ) {
    return null;
  }

  return {
    kind: "relative",
    indicator: {
      targetId: resolvedTargetId,
      position: resolvedPosition,
      horizontal: resolvedHorizontal,
    },
  };
}
