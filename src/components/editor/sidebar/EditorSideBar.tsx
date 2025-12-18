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
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarHeader,
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
  Magnet,
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
        <TooltipContent side="right" align="center">
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

export function EditorSideBar() {
  const { chatOpen } = useAiChat();
  const { projectId } = useEditorContext();
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);
  const { state, toggleSidebar, setOpen } = useSidebar();
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const isCollapsed = state === "collapsed";

  const handleIconClick = (sectionValue: string) => {
    setActiveSection(sectionValue);
    setOpen(true);
  };

  if (chatOpen) return null;

  return (
    <Sidebar side="left" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <div
          className={cn(
            "flex items-center h-10",
            isCollapsed ? "justify-center" : "justify-between px-2",
          )}
        >
          {!isCollapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">
              Editor Tools
            </span>
          )}
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
      </SidebarHeader>

      <SidebarContent>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 py-2">
            <SidebarSection
              icon={<Blocks className="h-4 w-4" />}
              label="Components"
              value="components"
              isCollapsed={true}
              onIconClick={() => handleIconClick("components")}
            >
              <ElementSelector />
            </SidebarSection>
            <SidebarSection
              icon={<FileText className="h-4 w-4" />}
              label="Project's pages"
              value="pages"
              isCollapsed={true}
              onIconClick={() => handleIconClick("pages")}
            >
              <ProjectPageCommand />
            </SidebarSection>
            <SidebarSection
              icon={<ImageIcon className="h-4 w-4" />}
              label="Image Upload"
              value="imageupload"
              isCollapsed={true}
              onIconClick={() => handleIconClick("imageupload")}
            >
              <ImageSelector />
            </SidebarSection>
            <SidebarSection
              icon={<Database className="h-4 w-4" />}
              label="CMS Management"
              value="cms"
              isCollapsed={true}
              onIconClick={() => handleIconClick("cms")}
            >
              <CMSManager />
            </SidebarSection>
            <SidebarSection
              icon={<Camera className="h-4 w-4" />}
              label="Snapshots"
              value="snapshots"
              isCollapsed={true}
              onIconClick={() => handleIconClick("snapshots")}
            >
              <SnapshotManager />
            </SidebarSection>
            <SidebarSection
              icon={<Zap className="h-4 w-4" />}
              label="Event Workflows"
              value="workflows"
              isCollapsed={true}
              onIconClick={() => handleIconClick("workflows")}
            >
              <div />
            </SidebarSection>
          </div>
        ) : (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={
              activeSection
                ? [activeSection]
                : [
                    "components",
                    "pages",
                    "imageupload",
                    "cms",
                    "snapshots",
                    "workflows",
                    "snap",
                  ]
            }
            key={activeSection || "default"}
          >
            <SidebarSection
              icon={<Blocks className="h-4 w-4" />}
              label="Components"
              value="components"
              isCollapsed={false}
            >
              <ElementSelector />
            </SidebarSection>
            <SidebarSection
              icon={<FileText className="h-4 w-4" />}
              label="Project's pages"
              value="pages"
              isCollapsed={false}
            >
              <ProjectPageCommand />
            </SidebarSection>
            <SidebarSection
              icon={<ImageIcon className="h-4 w-4" />}
              label="Image Upload"
              value="imageupload"
              isCollapsed={false}
            >
              <ImageSelector />
            </SidebarSection>
            <SidebarSection
              icon={<Database className="h-4 w-4" />}
              label="CMS Management"
              value="cms"
              isCollapsed={false}
            >
              <CMSManager />
            </SidebarSection>
            <SidebarSection
              icon={<Camera className="h-4 w-4" />}
              label="Snapshots"
              value="snapshots"
              isCollapsed={false}
            >
              <SnapshotManager />
            </SidebarSection>
            <SidebarSection
              icon={<Zap className="h-4 w-4" />}
              label="Event Workflows"
              value="workflows"
              isCollapsed={false}
            >
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
                    Create and manage visual workflows for your elements with
                    drag-and-drop nodes
                  </p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Project not loaded
                </p>
              )}
            </SidebarSection>
          </Accordion>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarGroup>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
