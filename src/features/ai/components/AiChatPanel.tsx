
import { useEffect, useRef, useCallback, useTransition } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  ImageIcon,
  MonitorIcon,
  Paperclip,
  SendIcon,
  XIcon,
  LoaderIcon,
  Sparkles,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useAiChat } from "@/providers/aiprovider";
import { useSelectedElementWithSetter } from "@/features/editor";
import ConnectCliPanel from "@/features/agent/components/ConnectCliPanel";

interface UseAutoResizeTextareaProps {
  minHeight: number;
  maxHeight?: number;
}

function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: UseAutoResizeTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }

      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(
        minHeight,
        Math.min(textarea.scrollHeight, maxHeight ?? Number.POSITIVE_INFINITY),
      );

      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight],
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = `${minHeight}px`;
    }
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

interface CommandSuggestion {
  icon: React.ReactNode;
  label: string;
  description: string;
  prefix: string;
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  showRing?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, containerClassName, showRing = true, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className={cn("relative", containerClassName)}>
        <textarea
          className={cn(
            "border-input bg-background flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm",
            "transition-all duration-200 ease-in-out",
            "placeholder:text-muted-foreground",
            "disabled:cursor-not-allowed disabled:opacity-50",
            showRing
              ? "focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
              : "",
            className,
          )}
          ref={ref}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {showRing && isFocused && (
          <motion.span
            className="ring-primary/30 pointer-events-none absolute inset-0 rounded-md ring-2 ring-offset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {props.onChange && (
          <div
            className="bg-primary absolute right-2 bottom-2 h-2 w-2 rounded-full opacity-0"
            style={{
              animation: "none",
            }}
            id="textarea-ripple"
          />
        )}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";

export default function AnimatedAIChat({
  onClose,
}: {
  onClose?: () => void;
} = {}) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeSuggestion, setActiveSuggestion] = useState<number>(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [recentCommand, setRecentCommand] = useState<string | null>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 60,
    maxHeight: 200,
  });
  const { closeChat } = useAiChat();
  const commandPaletteRef = useRef<HTMLDivElement>(null);
  const { selectedElement, setSelectedElement } =
    useSelectedElementWithSetter();
  const commandSuggestions: CommandSuggestion[] = [
    {
      icon: <ImageIcon className="h-4 w-4" />,
      label: "Clone UI",
      description: "Generate a UI from a screenshot",
      prefix: "/clone",
    },

    {
      icon: <MonitorIcon className="h-4 w-4" />,
      label: "Create Page",
      description: "Generate a new web page",
      prefix: "/page",
    },
    {
      icon: <Sparkles className="h-4 w-4" />,
      label: "Improve",
      description: "Improve existing UI design",
      prefix: "/improve",
    },
  ];

  useEffect(() => {
    if (value.startsWith("/") && !value.includes(" ")) {
      setShowCommandPalette(true);

      const matchingSuggestionIndex = commandSuggestions.findIndex((cmd) =>
        cmd.prefix.startsWith(value),
      );

      if (matchingSuggestionIndex >= 0) {
        setActiveSuggestion(matchingSuggestionIndex);
      } else {
        setActiveSuggestion(-1);
      }
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const commandButton = document.querySelector("[data-command-button]");

      if (
        commandPaletteRef.current &&
        !commandPaletteRef.current.contains(target) &&
        !commandButton?.contains(target)
      ) {
        setShowCommandPalette(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommandPalette) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev < commandSuggestions.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveSuggestion((prev) =>
          prev > 0 ? prev - 1 : commandSuggestions.length - 1,
        );
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          const selectedCommand = commandSuggestions[activeSuggestion];
          setValue(selectedCommand.prefix + " ");
          setShowCommandPalette(false);

          setRecentCommand(selectedCommand.label);
          setTimeout(() => setRecentCommand(null), 3500);
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        handleSendMessage();
      }
    }
  };

  const handleSendMessage = () => {
    if (value.trim()) {
      startTransition(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setValue("");
          adjustHeight(true);
        }, 3000);
      });
    }
  };

  const handleAttachFile = () => {
    const mockFileName = `file-${Math.floor(Math.random() * 1000)}.pdf`;
    setAttachments((prev) => [...prev, mockFileName]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const selectCommandSuggestion = (index: number) => {
    const selectedCommand = commandSuggestions[index];
    setValue(selectedCommand.prefix + " ");
    setShowCommandPalette(false);

    setRecentCommand(selectedCommand.label);
    setTimeout(() => setRecentCommand(null), 2000);
  };

  return (
    <div className="relative flex h-full w-full overflow-x-hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close AI assistant"
        className="text-muted-foreground hover:text-foreground absolute right-2 top-2 z-50 h-7 w-7"
        onClick={() => {
          closeChat();
          onClose?.();
        }}
      >
        <XIcon className="h-4 w-4" />
      </Button>

      <div className="text-foreground relative flex min-h-full w-full flex-col items-center justify-center overflow-hidden bg-transparent px-5 py-10">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="bg-primary/10 absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full blur-[96px]" />
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <motion.div
            className="relative z-10 space-y-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-primary/10 text-primary ring-primary/20 flex h-10 w-10 items-center justify-center rounded-xl ring-1">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold tracking-tight">
                  How can I help today?
                </h1>
                <p className="text-muted-foreground text-sm">
                  Describe what you want to build, or start from a template.
                </p>
              </div>
            </div>

            {/* Selected element */}
            {selectedElement && (
              <motion.div
                className="bg-primary/5 text-muted-foreground flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span className="font-medium">Selected element</span>
                <span className="bg-primary/10 text-primary rounded px-2 py-0.5">
                  {selectedElement.name || selectedElement.type}
                </span>
                <button
                  type="button"
                  aria-label="Clear selected element"
                  onClick={() => setSelectedElement(undefined)}
                  className="text-muted-foreground hover:text-foreground ml-auto transition-colors"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </motion.div>
            )}

            {/* Composer */}
            <div className="space-y-2">
              <div className="border-border bg-card/80 focus-within:border-primary/40 focus-within:ring-primary/15 relative rounded-xl border shadow-lg ring-2 ring-transparent backdrop-blur-xl transition-[border-color,box-shadow] duration-200">
                <AnimatePresence>
                  {showCommandPalette && (
                    <motion.div
                      ref={commandPaletteRef}
                      className="border-border bg-popover absolute right-0 bottom-full left-0 z-50 mb-2 overflow-hidden rounded-lg border p-1 shadow-lg"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {commandSuggestions.map((suggestion, index) => (
                        <div
                          key={suggestion.prefix}
                          role="option"
                          aria-selected={activeSuggestion === index}
                          className={cn(
                            "flex cursor-pointer items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                            activeSuggestion === index
                              ? "bg-primary/15 text-foreground"
                              : "text-muted-foreground hover:bg-muted",
                          )}
                          onClick={() => selectCommandSuggestion(index)}
                        >
                          <span className="text-primary flex h-5 w-5 items-center justify-center">
                            {suggestion.icon}
                          </span>
                          <span className="text-foreground font-medium">
                            {suggestion.label}
                          </span>
                          <code className="text-muted-foreground/70 ml-auto font-mono text-xs">
                            {suggestion.prefix}
                          </code>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="px-3 pt-3">
                  <Textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      adjustHeight();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Describe a page, paste a prompt, or type / for commands…"
                    aria-label="Message"
                    containerClassName="w-full"
                    className="min-h-[60px] w-full resize-none border-none bg-transparent px-1 py-1 text-sm focus:outline-none"
                    style={{ overflow: "hidden" }}
                    showRing={false}
                  />
                </div>

                <AnimatePresence>
                  {attachments.length > 0 && (
                    <motion.div
                      className="flex flex-wrap gap-2 px-3 pt-2"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {attachments.map((file, index) => (
                        <motion.div
                          key={`${file}-${index}`}
                          className="bg-muted text-muted-foreground flex items-center gap-2 rounded-md px-2.5 py-1 text-xs"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <span>{file}</span>
                          <button
                            type="button"
                            aria-label={`Remove ${file}`}
                            onClick={() => removeAttachment(index)}
                            className="hover:text-foreground transition-colors"
                          >
                            <XIcon className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center justify-between gap-2 px-2 pt-1 pb-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Attach file"
                      onClick={handleAttachFile}
                      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label="Show commands"
                      data-command-button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowCommandPalette((prev) => !prev);
                      }}
                      className={cn(
                        "text-muted-foreground hover:bg-muted hover:text-foreground flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        showCommandPalette && "bg-muted text-foreground",
                      )}
                    >
                      <Command className="h-4 w-4" />
                    </button>
                  </div>

                  <motion.button
                    type="button"
                    aria-label="Send message"
                    onClick={handleSendMessage}
                    whileTap={{ scale: 0.95 }}
                    disabled={isTyping || !value.trim()}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                      "disabled:cursor-not-allowed",
                      value.trim()
                        ? "bg-primary text-primary-foreground shadow-primary/20 shadow-md"
                        : "bg-muted text-muted-foreground/60",
                    )}
                  >
                    {isTyping ? (
                      <LoaderIcon className="h-4 w-4 animate-[spin_2s_linear_infinite]" />
                    ) : (
                      <SendIcon className="h-4 w-4" />
                    )}
                  </motion.button>
                </div>
              </div>

              <div className="text-muted-foreground/70 flex h-5 items-center justify-center text-xs">
                {isTyping ? (
                  <span className="text-muted-foreground flex items-center gap-1">
                    Thinking
                    <TypingDots />
                  </span>
                ) : (
                  <span>
                    <kbd className="font-sans">Enter</kbd> to send ·{" "}
                    <kbd className="font-sans">Shift + Enter</kbd> for new line
                  </span>
                )}
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
                Quick start
              </p>
              <div className="flex flex-col gap-2">
                {commandSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.prefix}
                    type="button"
                    onClick={() => selectCommandSuggestion(index)}
                    className="group border-border/60 bg-card/40 hover:border-primary/30 hover:bg-muted/60 flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + index * 0.06 }}
                  >
                    <span className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      {suggestion.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-foreground block text-sm font-medium">
                        {suggestion.label}
                      </span>
                      <span className="text-muted-foreground block truncate text-xs">
                        {suggestion.description}
                      </span>
                    </span>
                    <code className="text-muted-foreground/60 group-hover:text-muted-foreground font-mono text-xs transition-colors">
                      {suggestion.prefix}
                    </code>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* CLI */}
            <div className="space-y-2">
              <p className="text-muted-foreground px-1 text-xs font-medium tracking-wider uppercase">
                Use your own agent
              </p>
              <ConnectCliPanel />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="ml-1 flex items-center">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="bg-primary mx-0.5 h-1.5 w-1.5 rounded-full"
          initial={{ opacity: 0.3 }}
          animate={{
            opacity: [0.3, 0.9, 0.3],
            scale: [0.85, 1.1, 0.85],
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: dot * 0.15,
            ease: "easeInOut",
          }}
          style={{
            boxShadow: "0 0 4px rgba(255, 255, 255, 0.3)",
          }}
        />
      ))}
    </div>
  );
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

const rippleKeyframes = `
@keyframes ripple {
  0% { transform: scale(0.5); opacity: 0.6; }
  100% { transform: scale(2); opacity: 0; }
}
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = rippleKeyframes;
  document.head.appendChild(style);
}
