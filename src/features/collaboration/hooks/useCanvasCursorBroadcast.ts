import type React from "react";
import { useEffect } from "react";
import type { WSRoomState } from "../interfaces/websocket";
import type { RealtimeProvider } from "../lib/realtime/RealtimeProvider";
import {
  HIDDEN_CURSOR,
  PRESENCE_SEND_THROTTLE_MS,
  TINY_CURSOR_DELTA_PX,
} from "../lib/presenceSync";

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

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

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
