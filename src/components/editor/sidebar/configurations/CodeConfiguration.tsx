"use client";

import React, { ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUpdateElement } from "@/globalstore/selectors/element-selectors";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  CodeElement,
  CodeSettings,
} from "@/interfaces/elements.interface";
import {
  ConfigField,
  ConfigSection,
  SectionDivider,
} from "./_shared";
import { cn } from "@/lib/utils";
import {
  Code,
  Settings2,
  FileCode2,
  WrapText,
} from "lucide-react";

/* ─── Language Options ─── */

interface LanguageOption {
  value: string;
  label: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: "", label: "None / Auto" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "jsx", label: "JSX" },
  { value: "tsx", label: "TSX" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "ruby", label: "Ruby" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "php", label: "PHP" },
  { value: "swift", label: "Swift" },
  { value: "kotlin", label: "Kotlin" },
  { value: "sql", label: "SQL" },
  { value: "graphql", label: "GraphQL" },
  { value: "yaml", label: "YAML" },
  { value: "toml", label: "TOML" },
  { value: "markdown", label: "Markdown" },
  { value: "bash", label: "Bash / Shell" },
  { value: "powershell", label: "PowerShell" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "xml", label: "XML" },
  { value: "plaintext", label: "Plain Text" },
];

/* ─── Main Component ─── */

export default function CodeConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();

  if (!selectedElement || selectedElement.type !== "Code") {
    return null;
  }

  const settings: CodeSettings =
    (selectedElement as CodeElement).settings ?? {};

  /* ─── Handlers ─── */

  const updateSetting = (name: keyof CodeSettings, value: unknown) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value },
    });
  };

  const handleLanguageChange = (value: string) => {
    updateSetting("language", value || undefined);
  };

  /* ─── Derived State ─── */

  const currentLanguage = settings.language ?? "";
  const currentLanguageOption =
    LANGUAGE_OPTIONS.find((opt) => opt.value === currentLanguage) ??
    LANGUAGE_OPTIONS[0];
  const isPreformatted = settings.preformatted ?? false;

  return (
    <AccordionItem value="code-settings" className="border-border/40">
      <AccordionTrigger
        className={cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90",
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150">
            <Code className="h-3.5 w-3.5" />
          </span>
          <span className="truncate">Code Settings</span>
          {currentLanguage && (
            <span className="ml-auto mr-1 shrink-0">
              <span className="inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground">
                {currentLanguage}
              </span>
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-3 pt-1 px-0.5">
        <div className="flex flex-col gap-3">
          {/* ── Language ── */}
          <ConfigSection
            title="Language"
            icon={<FileCode2 className="h-3 w-3" />}
          >
            {/* Language Selector */}
            <ConfigField
              label="Language"
              htmlFor="code-language"
              hint="The programming language of the code block. Used for syntax highlighting and semantic markup. Sets a class like 'language-javascript' on the element."
            >
              <Select
                value={currentLanguage}
                onValueChange={handleLanguageChange}
              >
                <SelectTrigger
                  id="code-language"
                  className="h-7 w-[130px] px-2 text-[11px] rounded-md"
                >
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="max-h-[240px]">
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value || "__none"} value={opt.value || "__none"}>
                      <span className="text-[11px]">{opt.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ConfigField>

            {/* Language info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <FileCode2 className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {currentLanguage
                  ? `Syntax: ${currentLanguageOption.label} — class="language-${currentLanguage}"`
                  : "No language set — rendered as generic code"}
              </span>
            </div>
          </ConfigSection>

          <SectionDivider />

          {/* ── Display ── */}
          <ConfigSection
            title="Display"
            icon={<Settings2 className="h-3 w-3" />}
          >
            {/* Preformatted */}
            <ConfigField
              label="Preformatted"
              htmlFor="code-preformatted"
              hint="Wrap the code element inside a <pre> tag. This preserves whitespace, line breaks, and indentation exactly as written. Enable this for multi-line code blocks; disable for inline code snippets."
            >
              <Switch
                id="code-preformatted"
                checked={isPreformatted}
                onCheckedChange={(checked) =>
                  updateSetting("preformatted", !!checked)
                }
                className="scale-75 origin-right"
              />
            </ConfigField>

            {/* Preformatted info */}
            <div className="flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150">
              <WrapText className="h-3 w-3 text-muted-foreground/40" />
              <span className="text-[10px] text-muted-foreground/50 leading-tight">
                {isPreformatted
                  ? "Rendered as <pre><code> — whitespace and line breaks preserved"
                  : "Rendered as inline <code> — flows within surrounding text"}
              </span>
            </div>
          </ConfigSection>

          {/* ── Summary ── */}
          <SectionDivider />
          <div className="flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150">
            <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
              <Code className="h-2.5 w-2.5" />
              {isPreformatted ? "<pre><code>" : "<code>"}
            </span>
            {currentLanguage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                <FileCode2 className="h-2.5 w-2.5" />
                {currentLanguage}
              </span>
            )}
            {!currentLanguage && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                generic
              </span>
            )}
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
