import type { AskAiOption } from "@/features/editor/context/AskAiOptionsContext";
import type { AiAskRequest } from "@/features/ai/context/AiChatContext";
import { ELEMENT_STARTER_ACTIONS, toAiElementContext } from "./aiChatUtils";

/** Menu options for the element starter actions plus a free-form question. */
export function buildAskAiOptions(
  askAi: (request: AiAskRequest) => void,
): readonly AskAiOption[] {
  const starters = ELEMENT_STARTER_ACTIONS.map(
    (starter): AskAiOption => ({
      id: starter.id,
      label: starter.label,
      run: (element) =>
        askAi({
          prompt: element ? starter.buildPrompt(toAiElementContext(element)) : "",
          scope: starter.scope,
        }),
    }),
  );
  return [
    ...starters,
    {
      id: "custom",
      label: "Ask about this element…",
      run: () => askAi({ prompt: "", scope: "element" }),
    },
  ];
}
