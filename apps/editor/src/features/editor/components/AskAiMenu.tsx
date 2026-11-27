import { MessageCircleQuestion, Sparkles } from "lucide-react";
import {
  ContextMenuItem,
  ContextMenuPortal,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { useAskAiOptions } from "@/features/editor/context/AskAiOptionsContext";
import { getSelectedElement } from "@/features/editor/store/selected-element";

/**
 * "Ask AI" submenu: queues a prompt in the chat composer for the selected
 * element. Renders nothing where no AI chat is mounted.
 */
export function AskAiMenu({ container, editable }: { container: HTMLElement; editable: boolean }) {
  const options = useAskAiOptions();
  if (!options) return null;

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger className="gap-2" data-action="ask-ai" disabled={!editable}>
        <Sparkles />
        Ask AI
      </ContextMenuSubTrigger>
      <ContextMenuPortal container={container}>
        <ContextMenuSubContent className="max-w-72">
          {options.map((option) => (
            <ContextMenuItem
              key={option.id}
              data-action={`ask-ai-${option.id}`}
              disabled={!editable}
              onSelect={() => option.run(getSelectedElement())}
            >
              {option.id === "custom" && <MessageCircleQuestion />}
              {option.label}
            </ContextMenuItem>
          ))}
        </ContextMenuSubContent>
      </ContextMenuPortal>
    </ContextMenuSub>
  );
}
