import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ClipboardEvent, KeyboardEvent, ReactElement } from "react";
import {
  ArrowUp,
  Box,
  Command,
  FileCode2,
  FileText,
  ImageIcon,
  Monitor,
  Palette,
  Paperclip,
  PenLine,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@webbuilder/site-runtime/lib/utils";
import type {
  AiAttachment,
  AiCommand,
  AiCommandId,
  AiElementContext,
  AiPromptScope,
} from "../types";
import {
  AI_COMMANDS,
  filterAiCommands,
  formatFileSize,
  shouldShowSlashPalette,
} from "../utils/aiChatUtils";

interface AiComposerProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly scope: AiPromptScope;
  readonly onScopeChange: (scope: AiPromptScope) => void;
  readonly attachments: readonly AiAttachment[];
  readonly onAddFiles: (files: readonly File[]) => void;
  readonly onRemoveAttachment: (id: string) => void;
  readonly selectedElement?: AiElementContext;
  readonly onClearSelectedElement: () => void;
  readonly isSending: boolean;
  readonly onSend: () => void;
  /** Focuses the textarea once, then reports it through onFocused. */
  readonly shouldFocus?: boolean;
  readonly onFocused?: () => void;
}

function CommandRowIcon({ id }: { readonly id: AiCommandId }): ReactElement {
  switch (id) {
    case "clone":
      return <ImageIcon className="size-3.5" />;
    case "page":
      return <Monitor className="size-3.5" />;
    case "improve":
      return <Sparkles className="size-3.5" />;
    case "copy":
      return <PenLine className="size-3.5" />;
  }
}

export function AiComposer({
  value,
  onChange,
  scope,
  onScopeChange,
  attachments,
  onAddFiles,
  onRemoveAttachment,
  selectedElement,
  onClearSelectedElement,
  isSending,
  onSend,
  shouldFocus = false,
  onFocused,
}: AiComposerProps): ReactElement {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const [manualPaletteOpen, setManualPaletteOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const slashTriggered = shouldShowSlashPalette(value);
  const paletteOpen = slashTriggered || manualPaletteOpen;

  const commands: readonly AiCommand[] = useMemo(() => {
    if (slashTriggered) {
      return filterAiCommands(value);
    }
    return manualPaletteOpen ? AI_COMMANDS : [];
  }, [manualPaletteOpen, slashTriggered, value]);

  const clampedActiveIndex =
    commands.length > 0 ? Math.min(activeIndex, commands.length - 1) : 0;

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 52), 156)}px`;
  }, []);

  useEffect(() => {
    if (!shouldFocus) return;
    textareaRef.current?.focus();
    onFocused?.();
  }, [shouldFocus, onFocused]);

  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    if (!manualPaletteOpen) return;
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target;
      if (
        target instanceof Node &&
        paletteRef.current &&
        !paletteRef.current.contains(target)
      ) {
        setManualPaletteOpen(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [manualPaletteOpen]);

  const applyCommand = (command: AiCommand): void => {
    onChange(`${command.prefix} `);
    setManualPaletteOpen(false);
    setActiveIndex(0);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (paletteOpen && commands.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((prev) => (prev + 1) % commands.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((prev) => (prev - 1 + commands.length) % commands.length);
        return;
      }
      if (event.key === "Tab" || event.key === "Enter") {
        event.preventDefault();
        const selected = commands[clampedActiveIndex];
        if (selected) {
          applyCommand(selected);
        }
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setManualPaletteOpen(false);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!isSending && value.trim().length > 0) {
        onSend();
      }
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>): void => {
    const files: File[] = [];
    for (const item of Array.from(event.clipboardData.items)) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }
    if (files.length > 0) {
      onAddFiles(files);
    }
  };

  const placeholder =
    scope === "element" && selectedElement
      ? `Edit "${selectedElement.name || selectedElement.type}" or type /…`
      : scope === "theme"
        ? "Ask about colors, fonts, spacing tokens, or CSS…"
        : "Describe a section, layout tweak, or type /…";

  const canSend = !isSending && value.trim().length > 0;

  return (
    <div className="border-border bg-card relative flex shrink-0 flex-col gap-2 border-t p-3">
      <div className="border-border bg-background focus-within:border-primary/50 relative flex flex-col overflow-visible rounded-xl border transition-colors">
        {paletteOpen && commands.length > 0 && (
          <div
            ref={paletteRef}
            role="listbox"
            aria-label="Slash commands"
            className="border-border bg-popover absolute right-0 bottom-full left-0 mb-2 flex flex-col gap-0.5 rounded-lg border p-1 shadow-md"
          >
            {commands.map((cmd, index) => (
              <button
                key={cmd.id}
                type="button"
                role="option"
                aria-selected={clampedActiveIndex === index}
                onClick={() => applyCommand(cmd)}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-xs transition-colors",
                  clampedActiveIndex === index
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted/70",
                )}
              >
                <span className="text-primary flex size-5 shrink-0 items-center justify-center">
                  <CommandRowIcon id={cmd.id} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-foreground block font-medium">{cmd.label}</span>
                  <span className="text-muted-foreground block truncate text-[11px]">
                    {cmd.description}
                  </span>
                </span>
                <code className="text-muted-foreground font-mono text-[11px]">
                  {cmd.prefix}
                </code>
              </button>
            ))}
          </div>
        )}

        {/* Integrated Scope Bar */}
        <div className="border-border/60 bg-muted/25 flex items-center gap-1 rounded-t-xl border-b px-2 py-1.5">
          <button
            type="button"
            disabled={!selectedElement}
            onClick={() => onScopeChange("element")}
            className={cn(
              "flex min-w-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              scope === "element" && selectedElement
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
              !selectedElement && "cursor-not-allowed opacity-45 hover:text-muted-foreground",
            )}
            title={
              selectedElement
                ? `Target ${selectedElement.name || selectedElement.type}`
                : "Select an element on the canvas first"
            }
          >
            <Box className="size-3 shrink-0" />
            <span className="max-w-[96px] truncate">
              {selectedElement ? selectedElement.name || selectedElement.type : "Node"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onScopeChange("page")}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              scope === "page"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FileCode2 className="size-3 shrink-0" />
            <span>Page</span>
          </button>

          <button
            type="button"
            onClick={() => onScopeChange("theme")}
            className={cn(
              "flex shrink-0 items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
              scope === "theme"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Palette className="size-3 shrink-0" />
            <span>Theme</span>
          </button>

          {selectedElement && (
            <button
              type="button"
              aria-label="Clear selected element"
              title="Clear canvas selection"
              onClick={onClearSelectedElement}
              className="text-muted-foreground hover:text-foreground ml-auto flex size-5 shrink-0 items-center justify-center rounded transition-colors"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {attachments.length > 0 && (
          <div className="border-border/60 flex flex-wrap gap-1.5 border-b px-2.5 py-2">
            {attachments.map((file) => (
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
                <span className="max-w-[110px] truncate">{file.name}</span>
                <span className="text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
                <button
                  type="button"
                  aria-label={`Remove ${file.name}`}
                  onClick={() => onRemoveAttachment(file.id)}
                  className="text-muted-foreground hover:text-foreground ml-0.5 transition-colors"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          aria-label="Prompt message"
          rows={2}
          className="min-h-[52px] max-h-[156px] resize-none border-0 bg-transparent px-3 pt-2.5 pb-1 text-xs shadow-none focus-visible:ring-0"
        />

        <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.txt,.md,.json,.html,.css"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files;
                if (selected && selected.length > 0) {
                  onAddFiles(Array.from(selected));
                }
                event.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Attach image or file"
              title="Attach image or file (or paste directly)"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground size-7"
            >
              <Paperclip className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant={paletteOpen ? "secondary" : "ghost"}
              size="icon"
              aria-label="Toggle slash commands"
              title="Slash commands (/)"
              onClick={() => {
                setManualPaletteOpen((prev) => !prev);
                setActiveIndex(0);
              }}
              className="text-muted-foreground hover:text-foreground size-7"
            >
              <Command className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground hidden font-mono text-[10px] sm:inline">
              ↵ send
            </span>
            <Button
              type="button"
              size="icon"
              aria-label="Send message"
              disabled={!canSend}
              onClick={onSend}
              className="size-7 rounded-lg"
            >
              {isSending ? (
                <Spinner className="size-3.5" />
              ) : (
                <ArrowUp className="size-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
