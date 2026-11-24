import { useEffect, useRef, useState } from "react";
import type { ReactElement } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  Box,
  Check,
  Copy,
  FileText,
  ImageIcon,
  Layers,
  LayoutTemplate,
  Monitor,
  Palette,
  PenLine,
  RotateCcw,
  ScanSearch,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Tablet,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import type {
  AiCanvasContext,
  AiElementContext,
  AiMessage,
  AiPromptScope,
  AiStarterAction,
} from "../types";
import {
  ELEMENT_STARTER_ACTIONS,
  PAGE_STARTER_ACTIONS,
  formatFileSize,
  formatMessageTime,
} from "../utils/aiChatUtils";

interface AiChatThreadProps {
  readonly messages: readonly AiMessage[];
  readonly canvasContext: AiCanvasContext;
  readonly selectedElement?: AiElementContext;
  readonly isSending: boolean;
  readonly mcpConnected: boolean;
  readonly onSelectStarter: (prompt: string, scope: AiPromptScope) => void;
  readonly onRetryMessage: (assistantMessageId: string) => void;
  readonly onOpenAgentTab: () => void;
}

function StarterIcon({
  icon,
}: {
  readonly icon: AiStarterAction["icon"];
}): ReactElement {
  switch (icon) {
    case "layout":
      return <SlidersHorizontal className="size-3.5" />;
    case "responsive":
      return <Smartphone className="size-3.5" />;
    case "copy":
      return <PenLine className="size-3.5" />;
    case "theme":
      return <Palette className="size-3.5" />;
    case "hero":
      return <LayoutTemplate className="size-3.5" />;
    case "audit":
      return <ScanSearch className="size-3.5" />;
    case "clone":
      return <ImageIcon className="size-3.5" />;
  }
}

function ViewportIcon({
  viewport,
}: {
  readonly viewport: AiCanvasContext["viewport"];
}): ReactElement {
  switch (viewport) {
    case "mobile":
      return <Smartphone className="size-3" />;
    case "tablet":
      return <Tablet className="size-3" />;
    case "desktop":
      return <Monitor className="size-3" />;
  }
}

function formatScopeLabel(scope: AiPromptScope): string {
  switch (scope) {
    case "element":
      return "Element";
    case "page":
      return "Page";
    case "theme":
      return "Theme";
  }
}

export function AiChatThread({
  messages,
  canvasContext,
  selectedElement,
  isSending,
  mcpConnected,
  onSelectStarter,
  onRetryMessage,
  onOpenAgentTab,
}: AiChatThreadProps): ReactElement {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleCopy = async (id: string, text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast.success("Copied to clipboard");
      window.setTimeout(() => {
        setCopiedId((current) => (current === id ? null : current));
      }, 1800);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (messages.length === 0) {
    const actions = selectedElement ? ELEMENT_STARTER_ACTIONS : PAGE_STARTER_ACTIONS;

    return (
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex w-full min-w-0 flex-col gap-4 px-3.5 py-4">
          {/* Live Canvas Context Card */}
          <div className="border-border bg-background/70 flex w-full min-w-0 flex-col gap-2.5 rounded-xl border p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {selectedElement ? "Selected Node" : "Active Canvas"}
              </span>
              <div className="flex items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="h-5 gap-1 px-1.5 text-[10px] font-normal capitalize"
                >
                  <ViewportIcon viewport={canvasContext.viewport} />
                  {canvasContext.viewport}
                </Badge>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-[10px] font-normal capitalize"
                >
                  {canvasContext.mode === "editor" ? "Design" : "Wireframe"}
                </Badge>
              </div>
            </div>

            {selectedElement ? (
              <div className="flex min-w-0 flex-col gap-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="bg-primary/10 text-primary flex size-6 shrink-0 items-center justify-center rounded-md">
                    <Box className="size-3.5" />
                  </span>
                  <span className="text-foreground min-w-0 flex-1 truncate text-xs font-semibold">
                    {selectedElement.name || selectedElement.type}
                  </span>
                  <Badge variant="outline" className="h-5 shrink-0 font-mono text-[10px]">
                    {selectedElement.type}
                  </Badge>
                </div>
                {(selectedElement.tailwindStyles || selectedElement.content) && (
                  <p className="bg-muted/50 text-muted-foreground truncate rounded-md px-2 py-1 font-mono text-[10px]">
                    {selectedElement.tailwindStyles || selectedElement.content}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-foreground text-xs font-semibold">
                    {canvasContext.sectionCount}{" "}
                    {canvasContext.sectionCount === 1 ? "section" : "sections"}
                  </span>
                  <span className="text-muted-foreground font-mono text-[11px]">
                    · {canvasContext.totalNodeCount}{" "}
                    {canvasContext.totalNodeCount === 1 ? "node" : "nodes"}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Click any node on the canvas to target it, or prompt the whole page.
                </p>
              </div>
            )}
          </div>

          {/* Context-Adaptive 2x2 Action Grid */}
          <div className="flex w-full min-w-0 flex-col gap-2">
            <div className="flex items-center justify-between px-0.5">
              <span className="text-muted-foreground text-[10px] font-semibold tracking-wider uppercase">
                {selectedElement ? "Node Actions" : "Page Actions"}
              </span>
              <span className="text-muted-foreground font-mono text-[10px]">
                type / for commands
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {actions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() =>
                    onSelectStarter(action.buildPrompt(selectedElement), action.scope)
                  }
                  className="border-border/80 bg-background/50 hover:border-primary/40 hover:bg-muted/50 group flex min-w-0 flex-col gap-2 rounded-xl border p-2.5 text-left transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="bg-muted text-foreground group-hover:bg-primary/15 group-hover:text-primary flex size-6 shrink-0 items-center justify-center rounded-md transition-colors">
                      <StarterIcon icon={action.icon} />
                    </span>
                    <span className="text-muted-foreground font-mono text-[10px]">
                      {action.tag}
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-foreground truncate text-xs font-medium">
                      {action.label}
                    </span>
                    <span className="text-muted-foreground line-clamp-2 text-[11px] leading-snug">
                      {action.description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subtle External Agent Shortcut */}
          <button
            type="button"
            onClick={onOpenAgentTab}
            className="border-border/70 bg-muted/25 hover:bg-muted/50 flex w-full min-w-0 items-center gap-2.5 rounded-lg border border-dashed px-3 py-2 text-left transition-colors"
          >
            <Terminal className="text-muted-foreground size-3.5 shrink-0" />
            <span className="min-w-0 flex-1 truncate text-[11px]">
              <span className="text-foreground font-medium">
                {mcpConnected ? "MCP agent connected" : "Bring your own CLI agent"}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · Claude Code, Codex, Antigravity, OpenCode
              </span>
            </span>
            <ArrowUpRight className="text-muted-foreground size-3.5 shrink-0" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div className="flex w-full min-w-0 flex-col gap-4 px-3.5 py-4">
        {messages.map((message) => {
          if (message.role === "user") {
            return (
              <div key={message.id} className="flex flex-col items-end gap-1.5">
                <div className="flex max-w-full flex-wrap items-center justify-end gap-1">
                  {message.scope && (
                    <Badge
                      variant="secondary"
                      className="h-4 px-1.5 font-mono text-[9px] font-normal uppercase"
                    >
                      {formatScopeLabel(message.scope)}
                    </Badge>
                  )}
                  {message.elementContext && (
                    <Badge variant="outline" className="h-4 gap-1 px-1.5 text-[10px] font-normal">
                      <Layers className="size-2.5" />
                      <span className="max-w-[140px] truncate">
                        {message.elementContext.name || message.elementContext.type}
                      </span>
                    </Badge>
                  )}
                </div>

                {message.attachments && message.attachments.length > 0 && (
                  <div className="flex max-w-[92%] flex-wrap justify-end gap-1.5">
                    {message.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="border-border bg-muted/60 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px]"
                      >
                        {file.isImage && file.previewUrl ? (
                          <img
                            src={file.previewUrl}
                            alt={file.name}
                            className="size-4 rounded object-cover"
                          />
                        ) : (
                          <FileText className="text-muted-foreground size-3.5 shrink-0" />
                        )}
                        <span className="max-w-[120px] truncate">{file.name}</span>
                        <span className="text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-primary text-primary-foreground max-w-[90%] rounded-xl rounded-br-xs px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </div>
                <span className="text-muted-foreground px-0.5 font-mono text-[10px]">
                  {formatMessageTime(message.createdAt)}
                </span>
              </div>
            );
          }

          return (
            <div key={message.id} className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="text-primary size-3 shrink-0" />
                <span className="text-foreground text-[11px] font-semibold">
                  Copilot
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  · {formatMessageTime(message.createdAt)}
                </span>
              </div>

              <div className="border-primary/35 flex min-w-0 flex-col gap-2 border-l-2 pl-3">
                {message.status === "pending" && (
                  <div className="text-muted-foreground flex items-center gap-2 py-1 text-xs">
                    <Spinner className="size-3.5" />
                    <span>Analyzing canvas context…</span>
                  </div>
                )}

                {message.status === "error" && (
                  <div className="border-destructive/40 bg-destructive/5 flex flex-col gap-2 rounded-lg border p-2.5 text-xs">
                    <div className="text-destructive flex items-start gap-2">
                      <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                      <span className="leading-relaxed">
                        {message.errorMessage ?? "Unable to reach the AI service."}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isSending}
                        onClick={() => onRetryMessage(message.id)}
                        className="h-7 px-2 text-[11px]"
                      >
                        <RotateCcw data-icon="inline-start" />
                        Retry
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onOpenAgentTab}
                        className="h-7 px-2 text-[11px]"
                      >
                        <Terminal data-icon="inline-start" />
                        Use MCP Agent
                      </Button>
                    </div>
                  </div>
                )}

                {message.status === "complete" && (
                  <>
                    <div className="text-foreground text-xs leading-relaxed whitespace-pre-wrap break-words">
                      {message.content}
                    </div>

                    {message.html && (
                      <div className="border-border bg-background overflow-hidden rounded-lg border">
                        <div className="border-border bg-muted/40 flex items-center justify-between border-b px-2.5 py-1">
                          <span className="text-muted-foreground font-mono text-[10px]">
                            HTML snippet
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              void handleCopy(`${message.id}-html`, message.html ?? "")
                            }
                            className="h-6 px-1.5 text-[10px]"
                          >
                            {copiedId === `${message.id}-html` ? (
                              <Check data-icon="inline-start" />
                            ) : (
                              <Copy data-icon="inline-start" />
                            )}
                            Copy HTML
                          </Button>
                        </div>
                        <pre className="max-h-40 overflow-x-auto p-2.5 font-mono text-[11px] leading-snug">
                          <code>{message.html}</code>
                        </pre>
                      </div>
                    )}

                    <Separator className="opacity-50" />

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => void handleCopy(message.id, message.content)}
                        className="text-muted-foreground h-6 px-1.5 text-[11px]"
                      >
                        {copiedId === message.id ? (
                          <Check data-icon="inline-start" />
                        ) : (
                          <Copy data-icon="inline-start" />
                        )}
                        {copiedId === message.id ? "Copied" : "Copy"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isSending}
                        onClick={() => onRetryMessage(message.id)}
                        className="text-muted-foreground h-6 px-1.5 text-[11px]"
                      >
                        <RotateCcw data-icon="inline-start" />
                        Regenerate
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
