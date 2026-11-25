import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  countWords,
  sanitizeRichTextHtml,
  stripHtmlToPreview,
} from "./richTextUtils";

export interface RichTextEditorProps {
  readonly value: string;
  readonly onChange: (html: string) => void;
  readonly placeholder?: string;
  readonly minHeightClass?: string;
}

type EditorMode = "visual" | "html";

interface ToolbarButtonProps {
  readonly label: string;
  readonly onClick: () => void;
  readonly children: React.ReactNode;
}

function ToolbarButton({
  label,
  onClick,
  children,
}: ToolbarButtonProps): React.ReactElement {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="size-7 text-muted-foreground hover:text-foreground"
    >
      {children}
    </Button>
  );
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write formatted content…",
  minHeightClass = "min-h-56",
}: RichTextEditorProps): React.ReactElement {
  const [mode, setMode] = useState<EditorMode>("visual");
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");

  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastEmittedRef = useRef<string>(value);
  const savedRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    if (mode !== "visual") {
      return;
    }
    const el = editorRef.current;
    if (!el) {
      return;
    }
    if (value !== lastEmittedRef.current || el.innerHTML !== value) {
      const sanitized = sanitizeRichTextHtml(value);
      if (el.innerHTML !== sanitized) {
        el.innerHTML = sanitized;
      }
      lastEmittedRef.current = value;
    }
  }, [value, mode]);

  const emitFromVisual = (): void => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    const html = el.innerHTML;
    const normalized =
      html === "<br>" || html === "<p><br></p>" ? "" : html;
    lastEmittedRef.current = normalized;
    onChange(normalized);
  };

  const runCommand = (command: string, commandValue?: string): void => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    el.focus();
    document.execCommand(command, false, commandValue);
    emitFromVisual();
  };

  const wrapInlineCode = (): void => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    el.focus();
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return;
    }
    const range = selection.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) {
      return;
    }
    const selectedText = range.toString();
    if (!selectedText) {
      return;
    }
    const codeEl = document.createElement("code");
    codeEl.textContent = selectedText;
    range.deleteContents();
    range.insertNode(codeEl);
    range.setStartAfter(codeEl);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    emitFromVisual();
  };

  const saveCurrentSelection = (): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      savedRangeRef.current = selection.getRangeAt(0).cloneRange();
    } else {
      savedRangeRef.current = null;
    }
  };

  const handleApplyLink = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      setLinkOpen(false);
      return;
    }
    const el = editorRef.current;
    if (el) {
      el.focus();
      const selection = window.getSelection();
      if (selection && savedRangeRef.current) {
        selection.removeAllRanges();
        selection.addRange(savedRangeRef.current);
      }
      document.execCommand("createLink", false, trimmed);
      emitFromVisual();
    }
    setLinkUrl("https://");
    setLinkOpen(false);
  };

  const handleModeChange = (nextMode: EditorMode): void => {
    if (nextMode === mode) {
      return;
    }
    if (nextMode === "visual") {
      const sanitized = sanitizeRichTextHtml(value);
      lastEmittedRef.current = sanitized;
      if (sanitized !== value) {
        onChange(sanitized);
      }
    }
    setMode(nextMode);
  };

  const plainPreview = useMemo(() => stripHtmlToPreview(value), [value]);
  const wordCount = useMemo(() => countWords(plainPreview), [plainPreview]);
  const charCount = plainPreview.length;
  const isEmpty = plainPreview.length === 0;

  return (
    <div className="rounded-xl border border-border/70 bg-background overflow-hidden focus-within:ring-1 focus-within:ring-ring transition-shadow">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-2.5 py-1.5">
        <div
          className={cn(
            "flex flex-wrap items-center gap-0.5",
            mode === "html" && "pointer-events-none opacity-40",
          )}
        >
          <ToolbarButton
            label="Paragraph"
            onClick={() => runCommand("formatBlock", "p")}
          >
            <Pilcrow className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 1"
            onClick={() => runCommand("formatBlock", "h1")}
          >
            <Heading1 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 2"
            onClick={() => runCommand("formatBlock", "h2")}
          >
            <Heading2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Heading 3"
            onClick={() => runCommand("formatBlock", "h3")}
          >
            <Heading3 className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-4" />

          <ToolbarButton label="Bold" onClick={() => runCommand("bold")}>
            <Bold className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Italic" onClick={() => runCommand("italic")}>
            <Italic className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Underline"
            onClick={() => runCommand("underline")}
          >
            <Underline className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Strikethrough"
            onClick={() => runCommand("strikeThrough")}
          >
            <Strikethrough className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Inline Code" onClick={wrapInlineCode}>
            <Code className="size-3.5" />
          </ToolbarButton>

          <Separator orientation="vertical" className="mx-1 h-4" />

          <ToolbarButton
            label="Bullet List"
            onClick={() => runCommand("insertUnorderedList")}
          >
            <List className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Numbered List"
            onClick={() => runCommand("insertOrderedList")}
          >
            <ListOrdered className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Blockquote"
            onClick={() => runCommand("formatBlock", "blockquote")}
          >
            <Quote className="size-3.5" />
          </ToolbarButton>

          <Popover
            open={linkOpen}
            onOpenChange={(open) => {
              if (open) {
                saveCurrentSelection();
              }
              setLinkOpen(open);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                title="Insert Link"
                aria-label="Insert Link"
                onMouseDown={(e) => e.preventDefault()}
                className="size-7 text-muted-foreground hover:text-foreground"
              >
                <Link2 className="size-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-3" align="start">
              <form
                onSubmit={handleApplyLink}
                className="flex flex-col gap-2.5"
              >
                <div className="flex flex-col gap-1">
                  <Label htmlFor="cms-rte-link-url" className="text-xs">
                    Link URL
                  </Label>
                  <Input
                    id="cms-rte-link-url"
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-8 text-xs font-mono"
                    autoFocus
                  />
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    type="button"
                    size="xs"
                    variant="ghost"
                    onClick={() => setLinkOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" size="xs">
                    Apply
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>

          <Separator orientation="vertical" className="mx-1 h-4" />

          <ToolbarButton label="Undo" onClick={() => runCommand("undo")}>
            <Undo2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton label="Redo" onClick={() => runCommand("redo")}>
            <Redo2 className="size-3.5" />
          </ToolbarButton>
          <ToolbarButton
            label="Clear Formatting"
            onClick={() => runCommand("removeFormat")}
          >
            <RemoveFormatting className="size-3.5" />
          </ToolbarButton>
        </div>

        <div
          role="group"
          aria-label="Editor mode"
          className="flex items-center rounded-md border border-border/60 bg-background p-0.5 shrink-0"
        >
          <button
            type="button"
            onClick={() => handleModeChange("visual")}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              mode === "visual"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Visual
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("html")}
            className={cn(
              "rounded px-2 py-0.5 text-[11px] font-medium transition-colors",
              mode === "html"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            HTML
          </button>
        </div>
      </div>

      {mode === "visual" ? (
        <div className="relative">
          {isEmpty && (
            <span className="pointer-events-none absolute top-4 left-4 text-sm text-muted-foreground/60 select-none">
              {placeholder}
            </span>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitFromVisual}
            onBlur={emitFromVisual}
            className={cn(
              minHeightClass,
              "max-h-96 overflow-y-auto p-4 text-sm leading-relaxed outline-none",
              "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mb-1.5 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-2 [&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
            )}
          />
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => {
            lastEmittedRef.current = e.target.value;
            onChange(e.target.value);
          }}
          placeholder="<p>Write HTML directly…</p>"
          className={cn(
            minHeightClass,
            "max-h-96 resize-none rounded-none border-0 bg-background p-4 font-mono text-xs leading-relaxed focus-visible:ring-0",
          )}
        />
      )}

      <div className="flex items-center justify-between border-t border-border/50 bg-muted/20 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>{mode === "visual" ? "Rich text" : "HTML source"}</span>
        <span className="tabular-nums">
          {wordCount} {wordCount === 1 ? "word" : "words"} · {charCount}{" "}
          {charCount === 1 ? "char" : "chars"}
        </span>
      </div>
    </div>
  );
}
