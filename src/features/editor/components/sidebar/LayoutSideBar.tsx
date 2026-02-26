"use client";

import React, { Suspense, useState } from "react";
import { useParams } from "next/navigation";
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
  Palette,
  Settings2,
  Code2,
  Bot,
  ExternalLink,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { useAiChat } from "@/providers/aiprovider";
import { useSelectedElement } from "@/features/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SidebarEmptyState from "./SidebarEmptyState";

const Settings = React.lazy(() => import("./configurations/Settings"));
const Styles = React.lazy(() => import("./configurations/Styles"));
const CssTextareaImporter = React.lazy(
  () => import("../editor/CssTextareaImporter"),
);

function PanelFallback() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

type TabType = "styles" | "settings" | "code";

const TABS: { id: TabType; label: string; icon: React.ElementType }[] = [
  { id: "styles", label: "Design", icon: Palette },
  { id: "settings", label: "Settings", icon: Settings2 },
  { id: "code", label: "Code", icon: Code2 },
];

function LayoutSideBar() {
  const params = useParams();
  const { toggleSidebar, state, setOpen } = useSidebar();
  const { toggleChat } = useAiChat();
  const selectedElement = useSelectedElement();

  const [activeTab, setActiveTab] = useState<TabType>("styles");

  const isCollapsed = state === "collapsed";

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (isCollapsed) setOpen(true);
  };

  const visitProjectSubdomain = (projectId: string) => {
    window.open(`http://localhost:3000/preview/${projectId}`);
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="border-l border-border bg-card"
    >
      <SidebarHeader className="border-b border-border p-0">
        {isCollapsed ? (
          /* collapsed: single centered collapse button */
          <div className="flex h-11 items-center justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleSidebar}
                >
                  <PanelRightOpen className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Expand</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          /* expanded: collapse button + inline tab row */
          <div className="flex h-11 items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 mx-1 shrink-0"
                  onClick={toggleSidebar}
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Collapse</TooltipContent>
            </Tooltip>
            {TABS.map((tab) => (
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
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-0">
        {isCollapsed ? (
          /* collapsed icon rail */
          <div className="flex flex-col items-center gap-1 py-3">
            {TABS.map((tab) => (
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
                <TooltipContent side="left">{tab.label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {activeTab === "settings" && (
              <div className="flex-1 min-h-0 overflow-auto p-3">
                {selectedElement ? (
                  <Suspense fallback={<PanelFallback />}>
                    <Settings />
                  </Suspense>
                ) : (
                  <SidebarEmptyState
                    title="Select an element"
                    description="Click any component in the canvas to configure it here."
                    icon={<Settings2 className="h-5 w-5" />}
                  />
                )}
              </div>
            )}

            {activeTab === "styles" && (
              <div className="flex-1 min-h-0 overflow-auto">
                {selectedElement ? (
                  <div className="p-3">
                    <Suspense fallback={<PanelFallback />}>
                      <Styles />
                    </Suspense>
                  </div>
                ) : (
                  <SidebarEmptyState
                    title="Select an element"
                    description="Pick a canvas node to unlock its style controls."
                    icon={<Palette className="h-5 w-5" />}
                  />
                )}
              </div>
            )}

            {activeTab === "code" && (
              <div className="flex-1 min-h-0 overflow-auto p-3">
                <Suspense fallback={<PanelFallback />}>
                  <CssTextareaImporter />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-1.5">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="AI Assistant"
              onClick={() => {
                toggleChat();
                toggleSidebar();
              }}
            >
              <Bot className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "text-xs transition-opacity duration-200",
                  isCollapsed && "opacity-0 w-0 overflow-hidden",
                )}
              >
                AI Assistant
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="View Live Site"
              onClick={() => visitProjectSubdomain(params.id as string)}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span
                className={cn(
                  "text-xs transition-opacity duration-200",
                  isCollapsed && "opacity-0 w-0 overflow-hidden",
                )}
              >
                View Live
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

export default LayoutSideBar;
