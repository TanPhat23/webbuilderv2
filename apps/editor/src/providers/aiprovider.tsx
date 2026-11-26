import React from "react";
import { AIChatContext, useAiChat } from "@/features/ai/context/AiChatContext";

export { useAiChat };

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
