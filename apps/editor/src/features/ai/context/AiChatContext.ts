import { createContext, useContext } from "react";
import type { AiPromptScope } from "@/features/ai/types";

/** A prompt handed to the chat from elsewhere in the editor (never auto-sent). */
export interface AiAskRequest {
  readonly prompt: string;
  readonly scope: AiPromptScope;
}

export interface AiPendingRequest extends AiAskRequest {
  /** Unique per askAi call, so asking the same thing twice still applies. */
  readonly nonce: number;
}

export interface AiContextType {
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  /** Opens the chat and queues a prompt + scope for the composer. */
  askAi: (request: AiAskRequest) => void;
  /** Waiting for the chat panel to apply it. */
  pendingRequest: AiPendingRequest | undefined;
  /** Clears the pending request when its nonce still matches. */
  consumePendingRequest: (nonce: number) => void;
}

export const AIChatContext = createContext<AiContextType | undefined>(
  undefined,
);

export function useAiChat(): AiContextType {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error("useAiContext must be used within an AiProvider");
  }
  return context;
}
