// src/features/interactions/ops-store.ts
/**
 * Applies an op to the editor's element store. Going through updateElement
 * gives undo/redo, collaborator sync and server persistence for free; the
 * store sends removed interaction keys as null so the server drops them.
 */
import type { EditorElement } from "@/types/global.type";
import { useElementStore } from "@/features/editor/store/element-store";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import type { OpResult } from "./ops";

export interface ElementStoreLike {
  getState(): {
    elements: unknown[];
    updateElement(id: string, patch: Partial<EditorElement>): unknown;
  };
}

export function commit(
  elementId: string,
  change: (el: EditorElement) => OpResult,
  store: ElementStoreLike = useElementStore as unknown as ElementStoreLike,
): OpResult {
  const state = store.getState();
  const el = elementHelper.findById(state.elements as EditorElement[], elementId) as
    | EditorElement
    | undefined;
  if (!el) {
    return {
      ok: false,
      issues: [{ path: elementId, message: "element not found", level: "error" }],
    };
  }
  const result = change(el);
  if (result.ok) {
    state.updateElement(elementId, { settings: result.settings } as Partial<EditorElement>);
  }
  return result;
}
