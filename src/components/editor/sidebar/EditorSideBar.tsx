"use client";

import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Settings,
  Zap,
  Blocks,
  FileText,
  ImageIcon,
  Database,
  Camera,
  ChevronLeft,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { useAiChat } from "@/providers/aiprovider";
import { useEditorContext } from "@/providers/editorprovider";
import { ProjectPageCommand } from "../ProjectPageCommand";
import { ElementSelector } from "./ElementSelector";
import CMSManager from "./cmsmanager/CMSManager";
import SnapshotManager from "./SnapshotManager";
import { ImageSelector } from "./imageupload/ImageSelector";
import { EventWorkflowManagerDialog } from "./eventworkflow/EventWorkflowManagerDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElementStore } from "@/globalstore/elementstore";
import ElementTreeItem from "./ElementTreeItem";

type TabType = "components" | "layers" | "tools";

export function EditorSideBar() {
  const { chatOpen } = useAiChat();
  const { projectId } = useEditorContext();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const { state, toggleSidebar, setOpen } = useSidebar();
  const { elements } = useElementStore();

  const [activeTab, setActiveTab] = useState<TabType>("components");
  const [activeToolSection, setActiveToolSection] = useState<string>("pages");

  const isCollapsed = state === "collapsed";

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (isCollapsed) {
      setOpen(true);
    }
  };

  const handleToolSelect = (section: string) => {
    setActiveTab("tools");
    setActiveToolSection(section);
    if (isCollapsed) {
      setOpen(true);
    }
  };

  if (chatOpen) return null;

  return (
    <Sidebar
      side="left"
      collapsible="icon"
      className="border-r border-border bg-card"
    >
      <SidebarHeader className="border-b border-border p-0">
        <div
          className={cn(
            "flex items-center h-12 px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && <span className="text-sm font-medium">Editor</span>}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isCollapsed && "rotate-180")}
                onClick={toggleSidebar}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {!isCollapsed && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("components")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "components"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Components
            </button>
            <button
              onClick={() => setActiveTab("layers")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "layers"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Layers
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "tools"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Tools
            </button>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTabChange("components")}
                  className={cn(activeTab === "components" && "bg-accent")}
                >
                  <Blocks className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Components</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTabChange("layers")}
                  className={cn(activeTab === "layers" && "bg-accent")}
                >
                  <Layers className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Layers</TooltipContent>
            </Tooltip>
            <div className="w-8 h-px bg-border my-2" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolSelect("pages")}
                  className={cn(
                    activeTab === "tools" &&
                      activeToolSection === "pages" &&
                      "bg-accent",
                  )}
                >
                  <FileText className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Pages</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolSelect("imageupload")}
                  className={cn(
                    activeTab === "tools" &&
                      activeToolSection === "imageupload" &&
                      "bg-accent",
                  )}
                >
                  <ImageIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Images</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolSelect("cms")}
                  className={cn(
                    activeTab === "tools" &&
                      activeToolSection === "cms" &&
                      "bg-accent",
                  )}
                >
                  <Database className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">CMS</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolSelect("snapshots")}
                  className={cn(
                    activeTab === "tools" &&
                      activeToolSection === "snapshots" &&
                      "bg-accent",
                  )}
                >
                  <Camera className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Snapshots</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToolSelect("workflows")}
                  className={cn(
                    activeTab === "tools" &&
                      activeToolSection === "workflows" &&
                      "bg-accent",
                  )}
                >
                  <Zap className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Workflows</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            {activeTab === "components" && (
              <ScrollArea className="h-full">
                <div className="p-4">
                  <ElementSelector />
                </div>
              </ScrollArea>
            )}
            {activeTab === "layers" && (
              <ScrollArea className="h-full">
                <div className="p-4">
                  {elements.length > 0 ? (
                    elements.map((element) => (
                      <ElementTreeItem
                        key={element.id || Math.random()}
                        element={element}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-sm text-muted-foreground">
                      No elements yet. Add components to see them here.
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            {activeTab === "tools" && (
              <ScrollArea className="h-full">
                <Accordion
                  type="single"
                  collapsible
                  value={activeToolSection}
                  onValueChange={setActiveToolSection}
                  className="w-full"
                >
                  <AccordionItem value="pages" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span>Pages</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ProjectPageCommand />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="imageupload" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-4 w-4" />
                        <span>Images</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <ImageSelector />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="cms" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        <span>CMS</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <CMSManager />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="snapshots" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        <span>Snapshots</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <SnapshotManager />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="workflows" className="border-b">
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/50">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>Workflows</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      {projectId ? (
                        <>
                          <EventWorkflowManagerDialog
                            projectId={projectId}
                            isOpen={workflowDialogOpen}
                            onOpenChange={setWorkflowDialogOpen}
                          />
                          <button
                            onClick={() => setWorkflowDialogOpen(true)}
                            className="w-full mb-3 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm font-medium gap-2 flex items-center justify-center"
                          >
                            <Zap className="h-4 w-4" />
                            Open Workflow Editor
                          </button>
                          <p className="text-xs text-muted-foreground">
                            Create and manage visual workflows for your elements
                            with drag-and-drop nodes
                          </p>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Project not loaded
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </ScrollArea>
            )}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link
                href={"/settings/preferences"}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span
                  className={cn(
                    "transition-opacity duration-200",
                    isCollapsed && "opacity-0 w-0 overflow-hidden",
                  )}
                >
                  Settings
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
