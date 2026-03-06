import { jsxs, jsx } from "react/jsx-runtime";
import { ah as usePageStore, t as Sidebar, u as SidebarHeader, z as SidebarContent, B as Button, j as cn, S as SidebarProvider } from "./prisma-Cq49YOYM.js";
import { A as Accordion, a as AccordionItem, c as AccordionTrigger, b as AccordionContent } from "./accordion-Dg3retHz.js";
import { LayoutTemplate, FileText, Layers, GripVertical, MoveUp, MoveDown, Trash2 } from "lucide-react";
import { S as ScrollArea } from "./scroll-area-BYa8i-Jn.js";
import { S as Separator } from "./separator-4Scmx0hq.js";
import { P as ProjectPageCommand } from "./editorprovider-R8xfLE4-.js";
import { useState } from "react";
import { v as useElementsWithActions, e as ElementFactory } from "./SelectComponent-t_K3xf5i.js";
import "zustand";
import "zustand/middleware";
import "lodash-es";
import "zod";
import "sonner";
import "uuid";
import "clsx";
import "class-variance-authority";
import "radix-ui";
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
import "@clerk/react";
import "yjs";
import "y-indexeddb";
import "events";
import "y-protocols/awareness";
import "cmdk";
import "./select-CPjHyyea.js";
import "./page-Cy1amgId.js";
import "isomorphic-dompurify";
import "framer-motion";
import "./card-LOcGasZb.js";
import "./dropdown-menu-B0s9PypA.js";
import "date-fns";
import "./textarea-BDhK7YnG.js";
import "./avatar-vyaRObia.js";
import "./carousel-DZpoDDoq.js";
import "embla-carousel-react";
import "zustand/react/shallow";
import "@radix-ui/react-context-menu";
import "./checkbox-BX2VzNwa.js";
const WIREFRAME_BLOCKS = [
  {
    category: "Navigation",
    items: [
      { name: "Navbar 1", type: "navbar_1" },
      { name: "Navbar 2", type: "navbar_2" }
    ]
  },
  {
    category: "Hero",
    items: [
      { name: "Hero Header", type: "hero_header" },
      { name: "Hero Split", type: "hero_split" }
    ]
  },
  {
    category: "Features",
    items: [
      { name: "Feature Grid", type: "feature_grid" },
      { name: "Feature List", type: "feature_list" }
    ]
  },
  {
    category: "Content",
    items: [
      { name: "Content Left", type: "content_left" },
      { name: "Content Right", type: "content_right" }
    ]
  },
  {
    category: "Footer",
    items: [
      { name: "Footer Simple", type: "footer_simple" },
      { name: "Footer Large", type: "footer_large" }
    ]
  }
];
function WireframeSidebar() {
  const { pages, currentPage, setCurrentPage } = usePageStore();
  const handleDragStart = (e, type, name) => {
    e.dataTransfer.setData("wireframeBlockType", type);
    e.dataTransfer.setData("wireframeBlockName", name);
    e.dataTransfer.effectAllowed = "copy";
  };
  return /* @__PURE__ */ jsxs(Sidebar, { side: "left", className: "border-r border-border bg-card", children: [
    /* @__PURE__ */ jsx(SidebarHeader, { className: "h-14 flex items-center px-4 border-b border-border", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 font-semibold", children: [
      /* @__PURE__ */ jsx(LayoutTemplate, { className: "h-5 w-5" }),
      /* @__PURE__ */ jsx("span", { children: "Wireframe Builder" })
    ] }) }),
    /* @__PURE__ */ jsx(SidebarContent, { children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col h-full", children: [
      /* @__PURE__ */ jsxs("div", { className: "p-4 pb-2", children: [
        /* @__PURE__ */ jsx("div", { className: "flex items-center justify-between mb-2", children: /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-muted-foreground flex items-center gap-2", children: [
          /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
          "Pages"
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "border rounded-md bg-background/50", children: /* @__PURE__ */ jsx(ProjectPageCommand, {}) })
      ] }),
      /* @__PURE__ */ jsx(Separator, { className: "my-2" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1 overflow-hidden flex flex-col", children: [
        /* @__PURE__ */ jsx("div", { className: "px-4 py-2", children: /* @__PURE__ */ jsxs("h3", { className: "text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2", children: [
          /* @__PURE__ */ jsx(Layers, { className: "h-4 w-4" }),
          "Components"
        ] }) }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 px-4", children: /* @__PURE__ */ jsx(Accordion, { type: "multiple", defaultValue: ["Hero", "Features"], className: "w-full", children: WIREFRAME_BLOCKS.map((category) => /* @__PURE__ */ jsxs(AccordionItem, { value: category.category, children: [
          /* @__PURE__ */ jsx(AccordionTrigger, { className: "py-2 text-sm hover:no-underline", children: category.category }),
          /* @__PURE__ */ jsx(AccordionContent, { children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-2 gap-2 pt-1 pb-2", children: category.items.map((item) => /* @__PURE__ */ jsxs(
            "div",
            {
              draggable: true,
              onDragStart: (e) => handleDragStart(e, item.type, item.name),
              className: "flex flex-col items-center justify-center p-3 border rounded-md bg-background hover:border-primary/50 hover:bg-accent cursor-grab active:cursor-grabbing transition-colors text-center gap-2 group",
              children: [
                /* @__PURE__ */ jsx("div", { className: "w-full aspect-[3/2] bg-muted rounded-sm group-hover:bg-muted/80" }),
                /* @__PURE__ */ jsx("span", { className: "text-xs font-medium truncate w-full", children: item.name })
              ]
            },
            item.type
          )) }) })
        ] }, category.category)) }) })
      ] })
    ] }) })
  ] });
}
function WireframeCanvas({ pageId }) {
  const { elements, addElement, deleteElement, swapElement } = useElementsWithActions();
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedBlockIndex, setDraggedBlockIndex] = useState(
    null
  );
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const type = e.dataTransfer.getData("wireframeBlockType");
    const name = e.dataTransfer.getData("wireframeBlockName");
    if (type && name && draggedBlockIndex === null) {
      const newElement = ElementFactory.getInstance().createElement({
        type: "Section",
        pageId,
        parentId: name || void 0
      });
      if (newElement) {
        addElement(newElement);
      }
    }
  };
  const removeBlock = (id) => {
    deleteElement(id);
  };
  const moveBlock = (index, direction) => {
    if (direction === "up" && index > 0) {
      const currentId = elements[index].id;
      const prevId = elements[index - 1].id;
      swapElement(currentId, prevId);
    } else if (direction === "down" && index < elements.length - 1) {
      const currentId = elements[index].id;
      const nextId = elements[index + 1].id;
      swapElement(currentId, nextId);
    }
  };
  const handleSortStart = (e, index) => {
    setDraggedBlockIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  const handleSortOver = (e, index) => {
    e.preventDefault();
    if (draggedBlockIndex === null || draggedBlockIndex === index) return;
    const draggedId = elements[draggedBlockIndex].id;
    const targetId = elements[index].id;
    swapElement(draggedId, targetId);
    setDraggedBlockIndex(index);
  };
  const handleSortEnd = () => {
    setDraggedBlockIndex(null);
  };
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: cn(
        "flex-1 h-full bg-muted/30 relative flex flex-col",
        isDraggingOver && "bg-primary/5"
      ),
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "p-4 border-b bg-background flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold", children: "Page Layout" }),
            /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Drag components from the sidebar to build your wireframe." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsx(
              Button,
              {
                variant: "outline",
                size: "sm",
                onClick: () => {
                  elements.forEach((el) => deleteElement(el.id));
                },
                disabled: elements.length === 0,
                children: "Clear All"
              }
            ),
            /* @__PURE__ */ jsx(Button, { size: "sm", disabled: elements.length === 0, children: "Convert to Design" })
          ] })
        ] }),
        /* @__PURE__ */ jsx(ScrollArea, { className: "flex-1 p-8", children: /* @__PURE__ */ jsx("div", { className: "max-w-3xl mx-auto space-y-4 min-h-[500px]", children: elements.length === 0 ? /* @__PURE__ */ jsxs("div", { className: "border-2 border-dashed border-muted-foreground/25 rounded-lg h-64 flex flex-col items-center justify-center text-muted-foreground", children: [
          /* @__PURE__ */ jsx("p", { children: "Empty Canvas" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Drop components here" })
        ] }) : elements.map((element, index) => /* @__PURE__ */ jsxs(
          "div",
          {
            draggable: true,
            onDragStart: (e) => handleSortStart(e, index),
            onDragOver: (e) => handleSortOver(e, index),
            onDragEnd: handleSortEnd,
            className: cn(
              "bg-background border rounded-lg p-4 shadow-sm flex items-center gap-4 group transition-all",
              draggedBlockIndex === index && "opacity-50 ring-2 ring-primary"
            ),
            children: [
              /* @__PURE__ */ jsx("div", { className: "cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground", children: /* @__PURE__ */ jsx(GripVertical, { className: "h-5 w-5" }) }),
              /* @__PURE__ */ jsx("div", { className: "h-12 w-20 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground", children: "Preview" }),
              /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-medium", children: element.name || "Untitled Section" }),
                /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground capitalize", children: element.type })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity", children: [
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    onClick: () => moveBlock(index, "up"),
                    disabled: index === 0,
                    children: /* @__PURE__ */ jsx(MoveUp, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8",
                    onClick: () => moveBlock(index, "down"),
                    disabled: index === elements.length - 1,
                    children: /* @__PURE__ */ jsx(MoveDown, { className: "h-4 w-4" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  Button,
                  {
                    variant: "ghost",
                    size: "icon",
                    className: "h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10",
                    onClick: () => removeBlock(element.id),
                    children: /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" })
                  }
                )
              ] })
            ]
          },
          element.id
        )) }) })
      ]
    }
  );
}
function WireframeManager({ pageId }) {
  return /* @__PURE__ */ jsx(SidebarProvider, { children: /* @__PURE__ */ jsxs("div", { className: "flex w-full h-full overflow-hidden bg-background", children: [
    /* @__PURE__ */ jsx(WireframeSidebar, {}),
    /* @__PURE__ */ jsx("main", { className: "flex-1 flex flex-col h-full overflow-hidden relative", children: /* @__PURE__ */ jsx(WireframeCanvas, { pageId }) })
  ] }) });
}
export {
  WireframeManager as default
};
