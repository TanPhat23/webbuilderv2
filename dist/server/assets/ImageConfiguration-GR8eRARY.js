import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import { h as cn, T as Tabs, e as TabsList, f as TabsTrigger, g as TabsContent, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import "./project.service-Bci2lGYe.js";
import { M as useUpdateElement, d as useSelectedElement } from "./SelectComponent-Bh8IGRc1.js";
import { toast } from "sonner";
import { i as imageService } from "./image.service-CVf4pEil.js";
import { ImageIcon, CheckCircle2, Link2, Upload, X, FileImage, Loader2, AlertCircle, Type, Maximize2, Zap, Eye } from "lucide-react";
import { S as SectionDivider, b as ConfigSection, C as ConfigField } from "./AccordionSection-D9IjFlO-.js";
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
const OBJECT_FIT_OPTIONS = [
  { value: "cover", label: "Cover", description: "Fill and crop to fit" },
  {
    value: "contain",
    label: "Contain",
    description: "Fit inside, may letterbox"
  },
  { value: "fill", label: "Fill", description: "Stretch to fill" },
  { value: "none", label: "None", description: "Original size" },
  {
    value: "scale-down",
    label: "Scale Down",
    description: "Smaller of none or contain"
  }
];
const ImageConfiguration = () => {
  const updateElement = useUpdateElement();
  const selectedElement = useSelectedElement();
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  if (!selectedElement || selectedElement.type !== "Image") {
    return null;
  }
  const src = selectedElement.src ?? "";
  const alt = selectedElement.name ?? "";
  const objectFit = selectedElement.settings?.objectFit ?? "cover";
  const loading = selectedElement.settings?.loading ?? "lazy";
  const decoding = selectedElement.settings?.decoding ?? "async";
  const handleSrcChange = (e) => {
    updateElement(selectedElement.id, { src: e.target.value });
  };
  const handleAltChange = (e) => {
    updateElement(selectedElement.id, { name: e.target.value });
  };
  const updateSetting = (key, value) => {
    updateElement(selectedElement.id, {
      settings: { ...selectedElement.settings, [key]: value }
    });
  };
  const processFile = async (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }
    setIsUploading(true);
    try {
      const response = await imageService.uploadImage(file, file.name);
      updateElement(selectedElement.id, {
        src: response.imageLink,
        name: response.imageName || file.name
      });
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processFile(file);
  };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => {
    setIsDragOver(false);
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleClearSrc = () => {
    updateElement(selectedElement.id, { src: "" });
  };
  const hasImage = src.length > 0;
  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");
  const fileName = src.split("/").pop()?.split("?")[0] ?? "";
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "image-settings", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(ImageIcon, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "Image" }),
          hasImage && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-500/60" }) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(Tabs, { defaultValue: hasImage ? "url" : "upload", className: "w-full", children: [
        /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2 h-8 rounded-lg bg-muted/40 p-0.5", children: [
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "url",
              className: "text-[11px] rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-7",
              children: [
                /* @__PURE__ */ jsx(Link2, { className: "h-3 w-3 mr-1.5" }),
                "URL"
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            TabsTrigger,
            {
              value: "upload",
              className: "text-[11px] rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm h-7",
              children: [
                /* @__PURE__ */ jsx(Upload, { className: "h-3 w-3 mr-1.5" }),
                "Upload"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsx(TabsContent, { value: "url", className: "mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsx(
              Input,
              {
                type: "text",
                value: src,
                onChange: handleSrcChange,
                placeholder: "https://example.com/image.jpg",
                className: cn(
                  "h-7 flex-1 px-2 text-[11px] font-mono rounded-md",
                  "border-border/50 bg-muted/20",
                  "placeholder:text-muted-foreground/30",
                  "focus:border-foreground/20 focus:ring-1 focus:ring-foreground/10"
                ),
                autoComplete: "off"
              }
            ),
            hasImage && /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                onClick: handleClearSrc,
                className: cn(
                  "flex items-center justify-center",
                  "h-7 w-7 rounded-md shrink-0",
                  "text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10",
                  "transition-all duration-150 outline-none"
                ),
                children: /* @__PURE__ */ jsx(X, { className: "h-3.5 w-3.5" })
              }
            )
          ] }),
          hasImage && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: [
            isExternalUrl ? /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 text-[10px] font-medium", children: [
              /* @__PURE__ */ jsx(Link2, { className: "h-2.5 w-2.5" }),
              "External"
            ] }) : /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium", children: [
              /* @__PURE__ */ jsx(FileImage, { className: "h-2.5 w-2.5" }),
              "Uploaded"
            ] }),
            fileName && /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 font-mono truncate max-w-[120px]", children: fileName })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(TabsContent, { value: "upload", className: "mt-2", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: fileInputRef,
              type: "file",
              accept: "image/*",
              onChange: handleFileUpload,
              className: "hidden"
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              onDrop: handleDrop,
              onDragOver: handleDragOver,
              onDragLeave: handleDragLeave,
              onClick: handleUploadClick,
              className: cn(
                "flex flex-col items-center justify-center gap-2 py-5 px-3",
                "rounded-lg border-2 border-dashed cursor-pointer",
                "transition-all duration-200 ease-out",
                isDragOver ? "border-primary/50 bg-primary/5 scale-[1.01]" : "border-border/40 bg-muted/10 hover:border-border/60 hover:bg-muted/20",
                isUploading && "pointer-events-none opacity-60"
              ),
              children: isUploading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("div", { className: "relative", children: /* @__PURE__ */ jsx(Loader2, { className: "h-6 w-6 text-primary animate-spin" }) }),
                /* @__PURE__ */ jsx("span", { className: "text-[11px] text-muted-foreground font-medium", children: "Uploading..." })
              ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: cn(
                      "flex items-center justify-center",
                      "h-9 w-9 rounded-lg bg-muted/40",
                      "transition-colors duration-150",
                      isDragOver && "bg-primary/10"
                    ),
                    children: /* @__PURE__ */ jsx(
                      Upload,
                      {
                        className: cn(
                          "h-4 w-4",
                          isDragOver ? "text-primary" : "text-muted-foreground/50"
                        )
                      }
                    )
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-0.5", children: [
                  /* @__PURE__ */ jsx("span", { className: "text-[11px] font-medium text-foreground/70", children: isDragOver ? "Drop image here" : "Click or drag to upload" }),
                  /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "PNG, JPG, WebP, SVG • Max 5MB" })
                ] })
              ] })
            }
          )
        ] }) })
      ] }),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Accessibility",
          icon: /* @__PURE__ */ jsx(Type, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Alt text",
                htmlFor: "image-alt",
                hint: "Descriptive text for screen readers and SEO. Critical for accessibility.",
                children: /* @__PURE__ */ jsx(
                  Input,
                  {
                    id: "image-alt",
                    type: "text",
                    value: alt,
                    onChange: handleAltChange,
                    placeholder: "Describe the image...",
                    className: "h-7 w-full max-w-[160px] px-2 text-[11px] rounded-md",
                    autoComplete: "off"
                  }
                )
              }
            ),
            hasImage && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 duration-150", children: alt.length > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3 w-3 text-emerald-500/60" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600/60 dark:text-emerald-400/60", children: "Alt text provided" })
            ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(AlertCircle, { className: "h-3 w-3 text-amber-500/60" }),
              /* @__PURE__ */ jsx("span", { className: "text-[10px] text-amber-600/60 dark:text-amber-400/60", children: "Missing alt text — add for better accessibility" })
            ] }) })
          ]
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsx(
        ConfigSection,
        {
          title: "Display",
          icon: /* @__PURE__ */ jsx(Maximize2, { className: "h-3 w-3" }),
          children: /* @__PURE__ */ jsx(
            ConfigField,
            {
              label: "Object Fit",
              htmlFor: "object-fit",
              hint: "How the image should fill its container",
              children: /* @__PURE__ */ jsxs(
                Select,
                {
                  value: objectFit,
                  onValueChange: (v) => updateSetting(
                    "objectFit",
                    v
                  ),
                  children: [
                    /* @__PURE__ */ jsx(
                      SelectTrigger,
                      {
                        id: "object-fit",
                        className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
                        children: /* @__PURE__ */ jsx(SelectValue, {})
                      }
                    ),
                    /* @__PURE__ */ jsx(SelectContent, { children: OBJECT_FIT_OPTIONS.map((opt) => /* @__PURE__ */ jsx(SelectItem, { value: opt.value, children: /* @__PURE__ */ jsx("div", { className: "flex flex-col", children: /* @__PURE__ */ jsx("span", { children: opt.label }) }) }, opt.value)) })
                  ]
                }
              )
            }
          )
        }
      ),
      /* @__PURE__ */ jsx(SectionDivider, {}),
      /* @__PURE__ */ jsxs(ConfigSection, { title: "Performance", icon: /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3" }), children: [
        /* @__PURE__ */ jsx(
          ConfigField,
          {
            label: "Loading",
            htmlFor: "image-loading",
            hint: "'Lazy' defers loading until the image enters the viewport — recommended for below-the-fold images.",
            children: /* @__PURE__ */ jsxs(
              Select,
              {
                value: loading,
                onValueChange: (v) => updateSetting("loading", v),
                children: [
                  /* @__PURE__ */ jsx(
                    SelectTrigger,
                    {
                      id: "image-loading",
                      className: "h-7 w-[90px] px-2 text-[11px] rounded-md",
                      children: /* @__PURE__ */ jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "lazy", children: "Lazy" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "eager", children: "Eager" })
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsx(
          ConfigField,
          {
            label: "Decoding",
            htmlFor: "image-decoding",
            hint: "'Async' allows the browser to decode the image off the main thread — recommended for performance.",
            children: /* @__PURE__ */ jsxs(
              Select,
              {
                value: decoding,
                onValueChange: (v) => updateSetting("decoding", v),
                children: [
                  /* @__PURE__ */ jsx(
                    SelectTrigger,
                    {
                      id: "image-decoding",
                      className: "h-7 w-[90px] px-2 text-[11px] rounded-md",
                      children: /* @__PURE__ */ jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsx(SelectItem, { value: "async", children: "Async" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "sync", children: "Sync" }),
                    /* @__PURE__ */ jsx(SelectItem, { value: "auto", children: "Auto" })
                  ] })
                ]
              }
            )
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: loading === "lazy" && decoding === "async" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-emerald-500/60" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-emerald-600/60 dark:text-emerald-400/60", children: "Optimized for performance" })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Zap, { className: "h-3 w-3 text-muted-foreground/40" }),
          /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50", children: "Consider lazy loading + async decoding" })
        ] }) })
      ] }),
      hasImage && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsx(ConfigSection, { title: "Preview", icon: /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }), children: /* @__PURE__ */ jsx(
          "div",
          {
            className: cn(
              "w-full h-28 rounded-lg overflow-hidden",
              "bg-muted/20 border border-border/30",
              "ring-1 ring-border/10"
            ),
            children: /* @__PURE__ */ jsx(
              "img",
              {
                src,
                alt: alt || "Preview",
                className: "w-full h-full transition-all duration-300",
                style: {
                  objectFit
                },
                onError: (e) => {
                  const target = e.currentTarget;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent && !parent.querySelector("[data-error]")) {
                    const errorEl = document.createElement("div");
                    errorEl.setAttribute("data-error", "true");
                    errorEl.className = "flex flex-col items-center justify-center gap-1 h-full text-muted-foreground/40";
                    errorEl.innerHTML = `
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                          <span class="text-[10px]">Failed to load image</span>
                        `;
                    parent.appendChild(errorEl);
                  }
                }
              }
            )
          }
        ) })
      ] })
    ] }) })
  ] });
};
export {
  ImageConfiguration
};
