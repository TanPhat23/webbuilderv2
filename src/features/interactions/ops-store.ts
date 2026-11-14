// src/features/interactions/ops-store.ts
/**
 * Applies an op to the editor's element store. Going through updateElement
 * gives undo/redo, collaborator sync and server persistence for free; the
 * store sends removed interaction keys as null so the server drops them.
 */
import type { EditorElement } from "@/types/global.type";
import { useElementStore } from "@/features/editor/store/element-store";
import { elementHelper } from "@/features/editor/utils/element/elementhelper";
import { addInteraction, removeInteraction, updateInteraction, type OpOptions, type OpResult } from "./ops";
import { setVariable, removeVariable, setFlow, removeFlow } from "./logic";
import { mergedLogic, useLogicStore, type LogicScope, type RemoteScope } from "./logic-store";
import { describe as describePage } from "./describe";
import type { Interaction, OnEvent, Step } from "./schema";
import type { VariableDef } from "./runtime/variables";

export interface ElementStoreLike {
  getState(): {
    elements: unknown[];
    activePage?: { projectId: string; pageId: string } | null;
    updateElement(id: string, patch: Partial<EditorElement>): unknown;
  };
}

/** Validated store operations shared by the editor and future integrations. */
export function createOperations(elements: ElementStoreLike = useElementStore as unknown as ElementStoreLike, logic = useLogicStore) {
  const missing = (name: string) => ({ ok: false as const, issues: [{ path: name, message: "No such definition in this page or project.", level: "error" as const }] });
  const scopeOf = (pageId: string, kind: "variables" | "flows", name: string): LogicScope | null => {
    const state = logic.getState();
    if (Object.hasOwn(state.project[kind], name)) return "project";
    if (Object.hasOwn(state.pages[pageId]?.[kind] ?? {}, name)) return { page: pageId };
    return null;
  };
  return {
    editLogic: (scope: LogicScope, change: Parameters<ReturnType<typeof logic.getState>["edit"]>[1], opts: OpOptions = {}) => logic.getState().edit(scope, change, opts),
    addInteraction: (id: string, on: OnEvent, steps: Step[] = [], opts: OpOptions = {}) => commit(id, (el) => addInteraction(el, on, steps, opts), elements),
    updateInteraction: (id: string, ixId: string, patch: Partial<Interaction>, opts: OpOptions = {}) => commit(id, (el) => updateInteraction(el, ixId, patch, opts), elements),
    removeInteraction: (id: string, ixId: string) => commit(id, (el) => removeInteraction(el, ixId), elements),
    setVariable: (scope: LogicScope, name: string, def: VariableDef) => logic.getState().edit(scope, (doc) => setVariable(doc, name, def)),
    setFlow: (scope: LogicScope, name: string, steps: Step[], opts: OpOptions = {}) => logic.getState().edit(scope, (doc) => setFlow(doc, name, steps), opts),
    removeVariable: (pageId: string, name: string) => {
      const scope = scopeOf(pageId, "variables", name);
      return scope ? logic.getState().edit(scope, (doc) => removeVariable(doc, name), { allowIncomplete: true }) : missing(name);
    },
    removeFlow: (pageId: string, name: string) => {
      const scope = scopeOf(pageId, "flows", name);
      return scope ? logic.getState().edit(scope, (doc) => removeFlow(doc, name), { allowIncomplete: true }) : missing(name);
    },
    moveLogic: (pageId: string, kind: "variable" | "flow", name: string, to: RemoteScope) => logic.getState().move(pageId, kind, name, to),
    describe: (pageId: string) => {
      const state = elements.getState();
      if (state.activePage?.pageId !== pageId || state.activePage.projectId !== logic.getState().projectId) return missing(pageId);
      return { ok: true as const, description: describePage(pageId, state.elements as EditorElement[], mergedLogic(logic.getState(), pageId)) };
    },
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
