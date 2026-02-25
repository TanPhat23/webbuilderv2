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
  ChevronRight,
} from "lucide-react";
import { useAiChat } from "@/providers/aiprovider";
import { useSelectedElement } from "@/globalstore/selectors/selection-selectors";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import SidebarEmptyState from "./SidebarEmptyState";

// ---------------------------------------------------------------------------
// Lazy-loaded configuration panels — only fetched when the user switches
// to the corresponding tab, reducing the initial LayoutSideBar bundle.
// ---------------------------------------------------------------------------

const Settings = React.lazy(() => import("./configurations/Settings"));
const Styles = React.lazy(() => import("./configurations/Styles"));
const CssTextareaImporter = React.lazy(
  () => import("../editor/CssTextareaImporter"),
);

/**
 * Lightweight spinner shown while a lazy-loaded panel chunk is fetched.
 */
function PanelFallback() {
  return (
    <div className="flex items-center justify-center py-6">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
    </div>
  );
}

type TabType = "settings" | "styles" | "code";

function LayoutSideBar() {
  const params = useParams();
  const { toggleSidebar, state, setOpen } = useSidebar();
  const { toggleChat } = useAiChat();
  const selectedElement = useSelectedElement();

  const [activeTab, setActiveTab] = useState<TabType>("styles");

  const isCollapsed = state === "collapsed";

  const visitProjectSubdomain = (projectId: string) => {
    window.open(`http://localhost:3000/preview/${projectId}`);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (isCollapsed) {
      setOpen(true);
    }
  };

  return (
    <Sidebar
      side="right"
      collapsible="icon"
      className="border-l border-border bg-card"
    >
      <SidebarHeader className="border-b border-border p-0">
        <div
          className={cn(
            "flex items-center h-12 px-4",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", isCollapsed && "rotate-180")}
                onClick={toggleSidebar}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">
                  {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
          {!isCollapsed && (
            <span className="text-sm font-medium">Properties</span>
          )}
        </div>

        {!isCollapsed && (
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("styles")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "styles"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Styles
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "settings"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("code")}
              className={cn(
                "flex-1 py-3 text-sm font-medium transition-colors border-b-2",
                activeTab === "code"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              Code
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
                  onClick={() => handleTabChange("styles")}
                  className={cn(activeTab === "styles" && "bg-accent")}
                >
                  <Palette className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Styles</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTabChange("settings")}
                  className={cn(activeTab === "settings" && "bg-accent")}
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Settings</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTabChange("styles")}
                  className={cn(activeTab === "styles" && "bg-accent")}
                >
                  <Palette className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Styles</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleTabChange("code")}
                  className={cn(activeTab === "code" && "bg-accent")}
                >
                  <Code2 className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Code</TooltipContent>
            </Tooltip>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {activeTab === "settings" && (
              <div className="flex-1 min-h-0 overflow-auto p-4">
                {selectedElement ? (
                  <Suspense fallback={<PanelFallback />}>
                    <Settings />
                  </Suspense>
                ) : (
                  <SidebarEmptyState
                    title="Select an element to configure settings"
                    description="Click a component in the canvas to reveal its settings here."
                    icon={<Settings2 className="h-6 w-6" />}
                  />
                )}
              </div>
            )}
            {activeTab === "styles" && (
              <div className="flex-1 min-h-0 overflow-auto">
                {selectedElement ? (
                  <div className="p-4">
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Selected: {selectedElement.name || selectedElement.type}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Double-click element to edit content
                      </p>
                    </div>
                    <Suspense fallback={<PanelFallback />}>
                      <Styles />
                    </Suspense>
                  </div>
                ) : (
                  <SidebarEmptyState
                    title="Select an element to configure styles"
                    description="Pick a canvas node to unlock its style controls."
                    icon={<Palette className="h-6 w-6" />}
                  />
                )}
              </div>
            )}
            {activeTab === "code" && (
              <div className="flex-1 min-h-0 overflow-auto p-4">
                <Suspense fallback={<PanelFallback />}>
                  <CssTextareaImporter />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="AI Assistant"
              onClick={() => {
                toggleChat();
                toggleSidebar();
              }}
              className={cn(
                "w-full font-medium justify-center",
                !isCollapsed && "justify-start",
              )}
            >
              <Bot className="h-4 w-4" />
              <span
                className={cn(
                  "transition-opacity duration-200",
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
              onClick={() => {
                visitProjectSubdomain(params.id as string);
              }}
              className={cn(
                "w-full font-medium bg-primary text-primary-foreground hover:bg-primary/90 justify-center",
                !isCollapsed && "justify-start",
              )}
            >
              <ExternalLink className="h-4 w-4" />
              <span
                className={cn(
                  "transition-opacity duration-200",
                  isCollapsed && "opacity-0 w-0 overflow-hidden",
                )}
              >
                View Live Site
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
