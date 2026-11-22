import { createContext, useContext } from "react";

export interface AiContextType {
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
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
