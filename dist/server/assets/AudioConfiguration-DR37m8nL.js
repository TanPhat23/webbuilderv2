import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-D43pR8IL.js";
import { h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { Volume2, Settings2, VolumeX, Loader, Play, Repeat } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
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
const PRELOAD_OPTIONS = [
  { value: "auto", label: "Auto", description: "Browser decides what to preload" },
  {
    value: "metadata",
    label: "Metadata",
    description: "Only load duration & metadata"
  },
  { value: "none", label: "None", description: "Don't preload anything" }
];
function AudioConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Audio") {
    return null;
  }
  const element = selectedElement;
  const settings = element.settings ?? {};
  const src = element.src ?? "";
  const handleSrcChange = (e) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };
  const updateSetting = (key, value) => {
    updateElement(selectedElement.id, {
      settings: { ...settings, [key]: value }
    });
  };
  const hasSrc = src.length > 0;
  const isExternalUrl = hasSrc && (src.startsWith("http://") || src.startsWith("https://"));
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "audio-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Volume2, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Audio Settings" }),
          hasSrc && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400", children: "src" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["source", "playback"],
        className: "w-full",
        children: [
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "source",
              title: "Source",
              icon: /* @__PURE__ */ jsx(Settings2, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Source URL",
                    htmlFor: "audio-src",
                    hint: "URL of the audio file. Supports MP3, WAV, OGG, and AAC formats.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "audio-src",
                        type: "text",
                        value: src,
                        onChange: handleSrcChange,
                        placeholder: "https://example.com/audio.mp3",
                        className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                hasSrc && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                      isExternalUrl ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    ),
                    children: isExternalUrl ? "External source" : "Local source"
                  }
                ) })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "playback",
              title: "Playback",
              icon: /* @__PURE__ */ jsx(Play, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Controls",
                    htmlFor: "audio-controls",
                    hint: "Show native audio playback controls (play, pause, volume, seek). Strongly recommended — without controls users can't interact with the player.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "audio-controls",
                        checked: settings.controls !== false,
                        onCheckedChange: (checked) => updateSetting("controls", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Autoplay",
                    htmlFor: "audio-autoplay",
                    hint: "Start playing automatically when the page loads. Most browsers block autoplay with audio unless the user has interacted with the page.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "audio-autoplay",
                        checked: !!settings.autoplay,
                        onCheckedChange: (checked) => updateSetting("autoplay", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                settings.autoplay && !settings.muted && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(VolumeX, { className: "h-3 w-3 text-amber-500/60" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60 leading-tight", children: "Autoplay may be blocked — enable Muted for reliable autoplay" })
                ] }),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Loop",
                    htmlFor: "audio-loop",
                    hint: "Restart the audio automatically when it reaches the end.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "audio-loop",
                        checked: !!settings.loop,
                        onCheckedChange: (checked) => updateSetting("loop", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Muted",
                    htmlFor: "audio-muted",
                    hint: "Start the audio with sound muted. Required by most browsers for autoplay to work.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "audio-muted",
                        checked: !!settings.muted,
                        onCheckedChange: (checked) => updateSetting("muted", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Preload",
                    htmlFor: "audio-preload",
                    hint: "How much of the audio to preload when the page loads. 'Metadata' is a good balance between performance and UX.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.preload ?? "metadata",
                        onValueChange: (value) => updateSetting(
                          "preload",
                          value
                        ),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "audio-preload",
                              className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: PRELOAD_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Loader, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: PRELOAD_OPTIONS.find(
                    (o) => o.value === (settings.preload ?? "metadata")
                  )?.description })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 flex-wrap pl-0.5 animate-in fade-in-0 duration-150", children: [
                  settings.autoplay && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Play, { className: "h-2.5 w-2.5" }),
                    "autoplay"
                  ] }),
                  settings.loop && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Repeat, { className: "h-2.5 w-2.5" }),
                    "loop"
                  ] }),
                  settings.muted ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(VolumeX, { className: "h-2.5 w-2.5" }),
                    "muted"
                  ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Volume2, { className: "h-2.5 w-2.5" }),
                    "audio on"
                  ] }),
                  settings.controls !== false && /* @__PURE__ */ jsx("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: "controls" })
                ] })
              ]
            }
          )
        ]
      }
    ) })
  ] });
}
export {
  AudioConfiguration as default
};
