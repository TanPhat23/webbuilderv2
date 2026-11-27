import React from "react";
import {
  AIChatContext,
  useAiChat,
  type AiAskRequest,
  type AiContextType,
  type AiPendingRequest,
} from "@/features/ai/context/AiChatContext";
import { buildAskAiOptions } from "@/features/ai/utils/askAiOptions";
import { AskAiOptionsContext } from "@/features/editor/context/AskAiOptionsContext";

export { useAiChat };

export default function AIChatProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [chatOpen, setChatOpen] = React.useState(false);
  const [pendingRequest, setPendingRequest] = React.useState<AiPendingRequest>();
  const nonceRef = React.useRef(0);

  const openChat = () => setChatOpen(true);
  const closeChat = () => setChatOpen(false);
  const toggleChat = () => setChatOpen((prev) => !prev);

  const askAi = React.useCallback((request: AiAskRequest) => {
    nonceRef.current += 1;
    setPendingRequest({ ...request, nonce: nonceRef.current });
    setChatOpen(true);
  }, []);
  const consumePendingRequest = React.useCallback((nonce: number) => {
    setPendingRequest((current) => (current?.nonce === nonce ? undefined : current));
  }, []);

  const askAiOptions = React.useMemo(() => buildAskAiOptions(askAi), [askAi]);

  const value: AiContextType = {
    chatOpen,
    openChat,
    closeChat,
    toggleChat,
    askAi,
    pendingRequest,
    consumePendingRequest,
  };

  return (
    <AIChatContext.Provider value={value}>
      <AskAiOptionsContext.Provider value={askAiOptions}>{children}</AskAiOptionsContext.Provider>
    </AIChatContext.Provider>
  );
}
