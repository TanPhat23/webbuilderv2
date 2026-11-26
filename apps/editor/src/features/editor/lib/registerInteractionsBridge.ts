import { registerInteractionsEditorAdapter } from "@/features/interactions/editor-bridge";
import { ElementStore } from "../store/element-store";
import { useElements } from "../store/selectors/element-selectors";
import {
  useSelectedElement,
  useSetSelectedElement,
} from "../store/selectors/selection-selectors";

let registered = false;

export function ensureInteractionsEditorBridge(): void {
  if (registered) return;
  registered = true;
  registerInteractionsEditorAdapter({
    elementStore: ElementStore,
    useElements,
    useSelectedElement,
    useSetSelectedElement,
  });
}
