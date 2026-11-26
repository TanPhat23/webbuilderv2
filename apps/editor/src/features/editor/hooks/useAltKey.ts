
import { useState, useEffect } from "react";
import type React from "react";

export function useAltKey(
  iframeRef?: React.RefObject<HTMLIFrameElement | null>,
): boolean {
  const [altPressed, setAltPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
    };
    const handleBlur = () => setAltPressed(false);

    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    const iframe = iframeRef?.current;
    if (!iframe) return;

    let iframeDoc: Document | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") setAltPressed(false);
    };
    const handleBlur = () => setAltPressed(false);

    const attach = () => {
      try {
        iframeDoc = iframe.contentDocument;
        if (!iframeDoc) return;
        iframeDoc.addEventListener("keydown", handleKeyDown, true);
        iframeDoc.addEventListener("keyup", handleKeyUp, true);
        iframeDoc.defaultView?.addEventListener("blur", handleBlur);
      } catch {
        // cross-origin iframe — skip
      }
    };

    iframe.addEventListener("load", attach);
    if (iframe.contentDocument?.readyState === "complete") attach();

    return () => {
      iframe.removeEventListener("load", attach);
      try {
        iframeDoc?.removeEventListener("keydown", handleKeyDown, true);
        iframeDoc?.removeEventListener("keyup", handleKeyUp, true);
        iframeDoc?.defaultView?.removeEventListener("blur", handleBlur);
      } catch {
        // ignore cross-origin cleanup errors
      }
    };
  }, [iframeRef]);

  return altPressed;
}
