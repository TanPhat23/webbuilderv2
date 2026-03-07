import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useCallback } from "react";
import { a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-D43pR8IL.js";
import { d as Badge, h as cn, I as Input } from "./prisma-BUnO9f9X.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPf1Vtyb.js";
import { S as Switch } from "./switch-DU67gyjB.js";
import "./project.service-Bci2lGYe.js";
import { d as useSelectedElement, M as useUpdateElement, N as useCMSContentTypes, O as useCMSContent } from "./SelectComponent-Bh8IGRc1.js";
import "sonner";
import { Database, Loader2, FileText, LayoutList, LayoutGrid, Columns3, Type, Calendar, SortAsc, SortDesc, ArrowUpDown, Hash, CheckSquare, Eye, Filter, User, Image, AlignLeft } from "lucide-react";
import "next-themes";
import "socket.io-client";
import "@hookform/resolvers/zod";
import { b as ConfigSection, C as ConfigField, c as ConfigEmpty, S as SectionDivider } from "./AccordionSection-D9IjFlO-.js";
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
import "react-hook-form";
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
const FIELD_ICONS = {
  title: /* @__PURE__ */ jsx(Type, { className: "h-3 w-3" }),
  excerpt: /* @__PURE__ */ jsx(AlignLeft, { className: "h-3 w-3" }),
  content: /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" }),
  image: /* @__PURE__ */ jsx(Image, { className: "h-3 w-3" }),
  author: /* @__PURE__ */ jsx(User, { className: "h-3 w-3" }),
  date: /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3" })
};
const DISPLAY_FIELDS = [
  "title",
  "excerpt",
  "content",
  "image",
  "author",
  "date"
];
const CMSConfiguration = () => {
  const selectedElement = useSelectedElement();
  const updateElement = useUpdateElement();
  const element = selectedElement;
  const settings = element?.settings || {};
  const isListOrGrid = element?.type === "CMSContentList" || element?.type === "CMSContentGrid";
  const isItem = element?.type === "CMSContentItem";
  const isGrid = element?.type === "CMSContentGrid";
  const { data: contentTypes = [], isLoading: isLoadingTypes } = useCMSContentTypes();
  const { contentItems, isFetching: isLoadingItems } = useCMSContent({
    contentTypeId: settings.contentTypeId,
    enabled: !!settings.contentTypeId && isItem
  });
  const updateSettings = useCallback(
    (newSettings) => {
      if (!element) return;
      updateElement(element.id, {
        settings: {
          ...element.settings,
          ...newSettings
        }
      });
    },
    [element, updateElement]
  );
  if (!element) return null;
  const selectedContentType = contentTypes.find(
    (ct) => ct.id === settings.contentTypeId
  );
  const activeFieldCount = settings.fieldsToShow?.length ?? DISPLAY_FIELDS.filter((f) => ["title", "content"].includes(f)).length;
  return /* @__PURE__ */ jsxs(AccordionItem, { value: "cms-config", className: "border-border/40", children: [
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
          /* @__PURE__ */ jsx("span", { className: "shrink-0 text-muted-foreground/60 group-hover/trigger:text-muted-foreground transition-colors duration-150", children: /* @__PURE__ */ jsx(Database, { className: "h-3.5 w-3.5" }) }),
          /* @__PURE__ */ jsx("span", { className: "truncate", children: "CMS Content" }),
          selectedContentType && /* @__PURE__ */ jsx("span", { className: "ml-auto mr-1 shrink-0", children: /* @__PURE__ */ jsx(
            Badge,
            {
              variant: "secondary",
              className: "h-4 px-1.5 text-[9px] font-medium",
              children: selectedContentType.name
            }
          ) })
        ] })
      }
    ),
    /* @__PURE__ */ jsx(AccordionContent, { className: "pb-3 pt-1 px-0.5", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3", children: [
      /* @__PURE__ */ jsxs(
        ConfigSection,
        {
          title: "Data Source",
          icon: /* @__PURE__ */ jsx(Database, { className: "h-3 w-3" }),
          children: [
            /* @__PURE__ */ jsx(
              ConfigField,
              {
                label: "Content Type",
                htmlFor: "contentTypeId",
                hint: "Choose the content type to display from your CMS.",
                children: /* @__PURE__ */ jsxs(
                  Select,
                  {
                    value: settings.contentTypeId || "",
                    onValueChange: (value) => updateSettings({ contentTypeId: value }),
                    disabled: isLoadingTypes,
                    children: [
                      /* @__PURE__ */ jsx(
                        SelectTrigger,
                        {
                          id: "contentTypeId",
                          className: cn(
                            "h-7 w-[140px] px-2 text-[11px] rounded-md",
                            isLoadingTypes && "animate-pulse"
                          ),
                          children: isLoadingTypes ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                            /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Loading..." })
                          ] }) : /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select type..." })
                        }
                      ),
                      /* @__PURE__ */ jsxs(SelectContent, { children: [
                        contentTypes.map((contentType) => /* @__PURE__ */ jsx(SelectItem, { value: contentType.id, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                          /* @__PURE__ */ jsx(Database, { className: "h-3 w-3 text-muted-foreground" }),
                          /* @__PURE__ */ jsx("span", { children: contentType.name || contentType.id })
                        ] }) }, contentType.id)),
                        contentTypes.length === 0 && !isLoadingTypes && /* @__PURE__ */ jsx(SelectItem, { value: "__empty__", disabled: true, children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No content types available" }) })
                      ] })
                    ]
                  }
                )
              }
            ),
            !settings.contentTypeId && !isLoadingTypes && /* @__PURE__ */ jsx(
              ConfigEmpty,
              {
                icon: /* @__PURE__ */ jsx(Database, { className: "h-5 w-5" }),
                message: "Select a content type to configure this component"
              }
            ),
            selectedContentType && /* @__PURE__ */ jsx("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: /* @__PURE__ */ jsxs("span", { className: "inline-flex items-center gap-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium", children: [
              /* @__PURE__ */ jsx(Database, { className: "h-2.5 w-2.5" }),
              selectedContentType.name
            ] }) })
          ]
        }
      ),
      isItem && settings.contentTypeId && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsxs(
          ConfigSection,
          {
            title: "Item Selection",
            icon: /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3" }),
            children: [
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Item",
                  htmlFor: "itemSlug",
                  hint: "Choose the specific content item to display.",
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: settings.itemSlug || "",
                      onValueChange: (value) => updateSettings({ itemSlug: value }),
                      disabled: isLoadingItems || !settings.contentTypeId,
                      children: [
                        /* @__PURE__ */ jsx(
                          SelectTrigger,
                          {
                            id: "itemSlug",
                            className: cn(
                              "h-7 w-[140px] px-2 text-[11px] rounded-md",
                              isLoadingItems && "animate-pulse"
                            ),
                            children: isLoadingItems ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                              /* @__PURE__ */ jsx(Loader2, { className: "h-3 w-3 animate-spin text-muted-foreground" }),
                              /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "Loading..." })
                            ] }) : /* @__PURE__ */ jsx(
                              SelectValue,
                              {
                                placeholder: settings.contentTypeId ? "Select item..." : "Select type first"
                              }
                            )
                          }
                        ),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          contentItems.map((item) => /* @__PURE__ */ jsx(SelectItem, { value: item.slug, children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: item.title || item.slug })
                          ] }) }, item.id)),
                          contentItems.length === 0 && !isLoadingItems && settings.contentTypeId && /* @__PURE__ */ jsx(SelectItem, { value: "__empty__", disabled: true, children: /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: "No items available" }) })
                        ] })
                      ]
                    }
                  )
                }
              ),
              settings.itemSlug && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 animate-in fade-in-0 slide-in-from-top-1 duration-150", children: [
                /* @__PURE__ */ jsx(FileText, { className: "h-3 w-3 text-muted-foreground/40" }),
                /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/50 font-mono", children: settings.itemSlug })
              ] })
            ]
          }
        )
      ] }),
      isListOrGrid && settings.contentTypeId && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsxs(
          ConfigSection,
          {
            title: "Display",
            icon: /* @__PURE__ */ jsx(LayoutGrid, { className: "h-3 w-3" }),
            children: [
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Mode",
                  htmlFor: "displayMode",
                  hint: "Choose between a vertical list layout or a grid layout.",
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: settings.displayMode || "list",
                      onValueChange: (value) => updateSettings({ displayMode: value }),
                      children: [
                        /* @__PURE__ */ jsx(
                          SelectTrigger,
                          {
                            id: "displayMode",
                            className: "h-7 w-[100px] px-2 text-[11px] rounded-md",
                            children: /* @__PURE__ */ jsx(SelectValue, {})
                          }
                        ),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "list", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(LayoutList, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "List" })
                          ] }) }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "grid", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(LayoutGrid, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Grid" })
                          ] }) })
                        ] })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Max items",
                  htmlFor: "limit",
                  hint: "Maximum number of items to display.",
                  children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1", children: [
                    /* @__PURE__ */ jsx(
                      Input,
                      {
                        id: "limit",
                        type: "number",
                        min: 1,
                        max: 100,
                        value: settings.limit || 10,
                        onChange: (e) => updateSettings({
                          limit: parseInt(e.target.value) || 10
                        }),
                        className: "h-7 w-[56px] px-1.5 text-[11px] font-mono tabular-nums text-center rounded-md"
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "text-[10px] text-muted-foreground/60 font-medium select-none", children: "items" })
                  ] })
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                settings.displayMode === "grid" ? /* @__PURE__ */ jsx(Columns3, { className: "h-3 w-3 text-muted-foreground/40" }) : /* @__PURE__ */ jsx(LayoutList, { className: "h-3 w-3 text-muted-foreground/40" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                  "Showing up to",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: settings.limit || 10 }),
                  " ",
                  "items in",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-muted-foreground/70", children: settings.displayMode || "list" }),
                  " ",
                  "view"
                ] })
              ] })
            ]
          }
        )
      ] }),
      isListOrGrid && settings.contentTypeId && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsxs(
          ConfigSection,
          {
            title: "Sorting",
            icon: /* @__PURE__ */ jsx(ArrowUpDown, { className: "h-3 w-3" }),
            children: [
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Sort by",
                  htmlFor: "sortBy",
                  hint: "Which field to sort content items by.",
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: settings.sortBy || "createdAt",
                      onValueChange: (value) => updateSettings({
                        sortBy: value
                      }),
                      children: [
                        /* @__PURE__ */ jsx(
                          SelectTrigger,
                          {
                            id: "sortBy",
                            className: "h-7 w-[120px] px-2 text-[11px] rounded-md",
                            children: /* @__PURE__ */ jsx(SelectValue, {})
                          }
                        ),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "title", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(Type, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Title" })
                          ] }) }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "createdAt", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Created Date" })
                          ] }) }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "updatedAt", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(Calendar, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Updated Date" })
                          ] }) })
                        ] })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsx(
                ConfigField,
                {
                  label: "Order",
                  htmlFor: "sortOrder",
                  hint: "Sort direction — ascending (A→Z, oldest first) or descending (Z→A, newest first).",
                  children: /* @__PURE__ */ jsxs(
                    Select,
                    {
                      value: settings.sortOrder || "desc",
                      onValueChange: (value) => updateSettings({ sortOrder: value }),
                      children: [
                        /* @__PURE__ */ jsx(
                          SelectTrigger,
                          {
                            id: "sortOrder",
                            className: "h-7 w-[110px] px-2 text-[11px] rounded-md",
                            children: /* @__PURE__ */ jsx(SelectValue, {})
                          }
                        ),
                        /* @__PURE__ */ jsxs(SelectContent, { children: [
                          /* @__PURE__ */ jsx(SelectItem, { value: "asc", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(SortAsc, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Ascending" })
                          ] }) }),
                          /* @__PURE__ */ jsx(SelectItem, { value: "desc", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                            /* @__PURE__ */ jsx(SortDesc, { className: "h-3 w-3 text-muted-foreground" }),
                            /* @__PURE__ */ jsx("span", { children: "Descending" })
                          ] }) })
                        ] })
                      ]
                    }
                  )
                }
              ),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-0.5 animate-in fade-in-0 duration-150", children: [
                settings.sortOrder === "asc" ? /* @__PURE__ */ jsx(SortAsc, { className: "h-3 w-3 text-muted-foreground/40" }) : /* @__PURE__ */ jsx(SortDesc, { className: "h-3 w-3 text-muted-foreground/40" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                  "Sorted by",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-muted-foreground/70", children: settings.sortBy || "createdAt" }),
                  ",",
                  " ",
                  /* @__PURE__ */ jsx("span", { className: "font-medium text-muted-foreground/70", children: settings.sortOrder === "asc" ? "ascending" : "descending" })
                ] })
              ] })
            ]
          }
        )
      ] }),
      isGrid && settings.contentTypeId && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsxs(
          ConfigSection,
          {
            title: "Visible Fields",
            icon: /* @__PURE__ */ jsx(Eye, { className: "h-3 w-3" }),
            children: [
              /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-1", children: DISPLAY_FIELDS.map((field) => {
                const isActive = settings.fieldsToShow?.includes(field) ?? ["title", "content"].includes(field);
                return /* @__PURE__ */ jsxs(
                  "div",
                  {
                    className: cn(
                      "flex items-center justify-between gap-2",
                      "rounded-md px-2 py-1.5",
                      "transition-colors duration-150",
                      isActive ? "bg-muted/30" : "bg-transparent hover:bg-muted/10"
                    ),
                    children: [
                      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cn(
                              "flex items-center justify-center",
                              "h-5 w-5 rounded-md shrink-0",
                              isActive ? "bg-foreground/5 text-foreground/60" : "bg-muted/30 text-muted-foreground/40",
                              "transition-colors duration-150"
                            ),
                            children: FIELD_ICONS[field] ?? /* @__PURE__ */ jsx(Hash, { className: "h-3 w-3" })
                          }
                        ),
                        /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: cn(
                              "text-[11px] font-medium capitalize truncate",
                              isActive ? "text-foreground/80" : "text-muted-foreground/60",
                              "transition-colors duration-150"
                            ),
                            children: field
                          }
                        )
                      ] }),
                      /* @__PURE__ */ jsx(
                        Switch,
                        {
                          id: `field-${field}`,
                          checked: isActive,
                          onCheckedChange: (checked) => {
                            const currentFields = settings.fieldsToShow || [
                              "title",
                              "content"
                            ];
                            const newFields = checked ? [...currentFields, field] : currentFields.filter((f) => f !== field);
                            updateSettings({ fieldsToShow: newFields });
                          },
                          className: "scale-[0.65] origin-right"
                        }
                      )
                    ]
                  },
                  field
                );
              }) }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 pl-0.5 pt-1 animate-in fade-in-0 duration-150", children: [
                /* @__PURE__ */ jsx(CheckSquare, { className: "h-3 w-3 text-muted-foreground/40" }),
                /* @__PURE__ */ jsxs("span", { className: "text-[10px] text-muted-foreground/50", children: [
                  /* @__PURE__ */ jsx("span", { className: "font-mono tabular-nums font-medium text-muted-foreground/70", children: activeFieldCount }),
                  " ",
                  activeFieldCount === 1 ? "field" : "fields",
                  " visible in grid"
                ] })
              ] })
            ]
          }
        )
      ] }),
      isListOrGrid && settings.contentTypeId && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(SectionDivider, {}),
        /* @__PURE__ */ jsx(
          ConfigSection,
          {
            title: "Filters",
            icon: /* @__PURE__ */ jsx(Filter, { className: "h-3 w-3" }),
            children: /* @__PURE__ */ jsx(
              ConfigEmpty,
              {
                icon: /* @__PURE__ */ jsx(Filter, { className: "h-5 w-5" }),
                message: "Advanced filtering options coming soon"
              }
            )
          }
        )
      ] })
    ] }) })
  ] });
};
export {
  CMSConfiguration as default
};
