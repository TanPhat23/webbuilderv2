import { useCallback, useEffect, useRef, useState } from "react";
import type { ResizeDirection } from "@/features/editor/constants/direction";
import { startResizeDrag } from "@/features/editor/utils/element/resizeDrag";
import type { ResponsiveStyles } from "@/types/elements";
import type { EditorElement } from "@/types/global.type";

interface UseResizeHandlerProps {
  element: EditorElement;
  updateElement: (id: string, updates: Partial<EditorElement>) => void;
  /** The element's own canvas node. */
  targetRef: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
}

export function useResizeHandler({
  element,
  updateElement,
  targetRef,
  enabled = true,
}: UseResizeHandlerProps) {
  const latest = useRef({ element, updateElement, targetRef });
  latest.current = { element, updateElement, targetRef };

  const pendingStylesRef = useRef<ResponsiveStyles | null>(null);
  const disposeDrag = useRef<(() => void) | null>(null);
  const [currentResizeDirection, setDirection] =
    useState<ResizeDirection | null>(null);

  const handleResizeStart = useCallback(
    (direction: ResizeDirection, event: React.MouseEvent) => {
      const target = latest.current.targetRef.current;
      if (!enabled || !target) return;
      event.preventDefault();
      event.stopPropagation();

      disposeDrag.current?.();
      disposeDrag.current = startResizeDrag({
        target,
        direction,
        start: { clientX: event.clientX, clientY: event.clientY },
        pending: pendingStylesRef,
        readStyles: () => latest.current.element.styles,
        readTarget: () => latest.current.targetRef.current,
        finish: (styles) => {
          disposeDrag.current = null;
          setDirection(null);
          const { element, updateElement } = latest.current;
          if (styles) updateElement(element.id, { styles });
        },
      });
      setDirection(direction);
    },
    [enabled],
  );

  useEffect(() => () => disposeDrag.current?.(), []);

  return {
    handleResizeStart,
    isResizing: currentResizeDirection !== null,
    currentResizeDirection,
    pendingStylesRef,
  };
}
