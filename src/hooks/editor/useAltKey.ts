"use client";

import { useState, useEffect } from "react";
import type React from "react";

export function useAltKey(
  iframeRef?: React.RefObject<HTMLIFrameElement>,
): boolean {
  const [altPressed, setAltPressed] = useState(false);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
    };

    document.addEventListener("keydown", onDown, true);
    document.addEventListener("keyup", onUp, true);

    const iframeDoc = iframeRef?.current?.contentDocument ?? null;
    iframeDoc?.addEventListener("keydown", onDown, true);
    iframeDoc?.addEventListener("keyup", onUp, true);

    return () => {
      document.removeEventListener("keydown", onDown, true);
      document.removeEventListener("keyup", onUp, true);
      iframeDoc?.removeEventListener("keydown", onDown, true);
      iframeDoc?.removeEventListener("keyup", onUp, true);
    };
  }, [iframeRef]);

  return altPressed;
}
