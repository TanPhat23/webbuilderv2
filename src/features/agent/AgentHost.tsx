import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { ElementStore } from "@/features/editor/store/element-store";
import { useSelectionStore } from "@/features/editor/store/selection-store";
import { useEditorFlagsOptional } from "@/features/editor/components/context/EditorFlagsContext";
import { useActiveLogic } from "@/features/interactions/logic-hooks";
import { loadPreamble, savePreamble } from "@/features/editor/lib/code/customCode";
import { elementService } from "@/features/editor/services/element.service";
import { registerAgentHost } from "./runtime";
import { useAgentActivity } from "./activity";

/**
 * Registers this editor as the place CLI tool calls run. Renders nothing.
 * Mount it once, inside the editor's flags provider (it reads canEdit).
 */
export function AgentHost() {
  const canEdit = useEditorFlagsOptional()?.canEdit ?? false;
  const logic = useActiveLogic();
  const live = useRef({ canEdit, logic });
  live.current = { canEdit, logic };

  useEffect(() => {
    const pageOf = () => live.current.logic.pageId ?? undefined;
    registerAgentHost({
      getElements: () => ElementStore.getState().elements,
      getPageId: pageOf,
      canEdit: () => live.current.canEdit,
      replaceTree: (next) => {
        useAgentActivity.getState().mark(true);
        ElementStore.getState().replaceTree(next);
      },
      getSelectedId: () => useSelectionStore.getState().selectedElementId,
      generateCode: async () => {
        const { variables, flows, pageId } = live.current.logic;
        const result = await elementService.generateCode(ElementStore.getState().elements, {}, { variables, flows }, loadPreamble(pageId ?? undefined));
        return result.code;
      },
      getPreamble: () => loadPreamble(pageOf()),
      setPreamble: (next) => savePreamble(pageOf(), next),
      notifyChanged: (summary) => {
        useAgentActivity.getState().mark(false);
        toast("Your CLI changed the page", {
          description: summary,
          action: { label: "Undo", onClick: () => ElementStore.getState().undo() },
        });
      },
    });
    return () => registerAgentHost(null);
  }, []);

  return null;
}
