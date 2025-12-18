"use client";
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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import Configurations from "./configurations/Configurations";
import ElementTreeItem from "./ElementTreeItem";
import {
  Square,
  Layers,
  Settings2,
  Code2,
  Bot,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { useAiChat } from "@/providers/aiprovider";
import { useSelectionStore } from "@/globalstore/selectionstore";
import { useElementStore } from "@/globalstore/elementstore";
import CssTextareaImporter from "../editor/CssTextareaImporter";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarSectionProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  children: React.ReactNode;
  isCollapsed: boolean;
  onIconClick?: () => void;
}

function SidebarSection({
  icon,
  label,
  value,
  children,
  isCollapsed,
  onIconClick,
}: SidebarSectionProps) {
  if (isCollapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onIconClick}
            className="flex items-center justify-center p-2 cursor-pointer hover:bg-sidebar-accent rounded-md transition-colors w-full"
          >
            {icon}
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" align="center">
          <span>Click to expand: {label}</span>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <AccordionItem value={value} className="border-none">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-2">
              {icon}
              <span>{label}</span>
            </div>
          </AccordionTrigger>
        </SidebarGroupLabel>
        <AccordionContent>
          <SidebarGroupContent>{children}</SidebarGroupContent>
        </AccordionContent>
      </SidebarGroup>
    </AccordionItem>
  );
}

function LayoutSideBar() {
  const params = useParams();
  const { toggleSidebar, state, setOpen } = useSidebar();
  const { toggleChat } = useAiChat();
  const visitProjectSubdomain = (projectId: string) => {
    window.open(`http://localhost:3000/preview/${projectId}`);
  };
  const { selectedElement } = useSelectionStore();
  const { elements } = useElementStore();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isCollapsed = state === "collapsed";

  const handleIconClick = (sectionValue: string) => {
    setActiveSection(sectionValue);
    setOpen(true);
  };

  return (
    <Sidebar side="right" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center h-10",
            isCollapsed ? "justify-center" : "justify-between px-2",
          )}
        >
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7 transition-transform duration-200",
                  isCollapsed && "rotate-180",
                )}
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
            <span className="text-sm font-semibold text-sidebar-foreground">
              Properties
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 py-2">
            <SidebarSection
              icon={<Layers className="h-4 w-4" />}
              label="Layout"
              value="layout"
              isCollapsed={true}
              onIconClick={() => handleIconClick("layout")}
            >
              <div />
            </SidebarSection>
            <SidebarSection
              icon={<Settings2 className="h-4 w-4" />}
              label="Configuration"
              value="configuration"
              isCollapsed={true}
              onIconClick={() => handleIconClick("configuration")}
            >
              <div />
            </SidebarSection>
            <SidebarSection
              icon={<Code2 className="h-4 w-4" />}
              label="CSS Importer"
              value="css-importer"
              isCollapsed={true}
              onIconClick={() => handleIconClick("css-importer")}
            >
              <div />
            </SidebarSection>
          </div>
        ) : (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={
              activeSection ? [activeSection] : ["layout", "configuration"]
            }
            key={activeSection || "default"}
          >
            <SidebarSection
              icon={<Layers className="h-4 w-4" />}
              label="Layout"
              value="layout"
              isCollapsed={false}
            >
              <div className="max-h-60 overflow-y-auto overflow-x-hidden">
                {elements.length > 0 ? (
                  elements.map((element) => (
                    <ElementTreeItem
                      key={element.id || Math.random()}
                      element={element}
                    />
                  ))
                ) : (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No elements yet. Drag components from the left sidebar.
                  </div>
                )}
              </div>
            </SidebarSection>

            <SidebarSection
              icon={<Settings2 className="h-4 w-4" />}
              label="Configuration"
              value="configuration"
              isCollapsed={false}
            >
              {selectedElement ? (
                <div className="p-2">
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Selected: {selectedElement.name || selectedElement.type}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Double-click element to edit content
                    </p>
                  </div>
                  <Configurations />
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="text-muted-foreground mb-2">
                    <Square className="h-12 w-12 mx-auto opacity-50" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Select an element to configure its properties
                  </p>
                </div>
              )}
            </SidebarSection>

            <SidebarSection
              icon={<Code2 className="h-4 w-4" />}
              label="CSS Importer"
              value="css-importer"
              isCollapsed={false}
            >
              <CssTextareaImporter />
            </SidebarSection>
          </Accordion>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
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
