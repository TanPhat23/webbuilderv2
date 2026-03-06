import { jsxs, jsx } from "react/jsx-runtime";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent, A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Video, Image, Settings2, VolumeX, Loader, Play, Repeat, Volume2, Maximize, Monitor } from "lucide-react";
import { A as AccordionSection, C as ConfigField, S as SectionDivider } from "./AccordionSection-BcJ45_Y5.js";
import "react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "tailwind-merge";
import "@hookform/resolvers/zod";
import "react-hook-form";
import "next-themes";
import "socket.io-client";
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
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
import "isomorphic-dompurify";
import "framer-motion";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@clerk/react";
import "@radix-ui/react-context-menu";
import "./textarea-BDhK7YnG.js";
import "./checkbox-BX2VzNwa.js";
const OBJECT_FIT_OPTIONS = [
  { value: "cover", label: "Cover", description: "Fill & crop to fit" },
  { value: "contain", label: "Contain", description: "Fit within bounds" },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  { value: "none", label: "None", description: "Original size" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Smaller of none or contain"
  }
];
const PRELOAD_OPTIONS = [
  { value: "auto", label: "Auto", description: "Browser decides" },
  {
    value: "metadata",
    label: "Metadata",
    description: "Only load metadata & dimensions"
  },
  { value: "none", label: "None", description: "Don't preload anything" }
];
function VideoConfiguration() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Video") {
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
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? void 0 : parsed);
  };
  const hasSrc = src.length > 0;
  const isExternalUrl = hasSrc && (src.startsWith("http://") || src.startsWith("https://"));
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "video-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Video, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Video Settings" }),
          hasSrc && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-mono text-emerald-600 dark:text-emerald-400", children: "src" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs(
      Accordion,
      {
        type: "multiple",
        defaultValue: ["source", "playback", "display"],
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
                    htmlFor: "video-src",
                    hint: "URL of the video file. Supports MP4, WebM, and OGG formats.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "video-src",
                        type: "text",
                        value: src,
                        onChange: handleSrcChange,
                        placeholder: "https://example.com/video.mp4",
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
                ) }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Poster",
                    htmlFor: "video-poster",
                    hint: "Image URL displayed before the video plays. Acts as a thumbnail preview.",
                    vertical: true,
                    children: /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "video-poster",
                        type: "text",
                        value: settings.poster ?? "",
                        onChange: (e) => updateSetting("poster", e.target.value || void 0),
                        placeholder: "https://example.com/poster.jpg",
                        className: "h-7 w-full px-2 text-[11px] font-mono rounded-md",
                        autoComplete: "off"
                      }
                    )
                  }
                ),
                settings.poster && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Image, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "Poster image set" })
                ] })
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
                    htmlFor: "video-controls",
                    hint: "Show native video playback controls (play, pause, volume, seek).",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "video-controls",
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
                    htmlFor: "video-autoplay",
                    hint: "Start playing automatically when the page loads. Most browsers require muted to be enabled for autoplay.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "video-autoplay",
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
                    htmlFor: "video-loop",
                    hint: "Restart the video automatically when it reaches the end.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "video-loop",
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
                    htmlFor: "video-muted",
                    hint: "Start the video with audio muted. Required by most browsers for autoplay.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "video-muted",
                        checked: !!settings.muted,
                        onCheckedChange: (checked) => updateSetting("muted", !!checked),
                        className: "scale-75 origin-right"
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Plays inline",
                    htmlFor: "video-playsInline",
                    hint: "Play the video inline on mobile instead of fullscreen. Important for iOS Safari.",
                    children: /* @__PURE__ */ jsx(
                      Switch,
                      {
                        id: "video-playsInline",
                        checked: !!settings.playsInline,
                        onCheckedChange: (checked) => updateSetting("playsInline", !!checked),
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
                    htmlFor: "video-preload",
                    hint: "How much of the video to preload. 'Metadata' is a good balance between performance and UX.",
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
                              id: "video-preload",
                              className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: PRELOAD_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsx("span", { children: opt.label }) }) }, opt.value)) })
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
                  settings.muted && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(VolumeX, { className: "h-2.5 w-2.5" }),
                    "muted"
                  ] }),
                  !settings.muted && /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground", children: [
                    /* @__PURE__ */ jsx(Volume2, { className: "h-2.5 w-2.5" }),
                    "audio"
                  ] })
                ] })
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            AccordionSection,
            {
              value: "display",
              title: "Display",
              icon: /* @__PURE__ */ jsx(Monitor, {}),
              nested: true,
              children: [
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Object fit",
                    htmlFor: "video-objectFit",
                    hint: "How the video is resized to fit its container.",
                    children: /* @__PURE__ */ jsxs(
                      Select,
                      {
                        value: settings.objectFit ?? "cover",
                        onValueChange: (value) => updateSetting(
                          "objectFit",
                          value
                        ),
                        children: [
                          /* @__PURE__ */ jsx(
                            SelectTrigger,
                            {
                              id: "video-objectFit",
                              className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
                              children: /* @__PURE__ */ jsx(SelectValue, {})
                            }
                          ),
                          /* @__PURE__ */ jsx(SelectContent, { children: OBJECT_FIT_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: opt.label }, opt.value)) })
                        ]
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Maximize, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: OBJECT_FIT_OPTIONS.find(
                    (o) => o.value === (settings.objectFit ?? "cover")
                  )?.description })
                ] }),
                /* @__PURE__ */ jsx(SectionDivider, {}),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Width",
                    htmlFor: "video-width",
                    hint: "Intrinsic width in pixels. The element can still be resized via CSS.",
                    children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "video-width",
                          type: "number",
                          value: settings.width ?? "",
                          onChange: (e) => handleNumberInput("width", e),
                          placeholder: "auto",
                          min: 0,
                          className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                    ] })
                  }
                ),
                /* @__PURE__ */ jsx(
                  ConfigField,
                  {
                    label: "Height",
                    htmlFor: "video-height",
                    hint: "Intrinsic height in pixels. The element can still be resized via CSS.",
                    children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                      /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "video-height",
                          type: "number",
                          value: settings.height ?? "",
                          onChange: (e) => handleNumberInput("height", e),
                          placeholder: "auto",
                          min: 0,
                          className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      ),
                      /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "px" })
                    ] })
                  }
                ),
                (settings.width || settings.height) && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                  /* @__PURE__ */ jsx(Monitor, { className: "h-3 w-3 text-muted-foreground/40" }),
                  /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: [
                    settings.width ?? "auto",
                    " × ",
                    settings.height ?? "auto"
                  ] })
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
  VideoConfiguration as default
};
