import { useEffect, useRef } from "react";
import { ElementKeyboardActions } from "@/features/editor/lib/keyBoardEvents";
import { SelectionStore } from "@/features/editor/store/selection-store";
import { isTypingTarget } from "@/features/editor/components/layout/isTypingTarget";
import { openElementContextMenu } from "@/features/editor/components/canvas/openElementContextMenu";

const OVERLAY_SELECTOR =
  "[role=dialog],[role=menu],[role=listbox],[role=menuitem]";

function isNode(target: EventTarget | null): target is Node {
  return (
    target !== null &&
    typeof target === "object" &&
    typeof (target as Node).nodeType === "number"
  );
}

/** The document a node lives in (a Document is its own owner). */
function documentOf(node: Node): Document | null {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument;
}

/** True when the event comes from inside a dialog, menu, listbox or menu item. */
function isInsideOverlay(target: EventTarget | null): boolean {
  if (!isNode(target)) return false;
  const el = target.nodeType === 1 ? (target as Element) : target.parentElement;
  return el?.closest(OVERLAY_SELECTOR) != null;
}

/**
 * True when a key event belongs to the canvas: it comes from the iframe
 * document, from inside the stage, or from nowhere in particular (body).
 */
function isCanvasKeyTarget(
  target: EventTarget | null,
  stage: HTMLElement | null | undefined,
  parentDoc: Document,
): boolean {
  if (!isNode(target)) return false;
  const doc = documentOf(target);
  if (doc && doc !== parentDoc) return true;
  if (
    target === parentDoc ||
    target === parentDoc.body ||
    target === parentDoc.documentElement
  ) {
    return true;
  }
  return stage?.contains(target) ?? false;
}

/** Shift+F10 or the ContextMenu key: the keyboard way to open the context menu. */
function isContextMenuKey(e: KeyboardEvent): boolean {
  if (e.ctrlKey || e.metaKey || e.altKey) return false;
  return e.key === "ContextMenu" || (e.key === "F10" && e.shiftKey);
}

/** True when the user has text selected somewhere other than the canvas. */
function hasForeignTextSelection(
  target: EventTarget | null,
  stage: HTMLElement | null | undefined,
  parentDoc: Document,
): boolean {
  const targetDoc = isNode(target) ? documentOf(target) : null;
  // Text selected inside the iframe is canvas text.
  if (targetDoc && targetDoc !== parentDoc) return false;
  const selection = (parentDoc.defaultView ?? window).getSelection?.();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    return false;
  }
  const anchor = selection.anchorNode;
  return !(anchor && stage?.contains(anchor));
}

interface UseEditorShortcutsOptions {
  /** Canvas stage; its owner document also receives shortcuts. */
  stageRef?: React.RefObject<HTMLElement | null>;
  /** Mount node inside the preview iframe; its owner document receives shortcuts. */
  mountNode?: HTMLElement | null;
  isReadOnly?: boolean;
  isLocked?: boolean;
  /** False when no context menu is mounted for this user (viewers). */
  contextMenuEnabled?: boolean;
}

export function useEditorShortcuts({
  stageRef,
  mountNode,
  isReadOnly = false,
  isLocked = false,
  contextMenuEnabled = true,
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
      const parentDoc = stageRef?.current?.ownerDocument ?? document;

      // Someone else (a dialog, a menu, a field's own handler) already took it.
      if (e.defaultPrevented || isInsideOverlay(e.target)) return;
      // Escape ends inline editing from wherever focus is; everything else
      // only acts on the canvas, never on sidebars, toolbars or the page.
      const canvasScoped = isCanvasKeyTarget(
        e.target,
        stageRef?.current,
        parentDoc,
      );
      if (!canvasScoped && !(editing && e.key === "Escape")) return;

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

      if (isContextMenuKey(e)) {
        if (!contextMenuEnabled) return;
        const selectedId = SelectionStore.getState().selectedElementId;
        if (!selectedId) return;
        // The site nodes live in the iframe document, or in this one in tests.
        const siteDoc =
          mountNode?.ownerDocument ??
          stageRef?.current?.querySelector("iframe")?.contentDocument ??
          parentDoc;
        if (openElementContextMenu(siteDoc, selectedId)) e.preventDefault();
        return;
      }

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
            if (hasForeignTextSelection(e.target, stageRef?.current, parentDoc)) {
              return;
            }
            e.preventDefault();
            kb.copyElement();
            break;
          case "v":
            e.preventDefault();
            kb.pasteElement();
            break;
          case "x":
            if (hasForeignTextSelection(e.target, stageRef?.current, parentDoc)) {
              return;
            }
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
    ];
    for (const doc of candidates) {
      if (doc) docs.add(doc);
    }
    for (const doc of docs) doc.addEventListener("keydown", handleKeyDown);

    return () => {
      for (const doc of docs) doc.removeEventListener("keydown", handleKeyDown);
    };
  }, [stageRef, mountNode, contextMenuEnabled]);

  return {
    keyboardActions: keyboardEventRef.current,
  };
}
