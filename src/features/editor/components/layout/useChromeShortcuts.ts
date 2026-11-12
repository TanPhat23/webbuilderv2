import { useEffect, useRef } from "react";
import { useEditorChromeStore } from "@/features/editor/store/editor-chrome-store";
import { isTypingTarget } from "./isTypingTarget";

/**
 * ⌘/Ctrl+\ toggles the left panel, ⌘/Ctrl+. the inspector, `?` shows the
 * shortcuts dialog. Ignored while typing.
 */
export function useChromeShortcuts({
  onShowShortcuts,
}: { onShowShortcuts?: () => void } = {}) {
  const showRef = useRef(onShowShortcuts);
  showRef.current = onShowShortcuts;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "\\") {
        e.preventDefault();
        useEditorChromeStore.getState().togglePanel();
      } else if (mod && e.key === ".") {
        e.preventDefault();
        useEditorChromeStore.getState().toggleInspector();
      } else if (!mod && e.key === "?" && showRef.current) {
        e.preventDefault();
        showRef.current();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
}
