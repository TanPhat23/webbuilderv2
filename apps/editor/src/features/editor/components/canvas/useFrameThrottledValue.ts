import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A value that pointermove/dragover handlers set at event rate but that only
 * commits to React state once per animation frame. Setting `null` commits at
 * once (the drag ended) and drops any pending frame.
 */
export function useFrameThrottledValue(): readonly [
  number | null,
  (value: number | null) => void,
] {
  const [value, setValue] = useState<number | null>(null);
  const latestRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const set = useCallback((next: number | null): void => {
    latestRef.current = next;
    if (next === null) {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      setValue(null);
      return;
    }
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      setValue(latestRef.current);
    });
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    },
    [],
  );

  return [value, set];
}
