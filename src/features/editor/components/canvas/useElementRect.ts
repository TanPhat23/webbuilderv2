import { useLayoutEffect, useState } from "react";
import { useElementStore } from "@/features/editor/store/element-store";

export interface ElementRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** First canvas node rendered for an element id (CMS lists can repeat ids). */
export function findElementNode(
  root: HTMLElement | null,
  id: string | undefined,
): HTMLElement | null {
  if (!root || !id) return null;
  return root.querySelector<HTMLElement>(
    `[data-element-id="${CSS.escape(id)}"]`,
  );
}

function sameRect(a: ElementRect | null, b: ElementRect | null) {
  return (
    a === b ||
    (!!a &&
      !!b &&
      a.left === b.left &&
      a.top === b.top &&
      a.width === b.width &&
      a.height === b.height)
  );
}

/**
 * Tracks an element's box relative to the canvas root, so overlays drawn
 * inside the root line up with it. Re-measures when the element or the root
 * resizes and after every element-tree change (which can move it).
 */
export function useElementRect(
  root: HTMLElement | null,
  id: string | undefined,
): { node: HTMLElement | null; rect: ElementRect | null } {
  const elements = useElementStore((s) => s.elements);
  const [state, setState] = useState<{
    node: HTMLElement | null;
    rect: ElementRect | null;
  }>({ node: null, rect: null });

  useLayoutEffect(() => {
    const node = findElementNode(root, id);
    if (!root || !node) {
      setState((prev) => (prev.node || prev.rect ? { node: null, rect: null } : prev));
      return;
    }

    const measure = () => {
      const r = node.getBoundingClientRect();
      const base = root.getBoundingClientRect();
      const rect = {
        left: r.left - base.left,
        top: r.top - base.top,
        width: r.width,
        height: r.height,
      };
      setState((prev) =>
        prev.node === node && sameRect(prev.rect, rect) ? prev : { node, rect },
      );
    };
    measure();

    // The canvas renders inside an iframe; use that realm's observer.
    const RO = node.ownerDocument.defaultView?.ResizeObserver ?? ResizeObserver;
    const observer = new RO(measure);
    observer.observe(node);
    observer.observe(root);
    return () => observer.disconnect();
  }, [root, id, elements]);

  return state;
}
