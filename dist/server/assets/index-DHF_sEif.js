import { jsx, jsxs } from "react/jsx-runtime";
import React__default, { useState, useCallback, useMemo, Suspense } from "react";
import "clsx";
import { f as Badge, B as Button, j as cn, O as Label, Y as Empty, Z as EmptyHeader, _ as EmptyMedia, $ as EmptyTitle, a0 as EmptyDescription, a1 as EmptyContent, I as Input } from "./prisma-Cq49YOYM.js";
import "sonner";
import "next-themes";
import "socket.io-client";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { C as Checkbox } from "./checkbox-BX2VzNwa.js";
import { Download, Layers, Eye, Heart, CheckCircle2, Loader2, ChevronDown, Sparkles, AlertCircle, Search, X } from "lucide-react";
import "@hookform/resolvers/zod";
import { a as useDownloadMarketplaceItem, b as useIncrementLikes, c as useCategories, u as useMarketplaceItems } from "./useMarketplace-8BTY40FU.js";
import { u as useInView } from "./useInView-BXOOtJcA.js";
import { C as Card, a as CardContent, e as CardFooter } from "./card-LOcGasZb.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CPjHyyea.js";
import { S as Skeleton } from "./skeleton-Dtq0gYt7.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "uuid";
import "class-variance-authority";
import "radix-ui";
import "tailwind-merge";
import "react-hook-form";
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
import "@tanstack/react-query";
import "@prisma/adapter-pg";
import "node:path";
import "node:url";
import "@prisma/client/runtime/client";
function MarketplaceCard({ item }) {
  const [isLiked, setIsLiked] = useState(false);
  const downloadItem = useDownloadMarketplaceItem();
  const incrementLikes = useIncrementLikes();
  const navigate = useNavigate();
  const getTemplateTypeLabel = (type) => {
    switch (type) {
      case "full-site":
        return "Full Site";
      case "page":
        return "Page";
      case "section":
        return "Section";
      case "block":
        return "Block";
      default:
        return type;
    }
  };
  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newProject = await downloadItem.mutateAsync(item.id);
      navigate({ to: `/editor/${newProject.id}` });
    } catch (error) {
      console.error("Failed to download template:", error);
    }
  };
  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) return;
    try {
      await incrementLikes.mutateAsync(item.id);
      setIsLiked(true);
    } catch (error) {
      console.error("Failed to like item:", error);
    }
  };
  return /* @__PURE__ */ jsx("a", { href: `/marketplace/${item.id}`, children: /* @__PURE__ */ jsxs(Card, { className: "group overflow-hidden hover:shadow-lg transition-all duration-300 border-border bg-card p-0 h-full flex flex-col cursor-pointer", children: [
    /* @__PURE__ */ jsxs("div", { className: "relative aspect-video overflow-hidden bg-muted", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: item.preview || "/placeholder.svg",
          alt: item.title,
          className: "object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" }),
      /* @__PURE__ */ jsx("div", { className: "absolute top-3 left-3", children: /* @__PURE__ */ jsx(
        Badge,
        {
          variant: "secondary",
          className: "text-xs backdrop-blur-sm bg-background/80",
          children: getTemplateTypeLabel(item.templateType)
        }
      ) }),
      /* @__PURE__ */ jsx(
        Button,
        {
          size: "icon",
          variant: "secondary",
          onClick: handleDownload,
          disabled: downloadItem.isPending,
          className: "absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm bg-background/80 hover:bg-background",
          children: /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-4 flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold text-base leading-tight line-clamp-1", children: item.title }),
        item.featured && /* @__PURE__ */ jsx(Badge, { variant: "secondary", className: "text-xs shrink-0", children: "Featured" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground line-clamp-2 mb-3", children: item.description }),
      item.pageCount && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground mb-2", children: [
        /* @__PURE__ */ jsx(Layers, { className: "h-3.5 w-3.5" }),
        /* @__PURE__ */ jsxs("span", { children: [
          item.pageCount,
          " pages included"
        ] })
      ] }),
      item.tags && item.tags.length > 0 && /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 mb-3", children: [
        item.tags.slice(0, 3).map((tag, index) => /* @__PURE__ */ jsx(
          Badge,
          {
            variant: "outline",
            className: "text-xs",
            children: typeof tag === "string" ? tag : tag?.name || tag?.id || "Unknown"
          },
          `tag-${typeof tag === "string" ? tag : tag?.name || tag?.id || index}`
        )),
        item.tags.length > 3 && /* @__PURE__ */ jsxs(Badge, { variant: "outline", className: "text-xs", children: [
          "+",
          item.tags.length - 3
        ] })
      ] }),
      item.categories && item.categories.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-auto", children: item.categories.slice(0, 2).map((category, index) => /* @__PURE__ */ jsx(
        Badge,
        {
          variant: "secondary",
          className: "text-xs",
          children: category.name
        },
        `category-${category.id || index}`
      )) })
    ] }),
    /* @__PURE__ */ jsxs(CardFooter, { className: "p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: (e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate({ to: `/marketplace/${item.id}` });
            },
            className: "flex items-center gap-1 hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsx(Eye, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: "View Details" })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleDownload,
            disabled: downloadItem.isPending,
            className: "flex items-center gap-1 hover:text-foreground transition-colors",
            children: [
              /* @__PURE__ */ jsx(Download, { className: "h-3.5 w-3.5" }),
              /* @__PURE__ */ jsx("span", { children: (item.downloads || 0).toLocaleString() })
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: handleLike,
            disabled: incrementLikes.isPending || isLiked,
            className: cn(
              "flex items-center gap-1 hover:text-red-500 transition-colors",
              isLiked && "text-red-500"
            ),
            children: [
              /* @__PURE__ */ jsx(Heart, { className: cn("h-3.5 w-3.5", isLiked && "fill-current") }),
              /* @__PURE__ */ jsx("span", { children: (item.likes || 0).toLocaleString() })
            ]
          }
        )
      ] }),
      item.author && /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5 text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsx("span", { className: "line-clamp-1 text-xs", children: item.author.name }),
        item.author.verified && /* @__PURE__ */ jsx(CheckCircle2, { className: "h-3.5 w-3.5 text-blue-500 shrink-0" })
      ] })
    ] })
  ] }) });
}
function MarketplaceCardSkeleton() {
  return /* @__PURE__ */ jsxs(Card, { className: "overflow-hidden border-border bg-card p-0 h-full flex flex-col", children: [
    /* @__PURE__ */ jsx(Skeleton, { className: "aspect-video w-full" }),
    /* @__PURE__ */ jsxs(CardContent, { className: "p-4 flex-1 flex flex-col", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2 mb-2", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-6 w-3/4" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-16 shrink-0" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2 mb-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-full" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-5/6" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-32 mb-2" }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-1.5 mb-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-16" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-20" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-14" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5 mt-auto", children: /* @__PURE__ */ jsx(Skeleton, { className: "h-5 w-24" }) })
    ] }),
    /* @__PURE__ */ jsxs(CardFooter, { className: "p-4 pt-0 flex items-center justify-between border-t border-border/50 mt-auto", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-12" }),
        /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-12" })
      ] }),
      /* @__PURE__ */ jsx(Skeleton, { className: "h-4 w-20" })
    ] })
  ] });
}
const TEMPLATE_TYPES = [
  { id: "full-site", label: "Full Website" },
  { id: "page", label: "Single Page" },
  { id: "section", label: "Section" },
  { id: "block", label: "Block" }
];
function MarketplaceFilters() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const currentTemplateType = search.templateType;
  const currentCategoryId = search.categoryId;
  const currentFeatured = search.featured === "true";
  const updateFilter = useCallback(
    (key, value) => {
      const next = { ...search };
      if (value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      navigate({ to: "/marketplace", search: next });
    },
    [search, navigate]
  );
  const toggleTemplateType = (type) => {
    if (currentTemplateType === type) {
      updateFilter("templateType", null);
    } else {
      updateFilter("templateType", type);
    }
  };
  const toggleCategory = (categoryId) => {
    if (currentCategoryId === categoryId) {
      updateFilter("categoryId", null);
    } else {
      updateFilter("categoryId", categoryId);
    }
  };
  const toggleFeatured = () => {
    if (currentFeatured) {
      updateFilter("featured", null);
    } else {
      updateFilter("featured", "true");
    }
  };
  const clearAllFilters = () => {
    navigate({ to: "/marketplace" });
  };
  const hasActiveFilters = currentTemplateType || currentCategoryId || currentFeatured;
  return /* @__PURE__ */ jsx("aside", { className: "w-full md:w-64 flex-shrink-0", children: /* @__PURE__ */ jsxs("div", { className: "sticky top-4 space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold", children: "Filter Templates" }),
      hasActiveFilters && /* @__PURE__ */ jsx(
        Button,
        {
          variant: "ghost",
          size: "sm",
          onClick: clearAllFilters,
          className: "h-auto p-0 text-xs text-muted-foreground hover:text-foreground",
          children: "Clear all"
        }
      )
    ] }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Category", defaultOpen: true, children: isCategoriesLoading ? /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center py-4", children: /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin text-muted-foreground" }) }) : categories && categories.length > 0 ? /* @__PURE__ */ jsx("div", { className: "space-y-3 pl-1", children: categories.map((category, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          id: `category-${category.id}`,
          checked: currentCategoryId === category.id,
          onCheckedChange: () => toggleCategory(category.id)
        }
      ),
      /* @__PURE__ */ jsxs(
        Label,
        {
          htmlFor: `category-${category.id}`,
          className: "text-sm text-muted-foreground cursor-pointer flex items-center justify-between flex-1",
          children: [
            /* @__PURE__ */ jsx("span", { children: category.name }),
            category.count !== void 0 && /* @__PURE__ */ jsx("span", { className: "text-xs", children: category.count })
          ]
        }
      )
    ] }, `category-${category.id || index}`)) }) : /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground pl-1", children: "No categories available" }) }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Template Type", defaultOpen: true, children: /* @__PURE__ */ jsx("div", { className: "space-y-3 pl-1", children: TEMPLATE_TYPES.map((type, index) => /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          id: `type-${type.id}`,
          checked: currentTemplateType === type.id,
          onCheckedChange: () => toggleTemplateType(type.id)
        }
      ),
      /* @__PURE__ */ jsx(
        Label,
        {
          htmlFor: `type-${type.id}`,
          className: "text-sm text-muted-foreground cursor-pointer",
          children: type.label
        }
      )
    ] }, `type-${type.id || index}`)) }) }),
    /* @__PURE__ */ jsx(FilterSection, { title: "Features", defaultOpen: true, children: /* @__PURE__ */ jsx("div", { className: "space-y-3 pl-1", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-2", children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          id: "featured",
          checked: currentFeatured,
          onCheckedChange: toggleFeatured
        }
      ),
      /* @__PURE__ */ jsx(
        Label,
        {
          htmlFor: "featured",
          className: "text-sm text-muted-foreground cursor-pointer",
          children: "Featured Only"
        }
      )
    ] }) }) })
  ] }) });
}
function FilterSection({
  title,
  children,
  defaultOpen = false
}) {
  const [isOpen, setIsOpen] = React__default.useState(defaultOpen);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center justify-between w-full text-sm font-medium",
        children: [
          title,
          /* @__PURE__ */ jsx(
            ChevronDown,
            {
              className: cn("h-4 w-4 transition-transform", isOpen && "rotate-180")
            }
          )
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { children })
  ] });
}
const footerSections = [
  {
    title: "Marketplace",
    links: ["Browse Templates", "Upload Template", "Categories", "Featured", "Popular"]
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact", "Press"]
  },
  {
    title: "Support",
    links: [
      "Help Center",
      "Community",
      "Privacy Policy",
      "Terms of Service",
      "Status"
    ]
  }
];
const socialLinks = ["Twitter", "LinkedIn", "GitHub", "Discord"];
function MarketplaceFooter() {
  const [ref, inView] = useInView();
  return /* @__PURE__ */ jsx(
    "footer",
    {
      ref,
      className: "border-t border-border/50 py-16 bg-background/50 backdrop-blur-sm",
      children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 lg:px-6", children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `grid md:grid-cols-4 gap-12 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
                /* @__PURE__ */ jsxs("div", { className: "flex items-center space-x-3 group", children: [
                  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg", children: /* @__PURE__ */ jsx(Sparkles, { className: "w-6 h-6 text-primary-foreground" }) }),
                  /* @__PURE__ */ jsx("span", { className: "text-2xl font-bold", children: "WebBuilder" })
                ] }),
                /* @__PURE__ */ jsx("p", { className: "text-muted-foreground leading-relaxed max-w-sm", children: "Discover and share professional website templates with our community marketplace." })
              ] }),
              footerSections.map((section, index) => /* @__PURE__ */ jsxs(
                "div",
                {
                  className: `transition-all duration-700 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
                  style: {
                    transitionDelay: `${(index + 1) * 150}ms`
                  },
                  children: [
                    /* @__PURE__ */ jsx("h3", { className: "font-semibold text-lg mb-6", children: section.title }),
                    /* @__PURE__ */ jsx("ul", { className: "space-y-3", children: section.links.map((link, linkIndex) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
                      "a",
                      {
                        href: "#",
                        className: "text-muted-foreground hover:text-foreground transition-all duration-300 hover:translate-x-1 inline-block",
                        children: link
                      }
                    ) }, linkIndex)) })
                  ]
                },
                index
              ))
            ]
          }
        ),
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: `border-t border-border/50 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 transition-all duration-1000 delay-300 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`,
            children: [
              /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground", children: [
                "© ",
                (/* @__PURE__ */ new Date()).getFullYear(),
                " WebBuilder. All rights reserved."
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex space-x-8", children: socialLinks.map((social, index) => /* @__PURE__ */ jsx(
                "a",
                {
                  href: "#",
                  className: `text-muted-foreground hover:text-foreground transition-all duration-500 hover:scale-110 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`,
                  style: {
                    transitionDelay: `${600 + index * 100}ms`
                  },
                  children: social
                },
                social
              )) })
            ]
          }
        )
      ] })
    }
  );
}
function MarketplaceGrid() {
  const navigate = useNavigate();
  const searchParams = useSearch({ strict: false });
  const [displayCount, setDisplayCount] = useState(12);
  const filters = useMemo(() => {
    const params = {};
    if (searchParams.templateType) {
      params.templateType = searchParams.templateType;
    }
    if (searchParams.featured != null) {
      params.featured = searchParams.featured === "true";
    }
    if (searchParams.categoryId) {
      params.categoryId = searchParams.categoryId;
    }
    if (searchParams.tags) {
      params.tags = searchParams.tags.split(",").filter(Boolean);
    }
    if (searchParams.search) {
      params.search = searchParams.search;
    }
    if (searchParams.authorId) {
      params.authorId = searchParams.authorId;
    }
    return params;
  }, [searchParams]);
  const {
    data: items,
    isLoading,
    isError,
    error
  } = useMarketplaceItems(filters);
  const itemsArray = Array.isArray(items) ? items : [];
  const handleSortChange = (value) => {
    const sortMap = {
      popular: { sortBy: "downloads", sortOrder: "desc" },
      recent: { sortBy: "createdAt", sortOrder: "desc" },
      downloads: { sortBy: "downloads", sortOrder: "desc" },
      likes: { sortBy: "likes", sortOrder: "desc" },
      "title-asc": { sortBy: "title", sortOrder: "asc" },
      "title-desc": { sortBy: "title", sortOrder: "desc" }
    };
    const next = { ...searchParams, ...sortMap[value] ?? {} };
    if (!sortMap[value]) {
      delete next.sortBy;
      delete next.sortOrder;
    }
    navigate({ to: "/marketplace", search: next });
  };
  const loadMore = () => {
    setDisplayCount((prev) => prev + 12);
  };
  const getCurrentSort = () => {
    const { sortBy, sortOrder } = searchParams;
    if (sortBy === "downloads" && sortOrder === "desc") return "downloads";
    if (sortBy === "likes" && sortOrder === "desc") return "likes";
    if (sortBy === "createdAt" && sortOrder === "desc") return "recent";
    if (sortBy === "title" && sortOrder === "asc") return "title-asc";
    if (sortBy === "title" && sortOrder === "desc") return "title-desc";
    return "popular";
  };
  if (isLoading) {
    return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Loading templates..." }),
        /* @__PURE__ */ jsx("div", { className: "w-[180px] h-9 bg-muted rounded-md animate-pulse" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ jsx(MarketplaceCardSkeleton, {}, index)) })
    ] });
  }
  if (isError) {
    return /* @__PURE__ */ jsxs(Empty, { children: [
      /* @__PURE__ */ jsxs(EmptyHeader, { children: [
        /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(AlertCircle, {}) }),
        /* @__PURE__ */ jsx(EmptyTitle, { children: "Failed to load templates" }),
        /* @__PURE__ */ jsx(EmptyDescription, { children: error instanceof Error ? error.message : "An error occurred" })
      ] }),
      /* @__PURE__ */ jsx(EmptyContent, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => window.location.reload(), children: "Try Again" }) })
    ] });
  }
  if (itemsArray.length === 0) {
    return /* @__PURE__ */ jsxs(Empty, { children: [
      /* @__PURE__ */ jsxs(EmptyHeader, { children: [
        /* @__PURE__ */ jsx(EmptyMedia, { variant: "icon", children: /* @__PURE__ */ jsx(Search, {}) }),
        /* @__PURE__ */ jsx(EmptyTitle, { children: "No templates found" }),
        /* @__PURE__ */ jsx(EmptyDescription, { children: "Try adjusting your filters or search query" })
      ] }),
      /* @__PURE__ */ jsx(EmptyContent, { children: /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => navigate({ to: "/marketplace" }), children: "Clear Filters" }) })
    ] });
  }
  const displayedItems = itemsArray.slice(0, displayCount);
  const hasMore = displayCount < itemsArray.length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
        "Showing ",
        displayedItems.length,
        " of ",
        itemsArray.length,
        " templates"
      ] }),
      /* @__PURE__ */ jsxs(Select, { value: getCurrentSort(), onValueChange: handleSortChange, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { className: "w-[180px]", children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sort by" }) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "popular", children: "Most Popular" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "recent", children: "Most Recent" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "downloads", children: "Most Downloaded" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "likes", children: "Most Liked" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "title-asc", children: "Title (A-Z)" }),
          /* @__PURE__ */ jsx(SelectItem, { value: "title-desc", children: "Title (Z-A)" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: displayedItems.map((item, index) => /* @__PURE__ */ jsx(MarketplaceCard, { item }, `item-${item.id || index}`)) }),
    hasMore && /* @__PURE__ */ jsx("div", { className: "flex justify-center pt-4", children: /* @__PURE__ */ jsx(Button, { onClick: loadMore, variant: "outline", size: "lg", children: "Load More Templates" }) })
  ] });
}
function MarketplaceHero() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false });
  const [searchQuery, setSearchQuery] = useState(search.search || "");
  const handleSearch = (e) => {
    e.preventDefault();
    navigate({
      to: "/marketplace",
      search: searchQuery.trim() ? { search: searchQuery.trim() } : {}
    });
  };
  const handleClearSearch = () => {
    setSearchQuery("");
    navigate({ to: "/marketplace", search: {} });
  };
  return /* @__PURE__ */ jsx("section", { className: "border-b border-border bg-background", children: /* @__PURE__ */ jsxs("div", { className: "container mx-auto px-4 py-12 text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold mb-4", children: "Template Marketplace" }),
    /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-lg mb-8 max-w-2xl mx-auto", children: "Discover and download professionally designed templates for your projects." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "max-w-xl mx-auto relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
      /* @__PURE__ */ jsx(
        Input,
        {
          value: searchQuery,
          onChange: (e) => setSearchQuery(e.target.value),
          placeholder: "Search templates...",
          className: "pl-10 pr-10"
        }
      ),
      searchQuery && /* @__PURE__ */ jsx(
        Button,
        {
          type: "button",
          variant: "ghost",
          size: "icon",
          className: "absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7",
          onClick: handleClearSearch,
          children: /* @__PURE__ */ jsx(X, { className: "h-3 w-3" })
        }
      )
    ] })
  ] }) });
}
function MarketplacePage() {
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen w-screen bg-background", children: [
    /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "h-24" }), children: /* @__PURE__ */ jsx(MarketplaceHero, {}) }),
    /* @__PURE__ */ jsx("section", { className: "py-16 px-4", children: /* @__PURE__ */ jsx("div", { className: "container mx-auto", children: /* @__PURE__ */ jsxs("div", { className: "flex gap-8", children: [
      /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "w-64" }), children: /* @__PURE__ */ jsx(MarketplaceFilters, {}) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { className: "flex-1" }), children: /* @__PURE__ */ jsx(MarketplaceGrid, {}) }) })
    ] }) }) }),
    /* @__PURE__ */ jsx(MarketplaceFooter, {})
  ] });
}
export {
  MarketplacePage as component
};
