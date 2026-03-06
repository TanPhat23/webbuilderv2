import { jsx, jsxs } from "react/jsx-runtime";
import { A as Accordion } from "./accordion-Dg3retHz.js";
import { j as cn, aj as Tooltip, ak as TooltipTrigger, al as TooltipContent, I as Input } from "./prisma-Cq49YOYM.js";
import { S as Switch } from "./switch-BAyAbQjo.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-t_K3xf5i.js";
import { Navigation, Timer, Play, LayoutGrid, Layers, Hash, MonitorSmartphone, GalleryHorizontal, AlignHorizontalJustifyStart, AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd } from "lucide-react";
import "clsx";
import { C as ConfigField, T as ToggleGroup, a as ToggleGroupItem, A as AccordionSection, b as ConfigSection } from "./AccordionSection-BcJ45_Y5.js";
import "react";
import "radix-ui";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
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
function ToggleGroupField({
  label,
  hint,
  value,
  onChange,
  options,
  allowDeselect = true,
  variant = "outline",
  size = "sm",
  className,
  groupClassName,
  includeDefault = false,
  defaultLabel = "Default"
}) {
  const handleValueChange = (next) => {
    if (next === "__default__") {
      onChange(void 0);
      return;
    }
    if (!next && allowDeselect) {
      onChange(void 0);
      return;
    }
    if (next) {
      onChange(next);
    }
  };
  const allOptions = includeDefault ? [{ value: "__default__", label: defaultLabel }, ...options] : options;
  const resolvedValue = value ?? (includeDefault ? "__default__" : "");
  return /* @__PURE__ */ jsx(ConfigField, { label, hint, className, children: /* @__PURE__ */ jsx(
    ToggleGroup,
    {
      type: "single",
      value: resolvedValue,
      onValueChange: handleValueChange,
      variant,
      size,
      className: cn(
        "h-7 gap-0 rounded-md bg-muted/40 p-0.5",
        groupClassName
      ),
      children: allOptions.map((option) => /* @__PURE__ */ jsx(ToggleGroupItemWithTooltip, { option }, option.value))
    }
  ) });
}
function ToggleGroupItemWithTooltip({
  option
}) {
  const content = option.icon ? /* @__PURE__ */ jsx("span", { className: "flex items-center justify-center", children: option.icon }) : /* @__PURE__ */ jsx("span", { className: "text-[10px] font-medium leading-none px-0.5", children: option.label });
  if (option.icon) {
    return /* @__PURE__ */ jsxs(Tooltip, { children: [
      /* @__PURE__ */ jsx(TooltipTrigger, { asChild: true, children: /* @__PURE__ */ jsx(
        ToggleGroupItem,
        {
          value: option.value,
          "aria-label": option.label,
          className: cn(
            "h-6 w-7 min-w-0 rounded-[4px] p-0",
            "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
            "transition-all duration-150 ease-out",
            "hover:text-foreground/80"
          ),
          children: content
        }
      ) }),
      /* @__PURE__ */ jsx(TooltipContent, { side: "bottom", className: "text-[11px]", children: option.label })
    ] });
  }
  return /* @__PURE__ */ jsx(
    ToggleGroupItem,
    {
      value: option.value,
      "aria-label": option.label,
      className: cn(
        "h-6 min-w-[28px] rounded-[4px] px-1.5",
        "data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm",
        "transition-all duration-150 ease-out",
        "hover:text-foreground/80"
      ),
      children: content
    }
  );
}
const ALIGN_OPTIONS = [
  {
    value: "start",
    label: "Start",
    icon: /* @__PURE__ */ jsx(AlignHorizontalJustifyStart, { className: "h-3.5 w-3.5" })
  },
  {
    value: "center",
    label: "Center",
    icon: /* @__PURE__ */ jsx(AlignHorizontalJustifyCenter, { className: "h-3.5 w-3.5" })
  },
  {
    value: "end",
    label: "End",
    icon: /* @__PURE__ */ jsx(AlignHorizontalJustifyEnd, { className: "h-3.5 w-3.5" })
  }
];
function CarouselConfigurationAccordion() {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  if (!selectedElement || selectedElement.type !== "Carousel") {
    return null;
  }
  const settings = selectedElement.settings || {};
  const updateSetting = (name, value) => {
    updateElement(selectedElement.id, {
      settings: {
        ...settings,
        [name]: value
      }
    });
  };
  const handleNumberInput = (name, e) => {
    const raw = e.target.value;
    const parsed = parseInt(raw, 10);
    updateSetting(name, isNaN(parsed) ? 0 : parsed);
  };
  return /* @__PURE__ */ jsx(
    AccordionSection,
    {
      value: "carousel-settings",
      title: "Carousel",
      icon: /* @__PURE__ */ jsx(GalleryHorizontal, {}),
      children: /* @__PURE__ */ jsxs(
        Accordion,
        {
          type: "multiple",
          defaultValue: ["general", "autoplay", "slides"],
          className: "w-full",
          children: [
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "general",
                title: "General",
                icon: /* @__PURE__ */ jsx(Navigation, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Loop",
                      htmlFor: "carousel-loop",
                      hint: "Continuously loop through slides when reaching the end",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "carousel-loop",
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
                      label: "Navigation",
                      htmlFor: "carousel-navigation",
                      hint: "Show previous/next navigation arrows",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "carousel-navigation",
                          checked: settings.withNavigation !== void 0 ? settings.withNavigation : true,
                          onCheckedChange: (checked) => updateSetting("withNavigation", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ToggleGroupField,
                    {
                      label: "Align",
                      hint: "Alignment of slides within the carousel viewport",
                      value: settings.align || "start",
                      onChange: (value) => updateSetting(
                        "align",
                        value ?? "start"
                      ),
                      options: ALIGN_OPTIONS
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "autoplay",
                title: "Autoplay",
                icon: /* @__PURE__ */ jsx(Play, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Enable",
                      htmlFor: "carousel-autoplay",
                      hint: "Automatically advance slides at a set interval",
                      children: /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: "carousel-autoplay",
                          checked: !!settings.autoplay,
                          onCheckedChange: (checked) => updateSetting("autoplay", !!checked),
                          className: "scale-75 origin-right"
                        }
                      )
                    }
                  ),
                  settings.autoplay && /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Speed",
                      htmlFor: "carousel-autoplay-speed",
                      hint: "Time between slide transitions in milliseconds",
                      children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                        /* @__PURE__ */ jsx(
                          Input,
                          {
                            id: "carousel-autoplay-speed",
                            type: "number",
                            value: settings.autoplaySpeed || 3e3,
                            onChange: (e) => handleNumberInput("autoplaySpeed", e),
                            min: 500,
                            step: 100,
                            className: "h-7 w-[72px] px-1.5 text-[11px] font-mono tabular-nums rounded-md",
                            autoComplete: "off"
                          }
                        ),
                        /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "ms" })
                      ] })
                    }
                  ),
                  settings.autoplay && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: [
                    /* @__PURE__ */ jsx(Timer, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                      "Advances every",
                      " ",
                      /* @__PURE__ */ jsxs("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: [
                        ((settings.autoplaySpeed || 3e3) / 1e3).toFixed(1),
                        "s"
                      ] })
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsxs(
              AccordionSection,
              {
                value: "slides",
                title: "Slides",
                icon: /* @__PURE__ */ jsx(Layers, {}),
                nested: true,
                children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Show",
                      htmlFor: "carousel-slidesToShow",
                      hint: "Number of slides visible at once",
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "carousel-slidesToShow",
                          type: "number",
                          value: settings.slidesToShow || 1,
                          onChange: (e) => handleNumberInput("slidesToShow", e),
                          min: 1,
                          max: 10,
                          className: "h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Scroll",
                      htmlFor: "carousel-slidesToScroll",
                      hint: "Number of slides to advance per interaction",
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          id: "carousel-slidesToScroll",
                          type: "number",
                          value: settings.slidesToScroll || 1,
                          onChange: (e) => handleNumberInput("slidesToScroll", e),
                          min: 1,
                          max: 10,
                          className: "h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                    /* @__PURE__ */ jsx(LayoutGrid, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                      "Showing",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: settings.slidesToShow || 1 }),
                      ", scrolling",
                      " ",
                      /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: settings.slidesToScroll || 1 }),
                      " ",
                      "at a time"
                    ] })
                  ] })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              AccordionSection,
              {
                value: "responsive",
                title: "Responsive",
                icon: /* @__PURE__ */ jsx(MonitorSmartphone, {}),
                nested: true,
                children: /* @__PURE__ */ jsxs(ConfigSection, { children: [
                  /* @__PURE__ */ jsx(
                    ConfigField,
                    {
                      label: "Breakpoints",
                      hint: "JSON breakpoint configuration for responsive slide counts",
                      vertical: true,
                      children: /* @__PURE__ */ jsx(
                        Input,
                        {
                          type: "text",
                          value: settings.breakpoints ? JSON.stringify(settings.breakpoints) : "",
                          onChange: (e) => {
                            try {
                              const parsed = e.target.value ? JSON.parse(e.target.value) : void 0;
                              updateSetting("breakpoints", parsed);
                            } catch {
                            }
                          },
                          placeholder: '{"640": {"slidesToShow": 2}}',
                          className: "h-7 w-full px-1.5 text-[11px] font-mono rounded-md",
                          autoComplete: "off"
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5", children: [
                    /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3 text-muted-foreground/40" }),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 leading-tight", children: "Define per-breakpoint overrides as JSON" })
                  ] })
                ] })
              }
            )
          ]
        }
      )
    }
  );
}
export {
  CarouselConfigurationAccordion as default
};
