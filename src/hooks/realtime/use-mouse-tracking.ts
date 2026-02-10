"use client";

import { useEffect, useRef, useCallback } from "react";
import { SendMessagePayload, WS_MESSAGE } from "@/interfaces/websocket";

interface UseMouseTrackingOptions {
  canvasRef: React.RefObject<HTMLElement | null>;
  sendMessage: (message: SendMessagePayload) => boolean;
  userId: string;
  userName?: string;
  enabled?: boolean;
}

export function useMouseTracking({
  canvasRef,
  sendMessage,
  userId,
  userName,
  enabled = true,
}: UseMouseTrackingOptions) {
  const lastSentRef = useRef<{ x: number; y: number } | null>(null);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!enabled || !canvasRef.current || !userId) {
        return;
      }

      const rect = canvasRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (throttleRef.current) return;

      if (
        lastSentRef.current &&
        Math.abs(lastSentRef.current.x - x) < 5 &&
        Math.abs(lastSentRef.current.y - y) < 5
      ) {
        return;
      }

      lastSentRef.current = { x, y };

      const message: SendMessagePayload = {
        type: WS_MESSAGE.PRESENCE,
        payload: {
          userId,
          userName: userName || userId,
          cursorX: x,
          cursorY: y,
        },
      };
      sendMessage(message);

      throttleRef.current = setTimeout(() => {
        throttleRef.current = null;
      }, 100);
    },
    [canvasRef, sendMessage, userId, userName, enabled],
  );

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas || !enabled) return;

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }
    };
  }, [canvasRef, handleMouseMove, enabled, userId]);
}
