import { useEffect, type RefObject } from "react";
import { isChromeShortcut, isTypingTarget } from "./isTypingTarget";

/**
 * Key events inside the canvas iframe never reach the parent document, where
 * the chrome shortcuts listen. Re-dispatch those few keys on the parent.
 */
export function useForwardChromeShortcuts(
  iframeRef: RefObject<HTMLIFrameElement | null> | undefined,
) {
  useEffect(() => {
    const iframe = iframeRef?.current;
    if (!iframe) return;
    let iframeDoc: Document | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target) || !isChromeShortcut(e)) return;
      e.preventDefault();
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: e.key,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          bubbles: true,
          cancelable: true,
        }),
      );
    };

    const attach = () => {
      try {
        iframeDoc?.removeEventListener("keydown", onKey);
        iframeDoc = iframe.contentDocument;
        iframeDoc?.addEventListener("keydown", onKey);
      } catch {
        // cross-origin iframe: nothing to forward
      }
    };

    iframe.addEventListener("load", attach);
    if (iframe.contentDocument?.readyState === "complete") attach();

    return () => {
      iframe.removeEventListener("load", attach);
      try {
        iframeDoc?.removeEventListener("keydown", onKey);
      } catch {
        // ignore cross-origin cleanup errors
      }
    };
  }, [iframeRef]);
}
