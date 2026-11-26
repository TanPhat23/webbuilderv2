import type React from "react";
import { useEffect } from "react";
import type { WSRoomState } from "../interfaces/websocket";
import type { RealtimeProvider } from "../lib/realtime/RealtimeProvider";
import {
  HIDDEN_CURSOR,
  PRESENCE_SEND_THROTTLE_MS,
  TINY_CURSOR_DELTA_PX,
} from "../lib/presenceSync";

export interface BroadcastPointer {
  readonly clientX: number;
  readonly clientY: number;
}

export interface DocScroll {
  readonly scrollLeft: number;
  readonly scrollTop: number;
}

/**
 * Pointer position in iframe document coordinates. Document space does not
 * depend on the sender's scroll offset or zoom, so every collaborator can
 * project it into their own stage.
 */
export function computeBroadcastDocPoint(
  pointer: BroadcastPointer,
  scroll: DocScroll,
): { readonly x: number; readonly y: number } {
  return {
    x: Math.round(pointer.clientX + scroll.scrollLeft),
    y: Math.round(pointer.clientY + scroll.scrollTop),
  };
}

/** `canvas` is the site root inside the preview iframe. */
export function useCanvasCursorBroadcast(
  canvas: HTMLElement | null,
  providerRef: React.RefObject<RealtimeProvider | null>,
  roomState: WSRoomState,
): void {
  useEffect(() => {
    if (!canvas || !providerRef.current) return;

    let lastX = HIDDEN_CURSOR.x;
    let lastY = HIDDEN_CURSOR.y;
    let lastSendTime = 0;

    const handleMouseMove = (event: MouseEvent): void => {
      const provider = providerRef.current;
      if (!provider?.isConnected()) return;

      const now = Date.now();
      if (now - lastSendTime < PRESENCE_SEND_THROTTLE_MS) return;

      const doc = canvas.ownerDocument;
      const scroller = doc.scrollingElement ?? doc.documentElement;
      const { x, y } = computeBroadcastDocPoint(event, scroller);

      if (
        lastX !== HIDDEN_CURSOR.x &&
        Math.abs(x - lastX) < TINY_CURSOR_DELTA_PX &&
        Math.abs(y - lastY) < TINY_CURSOR_DELTA_PX
      ) {
        return;
      }

      lastX = x;
      lastY = y;
      lastSendTime = now;
      provider.sendPresence(x, y);
    };

    const handleMouseLeave = (): void => {
      if (providerRef.current?.isConnected()) {
        providerRef.current.sendPresence(HIDDEN_CURSOR.x, HIDDEN_CURSOR.y);
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove, { passive: true });
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [canvas, providerRef, roomState]);
}
