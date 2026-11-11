import { useEffect, useRef } from "react";
import { ElementKeyboardActions } from "@/features/editor/utils/element/keyBoardEvents";

interface UseEditorShortcutsOptions {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  isReadOnly?: boolean;
  isLocked?: boolean;
}

export function useEditorShortcuts({
  canvasRef,
  iframeRef,
  isReadOnly = false,
  isLocked = false,
}: UseEditorShortcutsOptions) {
  const keyboardEventRef = useRef(new ElementKeyboardActions());

  useEffect(() => {
    keyboardEventRef.current.setReadOnly(isReadOnly);
    keyboardEventRef.current.setLocked(isLocked);
  }, [isReadOnly, isLocked]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const kb = keyboardEventRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "c":
            e.preventDefault();
            kb.copyElement();
            break;
          case "v":
            e.preventDefault();
            kb.pasteElement();
            break;
          case "x":
            e.preventDefault();
            kb.cutElement();
            break;
          case "z":
            e.preventDefault();
            kb.undo();
            break;
          case "y":
            e.preventDefault();
            kb.redo();
            break;
        }
      } else if (e.key === "Delete") {
        e.preventDefault();
        kb.deleteElement();
      } else if (e.key === "Escape") {
        e.preventDefault();
        kb.deselectAll();
      }
    };

    canvas.addEventListener("keydown", handleKeyDown);

    let iframeDoc: Document | null = null;
    if (iframeRef?.current?.contentDocument) {
      iframeDoc = iframeRef.current.contentDocument;
      iframeDoc.addEventListener("keydown", handleKeyDown, true);
    }

    return () => {
      canvas.removeEventListener("keydown", handleKeyDown);
      if (iframeDoc) {
        iframeDoc.removeEventListener("keydown", handleKeyDown, true);
      }
    };
  }, [canvasRef, iframeRef]);

  return {
    keyboardActions: keyboardEventRef.current,
  };
}
