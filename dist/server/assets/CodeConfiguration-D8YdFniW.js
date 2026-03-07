import { jsxs, jsx } from "react/jsx-runtime";
import { S as Switch } from "./switch-DU67gyjB.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import "./project.service-Bci2lGYe.js";
import { h as cn } from "./prisma-BUnO9f9X.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { Code, FileCode2, WrapText, Settings2 } from "lucide-react";
import { b as ConfigSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
import "react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-CEa84Ygm.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-D5_jSc2n.js";
import "./checkbox-Cs4k79tJ.js";
const LANGUAGE_OPTIONS = [
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
  { value: "plaintext", label: "Plain Text" }
];
function CodeConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Code") {
    return null;
  }
  const settings = selectedElement.settings ?? {};
  const updateSetting = (name, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [name]: value }
    });
  };
  const handleLanguageChange = (value) => {
    updateSetting("language", value || void 0);
  };
  const currentLanguage = settings.language ?? "";
  const currentLanguageOption = LANGUAGE_OPTIONS.find((opt) => opt.value === currentLanguage) ?? LANGUAGE_OPTIONS[0];
  const isPreformatted = settings.preformatted ?? false;
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "code-settings", className: "border-border/40", children: [
    /* @__PURE__ */ jsx(
      AccordionTrigger,
      {
        className: cn(
          "group/trigger gap-2 py-2 hover:no-underline",
          "transition-colors duration-150",
          "hover:bg-muted/30 rounded-md px-1.5 -mx-1.5",
          "text-xs font-semibold text-foreground/90"
        ),
        children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Code, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Code Settings" }),
          currentLanguage && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-muted/60 px-1.5 py-0.5 text-[9px] font-mono text-muted-foreground", children: currentLanguage }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Language",
          icon: /* @__PURE__ */ jsx(FileCode2, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Language",
                htmlFor: "code-language",
                hint: "The programming language of the code block. Used for syntax highlighting and semantic markup. Sets a class like 'language-javascript' on the element.",
                children: /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: currentLanguage,
                    onValueChange: handleLanguageChange,
                    children: [
                      /* @__PURE__ */ jsx(
                        SelectTrigger,
                        {
                          id: "code-language",
                          className: "h-7 w-[130px] px-2 text-[11px] rounded-md",
                          children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select..." })
                        }
                      ),
                      /* @__PURE__ */ jsx(SelectContent, { className: "max-h-[240px]", children: LANGUAGE_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value || "__none", children: /* @__PURE__ */ jsx("span", { className: "text-[11px]", children: opt.label }) }, opt.value || "__none")) })
                    ]
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(FileCode2, { className: "h-3 w-3 text-muted-foreground/40" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: currentLanguage ? `Syntax: ${currentLanguageOption.label} — class="language-${currentLanguage}"` : "No language set — rendered as generic code" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Display",
          icon: /* @__PURE__ */ jsx(Settings2, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Preformatted",
                htmlFor: "code-preformatted",
                hint: "Wrap the code element inside a <pre> tag. This preserves whitespace, line breaks, and indentation exactly as written. Enable this for multi-line code blocks; disable for inline code snippets.",
                children: /* @__PURE__ */ jsx(
                  Switch,
                  {
                    id: "code-preformatted",
                    checked: isPreformatted,
                    onCheckedChange: (checked) => updateSetting("preformatted", !!checked),
                    className: "scale-75 origin-right"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
              /* @__PURE__ */ jsx(WrapText, { className: "h-3 w-3 text-muted-foreground/40" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: isPreformatted ? "Rendered as <pre><code> — whitespace and line breaks preserved" : "Rendered as inline <code> — flows within surrounding text" })
            ] })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
        /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Code, { className: "h-2.5 w-2.5" }),
          isPreformatted ? "<pre><code>" : "<code>"
        ] }),
        currentLanguage && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
          /* @__PURE__ */ jsx(FileCode2, { className: "h-2.5 w-2.5" }),
          currentLanguage
        ] }),
        !currentLanguage && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "generic" })
      ] })
    ] }) })
  ] });
}
export {
  CodeConfiguration as default
};
