"use client";

import React, { Suspense, useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { useAiChat } from "@/providers/aiprovider";
import { useEditorContext } from "@/providers/editorprovider";
import { ProjectPageCommand } from "../ProjectPageCommand";
import { ElementSelector } from "./ElementSelector";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useElements } from "@/features/editor";
import ElementTreeItem from "./ElementTreeItem";

const CMSManager = React.lazy(
  () => import("@/features/cms/components/CMSManagerDialog"),
);
const SnapshotManager = React.lazy(() => import("./SnapshotManager"));
const ImageSelector = React.lazy(() =>
  import("@/features/images/components/ImageSelector").then((m) => ({
    default: m.ImageSelector,
  })),
);
const EventWorkflowManagerDialog = React.lazy(() =>
  import("@/features/eventworkflows/components/EventWorkflowManagerDialog").then(
    (m) => ({
      default: m.EventWorkflowManagerDialog,
    }),
  ),
);

function PanelFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

type TabType = "components" | "layers" | "tools";

const MAIN_TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "components", label: "Components", icon: Blocks },
  { id: "layers", label: "Layers", icon: Layers },
  { id: "tools", label: "Tools", icon: Settings },
];

const TOOL_SECTIONS = [
  { id: "pages", label: "Pages", icon: FileText },
  { id: "imageupload", label: "Images", icon: ImageIcon },
  { id: "cms", label: "CMS", icon: Database },
  { id: "snapshots", label: "Snapshots", icon: Camera },
  { id: "workflows", label: "Workflows", icon: Zap },
];

export function EditorSideBar() {
  const { chatOpen } = useAiChat();
  const { projectId } = useEditorContext();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const { state, toggleSidebar, setOpen } = useSidebar();
  const elements = useElements();

  const [activeTab, setActiveTab] = useState<TabType>("components");
  const [activeToolSection, setActiveToolSection] = useState<string>("pages");

  const isCollapsed = state === "collapsed";

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (isCollapsed) setOpen(true);
  };

  const handleToolSelect = (section: string) => {
    setActiveTab("tools");
    setActiveToolSection(section);
    if (isCollapsed) setOpen(true);
  };

  if (chatOpen) return null;

  return (
    <Sidebar
      side="left"
      collapsible="icon"
      className="border-r border-border bg-card"
    >
      <SidebarHeader className="border-b border-border p-0">
        {isCollapsed ? (
          /* collapsed: single centered expand button */
          <div className="flex h-11 items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleSidebar}
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Expand</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          /* expanded: inline tab row + collapse button */
          <div className="flex h-11 items-center">
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={cn(
                  "flex-1 h-full text-xs font-medium transition-colors border-b-2",
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 mx-1 shrink-0"
                  onClick={toggleSidebar}
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Collapse</TooltipContent>
            </Tooltip>
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-0">
        {isCollapsed ? (
          /* collapsed icon rail */
          <div className="flex flex-col items-center gap-1 py-3">
            {MAIN_TABS.map((tab) => (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      activeTab === tab.id &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleTabChange(tab.id)}
                  >
                    <tab.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{tab.label}</TooltipContent>
              </Tooltip>
            ))}

            <div className="my-1 h-px w-6 bg-border" />

            {TOOL_SECTIONS.map((s) => (
              <Tooltip key={s.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      activeTab === "tools" &&
                        activeToolSection === s.id &&
                        "bg-accent text-accent-foreground",
                    )}
                    onClick={() => handleToolSelect(s.id)}
                  >
                    <s.icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">{s.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col overflow-hidden">
            {activeTab === "components" && <ElementSelector />}

            {activeTab === "layers" && (
              <ScrollArea className="h-full">
                <div className="py-2">
                  {elements.length > 0 ? (
                    elements.map((element) => (
                      <ElementTreeItem
                        key={element.id ?? Math.random()}
                        element={element}
                      />
                    ))
                  ) : (
                    <p className="py-10 text-center text-xs text-muted-foreground px-4">
                      No elements yet. Add components to see them here.
                    </p>
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
                  {TOOL_SECTIONS.map((section) => (
                    <AccordionItem
                      key={section.id}
                      value={section.id}
                      className="border-b"
                    >
                      <AccordionTrigger className="px-3 py-2.5 hover:no-underline hover:bg-accent/40 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          <section.icon className="h-3.5 w-3.5 text-muted-foreground" />
                          {section.label}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-3 pb-3 pt-1">
                        <Suspense fallback={<PanelFallback />}>
                          {section.id === "pages" && <ProjectPageCommand />}
                          {section.id === "imageupload" && <ImageSelector />}
                          {section.id === "cms" && <CMSManager />}
                          {section.id === "snapshots" && <SnapshotManager />}
                          {section.id === "workflows" &&
                            (projectId ? (
                              <>
                                <EventWorkflowManagerDialog
                                  projectId={projectId}
                                  isOpen={workflowDialogOpen}
                                  onOpenChange={setWorkflowDialogOpen}
                                />
                                <button
                                  onClick={() => setWorkflowDialogOpen(true)}
                                  className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium flex items-center justify-center gap-2"
                                >
                                  <Zap className="h-3.5 w-3.5" />
                                  Open Workflow Editor
                                </button>
                              </>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Project not loaded
                              </p>
                            ))}
                        </Suspense>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Settings">
              <Link
                href="/settings/preferences"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                <span
                  className={cn(
                    "text-xs transition-opacity duration-200",
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
