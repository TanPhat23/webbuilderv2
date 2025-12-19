"use client";

import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Layers, LayoutTemplate } from "lucide-react";
import { usePageStore } from "@/globalstore/pagestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProjectPageCommand } from "../ProjectPageCommand";

// Mock data for wireframe blocks - in a real app this might come from a config or API
const WIREFRAME_BLOCKS = [
  {
    category: "Navigation",
    items: [
      { name: "Navbar 1", type: "navbar_1" },
      { name: "Navbar 2", type: "navbar_2" },
    ],
  },
  {
    category: "Hero",
    items: [
      { name: "Hero Header", type: "hero_header" },
      { name: "Hero Split", type: "hero_split" },
    ],
  },
  {
    category: "Features",
    items: [
      { name: "Feature Grid", type: "feature_grid" },
      { name: "Feature List", type: "feature_list" },
    ],
  },
  {
    category: "Content",
    items: [
      { name: "Content Left", type: "content_left" },
      { name: "Content Right", type: "content_right" },
    ],
  },
  {
    category: "Footer",
    items: [
      { name: "Footer Simple", type: "footer_simple" },
      { name: "Footer Large", type: "footer_large" },
    ],
  },
];

export function WireframeSidebar() {
  const { pages, currentPage, setCurrentPage } = usePageStore();

  const handleDragStart = (e: React.DragEvent, type: string, name: string) => {
    e.dataTransfer.setData("wireframeBlockType", type);
    e.dataTransfer.setData("wireframeBlockName", name);
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <Sidebar side="left" className="border-r border-border bg-card">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 font-semibold">
          <LayoutTemplate className="h-5 w-5" />
          <span>Wireframe Builder</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="flex flex-col h-full">
          {/* Pages Section */}
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Pages
              </h3>
            </div>
            <div className="border rounded-md bg-background/50">
               <ProjectPageCommand />
            </div>
          </div>

          <Separator className="my-2" />

          {/* Components Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="px-4 py-2">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                <Layers className="h-4 w-4" />
                Components
              </h3>
            </div>

            <ScrollArea className="flex-1 px-4">
              <Accordion type="multiple" defaultValue={["Hero", "Features"]} className="w-full">
                {WIREFRAME_BLOCKS.map((category) => (
                  <AccordionItem key={category.category} value={category.category}>
                    <AccordionTrigger className="py-2 text-sm hover:no-underline">
                      {category.category}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 gap-2 pt-1 pb-2">
                        {category.items.map((item) => (
                          <div
                            key={item.type}
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.type, item.name)}
                            className="flex flex-col items-center justify-center p-3 border rounded-md bg-background hover:border-primary/50 hover:bg-accent cursor-grab active:cursor-grabbing transition-colors text-center gap-2 group"
                          >
                            <div className="w-full aspect-[3/2] bg-muted rounded-sm group-hover:bg-muted/80" />
                            <span className="text-xs font-medium truncate w-full">
                              {item.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
