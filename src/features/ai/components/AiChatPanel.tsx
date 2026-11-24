import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  MessageSquare,
  PanelLeftClose,
  Sparkles,
  SquarePen,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAgentActivity } from "@/features/agent/activity";
import { connectionStatus } from "@/features/agent/connectCommands";
import { useAiChat } from "@/features/ai/context/AiChatContext";
import { aiContentService } from "@/features/ai/services/aicontent.service";
import { useElements, useSelectedElementWithSetter } from "@/features/editor";
import { useEditorContext } from "@/features/editor/context/EditorContext";
import { cn } from "@/lib/utils";
import type {
  AiAttachment,
  AiCanvasContext,
  AiElementContext,
  AiMessage,
  AiPromptScope,
} from "../types";
import {
  buildGenerateContentRequest,
  countCanvasNodes,
  extractAiErrorMessage,
  validateAttachmentFile,
} from "../utils/aiChatUtils";
import { AiAgentTab } from "./AiAgentTab";
import { AiChatThread } from "./AiChatThread";
import { AiComposer } from "./AiComposer";

interface AiChatPanelProps {
  readonly onClose?: () => void;
}

function createId(prefix: string): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AiChatPanel({
  onClose,
}: AiChatPanelProps = {}): ReactElement {
  const { closeChat } = useAiChat();
  const { selectedElement, setSelectedElement } = useSelectedElementWithSetter();
  const elements = useElements();
  const { editor, mode } = useEditorContext();
  const agentLastAt = useAgentActivity((s) => s.lastAt);
  const agentEditing = useAgentActivity((s) => s.editing);

  const [activeTab, setActiveTab] = useState<"chat" | "agent">("chat");
  const [messages, setMessages] = useState<readonly AiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState<readonly AiAttachment[]>([]);
  const [preferredScope, setPreferredScope] = useState<AiPromptScope | null>(null);
  const [isSending, setIsSending] = useState(false);

  const previewUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const urls = previewUrlsRef.current;
    return () => {
      for (const url of urls) {
        URL.revokeObjectURL(url);
      }
      urls.clear();
    };
  }, []);

  const elementContext: AiElementContext | undefined = useMemo(() => {
    if (!selectedElement) return undefined;
    return {
      id: selectedElement.id,
      type: selectedElement.type,
      name: selectedElement.name,
      content:
        typeof selectedElement.content === "string"
          ? selectedElement.content
          : undefined,
      tailwindStyles:
        typeof selectedElement.tailwindStyles === "string"
          ? selectedElement.tailwindStyles
          : undefined,
    };
  }, [selectedElement]);

  const effectiveScope: AiPromptScope = useMemo(() => {
    if (preferredScope === "element" && !elementContext) {
      return "page";
    }
    if (preferredScope) {
      return preferredScope;
    }
    return elementContext ? "element" : "page";
  }, [elementContext, preferredScope]);

  const canvasContext: AiCanvasContext = useMemo(() => {
    const counts = countCanvasNodes(elements);
    return {
      viewport: editor.currentView,
      mode,
      sectionCount: counts.sectionCount,
      totalNodeCount: counts.totalNodeCount,
    };
  }, [editor.currentView, elements, mode]);

  const mcpStatus = connectionStatus(agentEditing, agentLastAt);
  const mcpConnected = mcpStatus.label !== "Not connected";

  const handleAddFiles = useCallback(
    (files: readonly File[]): void => {
      const next: AiAttachment[] = [];
      let count = attachments.length;

      for (const file of files) {
        const validation = validateAttachmentFile(file, count);
        if (!validation.ok) {
          toast.error(validation.reason);
          break;
        }
        const isImage = file.type.startsWith("image/");
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
        if (previewUrl) {
          previewUrlsRef.current.add(previewUrl);
        }
        next.push({
          id: createId("att"),
          name: file.name,
          size: file.size,
          mimeType: file.type,
          isImage,
          previewUrl,
        });
        count += 1;
      }

      if (next.length > 0) {
        setAttachments((prev) => [...prev, ...next]);
      }
    },
    [attachments.length],
  );

  const handleRemoveAttachment = useCallback((id: string): void => {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
        previewUrlsRef.current.delete(target.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
  }, []);

  const dispatchGeneration = useCallback(
    async (
      assistantId: string,
      prompt: string,
      scope: AiPromptScope,
      contextElement?: AiElementContext,
      turnAttachments?: readonly AiAttachment[],
    ): Promise<void> => {
      setIsSending(true);
      try {
        const request = buildGenerateContentRequest({
          prompt,
          scope,
          canvasContext,
          elementContext: scope === "element" ? contextElement : undefined,
          attachments: turnAttachments,
        });
        const response = await aiContentService.generateContent(request);
        const text =
          response.content?.trim() ||
          (response.html ? "Generated HTML snippet below." : "Done.");

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  content: text,
                  html: response.html,
                  status: "complete",
                  errorMessage: undefined,
                }
              : msg,
          ),
        );
      } catch (error: unknown) {
        const errorMessage = extractAiErrorMessage(error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? {
                  ...msg,
                  status: "error",
                  errorMessage,
                }
              : msg,
          ),
        );
      } finally {
        setIsSending(false);
      }
    },
    [canvasContext],
  );

  const handleSend = useCallback((): void => {
    const trimmed = draft.trim();
    if (!trimmed || isSending) return;

    const activeContext =
      effectiveScope === "element" ? elementContext : undefined;
    const turnAttachments = attachments;
    const now = Date.now();
    const userMessage: AiMessage = {
      id: createId("user"),
      role: "user",
      content: trimmed,
      status: "complete",
      createdAt: now,
      scope: effectiveScope,
      elementContext: activeContext,
      attachments: turnAttachments.length > 0 ? turnAttachments : undefined,
    };
    const assistantId = createId("assistant");
    const pendingAssistant: AiMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      status: "pending",
      createdAt: now + 1,
    };

    setMessages((prev) => [...prev, userMessage, pendingAssistant]);
    setDraft("");
    setAttachments([]);

    void dispatchGeneration(
      assistantId,
      trimmed,
      effectiveScope,
      activeContext,
      turnAttachments,
    );
  }, [
    attachments,
    dispatchGeneration,
    draft,
    effectiveScope,
    elementContext,
    isSending,
  ]);

  const handleRetryMessage = useCallback(
    (assistantMessageId: string): void => {
      if (isSending) return;
      const targetIndex = messages.findIndex((msg) => msg.id === assistantMessageId);
      if (targetIndex <= 0) return;

      const precedingUser = [...messages.slice(0, targetIndex)]
        .reverse()
        .find((msg) => msg.role === "user");
      if (!precedingUser) return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                status: "pending",
                content: "",
                html: undefined,
                errorMessage: undefined,
              }
            : msg,
        ),
      );

      void dispatchGeneration(
        assistantMessageId,
        precedingUser.content,
        precedingUser.scope ?? "page",
        precedingUser.elementContext,
        precedingUser.attachments,
      );
    },
    [dispatchGeneration, isSending, messages],
  );

  const handleNewChat = useCallback((): void => {
    for (const url of previewUrlsRef.current) {
      URL.revokeObjectURL(url);
    }
    previewUrlsRef.current.clear();
    setMessages([]);
    setDraft("");
    setAttachments([]);
  }, []);

  const handleClose = useCallback((): void => {
    closeChat();
    onClose?.();
  }, [closeChat, onClose]);

  return (
    <div className="bg-card text-card-foreground flex h-full w-full flex-col overflow-hidden">
      <div className="border-border flex h-10 shrink-0 items-center justify-between gap-2 border-b pr-1.5 pl-3">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="text-primary size-3.5 shrink-0" />
          <span className="truncate text-xs font-semibold">Canvas Copilot</span>
          {mcpConnected && (
            <Badge
              variant="secondary"
              className="h-4 gap-1 px-1.5 font-mono text-[9px] font-normal"
            >
              <span
                className={cn(
                  "bg-primary size-1.5 rounded-full",
                  agentEditing && "animate-pulse",
                )}
              />
              {agentEditing ? "Editing" : "MCP"}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-0.5">
          {messages.length > 0 && activeTab === "chat" && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="New conversation"
              title="New conversation"
              disabled={isSending}
              onClick={handleNewChat}
              className="text-muted-foreground hover:text-foreground size-6"
            >
              <SquarePen className="size-3.5" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close AI assistant"
            title="Collapse panel"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground size-6"
          >
            <PanelLeftClose className="size-3.5" />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(next) => {
          if (next === "chat" || next === "agent") {
            setActiveTab(next);
          }
        }}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="border-border shrink-0 border-b px-3 py-1.5">
          <TabsList className="grid h-7 w-full grid-cols-2 p-0.5">
            <TabsTrigger value="chat" className="gap-1.5 text-[11px]">
              <MessageSquare className="size-3" />
              <span>Chat</span>
              {messages.length > 0 && (
                <Badge
                  variant="secondary"
                  className="h-4 min-w-4 px-1 text-[10px] font-normal"
                >
                  {messages.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-1.5 text-[11px]">
              <Terminal className="size-3" />
              <span>MCP Agent</span>
              {mcpConnected && <span className="bg-primary size-1.5 rounded-full" />}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chat"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AiChatThread
            messages={messages}
            canvasContext={canvasContext}
            selectedElement={elementContext}
            isSending={isSending}
            mcpConnected={mcpConnected}
            onSelectStarter={(prompt, scope) => {
              setDraft(prompt);
              setPreferredScope(scope);
            }}
            onRetryMessage={handleRetryMessage}
            onOpenAgentTab={() => setActiveTab("agent")}
          />
          <AiComposer
            value={draft}
            onChange={setDraft}
            scope={effectiveScope}
            onScopeChange={setPreferredScope}
            attachments={attachments}
            onAddFiles={handleAddFiles}
            onRemoveAttachment={handleRemoveAttachment}
            selectedElement={elementContext}
            onClearSelectedElement={() => {
              setSelectedElement(undefined);
              if (preferredScope === "element") {
                setPreferredScope("page");
              }
            }}
            isSending={isSending}
            onSend={handleSend}
          />
        </TabsContent>

        <TabsContent
          value="agent"
          className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <AiAgentTab selectedElement={elementContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
