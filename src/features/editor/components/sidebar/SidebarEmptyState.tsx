import React from "react";
import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyContent,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useCurrentPage,
  useCurrentProject,
} from "@/features/projects/hooks/useProjects";
import {
  MousePointerClick,
  FileText,
  FolderGit2,
  Command,
  CornerDownLeft,
} from "lucide-react";

interface SidebarEmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

const SHORTCUTS = [
  { label: "Delete element", keys: ["Delete"] },
  { label: "Undo action", keys: ["Ctrl", "Z"] },
  { label: "Copy / Paste", keys: ["Ctrl", "C / V"] },
  { label: "Deselect all", keys: ["Esc"] },
];

const SidebarEmptyState: React.FC<SidebarEmptyStateProps> = ({
  title = "Select an element",
  description = "Click any component on the canvas to configure settings, styles, or view code.",
  icon,
  className,
  children,
}) => {
  const { data: project } = useCurrentProject();
  const currentPage = useCurrentPage();

  const projectName = project?.name || "Untitled Project";
  const pageName = currentPage?.Name || "Main Page";
  const pageSlug = currentPage?.Type
    ? `/${currentPage.Type.toLowerCase()}`
    : "/";

  return (
    <div className={cn("flex flex-col h-full min-h-0 w-full overflow-y-auto px-4 py-5 gap-6", className)}>
      {/* Primary Empty Message */}
      <Empty className="p-0 border-none bg-transparent">
        <EmptyContent className="gap-3 max-w-full">
          <EmptyHeader className="gap-2 items-center text-center">
            <EmptyMedia variant="icon" className="mb-1 text-muted-foreground bg-muted/60">
              {icon ?? <MousePointerClick className="h-5 w-5" />}
            </EmptyMedia>
            <EmptyTitle className="text-sm font-semibold tracking-tight text-foreground">
              {title}
            </EmptyTitle>
            <EmptyDescription className="text-xs text-muted-foreground leading-relaxed max-w-[240px]">
              {description}
            </EmptyDescription>
          </EmptyHeader>
          {children && (
            <div className="flex w-full flex-col items-center gap-2 text-xs text-muted-foreground">
              {children}
            </div>
          )}
        </EmptyContent>
      </Empty>

      <Separator className="bg-border/60" />

      {/* Active Page Context Overview */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>Active Context</span>
          <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-mono text-muted-foreground">
            {pageSlug}
          </Badge>
        </div>

        <div className="rounded-lg border border-border/70 bg-muted/20 p-2.5 flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="text-muted-foreground shrink-0 text-[11px]">Page:</span>
            <span className="font-medium text-foreground truncate" title={pageName}>
              {pageName}
            </span>
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <FolderGit2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground shrink-0 text-[11px]">Project:</span>
            <span className="font-medium text-foreground truncate" title={projectName}>
              {projectName}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/80 leading-normal flex items-start gap-1.5 pt-0.5">
          <CornerDownLeft className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
          <span>Click any canvas element to style it, or use keyboard shortcuts below.</span>
        </p>
      </div>

      <Separator className="bg-border/60" />

      {/* Keyboard Shortcuts Reference */}
      <div className="flex flex-col gap-2.5 pb-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Command className="h-3 w-3" />
          <span>Shortcuts</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {SHORTCUTS.map((shortcut) => (
            <div
              key={shortcut.label}
              className="flex items-center justify-between py-1 text-xs"
            >
              <span className="text-muted-foreground text-[11px]">{shortcut.label}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key) => (
                  <kbd
                    key={key}
                    className="inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-[10px] font-mono font-medium rounded border border-border/80 bg-muted/60 text-foreground shadow-[0_1px_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_0_1px_rgba(255,255,255,0.06)]"
                  >
                    {key}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SidebarEmptyState;
