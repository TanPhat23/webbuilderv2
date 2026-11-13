import type { EditorElement } from "@/types/global.type";
import { ElementTreeHelper } from "@/features/editor/utils/element/element-tree-helper";
import type { MoveData } from "@/features/editor/store/element-store";
import type { CustomYjsProviderV2 } from "./Provider";

type Op = "update" | "delete" | "create" | "move";

/**
 * Sends one local element operation (what the element store reports through
 * its collaborative callback) to the realtime server. Shared by the editor's
 * collaboration provider and the integration tests, so both run the same code.
 *
 * `pendingMoves` drops a move for an element whose previous move is still in
 * flight.
 */
export async function sendElementOp(
  provider: Pick<
    CustomYjsProviderV2,
    "updateElement" | "deleteElement" | "createElement" | "moveElement"
  >,
  getElements: () => EditorElement[],
  pendingMoves: Set<string>,
  type: Op,
  id: string | undefined,
  data: unknown,
): Promise<void> {
  if (type === "update" && id && data) {
    await provider.updateElement(id, data as Partial<EditorElement>);
  } else if (type === "delete" && id) {
    await provider.deleteElement(id);
  } else if (type === "create" && data) {
    const el = data as EditorElement;
    const location = ElementTreeHelper.findLocation(getElements(), el.id);
    await provider.createElement(
      el,
      location?.parentId ?? el.parentId ?? null,
      location?.index,
    );
  } else if (type === "move" && data) {
    const move = data as MoveData;
    if (pendingMoves.has(move.elementId)) return;
    pendingMoves.add(move.elementId);
    try {
      await provider.moveElement(
        move.elementId,
        move.newParentId,
        move.newPosition,
      );
    } finally {
      pendingMoves.delete(move.elementId);
    }
  }
}
