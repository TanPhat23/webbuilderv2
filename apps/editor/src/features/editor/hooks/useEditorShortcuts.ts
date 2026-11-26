import { useEffect, useRef } from "react";
import { ElementKeyboardActions } from "@/features/editor/lib/keyBoardEvents";
import { SelectionStore } from "@/features/editor/store/selection-store";
import { isTypingTarget } from "@/features/editor/components/layout/isTypingTarget";

interface UseEditorShortcutsOptions {
  /** Canvas stage; its owner document also receives shortcuts. */
  stageRef?: React.RefObject<HTMLElement | null>;
  /** Mount node inside the preview iframe; its owner document receives shortcuts. */
  mountNode?: HTMLElement | null;
  /** @deprecated legacy EditorCanvas wiring, removed with it. */
  canvasRef?: React.RefObject<HTMLDivElement | null>;
  /** @deprecated legacy EditorCanvas wiring, removed with it. */
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
  isReadOnly?: boolean;
  isLocked?: boolean;
}

export function useEditorShortcuts({
  stageRef,
  mountNode,
  iframeRef,
  isReadOnly = false,
  isLocked = false,
}: UseEditorShortcutsOptions): { keyboardActions: ElementKeyboardActions } {
  const keyboardEventRef = useRef(new ElementKeyboardActions());

  useEffect(() => {
    keyboardEventRef.current.setReadOnly(isReadOnly);
    keyboardEventRef.current.setLocked(isLocked);
  }, [isReadOnly, isLocked]);

  useEffect(() => {
    const kb = keyboardEventRef.current;

    const handleKeyDown = (e: KeyboardEvent): void => {
      const editing = SelectionStore.getState().editingElementId !== undefined;

      // Escape steps out of inline editing from anywhere (the editable node
      // itself is a typing target), but never steals Escape from other fields.
      if (e.key === "Escape") {
        if (!editing && isTypingTarget(e.target)) return;
        e.preventDefault();
        if (editing) {
          // Escape leaves text editing only; the element stays selected.
          // Blur first so the editable node commits its text.
          const doc = (e.target as Node | null)?.ownerDocument ?? document;
          const active = doc.activeElement;
          if (active && "blur" in active) (active as HTMLElement).blur();
          SelectionStore.getState().setEditingElementId(undefined);
          return;
        }
        kb.stepOutSelection();
        return;
      }

      if (editing || isTypingTarget(e.target)) return;

      const mod = e.ctrlKey || e.metaKey;
      if (mod) {
        const key = e.key.toLowerCase();
        if (key === "z" && e.shiftKey) {
          e.preventDefault();
          kb.redo();
          return;
        }
        switch (key) {
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
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        kb.deleteElement();
      }
    };

    const docs = new Set<Document>([document]);
    const candidates = [
      stageRef?.current?.ownerDocument,
      mountNode?.ownerDocument,
      iframeRef?.current?.contentDocument,
    ];
    for (const doc of candidates) {
      if (doc) docs.add(doc);
    }
    for (const doc of docs) doc.addEventListener("keydown", handleKeyDown);

    return () => {
      for (const doc of docs) doc.removeEventListener("keydown", handleKeyDown);
    };
  }, [stageRef, mountNode, iframeRef]);

  return {
    keyboardActions: keyboardEventRef.current,
  };
}
