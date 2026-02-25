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
    const onBlur = () => setAltPressed(false);

    document.addEventListener("keydown", onDown, true);
    document.addEventListener("keyup", onUp, true);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("keydown", onDown, true);
      document.removeEventListener("keyup", onUp, true);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef?.current;
    if (!iframe) return;

    let iframeDoc: Document | null = null;

    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
    };
    const onBlur = () => setAltPressed(false);

    const attach = () => {
      try {
        iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        iframeDoc.addEventListener("keydown", onDown, true);
        iframeDoc.addEventListener("keyup", onUp, true);
        iframeDoc.defaultView?.addEventListener("blur", onBlur);
      } catch {
        // cross-origin iframe — skip
      }
    };

    iframe.addEventListener("load", attach);
    if (iframe.contentDocument?.readyState === "complete") attach();

    return () => {
      iframe.removeEventListener("load", attach);
      try {
        iframeDoc?.removeEventListener("keydown", onDown, true);
        iframeDoc?.removeEventListener("keyup", onUp, true);
        iframeDoc?.defaultView?.removeEventListener("blur", onBlur);
      } catch {
        // ignore cross-origin cleanup errors
      }
    };
  }, [iframeRef]);

  return altPressed;
}
