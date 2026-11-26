import type React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";

export const EDGE_ZONE_PX = 48;
export const MAX_SCROLL_PX_PER_FRAME = 14;

/**
 * Computes the per-frame vertical scroll delta (px) when `pointerY` (parent
 * client coordinate) enters the top or bottom `48px` band of the iframe's
 * screen bounding box.
 */
export function computeAutoScrollStep(
  pointerY: number,
  frameTop: number,
  frameHeight: number,
): number {
  if (!Number.isFinite(pointerY) || frameHeight <= 0) return 0;

  const zone = Math.min(EDGE_ZONE_PX, frameHeight / 2);
  if (zone <= 0) return 0;

  const topZoneEnd = frameTop + zone;
  if (pointerY < topZoneEnd) {
    const ratio = Math.min(1, (topZoneEnd - pointerY) / zone);
    return ratio > 0 ? -ratio * MAX_SCROLL_PX_PER_FRAME : 0;
  }

  const bottomZoneStart = frameTop + frameHeight - zone;
  if (pointerY > bottomZoneStart) {
    const ratio = Math.min(1, (pointerY - bottomZoneStart) / zone);
    return ratio > 0 ? ratio * MAX_SCROLL_PX_PER_FRAME : 0;
  }

  return 0;
}

/**
 * Scrolls `iframeRef.current?.contentDocument?.scrollingElement` smoothly on
 * `requestAnimationFrame` while `activePointerParentY` is non-null and within
 * the top/bottom 48px edge band.
 */
export function useAutoScroll(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  activePointerParentY: number | null,
  onScrollTick?: () => void,
): void {
  const pointerYRef = useRef<number | null>(activePointerParentY);
  const onScrollTickRef = useRef<(() => void) | undefined>(onScrollTick);

  useLayoutEffect(() => {
    pointerYRef.current = activePointerParentY;
    onScrollTickRef.current = onScrollTick;
  }, [activePointerParentY, onScrollTick]);

  const isActive = activePointerParentY !== null;

  useEffect(() => {
    if (!isActive) return;

    let rafId: number | null = null;

    const runStep = (): void => {
      const pointerY = pointerYRef.current;
      const iframe = iframeRef.current;
      const doc = iframe?.contentDocument;
      const scroller = doc?.scrollingElement ?? doc?.documentElement ?? null;
      if (pointerY === null || !iframe || !scroller) return;

      const frameRect = iframe.getBoundingClientRect();
      const step = computeAutoScrollStep(
        pointerY,
        frameRect.top,
        frameRect.height,
      );
      if (step === 0) return;

      const prevScrollTop = scroller.scrollTop;
      const maxScrollTop =
        scroller.scrollHeight > scroller.clientHeight
          ? scroller.scrollHeight - scroller.clientHeight
          : Number.POSITIVE_INFINITY;
      const nextScrollTop = Math.min(
        maxScrollTop,
        Math.max(0, prevScrollTop + step),
      );
      if (nextScrollTop !== prevScrollTop) {
        scroller.scrollTop = nextScrollTop;
        onScrollTickRef.current?.();
      }
    };

    const tick = (): void => {
      rafId = null;
      runStep();
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return (): void => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [iframeRef, isActive]);
}
