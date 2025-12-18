"use client";

import { useCallback, useRef, useEffect } from "react";

interface UseAwarenessMouseTrackingProps {
  provider: any; // CustomYjsProvider
  enabled?: boolean;
}

/**
 * Hook to update awareness cursor position when mouse moves
 * Sends cursor position to Yjs awareness so other clients can see remote cursors
 */
export function useAwarenessMouseTracking({
  provider,
  enabled = true,
}: UseAwarenessMouseTrackingProps) {
  const lastSentRef = useRef<{ x: number; y: number } | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const updateAwarenessPosition = useCallback(
    (x: number, y: number) => {
      if (!enabled || !provider?.awareness) {
        return;
      }

      // Only send if position changed significantly (> 3px)
      if (
        lastSentRef.current &&
        Math.abs(lastSentRef.current.x - x) < 3 &&
        Math.abs(lastSentRef.current.y - y) < 3
      ) {
        return;
      }

      lastSentRef.current = { x, y };

      // Debounce to avoid excessive updates
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      try {
        provider.awareness.setLocalStateField("cursor", { x, y });
        console.log("[useAwarenessMouseTracking] Updated cursor position:", {
          x,
          y,
        });
      } catch (err) {
        console.error(
          "[useAwarenessMouseTracking] Error updating cursor position:",
          err,
        );
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
      }, 100);
    },
    [provider?.awareness, enabled],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return updateAwarenessPosition;
}
