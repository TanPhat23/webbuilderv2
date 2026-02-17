"use client";
import React from "react";
interface AiContextType {
  chatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
}

const AIChatContext = React.createContext<AiContextType | undefined>(undefined);

export function useAiChat() {
  const context = React.useContext(AIChatContext);
  if (!context) {
    throw new Error("useAiContext must be used within an AiProvider");
  }
  return context;
}

export default function AIChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = React.useState(false);

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const toggleChat = () => setChatOpen((prev) => !prev);

  return (
    <AIChatContext.Provider
      value={{ chatOpen, openChat, closeChat, toggleChat }}
    >
      {children}
    </AIChatContext.Provider>
  );
}
